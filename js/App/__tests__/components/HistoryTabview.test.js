import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { shallow, mockStore } from '../../../Utils/TelldusTestSuite';
const store = mockStore({});

import HistoryTab from '../../Components/Device/DeviceDetails/HistoryTab';
import { DeviceHistoryDetails } from '../../Components/Device/DeviceDetails/SubViews';
import { hideModal } from '../../Actions/Modal';



describe('<HistoryTab />', () => {

	let wrapper;
	beforeEach(()=>{
		wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<HistoryTab />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});

	it('should shallow HistoryTab', () => {
		expect(wrapper.find(HistoryTab).length).toBe(1);
		const screen = wrapper.props().children.props.children.type.displayName;
		expect(screen).toEqual('Connect(HistoryTab)');
	});

	it(' check hideModal action on dispatching ', () => {
		const data = {
			type: 'REQUEST_MODAL_CLOSE',
			payload: {
				data: 'hide model',
				extras: true,
			},
		};
		store.dispatch(hideModal('hide model', true));
		let action = store.getActions();
		expect(action).toEqual([data]);
	});

});

describe('DeviceHistoryDetails', () => {

	let wrapper;
	beforeEach(()=>{
		wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<DeviceHistoryDetails />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});

	it('should shallow DeviceHistoryDetails', () => {
		expect(wrapper.find(DeviceHistoryDetails).length).toBe(1);
		const screen = wrapper.props().children.props.children.type.displayName;
		expect(screen).toEqual('Connect(DeviceHistoryDetails)');
	});

});
