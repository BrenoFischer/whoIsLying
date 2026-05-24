# In-App Purchase — setup & testing guide

End-to-end guide for getting the **whoIsLying** store working with real Google
Play Billing, from a fresh checkout through actual sandbox purchases. Written
to be picked up days later — every step has the *why*, not just the *what*.

---

## Reference: the moving parts

| Concept | Value | Where it lives |
|---|---|---|
| Android package name | `com.brenin.whoislying` | `app.json` → `android.package` |
| IAP library | `expo-iap` v4.2.x | `package.json`, `app.json` plugins array |
| Paid SKU — Halloween | `com.brenin.whoislying.halloween_pack` | `data/packs.ts` |
| Paid SKU — Countries | `com.brenin.whoislying.geography_pack` | `data/packs.ts` |
| Paid SKU — Professions | `com.brenin.whoislying.professions_pack` | `data/packs.ts` |
| Free pack ID | `base` | `data/packs.ts` (`isFree: true`) |
| Local cache key | `@purchased_packs` | `context/PurchaseContext.tsx` |
| Required Android permission | `com.android.vending.BILLING` | `AndroidManifest.xml` + `app.json` `android.permissions` |
| EAS project ID | `c2f03e77-0056-4132-af99-493b5c654b96` | `app.json` `extra.eas.projectId` |

**Important**: the SKU IDs in `data/packs.ts` must match **exactly** (case-sensitive) the
product IDs you register in Play Console. A mismatch silently breaks the buy
flow — `fetchProducts` will return fewer items than expected and no error will
fire.

---

## Status overview

| Step | Description | Status |
|---|---|---|
| 1a | Unit tests — happy path (6 tests) | ✅ done |
| 1b | Unit tests — error & edge cases (7 tests) | ✅ done |
| 2 | Dev build verifies native bridge end-to-end | ✅ done |
| 3 | Google Play Console product registration | 🔄 in progress |
| 4 | Sandbox purchase flow on emulator/device | ⏳ pending Step 3 |
| 5 | Restore + reinstall scenarios | ⏳ pending Step 4 |
| 6 | Network failures, refunds, retries | ⏳ pending Step 4 |

---

## Architecture summary

The IAP integration has three layers. Knowing where each lives saves time
when something breaks.

```
┌──────────────────────────────────────────┐
│ app/store.tsx                            │  React UI (PackCard, Restore)
│  └─ usePurchase() reads context          │
└──────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│ context/PurchaseContext.tsx              │  State machine + persistence
│  ├─ IAP_AVAILABLE gate (modern + legacy) │
│  ├─ PurchaseContextProviderInner         │   ← only runs in native builds
│  │  ├─ useIAP({ onPurchaseSuccess, ... })│
│  │  ├─ AsyncStorage write on purchase    │
│  │  └─ availablePurchases → owned set    │
│  └─ defaultContextValue                  │   ← used in Expo Go
└──────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│ expo-iap (native)                        │  Bridge to platform store
└──────────────────────────────────────────┘
                  │
                  ▼
        Google Play Billing  /  StoreKit
```

### Key invariants encoded in the code

1. **Free packs are always owned.** `FREE_PACK_IDS` (derived from `data/packs.ts`)
   is hydrated into the owned set on every mount, no I/O needed.
2. **Paid packs persist via `AsyncStorage`** under the key `@purchased_packs`.
   This is the *only* source of truth between launches — there is no backend.
3. **`finishTransaction` MUST be called** for every successful purchase, even
   for SKUs we no longer ship. Skipping it leaves Android stuck retrying the
   pending purchase on every app launch.
4. **`UserCancelled` is silent end-to-end.** Both `purchasePack` (rejected
   promise) and `onPurchaseError` (callback path) swallow cancels without
   alerts or logs — they're normal user behavior, not failures.
5. **The detection of `IAP_AVAILABLE` tries modern API first**
   (`requireOptionalNativeModule`) and falls back to legacy
   (`NativeModulesProxy`). This keeps the gate working across Expo SDKs.

---

## Step 3 — Play Console setup (where we are)

You'll need a Google Play Developer account ($25 one-time fee, identity
verification can take 1–2 days). Assuming that's done, work through the
checklist below. They are roughly in dependency order — Play Console enforces
some of these in surprising ways.

### Prerequisites Play Console blocks you on

Some prerequisites need filling out before Play will accept any AAB upload
or unlock the in-app products UI:

- [ ] App entry exists with package `com.brenin.whoislying`
- [ ] Store listing: short + full description, icon, feature graphic, ≥2 screenshots
- [ ] Content rating questionnaire completed
- [ ] Privacy policy URL (any URL works — a GitHub Pages page saying "we don't
      collect personal data" is fine)
- [ ] Target audience & content (age range, presence of ads, etc.)
- [ ] Data safety form

**Privacy policy** is the most common stumbling block. If you don't have a
real one, put one on GitHub Pages — the URL just needs to exist and resolve.

### Upload the first AAB

The `BILLING` permission is now in `AndroidManifest.xml` and pinned in
`app.json` under `android.permissions`. Build a signed AAB:

```bash
eas build --platform android --profile production
```

EAS will compile and sign the AAB. ~10–15 min for the first build.

When done, download the `.aab` file from the EAS build page, then:

1. **Play Console → Test and release → Testing → Internal testing**
2. **Create new release** → drag the AAB in
3. Fill release notes ("Initial test build" is fine)
4. **Save** (you don't need to roll out — a draft is enough for Play to scan
   the AAB and recognize the BILLING permission)

Wait ~5 min. Play has to scan and index the AAB.

### Create the three in-app products

Navigate to **Monetize → Products → In-app products** (it should now be
unlocked because the uploaded AAB has the BILLING permission).

For **each** of these three SKU IDs:

| SKU ID | Suggested name |
|---|---|
| `com.brenin.whoislying.halloween_pack` | Halloween pack |
| `com.brenin.whoislying.geography_pack` | Countries pack |
| `com.brenin.whoislying.professions_pack` | Professions pack |

For each: set name, description, default language, price (USD 2.99 is the
placeholder in code), then click **Activate**.

**Activate is the critical click.** Inactive products are still hidden from
`fetchProducts`, so the store screen would show no products even though
they "exist" in the console.

### Add license testers

**Setup → License testing** → add the Google account email you signed into
on the emulator/device. **Save**.

License testers can complete the purchase flow against sandbox endpoints
without being charged real money. Skip this step and any tap on "Buy now!"
will try to charge a real card.

---

## Step 4 — sandbox purchase on the emulator

Once Step 3 is fully done, reload the dev build (`r` in Metro). You should
see in the logs:

```
[IAP DEBUG] connected: true
[IAP DEBUG] requesting fetchProducts for SKUs: [3 items]
[IAP DEBUG] fetchProducts resolved
[IAP DEBUG] products update — count: 3
```

If `count: 3`, the store can see all your products. Open the **Store** screen
in the app — pack cards should show the real localized price (e.g. `R$ 14,90`
in BRL, `$2.99` in USD) instead of the placeholder.

### Test checklist for the buy flow

Run through these on the emulator, eyes on the Metro logs:

- [ ] **Happy path**: tap a pack → tap **Buy now!** → Google Play sheet appears
      → confirm with the license tester account → sheet closes → pack flips
      to **Owned** (green check) → restart the app → it stays Owned (verifies
      AsyncStorage cache hydration on next launch)
- [ ] **Cancel**: tap **Buy now!** → tap **Cancel** in the Play sheet → no
      alert appears → no log line, no warning, pack stays locked
      *(this regression-tests the `UserCancelled` swallow path)*
- [ ] **Restore on reinstall**: uninstall the app from the emulator
      (Settings → Apps → uninstall) → reinstall via `npx expo run:android`
      → open the Store screen → tap header **Restore purchases** → confirm
      via the modal → pack you previously bought should appear as Owned
- [ ] **Owned pack tap**: tap an Owned pack → no buy sheet appears → the
      "Owned" indicator with checkmark shows on the back face
- [ ] **License-test indicator**: the Play sheet should show
      "This is a license test" or a sandbox badge — confirms you're not
      about to charge a real card

---

## Step 5 — restore & reinstall edge cases

Once Step 4's happy path works, exercise the restore-specific paths:

- [ ] **Fresh install on a different device** (or emulator wipe + reinstall):
      account signs in → on app launch, `availablePurchases` should populate
      → ownership restored automatically without the user tapping Restore
- [ ] **Restore with no purchases**: a fresh license tester with no prior
      purchases taps Restore → Restore success alert appears → nothing
      changes in ownership (no false positives)
- [ ] **Account-bound, not device-bound**: sign out of the Google account
      and sign in with a different one → previously-owned packs should
      flip back to locked (entitlements belong to the account, not the device)

---

## Step 6 — network and error edges

These are harder to script — many require deliberate friction:

- [ ] **Airplane mode mid-purchase**: tap Buy → toggle airplane mode while
      the Play sheet is up → confirm → expect an alert ("Purchase failed —
      please try again"). Pack stays locked. No AsyncStorage write happens.
- [ ] **Refund**: in Play Console → Order management, issue a refund for
      a sandbox purchase → relaunch the app → owned set should drop the
      refunded pack on the next sync of `availablePurchases`.
      *Note: this can take up to 24h to propagate even in sandbox.*
- [ ] **Slow network**: enable a network throttle in the emulator settings
      → exercise buy and restore → confirm `isLoading` stays true during
      the slow request and the UI doesn't double-tap

---

## Cleanup: remove diagnostic logging

Before merging any of this to `main`, strip the `[IAP DEBUG]` lines we
added during Step 2. Search the codebase for `[IAP DEBUG]` — they're all
in `context/PurchaseContext.tsx`. Removing them is safe; they're not
referenced by any test.

```bash
# Quick check
grep -n "IAP DEBUG" context/PurchaseContext.tsx
```

The lines are tagged with `TODO [IAP DEBUG]` so they're easy to find.

---

## Tests

```bash
npm test -- __tests__/PurchaseContext.test.tsx
```

13 tests, ~1.5 s. Cover both happy and error paths with a mocked
`expo-iap`. See the file header in `__tests__/PurchaseContext.test.tsx`
for the testing philosophy and the rules of thumb.

If you change anything in `PurchaseContext.tsx`, run these first — they'll
catch most regressions before you wait for an EAS build.

---

## Common pitfalls (FAQ)

**Q: `IAP_AVAILABLE: false` in a dev build with expo-iap installed.**
Your `expo-modules-core` is on a newer SDK where `NativeModulesProxy` was
removed. The detection in `PurchaseContext.tsx` already tries
`requireOptionalNativeModule` first. If it still returns false, the
expo-iap plugin probably didn't run during prebuild — either re-run
`expo prebuild` or check that `"expo-iap"` is in `app.json` plugins.

**Q: Products UI in Play Console says "your app needs BILLING permission".**
The AAB you uploaded didn't have `com.android.vending.BILLING` in its
manifest. Verify with `unzip -p path/to/build.aab BundleConfig.pb` or
re-check `android/app/src/main/AndroidManifest.xml`. The permission is
also pinned in `app.json` → `android.permissions` so future prebuilds
keep it.

**Q: `fetchProducts resolved` but `products update — count: 0`.**
Either (a) the products in Play Console aren't **Active**, (b) the SKU
IDs don't match (case-sensitive) what's in `data/packs.ts`, (c) you
just uploaded the products and Play hasn't propagated them yet — can
take 5–30 min.

**Q: Buy sheet shows "This item isn't available".**
The license tester account doesn't have access to the SKU. Most common
cause: the account isn't added under **Setup → License testing** in
Play Console, OR the AAB on the testing track is older than the
products you're trying to buy (rare).

**Q: Owned pack stays locked after reinstall.**
`availablePurchases` returned empty. Usually means the Google account
on the new device isn't the one that bought the pack. Check the active
Google account on the emulator (Settings → Accounts).

**Q: I want to wipe the local owned-packs cache for testing.**
```js
await AsyncStorage.removeItem('@purchased_packs');
```
Or wipe app data via the emulator: Settings → Apps → whoIsLying →
Storage & cache → Clear storage.

---

## Decisions worth knowing

- **`finishTransaction` is called even for unknown SKUs.** Belt-and-suspenders
  protection against Android getting stuck on a pending purchase if a product
  is renamed or removed from the app. Pinned by test #13 in
  `PurchaseContext.test.tsx`.
- **Owned packs are stored as `pack.id`, not `productId`.** That layer of
  indirection means SKU IDs can change without breaking AsyncStorage
  hydration on existing installs.
- **No backend.** Restore is the ONLY mechanism a user has to recover
  purchases after a reinstall. This is intentional — fewer moving parts —
  but it means the Restore button must be discoverable. That's why it lives
  in the header pill on the store screen (and is reinforced by the
  explanatory modal).
