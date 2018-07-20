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

jest.mock('react-native-orientation-locker', () => {
	return {
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		lockToPortrait: jest.fn(),
		lockToLandscapeLeft: jest.fn(),
		lockToLandscapeRight: jest.fn(),
		unlockAllOrientations: jest.fn(),
	};
});
