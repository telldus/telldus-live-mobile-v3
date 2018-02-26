import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const middlewares = [thunk];
const mockStore = configureStore(middlewares);
const store = mockStore({});

import SchedulerTab from '../../Components/TabViews/SchedulerTab';
import { getJobs } from '../../Actions';

describe('<SchedulerTab />', () => {

	let wrapper;
	  beforeEach(()=>{
		 wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
				    <SchedulerTab />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});

	it(' render the connected(SchedulerTab) component', () => {
		const Tab = wrapper.props().children.type.displayName;
		expect(Tab).toEqual('Connect(SchedulerTab)');
	});

	it(' check getjobs action on dispatching ', () => {
		store.dispatch(getJobs());
		let action = store.getActions();
		 expect(action).toEqual([]);
	});

});
