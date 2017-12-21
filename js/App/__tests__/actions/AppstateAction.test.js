import * as actions from '../../Actions/AppState.js';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('(AppState) appStart', () => {
	it('should return Appstart', () => {
		const store = mockStore();
		const expectedAction = [{ type: 'APP_START' }];
		store.dispatch(actions.appStart());
		expect(store.getActions()).toEqual(expectedAction);
	});
});
