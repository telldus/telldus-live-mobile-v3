import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

import OverviewTab from '../../Components/DeviceDetails/OverviewTab';
import { DimmerDeviceDetail } from 'SubViews';
import { setDimmerValue, saveDimmerInitialState } from 'Actions_Dimmer';
import { requestDeviceAction } from 'Actions_Devices';


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
		const screen = wrapper.props().children.type.displayName;
		expect(screen).toEqual('Connect(OverviewTab)');
	});

});

describe('DimmerDeviceDetail', () => {

	let wrapper, store;
	beforeEach(()=>{
		store = mockStore({});
		wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<DimmerDeviceDetail />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});

	it('should shallow DimmerDeviceDetail', () => {
		expect(wrapper.find(DimmerDeviceDetail).length).toBe(1);
		const screen = wrapper.props().children.type.displayName;
		expect(screen).toEqual('Connect(DimmerDeviceDetailModal)');
	});

	it(' check requestDeviceAction action on dispatching ', () => {
		const data = [{
			payload: {
				deviceId: 555,
				method: 'telldus',
			}, type: 'REQUEST_DEVICE_ACTION'}];

		store.dispatch(requestDeviceAction(555, 'telldus'));
		let action = store.getActions();
		expect(action).toEqual(data);
	});

	it(' check setDimmerValue action on dispatching ', () => {
		const expected = [{payload: {deviceId: 3, value: 333}, type: 'SET_DIMMER_VALUE'}];
		store.dispatch(setDimmerValue(3, 333));
		let action = store.getActions();
		expect(action).toEqual(expected);
	});

	it(' check saveDimmerInitialState action on dispatching ', () => {
		const data = [{payload: {deviceId: 555, initialState: 'telldus', initialValue: 333}, type: 'SAVE_DIMMER_INITIAL_STATE'}];

		store.dispatch(saveDimmerInitialState(555, 333, 'telldus'));
		let action = store.getActions();
		expect(action).toEqual(data);
	});

});
