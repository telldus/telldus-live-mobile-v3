import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { shallow, mockStore } from '../../../Utils/TelldusTestSuite';
const store = mockStore({});

import DashboardTab from '../../Components/TabViews/DashboardTab';


describe('<DashboardTab />', () => {
	let wrapper;
	beforeEach(()=>{
		wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<DashboardTab />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});

	it(' render the connected(DashboardTab) component', () => {
		const Tab = wrapper.props().children.props.children.type.displayName;
		expect(Tab).toEqual('Connect(DashboardTab)');
	});
});
