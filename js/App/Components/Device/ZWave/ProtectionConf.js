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
	useState,
	useCallback,
} from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import {
	Text,
	View,
	DropDown,
} from '../../../../BaseComponents';
import Theme from '../../../Theme';

type Props = {
    queue: number | string,
    state: number,
    version: number,
    supportLocalProtection: number,
    supportRFProtection: number,
	rfQueue: number,
	rfState: number,
};

const prepareProtectionOptionsAndValue = ({
	version,
	supportLocalProtection,
	queue,
	state,
}: Object): Object => {
	let key = typeof queue === 'number' ? queue : state;
	let value = {
		key,
		value: (key === 1) ? 'Protected by sequence' : (key === 2 ? 'No local operation possible' : 'Unprotected'),
	};

	let options = [{key: '0', value: 'Unprotected'}];
	// eslint-disable-next-line no-bitwise
	if (version === 1 || supportLocalProtection & 0x2) {
		options.push({
			key: '1',
			value: 'Protected by sequence',
		});
	}
	// eslint-disable-next-line no-bitwise
	if (version === 1 || supportLocalProtection & 0x4) {
		options.push({
			key: '2',
			value: 'No local operation possible',
		});
	}
	return {
		options,
		value,
	};
};

const prepareRFProtectionOptionsAndValue = ({
	version,
	supportRFProtection,
	rfQueue,
	rfState,
	queue,
}: Object): Object => {
	let key = typeof queue === 'number' ? rfQueue : rfState;
	let valueRF = {
		key,
		value: (key === 1) ? 'No RF control' : (key === 2 ? 'No RF control nor RF response' : 'Unprotected'),
	};

	let optionsRF = [{key: '0', value: 'Unprotected'}];
	// eslint-disable-next-line no-bitwise
	if (supportRFProtection & 0x2) {
		optionsRF.push({
			key: '1',
			value: 'No RF control',
		});
	}
	// eslint-disable-next-line no-bitwise
	if (supportRFProtection & 0x4) {
		optionsRF.push({
			key: '2',
			value: 'No RF control nor RF response',
		});
	}
	return {
		optionsRF,
		valueRF,
	};
};

const ProtectionConf = (props: Props): Object => {
	const {
		options,
		value,
	} = prepareProtectionOptionsAndValue(props);

	const {
		optionsRF,
		valueRF,
	} = prepareRFProtectionOptionsAndValue(props);

	const [
		selectedState,
		setSelectedState,
	] = useState(value);
	const [
		selectedStateRF,
		setSelectedStateRF,
	] = useState(valueRF);

	const { layout } = useSelector((s: Object): Object => s.app);
	const {
		verticalCover,
		coverStyle,
		subTitleTextStyle,
		hItemLabelDef,
		dropDownContainerStyle,
		dropDownHeaderStyle,
		fontSize,
		pickerContainerStyle,
		pickerBaseTextStyle,
		pickerBaseCoverStyle,
		horizontalCoverStyle,
	} = getStyles(layout);

	const saveProtection = useCallback((v: string, itemIndex: number, data: Array<any>) => {
		setSelectedState(data[itemIndex]);
	}, []);

	const saveProtectionRF = useCallback((v: string, itemIndex: number, data: Array<any>) => {
		setSelectedStateRF(data[itemIndex]);
	}, []);

	const intl = useIntl();

	return (
		<View
			style={verticalCover}>
			<Text
				level={2}
				style={subTitleTextStyle}>
                Protection
			</Text>
			<View
				level={2}
				style={horizontalCoverStyle}>
				<View
					style={coverStyle}>
					<Text
						level={3}
						style={hItemLabelDef}>
						{'State: '}
					</Text>
					<DropDown
						items={options}
						value={selectedState.value}
						onValueChange={saveProtection}
						appLayout={layout}
						intl={intl}
						dropDownContainerStyle={dropDownContainerStyle}
						dropDownHeaderStyle={dropDownHeaderStyle}
						fontSize={fontSize}
						pickerContainerStyle={pickerContainerStyle}
						pickerBaseCoverStyle={pickerBaseCoverStyle}
						pickerBaseTextStyle={pickerBaseTextStyle}/>
				</View>
				<DropDown
					items={optionsRF}
					value={selectedStateRF.value}
					onValueChange={saveProtectionRF}
					appLayout={layout}
					intl={intl}
					dropDownContainerStyle={dropDownContainerStyle}
					dropDownHeaderStyle={dropDownHeaderStyle}
					fontSize={fontSize}
					pickerContainerStyle={[pickerContainerStyle, {
						marginTop: 5,
					}]}
					pickerBaseCoverStyle={pickerBaseCoverStyle}
					pickerBaseTextStyle={pickerBaseTextStyle}/>
			</View>
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
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const fontSize = Math.floor(deviceWidth * 0.045);

	return {
		fontSize,
		horizontalCoverStyle: {
			...shadow,
			marginTop: 2,
			marginHorizontal: padding,
			borderRadius: 2,
			padding,
		},
		coverStyle: {
			justifyContent: 'space-between',
			flexDirection: 'row',
			alignItems: 'center',
		},
		verticalCover: {
		},
		subTitleTextStyle: {
			fontSize: fontSize * 1.1,
			marginLeft: padding,
			marginTop: 8,
			marginBottom: 5,
		},
		hItemLabelDef: {
			fontSize,
		},
		dropDownContainerStyle: {
			flex: 1,
		},
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
		pickerBaseCoverStyle: {
			padding: padding / 2,
		},
		pickerBaseTextStyle: {
			textAlign: 'right',
		},
	};
};

export default memo<Object>(ProtectionConf);
