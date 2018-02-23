import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { shallow } from 'enzyme';
import { configureStore } from '../../Store/ConfigureStore';

import GatewaysTab from '../../Components/TabViews/GatewaysTab';
import { getGateways } from 'Actions';

describe('<GatewaysTab />', () => {
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
					<GatewaysTab />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});

	it(' render the connected(GatewaysTab) component', () => {
		const Tab = wrapper.props().children.type.displayName;
		expect(Tab).toEqual('Connect(GatewaysTab)');
	});

	it(' check toggleEditMode action on dispatching ', () => {
		store.dispatch(getGateways('tellduslive'));
		let state = store.getState();
		expect(state.gateways.toActivate.checkIfGatewaysEmpty).toEqual(false);
	});

});
