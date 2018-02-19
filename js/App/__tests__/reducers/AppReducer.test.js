import reducer from '../../Reducers/App.js';

describe('App reducer', () => {
	it('should return the initial state', () => {
		expect(reducer(undefined, {})).toEqual({errorGlobalMessage: 'Action Currently Unavailable', errorGlobalShow: false, active: false,
		});
	});

	it('should handle global error show', () => {
		const state = { errorGlobalShow: true };
		const action = {
			type: 'GLOBAL_ERROR_SHOW',
		};
		expect(reducer({}, action)).toEqual(state);
	});

	it('should handle global error hide', () => {
		const state = { errorGlobalShow: false };
		const action = {
			type: 'GLOBAL_ERROR_HIDE',
		};
		expect(reducer({}, action)).toEqual(state);
	});

	it('should handle app foreground', () => {
		const state = { active: true };
		const action = {
			type: 'APP_FOREGROUND',
		};
		expect(reducer({}, action)).toEqual(state);
	});

	it('should handle app background', () => {
		const state = { active: false };
		const action = {
			type: 'APP_BACKGROUND',
		};
		expect(reducer({}, action)).toEqual(state);
	});

});
