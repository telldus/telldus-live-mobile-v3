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
 * Telldus Live! app is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Telldus Live! app.  If not, see <http://www.gnu.org/licenses/>.
 */

// @flow

'use strict';

import React, { useEffect } from 'react';
import Actions from './Actions';

type Props = {
	navigation: Object,
	appLayout: Object,
	onDidMount: (string, string, ?string) => void,
	isEditMode: () => boolean,
};

const ArrivingActions = (props: Props): Object => {
	const {
		navigation,
		onDidMount,
		isEditMode,
	} = props;

	const isEdit = isEditMode();

	useEffect(() => {
		const h = 'Arriving actions';
		const h1 = `${isEdit ? h : `2. ${h}`}`;
		onDidMount(h1, 'Select actions for when you arrive');
	}, []);

	function onPressNext() {
		if (isEdit) {
			navigation.goBack();
		} else {
			navigation.navigate({
				routeName: 'LeavingActions',
				key: 'LeavingActions',
			});
		}
	}

	return (
		<Actions
			navigation={navigation}
			onPressNext={onPressNext}
			iconName={isEdit ? 'checkmark' : undefined}
			currentScreen={'ArrivingActions'}
			imageSource={isEdit ? undefined : {uri: 'right_arrow_key'}}/>
	);
};

export default ArrivingActions;
