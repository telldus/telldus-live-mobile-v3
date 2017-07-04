#!/bin/sh

export ANDROID_BUILD_TOOLS_VERSION="build-tools-24.0.1"
export ANDROID_API_LEVELS="android-24"

echo "Update Android SDK"
echo "y" | android update sdk --no-ui -a --filter tools,platform-tools,${ANDROID_API_LEVELS},${ANDROID_BUILD_TOOLS_VERSION} > /dev/null
echo "Android SDK update complete"

# Prepare files
cat > ../config.local.js <<EOF
module.exports = {
    apiServer: 'https://api3.telldus.com',
    publicKey: "${PUBLIC_KEY_ANDROID}",
    privateKey: "${PRIVATE_KEY_ANDROID}",
    googleAnalyticsId: '${GOOGLE_ANALYTICS_ID}',
    testUsername: '',
    testPassword: '',
    forceLocale: '',
    pushSenderId: '${PUSH_SENDER_ID}',
    pushServiceId: ${PUSH_SERVICE_ID_ANDROID}
};
EOF

echo "${GOOGLE_SERVICES_JSON}" > app/google-services.json

./gradlew assembleRelease
