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
	DropDown,
	View,
	Text,
} from '../../../../BaseComponents';

import {
	changThemeSetInApp,
} from '../../../Actions';
import {
	getThemeSetOptions,
} from '../../../Lib/appUtils';

import Theme from '../../../Theme';

type Props = {
};



const SelectThemeSetDD = (props: Props, ref: Object): Object => {

	const intl = useIntl();
	const ddRef = useRef(null);

	const options = getThemeSetOptions();

	const { layout, defaultSettings = {} } = useSelector((state: Object): Object => state.app);
	let { selectedThemeSet } = defaultSettings;
	selectedThemeSet = (selectedThemeSet && selectedThemeSet.key) ? selectedThemeSet : options[1];

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
		if (ddRef.current && ddRef.current.blur) {
			ddRef.current.blur();
		}
		const settings = { selectedThemeSet: data[itemIndex] };
		dispatch(changThemeSetInApp(settings));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ddRef]);

	return (
		<View
			level={2}
			style={coverStyle}>
			<Text
				level={3}
				style={labelStyle} numberOfLine={1}>
				Select theme set
			</Text>
			<DropDown
				ref={ddRef}
				dropDownPosition={'bottom'}
				items={options}
				value={selectedThemeSet.value}
				appLayout={layout}
				intl={intl}
				dropdownOffsetTopCount={2}
				dropDownContainerStyle={dropDownContainerStyleDef}
				dropDownHeaderStyle={dropDownHeaderStyle}
				fontSize={fontSize}
				pickerContainerStyle={pickerContainerStyle}
				pickerBaseTextStyle={pickerBaseTextStyle}
				onValueChange={onValueChange}/>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		subHeader,
		fontSizeFactorEight,
	} = Theme.Core;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);
	const padding = deviceWidth * paddingFactor;

	return {
		dropDownContainerStyleDef: {
			marginBottom: 0,
			flex: 1,
		},
		dropDownHeaderStyle: {
			fontSize: Math.floor(deviceWidth * fontSizeFactorEight),
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
			marginBottom: padding / 2,
		},
		labelStyle: {
			flex: 0,
			fontSize,
			flexWrap: 'wrap',
			marginLeft: fontSize,
		},
	};
};

export default (React.memo<Object>(forwardRef<Object, Object>(SelectThemeSetDD)): Object);
