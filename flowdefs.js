// This file is to be able to supress errors thrown by flow from modules in
// node_modules. Until flow has a better way of handling this please ignore the
// file throwing the error in .flowconfig and add a coresponding declaration here
// @flow
declare module 'AnimatedImplementation' {
	declare module.exports: any;
}
declare module 'react-native' {
	declare module.exports: any;
}
declare module 'StyleSheetValidation' {
	declare module.exports: any;
}
declare module 'ListView' {
	declare module.exports: any;
}
declare module 'Slider' {
	declare module.exports: any;
}
declare module 'MessageQueue' {
	declare module.exports: any;
}
declare module 'react-navigation' {
	declare module.exports: any;
}
declare module 'react-native-tab-view' {
	declare module.exports: any;
}
declare module 'react-native-udp' {
	declare module.exports: any;
}
declare module 'react-native-firebase' {
	declare module.exports: any;
}
declare module 'react-native-swiper' {
	declare module.exports: any;
}
declare module '../../local-cli/bundle/assetPathUtils' {
	declare module.exports: any;
}
declare module 'react-native-google-signin' {
	declare module.exports: any;
}
declare module 'react-native-color-wheel' {
	declare module.exports: any;
}
declare var console: any;
