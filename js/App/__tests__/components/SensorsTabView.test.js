import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const middlewares = [thunk];
const mockStore = configureStore(middlewares);
const store = mockStore({});

import SensorsTab from '../../Components/TabViews/SensorsTab';
import { toggleEditMode } from 'Actions';


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
		const Tab = wrapper.props().children.type.displayName;
		expect(Tab).toEqual('Connect(SensorsTab)');
	});

	it(' check toggleEditMode action on dispatching ', () => {
		store.dispatch(toggleEditMode('sensorsTab'));
		let action = store.getActions();
		expect(action[0].type).toBe('TOGGLE_EDIT_MODE');
	  expect(action[0].tab).toBe('sensorsTab');
	});


});
