import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

import SettingsTab from '../../Components/DeviceDetails/SettingsTab';
import { addToDashboard, removeFromDashboard } from 'Actions';
import { deviceSetState } from 'Actions_Devices';
import { LearnButton } from 'TabViews_SubViews';


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
		const screen = wrapper.props().children.type.displayName;
		expect(screen).toEqual('Connect(SettingsTab)');
	});

	it(' check addToDashboard action on dispatching ', () => {
		const data = [ {
			id: 333,
			kind: 'addToDashboard',
			type: 'ADD_TO_DASHBOARD',
		}];
		store.dispatch(addToDashboard('addToDashboard', 333));
		let action = store.getActions();
		expect(action).toEqual(data);
	});

	it(' check removeFromDashboard action on dispatching ', () => {
		const data = [{
			id: 777,
			kind: 'removeFromDashboard',
			type: 'REMOVE_FROM_DASHBOARD',
		}];
		store.dispatch(removeFromDashboard('removeFromDashboard', 777));
		let action = store.getActions();
		expect(action).toEqual(data);
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
		const screen = wrapper.props().children.type.displayName;
		expect(screen).toEqual('Connect(LearnButton)');
	});

	it(' check deviceSetState action on dispatching ', () => {
		store.dispatch(deviceSetState());
		let action = store.getActions();
		expect(action).toEqual([]);
	});

});
