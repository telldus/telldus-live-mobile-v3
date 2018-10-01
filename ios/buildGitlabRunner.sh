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
    pushServiceId: '${PUSH_SERVICE_ID_IOS}',
    webClientId: '${GOOGLE_WEB_CLIENT_ID}',
	iosClientId: '${GOOGLE_IOS_CLIENT_ID}',
	iosReversedClientId: '${GOOGLE_IOS_REVERSED_CLIENT_ID}',
    googleMapsAPIKey: '${GOOGLE_MAPS_API_KEY}'
};
EOF

cat > Release.xcconfig <<EOF
#include "./Pods/Target Support Files/Pods-TelldusLiveApp/Pods-TelldusLiveApp.release.xcconfig"

GOOGLE_IOS_REVERSED_CLIENT_ID = ${GOOGLE_IOS_REVERSED_CLIENT_ID}
EOF

echo "${GOOGLE_SERVICES_PLIST}" > TelldusLiveApp/GoogleService-Info.plist

cd ..
react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ios/main.jsbundle --sourcemap-output ios/main.jsbundle.map

fastlane ios build
