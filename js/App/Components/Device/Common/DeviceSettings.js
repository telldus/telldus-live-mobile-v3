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

import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
const isEqual = require('react-fast-compare');
import {
	Keyboard,
} from 'react-native';

import {
	View,
	Text,
	EmptyView,
} from '../../../../BaseComponents';
import VSetting from './VSetting';
import USetting from './USetting';
import SSetting from './SSetting';
import DropDownSetting from './DropDownSetting';
import FadeSetting from './FadeSetting';
import InputSetting from './InputSetting';
import ScanButton from './ScanButton';

import {
	setWidgetParamFade,
	setWidgetParamSystem,
	setWidgetParamCode,
	setWidgetParamUnits,
	setWidgetParamUnit,
	setWidgetParamHouse,
	toggleStatusUpdatedViaScan433MHZ,
	setWidgetParamsValue,
} from '../../../Actions/AddDevice';
import {
	prepare433DeviceParamsToStore,
} from '../../../Lib';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	settings: Object,
	coverStyle?: Array<any> | Object,
	labelStyle?: Array<any> | Object,
	widgetId?: string | null,
	deviceId?: string,
	initializeValueFromStore?: boolean,
	showScan?: boolean,
	clientId?: string,
	learnButton?: Object,
	isSaving433MhzParams?: boolean,
	devicetype: string,
	renderExtraSettingsTop?: Function,
	hideHeader?: boolean,
};

const DeviceSettings = React.memo<Object>((props: Props): Object => {
	const inputRefSystem = useRef(null);
	const inputRefHouse = useRef(null);
	const inputRefUnit = useRef(null);

	const {
		settings,
		coverStyle,
		labelStyle,
		widgetId, // Optional
		deviceId, // Optional
		initializeValueFromStore = false, // Optional
		showScan = false,
		clientId,
		learnButton,
		isSaving433MhzParams = false,
		devicetype,
		renderExtraSettingsTop,
		hideHeader = false,
	} = props;

	function _keyboardDidHide() {
		const refs = [inputRefSystem, inputRefHouse, inputRefUnit];
		refs.forEach((ref: Object) => {
			if (ref && ref.current && ref.current.blur) {
				ref.current.blur();
			}
		});
	}

	useEffect((): Function => {
		const keyboardDidHideListener = Keyboard.addListener(
			'keyboardDidHide',
			_keyboardDidHide,
		  );
		return () => {
			keyboardDidHideListener.remove();
		};
	}, []);

	const dispatch = useDispatch();

	const intl = useIntl();
	const { formatMessage } = intl;

	const { layout } = useSelector((state: Object): Object => state.app);
	const { addDevice433 = {} } = useSelector((state: Object): Object => state.addDevice);
	const {
		widgetParams433Device = {},
		isScanning = false,
		paramUpdatedViaScan = false,
	} = addDevice433;
	const {
		system = 'null',
		house = 'null',
		unit = 'null',
		fade,
		units = {},
		code = {},
		deviceId: deviceIdToWhichSettingsBelong,
	} = widgetParams433Device;

	const editingDevice = useSelector((state: Object): Object => state.devices.byId[deviceId]);
	let DeviceParams433 = {};
	if (initializeValueFromStore && editingDevice) {
		const { parameter } = editingDevice;
		DeviceParams433 = prepare433DeviceParamsToStore(parseInt(widgetId, 10), parameter) || {};
	}
	let {
		system: currSystem,
		house: currHouse,
		unit: currUnit,
		fade: currFade,
		units: currUnits,
		code: currCode,
	} = DeviceParams433 || {};

	useEffect(() => {
		// Reset reducer addDevice.addDevice433.widgetParams433Device once before editing.
		if (deviceId && initializeValueFromStore) {
			const {
				model,
				protocol,
			} = editingDevice;
			dispatch(setWidgetParamsValue({
				id: widgetId,
				deviceId,
				edit: true,
				...DeviceParams433,
				model,
				protocol,
			}));
		}
		dispatch(toggleStatusUpdatedViaScan433MHZ(false));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (deviceId && deviceId !== deviceIdToWhichSettingsBelong) {
		return <EmptyView/>;
	}

	const {
		coverStyleDef,
		radioButtonsCover,
		optionInputCover,
		optionInputLabelStyle,
		fadeSettingsCover,
		uSettingsCover,
		titleStyle,
		scanLearnCover,
	} = getStyles(layout);

	let Setting = [];
	Object.keys(settings).map((setting: Object) => {

		if (setting === 'system') {
			const {
				min,
				max,
			} = settings[setting];

			function onChangeText(value: string): any {

				if (!value || value === '') {
					dispatch(setWidgetParamSystem(''));
					return;
				}

				let newValue = parseInt(value, 10);
				if (isNaN(newValue)) {
					dispatch(setWidgetParamSystem(system));
					return;
				}

				let acceptValue = (newValue <= max) && (newValue >= min);
				if (!acceptValue) {
					dispatch(setWidgetParamSystem(system));
					return;
				}

				dispatch(setWidgetParamSystem(newValue.toString()));
			}

			Setting.push(
				<InputSetting
					ref={inputRefSystem}
					key={setting}
					label={formatMessage(i18n.system)}
					value={system}
					textOnPressHelp={formatMessage(i18n.infoAddDevice433Settings)}
					headerOnPressHelp={formatMessage(i18n.system)}
					onChangeText={onChangeText}
					labelStyle={labelStyle}
					paramUpdatedViaScan={paramUpdatedViaScan}
					isCodeEqual={isEqual(system, currSystem)}
					isScanning={isScanning}
					isSaving433MhzParams={isSaving433MhzParams}/>
			);
		}
		if (setting === 'v') {

			const vSetting = Object.keys(settings[setting]).map((vSet: string, index: number): Object => {
				const { option } = settings[setting][vSet];

				function onPressOne() {
					let next = {
						...code,
					};
					next[vSet] = 1;
					dispatch(setWidgetParamCode(next));
				}
				function onPressTwo() {
					let next = {
						...code,
					};
					next[vSet] = 0;
					dispatch(setWidgetParamCode(next));
				}

				const isOneSelected = code[vSet] === 1 || false;

				return (
					<VSetting
						key={vSet}
						option={option}
						isOneSelected={isOneSelected}
						isTwoSelected={!isOneSelected}
						value={vSet}
						index={index}
						onPressOne={onPressOne}
						onPressTwo={onPressTwo}
						paramUpdatedViaScan={paramUpdatedViaScan}
						isCodeEqual={isEqual(code, currCode)}
						isScanning={isScanning}
						isSaving433MhzParams={isSaving433MhzParams}/>
				);
			});

			Setting.push(
				<View
					level={2}
					style={radioButtonsCover} key={setting}>
					{vSetting}
				</View>);
		}
		if (setting === 'u') {

			const uSetting = Object.keys(settings[setting]).map((uSet: string, index: number): Object => {
				const { option } = settings[setting][uSet];

				const cUSet = units[uSet] || 0;
				function onToggleCheckBox() {
					let next = {
						...units,
					};
					next[uSet] = cUSet === 1 ? 0 : 1;
					dispatch(setWidgetParamUnits(next));
				}

				return (<USetting
					key={uSet}
					index={index}
					isChecked={cUSet === 1}
					onToggleCheckBox={onToggleCheckBox}
					intl={intl}
					option={option}
					paramUpdatedViaScan={paramUpdatedViaScan}
					isCodeEqual={isEqual(units, currUnits)}
					isScanning={isScanning}
					isSaving433MhzParams={isSaving433MhzParams}/>);
			});

			Setting.push(
				<View
					level={2}
					style={uSettingsCover}
					key={setting}>
					<Text
						level={3}
						style={[optionInputLabelStyle, labelStyle]}>
						{formatMessage(i18n.units)}
					</Text>
					<View style={{
						flex: 1,
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}>
						{uSetting}
					</View>
				</View>);
		}
		if (setting === 's') {
			let houseObject = typeof house !== 'object' ? {} : house;

			const sSetting = Object.keys(settings[setting]).map((sSet: string, index: number): Object => {
				function onPressOne() {
					let next = {
						...houseObject,
					};
					next[sSet] = '1';
					dispatch(setWidgetParamHouse(next));
				}
				function onPressTwo() {
					let next = {
						...houseObject,
					};
					next[sSet] = '-';
					dispatch(setWidgetParamHouse(next));
				}
				function onPressThree() {
					let next = {
						...houseObject,
					};
					next[sSet] = '0';
					dispatch(setWidgetParamHouse(next));
				}

				const one = houseObject[sSet] || '-';
				const two = houseObject[sSet] || '-';
				const three = houseObject[sSet] || '-';

				return (
					<SSetting
						key={sSet}
						index={index}
						onPressOne={onPressOne}
						onPressTwo={onPressTwo}
						onPressThree={onPressThree}
						value={sSet}
						isOneSelected={one === '1'}
						isTwoSelected={two === '-'}
						isThreeSelected={three === '0'}
						paramUpdatedViaScan={paramUpdatedViaScan}
						isCodeEqual={isEqual(house, currHouse)}
						isScanning={isScanning}
						isSaving433MhzParams={isSaving433MhzParams}/>
				);
			});

			Setting.push(
				<View
					level={2}
					style={radioButtonsCover} key={setting}>
					{sSetting}
				</View>);
		}
		if (setting === 'house') {
			const {
				min,
				max,
				options,
			} = settings[setting];

			if (min || min) {
				function onChangeText(value: string): any {
					if (!value || value === '') {
						dispatch(setWidgetParamHouse(''));
						return;
					}

					let newValue = parseInt(value, 10);
					if (isNaN(newValue)) {
						dispatch(setWidgetParamHouse(house));
						return;
					}

					let acceptValue = (newValue <= max) && (newValue >= min);
					if (!acceptValue) {
						dispatch(setWidgetParamHouse(house));
						return;
					}

					dispatch(setWidgetParamHouse(newValue.toString()));
				}

				Setting.push(
					<InputSetting
						ref={inputRefHouse}
						key={setting}
						label={formatMessage(i18n.houseCode)}
						value={house}
						textOnPressHelp={formatMessage(i18n.infoAddDevice433Settings)}
						headerOnPressHelp={formatMessage(i18n.houseCode)}
						onChangeText={onChangeText}
						paramUpdatedViaScan={paramUpdatedViaScan}
						isCodeEqual={isEqual(house, currHouse)}
						isScanning={isScanning}
						isSaving433MhzParams={isSaving433MhzParams}/>
				);
			}
			if (options) {
				const items = options.map((o: string): Object => {
					return {
						key: o,
						value: o,
					};
				});

				function onValueChange(value: string, itemIndex: number, data: Array<any>) {
					const { key } = items[itemIndex] || {};
					dispatch(setWidgetParamHouse(key));
				}

				const ddValue = house === '' ? items[0].key : house;
				Setting.push(<DropDownSetting
					labelStyle={labelStyle}
					items={items}
					value={ddValue}
					textOnPressHelp={formatMessage(i18n.infoAddDevice433Settings)}
					headerOnPressHelp={formatMessage(i18n.houseCode)}
					onValueChange={onValueChange}
					label={formatMessage(i18n.houseCode)}
					key={setting}
					paramUpdatedViaScan={paramUpdatedViaScan}
					isCodeEqual={isEqual(house, currHouse)}
					isScanning={isScanning}
					isSaving433MhzParams={isSaving433MhzParams}/>);
			}
		}
		if (setting === 'unit') {
			const {
				min,
				max,
				options,
			} = settings[setting];

			if (min || max) {
				function onChangeText(value: string): any {

					if (!value || value === '') {
						dispatch(setWidgetParamUnit(''));
						return;
					}

					let newValue = parseInt(value, 10);
					if (isNaN(newValue)) {
						dispatch(setWidgetParamUnit(unit));
						return;
					}

					let acceptValue = (newValue <= max) && (newValue >= min);
					if (!acceptValue) {
						dispatch(setWidgetParamUnit(unit));
						return;
					}

					dispatch(setWidgetParamUnit(newValue.toString()));
				}

				Setting.push(
					<InputSetting
						ref={inputRefUnit}
						key={setting}
						label={formatMessage(i18n.unitCode)}
						value={unit}
						textOnPressHelp={formatMessage(i18n.infoAddDevice433Settings)}
						headerOnPressHelp={formatMessage(i18n.unitCode)}
						onChangeText={onChangeText}
						paramUpdatedViaScan={paramUpdatedViaScan}
						isCodeEqual={isEqual(unit, currUnit)}
						isScanning={isScanning}
						isSaving433MhzParams={isSaving433MhzParams}/>
				);
			}
			if (options) {
				const items = options.map((o: string): Object => {
					return {
						key: o,
						value: o,
					};
				});

				function onValueChange(value: string, itemIndex: number, data: Array<any>) {
					const { key } = items[itemIndex] || {};
					dispatch(setWidgetParamUnit(key));
				}

				const ddValue = unit === '' ? items[0].key : unit;
				Setting.push(<DropDownSetting
					labelStyle={labelStyle}
					items={items}
					value={ddValue}
					textOnPressHelp={formatMessage(i18n.infoAddDevice433Settings)}
					headerOnPressHelp={formatMessage(i18n.unitCode)}
					onValueChange={onValueChange}
					label={formatMessage(i18n.unitCode)}
					key={setting}
					paramUpdatedViaScan={paramUpdatedViaScan}
					isCodeEqual={isEqual(unit, currUnit)}
					isScanning={isScanning}
					isSaving433MhzParams={isSaving433MhzParams}/>);
			}
		}
		if (setting === 'house:unit') {
			const {
				optionValues,
			} = settings[setting];

			const ddValueMatch = `${house}:${unit}`;
			let ddValue = 'A1';
			const currValue = `${currHouse}:${currUnit}`;

			const items = Object.keys(optionValues).map((pv: string): Object => {
				if (ddValueMatch === optionValues[pv]) {
					ddValue = pv;
				}
				return {
					key: pv,
					value: pv,
				};
			});

			function onValueChange(value: string, itemIndex: number, data: Array<any>) {
				const { key } = items[itemIndex] || {};
				const homeAndUnit = optionValues[key];
				const [h, u] = homeAndUnit.split(':');
				dispatch(setWidgetParamHouse(h));
				dispatch(setWidgetParamUnit(u));
			}

			Setting.push(<DropDownSetting
				labelStyle={labelStyle}
				items={items}
				value={ddValue}
				textOnPressHelp={formatMessage(i18n.infoAddDevice433Settings)}
				headerOnPressHelp={formatMessage(i18n.unitCode)}
				onValueChange={onValueChange}
				label={formatMessage(i18n.unitCode)}
				key={setting}
				paramUpdatedViaScan={paramUpdatedViaScan}
				isCodeEqual={isEqual(ddValueMatch, currValue)}
				isScanning={isScanning}
				isSaving433MhzParams={isSaving433MhzParams}/>);
		}
		if (setting === 'fade') {
			const { optionValues } = settings[setting];

			const fadeSetting = Object.keys(optionValues).map((key: string, i: number): Object => {
				const value = optionValues[key];
				function onToggleCheckBox() {
					dispatch(setWidgetParamFade(value));
				}

				return (
					<FadeSetting
						isChecked={fade === value}
						onToggleCheckBox={onToggleCheckBox}
						intl={intl}
						option={key}
						key={key}
						paramUpdatedViaScan={paramUpdatedViaScan}
						isCodeEqual={isEqual(fade, currFade)}
						isScanning={isScanning}
						isSaving433MhzParams={isSaving433MhzParams}/>
				);
			});

			Setting.push(
				<View
					level={2}
					style={optionInputCover}
					key={setting}>
					<Text
						level={3}
						style={[optionInputLabelStyle, labelStyle]}>
						{formatMessage(i18n.fade)}
					</Text>
					<View style={fadeSettingsCover}>
						{fadeSetting}
					</View>
				</View>);
		}
	});

	return (
		<View style={[coverStyleDef, coverStyle]}>
			{!hideHeader &&
				<Text style={titleStyle}>
					{formatMessage(i18n.deviceSettings)}
				</Text>
			}
			{!!renderExtraSettingsTop && renderExtraSettingsTop()}
			{Setting}
			{((showScan || !!learnButton) && clientId) &&
			<View style={scanLearnCover}>
				{!!learnButton && learnButton}
				{showScan && <ScanButton
					clientId={clientId}
					deviceId={deviceId}
					devicetype={devicetype}
					disabled={isSaving433MhzParams}/>
				}
			</View>
			}
		</View>
	);
});

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		subHeader,
		fontSizeFactorFour,
		fontSizeFactorEight,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeText = Math.floor(deviceWidth * fontSizeFactorFour);
	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);

	return {
		padding,
		coverStyleDef: {
			marginTop: padding / 2,
			marginHorizontal: padding,
			width: width - (2 * padding),
		},
		titleStyle: {
			marginTop: padding / 2,
			marginBottom: 5,
			color: subHeader,
			fontSize,
		},
		radioButtonsCover: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingRight: padding,
			flexWrap: 'wrap',
			paddingBottom: padding,
			...shadow,
			marginBottom: padding / 2,
			borderRadius: 2,
		},
		optionInputLabelStyle: {
			fontSize: fontSizeText,
		},
		optionInputCover: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			padding: padding,
			...shadow,
			marginBottom: padding / 2,
			borderRadius: 2,
		},
		fadeSettingsCover: {
			flexDirection: 'column',
			alignItems: 'flex-end',
			justifyContent: 'center',
		},
		uSettingsCover: {
			flexDirection: 'column',
			alignItems: 'stretch',
			justifyContent: 'center',
			padding,
			...shadow,
			marginBottom: padding / 2,
			borderRadius: 2,
		},
		scanLearnCover: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-around',
			marginTop: padding,
		},
	};
};

export default (DeviceSettings: Object);

