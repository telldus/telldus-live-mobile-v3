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

import React from 'react';
import { TouchableOpacity } from 'react-native';

import View from './View';

import Theme from '../App/Theme';

const HeaderLeftButtonsMainTab = (props: Object): Object => {
	const {
		buttons,
		style: styleContainer,
	} = props;
	const items = React.useMemo((): Array<Object> => {
		return buttons.map((button: Object, i: number): Object => {
			const {
				style,
				accessibilityLabel,
				onPress,
				iconComponent,
			} = button;
			return (
				<TouchableOpacity
					key={`${i}`}
					onPress={onPress}
					accessibilityLabel={accessibilityLabel}
					style={[
						{
							backgroundColor: 'transparent',
						},
						style,
					]}
				>
					{iconComponent}
				</TouchableOpacity>
			);
		});
	}, [buttons]);

	return (
		<View style={[{
			position: 'absolute',
			left: 0,
			flexDirection: 'row',
			justifyContent: 'flex-start',
			alignItems: 'center',
			paddingTop: Theme.Core.navBarTopPadding,
		}, styleContainer]}>
			{items}
		</View>
	);
};

export default (React.memo<Object>(HeaderLeftButtonsMainTab): Object);
