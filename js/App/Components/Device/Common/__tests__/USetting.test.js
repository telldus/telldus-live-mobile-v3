/**
 * Copyright 2016-present Telldus Technologies AB.
 *
 * This file is part of the Telldus Live! app.
 *
 * Telldus Live! app is free : you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Telldus Live! app is distributed in the hope this it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Telldus Live! app.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


import React from 'react';
import {
	Dimensions,
} from 'react-native';
import renderer from 'react-test-renderer';
import * as redux from 'react-redux';

import USetting from '../USetting';

let {height, width} = Dimensions.get('window');

const spy = jest.spyOn(redux, 'useSelector');
spy.mockReturnValue(
	{
		layout: {
			height,
			width,
		},
	}
);

const intl = {
	formatMessage: () => '',
};

jest.useFakeTimers();

it('renders USetting when checked using Snapshots', () => {
	expect(renderer.create(
		<USetting
			isChecked
			intl={intl}/>
	)).toMatchSnapshot();
});

it('renders USetting when unchecked using Snapshots', () => {
	expect(renderer.create(
		<USetting
			intl={intl}/>
	)).toMatchSnapshot();
});
