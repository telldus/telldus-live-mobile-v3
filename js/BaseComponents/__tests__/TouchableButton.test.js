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
import TouchableButton from '../TouchableButton';
import {
	setAppLayout,
} from '../../App/Actions';
import { configureStore } from '../../App/Store/ConfigureStore';

let {height, width} = Dimensions.get('window');

const store = configureStore().store;

describe('<NavigationHeader /> - snapshot', () => {

	beforeAll(() => {
		store.dispatch(setAppLayout({
			height,
			width,
		}));
	});

	it('renders TouchableButton when enabled', () => {
		let component;
		act(() => {
			component = rendererWithIntlAndRedux(
				<TouchableButton
					text={'TouchableButton'}/>
			);
		});

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it('renders TouchableButton when disabled', () => {
		let component;
		act(() => {
			component = rendererWithIntlAndRedux(
				<TouchableButton
					disabled
					text={'TouchableButton'}/>
			);
		});

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it('renders TouchableButton when enabled and loading', () => {
		let component;
		act(() => {
			component = rendererWithIntlAndRedux(
				<TouchableButton
					text={'TouchableButton'}
					showThrobber={true}/>
			);
		});

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it('renders TouchableButton when disabled and loading', () => {
		let component;
		act(() => {
			component = rendererWithIntlAndRedux(
				<TouchableButton
					disabled
					text={'TouchableButton'}
					showThrobber={true}/>
			);
		});

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});

});
