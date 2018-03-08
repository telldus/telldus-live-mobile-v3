FROM elviejokike/react-native-android

# Install yarn
RUN apt-get update && \
    apt-get install apt-transport-https && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list && \
    apt-get update && \
    apt-get install yarn && \
    apt-get clean

# The version of node included in the upstream image is too old. Until a new upstream image is available
# we update it ourself. When a new upstream version is available, please remove this
ENV NODE_VERSION 8.9.4
RUN cd && \
    wget -q http://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz && \
    tar -xzf node-v${NODE_VERSION}-linux-x64.tar.gz && \
    rm -rf /opt/node && \
    mv node-v${NODE_VERSION}-linux-x64 /opt/node && \
    rm node-v${NODE_VERSION}-linux-x64.tar.gz

ENV ANDROID_BUILD_TOOLS_VERSION="build-tools-24.0.1,build-tools-25.0.2,build-tools-25.0.3,build-tools-26.0.1"
ENV ANDROID_API_LEVELS="android-24,android-25,android-26"
ENV ANDROID_EXTRA_COMPONENTS="extra-android-m2repository,extra-google-m2repository"

RUN echo "y" | android update sdk --no-ui -a --filter tools,platform-tools,${ANDROID_API_LEVELS},${ANDROID_BUILD_TOOLS_VERSION},${ANDROID_EXTRA_COMPONENTS}

