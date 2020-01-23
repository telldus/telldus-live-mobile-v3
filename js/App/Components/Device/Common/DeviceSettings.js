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

import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import isEmpty from 'lodash/isEmpty';
const isEqual = require('react-fast-compare');
import {
	Keyboard,
} from 'react-native';

import {
	View,
	Text,
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
	editDevice433Param,
} from '../../../Actions/AddDevice';
import {
	getRandom,
	prepare433DeviceParamsToStore,
} from '../../../Lib';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	settings: Object,
	coverStyle?: Array<any> | number | Object,
	labelStyle?: Array<any> | number | Object,
	widgetId?: string | null,
	deviceId?: string,
	initializeValueFromStore?: boolean,
	showScan?: boolean,
	clientId?: string,
};

const DeviceSettings = (props: Props): Object => {
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
	const { widgetParams433Device = {} } = addDevice433;
	const {
		system = 'null',
		house = 'null',
		unit = 'null',
		fade,
		units = {},
		code = {},
	} = widgetParams433Device;

	const editingDevice = useSelector((state: Object): Object => state.devices.byId[deviceId]);
	let DeviceParams433 = {};
	if (initializeValueFromStore && editingDevice) {
		const { parameter } = editingDevice;
		DeviceParams433 = prepare433DeviceParamsToStore(parseInt(widgetId, 10), parameter);
	}
	let {
		system: currSystem,
		house: currHouse,
		unit: currUnit,
		fade: currFade,
		units: currUnits,
		code: currCode,
	} = DeviceParams433 || {};

	const [ paramUpdatedViaScan, setParamUpdatedViaScan ] = useState(false);
	function callbackOnParamUpdate() {
		setParamUpdatedViaScan(true);
	}

	useEffect(() => {
		// Reset reducer addDevice.addDevice433.widgetParams433Device once before editing.
		if (deviceId && initializeValueFromStore) {
			dispatch(editDevice433Param(widgetId, deviceId));
		}
	}, []);

	const {
		coverStyleDef,
		radioButtonsCover,
		optionInputCover,
		optionInputLabelStyle,
		fadeSettingsCover,
		uSettingsCover,
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

			// Stores initial/default settings in store.
			if (system === 'null' && typeof min !== 'undefined') {
				const random = getRandom(min, max);
				const sysInitValue = currSystem || random || min || max;
				dispatch(setWidgetParamSystem(sysInitValue.toString()));
			}

			Setting.push(
				<InputSetting
					ref={inputRefSystem}
					key={setting}
					label={formatMessage(i18n.system)}
					value={system}
					onChangeText={onChangeText}
					labelStyle={labelStyle}
					paramUpdatedViaScan={paramUpdatedViaScan && !isEqual(system, currSystem)}/>
			);
		}
		if (setting === 'v') {
			let initialSetCode = {};

			const vSetting = Object.keys(settings[setting]).map((vSet: string, index: number): Object => {
				const { option } = settings[setting][vSet];

				if (isEmpty(code)) {
					initialSetCode[vSet] = 0;
				}

				function onPressOne() {
					dispatch(setWidgetParamCode({
						...code,
						[vSet]: 1,
					}));
				}
				function onPressTwo() {
					dispatch(setWidgetParamCode({
						...code,
						[vSet]: 0,
					}));
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
						paramUpdatedViaScan={paramUpdatedViaScan && !isEqual(code, currCode)}/>
				);
			});

			// Stores initial/default settings in store.
			if (isEmpty(code) && !isEmpty(initialSetCode)) {
				const initalValue = currCode || initialSetCode;
				dispatch(setWidgetParamCode({
					...initalValue,
				}));
			}

			Setting.push(
				<View style={radioButtonsCover} key={setting}>
					{vSetting}
				</View>);
		}
		if (setting === 'u') {
			let initialSetU = {};

			const uSetting = Object.keys(settings[setting]).map((uSet: string, index: number): Object => {
				const { option } = settings[setting][uSet];

				if (isEmpty(units)) {
					initialSetU[uSet] = 0;
				}

				const cUSet = units[uSet] || 0;
				function onToggleCheckBox() {
					dispatch(setWidgetParamUnits({
						...units,
						[uSet]: cUSet === 1 ? 0 : 1,
					}));
				}

				return (<USetting
					key={uSet}
					isChecked={cUSet === 1}
					onToggleCheckBox={onToggleCheckBox}
					intl={intl}
					option={option}
					paramUpdatedViaScan={paramUpdatedViaScan && !isEqual(units, currUnits)}/>);
			});

			// Stores initial/default settings in store.
			if (isEmpty(units) && !isEmpty(initialSetU)) {
				const initialValue = currUnits || initialSetU;
				dispatch(setWidgetParamUnits({
					...initialValue,
				}));
			}

			Setting.push(
				<View style={uSettingsCover} key={setting}>
					<Text style={[optionInputLabelStyle, labelStyle]}>
						{formatMessage(i18n.units)}
					</Text>
					<View style={{
						flex: 1,
						flexDirection: 'row',
						justifyContent: 'flex-end',
					}}>
						{uSetting}
					</View>
				</View>);
		}
		if (setting === 's') {
			let houseObject = typeof house !== 'object' ? {} : house;
			let initalSetHouse = {};

			const sSetting = Object.keys(settings[setting]).map((sSet: string, index: number): Object => {
				if (isEmpty(houseObject)) {
					initalSetHouse[sSet] = '-';
				}

				function onPressOne() {
					dispatch(setWidgetParamHouse({
						...houseObject,
						[sSet]: '1',
					}));
				}
				function onPressTwo() {
					dispatch(setWidgetParamHouse({
						...houseObject,
						[sSet]: '-',
					}));
				}
				function onPressThree() {
					dispatch(setWidgetParamHouse({
						...houseObject,
						[sSet]: '0',
					}));
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
						paramUpdatedViaScan={paramUpdatedViaScan && !isEqual(house, currHouse)}/>
				);
			});

			// Stores initial/default settings in store.
			if (isEmpty(houseObject) && !isEmpty(initalSetHouse)) {
				const initialValue = currHouse || initalSetHouse;
				dispatch(setWidgetParamHouse({
					...initialValue,
				}));
			}

			Setting.push(
				<View style={radioButtonsCover} key={setting}>
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

				const random = getRandom(min, max);
				const houseInitValue = currHouse || random || min;
				// Stores initial/default settings in store.
				if (house === 'null') {
					dispatch(setWidgetParamHouse(houseInitValue.toString()));
				}

				Setting.push(
					<InputSetting
						ref={inputRefHouse}
						key={setting}
						label={formatMessage(i18n.houseCode)}
						value={house}
						onChangeText={onChangeText}
						paramUpdatedViaScan={paramUpdatedViaScan && !isEqual(house, currHouse)}/>
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

				// Stores initial/default settings in store.
				if (house === 'null') {
					dispatch(setWidgetParamHouse(currHouse || items[0].key));
				}

				const ddValue = house === '' ? items[0].key : house;
				Setting.push(<DropDownSetting
					labelStyle={labelStyle}
					items={items}
					value={ddValue}
					onValueChange={onValueChange}
					label={formatMessage(i18n.houseCode)}
					key={setting}
					paramUpdatedViaScan={paramUpdatedViaScan && !isEqual(house, currHouse)}/>);
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

				const random = getRandom(min, max);
				const unitInitValue = currUnit || random || min;
				// Stores initial/default settings in store.
				if (unit === 'null') {
					dispatch(setWidgetParamUnit(unitInitValue.toString()));
				}

				Setting.push(
					<InputSetting
						ref={inputRefUnit}
						key={setting}
						label={formatMessage(i18n.unitCode)}
						value={unit}
						onChangeText={onChangeText}
						paramUpdatedViaScan={paramUpdatedViaScan && !isEqual(unit, currUnit)}/>
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

				// Stores initial/default settings in store.
				if (unit === 'null') {
					dispatch(setWidgetParamUnit(currUnit || items[0].key));
				}

				const ddValue = unit === '' ? items[0].key : unit;
				Setting.push(<DropDownSetting
					labelStyle={labelStyle}
					items={items}
					value={ddValue}
					onValueChange={onValueChange}
					label={formatMessage(i18n.unitCode)}
					key={setting}
					paramUpdatedViaScan={paramUpdatedViaScan && !isEqual(unit, currUnit)}/>);
			}
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
						paramUpdatedViaScan={paramUpdatedViaScan && !isEqual(fade, currFade)}/>
				);
			});

			// Stores initial/default settings in store.
			if (typeof fade === 'undefined') {
				dispatch(setWidgetParamFade(currFade || false));
			}

			Setting.push(
				<View style={optionInputCover} key={setting}>
					<Text style={[optionInputLabelStyle, labelStyle]}>
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
			{Setting}
			{(showScan && clientId) &&
				<ScanButton
					clientId={clientId}
					deviceId={deviceId}
					callbackOnParamUpdate={callbackOnParamUpdate}/>
			}
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
		rowTextColor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeText = deviceWidth * 0.035;

	return {
		padding,
		coverStyleDef: {
			marginTop: padding / 2,
			marginHorizontal: padding,
			backgroundColor: '#fff',
			...shadow,
			width: width - (2 * padding),
		},
		radioButtonsCover: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingRight: padding,
			flexWrap: 'wrap',
			paddingBottom: padding,
		},
		optionInputLabelStyle: {
			fontSize: fontSizeText * 1.3,
			color: rowTextColor,
		},
		optionInputCover: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			margin: padding,
		},
		fadeSettingsCover: {
			flexDirection: 'column',
			alignItems: 'flex-end',
			justifyContent: 'center',
		},
		uSettingsCover: {
			flexDirection: 'column',
			alignItems: 'flex-start',
			justifyContent: 'center',
			paddingRight: padding,
			flexWrap: 'wrap',
			paddingBottom: padding,
			paddingLeft: padding,
		},
	};
};

export default DeviceSettings;

