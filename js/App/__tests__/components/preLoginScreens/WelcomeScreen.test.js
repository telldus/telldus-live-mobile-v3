import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '../../../Store/ConfigureStore';
import { IntlProvider } from 'react-intl';
import { shallow } from 'enzyme';
const store = configureStore();
import WelcomeScreen from '../../../Components/PreLoginScreens/WelcomeScreen';

describe('<WelcomeScreen />', () => {

	it('should shallow WelcomeScreen', () => {
		const wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<WelcomeScreen/>
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});
});
