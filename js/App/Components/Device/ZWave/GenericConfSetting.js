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
 *
 */

// @flow

'use strict';

import React, {
	memo,
	useCallback,
	useState,
	useEffect,
} from 'react';
import {
	useSelector,
} from 'react-redux';
import {
	Platform,
	KeyboardAvoidingView,
	LayoutAnimation,
} from 'react-native';

import {
	ThemedTextInput,
} from '../../../../BaseComponents';

import {
	useAppTheme,
} from '../../../Hooks/Theme';
import {
	useDialogueBox,
} from '../../../Hooks/Dialoguebox';
import LayoutAnimations from '../../../Lib/LayoutAnimations';
import Theme from '../../../Theme';

const GenericConfSetting = (props: Object): Object => {
	const {
		defaultValue,
		min,
		max,
		onChangeValue,
		Size,
		ParameterNumber,
	} = props;

	const [ value, setValue ] = useState(defaultValue);

	const {
		colors,
	} = useAppTheme();
	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		textFieldStyle,
	} = getStyles({
		layout,
		colors,
	});

	useEffect(() => {
		if (defaultValue === value) {
			onChangeValue({
				number: ParameterNumber,
				value: defaultValue,
				size: Size,
				hasChanged: false,
			});
			setValue(defaultValue);
			LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		}
	}, [ParameterNumber, Size, defaultValue, onChangeValue, value]);

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	const _onChangeText = useCallback((v: string) => {
		if (!v || !isNaN(parseInt(v, 10))) {
			onChangeValue({
				number: ParameterNumber,
				value: v,
				size: Size,
				hasChanged: v !== defaultValue,
			});
			setValue(v);
		}
	}, [onChangeValue, ParameterNumber, Size, defaultValue]);

	const _onSubmitEditing = useCallback(() => {
		let asNum = parseInt(value, 10);
		if (isNaN(asNum) || asNum > max || asNum < min) {
			toggleDialogueBoxState({
				show: true,
				showHeader: true,
				imageHeader: true,
				text: `Please set value between: ${min}-${max}`, // TODO: Translate
				showPositive: true,
			});
			return;
		}
	}, [value, max, min, toggleDialogueBoxState]);

	return (
		<KeyboardAvoidingView
			style={{flex: 1}}>
			<ThemedTextInput
				level={23}
				value={value}
				style={textFieldStyle}
				onChangeText={_onChangeText}
				onSubmitEditing={_onSubmitEditing}
				autoCorrect={false}
				autoFocus={false}
				returnKeyType={'done'}
				keyboardType={Platform.OS === 'ios' ? 'phone-pad' : 'decimal-pad'}
			/>
		</KeyboardAvoidingView>
	);
};

const getStyles = ({
	layout,
	colors,
}: Object): Object => {
	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const {
		fontSizeFactorEight,
	} = Theme.Core;
	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);

	return {
		textFieldStyle: {
			width: '100%',
			paddingBottom: 0,
			paddingTop: 0,
			fontSize,
			textAlign: 'right',
			borderBottomWidth: 1,
			borderBottomColor: colors.inAppBrandSecondary,
		},
	};
};

export default memo<Object>(GenericConfSetting);
