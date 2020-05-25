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

import {
	changThemeInApp,
} from '../../../Actions';
import {
	colorShades,
} from '../../../Lib/appUtils';

import Theme from '../../../Theme';

type Props = {
};

const ThemesBlock = (props: Props): Object => {

	const intl = useIntl();

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
	} = getStyles(layout);

	const dispatch = useDispatch();

	const onValueChange = useCallback((value: string, itemIndex: number, data: Array<any>) => {
		const { key } = items[itemIndex];
		const settings = { themeInApp: key };
		dispatch(changThemeInApp(settings));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [items]);

	const renderItem = useCallback((data: Object): Object => {
		const {
			style = [],
			textStyle,
			item,
		} = data;

		const boxSize = textStyle.fontSize * 2;

		console.log('TEST data', data);
		return (
			<View style={[...style, {
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				width: '100%',
			}]}>
				<Text style={textStyle}>
					{item.value}
				</Text>
				<View style={{
					flex: 1,
					flexDirection: 'row',
					justifyContent: 'flex-end',
					alignItems: 'center',
				}}>
					{item.shades.map((s: string): Object => {
						return (
							<View style={{
								backgroundColor: s,
								height: boxSize,
								width: boxSize,
								borderRadius: 5,
								marginLeft: 5,
							}}/>
						);
					})
					}
				</View>
			</View>
		);
	}, []);

	return (
		<View style={coverStyle}>
			<Text style={labelStyle} numberOfLine={1}>
				Color shade
			</Text>
			<DropDown
				items={items}
				value={themeInApp}
				onValueChange={onValueChange}
				appLayout={layout}
				intl={intl}
				dropDownContainerStyle={dropDownContainerStyleDef}
				dropDownHeaderStyle={dropDownHeaderStyle}
				baseColor={'#000'}
				fontSize={fontSize}
				pickerContainerStyle={pickerContainerStyle}
				pickerBaseTextStyle={pickerBaseTextStyle}
				renderItem={renderItem}
			/>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const fontSize = Math.floor(deviceWidth * 0.045);

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
			backgroundColor: '#fff',
			marginBottom: padding / 2,
		},
		labelStyle: {
			flex: 0,
			color: '#000',
			fontSize,
			flexWrap: 'wrap',
			marginLeft: fontSize,
		},
	};
};

export default React.memo<Object>(ThemesBlock);
