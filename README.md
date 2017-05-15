# telldus-purple-internal

Internal dev repo for Telldus

**Notes:**

- keep the README.md complete and up to date! Goal is that it contains everything you need to get started.
- Feel free to adapt it as you see fit, you don't need permission.

## Install

All commands are assumed to be ran from project root.

### General

- install [nodejs >= 6](https://nodejs.org/en/)
- install local deps: `npm i`
- install global deps: `npm install -g react-native-cli`

### iOS

- install cacao pods cli: `brew install Caskroom/cask/cocoapods-app`
- install cacao pod deps: `cd ios && pod install`
- install Xcode via [Mac App Store](https://itunes.apple.com/us/app/xcode/id497799835?mt=12)

### Android

- find all the instructions you need for setting up your Android development environment on [React Native Official - Android Setup](https://facebook.github.io/react-native/releases/0.23/docs/android-setup.html)
- **install dependencies with Android Studio**:
  - Android SDK Manager is no longer available as a separate GUI (run `android`), but integrated in [Android Studio](https://developer.android.com/studio/install.html). Install it, go through default setup. When you get to chose your project (new, use existing, etc.), choose `Configure` -> `SDK Manager` on the bottom. This pretty much looks like the old GUI, only now it's split over 3 tabs. Use `Show Package Details` checkbox in the bottom, to expand the dependencies.
  - When you run the app, the `react-native` will use the `ANDROID_HOME` environment variable to find the SDK. So, if you install with Android Studio, use `export ANDROID_HOME=/Users/elbow/Library/Android/sdk` (add it to your `~/.bash_profile`).
- **install dependencies via the command-line** with [`sdkmanager`](https://developer.android.com/studio/command-line/sdkmanager.html). The instructions for `sdkmanager` on the official React Native page are somewhat outdated:
  - download it with `brew install Caskroom/cask/android-sdk` (instead of `brew install android-sdk`)
  - brew now uses a different path to store packages, use `export ANDROID_HOME=/usr/local/share/android-sdk` (instead of `export ANDROID_HOME=/usr/local/opt/android-sdk`)
  - `sdkmanager` might warn that `~/.android/repositories.cfg` could not be loaded. `touch ~/.android/repositories.cfg` to create it
  - to show all Android deps you can install, use `sdkmanager --list --verbose`
  - we currently run Android version 24, which you need to install Android deps for:
  `sdkmanager "build-tools;24.0.1" "platforms;android-24" "system-images;android-24;google_apis;x86_64" "system-images;android-24;google_apis;x86" --verbose` (includes Google Support Library and Play Services)
  - but certain deps need Android version 23, therefore you also need to run:
  `sdkmanager "build-tools;23.0.1" "platforms;android-23" "system-images;android-23;google_apis;x86_64" "system-images;android-23;google_apis;x86" --verbose`
  - we need some general Android deps:
  `sdkmanager "tools" "platform-tools" "extras;android;m2repository" "extras;google;m2repository" --verbose`
- you need a `android/app/google-services.json` file, see [instructions](#google-servicesjson)
- to run the app on your device, check out [React Native: Running On Device](https://facebook.github.io/react-native/releases/0.23/docs/running-on-device-android.html#content). When your (virtual) device is connected, you can see it show up when you run `adb devices`. run `react-native run-android` to launch the app on your phone
- use `adb logcat` to look at the Android log file
- when the app launches on your (virtual) device, it will send you to the Settings screen for "Apps that can draw over other apps". Enable this for the Telldus app and launch the app again from your app drawer.
 
## Development

### Local config

You'll need to add `local.config.js` in the root of your project. It's not to be checked in (ignored by git).

Create a file in the root of the project called 'config.local.js' with the contents of the script and fill with the valid keys.

**Example script:**

```
module.exports = {
	key1: value1,
	key2: value2,
	...
};
```

**Valid keys:**

 - `version`: string - App version
 - `apiServer`: string - Telldus API server url e.g. https://api.telldus.com
 - `publicKey`: string - Telldus API public key
 - `privateKey`: string - Telldus API public key
 - `googleAnalyticsId`: string - Google Analytics Id
 - `testUsername`: string - Used as a default username at login
 - `testPassword`: string - Used as a default passwod at login

## Run

- environment vars?

### iOS

- `react-native run-ios`

### Note:

To make development quick React Native comes with a Launch Packager which is run when you do `react-native run-ios`. This keeps some internal state and allows for hot code swapping and debugging inside the app (`cmd + D`). However, the packager keeps internal state which might go stale without you knowing. The only way to find out is to make a clean build:

- in the app: `cmd + shift + H`, long click on App, delete App
- quit the Launch Packager (runs in own window, so close window should do the trick)
- `react-native run-ios` to trigger a fresh build

### Android

- `react-native run-android`

### Debugging

React Native comes with pretty cool development tools.

You can access the developer menu by shaking your device or by selecting "Shake Gesture" inside the Hardware menu in the iOS Simulator. You can also use the `Command ⌘ + D` keyboard shortcut when your app is running in the iPhone Simulator, or `Command ⌘ + M` when running in an Android emulator.

[More info](https://facebook.github.io/react-native/docs/debugging.html)

## Releasing

### Android

- find all the instructions for generating signed APK on [Generating Signed APK](https://facebook.github.io/react-native/docs/signed-apk-android.html)
  - Use `react-native run-android --configuration=release` instead of `react-native run-android --variant=release`, see [SO](http://stackoverflow.com/questions/41263330/error-running-react-native-run-android-variant-release-task-installreleasede)
  - to make an .apk: `cd android && ./gradlew assembleRelease`
  - install .apk: `adb install android/app/build/outputs/apk/app-release.apk`
  - uninstall previous .apk: `adb uninstall com.telldus.live.mobile.test`

## Split dependencies

`dependencies` are dependencies require on production like servers, `devDependencies` are deps needed during development and the build process. All the client side libs should therefore reside in `devDependencies`.

## Builds

## Repo structure

## Testing

## Naming convention branches, commits and pull requests

## Logging

## Redux

This app uses [Redux](http://redux.js.org/) to manage its state. Redux is opinionated framework that works with pure functions, great for scaling applications that have to manage a lot of state (which is why it is a good fit for this app). It's basic components are:

- Action (see `js/App/Actions`): an event, with a type and optional payload, that is much like a trigger for a change that you want to happen
- Reducer (see `js/App/Reducers`): takes existing state and an Action, and returns a new state (never alters existing state)
- Redux store (see `js/App/Store/ConfigureStore.js`): 1) holds the current state and is initiated with a reducer. It provides a `dispatch` function which allows you to pass an Action to it. You can also `subscribe` to any changes.
- Action creator (see `js/App/Actions`): a function that dispatches one or more Actions, synchronously or asynchonously. When an asynchronous call needs to be made, it is facilitated by `Thunk Actions Middleware` or `Promise Action Middleware`. These Action Creators connect to the LiveApi or Websocket connection and when data is retrieved, the appropriate Action is dispatched.
- Selector (located with component): parses state into appropriate chunks for a React component (should rather be located with the relevant Reducer, because they work on the same data)
- `connect`: function that binds the Redux store to a React component passing two functions:
  - `mapStateToProps`: a function that uses Selectors to filter relevant props from the state
  - `mapDispatchToProps`: a function that exposes relevant Action creators in the props

For more info, from the man himself @dan_ambramov: https://github.com/reactjs/react-redux/blob/master/docs/api.md

### Learn Redux

Redux by itself is conceptually interesting but it starts flying when it's coupled with React. These two courses should do the trick to get you up to speed with Redux in React:
- [Part 1: Getting Started with Redux](https://egghead.io/series/getting-started-with-redux) (30 free videos)
- [Part 2: Building React Applications with Idiomatic Redux](https://egghead.io/courses/building-react-applications-with-idiomatic-redux) (27 free videos)

## Backend

The app communicates with the REST LiveApi (see `js/App/Lib/LiveApi`) for:
- authentication (logging in)
- getting lists of devices, sensors, etc.
- sending commands to devices (e.g. `device/turnOn`, `device/turnOff`)
- setting up a WebSocket session

Once the WebSocket (see `js/App/Lib/WebSockets`) session has been setup, it registers which messages the app is interested in, e.g. updates on a type of sensor. When that sensor has a new value, it pushes it over the WebSocket connection to the app.

### Data structure

All devices have one or more 'methods' which indicate what a device can do. These are the current methods:
```
TURNON  = 1        #: Device flag for devices supporting the on method.
TURNOFF = 2        #: Device flag for devices supporting the off method.
BELL = 4           #: Device flag for devices supporting the bell method.
TOGGLE = 8         #: Device flag for devices supporting the toggle method.
DIM = 16           #: Device flag for devices supporting the dim method.
LEARN = 32         #: Device flag for devices supporting the learn method.
EXECUTE = 64       #: Device flag for devices supporting the execute method.
UP = 128           #: Device flag for devices supporting the up method.
DOWN = 256         #: Device flag for devices supporting the down method.
STOP = 512         #: Device flag for devices supporting the stop method.
RGBW = 1024        #: Device flag for devices supporting the rgbw method.
THERMOSTAT = 2048  #: Device flag for devices supporting thermostat methods.
```

The following methods aren't in use in the moment: `TOGGLE`, `EXECUTE`, `RGBW`, `THERMOSTAT`

You can add up these methods to a single digit that denotes a group of methods, e.g. `3 = 1 + 2 = TURNON, TURNOFF`.
Currently, the app supports `951 = 1 + 2 + 4 + 16 + 32 + 128 + 256 + 512`.

When for example, `devices/list` is called, we can provide `supportedMethods`. If this parameter is not set, in the response `methods` and `state` will always report `0` for each device.

### Socket messages

Listening for device setState, you get these kind of messages.
```
// device turned off
{
    "module": "device", // <-- device, sensor
    "action": "setState", // <-- the type of message
    "data": {
        "deviceId": 1594308,
        "battery": 254,
        "method": 2, // <-- refers to methods defined under [Data Structure](#data-structure)
        "value": "" // <-- relevant data for this method, **always a string**!
    }
}
```

For example:
```
// device turned on
{
    "action": "setState",
    "module": "device",
    "data": {
        "battery": 254,
        "deviceId": 1594308,
        "method": 1, // <-- turnOn
        "value": ""
    }
}

// device turned off
{
    "action": "setState",
    "module": "device",
    "data": {
        "battery": 254,
        "deviceId": 1594308,
        "method": 2, // <-- turnOff
        "value": ""
    }
}

// device scaled to level 240 (of 255) (ie. 90%)
{
    "action": "setState",
    "module": "device",
    "data": {
        "battery": 254,
        "deviceId": 1594308,
        "method": 16, // <-- dim
        "value": "240" // <-- dim level, **string**: 240 of 255 = ie. 90%)
    }
}

// etc
```

## `google-services.json`

You need a `android/app/google-services.json` file, otherwise the app won't run. Because this file contains production keys and secrets, it is not included in this repository. However, you can add a placeholder yourself. Create `android/app/google-services.json` and add this json content:

```
{
  "project_info": {
    "project_id": "this-is-a-sample",
    "project_number": "999999999999",
    "name": "AdMob Samples",
    "firebase_url": "https://this-is-a-sample-do-not-use.firebaseio.com",
    "storage_bucket": "this-is-a-sample-do-not-use.storage.firebase.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:999999999999:android:0000000000000000",
        "client_id": "android:com.telldus.live.mobile",
        "client_type": 1,
        "android_client_info": {
          "package_name": "com.telldus.live.mobile",
          "certificate_hash": []
        }
      },
      "oauth_client": [
        {
          "client_id": "this-is-a-sample-do-not-use.apps.googleusercontent.com",
          "client_type": 1,
          "android_info": {
            "package_name": "com.telldus.live.mobile",
            "certificate_hash": "0000000000000000000000000000000000000000"
          }
        },
        {
          "client_id": "this-is-a-sample-do-not-use.apps.googleusercontent.com",
          "client_type": 3
        }
      ],
      "api_key": [
        {
          "current_key": "000000000000000000000000000000000000000"
        }
      ],
      "services": {
        "analytics_service": {
          "status": 1
        },
        "cloud_messaging_service": {
          "status": 2,
          "apns_config": []
        },
        "appinvite_service": {
          "status": 2,
          "other_platform_oauth_client": []
        },
        "google_signin_service": {
          "status": 2
        },
        "ads_service": {
          "status": 2,
          "test_banner_ad_unit_id": "ca-app-pub-3940256099942544/6300978111",
          "test_interstitial_ad_unit_id": "ca-app-pub-3940256099942544/1033173712"
        }
      }
    }
  ],
  "client_info": [],
  "ARTIFACT_VERSION": "1"
}
```
