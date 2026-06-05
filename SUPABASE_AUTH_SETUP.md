# Supabase Auth Setup for Authentic

## Environment

Create a local `.env.local` file from `.env.example` and provide:

```env
EXPO_PUBLIC_APP_SCHEME=authenticcdc
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER=com.richiewaweru.authenticcdc
EXPO_PUBLIC_ANDROID_PACKAGE=com.richiewaweru.authenticcdc
```

Only `EXPO_PUBLIC_*` values belong in the app. Do not place Google client secrets, Apple private keys, or Supabase service-role keys in Expo env files.

## Expo identity values

This managed Expo app now uses `app.config.ts` as the source of truth for app identity.

- `scheme`: `authenticcdc`
- `ios.bundleIdentifier`: `com.richiewaweru.authenticcdc`
- `android.package`: `com.richiewaweru.authenticcdc`

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
```

Also keep your project Site URL and redirect configuration aligned with the environments you use later.

## Google Cloud

Create or reuse a Google Cloud project and configure the OAuth consent screen. Then create OAuth credentials for the Google provider used by Supabase.

You will typically need:

- App name and branding
- Support email
- Authorized redirect URI from the Supabase Google provider page

For this managed Expo app, the key app identity value you need to keep consistent is:

```text
com.richiewaweru.authenticcdc
```

## Apple Developer

To enable Apple auth later on iOS hardware/builds, you need:

- Apple Developer account
- Team ID
- App ID using `com.richiewaweru.authenticcdc`
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
- Google auth uses the Supabase OAuth browser flow.
- Apple auth is wired for the same service layer, but guarded outside iOS local environments.
- Onboarding and booking persistence remain local in this phase.
