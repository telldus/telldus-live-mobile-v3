import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { shallow } from '../../../Utils/TelldusTestSuite';
import { configureStore } from '../../Store/ConfigureStore';
import SchedulerTab from '../../Components/TabViews/SchedulerTab';
import { getJobs } from '../../Actions';

describe('<SchedulerTab />', () => {

	let store;
	let accessToken = {access_token: 'bajs', refresh_token: 'bajs'};

	beforeEach(() => {
		store = configureStore();
		store.dispatch({type: 'RECEIVED_ACCESS_TOKEN', accessToken});
		store.dispatch({type: 'RECEIVED_DEVICES', payload: {
			device: [{
				id: '1',
				methods: 3,
				state: 2,
			}],
		}});
	});

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
		let state = store.getState();
		 expect(state.App.active).toEqual(true);
	});

});
