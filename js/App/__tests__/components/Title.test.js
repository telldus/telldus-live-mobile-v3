import React from 'react';
import { shallow } from '../../../Utils/TelldusTestSuite';
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
		expect(wrapper.find('[id="titleView"]').length).toBe(1);
	});

});
