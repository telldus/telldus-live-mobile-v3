#!/bin/sh

# Exit on error
set -e

# Set the dir internally to allow caching
export GRADLE_USER_HOME="$(pwd)/gradle"

# Prepare files
cat > ../config.local.js <<EOF
module.exports = {
    apiServer: 'https://api3.telldus.com',
    publicKey: "${PUBLIC_KEY_ANDROID}",
    privateKey: "${PRIVATE_KEY_ANDROID}",
    localStorageKey: 'tellduslive',
    googleAnalyticsId: '${GOOGLE_ANALYTICS_ID}',
    testUsername: '',
    testPassword: '',
    forceLocale: '',
    pushSenderId: '${PUSH_SENDER_ID}',
    pushServiceId: ${PUSH_SERVICE_ID_ANDROID},
    googleMapsAPIKey: '${GOOGLE_MAPS_API_KEY}',
    webClientId: '${GOOGLE_WEB_CLIENT_ID}',
    osTicketKey: '${OSTICKET_KEY}',
    twitterAuth: ${TWITTER_AUTH},
    deployStore: '${DEPLOY_STORE}'
};
EOF

cat > gradle.properties <<EOF
TELLDUS_REACT_NATIVE_LOCAL_STORE_FILE=../android-signing/telldus-upload.keystore
TELLDUS_REACT_NATIVE_LOCAL_KEY_ALIAS=telldus
TELLDUS_REACT_NATIVE_LOCAL_STORE_PASSWORD=${ANDROID_STORE_PASSWORD}
TELLDUS_REACT_NATIVE_LOCAL_KEY_PASSWORD=${ANDROID_KEY_PASSWORD}
GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
PUSH_SENDER_ID=${PUSH_SENDER_ID}
TELLDUS_API_SERVER="${TELLDUS_API_SERVER}"
DEPLOY_STORE="${DEPLOY_STORE}"
GEOLOCATION_APPLICATION_KEY=${GEOLOCATION_APPLICATION_KEY}

android.useAndroidX=true
android.enableJetifier=true
org.gradle.jvmargs=-Xms512M
FLIPPER_VERSION=0.33.1
EOF

echo "${GOOGLE_SERVICES}" > app/google-services.json

# Add deploy key to be able to fetch android keystore
if [ "${DEPLOY_KEY}" != "" ]; then
	if [ ! -d ~/.ssh ]; then
		mkdir ~/.ssh
		ssh-keyscan -t rsa code.telldus.com > ~/.ssh/known_hosts
	fi
	echo "${DEPLOY_KEY}" > ~/.ssh/id_rsa
	chmod 400 ~/.ssh/id_rsa
fi

git clone git@code.telldus.com:telldus/android-signing.git

# Need only those modules required by HMS
if [ "${DEPLOY_STORE}" == "huawei" ]; then
    cp "${AGCONNECT_SERVICES}" app/agconnect-services.json

	# Use react-native-hms-map instead of react-native-maps for Huawei
	git -C ../ clone git@code.telldus.com:3rd-party/react-native-hms-map.git
	yarn add react-native-maps@"file:./react-native-hms-map"

    ./gradlew clean
    ./gradlew assembleRelease
else
    ./gradlew clean
    ./gradlew bundleRelease

    # Download bundletool
    curl -O -L "https://github.com/google/bundletool/releases/download/1.2.0/bundletool-all-1.2.0.jar"

    # Use bundletool to create universal .apks zip
    java -jar bundletool-all-1.2.0.jar build-apks \
        --mode=universal \
        --bundle=app/build/outputs/bundle/release/app-release.aab \
        --output=universal.apks \
        --ks=android-signing/telldus-upload.keystore \
        --ks-pass=pass:${ANDROID_STORE_PASSWORD} \
        --ks-key-alias=telldus \
        --key-pass=pass:${ANDROID_KEY_PASSWORD};
fi
# TODO: Confirm and update the module link - "react-native-hms-map" Once it is open sourced
# As of now it is a different module available by this name at NPM


