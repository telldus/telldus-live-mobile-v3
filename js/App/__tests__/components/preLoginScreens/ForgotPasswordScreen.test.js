import React from 'react';
import { shallow } from 'enzyme';
import { Provider } from 'react-redux';
import { configureStore } from '../../../Store/ConfigureStore';
import { IntlProvider } from 'react-intl';
const store = configureStore();
import ForgotPasswordScreen from '../../../Components/PreLoginScreens/ForgotPasswordScreen.js';
import ForgotPasswordForm from '../../../Components/PreLoginScreens/subViews/ForgotPasswordForm.js';
import FormContainerComponent from '../../../Components/PreLoginScreens/subViews/FormContainerComponent.js';
import TouchableButton from '../../../../BaseComponents/TouchableButton.js';


describe('<ForgotPasswordScreen />', () => {

	it('should render ForgotPasswordScreen', () => {
		const wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<ForgotPasswordScreen>
						<FormContainerComponent>
							<ForgotPasswordForm>
								<TouchableButton />
							</ForgotPasswordForm>
						</FormContainerComponent>
					</ForgotPasswordScreen>
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});
});
