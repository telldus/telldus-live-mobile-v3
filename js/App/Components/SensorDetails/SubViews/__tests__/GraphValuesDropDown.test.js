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
import { configureStore } from '../../../../Store/ConfigureStore';
import {act} from 'react-test-renderer';

import {
	rendererWithIntlAndReduxProviders,
	withIntlHOC,
} from '../../../../../Utils/jestUtils';

import GraphValuesDropDown from '../GraphValuesDropDown';
import {
	setAppLayout,
} from '../../../../Actions';

let {height, width} = Dimensions.get('window');

const store = configureStore().store;

jest.useFakeTimers();

const selectedOne = {
	type: 'selectedOneTpe',
	scale: 'selectedOneScale',
	value: 'selectedOneValue',
	icon: 'selectedOneIcon',
};

const selectedTwo = {
	type: 'selectedTwoTpe',
	scale: 'selectedTwoScale',
	value: 'selectedTwoValue',
	icon: 'selectedTwoIcon',
};

const selectedThree = {
	type: 'selectedThreeTpe',
	scale: 'selectedThreeScale',
	value: 'selectedThreeValue',
	icon: 'selectedThreeIcon',
};

const selectedFour = {
	type: 'selectedFourTpe',
	scale: 'selectedFourScale',
	value: 'selectedFourValue',
	icon: 'selectedFourIcon',
};

const onOp = () => {
};

describe('<GraphValuesDropDown /> - snapshot', () => {
	it('renders GraphValuesDropDown when list length is 2', () => {
		let component;
		act(() => {
			const list = [
				selectedOne,
				selectedTwo,
			];
			store.dispatch(setAppLayout({
				height,
				width,
			}));

			const WithIntl = withIntlHOC(<GraphValuesDropDown
				selectedOne={selectedOne}
				selectedTwo={selectedTwo}
				list={list}
				onValueChangeOne={onOp}
				onValueChangeTwo={onOp}
				appLayout={{
					height,
					width,
				}}/>);

			component = rendererWithIntlAndReduxProviders(<WithIntl/>);
		});

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it('renders GraphValuesDropDown when list length is > 2', () => {
		let component;
		act(() => {
			const list = [
				selectedOne,
				selectedTwo,
				selectedThree,
				selectedFour,
			];
			store.dispatch(setAppLayout({
				height,
				width,
			}));

			const WithIntl = withIntlHOC(<GraphValuesDropDown
				selectedOne={selectedOne}
				selectedTwo={selectedTwo}
				list={list}
				onValueChangeOne={onOp}
				onValueChangeTwo={onOp}
				appLayout={{
					height,
					width,
				}}/>);

			component = rendererWithIntlAndReduxProviders(<WithIntl/>);
		});

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});
});
