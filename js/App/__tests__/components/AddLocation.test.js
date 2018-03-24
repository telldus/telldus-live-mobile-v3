import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { shallow, mockStore } from '../../../Utils/TelldusTestSuite';

import AddLocationContainer from '../../Components/Location/AddLocation/AddLocationContainer';
import * as modalActions from '../../Actions/Modal';

describe('<AddLocationContainer />', () => {

	let wrapper, store;
	beforeEach(()=>{
		store = mockStore({});
		wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<AddLocationContainer />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});

	it('should shallow AddLocationContainer', () => {
		expect(wrapper.find(AddLocationContainer).length).toBe(1);
		const screen = wrapper.props().children.type.displayName;
		expect(screen).toEqual('Connect(InjectIntl(AddLocationContainer))');
	});

	it(' check addToDashboard action on dispatching ', () => {
		const data = [{payload: {data: 'telldus', extras: 'true'}, type: 'REQUEST_MODAL_CLOSE'}];
		store.dispatch(modalActions.hideModal('telldus', 'true'));
		let action = store.getActions();
		expect(action).toEqual(data);
	});

});
