import React from 'react';
import { shallow } from '../../../Utils/TelldusTestSuite';
import BackgroundImage from '../../../BaseComponents/BackgroundImage';

describe('<BackgroundImage />', () => {

	let wrapper;
	beforeEach(()=>{
		wrapper = shallow(
			<BackgroundImage source = {'Telldus BackgroundImage'} />
		);
		expect(wrapper).toBeTruthy();
	});

	it('should shallow BackgroundImage', () => {
		expect(wrapper.find('ImageBackground').length).toBe(1);
		const image = wrapper.find('ImageBackground');
		expect(image.props().source).toEqual('Telldus BackgroundImage');
	});

});
