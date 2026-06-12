# Authentic Consumer App Worklog

## Current Phase
- `App-side rollout complete`

## Running Task List
- [x] Confirm Expo SDK 56 reference docs before code changes
- [x] Record repo baseline and current verification status
- [x] Create onboarding diagnostics and fix onboarding completion
- [x] Wire `slotService.ts` to live Supabase data with mock fallback retained
- [x] Replace mock booking confirmation with real booking persistence
- [x] Polish booking flow UI for mobile live-data states
- [x] Add multi-guide selection support in `ChooseSlotScreen`
- [x] Run final end-to-end Expo Web verification through booking, reschedule, and rebooking
- [x] Final app-side signoff complete
- [x] Backend slot-locking caveat documented separately

## Decision Log
### 2026-06-12
- Use `C:\Projects\Authentic\CONSUMER_APP_WORKLOG.md` as the living source of truth for tasks, decisions, and verification evidence.
- Keep `BookingConfirmed` as the success interstitial before `PendingHome`.
- Use email/password auth as the required verification path on web.
- Preserve the `DATA_SOURCE` toggle in `slotService.ts` and switch the default to live Supabase for this rollout.
- Temporarily worked around a `profiles` policy recursion issue in app code, then removed that workaround after the database RLS policy was fixed.
- Align the booking write path to the live backend contract: members can insert into `bookings` with slot metadata, but member writes to `available_slots` are rejected by RLS.
- Keep `available_slots` as the source for visible availability and `bookings` as the source for member confirmation/reschedule state until backend slot-locking support exists.
- Replace browser-critical `Alert.alert` flows with a web-safe dialog helper because `react-native-web` no-ops `Alert.alert` in this environment.
- Convert the slot data source toggle into a real env-based switch via `EXPO_PUBLIC_SLOT_DATA_SOURCE`, so the mock fallback remains usable without editing code.

## Verification Log
### Phase 0 Baseline
- Date: `2026-06-12`
- Environment:
  - Expo docs reference: `https://docs.expo.dev/versions/v56.0.0/`
  - Web startup command: `npx expo start --web`
  - Observed local URL: `http://localhost:8081`
- Baseline package versions:
  - `expo`: `~56.0.9`
  - `react`: `19.2.3`
  - `react-native`: `0.85.3`
  - `react-native-web`: `^0.21.0`
  - `@supabase/supabase-js`: `^2.107.0`
- Repo baseline:
  - `src/services/slotService.ts` is mock-backed
  - onboarding save exists but lacks sufficient diagnostics
  - `ConfirmBookingScreen` still uses `confirmMockPayment`
  - Expo Web starts successfully
  - Jest passes before implementation
- Current known warnings:
  - React Navigation development warning: `GO_BACK was not handled by any navigator`
  - Web style warning: `"shadow*" style props are deprecated. Use "boxShadow".`
- Jest baseline:
  - Result: `PASS`
  - Suites: `18/18`
  - Tests: `50/50`

### Phase 1 Verification
- Date: `2026-06-12`
- Test accounts:
  - `testuser-phase1-20260612-1502@test.com`
  - `testuser-phase1-retest-20260612-1515@test.com`
- Environment:
  - `npx expo start --web`
  - `http://localhost:8081`
  - Playwright CLI browser automation
- Result:
  - Initial failure reproduced with `profiles` update error `42P17` from Supabase.
  - After database policy fix, direct `profiles` update succeeded with no app workaround.
  - Fresh user completed all 7 onboarding steps and reached `ProfileReady`.
  - Full page reload preserved `ProfileReady`.
- Notes:
  - Onboarding diagnostics remain in place for payload/result tracing.

### Phase 2 / 3 Verification
- Date: `2026-06-12`
- Test account:
  - `testuser-phase1-retest-20260612-1515@test.com`
- Environment:
  - `npx expo start --web`
  - `http://localhost:8081`
  - Playwright CLI browser automation
- Result:
  - Real guides and real future slots loaded on `ChooseSlot`.
  - Multi-guide picker rendered with live data.
  - Confirming a live slot inserted a real `bookings` row and navigated to `BookingConfirmed`.
  - `PendingHome` rendered the real confirmed booking details.
- Notes:
  - The backend currently rejects member updates to `available_slots` with RLS `42501`.
  - Direct member insert into `bookings` succeeds when payload includes `slot_date`, `slot_time`, and `duration_minutes`.
  - Global slot locking is therefore still backend-limited; the app now follows the writable `bookings` path.

### Phase 4 / 5 Verification
- Date: `2026-06-12`
- Environment:
  - Chrome/Playwright desktop viewport against Expo Web
- Result:
  - Multi-guide selection works inside `ChooseSlotScreen`.
  - Booking summary, confirmed booking details, and pending-home details all render live data.
  - Date chips now meet the 48px touch-target goal; time buttons were already compliant.

### Final Live Verification
- Date: `2026-06-12`
- Test account:
  - `testuser-phase1-retest-20260612-1515@test.com`
- Environment:
  - `npx expo start --web`
  - `http://localhost:8081`
  - Playwright CLI browser automation
- Viewport checks:
  - `375x667` (iPhone SE class) on `ChooseSlot`
  - `390x844` (iPhone 14 class) on `ConfirmBooking`
  - `393x851` (Pixel 5 class) on `PendingHome`
- Result:
  - Reschedule confirm dialog works on web and routes back to `ChooseSlot`.
  - Rebooking after reschedule works and returns to `BookingConfirmed` then `PendingHome`.
  - The final verified browser passes had no blocking console errors.
- Data audit:
  - Latest app-driven booking row for `10:30 AM` is `confirmed`.
  - Prior app-driven `10:30 AM` row is `cancelled` with `cancel_reason = 'Member rescheduled'`.
  - Earlier `9:00 AM` rows on this test account came from direct backend probing during implementation and are not part of the final app-flow evidence.

### Mock Fallback Verification
- Date: `2026-06-12`
- Environment:
  - Jest unit verification
  - `EXPO_PUBLIC_SLOT_DATA_SOURCE=mock`
- Result:
  - `slotService` now reads its mode from `getSlotDataSource()`.
  - Dedicated test coverage verifies mock guides and slots still resolve correctly when mock mode is selected.
  - Full test suite passes with the env-based switch present.

## Known Risks / Blockers
- The live Supabase verification steps depend on the current environment being able to sign up and persist data against the configured backend.
- Social auth must remain web-safe; if platform-specific imports affect web bundling, they need a safe fallback without disrupting email auth.
- Final phase verification depends on real `guide_profiles` and `available_slots` data existing in Supabase.
- Member RLS currently blocks direct writes to `available_slots`, so true slot locking remains a backend concern outside this app repo.
- The `bookings` table still needs backend uniqueness/locking guarantees for strict slot integrity across clients.

## Final E2E Checklist
- [x] Sign up with email/password
- [x] Complete all 7 onboarding steps
- [x] Reach `ProfileReady`
- [x] Continue to `ChooseSlot`
- [x] See real guides from Supabase
- [x] See real open dates and times
- [x] Confirm booking
- [x] Reach `BookingConfirmed`
- [x] Continue to `PendingHome`
- [x] Reschedule and verify release/cancel behavior
- [x] Rebook successfully
- [x] Confirm no blocking console errors across the full flow
- [x] Preserve a working mock fallback path
