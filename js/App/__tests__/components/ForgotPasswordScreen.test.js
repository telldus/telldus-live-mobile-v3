import React from 'react';
import { shallow } from '../../../Utils/TelldusTestSuite';
import { Provider } from 'react-redux';
import { configureStore } from '../../Store/ConfigureStore';
import { IntlProvider } from 'react-intl';
const store = configureStore();
import ForgotPasswordScreen from '../../Components/PreLoginScreens/ForgotPasswordScreen.js';

describe('<ForgotPasswordScreen />', () => {

	it('should render ForgotPasswordScreen', () => {
		const wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<ForgotPasswordScreen />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
		expect(wrapper.find(ForgotPasswordScreen).length).toBe(1);
		const screen = wrapper.props().children.props.children.type.displayName;
		expect(screen).toEqual('Connect(InjectIntl(ForgotPasswordScreen))');
	});

});
