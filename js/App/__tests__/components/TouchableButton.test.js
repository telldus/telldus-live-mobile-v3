import React from 'react';
import { shallow } from '../../../Utils/TelldusTestSuite';
import { configureStore } from '../../Store/ConfigureStore';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import TouchableButton from '../../../BaseComponents/TouchableButton';

describe('<TouchableButton />', () => {

	let wrapper, store;
	beforeEach(()=>{
		store = configureStore();
		wrapper = shallow(
			<Provider store={store}>
				<IntlProvider>
					<TouchableButton />
				</IntlProvider>
			</Provider>
		);
		expect(wrapper).toBeTruthy();
	});

	it('should shallow BackgroundImage', () => {
		expect(wrapper.find(TouchableButton).length).toBe(1);
		expect( wrapper.props().children.props.children.type.displayName).toEqual('Connect(InjectIntl(TouchableButton))');
	});

});
