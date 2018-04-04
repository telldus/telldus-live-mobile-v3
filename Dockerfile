FROM elviejokike/react-native-android

ENV NODE_VERSION 8.11.1
ENV ANDROID_BUILD_TOOLS_VERSION="build-tools-24.0.1,build-tools-25.0.2,build-tools-26.0.1,build-tools-27.0.3"
ENV ANDROID_API_LEVELS="android-24,android-25,android-26,android-27"

RUN echo "y" | android update sdk --no-ui -a --filter tools,platform-tools,${ANDROID_API_LEVELS},${ANDROID_BUILD_TOOLS_VERSION}

# Update nodejs
RUN wget https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz && \
    tar -xzf node-v${NODE_VERSION}-linux-x64.tar.gz && \
    rm -rf /opt/node && \
    mv node-v${NODE_VERSION}-linux-x64 /opt/node && \
    rm node-v${NODE_VERSION}-linux-x64.tar.gz
