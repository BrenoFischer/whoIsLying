import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PACKS, FREE_PACK_IDS, PAID_SKUS, type Pack } from '@/data/packs';

const PURCHASED_PACKS_KEY = '@purchased_packs';

// expo-iap requires a native build (dev client or production).
// It will NOT work in Expo Go. This check lets the app run gracefully
// in Expo Go with all free packs accessible and paid packs locked.
//
// Note: in Expo SDK 54+, `NativeModulesProxy` was removed in favour of
// `requireOptionalNativeModule`. We try the modern API first and fall
// back to the legacy one so the gate keeps working on older Expo SDKs.
const IAP_AVAILABLE = (() => {
  try {
    const core = require('expo-modules-core');
    if (typeof core.requireOptionalNativeModule === 'function') {
      return core.requireOptionalNativeModule('ExpoIap') != null;
    }
    return core.NativeModulesProxy?.ExpoIap != null;
  } catch {
    return false;
  }
})();

// TODO [IAP DEBUG] — temporary diagnostics for Step 2 of testing. Remove
// once we've confirmed the bridge works end-to-end on a real Android build.
(() => {
  try {
    const core = require('expo-modules-core');
    const hasModernAPI = typeof core.requireOptionalNativeModule === 'function';
    const hasLegacyAPI = core.NativeModulesProxy != null;
    // eslint-disable-next-line no-console
    console.log('[IAP DEBUG] IAP_AVAILABLE:', IAP_AVAILABLE,
      '| modern API:', hasModernAPI,
      '| legacy API:', hasLegacyAPI,
      '| expo-modules-core keys:', Object.keys(core).slice(0, 10).join(','));
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.log('[IAP DEBUG] expo-modules-core require failed:', e?.message);
  }
})();

type StoreProduct = { displayPrice: string };

type PurchaseContextValue = {
  purchasedPackIds: Set<string>;
  isPurchased: (packId: string) => boolean;
  purchasePack: (pack: Pack) => Promise<void>;
  restorePurchases: () => Promise<void>;
  storeProducts: Record<string, StoreProduct>;
  isLoading: boolean;
  isConnected: boolean;
};

const defaultContextValue: PurchaseContextValue = {
  purchasedPackIds: new Set(FREE_PACK_IDS),
  isPurchased: (id) => FREE_PACK_IDS.has(id),
  purchasePack: async () => {},
  restorePurchases: async () => {},
  storeProducts: {},
  isLoading: false,
  isConnected: false,
};

export const PurchaseContext = createContext<PurchaseContextValue>(defaultContextValue);

export function usePurchase() {
  return useContext(PurchaseContext);
}

// Inner provider — only rendered when IAP_AVAILABLE is true.
// Keeping it in a separate component means useIAP (and its imports) are never
// called in an environment where the native module is missing.
function PurchaseContextProviderInner({ children }: { children: React.ReactNode }) {
  // Lazy-require so the import is never evaluated in Expo Go
  const { useIAP, ErrorCode } = require('expo-iap');

  const [purchasedPackIds, setPurchasedPackIds] = useState<Set<string>>(
    new Set(FREE_PACK_IDS),
  );
  const [storeProducts, setStoreProducts] = useState<Record<string, StoreProduct>>({});
  const [isLoading, setIsLoading] = useState(false);

  const finishTransactionRef = useRef<
    ((args: { purchase: any; isConsumable?: boolean }) => Promise<void>) | null
  >(null);

  const addPurchasedPackId = useCallback((packId: string) => {
    setPurchasedPackIds(prev => {
      if (prev.has(packId)) return prev;
      const next = new Set(prev);
      next.add(packId);
      const paidIds = [...next].filter(id => !FREE_PACK_IDS.has(id));
      AsyncStorage.setItem(PURCHASED_PACKS_KEY, JSON.stringify(paidIds)).catch(() => {});
      return next;
    });
  }, []);

  const handlePurchaseSuccess = useCallback(
    async (purchase: any) => {
      const pack = PACKS.find((p: Pack) => p.productId === purchase.productId);
      if (pack) addPurchasedPackId(pack.id);
      try {
        await finishTransactionRef.current?.({ purchase, isConsumable: false });
      } catch {}
    },
    [addPurchasedPackId],
  );

  const handlePurchaseError = useCallback((error: any) => {
    if (error?.code !== ErrorCode.UserCancelled) {
      console.warn('[IAP] Purchase error:', error?.message);
    }
  }, [ErrorCode]);

  const {
    connected,
    products,
    availablePurchases,
    fetchProducts,
    requestPurchase,
    restorePurchases: iapRestorePurchases,
    getAvailablePurchases,
    finishTransaction,
  } = useIAP({
    onPurchaseSuccess: handlePurchaseSuccess,
    onPurchaseError: handlePurchaseError,
  });

  useEffect(() => {
    finishTransactionRef.current = finishTransaction;
  }, [finishTransaction]);

  // Load cached purchases from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem(PURCHASED_PACKS_KEY)
      .then((value: string | null) => {
        if (value) {
          const ids: string[] = JSON.parse(value);
          ids.forEach(addPurchasedPackId);
        }
      })
      .catch(() => {});
  }, [addPurchasedPackId]);

  // On store connection: fetch product prices + sync owned purchases
  useEffect(() => {
    // TODO [IAP DEBUG] — remove after Step 2 verification.
    // eslint-disable-next-line no-console
    console.log('[IAP DEBUG] connected:', connected);
    if (!connected) return;
    if (PAID_SKUS.length > 0) {
      // TODO [IAP DEBUG] — remove after Step 2 verification.
      // eslint-disable-next-line no-console
      console.log('[IAP DEBUG] requesting fetchProducts for SKUs:', PAID_SKUS);
      fetchProducts({ skus: PAID_SKUS, type: 'in-app' })
        .then(() => {
          // eslint-disable-next-line no-console
          console.log('[IAP DEBUG] fetchProducts resolved');
        })
        .catch((e: any) => {
          // eslint-disable-next-line no-console
          console.log('[IAP DEBUG] fetchProducts error:', e?.code, e?.message);
        });
    }
    getAvailablePurchases().catch(() => {});
  }, [connected]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync availablePurchases → local state (handles restore + re-installs)
  useEffect(() => {
    availablePurchases.forEach((purchase: any) => {
      const pack = PACKS.find((p: Pack) => p.productId === purchase.productId);
      if (pack) addPurchasedPackId(pack.id);
    });
  }, [availablePurchases, addPurchasedPackId]);

  // Map store products → price display map
  useEffect(() => {
    // TODO [IAP DEBUG] — remove after Step 2 verification.
    // eslint-disable-next-line no-console
    console.log('[IAP DEBUG] products update — count:', products.length);
    const map: Record<string, StoreProduct> = {};
    products.forEach((product: any) => {
      map[product.id] = { displayPrice: product.displayPrice };
    });
    setStoreProducts(map);
  }, [products]);

  const purchasePack = useCallback(
    async (pack: Pack) => {
      if (!pack.productId) return;
      setIsLoading(true);
      try {
        await requestPurchase({
          request: {
            apple: { sku: pack.productId },
            google: { skus: [pack.productId] },
          },
          type: 'in-app',
        });
      } catch (e: any) {
        if (e?.code !== ErrorCode.UserCancelled) throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [requestPurchase, ErrorCode],
  );

  const restorePurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      await iapRestorePurchases();
    } finally {
      setIsLoading(false);
    }
  }, [iapRestorePurchases]);

  const isPurchased = useCallback(
    (packId: string) => purchasedPackIds.has(packId),
    [purchasedPackIds],
  );

  return (
    <PurchaseContext.Provider
      value={{
        purchasedPackIds,
        isPurchased,
        purchasePack,
        restorePurchases,
        storeProducts,
        isLoading,
        isConnected: connected,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
}

export function PurchaseContextProvider({ children }: { children: React.ReactNode }) {
  if (!IAP_AVAILABLE) {
    // Running in Expo Go or a build without native IAP support.
    // Free packs are accessible; paid packs remain locked.
    return (
      <PurchaseContext.Provider value={defaultContextValue}>
        {children}
      </PurchaseContext.Provider>
    );
  }

  return <PurchaseContextProviderInner>{children}</PurchaseContextProviderInner>;
}
