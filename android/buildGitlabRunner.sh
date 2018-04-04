#!/bin/sh

# Exit on error
set -e

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
    googleMapsAPIKey: '${GOOGLE_MAPS_API_KEY}'
};
EOF

cat > gradle.properties <<EOF
android.useDeprecatedNdk=true
android.enableAapt2=false
TELLDUS_REACT_NATIVE_LOCAL_STORE_FILE=../android-signing/telldus.keystore
TELLDUS_REACT_NATIVE_LOCAL_KEY_ALIAS=telldus
TELLDUS_REACT_NATIVE_LOCAL_STORE_PASSWORD=${ANDROID_STORE_PASSWORD}
TELLDUS_REACT_NATIVE_LOCAL_KEY_PASSWORD=${ANDROID_KEY_PASSWORD}
GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
EOF

echo "${GOOGLE_SERVICES_JSON}" > app/google-services.json

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

./gradlew clean
./gradlew assembleRelease
