# Telldus Live! mobile

[![Dependency Status](https://david-dm.org/telldus/telldus-live-mobile-v3.svg)](https://david-dm.org/telldus/telldus-live-mobile-v3) [![devDependency Status](https://david-dm.org/telldus/telldus-live-mobile-v3/dev-status.svg)](https://david-dm.org/telldus/telldus-live-mobile-v3#info=devDependencies)
[![Build status](http://code.telldus.com/telldus/live-app-v3/badges/master/build.svg)](http://code.telldus.com/telldus/live-app-v3/commits/master)
[![Translation status](http://developer.telldus.com/translate/widgets/telldus-live-mobile/-/svg-badge.svg)](http://developer.telldus.com/translate/engage/telldus-live-mobile/?utm_source=widget)

**Notes:**

- Keep the README.md complete and up to date! Goal is that it contains everything you need to get started.
- Feel free to adapt it as you see fit, you don't need permission.
- Take flow type seriously, JS might not care but Java and Obj-C underneath can be very rude.

## Install

All commands are assumed to be ran from project root.

### General

- install [nodejs >= 10](https://nodejs.org/en/)
- install [yarn](https://yarnpkg.com/en/)
- install local deps: `yarn install`
- install global deps: `npm install -g react-native-cli`**(NO MORE REQUIRED: If already installed shall remove)**
- install [fastlane](https://docs.fastlane.tools/#choose-your-installation-method)

### iOS

- install cacao pods cli: `brew install Caskroom/cask/cocoapods-app`
- install cacao pod deps: `cd ios && pod install`
- install Xcode via [Mac App Store](https://itunes.apple.com/us/app/xcode/id497799835?mt=12)

### Android

- find all the instructions you need for setting up your Android development environment on [React Native Official - Setup](https://reactnative.dev/docs/environment-setup)
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
- you need a `android/app/google-services.json`(agconnect-services.json for Huawei) file, see [instructions](#google-servicesjson)
- to run the app on your device, check out [React Native: Running On Device](https://reactnative.dev/docs/running-on-device). When your (virtual) device is connected, you can see it show up when you run `adb devices`. run `react-native run-android` to launch the app on your phone
- use `adb logcat` to look at the Android log file
- when the app launches on your (virtual) device, it will send you to the Settings screen for "Apps that can draw over other apps". Enable this for the Telldus app and launch the app again from your app drawer.

### Huawei

- On top of the above Android related setup, you need some additional changes.
- First thing to do is, add `deployStore: 'huawei'` inside `config.local.js`. This variable is used at multiple places through out the app.
- Then, add `DEPLOY_STORE="huawei"` inside `android/gradle.properties` file.
- You will also need a `agconnect-services.json` inside `android/app/` directory.
- Finally use `react-native-hms-map` instead of `react-native-maps`. To do that run the following command from the project root.
(Until they make the hms repo public in some version control system, or at npm, we need to use our fork)
```js
    git -C ../ clone git@code.telldus.com:3rd-party/react-native-hms-map.git
    yarn add react-native-maps@"file:./react-native-hms-map"
```

## Development

### i18n

The app uses react-intl for translating strings.

All string definitions and translated strings are stored in separate repo(live-shared-data) for sharing convenience. Make sure new entries are done inside `live-shared-data`

There are three ways of translating a string in the code.

#### 1) Use the <FormattedMessage> component available in base components.(DEPRECATED -  All string definition has to be done in live-shared-data)

**Example:**
```
<FormattedMessage id="unique.id.for.this.tag" defaultMessage="String to be translated" description="Description for this tag to help the translators" />
```

#### 2) Use the `<FormattedMessage>` component but define the strings separate

This is similar to the above variant but if the same tag is to be reused it must be defined separately

**Example:**
```javascript
// definition need to be done in live-shared-data
const messages = defineMessages({
	tag: {
		id: 'unique.id.for.this.tag',
		defaultMessage: 'String to be translated',
		description: "Description for this tag to help the translators"
	},
);

<FormattedMessage {...messages.tag} />
```

#### 3) Use the formatMessage function
First wrap the component using `injectIntl`
https://github.com/yahoo/react-intl/wiki/API#injection-api

**Example:**
```javascript
// definition need to be done in live-shared-data
const messages = defineMessages({
	tag: {
		id: 'unique.id.for.this.tag',
		defaultMessage: 'String to be translated',
		description: "Description for this tag to help the translators"
	},
);

class MyComp extends Component {
	render() {
		let formatMessage = this.props.intl.formatMessage;
		return <Text>{formatMessage(messages.tag)}</Text>
	}
}
export injectIntl(MyComp)
```

### Styling

There can be situation where device dimension is required to set style attributes for a component. The 'Dimensions' API provided by react-native cannot be relied during certain cases.
- The app's layout dimensions can be accessed from redux store, use this where ever possible for styling, instead of 'Dimensions' API.<br/>

**Example:**
```javascript
const {layout} = store.app;
const {height, width} = layout;
```

one limitation is, the layout dimensions can be used only in inline style, not while creating style sheet object using 'StyleSheet' API.

### Theme

- We support dark theme in both iOS and Android.
- Make sure you get all the screen mock ups done and approved in both light and dark theme from the designer.
- App already has a set of predefined color sets organised based on theme/mode. The color combinations for each theme/mode can be found inside 
[ThemedColors.js file](https://code.telldus.com/telldus/live-app-v3/-/blob/master/js/App/Theme/ThemedColors.js#L46).
- There are couple of ways to utilise the existing themed colors.

#### 1. Using property "level"
- Selected [BaseComponents](https://code.telldus.com/telldus/live-app-v3/-/tree/master/js/BaseComponents) will accept a property named `level`
(`blockLevel` and others in advanced base components) which takes care of setting `backgroundColor`, `color`(in the case of Text and Icon components) 
or `tintColor`(Image) depending upon the theme/mode.
- The method [getBGColor](https://code.telldus.com/telldus/live-app-v3/-/blob/master/js/BaseComponents/prepareRootProps.js#L56) sets desired `backgroundColor`
to the base components like [View](https://code.telldus.com/telldus/live-app-v3/-/blob/master/js/BaseComponents/View.js) and
 [TouchableOpacity](https://code.telldus.com/telldus/live-app-v3/-/blob/master/js/BaseComponents/TouchableOpacity.js) from `ThemedColors` with respect to the
 prop `level`.
 - Method [getTextColor](https://code.telldus.com/telldus/live-app-v3/-/blob/master/js/BaseComponents/prepareRootProps.js#L151) sets `color` for
 [Text](https://code.telldus.com/telldus/live-app-v3/-/blob/master/js/BaseComponents/Text.js) and few other components as well.
 - Method [getTintColor](https://code.telldus.com/telldus/live-app-v3/-/blob/master/js/BaseComponents/prepareRootProps.js#L291) sets tintColor on
 [ThemedImage](https://code.telldus.com/telldus/live-app-v3/-/blob/master/js/BaseComponents/ThemedImage.js).
 - You may check the existing [ThemedColors combinations](https://code.telldus.com/telldus/live-app-v3/-/blob/master/js/App/Theme/ThemedColors.js#L46) and
 see which `level` sets your desired color combination, supply it, you are done.
 
 ### 2. Using Hook [useAppTheme](https://code.telldus.com/telldus/live-app-v3/-/blob/master/js/App/Hooks/Theme.js#L39)
 - Sometimes you will need access to the entire ThemedColors set of the current mode/theme. Then you can call the hook `useAppTheme`.
 Returns few other useful data as well.
 - Above mentioned Base components that accepts `level` already uses this hook.
 - Try to write functional components until you have uncompromisable reason for using class component, and for class components since you cannot
 use hooks, use the HOC [withTheme](https://code.telldus.com/telldus/live-app-v3/-/blob/master/js/App/Components/HOC/withTheme.js). Now the class
 component will receive `colors` and some other useful data as prop.
 
 ### Add new color combination
 -  The existing ThemedColors should suffice during most of the cases, but incase if you cannot find the desired color combination, feel free to add colors
 for each theme/mode inside [ThemedColors.js file](https://code.telldus.com/telldus/live-app-v3/-/blob/master/js/App/Theme/ThemedColors.js).
 - You now can see the newly added color inside `colors` returned by the hook `useAppTheme`.
 - If you wish to handle the newly added color combination via `level`, you can do so inside [prepareRootProps](https://code.telldus.com/telldus/live-app-v3/-/blob/master/js/BaseComponents/prepareRootProps.js).


### Shared Code

- Already the App shares some code/data with the Web. It is required like other dependencies, and you can find it in the `package.json` file by the name 'live-shared-data'.
Instructions on how to integrate and use the repo for development can be found [here](https://code.telldus.com/telldus/live-shared-data).

- During development, try to keep the shareable code in the repo `live-shared-data`. Feel free to ask the maintainer if you are not sure that it could be shared.


### Local config

You'll need to add `config.local.js` in the root of your project. It's not to be checked in (ignored by git).

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

 - `apiServer`: string - Telldus API server url e.g. https://api.telldus.com
 - `publicKey`: string - Telldus API public key
 - `privateKey`: string - Telldus API public key
 - `googleAnalyticsId`: string - Google Analytics Id
 - `testUsername`: string - Used as a default username at login
 - `testPassword`: string - Used as a default password at login
 - `pushSenderId`: string - Used to identify the remote notification sender
 - `pushServiceId`: integer - Used to Identify the Push Service (GCM or APNS)
 - `googleMapsAPIKey`: string - Used to access Google Maps and Maps Geocode APIs
 - `webClientId`: string - Used for google authentication
 - `iosClientId`: string - Used for google authentication(only iOS)
 - `twitterAuth`: Object - Token, secret and key used for twitter authentication
 - `osTicketKey`: string - Used for creating support ticket from the app
 - `deployStore`: string - 'android' or 'huawei'(Only Android)

### Docker

The CI system builds the app in a Docker image. The `Dockerfile` is placed in the root of the project. To build it run:  
`docker build . -f Dockerfile.alpine -t react-native-android:29-alpine`

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

**Known issues:**

- when using Geny motion it is possible the app starts crashing unexpectedly after having run for a minute or two. When running `adb logcat`, this crash occurs because part of the app gets wrongfully garbage collected. It always seems to have something to do with `OkHttp` which is the low level HTTP lib RN uses. The log often contains other system warnings and errors about its connection status, so it's very likely a GenyMotion/VMWare issue. The only thing that has been proven to work is to restart your computer (which likely resets an underlying service, maybe VMWare).
- There seem to happen build failure due to multiple dex files <br/>
:app:dexDebug
Unknown source file : UNEXPECTED TOP-LEVEL EXCEPTION:
Unknown source file : com.android.dex.DexException: Multiple dex files define Lcom/google/android/gms/R$attr; <br/>
In case of above error, please clean and try rebuild. From root of the project execute command<br/>
`cd android && ./gradlew clean`


### Debugging

React Native comes with pretty cool development tools.

You can access the developer menu by shaking your device or by selecting "Shake Gesture" inside the Hardware menu in the iOS Simulator. You can also use the `Command ⌘ + D` keyboard shortcut when your app is running in the iPhone Simulator, or `Command ⌘ + M` when running in an Android emulator.

[More info](https://facebook.github.io/react-native/docs/debugging.html)

## Releasing

### General

- we use semver (major.minor.path) and the Android version is derived from that (`3.2.10` => `30210`)
- when releasing a new app, always update the version
- Run the release script: `npm run release`. This will prompt for the new version number.
- Check that the new commit and tag made by the release script is ok before pushing

### Android


- find all the instructions for generating signed APK on [Generating Signed APK](https://facebook.github.io/react-native/docs/signed-apk-android.html)
- Copy the Google Playstore credentials file `play_key.json` to the `fastlane/` subfolder.
- Run `fastlane alpha`

## Split dependencies

`dependencies` are dependencies require on production like servers, `devDependencies` are deps needed during development and the build process. All the client side libs should therefore reside in `devDependencies`.

## Builds

## Repo structure

## Testing

Before commiting code. Please make sure tests pass. Test the code:  
`yarn run lint`  
`yarn run flow`  
`yarn run test`

## Naming convention branches, commits and pull requests

If possible, try to keep the history linear. That means that your should rebase any feature branches before they are pushed.

It's possible to reference issues and even close them in commit messages. When possible, please do. It helps finding issues in the future. Read more:
https://docs.gitlab.com/ee/user/project/issues/automatic_issue_closing.html

Make sure the commit message includes all the changes in the commit. It is not sufficient to only reference an issue number. Anyone with git access might not have access to the issue system.  
This is not ok:  
`"Fixes #123"`  
This is ok:  
`"Check returned value before using it. Fixes #123"`

Make sure the commit message is in imperative present tense in these messages.
Instead of “I added tests for” or “Adding tests for,” use “Add tests for.”
The excelent book "Pro Git" covers this well:  
https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project

For any more info about git, please consider purchasing this book.

If the commit should be mentioned in the changelog this must be added to the commit. Add it as an own row prepended with `Changelog:`  
Please note that the changelog message must not be the same as the commit message. The changelog message will be presented to the user. This is an example of commit message:
```
Do not store date objects in the store. See #64.

The redux store must be serializable to JSON so only plain types may be stored.

Changelog: Fix a crash on startup
```

If you are not sure if your commit should be included in the changelog or not, ask the maintainer first!

### Commit messages

Please read these guidelines:  
https://chris.beams.io/posts/git-commit/


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
- `migrate`: Upon adding/removing a reducer or adding/removing any property of a reducer give a thought about app upgradation and compatibilty.(see `js/App/Store/migrations`)

For more info, from the man himself @dan_ambramov: https://github.com/reactjs/react-redux/blob/master/docs/api.md

### Learn Redux

Redux by itself is conceptually interesting but it starts flying when it's coupled with React. These two courses should do the trick to get you up to speed with Redux in React:
- [Part 1: Getting Started with Redux](https://egghead.io/series/getting-started-with-redux) (30 free videos)
- [Part 2: Building React Applications with Idiomatic Redux](https://egghead.io/courses/building-react-applications-with-idiomatic-redux) (27 free videos)

## Hooks

Though the app may contain mix of functional and class components, Try to use functional components as much as possible, as that is the only way to access hooks.

### Learn Hooks

- [Official React doc on hooks](https://reactjs.org/docs/hooks-intro.html)

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
Currently, the app supports `4023 = 1 + 2 + 4 + 16 + 32 + 128 + 256 + 512 + 1024 + 2048`.

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
        "client_id": "android:com.telldus.live.mobile.test",
        "client_type": 1,
        "android_client_info": {
          "package_name": "com.telldus.live.mobile.test",
          "certificate_hash": []
        }
      },
      "oauth_client": [
        {
          "client_id": "this-is-a-sample-do-not-use.apps.googleusercontent.com",
          "client_type": 1,
          "android_info": {
            "package_name": "com.telldus.live.mobile.test",
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
