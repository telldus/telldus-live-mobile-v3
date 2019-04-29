import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { shallow, mockStore } from '../../../Utils/TelldusTestSuite';

import OverviewTab from '../../Components/Device/DeviceDetails/OverviewTab';

describe('<OverviewTab />', () => {

	let wrapper, store;
	beforeEach(()=>{
		 store = mockStore({});
		wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<OverviewTab />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});

	it('should shallow OverviewTab', () => {
		expect(wrapper.find(OverviewTab).length).toBe(1);
		const screen = wrapper.props().children.props.children.type.displayName;
		expect(screen).toEqual('Connect(OverviewTab)');
	});

});
