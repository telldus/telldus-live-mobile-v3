#!/bin/sh

# Prepare files
cat > ../config.local.js <<EOF
module.exports = {
    apiServer: 'https://api.telldus.com',
    publicKey: "${PUBLIC_KEY_IOS}",
    privateKey: "${PRIVATE_KEY_IOS}",
    localStorageKey: 'tellduslive',
    googleAnalyticsId: '${GOOGLE_ANALYTICS_ID}',
    testUsername: '',
    testPassword: '',
    forceLocale: '',
    pushSenderId: '',
    pushServiceId: ${PUSH_SERVICE_ID_IOS}
};
EOF

cd ..
react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ios/main.jsbundle --sourcemap-output ios/main.jsbundle.map

fastlane ios build
