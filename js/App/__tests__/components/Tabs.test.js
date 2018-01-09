import React from 'react';
import { shallow } from 'enzyme';
import Tabs from '../../../BaseComponents/Tabs';

describe('<Tabs />', () => {

	let wrapper;
	beforeEach(()=>{
		wrapper = shallow(
			<Tabs tab={'Sensor Tab'} />
		);
		expect(wrapper).toBeTruthy();
	});

	it('should shallow Tabs', () => {
		expect(wrapper.find('ScrollableTabView').length).toBe(1);
		const text = wrapper.find('ScrollableTabView');
		expect(text.props().tab).toEqual('Sensor Tab');
	});

});
