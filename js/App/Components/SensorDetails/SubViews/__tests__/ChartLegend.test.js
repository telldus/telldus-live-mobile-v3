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
} from '../../../../../Utils/jestUtils';

import ChartLegend from '../ChartLegend';
import {
	setAppLayout,
} from '../../../../Actions';
import Theme from '../../../../Theme';

let {height, width} = Dimensions.get('window');

const store = configureStore().store;

jest.useFakeTimers();


const onOp = () => {
};

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

const { brandDanger, brandInfo } = Theme.Core;

const colorsScatter = [brandDanger, brandInfo];

describe('<ChartLegend /> - snapshot', () => {
	it('renders ChartLegend when chart not fullscreen, both scales shown', () => {
		let component;
		const showOne = true;
		const showTwo = true;
		const legendData = [{
			...selectedOne,
			onPress: onOp,
			color: showOne ? colorsScatter[0] : Theme.Core.inactiveTintColor,
		},
		{
			...selectedTwo,
			onPress: onOp,
			color: showTwo ? colorsScatter[1] : Theme.Core.inactiveTintColor,
		}];
		act(() => {
			store.dispatch(setAppLayout({
				height,
				width,
			}));

			component = rendererWithIntlAndReduxProviders(
				<ChartLegend
					appLayout={{
						height,
						width,
					}}
					legendData={legendData}
					fullscreen={false}
					onPressResetChartView={onOp}
					onPressToggleView={onOp}/>
			);
		});

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});
	it('renders ChartLegend when chart fullscreen, scale one shown and scale two not shown', () => {
		let component;
		const showOne = true;
		const showTwo = false;
		const legendData = [{
			...selectedOne,
			onPress: onOp,
			color: showOne ? colorsScatter[0] : Theme.Core.inactiveTintColor,
		},
		{
			...selectedTwo,
			onPress: onOp,
			color: showTwo ? colorsScatter[1] : Theme.Core.inactiveTintColor,
		}];
		act(() => {
			store.dispatch(setAppLayout({
				height,
				width,
			}));

			component = rendererWithIntlAndReduxProviders(
				<ChartLegend
					appLayout={{
						height,
						width,
					}}
					legendData={legendData}
					fullscreen={true}
					onPressResetChartView={onOp}
					onPressToggleView={onOp}/>
			);
		});

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});
});
