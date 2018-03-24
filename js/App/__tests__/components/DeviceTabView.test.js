import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { shallow, mockStore } from '../../../Utils/TelldusTestSuite';
const store = mockStore({});

import DevicesTab from '../../Components/TabViews/DevicesTab';
import { toggleEditMode } from '../../Actions';


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

	it(' check toggleEditMode action on dispatching ', () => {
		store.dispatch(toggleEditMode('devicesTab'));
		let action = store.getActions();
		expect(action[0].type).toBe('TOGGLE_EDIT_MODE');
		expect(action[0].tab).toBe('devicesTab');
	});

});
