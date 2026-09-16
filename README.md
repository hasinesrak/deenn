# Deen

An offline Quran companion that shows a verse whenever you unlock your Android phone.

Deen is local-first. There is no account, no backend, and no network requirement for reading.

## V1

- Offline Quran in SQLite (Arabic, English pronunciation, Bengali pronunciation, English meaning)
- Random and sequential verse modes
- Home, Quran browser, and Settings
- Light / dark / system appearance
- Android unlock detection with a heads-up notification

Unlock verses need a [development build](https://docs.expo.dev/develop/development-builds/introduction/) on Android. Expo Go cannot register the native unlock receiver.

## Scripts

```bash
npm install
python scripts/build-quran-db.py   # rebuild assets/quran.db
npx expo start                     # Metro
npx expo run:android               # native Android build
npx expo lint
npx tsc --noEmit
```

## Data

See [docs/DATA.md](docs/DATA.md). The bundled dataset is built from [nafiskabbo/quran-dataset](https://github.com/nafiskabbo/quran-dataset).
