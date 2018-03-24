import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { shallow, mockStore } from '../../../Utils/TelldusTestSuite';
const store = mockStore({});

import RegisterScreen from '../../Components/PreLoginScreens/RegisterScreen.js';


describe('<RegisterScreen />', () => {

	let wrapper;
	beforeEach(()=>{
		wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<RegisterScreen />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});

	it('should shallow RegisterScreen', () => {
		expect(wrapper.find(RegisterScreen).length).toBe(1);
		const screen = wrapper.props().children.type.displayName;
		expect(screen).toEqual('Connect(InjectIntl(RegisterScreen))');
	});

	it(' check changeSensorDisplayType action on dispatching ', () => {
		const data = {
			type: 'REQUEST_MODAL_CLOSE',
		};
		store.dispatch(data);
		let action = store.getActions();
		expect(action).toEqual([data]);
	});

});
