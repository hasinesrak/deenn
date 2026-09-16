# Deen

> An offline Quran companion that shows a Quran verse whenever the user unlocks their Android phone.

---

## 1. Product Overview

**Deen** is a lightweight, offline-first Android app designed to turn everyday phone unlocks into small moments of Quran reading.

The core experience is:

```text
Unlock phone
    ↓
Deen selects a verse
    ↓
Verse appears through the Android unlock experience
    ↓
Arabic verse
    ↓
Pronunciation
    ↓
English meaning
    ↓
User can dismiss or open Deen
```

The application should feel:

* Calm
* Spiritual
* Personal
* Premium
* Modern
* Extremely simple
* Fast
* Offline
* Non-distracting

Deen should not feel like a typical Islamic-content app or a generic mobile dashboard.

The visual direction should borrow the attached design philosophy: restrained UI, excellent typography, thoughtful spacing, direct interaction, subtle depth, and responsive motion.

---

# 2. Core Product Principles

## 2.1 Offline First

The application must work without an internet connection.

No backend is required for V1.

No account is required.

No API calls are required for normal operation.

All Quran content and user preferences live locally on the device.

---

## 2.2 One Core Purpose

Deen should have one primary purpose:

> Help the user encounter and read Quran verses throughout the day.

Every feature should support that purpose.

Avoid unnecessary features such as:

* Social feeds
* Accounts
* Chat
* AI
* Cloud synchronization
* Advertising
* Community features
* Online-only content

---

## 2.3 User Agency

The user controls how Deen behaves.

Users can choose:

```text
Random
Sequential
```

They can disable the unlock experience.

They can choose pronunciation language.

They can choose light/dark/system appearance.

They can browse the Quran manually.

The app should never make the user feel trapped inside the experience.

This follows the design principle of agency from the supplied design guide.

---

# 3. Verse Modes

## 3.1 Random Mode

Every unlock selects a random verse.

Example:

```text
Unlock
↓
94:6

Unlock
↓
2:286

Unlock
↓
93:5
```

The selector should avoid immediately repeating the same verse.

For V1:

```text
randomVerse()
```

should exclude the previous verse.

Future versions can introduce smarter history-based randomization.

---

## 3.2 Sequential Mode

The user progresses from the beginning of the Quran toward the end.

Example:

```text
1:1
1:2
1:3
...
1:7
2:1
2:2
...
114:6
```

The current position must be stored locally.

Example:

```ts
{
  mode: "sequential",
  currentVerseId: 1254
}
```

On every unlock:

```text
get current verse
↓
show verse
↓
advance sequential position
```

The advancement behavior must be carefully defined so that opening the verse manually does not accidentally advance progression multiple times.

---

# 4. Quran Content

The bundled dataset should contain:

```text
Arabic verse
English pronunciation
Bengali pronunciation
English meaning
Surah name
Surah number
Ayah number
Global verse ID
```

Suggested structure:

```ts
type Verse = {
  id: number

  surahId: number
  surahName: string
  ayahNumber: number

  arabic: string

  transliterationEn: string
  transliterationBn: string

  meaningEn: string
}
```

Example:

```json
{
  "id": 6087,
  "surahId": 94,
  "surahName": "Al-Inshirah",
  "ayahNumber": 6,
  "arabic": "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
  "transliterationEn": "Inna ma'al-'usri yusra",
  "transliterationBn": "ইন্না মা‘আল উসরি ইউসরা",
  "meaningEn": "Indeed, with hardship comes ease."
}
```

The Quran text, pronunciation data, and translation should come from trusted, appropriately licensed sources before packaging the final dataset.

---

# 5. Local Database

Use SQLite rather than storing the entire Quran in AsyncStorage.

Recommended structure:

```text
SQLite
├── verses
├── surahs
├── settings
├── progress
└── verse_history
```

### `verses`

```text
id
surah_id
ayah_number
arabic
transliteration_en
transliteration_bn
meaning_en
```

### `surahs`

```text
id
name
arabic_name
revelation_type
verse_count
```

### `settings`

```text
key
value
```

### `progress`

```text
id
mode
current_verse_id
```

### `verse_history`

```text
id
verse_id
shown_at
```

The history table is optional for the first implementation but recommended because it makes randomization and future features easier.

---

# 6. Android Unlock Experience

This is the most technically sensitive part of the application.

Android exposes `ACTION_USER_PRESENT`, which fires when the user becomes present after the device wakes and the keyguard is gone.

However, Android restricts background applications from freely launching activities. These restrictions exist specifically to prevent unwanted UI interruptions.

Therefore, V1 should **not depend on arbitrarily launching a full React Native activity every time the phone is unlocked**.

Instead:

```text
Android unlock
      ↓
Native receiver
      ↓
Select verse
      ↓
Post Deen notification
      ↓
Heads-up notification
      ↓
User taps
      ↓
Open Deen verse screen
```

This is the recommended architecture.

---

# 7. Unlock Notification UX

The unlock notification should feel like a custom Deen experience rather than a generic Android notification.

Conceptually:

```text
┌─────────────────────────────────┐
│                                 │
│  ✦  Deen                 94 : 6 │
│     A verse for your day        │
│                                 │
│        إِنَّ مَعَ الْعُسْرِ      │
│             يُسْرًا              │
│                                 │
│    Inna ma'al-'usri yusra       │
│                                 │
│       Indeed, with hardship      │
│              comes ease.         │
│                                 │
│       [ Read in Deen ]           │
│                                 │
│              Dismiss             │
│                                 │
└─────────────────────────────────┘
```

The notification content should be short enough to remain useful when expanded.

Do not attempt to force a full-screen experience.

Android 14+ restricts `USE_FULL_SCREEN_INTENT` to calling/alarm use cases, making full-screen notification behavior inappropriate for Deen.

---

# 8. Main App Screens

The application should have only three primary destinations.

```text
Home
Quran
Settings
```

---

# 9. Home Screen

The Home screen is the emotional center of Deen.

### Structure

```text
Top
├── Deen
├── subtle tagline
└── Settings

Greeting
├── time-aware greeting
└── calm supporting message

Verse card
├── TODAY'S VERSE
├── surah / ayah
├── Arabic
├── pronunciation
├── meaning
├── previous
├── next
└── position indicator

Mode selector
├── Random
└── Sequential

Bottom navigation
├── Home
├── Quran
└── Settings
```

Example:

```text
Deen
Quran in your everyday

GOOD EVENING
May Allah accept
your efforts.

┌─────────────────────────────┐
│ TODAY'S VERSE         94:6  │
│                             │
│   إِنَّ مَعَ الْعُسْرِ       │
│          يُسْرًا             │
│                             │
│ Inna ma'al-'usri yusra      │
│                             │
│ Indeed, with hardship       │
│ comes ease.                 │
│                             │
│       ←   • • • •   →      │
└─────────────────────────────┘

┌────────────┐ ┌──────────────┐
│  Random    │ │  Sequential  │
│ New verse  │ │ Start → end  │
└────────────┘ └──────────────┘

Home       Quran       Settings
```

---

# 10. Verse Card

The verse card is the primary visual component.

It should not look like a generic Material card.

Use:

* Large radius
* Very subtle border
* Very subtle shadow
* Warm surface
* Generous internal spacing
* Strong typography
* Large Arabic text
* Minimal controls

The verse should visually dominate the card.

---

# 11. Arabic Typography

Arabic is the primary content.

Use a dedicated Arabic/Quran-friendly typeface rather than a generic system font.

Design priorities:

```text
Large Arabic
Comfortable line height
Generous whitespace
Excellent glyph rendering
Strong contrast
```

Never compress Arabic to fit a predefined small card.

The card should grow naturally when needed.

---

# 12. Pronunciation

The interface should support:

```text
English
বাংলা
Both
```

Default:

```text
English
```

Example:

```text
Inna ma'al-'usri yusra
```

Bengali:

```text
ইন্না মা‘আল উসরি ইউসরা
```

A small segmented control can switch between them.

Avoid making the pronunciation selector visually compete with the Arabic verse.

---

# 13. Meaning

V1 supports:

```text
English meaning
```

Example:

```text
Indeed, with hardship comes ease.
```

The meaning should be visually secondary to the Arabic.

Suggested hierarchy:

```text
Arabic
   ↓
Pronunciation
   ↓
Meaning
   ↓
Reference
```

---

# 14. Quran Browser

The Quran tab allows users to manually explore the complete Quran.

### Surah list

```text
Quran

Search

01   Al-Fatihah            7
02   Al-Baqarah          286
03   Aal-E-Imran         200
04   An-Nisa             176
...
114  An-Nas                6
```

Selecting a surah:

```text
Al-Inshirah

1
Arabic
pronunciation
meaning

2
Arabic
pronunciation
meaning

...

8
Arabic
pronunciation
meaning
```

---

# 15. Verse Navigation

Inside the Quran reader:

```text
Previous
    ↓
Current verse
    ↓
Next
```

Support horizontal swipe.

The verse should follow the user's finger rather than simply disappearing and being replaced.

The supplied design principles specifically recommend 1:1 direct manipulation and continuous feedback for gesture interactions.

---

# 16. Motion Design

Motion should be subtle and intentional.

## Default transitions

Use critically damped springs.

Conceptually:

```text
bounce: 0
response: ~0.3–0.4
```

The attached design guidance recommends critically damped motion as the default and reserving bounce for momentum-based gestures.

---

## Verse swipe

```text
Finger moves
      ↓
Card follows finger
      ↓
Release
      ↓
Spring settles
```

Momentum should influence where the card lands.

---

## Button interaction

On touch down:

```text
scale 1.0
   ↓
scale 0.97
```

Return immediately on release.

The design guide specifically emphasizes responding on press rather than waiting for release.

---

## Modal / popup

Avoid large theatrical animations.

Use:

```text
opacity
+
small scale
+
subtle spring
```

The interface should materialize rather than simply fade.

---

# 17. Reduced Motion

The application should offer reduced-motion-friendly behavior.

When reduced motion is enabled:

```text
No large sliding transitions
No exaggerated scaling
No bounce
```

Use:

```text
Short opacity fade
```

The supplied design guide recommends cross-fades and reduced motion rather than removing all feedback.

---

# 18. Visual Identity

Deen should have a visual identity inspired by premium editorial applications and the calmness of Notion-like products.

Avoid traditional:

```text
Bright green
Gold gradients
Ornamental patterns everywhere
Heavy Islamic decoration
Huge iconography
Generic Material UI
```

Instead:

```text
Warm neutrals
Deep forest green
Stone gray
Cream
Soft shadows
Elegant typography
Editorial layouts
Large whitespace
Subtle depth
```

---

# 19. Suggested Color System

## Light

```text
Background      #F4F1E9
Surface         #FBFAF6
Surface Alt     #ECE9DF

Primary         #17231D
Secondary       #68736B
Muted           #929890

Accent          #52685A
Accent Soft     #DDE3D9

Border          #E1DED4
```

## Dark

```text
Background      #111612
Surface         #191F1A
Surface Alt     #222922

Primary         #F4F1E8
Secondary       #AAB2AA
Muted           #7E887F

Accent          #91A993
Accent Soft     #303A31

Border          #303731
```

These values are starting points rather than fixed brand requirements.

---

# 20. Typography System

Do not use one generic font for everything.

Use separate type treatment for:

```text
Brand
UI
Arabic
Editorial text
```

Recommended direction:

### Brand / headings

A distinctive editorial serif.

### UI

A clean modern sans-serif.

### Arabic

A dedicated Arabic/Quran typeface.

### Meaning

Elegant readable serif or high-quality text face.

The goal is a hierarchy similar to a refined editorial product rather than a standard utility app.

The supplied design guide emphasizes size-specific tracking, leading, weight, and typography hierarchy.

---

# 21. Notion-Inspired Principles

The visual direction can borrow principles commonly associated with polished Notion-style interfaces without copying its UI.

Use:

```text
Large whitespace
Quiet borders
Subtle surfaces
Low visual noise
Strong typography
Clear hierarchy
Simple icons
Minimal navigation
Editorial content layouts
```

Avoid:

```text
Card overload
Excessive shadows
Too many colors
Large gradients
Dashboard-like widgets
Overly decorative UI
```

---

# 22. Home Screen Background

The Home screen can contain extremely subtle environmental artwork.

For example:

```text
soft mountains
distant mosque silhouette
sunlight
paper-like texture
```

It must remain understated.

The artwork should support the reading experience rather than become the focus.

---

# 23. Settings Screen

Keep Settings extremely simple.

```text
Settings

Reading
─────────────────────

Verse mode
○ Random
● Sequential

Pronunciation
● English
○ বাংলা
○ Both

Meaning
English

Unlock experience
● Enabled


Appearance
─────────────────────

Theme
○ Light
○ Dark
● System


Progress
─────────────────────

Current position
Al-Inshirah 94:6

Reset sequential progress
```

---

# 24. Local Settings

Suggested state:

```ts
type Settings = {
  verseMode: "random" | "sequential"

  pronunciation:
    | "english"
    | "bengali"
    | "both"

  meaningLanguage: "english"

  unlockEnabled: boolean

  theme:
    | "light"
    | "dark"
    | "system"

  preventImmediateRepeat: boolean
}
```

---

# 25. Progress Model

```ts
type Progress = {
  currentVerseId: number

  sequentialVerseId: number

  lastShownVerseId: number

  lastShownAt: number
}
```

For random mode:

```text
lastShownVerseId
```

prevents immediate repetition.

For sequential mode:

```text
sequentialVerseId
```

controls progression.

---

# 26. Technology Stack

## Frontend

```text
Expo
React Native
TypeScript
Expo Router
React Native Reanimated
React Native Gesture Handler
```

## Storage

```text
SQLite
```

## Android integration

```text
Kotlin
Expo Modules API
Android BroadcastReceiver
Android Notifications
```

Expo supports development builds and custom native code when a project requires native capabilities beyond Expo Go.

---

# 27. Expo Architecture

Use:

```text
Expo Development Build
```

rather than Expo Go for the production-oriented development workflow.

The native unlock functionality requires Android-specific code.

Expo's current recommended approach is to use native modules for custom native capabilities and config plugins for native project configuration.

---

# 28. Native Android Module

Create a small native module responsible for unlock detection.

Conceptually:

```text
Android
   ↓
ACTION_USER_PRESENT
   ↓
UnlockReceiver
   ↓
UnlockService
```

The receiver must remain lightweight.

Its primary responsibility:

```text
Detect unlock
↓
Check whether Deen is enabled
↓
Choose verse
↓
Schedule/show notification
```

`ACTION_USER_PRESENT` is specifically documented as being sent after the user becomes present once the keyguard is gone.

---

# 29. Native / React Native Boundary

Keep the native side as small as possible.

### Native Android

Responsible for:

```text
Unlock detection
Notification creation
Notification action
Android lifecycle integration
```

### React Native

Responsible for:

```text
UI
Navigation
Verse rendering
Database
Settings
Progress
Animations
Gestures
```

This keeps the architecture maintainable.

---

# 30. Recommended Project Structure

```text
deen/
│
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── quran.tsx
│   ├── settings.tsx
│   │
│   ├── quran/
│   │   └── [surahId].tsx
│   │
│   └── verse/
│       └── [verseId].tsx
│
├── components/
│   ├── VerseCard.tsx
│   ├── ArabicVerse.tsx
│   ├── Pronunciation.tsx
│   ├── Meaning.tsx
│   ├── VerseNavigation.tsx
│   ├── ModeSelector.tsx
│   ├── SurahRow.tsx
│   └── BottomNavigation.tsx
│
├── features/
│   ├── verse/
│   │   ├── selector.ts
│   │   ├── random.ts
│   │   ├── sequential.ts
│   │   └── history.ts
│   │
│   └── unlock/
│       ├── unlockService.ts
│       └── notificationService.ts
│
├── db/
│   ├── database.ts
│   ├── schema.ts
│   ├── migrations.ts
│   ├── verses.ts
│   └── surahs.ts
│
├── hooks/
│   ├── useVerse.ts
│   ├── useSettings.ts
│   ├── useProgress.ts
│   └── useUnlock.ts
│
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── radii.ts
│   └── shadows.ts
│
├── assets/
│   ├── quran.db
│   ├── fonts/
│   └── illustrations/
│
├── plugins/
│   └── withDeenAndroid.ts
│
├── native/
│   └── android/
│       ├── DeenUnlockReceiver.kt
│       └── DeenModule.kt
│
├── app.config.ts
├── package.json
└── tsconfig.json
```

---

# 31. Navigation

Use Expo Router.

Recommended routes:

```text
/
├── Home
├── Quran
├── Settings
│
├── Quran / Surah
└── Verse
```

Avoid deep navigation complexity.

The app should always make it obvious:

```text
Where am I?
What can I do?
How do I go back?
```

This directly follows the supplied wayfinding principle.

---

# 32. Component Design System

Build reusable primitives first.

```text
DeenText
DeenButton
IconButton
Surface
VerseCard
SegmentedControl
ScreenHeader
BottomNav
```

Then compose larger screens from them.

Do not individually style every screen from scratch.

---

# 33. Spacing System

Use a small spacing scale.

Example:

```text
4
8
12
16
20
24
32
40
48
64
```

Avoid random values.

Everything should align to the same spatial rhythm.

---

# 34. Radius System

Use restrained rounding.

```text
Small       10
Medium      16
Large       24
XL          32
Pill        999
```

The large verse card can use:

```text
24–32
```

---

# 35. Iconography

Use simple line icons.

Preferred visual language:

```text
1.5–2px stroke
Rounded endpoints
Minimal detail
Consistent size
```

Suggested icon families:

```text
Home
Book
Settings
Shuffle
List
Arrow Left
Arrow Right
Bookmark
Sun/Moon
```

Avoid mixing unrelated icon styles.

---

# 36. Accessibility

Support:

```text
Dynamic text scaling
Screen readers
High contrast
Reduced motion
Large touch targets
Dark mode
```

Buttons should have comfortable hit areas.

The supplied design principles recommend adapting layout to text size and accessibility settings rather than assuming one fixed screen layout.

---

# 37. Performance Requirements

The application should feel instant.

Targets:

```text
App launch:
< 1 second perceived startup

Verse lookup:
effectively instant

Navigation:
no visible loading

Swipe:
60 FPS target

Unlock handling:
minimal processing
```

The Quran data should never require a network request.

---

# 38. Offline Behavior

The app should continue functioning after:

```text
Airplane mode
No SIM
No Wi-Fi
No mobile data
```

The following must work offline:

```text
Random verse
Sequential verse
Quran browsing
Search
Settings
Progress
Verse navigation
Theme
Unlock notifications
```

---

# 39. Search

Search can be completely local.

V1:

```text
Search by Surah name
Search by Arabic text
Search by English meaning
```

Potentially:

```text
SQLite FTS
```

can be introduced once the basic app is functioning.

Do not build an unnecessarily sophisticated search system for the first iteration.

---

# 40. Notification Permissions

On supported Android versions, the app needs to handle notification permission appropriately.

The onboarding should explain the purpose:

```text
Deen can show you a verse
whenever you unlock your phone.

Allow notifications?
```

The request should happen in context, not immediately without explanation.

---

# 41. First Launch Experience

First launch:

```text
Deen

Quran in your everyday.

A verse whenever you unlock.
Completely offline.


Choose your reading style

○ Random
○ Sequential


Pronunciation

○ English
○ বাংলা
○ Both


[ Continue ]
```

Then:

```text
Allow Deen to show unlock verses
```

The user should understand what will happen before enabling it.

---

# 42. Onboarding Philosophy

Keep onboarding to one or two screens.

Do not introduce a long tutorial.

The first meaningful moment should be reaching the Home screen and seeing an actual verse.

---

# 43. Unlock Experience Settings

Settings should eventually allow:

```text
Enable unlock verse
Show pronunciation
Show meaning
Use random mode
Use sequential mode
```

Potential future options:

```text
Only after screen unlock
Only during certain times
Don't show more than X verses per hour
```

These should not be part of V1 unless necessary.

---

# 44. Error Handling

The app should fail gracefully.

Potential problems:

### Database unavailable

Show:

```text
We couldn't load the Quran library.
Please restart Deen.
```

### Notification disabled

Show:

```text
Unlock verses are turned off.

Enable notifications in Android Settings.
```

### End of sequential Quran

Show:

```text
You've reached the end of the Quran.

Start again
```

Do not silently loop.

---

# 45. Privacy

Deen should collect essentially nothing in V1.

No:

```text
Account
Email
Phone number
Location
Contacts
Cloud history
Advertising identifiers
```

All reading preferences and progress remain local.

A simple privacy statement can say:

> Deen works offline and keeps your reading preferences and progress on your device.

---

# 46. V1 Feature Scope

## Must Have

```text
✓ Offline Quran database
✓ Arabic text
✓ English pronunciation
✓ Bengali pronunciation
✓ English meaning
✓ Random mode
✓ Sequential mode
✓ Local progress
✓ Android unlock detection
✓ Deen notification
✓ Main Home screen
✓ Quran browser
✓ Verse reader
✓ Previous/Next
✓ Settings
✓ Light/Dark/System theme
✓ Custom polished UI
✓ No account
✓ No backend
✓ No internet dependency
```

---

# 47. V1 Explicitly Out of Scope

```text
✗ AI
✗ Chat
✗ User accounts
✗ Cloud sync
✗ Social features
✗ Comments
✗ Community
✗ Ads
✗ Subscription
✗ Online content
✗ Audio streaming
✗ Advanced analytics
✗ Server infrastructure
```

---

# 48. Future Features

Once V1 is stable:

```text
Bookmarks
Favorites
Reading history
Audio recitation
Multiple reciters
Additional translations
Tafsir
Daily statistics
Streaks
Home-screen widget
Lock-screen widget
Better notification customization
Qibla
Prayer times
```

But these should remain separate from the core V1 experience.

---

# 49. Development Phases

## Phase 1 — Foundation

```text
Create Expo project
Configure TypeScript
Set up Expo Router
Set up theme system
Set up SQLite
Create local Quran dataset
```

Deliverable:

```text
App launches
Database works
Verse can be fetched
```

---

## Phase 2 — Verse Engine

Implement:

```text
getRandomVerse()
getNextSequentialVerse()
getPreviousVerse()
saveProgress()
getProgress()
```

Deliverable:

```text
Random mode works
Sequential mode works
Progress persists after restart
```

---

## Phase 3 — UI

Build:

```text
Home
VerseCard
ArabicVerse
Pronunciation
Meaning
ModeSelector
Quran browser
Settings
Bottom navigation
```

Focus heavily on typography, spacing, surfaces, and visual hierarchy.

---

## Phase 4 — Gestures & Motion

Implement:

```text
Swipe between verses
Spring transitions
Press feedback
Subtle card materialization
Reduced motion behavior
```

Motion should follow the attached design philosophy rather than becoming decorative animation.

---

## Phase 5 — Android Unlock Integration

Implement native Android:

```text
ACTION_USER_PRESENT
↓
UnlockReceiver
↓
Verse selector
↓
Notification
```

Test across multiple Android versions and OEM behaviors.

---

## Phase 6 — Unlock UI

Create the custom notification presentation:

```text
Deen logo
Verse reference
Arabic
Pronunciation
Meaning
Read in Deen
Dismiss
```

---

## Phase 7 — Onboarding

Add:

```text
First-launch experience
Mode selection
Pronunciation selection
Notification explanation
Permission request
```

---

## Phase 8 — Polish

Audit:

```text
Typography
Spacing
Icons
Animations
Dark mode
Accessibility
Loading
Empty states
Error states
Touch targets
```

This phase should be treated as a major part of the product, not an afterthought.

The attached design guidance explicitly frames craft and responsiveness as fundamental to perceived quality.

---

# 50. Testing Plan

## Unit Tests

Test:

```text
random verse selection
sequential progression
end-of-Quran handling
history
settings persistence
database queries
```

## UI Tests

Test:

```text
Home opens correctly
Verse navigation works
Settings persist
Theme changes
Pronunciation switches
```

## Android Tests

Test:

```text
Phone locked → unlock
Phone screen off → unlock
PIN unlock
Fingerprint unlock
Face unlock
Repeated unlocks
Notification disabled
Battery saver
App force-stopped
Device reboot
```

---

# 51. OEM Testing

Android behavior can vary between manufacturers.

Test at minimum on:

```text
Google Pixel
Samsung
Xiaomi/Redmi
OnePlus
```

Especially test:

```text
background behavior
notification delivery
battery optimization
autostart restrictions
unlock receiver
```

---

# 52. Performance Testing

Check:

```text
Cold start
Warm start
Database startup
Verse lookup
Notification generation
Swipe performance
Large text
Dark mode
Low-memory scenarios
```

No screen should require a network call.

---

# 53. Definition of Done

The MVP is complete when:

```text
[ ] App installs successfully
[ ] App opens offline
[ ] Quran dataset is bundled
[ ] Quran can be browsed
[ ] Verse can be viewed
[ ] Arabic renders correctly
[ ] English pronunciation works
[ ] Bengali pronunciation works
[ ] English meaning works
[ ] Random mode works
[ ] Sequential mode works
[ ] Sequential progress survives restart
[ ] Previous/next works
[ ] Swipe navigation works
[ ] Settings persist
[ ] Light theme works
[ ] Dark theme works
[ ] Notification permission flow works
[ ] Android unlock event is detected
[ ] Unlock verse notification appears
[ ] Notification opens correct verse
[ ] App works without internet
[ ] Accessibility basics are covered
[ ] No unnecessary permissions are requested
```

---

# 54. Recommended Final UX

The final product should feel like this:

```text
User locks phone
       ↓
Time passes
       ↓
User unlocks phone
       ↓
Deen quietly appears
       ↓
One Quran verse
       ↓
Arabic
       ↓
Pronunciation
       ↓
Meaning
       ↓
"Read in Deen"
       ↓
User continues their day
```

The product should not feel like it is demanding attention.

It should feel like a small reminder.

---

# 55. Product North Star

> **Every unlock is an opportunity to read one verse.**

Everything in Deen should support that idea.

The application should be:

**Small enough to disappear.
Beautiful enough to remember.
Fast enough to feel instant.
Simple enough to use every day.
Offline enough to be dependable.**
