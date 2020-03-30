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
    twitterAuth: ${TWITTER_AUTH}
};
EOF

cat > gradle.properties <<EOF
TELLDUS_REACT_NATIVE_LOCAL_STORE_FILE=../android-signing/telldus.keystore
TELLDUS_REACT_NATIVE_LOCAL_KEY_ALIAS=telldus
TELLDUS_REACT_NATIVE_LOCAL_STORE_PASSWORD=${ANDROID_STORE_PASSWORD}
TELLDUS_REACT_NATIVE_LOCAL_KEY_PASSWORD=${ANDROID_KEY_PASSWORD}
GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
PUSH_SENDER_ID=${PUSH_SENDER_ID}
TELLDUS_API_SERVER="${TELLDUS_API_SERVER}"
DEPLOY_STORE="${DEPLOY_STORE}"

android.useAndroidX=true
android.enableJetifier=true
org.gradle.jvmargs=-Xmx4608M
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

# Use react-native-hms-map instead of react-native-maps for Huawei
cat > ../react-native-maps/index.js <<EOF
import * as Maps from 'react-native-hms-map';
module.exports = {
    ...Maps,
};
EOF

	yarn add react-native-hms-map "file:./react-native-hms-map"
    yarn add react-native-maps "file:./react-native-maps"

fi
# Confirm and update the module name - "react-native-hms-map".
# As of now it is a different module available by this name at NPM

./gradlew clean
./gradlew assembleRelease
