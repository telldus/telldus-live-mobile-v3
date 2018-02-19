import React from 'react';
import { shallow } from 'enzyme';
import Title from '../../../BaseComponents/Title';

describe('<Title />', () => {

	let wrapper;
	beforeEach(()=>{
		wrapper = shallow(
			<Title />
		);
		expect(wrapper).toBeTruthy();
	});

	it('should shallow Title', () => {
		expect(wrapper.find('View').length).toBe(1);
	});

});
