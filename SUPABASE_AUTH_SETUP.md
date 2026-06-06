# Supabase Auth Setup for Authentic

## Environment

Create a local `.env.local` file from `.env.example` and provide:

```env
EXPO_PUBLIC_APP_SCHEME=authenticcdc
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER=com.authenticcdc.app
EXPO_PUBLIC_ANDROID_PACKAGE=com.authenticcdc.app
```

Only `EXPO_PUBLIC_*` values belong in the app. Do not place Google client secrets, Apple private keys, or Supabase service-role keys in Expo env files.

For EAS remote builds, these values must also be configured in the matching EAS environment because local `.env.local` files are not uploaded to EAS builders.

Example preview environment commands:

```bash
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "your-supabase-publishable-key"
eas env:create --environment preview --name EXPO_PUBLIC_APP_SCHEME --value "authenticcdc"
eas env:create --environment preview --name EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER --value "com.authenticcdc.app"
eas env:create --environment preview --name EXPO_PUBLIC_ANDROID_PACKAGE --value "com.authenticcdc.app"
eas env:create --environment preview --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "your-google-web-client-id.apps.googleusercontent.com"
```

The `development` EAS build profile reuses the `preview` environment so dev-client builds resolve the same remote Expo env values unless you later add a dedicated development environment.

## Expo identity values

This managed Expo app now uses `app.config.ts` as the source of truth for app identity.

- `slug`: `authentic-cdc`
- `scheme`: `authenticcdc`
- `ios.bundleIdentifier`: `com.authenticcdc.app`
- `android.package`: `com.authenticcdc.app`

If Google asks for a `manifest.xml`-style identifier during Android setup, the relevant value for this app is the Android package name above. In this workflow you do not hand-edit `AndroidManifest.xml`.

## Supabase dashboard

In Supabase Auth, enable:

- Email
- Google
- Apple

Provide these in the Supabase dashboard:

- Google OAuth client ID and client secret
- Apple provider credentials from Apple Developer

Add allowed redirect URLs that match the app redirect generated from the scheme above. For local native testing, allow the app scheme callback, for example:

```text
authenticcdc://auth/callback
authenticcdc://**
```

Also keep your project Site URL and redirect configuration aligned with the environments you use later.

## Google Cloud

Create or reuse a Google Cloud project and configure the OAuth consent screen. Then create OAuth credentials for the Google provider used by Supabase.

You will typically need:

- App name and branding
- Support email
- An existing Web OAuth client ID and client secret for the Supabase Google provider
- A new Android OAuth client using package name `com.authenticcdc.app`
- Authorized redirect URI from the Supabase Google provider page

For this managed Expo app, the key app identity value you need to keep consistent is:

```text
com.authenticcdc.app
```

Use the Web OAuth client ID in two places:

- Supabase Google provider configuration
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in the app

Do not place the Web client secret in the app. Keep it only in Google Cloud and Supabase.

For the Android OAuth client, register the SHA-1 fingerprint for the signing key used by your preview APK. In EAS, get it with:

```bash
eas credentials
```

Then open Android credentials for the project and note the keystore SHA-1 fingerprint.

If native Google sign-in later reports client or audience mismatches, confirm:

- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` matches the Web OAuth client ID
- Supabase Google provider uses the same Web client ID and secret
- the Android OAuth client package name matches `com.authenticcdc.app`
- the Android OAuth client SHA-1 matches the EAS keystore used for the APK build

## Apple Developer

To enable Apple auth later on iOS hardware/builds, you need:

- Apple Developer account
- Team ID
- App ID using `com.authenticcdc.app`
- Sign in with Apple capability enabled
- Apple key / key ID / private key configured in Supabase

The current app code guards Apple sign-in on non-iOS local environments.

## Running on Android emulator

On Windows, use Android Studio Emulator.

1. Install Android Studio.
2. Install Android SDK Platform 35, Build-Tools, Platform-Tools, and Android Emulator.
3. Ensure `ANDROID_HOME` points to `%LOCALAPPDATA%\\Android\\Sdk`.
4. Add `%LOCALAPPDATA%\\Android\\Sdk\\platform-tools` to `Path`.
5. Create and start a virtual device in Android Studio.
6. In this repo run:

```bash
npm start
```

Then press `a` in the Expo terminal, or run:

```bash
npm run android
```

## Current implementation notes

- Authentication is now designed around Supabase sessions instead of mock auth flags.
- Email auth is live-ready through Supabase credentials.
- Google auth uses native Google Sign-In on Android and the Supabase OAuth browser flow on web and iOS fallback.
- Apple auth is wired for the same service layer, but guarded outside iOS local environments.
- Onboarding and booking persistence remain local in this phase.

## Native Google testing

1. Build a preview APK:

```bash
eas build -p android --profile preview
```

2. Install the APK on an Android phone.
3. Open the app and tap `Continue with Google`.
4. Confirm the native Google account picker appears instead of a browser auth page.
5. Choose an account and confirm the app proceeds through the existing onboarding or booking routing.
6. Close and reopen the app to confirm the Supabase session persists.

Expo Go is not a supported test surface for this feature because `@react-native-google-signin/google-signin` uses native code.

## Optional future iOS native Google

This rollout keeps iOS on the existing browser OAuth fallback. If you later add native iOS Google Sign-In without Firebase, set a non-public `GOOGLE_IOS_URL_SCHEME` build env so the Expo config plugin can inject the required iOS URL scheme.
