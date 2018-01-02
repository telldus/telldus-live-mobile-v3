import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const middlewares = [thunk];
const mockStore = configureStore(middlewares);
const store = mockStore({});


import LoginScreen from '../../Components/PreLoginScreens/LoginScreen.js';
import LoginForm from '../../Components/PreLoginScreens/subViews/LoginForm.js';
import { loginToTelldus } from 'Actions';

describe('<LoginForm />', () => {

	let wrapper;
	beforeEach(()=>{
		wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<LoginForm />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});

	it('should shallow LoginForm', () => {
		expect(wrapper.find(LoginForm).length).toBe(1);
		const screen = wrapper.props().children.type.displayName;
		expect(screen).toEqual('Connect(InjectIntl(LoginForm))');
	});

	it(' check changeSensorDisplayType action on dispatching ', () => {
		store.dispatch(loginToTelldus());
		let action = store.getActions();
		expect(action).toEqual([]);
	});

});


describe('<LoginScreen />', () => {

	let wrapper;
	beforeEach(()=>{
		wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<LoginScreen />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});

	it('should shallow LoginScreen', () => {
		expect(wrapper.find(LoginScreen).length).toBe(1);
		const screen = wrapper.props().children.type.displayName;
		expect(screen).toEqual('Connect(InjectIntl(LoginScreen))');
	});
});
