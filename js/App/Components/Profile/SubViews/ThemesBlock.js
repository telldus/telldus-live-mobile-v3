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
	useCallback,
	useRef,
	forwardRef,
} from 'react';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import { useIntl } from 'react-intl';
import {
	useColorScheme,
} from 'react-native';

import {
	DropDown,
	View,
	Text,
} from '../../../../BaseComponents';
import ThemesRow from './ThemesRow';

import {
	changThemeInApp,
} from '../../../Actions';
import {
	colorShades,
} from '../../../Lib/appUtils';
import {
	useAppTheme,
} from '../../../Hooks/Theme';

import Theme from '../../../Theme';

type Props = {
};

const ThemesBlock = (props: Props, ref: Object): Object => {

	const intl = useIntl();
	const ddRef = useRef(null);

	const {
		colors,
	} = useAppTheme();

	const colorScheme = useColorScheme();
	const items = colorShades(colorScheme);

	const { layout, defaultSettings = {} } = useSelector((state: Object): Object => state.app);
	const { themeInApp = items[0].value } = defaultSettings;

	const {
		dropDownContainerStyleDef,
		dropDownHeaderStyle,
		fontSize,
		pickerContainerStyle,
		coverStyle,
		labelStyle,
		pickerBaseTextStyle,
	} = getStyles(layout, {
		colors,
	});

	const dispatch = useDispatch();
	const onValueChange = useCallback((item: Object) => {
		if (ddRef.current && ddRef.current.blur) {
			ddRef.current.blur();
		}
		const { value } = item;
		const settings = { themeInApp: value };
		dispatch(changThemeInApp(settings));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ddRef]);

	const renderItem = useCallback((data: Object): Object => {
		const {
			style = [],
			textStyle,
			item,
		} = data;

		const boxSize = textStyle.fontSize * 2;

		return (
			<ThemesRow
				onValueChange={onValueChange}
				selected={themeInApp}
				key={item.value}
				style={style}
				item={item}
				boxSize={boxSize}
				textStyle={{
					...textStyle,
					color: themeInApp === item.value ? colors.inActiveTintOne : colors.textThree,
				}}
				backgroundColor={colors.card}
			/>
		);
	}, [colors.card, colors.inActiveTintOne, colors.textThree, onValueChange, themeInApp]);

	return (
		<View style={coverStyle}>
			<Text style={labelStyle} numberOfLine={1}>
				Select theme
			</Text>
			<DropDown
				ref={ddRef}
				dropDownPosition={'bottom'}
				items={items}
				value={themeInApp}
				appLayout={layout}
				intl={intl}
				dropDownContainerStyle={dropDownContainerStyleDef}
				dropDownHeaderStyle={dropDownHeaderStyle}
				baseColor={colors.textThree}
				fontSize={fontSize}
				pickerContainerStyle={pickerContainerStyle}
				pickerBaseTextStyle={pickerBaseTextStyle}
				renderItem={renderItem}/>
		</View>
	);
};

const getStyles = (appLayout: Object, {
	colors,
}: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const fontSize = Math.floor(deviceWidth * 0.045);

	const {
		card,
		textThree,
	} = colors;

	const {
		paddingFactor,
		shadow,
		subHeader,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		dropDownContainerStyleDef: {
			marginBottom: 0,
			flex: 1,
		},
		dropDownHeaderStyle: {
			fontSize: Math.floor(deviceWidth * 0.045),
			color: subHeader,
		},
		fontSize,
		pickerContainerStyle: {
			elevation: 0,
			shadowColor: 'transparent',
			backgroundColor: 'transparent',
			shadowRadius: 0,
			shadowOpacity: 0,
			shadowOffset: {
				width: 0,
				height: 0,
			},
			marginBottom: 0,
		},
		pickerBaseTextStyle: {
			textAlign: 'right',
		},
		coverStyle: {
			flexDirection: 'row',
			alignItems: 'center',
			width: width - (padding * 2),
			justifyContent: 'space-between',
			...shadow,
			backgroundColor: card,
			marginBottom: padding / 2,
		},
		labelStyle: {
			flex: 0,
			color: textThree,
			fontSize,
			flexWrap: 'wrap',
			marginLeft: fontSize,
		},
	};
};

export default React.memo<Object>(forwardRef<Object, Object>(ThemesBlock));
