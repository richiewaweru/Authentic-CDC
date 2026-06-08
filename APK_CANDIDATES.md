# APK Candidates Audit

## Safe to Exclude from EAS Upload

- `AGENTS.md`
- `CLAUDE.md`
- `README.md`
- `LICENSE`
- `SUPABASE_AUTH_SETUP.md`
- `__tests__/`
- `jest.config.js`
- `supabase/`
- `.expo-web.log`
- `.expo-web.err.log`

These files are not required to build the Android binary and can be excluded from the EAS upload via `.easignore`.

## Not Safe to Exclude: Imported by Runtime

- `src/mocks/guides.ts`
  Imported by `src/services/slotService.ts`.
- `src/mocks/slots.ts`
  Imported by `src/services/slotService.ts`.
- `src/mocks/payment.ts`
  Imported by `src/screens/booking/ConfirmBookingScreen.tsx`.

These look like mock or development-oriented files, but they are currently reachable from runtime code and may end up in the shipped app bundle. They are intentionally reported only in this pass.

## Required Assets: Keep, Optimize Later

- `assets/icon.png` (about 384 KB; biggest obvious asset-size candidate in this repo)
- `assets/authentic_logo.png`
- `assets/android-icon-foreground.png`
- `assets/android-icon-background.png`
- `assets/android-icon-monochrome.png`
- `assets/splash-icon.png`

These assets are referenced by app config or runtime UI and should remain in place for now. Optimize them later if APK size becomes a priority.
