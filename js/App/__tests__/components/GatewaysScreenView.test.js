import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { shallow } from '../../../Utils/TelldusTestSuite';
import { configureStore } from '../../Store/ConfigureStore';

import GatewaysScreen from '../../Components/TabViews/GatewaysScreen';
import { getGateways } from '../../Actions';

describe('<GatewaysScreen />', () => {
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
					<GatewaysScreen />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});

	it(' render the connected(GatewaysScreen) component', () => {
		const Tab = wrapper.props().children.props.children.type.displayName;
		expect(Tab).toEqual('Connect(GatewaysScreen)');
	});

	it(' check toggleEditMode action on dispatching ', () => {
		store.dispatch(getGateways('tellduslive'));
		let state = store.getState();
		expect(state.gateways.toActivate.checkIfGatewaysEmpty).toEqual(false);
	});

});
