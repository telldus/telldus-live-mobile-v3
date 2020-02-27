import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { shallow, mockStore } from '../../../Utils/TelldusTestSuite';

import SettingsTab from '../../Components/Device/DeviceDetails/SettingsTab';
import { LearnButton } from '../../Components/TabViews/SubViews';


describe('<SettingsTab />', () => {

	let wrapper, store;
	beforeEach(()=>{
		store = mockStore({});

		wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<SettingsTab />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});

	it('should shallow SettingsTab', () => {
		expect(wrapper.find(SettingsTab).length).toBe(1);
		const screen = wrapper.props().children.props.children.type.displayName;
		expect(screen).toEqual('Connect(SettingsTab)');
	});
});

describe('LearnButton', () => {

	let wrapper, store;
	beforeEach(()=>{
		store = mockStore({});
		wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<LearnButton />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});

	it('should shallow LearnButton', () => {
		expect(wrapper.find(LearnButton).length).toBe(1);
		const screen = wrapper.props().children.props.children.type.displayName;
		expect(screen).toEqual('Connect(LearnButton)');
	});

});
