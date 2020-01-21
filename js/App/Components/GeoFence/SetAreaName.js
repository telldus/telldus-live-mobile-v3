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

import React, { useEffect, useState } from 'react';
import {
	View,
	MaterialTextInput,
	FloatingButton,
} from '../../../BaseComponents';

import Theme from '../../Theme';

type Props = {
	navigation: Object,
	appLayout: Object,
	onDidMount: (string, string, ?string) => void,
};

const SetAreaName = (props: Props): Object => {
	const {
		navigation,
		appLayout,
		onDidMount,
	} = props;

	useEffect(() => {
		onDidMount('5. Name', 'Select a name for your area');
	}, []);

	function onPressNext() {
		navigation.navigate({
			routeName: 'AddEditGeoFence',
			key: 'AddEditGeoFence',
		});
	}

	const {
		container,
		textField,
		containerStyleTF,
		brandSecondary,
		iconStyle,
	} = getStyles(appLayout);

	const [ name, setName ] = useState('');
	function onChangeText(value: string) {
		setName(value);
	}

	return (
		<View style={container}>
			<MaterialTextInput
				label={'Name'}
				containerStyle={containerStyleTF}
				style={textField}
				baseColor={brandSecondary}
				tintColor={brandSecondary}
				onChangeText={onChangeText}
				autoCapitalize="characters"
				autoCorrect={false}
				autoFocus={true}
				value={name}/>
			<FloatingButton
				onPress={onPressNext}
				iconName={'checkmark'}
				iconStyle={iconStyle}/>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		rowTextColor,
		brandSecondary,
		shadow,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const fontSize = deviceWidth * 0.045;

	return {
		brandSecondary,
		container: {
			flex: 1,
		},
		containerStyleTF: {
			marginVertical: padding * 2,
			width: width - (padding * 2),
			marginHorizontal: padding,
			backgroundColor: '#fff',
			...shadow,
			paddingVertical: padding * 2,
			paddingHorizontal: padding,
			borderRadius: 2,
		},
		textField: {
			fontSize: fontSize * 1.3,
			color: rowTextColor,
		},
		iconStyle: {
			color: '#fff',
		},
	};
};

export default SetAreaName;
