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
import React, {
	memo,
	useCallback,
} from 'react';
import {
	// donateShortcut,
	// clearAllShortcuts,
	// clearShortcutsWithIdentifiers,
	presentShortcut,
} from 'react-native-siri-shortcut';
import AddToSiriButton, {
	SiriButtonStyles,
	supportsSiriButton,
} from 'react-native-siri-shortcut/AddToSiriButton';
import { useSelector } from 'react-redux';

import {
	View,
	NavigationHeaderPoster,
	ThemedScrollView,
} from '../../../BaseComponents';
import {
	useAppTheme,
} from '../../Hooks/Theme';
import {
	IOS_SHORTCUT_DEVICE_ACTION_ACTIVITY_TYPE,
} from '../../../Constants';

import Theme from '../../Theme';

type Props = {
    navigation: Object,
	screenProps: Object,
	route: Object,
};

const SiriShortcutActions = memo<Object>((props: Props): Object => {
	const {
		navigation,
		screenProps,
		route = {},
	} = props;
	const {
		params = {},
	} = route;
	const {
		device,
	} = params;
	const {
		name,
		id,
	} = device || {};
	const {
		dark,
	} = useAppTheme();
	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		container,
		contentContainerStyle,
		buttonTextStyle,
	} = getStyles({
		layout,
	});

	const onPressAddToSiri = useCallback(() => {
		console.log('TEST IN');
		presentShortcut(
			({
				activityType: `${IOS_SHORTCUT_DEVICE_ACTION_ACTIVITY_TYPE}-${id}`,
				title: `Peform action on ${name}`,
			}),
			(callbackData: Object) => {
				console.log('TEST IN callbackData', callbackData);
			}
		);
	}, [id, name]);

	return (
		<View
			level={3}
			style={container}>
			<NavigationHeaderPoster
				h1={'Siri shortcuts'} // TODO: Translate
				h2={'Add or delete shortcuts'}
				align={'left'}
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}
				{...screenProps}/>
			<ThemedScrollView
				style={{flex: 1}}
				level={3}
				contentContainerStyle={contentContainerStyle}>
				{supportsSiriButton && (
					<AddToSiriButton
						style={buttonTextStyle}
						buttonStyle={dark ? SiriButtonStyles.white : SiriButtonStyles.black}
						onPress={onPressAddToSiri}/>
				)}
			</ThemedScrollView>
		</View>
	);
});


const getStyles = ({
	layout,
}: Object): Object => {
	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const padding = deviceWidth * Theme.Core.paddingFactor;

	// const fontSize = Math.floor(deviceWidth * 0.036);

	return {
		container: {
			flex: 1,
		},
		contentContainerStyle: {
			flexGrow: 1,
			padding,
			alignItems: 'center',
		},
		buttonTextStyle: {
			flex: 1,
		},
	};
};

export default SiriShortcutActions;
