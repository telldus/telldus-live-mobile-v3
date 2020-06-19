import React from 'react';
import { shallow } from '../../../Utils/TelldusTestSuite';
import Text from '../../../BaseComponents/Text';
import { configureStore } from '../../Store/ConfigureStore';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';

describe('<Text />', () => {

	let wrapper, store;
	beforeEach(()=>{
		store = configureStore().store;
		wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<Text text={'TELLDUSLIVE'} id={'textid'}/>
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});

	it('should shallow Text', () => {
		expect(wrapper.find('#textid').length).toBe(1);
		const text = wrapper.find('#textid');
		expect(text.props().text).toEqual('TELLDUSLIVE');
	});

});
