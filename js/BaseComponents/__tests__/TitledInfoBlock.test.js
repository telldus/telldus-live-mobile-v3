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
import {act} from 'react-test-renderer';

import {
	rendererWithIntlAndRedux,
} from '../../Utils/jestUtils';
import TitledInfoBlock from '../TitledInfoBlock';
import {
	setAppLayout,
} from '../../App/Actions';
import { configureStore } from '../../App/Store/ConfigureStore';

let {height, width} = Dimensions.get('window');

const store = configureStore().store;

const setLayout = () => {
	store.dispatch(setAppLayout({
		height,
		width,
	}));
};
const noOp = () => {};

describe('<TitledInfoBlock /> - snapshot', () => {

	it('renders TitledInfoBlock when enabled', () => {
		let component;
		act(() => {
			setLayout();
			component = rendererWithIntlAndRedux(
				<TitledInfoBlock
					label={'TitledInfoBlock'}
					value={'value'}
					icon={'angle-right'}
					onPress={noOp}/>
			);
		});

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it('renders TitledInfoBlock when disabled/no onPress', () => {
		let component;
		act(() => {
			setLayout();
			component = rendererWithIntlAndRedux(
				<TitledInfoBlock
					label={'TitledInfoBlock'}
					value={'value'}
					icon={'angle-right'}/>
			);
		});

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});

});
