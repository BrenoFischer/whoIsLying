/**
 * PurchaseContext Tests
 *
 * QA GUIDE — WHY THIS FILE EXISTS
 * ---------------------------------
 * The PurchaseContext is the bridge between our React state and the native
 * In-App Purchase APIs (StoreKit on iOS, Google Play Billing on Android).
 * It owns three pieces of mission-critical logic that have no second chance
 * to recover if they break in production:
 *
 *   1. Persistence — paid packs must be remembered across app launches.
 *   2. Restore     — a user who reinstalls must get their packs back.
 *   3. Receipts    — finishTransaction MUST be called or Android will leave
 *                    the purchase "pending" forever.
 *
 * We mock the native `expo-iap` module here so these tests run in plain Node
 * with no device, no store account and no real money. We exercise OUR code
 * (state machine, AsyncStorage, callback wiring) by feeding it the same
 * shapes the real native module would send.
 *
 * Rule of thumb: simulate what the store would call back to us, then assert
 * how the context reacts.
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Module mocks ─────────────────────────────────────────────────────────
//
// QA NOTE — Forcing the "native build" code path
// PurchaseContext gates its real provider behind an `IAP_AVAILABLE` flag
// derived from `expo-modules-core`. In a Jest environment, that module
// would normally return no `ExpoIap` and the provider would fall back to
// the Expo-Go-friendly defaults. We mock it here so the inner provider
// (the one that calls useIAP) actually runs.

jest.mock('expo-modules-core', () => ({
  NativeModulesProxy: { ExpoIap: {} },
}));

// Per-test controllable mocks for the IAP hook. We capture the callbacks
// the provider registers (onPurchaseSuccess / onPurchaseError) so tests can
// simulate the store firing them — that's the real "purchase happened" signal.
const mockFetchProducts = jest.fn().mockResolvedValue(undefined);
const mockRequestPurchase = jest.fn().mockResolvedValue(undefined);
const mockIapRestorePurchases = jest.fn().mockResolvedValue(undefined);
const mockGetAvailablePurchases = jest.fn().mockResolvedValue([]);
const mockFinishTransaction = jest.fn().mockResolvedValue(undefined);

let capturedOnPurchaseSuccess:
  | ((purchase: { productId: string }) => Promise<void>)
  | null = null;
let capturedOnPurchaseError: ((error: unknown) => void) | null = null;

// Mutable hook state — set in a test BEFORE calling renderHook so the
// useIAP mock returns the shape that scenario needs.
const useIAPState = {
  connected: false as boolean,
  products: [] as Array<{ id: string; displayPrice: string }>,
  availablePurchases: [] as Array<{ productId: string }>,
};

jest.mock('expo-iap', () => ({
  useIAP: jest.fn(
    (callbacks: {
      onPurchaseSuccess: (p: { productId: string }) => Promise<void>;
      onPurchaseError: (e: unknown) => void;
    }) => {
      capturedOnPurchaseSuccess = callbacks.onPurchaseSuccess;
      capturedOnPurchaseError = callbacks.onPurchaseError;
      return {
        connected: useIAPState.connected,
        products: useIAPState.products,
        availablePurchases: useIAPState.availablePurchases,
        fetchProducts: mockFetchProducts,
        requestPurchase: mockRequestPurchase,
        restorePurchases: mockIapRestorePurchases,
        getAvailablePurchases: mockGetAvailablePurchases,
        finishTransaction: mockFinishTransaction,
      };
    },
  ),
  ErrorCode: {
    UserCancelled: 'E_USER_CANCELLED',
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
}));

// Import AFTER mocks so the gating + lazy-require resolve to our fakes.
import { PurchaseContextProvider, usePurchase } from '@/context/PurchaseContext';

// ─── Helpers ──────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PurchaseContextProvider>{children}</PurchaseContextProvider>
);

const HALLOWEEN_SKU = 'com.brenin.whoislying.halloween_pack';

beforeEach(() => {
  mockFetchProducts.mockClear();
  mockRequestPurchase.mockClear();
  mockIapRestorePurchases.mockClear();
  mockGetAvailablePurchases.mockClear();
  mockFinishTransaction.mockClear();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  (AsyncStorage.setItem as jest.Mock).mockClear();
  useIAPState.connected = false;
  useIAPState.products = [];
  useIAPState.availablePurchases = [];
  capturedOnPurchaseSuccess = null;
  capturedOnPurchaseError = null;
});

// ─── Tests ────────────────────────────────────────────────────────────────

describe('PurchaseContext', () => {
  test('reports free packs as owned and paid packs as locked on mount', () => {
    const { result } = renderHook(() => usePurchase(), { wrapper });

    // The free base pack is hard-wired into FREE_PACK_IDS — should be owned
    // from the moment the provider mounts, with no I/O needed.
    expect(result.current.isPurchased('base')).toBe(true);
    // Paid packs start locked until the user buys or restores them.
    expect(result.current.isPurchased('halloween')).toBe(false);
  });

  test('hydrates paid packs cached in AsyncStorage on mount', async () => {
    // Simulate a returning user: their owned-packs cache contains halloween.
    // The provider's first-mount effect should read this and mark it owned.
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(['halloween']),
    );

    const { result } = renderHook(() => usePurchase(), { wrapper });

    await waitFor(() => {
      expect(result.current.isPurchased('halloween')).toBe(true);
    });
  });

  test('fetches product details once the store connection is up', async () => {
    // The store can be unreachable for an arbitrary amount of time on startup.
    // We only ask for product prices once `connected` flips true — verify that.
    useIAPState.connected = true;

    renderHook(() => usePurchase(), { wrapper });

    await waitFor(() => {
      expect(mockFetchProducts).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'in-app' }),
      );
    });
  });

  test('on purchase success: marks pack owned, persists it, finishes the transaction', async () => {
    const { result } = renderHook(() => usePurchase(), { wrapper });

    // Pretend the native store just notified us that the user paid.
    await act(async () => {
      await capturedOnPurchaseSuccess!({ productId: HALLOWEEN_SKU });
    });

    // Local state reflects ownership.
    expect(result.current.isPurchased('halloween')).toBe(true);
    // AsyncStorage was updated so the next launch remembers this.
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@purchased_packs',
      JSON.stringify(['halloween']),
    );
    // finishTransaction MUST be called or Android will keep retrying the
    // pending purchase forever and the user will be charged but stuck.
    expect(mockFinishTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        isConsumable: false,
        purchase: expect.objectContaining({ productId: HALLOWEEN_SKU }),
      }),
    );
  });

  test('restore flow: availablePurchases from the store hydrate ownership', async () => {
    // The store returned the user's existing entitlements (typical after
    // a reinstall or device switch). The provider should fold these into
    // its owned set automatically — that's the entire restore guarantee.
    useIAPState.availablePurchases = [{ productId: HALLOWEEN_SKU }];

    const { result } = renderHook(() => usePurchase(), { wrapper });

    await waitFor(() => {
      expect(result.current.isPurchased('halloween')).toBe(true);
    });
  });

  test('purchasePack issues the request with both apple and google SKU shapes', async () => {
    const { result } = renderHook(() => usePurchase(), { wrapper });

    await act(async () => {
      await result.current.purchasePack({
        id: 'halloween',
        productId: HALLOWEEN_SKU,
      } as any);
    });

    // iOS uses `apple.sku` (singular), Android uses `google.skus` (array).
    // Forgetting either breaks the buy flow on that platform with a silent
    // no-op — regression-test the exact shape.
    expect(mockRequestPurchase).toHaveBeenCalledWith({
      request: {
        apple: { sku: HALLOWEEN_SKU },
        google: { skus: [HALLOWEEN_SKU] },
      },
      type: 'in-app',
    });
  });

  // ─── Step 1b: error handling, restore, and edge cases ───────────────────
  //
  // The native store fires two kinds of failure: deliberate ("user tapped
  // Cancel") and accidental ("network died mid-flow"). We treat them
  // differently — cancels are silent, real errors bubble up so the UI can
  // show an alert. These tests pin that contract.

  test('purchasePack stays silent when the user cancels the native sheet', async () => {
    // Real expo-iap fires this rejection when the user taps "Cancel" in the
    // platform store sheet. The provider must swallow it — propagating
    // would cause the UI to show a scary "Purchase failed" alert for a
    // perfectly normal user action.
    mockRequestPurchase.mockRejectedValueOnce({ code: 'E_USER_CANCELLED' });
    const { result } = renderHook(() => usePurchase(), { wrapper });

    await act(async () => {
      await result.current.purchasePack({
        id: 'halloween',
        productId: HALLOWEEN_SKU,
      } as any);
    });

    // No throw escaped to here, AND state is untouched (no accidental ownership).
    expect(result.current.isPurchased('halloween')).toBe(false);
  });

  test('purchasePack rethrows non-cancel errors so callers can show feedback', async () => {
    // A network failure (or any other non-cancel error) must propagate so
    // PackCard's catch block can show "Purchase failed — try again." If we
    // swallow these, the user thinks the buy worked when it didn't.
    const networkError = { code: 'E_NETWORK_ERROR', message: 'no network' };
    mockRequestPurchase.mockRejectedValueOnce(networkError);
    const { result } = renderHook(() => usePurchase(), { wrapper });

    let caught: any;
    await act(async () => {
      try {
        await result.current.purchasePack({
          id: 'halloween',
          productId: HALLOWEEN_SKU,
        } as any);
      } catch (e) {
        caught = e;
      }
    });

    expect(caught).toMatchObject({ code: 'E_NETWORK_ERROR' });
  });

  test('cancel errors from the native callback are not logged', () => {
    // The provider also gets notified via the `onPurchaseError` callback (in
    // addition to the rejected promise from requestPurchase). Cancels there
    // must stay out of the console so we don't pollute Sentry/log dashboards
    // with normal user behavior.
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    renderHook(() => usePurchase(), { wrapper });

    act(() => {
      capturedOnPurchaseError!({ code: 'E_USER_CANCELLED', message: 'cancelled' });
    });

    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  test('real failures from the native callback ARE logged for debugging', () => {
    // Inverse of the previous test — when a real failure comes through the
    // callback we WANT to see it in logs so we can debug store/network issues.
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    renderHook(() => usePurchase(), { wrapper });

    act(() => {
      capturedOnPurchaseError!({
        code: 'E_NETWORK_ERROR',
        message: 'lost connection to store',
      });
    });

    expect(warnSpy).toHaveBeenCalledWith(
      '[IAP] Purchase error:',
      'lost connection to store',
    );
    warnSpy.mockRestore();
  });

  test('builds a SKU → displayPrice map when the store returns products', async () => {
    // PackCard reads this map to render "$2.99 / R$ 9,90 / etc." — localised
    // by the store, not us. If this mapping breaks, every paid pack falls
    // back to the hard-coded "$2.99" placeholder.
    useIAPState.products = [
      { id: HALLOWEEN_SKU, displayPrice: '$2.99' },
      { id: 'com.brenin.whoislying.geography_pack', displayPrice: 'R$ 9,90' },
    ];

    const { result } = renderHook(() => usePurchase(), { wrapper });

    await waitFor(() => {
      expect(result.current.storeProducts[HALLOWEEN_SKU]).toEqual({
        displayPrice: '$2.99',
      });
    });
    expect(
      result.current.storeProducts['com.brenin.whoislying.geography_pack'],
    ).toEqual({ displayPrice: 'R$ 9,90' });
  });

  test('restorePurchases() delegates to the native restore implementation', async () => {
    // Thin wrapper, but if someone refactors the rename ("iapRestorePurchases"
    // → "restorePurchases") wrong, the user-visible "Restore" button silently
    // stops working. Pin the delegation.
    const { result } = renderHook(() => usePurchase(), { wrapper });

    await act(async () => {
      await result.current.restorePurchases();
    });

    expect(mockIapRestorePurchases).toHaveBeenCalled();
  });

  test('finishes the transaction even for SKUs we no longer recognise', async () => {
    // Worst case: the store sends a productId we've since removed from the
    // app (an old promo SKU, or a renamed pack). We can't credit the user
    // anything, but we MUST still finish the transaction — otherwise Android
    // will retry the pending purchase on every launch.
    const { result } = renderHook(() => usePurchase(), { wrapper });

    await act(async () => {
      await capturedOnPurchaseSuccess!({ productId: 'com.brenin.whoislying.unknown_pack' });
    });

    expect(mockFinishTransaction).toHaveBeenCalled();
    // Local state unchanged — no fake ownership granted.
    expect(result.current.purchasedPackIds.has('unknown_pack')).toBe(false);
  });
});
