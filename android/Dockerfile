FROM elviejokike/react-native-android

ENV ANDROID_BUILD_TOOLS_VERSION="build-tools-24.0.1,build-tools-25.0.2,build-tools-25.0.3,build-tools-26.0.1"
ENV ANDROID_API_LEVELS="android-24,android-25,android-26"

RUN echo "y" | android update sdk --no-ui -a --filter tools,platform-tools,${ANDROID_API_LEVELS},${ANDROID_BUILD_TOOLS_VERSION}

