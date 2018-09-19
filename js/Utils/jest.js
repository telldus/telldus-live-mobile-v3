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

global.window.addEventListener = () => null;
