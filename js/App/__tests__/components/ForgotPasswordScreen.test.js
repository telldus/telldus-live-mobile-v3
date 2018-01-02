import React from 'react';
import { shallow } from 'enzyme';
import { Provider } from 'react-redux';
import { configureStore } from '../../Store/ConfigureStore';
import { IntlProvider } from 'react-intl';
const store = configureStore();
import ForgotPasswordScreen from '../../Components/PreLoginScreens/ForgotPasswordScreen.js';
import ForgotPasswordForm from '../../Components/PreLoginScreens/subViews/ForgotPasswordForm.js';

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
		const screen = wrapper.props().children.type.displayName;
		expect(screen).toEqual('InjectIntl(ForgotPasswordScreen)');
	});

	// ForgotPasswordForm testing

	it('should render ForgotPasswordForm', () => {
		const wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<ForgotPasswordForm />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
		expect(wrapper.find(ForgotPasswordForm).length).toBe(1);
		const component = wrapper.props().children.type.displayName;
		expect(component).toEqual('InjectIntl(ForgotPasswordForm)');
	});


});
