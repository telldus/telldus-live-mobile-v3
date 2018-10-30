import reducer, { initialState } from '../../Reducers/User.js';
jest.useFakeTimers();

describe('Test User reducers', ()=>{

	it('check User reducers initial state', () => {
		expect(reducer(undefined, {})).toEqual(initialState);
	});

	it('check User reducers after user registration', () => {
		const State = { registeredCredential: {access_token: 'tell', refresh_token: 'tell'} };
		const action = {
			type: 'USER_REGISTER',
			accessToken: {access_token: 'tell', refresh_token: 'tell'},
		};
		expect(reducer( {}, action )).toEqual(State);
	});

	it('check User reducers after received access token', () => {
		const State = { accessToken: {access_token: 'tell', refresh_token: 'tell'}, registeredCredential: false, isTokenValid: true };
		const action = {
			type: 'RECEIVED_ACCESS_TOKEN',
			accessToken: {access_token: 'tell', refresh_token: 'tell'},
		};
		expect(reducer( {}, action )).toEqual(State);
	});
	it('check User reducers after logout should return initial state', () => {
		const action = {
			type: 'LOGGED_OUT',
		};
		expect(reducer({}, action)).toEqual(initialState);
	});

	it('check Tab reducers after push token', () => {
		const state = { pushToken: 'telldus'};
		const action = {
			type: 'RECEIVED_PUSH_TOKEN',
			pushToken: 'telldus',
		};
		expect(reducer({}, action)).toEqual(state);
	});

	it('check Tab reducers after push token registered', () => {
		const payload = {
			deviceId: '1122',
			osVersion: '11',
			name: 'asdsd',
			model: 'SM',
		};
		const state = {
			pushTokenRegistered: true,
			deviceId: '1122',
			osVersion: '11',
			deviceName: 'asdsd',
			deviceModel: 'SM',
		};
		const action = {
			type: 'PUSH_TOKEN_REGISTERED',
			payload: payload,
		};
		expect(reducer({}, action)).toEqual(state);
	});

	it('check User reducers after log session', () => {
		const state = { isTokenValid: false };
		const action = {
			type: 'LOCK_SESSION',
		};
		expect(reducer({}, action)).toEqual(state);
	});

	it('check User reducers should return message', () => {
		const state = { notificationText: 'invalid data'};
		const action = {
			type: 'ERROR',
			message: {
				error_description: 'invalid data',
			},
		};
		expect(reducer({}, action)).toEqual(state);
	});

});
