import React from 'react';
import { shallow } from '../../../Utils/TelldusTestSuite';
import Text from '../../../BaseComponents/Text';

describe('<Text />', () => {

	let wrapper;
	beforeEach(()=>{
		wrapper = shallow(
			<Text text={'TELLDUSLIVE'} />
		);
		expect(wrapper).toBeTruthy();
	});

	it('should shallow Text', () => {
		expect(wrapper.find('Text').length).toBe(1);
		const text = wrapper.find('Text');
		expect(text.props().text).toEqual('TELLDUSLIVE');
	});

});
