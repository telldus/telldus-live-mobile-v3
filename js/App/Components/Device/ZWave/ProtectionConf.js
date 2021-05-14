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
	useEffect,
} from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import {
	LayoutAnimation,
} from 'react-native';

import {
	Text,
	View,
	DropDown,
} from '../../../../BaseComponents';
import LayoutAnimations from '../../../Lib/LayoutAnimations';
import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

type Props = {
    queue: number | string,
    state: number,
    version: number,
    supportLocalProtection: number,
    supportRFProtection: number,
	rfQueue: number,
	rfState: number,
	onChangeValue: Function,
};

const prepareProtectionOptionsAndValue = ({
	version,
	supportLocalProtection,
	queue,
	state,
}: Object, {
	formatMessage,
}: Object): Object => {
	let key = typeof queue === 'number' ? queue : state;
	let value = {
		key,
		value: (key === 1) ? formatMessage(i18n.protectedBySeq) : (key === 2 ? formatMessage(i18n.nOLocalOpertnPoss) : formatMessage(i18n.unprotected)),
	};

	let options = [{key: '0', value: formatMessage(i18n.unprotected)}];
	// eslint-disable-next-line no-bitwise
	if (version === 1 || supportLocalProtection & 0x2) {
		options.push({
			key: '1',
			value: formatMessage(i18n.protectedBySeq),
		});
	}
	// eslint-disable-next-line no-bitwise
	if (version === 1 || supportLocalProtection & 0x4) {
		options.push({
			key: '2',
			value: formatMessage(i18n.nOLocalOpertnPoss),
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
}: Object, {
	formatMessage,
}: Object): Object => {
	let key = typeof queue === 'number' ? rfQueue : rfState;
	let valueRF = {
		key,
		value: (key === 1) ? formatMessage(i18n.noRFCon) : (key === 2 ? formatMessage(i18n.noRFConNoRFRes) : formatMessage(i18n.unprotected)),
	};

	let optionsRF = [{key: '0', value: formatMessage(i18n.unprotected)}];
	// eslint-disable-next-line no-bitwise
	if (supportRFProtection & 0x2) {
		optionsRF.push({
			key: '1',
			value: formatMessage(i18n.noRFCon),
		});
	}
	// eslint-disable-next-line no-bitwise
	if (supportRFProtection & 0x4) {
		optionsRF.push({
			key: '2',
			value: formatMessage(i18n.noRFConNoRFRes),
		});
	}
	return {
		optionsRF,
		valueRF,
	};
};

const ProtectionConf = (props: Props): Object => {
	const {
		onChangeValue,
	} = props;

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	const {
		options,
		value,
	} = prepareProtectionOptionsAndValue(props, {
		formatMessage,
	});

	const {
		optionsRF,
		valueRF,
	} = prepareRFProtectionOptionsAndValue(props, {
		formatMessage,
	});

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

	useEffect(() => {
		const f1 = parseInt(value.key, 10) === parseInt(selectedState.key, 10);
		const f2 = parseInt(valueRF.key, 10) === parseInt(selectedStateRF.key, 10);
		if (f1 || f2) {
			let protect = f1 ? value : selectedState;
			let protectRF = f2 ? valueRF : selectedStateRF;
			setSelectedStateRF(valueRF);
			onChangeValue({
				'localProtection': protect.key,
				'rfProtection': protectRF.key,
				hasChanged: !f1 || !f2,
			});
			LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onChangeValue, selectedState.key, selectedStateRF.key, value.key, valueRF.key]);

	const saveProtection = useCallback((v: string, itemIndex: number, data: Array<any>) => {
		setSelectedState(data[itemIndex]);
		onChangeValue({
			'localProtection': data[itemIndex].key,
			hasChanged: parseInt(data[itemIndex].key, 10) !== parseInt(value.key, 10) || parseInt(valueRF.key, 10) !== parseInt(selectedStateRF.key, 10),
		});
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
	}, [onChangeValue, selectedStateRF.key, value.key, valueRF.key]);

	const saveProtectionRF = useCallback((v: string, itemIndex: number, data: Array<any>) => {
		setSelectedStateRF(data[itemIndex]);
		onChangeValue({
			'rfProtection': data[itemIndex].key,
			hasChanged: parseInt(data[itemIndex].key, 10) !== parseInt(valueRF.key, 10) || parseInt(value.key, 10) !== parseInt(selectedState.key, 10),
		});
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
	}, [onChangeValue, selectedState.key, value.key, valueRF.key]);

	return (
		<View
			style={verticalCover}>
			<Text
				level={2}
				style={subTitleTextStyle}>
				{formatMessage(i18n.protection)}
			</Text>
			<View
				level={2}
				style={horizontalCoverStyle}>
				<View
					style={coverStyle}>
					<Text
						level={3}
						style={hItemLabelDef}>
						{`${formatMessage(i18n.state)}: `}
					</Text>
					{!!options && options.length > 1 && (<DropDown
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
					)}
				</View>
			</View>
			<Text
				level={2}
				style={subTitleTextStyle}>
				{formatMessage(i18n.rfProtection)}
			</Text>
			<View
				level={2}
				style={horizontalCoverStyle}>
				<View
					style={coverStyle}>
					<Text
						level={3}
						style={hItemLabelDef}>
						{`${formatMessage(i18n.state)}: `}
					</Text>
					{!!optionsRF && optionsRF.length > 1 && (
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
					)}
				</View>
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
		fontSizeFactorEight,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);

	return {
		fontSize,
		horizontalCoverStyle: {
			...shadow,
			marginTop: 2,
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

export default (memo<Object>(ProtectionConf): Object);
