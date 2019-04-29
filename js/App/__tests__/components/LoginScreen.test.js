
import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { shallow, mockStore } from '../../../Utils/TelldusTestSuite';
const store = mockStore({});


import LoginScreen from '../../Components/PreLoginScreens/LoginScreen.js';

describe('<LoginScreen />', () => {

	let wrapper;
	beforeEach(()=>{
		wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<LoginScreen />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});

	it('should shallow LoginScreen', () => {
		expect(wrapper.find(LoginScreen).length).toBe(1);
		const screen = wrapper.props().children.props.children.type.displayName;
		expect(screen).toEqual('Connect(InjectIntl(LoginScreen))');
	});
});
