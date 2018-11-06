jest.mock('react-native-fabric', () => {
	return {
		Crashlytics: {
			crash: () => {},
		},
		Answers: {
			logCustom: () => {},
			logContentView: () => {},
		},
	};
});

jest.mock('react-native-device-info', () => {
	return {
		getSystemVersion: jest.fn(),
	};
});

global.window.addEventListener = () => null;
