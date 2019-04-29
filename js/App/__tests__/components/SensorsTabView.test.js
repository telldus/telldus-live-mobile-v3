
import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { shallow, mockStore } from '../../../Utils/TelldusTestSuite';
const store = mockStore({});

import SensorsTab from '../../Components/TabViews/SensorsTab';


describe('<SensorsTab />', () => {
	let wrapper;
	  beforeEach(()=>{
		 wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
				    <SensorsTab />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});

	it(' render the connected(SensorsTab) component', () => {
		expect(wrapper.find(SensorsTab).length).toEqual(1);
		const Tab = wrapper.props().children.props.children.type.displayName;
		expect(Tab).toEqual('Connect(SensorsTab)');
	});
});
