#!/bin/sh

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
