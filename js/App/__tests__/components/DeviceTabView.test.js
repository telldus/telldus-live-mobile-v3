import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { shallow, mockStore } from '../../../Utils/TelldusTestSuite';
const store = mockStore({});

import DevicesTab from '../../Components/TabViews/DevicesTab';


describe('<DevicesTab />', () => {
	let wrapper;
	beforeEach(()=>{
		wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<DevicesTab />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});

	it(' render the connected(DevicesTab) component', () => {
		const Tab = wrapper.props().children.type.displayName;
		expect(Tab).toEqual('Connect(DevicesTab)');
	});
});
