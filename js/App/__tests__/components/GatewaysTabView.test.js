import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const middlewares = [thunk];
const mockStore = configureStore(middlewares);
const store = mockStore({});

import GatewaysTab from '../../Components/TabViews/GatewaysTab';
import { getGateways } from '../../Actions';

describe('<GatewaysTab />', () => {
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
		let action = store.getActions();
		let state = store.getState();
		expect(action).toEqual([]);
		expect(state).toEqual({});
	});

});
