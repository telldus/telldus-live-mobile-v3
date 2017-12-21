import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '../../../Store/ConfigureStore';
import { IntlProvider } from 'react-intl';
import { shallow } from 'enzyme';
const store = configureStore();
import LoginScreen from '../../../Components/PreLoginScreens/LoginScreen.js';
import LoginForm from '../../../Components/PreLoginScreens/subViews/LoginForm.js';


describe('<LoginScreen />', () => {

	it('should shallow LoginScreen', () => {
		const wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<LoginScreen>
						<LoginForm />
					</LoginScreen>
				</IntlProvider>
			</Provider>
		);
		expect(wrapper.find(LoginForm).length).toBe(1);
		expect(wrapper.find(LoginScreen).length).toBe(1);
	});
});


describe('<LoginForm />', () => {

	it('should shallow LoginForm', () => {
		const wrapper = shallow(
			<Provider store={store}>
				<LoginForm
					username="test@gmail.com"
					password="test@gmail"
				 />
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});
});
