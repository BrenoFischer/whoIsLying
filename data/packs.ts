// =============================================================================
// PACKS — single source of truth for store content
// =============================================================================
//
// HOW THE SYSTEM WORKS
// --------------------
// Each Pack groups one or more categories + one or more character themes.
// PurchaseContext (context/PurchaseContext.tsx) reads PACKS on startup and
// determines what the user has access to:
//   - isFree: true  → always unlocked, no purchase needed
//   - isFree: false → locked until the user buys the matching productId via IAP
//
// Access is checked in two places:
//   - selectCategory.tsx  → uses getPackForCategory() + isPurchased()
//   - createGame.tsx (future) → uses getPackForTheme() + isPurchased()
//
// Characters inside a theme are unlocked as a group — you cannot unlock
// individual characters without unlocking the whole theme.
//
// =============================================================================
// HOW TO: ADD A NEW PAID PACK
// =============================================================================
//
// 1. Add a new CharacterTheme to data/imagesData.ts if needed (e.g. 'sports').
// 2. Add the character entries to the `characters` array in imagesData.ts.
// 3. Add the character images to assets/images/.
// 4. Add the category to data/categories.json with `"available": true`.
// 5. Add translation keys for nameKey and descriptionKey (translations/).
// 6. Register the productId in Google Play Console (in-app product, non-consumable)
//    and App Store Connect (in-app purchase, non-consumable) BEFORE shipping.
// 7. Add the pack entry below.
//
// Example:
//   {
//     id: 'sports',
//     productId: 'com.brenin.whoislying.sports_pack',
//     nameKey: 'Sports Pack',
//     descriptionKey: 'sportsPackDescription',
//     categories: ['sports'],
//     characterThemes: ['sports'],
//     color: '#1E3A8A',
//     isFree: false,
//     previewCharacters: ['athlete', 'referee', 'coach'],
//   },
//
// =============================================================================
// HOW TO: ADD A NEW FREE PACK
// =============================================================================
//
// Same as above, but set:
//   productId: null,
//   isFree: true,
//
// Free packs are automatically "purchased" for all users — no IAP needed.
// No store registration required.
//
// =============================================================================
// HOW TO: CONVERT A FREE PACK TO PAID
// =============================================================================
//
// 1. Register a new productId in Google Play Console and App Store Connect.
// 2. In the pack entry below, change:
//      isFree: true  →  isFree: false
//      productId: null  →  productId: 'com.brenin.whoislying.xxx_pack'
//
// ⚠️  WARNING: Existing users who already have access will lose it on update.
//     Consider a grace period or granting the purchase programmatically
//     before releasing — there is no automatic grandfathering.
//
// =============================================================================
// HOW TO: ADD A NEW CHARACTER TO AN EXISTING PACK
// =============================================================================
//
// 1. Add the character image to assets/images/ (e.g. newChar.png).
// 2. Add the entry to data/imagesData.ts:
//      { name: 'newChar', theme: 'halloween' }
//    The theme must match one of the pack's characterThemes.
// 3. Add 'newChar' to the component/character/index.tsx image map.
// 4. Optionally add it to the pack's previewCharacters (shown on the store card,
//    max 4 — extra are ignored).
// That's it — characters are unlocked by theme, so the new one is unlocked
// automatically for any user who owns that pack.
//
// =============================================================================
// HOW TO: ADD A NEW CATEGORY TO AN EXISTING PACK
// =============================================================================
//
// 1. Add the category to data/categories.json with `"available": true`.
// 2. Add a category image to assets/images/ and register it in selectCategory.tsx
//    (the `images` map at the top of the file).
// 3. Add the category key string to the pack's `categories` array below.
// 4. Add a color entry to CATEGORY_COLORS in selectCategory.tsx.
// 5. Add translation keys for the category name and description.
//
// =============================================================================

import { CharacterTheme } from './imagesData';

export interface Pack {
  id: string;
  // null = free pack (no IAP product). Non-null must match a registered
  // non-consumable product ID in Google Play Console + App Store Connect.
  productId: string | null;
  nameKey: string;        // translation key for the pack's display name
  descriptionKey: string; // translation key for the short description shown on the store card
  categories: string[];   // keys matching data/categories.json
  characterThemes: CharacterTheme[]; // themes from data/imagesData.ts
  color: string;          // hex color for the store card background
  isFree: boolean;
  previewCharacters: string[]; // character names shown overlapping on the store card (max 4)
  highlights: string[];  // translation keys for the back face "what's included" bullets
}

export const PACKS: Pack[] = [
  {
    id: 'base',
    productId: null,
    nameKey: 'Base Pack',
    descriptionKey: 'basePackDescription',
    categories: ['foods', 'animals', 'sports', 'movies', 'music'],
    characterThemes: ['male', 'female', 'music'],
    color: '#1E3A5F',
    isFree: true,
    previewCharacters: ['breno', 'paola', 'surfer', 'gabs'],
    highlights: [],
  },
  {
    id: 'halloween',
    productId: 'com.brenin.whoislying.halloween_pack',
    nameKey: 'Halloween',
    descriptionKey: 'halloweenDescription',
    categories: ['halloween'],
    characterThemes: ['halloween'],
    color: '#3B0764',
    isFree: false,
    previewCharacters: ['pumpkinMale', 'frank', 'ghost', 'skeleton'],
    highlights: ['halloweenHighlight1', 'halloweenHighlight2'],
  },
  {
    id: 'geography',
    productId: 'com.brenin.whoislying.geography_pack',
    nameKey: 'Countries',
    descriptionKey: 'geographyDescription',
    categories: ['geography'],
    characterThemes: ['male', 'female'],
    color: '#7C2D12',
    isFree: false,
    previewCharacters: ['surfer', 'gio', 'pedro'],
    highlights: ['geographyHighlight1'],
  },
  {
    id: 'professions',
    productId: 'com.brenin.whoislying.professions_pack',
    nameKey: 'Professions',
    descriptionKey: 'professionsDescription',
    categories: ['professions'],
    characterThemes: ['male', 'female'],
    color: '#1F2937',
    isFree: false,
    previewCharacters: ['fabricin', 'luh', 'diana'],
    highlights: ['professionsHighlight1'],
  },
];

// Derived constants — do not edit these manually.
export const FREE_PACK_IDS = new Set(PACKS.filter(p => p.isFree).map(p => p.id));

export const PAID_SKUS = PACKS
  .filter(p => !p.isFree && p.productId)
  .map(p => p.productId as string);

export const getPackForCategory = (categoryKey: string): Pack | undefined =>
  PACKS.find(p => p.categories.includes(categoryKey));

export const getPackForTheme = (theme: CharacterTheme): Pack | undefined =>
  PACKS.find(p => p.characterThemes.includes(theme));
