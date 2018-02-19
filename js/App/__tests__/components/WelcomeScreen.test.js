import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const middlewares = [thunk];
const mockStore = configureStore(middlewares);
const store = mockStore({});

import WelcomeScreen from '../../Components/PreLoginScreens/WelcomeScreen';

describe('<WelcomeScreen />', () => {
	let wrapper;
	let accessToken = {access_token: 'tell', refresh_token: 'dus'};
	beforeEach(()=>{
		wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<WelcomeScreen />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});

	it('should shallow WelcomeScreen', () => {
		expect(wrapper.find(WelcomeScreen).length).toBe(1);
		const screen = wrapper.props().children.type.displayName;
		expect(screen).toEqual('Connect(InjectIntl(WelcomeScreen))');
	});

	it(' check WelcomeScreen action on dispatching ', () => {
		const data = {
			type: 'RECEIVED_ACCESS_TOKEN',
			accessToken,
		};
		store.dispatch(data);
		let action = store.getActions();
		expect(action).toEqual([data]);
	});

});
