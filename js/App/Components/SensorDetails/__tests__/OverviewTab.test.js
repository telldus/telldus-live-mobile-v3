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

import { configureStore } from '../../../Store/ConfigureStore';
import {
	rendererWithIntlAndReduxProviders,
	DUMMY_SENSOR,
	withScreenPropsHOC,
	DUMMY_CLIENT,
} from '../../../../Utils/jestUtils';

import OverviewTab from '../OverviewTab';
import {
	setAppLayout,
	onReceivedSensors,
} from '../../../Actions';

let {height, width} = Dimensions.get('window');

const store = configureStore().store;

jest.useFakeTimers();


const onOp = () => {
};

describe('<OverviewTab /> - snapshot', () => {
	it('renders Sensor OverviewTab', () => {
		let component;
		act(() => {
			store.dispatch(setAppLayout({
				height,
				width,
			}));

			const sensors = {
				sensor: [
					DUMMY_SENSOR,
				],
			};
			const clients = {
				client: [
					DUMMY_CLIENT,
				],
			};
			store.dispatch(onReceivedSensors(sensors));
			store.dispatch({
				type: 'RECEIVED_GATEWAYS',
				payload: clients,
			});

			const WithIntl = withScreenPropsHOC(
				<OverviewTab
					dispatch={onOp}
					route={{params: {
						id: DUMMY_SENSOR.id,
					}}}
					currentScreen={'SOverview'}
					getSensorInfo={onOp}/>
			);

			component = rendererWithIntlAndReduxProviders(
				<WithIntl/>
			);
		});

		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});
});
