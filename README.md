# Snippeta

Snippeta is a clipboard manager with a powerful custom keyboard that lets you paste snippets directly into any app. The Snippeta keyboard replaces your default keyboard and displays your organized snippets, allowing you to tap any snippet to instantly paste it wherever you're typing. Navigate through groups and nested sub-groups, use dedicated space and delete buttons, and access your snippets without ever leaving the app you're working in. Whether you're drafting emails, coding, or managing notes, Snippeta enhances productivity by putting your text snippets at your fingertips, right when you need them.

## Key Features

- **Custom Keyboard**: Replace your default keyboard with Snippeta to access and paste snippets directly into any app. Simply tap a snippet to paste it instantly.
- **In-App Snippet Access**: Browse and select from your organized snippets without switching apps. Navigate through groups and nested sub-groups right from the keyboard.
- **Dedicated Controls**: Built-in space and delete buttons for seamless text editing without switching keyboards.
- **Quick Access**: Utilize home screen widgets to swiftly copy snippet text without opening the app.
- **Organized Management**: Create groups and nested sub-groups to logically organize your snippets within the app.
- **Customizable Interface**: Choose from various themes to personalize your Snippeta experience.

For more information, visit [Snippeta.com](https://snippeta.com) or download the app from the [App Store](https://apps.apple.com/us/app/snippeta-copy-manage-paste/id1282250868).

---

This is a [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

## Step 1: Complete the React Native environment setup

>**Note**: This React Native project *does not* use [Expo](https://reactnative.dev/docs/environment-setup#start-a-new-react-native-project-with-expo)

1. Follow the instructions at [React Native - "Set Up Your Environment"](https://reactnative.dev/docs/environment-setup)
2. Run the following command to install the Node packages (*dependencies*)
```bash
# using npm
npm install

# OR using Yarn
yarn install
```

## Step 2: Start the app

Run the following command in the console to start your Android or iOS app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios
# using npm and specific device
npm run ios --device "iPhone 16 Pro"

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in your Android Emulator or iOS Simulator shortly, provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying and debugging the app

Now that you have successfully run the app, you can modify and debug it.

### React Native DevTools

**React Native DevTools** is a debugging experience built on Chrome DevTools that opens directly in your browser.

#### To open:
1. **From Metro Terminal**: Press <kbd>j</kbd> while Metro is running to open DevTools in your browser
2. **From Developer Menu**: Open the Developer Menu (<kbd>Ctrl</kbd> + <kbd>M</kbd> / <kbd>Cmd ⌘</kbd> + <kbd>M</kbd>) and select **"Debug"**

#### Features:
- **Console Panel**: View and filter console messages, evaluate JavaScript expressions, and inspect object properties
- **Sources & Breakpoints**: Access your source files and set breakpoints for step-through debugging
- **Memory Inspection**: Monitor memory usage to identify potential leaks
- **React Components Inspector**: Examine and modify component props and state at runtime
- **React Profiler**: Record performance profiles to analyze component render times

#### Console logging:

> **Note**: To view console logs, use the **Console panel** in React Native DevTools instead.

## Step 4: Publishing your App

### For Android

**Prerequisite**: Follow the instructions here to set up upload key: https://reactnative.dev/docs/signed-apk-android
1. Bump the version and/or build number in `~/android/app/build.gradle`
2. Run `npx react-native build-android --mode=release` in the console
3. The generated AAB can be found in `~/android/app/build/outputs/bundle/release/app-release.aab`, and is ready to be uploaded to Google Play, where it can be used as a release or beta test build

### For iOS

1. Open iOS project in Xcode
2. Bump the version and/or build number under the General settings on the main app target
3. In the menu, go to "Product", then "Archive"
4. Once built successfully, the new version will show in the Organizer; select it
5. Click "Distribute App" and follow the wizard
6. The app will be uploaded to App Store Connect, where it can be used as a release or beta test build

## Congratulations! 🎉

You've successfully run, modified, and published this React Native app. 🎊

### Now what?

- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how to set up your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [React Native DevTools](https://reactnative.dev/docs/react-native-devtools) - comprehensive guide to using React Native DevTools for debugging.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
