import React from 'react';
import { shallow } from '../../../Utils/TelldusTestSuite';
import Text from '../../../BaseComponents/Text';

describe('<Text />', () => {

	let wrapper;
	beforeEach(()=>{
		wrapper = shallow(
			<Text text={'TELLDUSLIVE'} id={'textid'}/>
		);
		expect(wrapper).toBeTruthy();
	});

	it('should shallow Text', () => {
		expect(wrapper.find('#textid').length).toBe(1);
		const text = wrapper.find('#textid');
		expect(text.props().text).toEqual('TELLDUSLIVE');
	});

});
