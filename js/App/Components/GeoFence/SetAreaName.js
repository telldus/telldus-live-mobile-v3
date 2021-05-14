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
	useEffect,
	useState,
	useCallback,
} from 'react';
import {
	useDispatch,
} from 'react-redux';
import { useIntl } from 'react-intl';

import {
	View,
	MaterialTextInput,
	FloatingButton,
} from '../../../BaseComponents';

import {
	setFenceTitle,
} from '../../Actions/Fences';
import {
	useDialogueBox,
} from '../../Hooks/Dialoguebox';
import {
	useAppTheme,
} from '../../Hooks/Theme';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

type Props = {
	navigation: Object,
	appLayout: Object,
	onDidMount: (string, string, ?string) => void,
};

const SetAreaName = React.memo<Object>((props: Props): Object => {
	const {
		navigation,
		appLayout,
		onDidMount,
	} = props;

	const {
		colors,
	} = useAppTheme();
	const {
		baseColorFour,
	} = colors;

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	useEffect(() => {
		onDidMount(`2. ${formatMessage(i18n.name)}`, formatMessage(i18n.selectNameForArea));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const dispatch = useDispatch();
	const [ name, setName ] = useState('');

	const onPressNext = useCallback(() => {
		if (!name || name.trim() === '') {
			toggleDialogueBoxState({
				show: true,
				showHeader: true,
				imageHeader: true,
				text: formatMessage(i18n.errorNameFieldEmpty),
				showPositive: true,
			});
			return;
		}

		dispatch(setFenceTitle(name));
		navigation.navigate('ArrivingActions');
	}, [dispatch, formatMessage, name, navigation, toggleDialogueBoxState]);

	const {
		container,
		textField,
		containerStyleTF,
	} = getStyles({
		appLayout,
		colors,
	});

	const onChangeText = useCallback((value: string) => {
		setName(value);
	}, []);

	return (
		<View style={container}>
			<MaterialTextInput
				label={formatMessage(i18n.name)}
				containerStyle={containerStyleTF}
				style={textField}
				baseColor={baseColorFour}
				tintColor={baseColorFour}
				onChangeText={onChangeText}
				autoCapitalize="sentences"
				autoCorrect={false}
				autoFocus={true}
				value={name}/>
			<FloatingButton
				onPress={onPressNext}
				imageSource={{uri: 'right_arrow_key'}}/>
		</View>
	);
});

const getStyles = ({
	appLayout,
	colors,
}: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		rowTextColor,
		shadow,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const fontSize = deviceWidth * 0.045;

	return {
		container: {
			flex: 1,
		},
		containerStyleTF: {
			marginVertical: padding * 2,
			width: width - (padding * 2),
			marginHorizontal: padding,
			backgroundColor: colors.card,
			...shadow,
			paddingVertical: padding * 2,
			paddingHorizontal: padding,
			borderRadius: 2,
		},
		textField: {
			fontSize: fontSize * 1.3,
			color: rowTextColor,
		},
	};
};

export default (SetAreaName: Object);
