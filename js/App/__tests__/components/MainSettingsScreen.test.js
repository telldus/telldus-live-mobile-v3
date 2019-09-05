import React from 'react';
import { IntlProvider } from 'react-intl';
import { shallow, mockStore } from '../../../Utils/TelldusTestSuite';

import MainSettingsScreen from '../../Components/Settings/MainSettingsScreen';
import { logoutFromTelldus } from '../../Actions';
import { registerPushToken, unregisterPushToken } from '../../Actions/User';

describe('<MainSettingsScreen />', () => {

	let wrapper, store;
	beforeEach(()=>{
		store = mockStore({
			user: {
				accessToken: {
					access_token: 'abc',
				},
			},
		});
		wrapper = shallow(
			<IntlProvider>
				<MainSettingsScreen />
			</IntlProvider>
		);
		expect(wrapper).toBeTruthy();
	});

	it('should shallow MainSettingsScreen', () => {
		expect(wrapper.find(MainSettingsScreen).length).toBe(1);
	});

	it(' check logoutFromTelldus action on dispatching ', () => {
		const data = [{ type: 'LOGGED_OUT' }];
		store.dispatch(logoutFromTelldus());
		let action = store.getActions();
		expect(action).toEqual(data);
	});

	it(' check registerPushToken action on dispatching ', () => {
		const data = [];
		store.dispatch(registerPushToken());
		let action = store.getActions();
		expect(action).toEqual(data);
	});

	it(' check unregisterPushToken action on dispatching ', () => {
		const data = [];
		store.dispatch(unregisterPushToken('tellldus'));
		let action = store.getActions();
		expect(action).toEqual(data);
	});

});
