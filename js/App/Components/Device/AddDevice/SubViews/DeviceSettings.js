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

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import {
	View,
	Text,
} from '../../../../../BaseComponents';
import VSetting from './VSetting';
import USetting from './USetting';
import SSetting from './SSetting';
import DropDownSetting from './DropDownSetting';
import FadeSetting from './FadeSetting';
import InputSetting from './InputSetting';

import Theme from '../../../../Theme';

const DeviceSettings = (props: Object): Object => {
	const {
		settings,
	} = props;

	const intl = useIntl();

	const [v, setV] = useState({});
	const [u, setU] = useState({});
	const [s, setS] = useState({});
	const [system, setSystem] = useState('');
	const [house, setHouse] = useState('');
	const [unit, setUnit] = useState('');
	const [fade, setFade] = useState(false);

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		coverStyle,
		radioButtonsCover,
		optionInputCover,
		optionInputLabelStyle,
		fadeSettingsCover,
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
					setSystem(value);
					return;
				}

				let newValue = parseInt(value, 10);
				if (isNaN(newValue)) {
					setSystem(system);
					return;
				}

				let acceptValue = (newValue <= max) && (newValue >= min);
				if (!acceptValue) {
					setSystem(system);
					return;
				}

				setSystem(newValue.toString());
			}

			Setting.push(
				<InputSetting
					key={setting}
					label={'System'}
					value={system}
					onChangeText={onChangeText}/>
			);
		}
		if (setting === 'v') {
			const vSetting = Object.keys(settings[setting]).map((vSet: Object, index: number): Object => {
				const { option } = settings[setting][vSet];

				function onPressOne() {
					setV({
						...v,
						[vSet]: true,
					});
				}
				function onPressTwo() {
					setV({
						...v,
						[vSet]: false,
					});
				}

				const isOneSelected = v[vSet] || false;

				return (
					<VSetting
						key={vSet}
						option={option}
						isOneSelected={isOneSelected}
						isTwoSelected={!isOneSelected}
						value={vSet}
						index={index}
						onPressOne={onPressOne}
						onPressTwo={onPressTwo}/>
				);
			});
			Setting.push(
				<View style={radioButtonsCover} key={setting}>
					{vSetting}
				</View>);
		}
		if (setting === 'u') {
			const uSetting = Object.keys(settings[setting]).map((uSet: Object, index: number): Object => {
				const { option } = settings[setting][uSet];

				const cUSet = u[uSet] || false;
				function onToggleCheckBox() {
					setU({
						...u,
						[uSet]: !cUSet,
					});
				}

				return (<USetting
					key={uSet}
					isChecked={cUSet}
					onToggleCheckBox={onToggleCheckBox}
					intl={intl}
					option={option}/>);
			});
			Setting.push(
				<View style={radioButtonsCover} key={setting}>
					{uSetting}
				</View>);
		}
		if (setting === 's') {
			const sSetting = Object.keys(settings[setting]).map((sSet: Object, index: number): Object => {

				function onPressOne() {
					setS({
						...s,
						[sSet]: '1',
					});
				}
				function onPressTwo() {
					setS({
						...s,
						[sSet]: '-',
					});
				}
				function onPressThree() {
					setS({
						...s,
						[sSet]: '0',
					});
				}

				const one = s[sSet] || '-';
				const two = s[sSet] || '-';
				const three = s[sSet] || '-';

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
						isThreeSelected={three === '0'}/>
				);
			});
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
						setHouse(value);
						return;
					}

					let newValue = parseInt(value, 10);
					if (isNaN(newValue)) {
						setHouse(house);
						return;
					}

					let acceptValue = (newValue <= max) && (newValue >= min);
					if (!acceptValue) {
						setHouse(house);
						return;
					}

					setHouse(newValue.toString());
				}

				Setting.push(
					<InputSetting
						key={setting}
						label={'House'}
						value={house}
						onChangeText={onChangeText}/>
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
					setHouse(key);
				}

				const ddValue = house === '' ? items[0].key : house;
				Setting.push(<DropDownSetting
					items={items}
					value={ddValue}
					onValueChange={onValueChange}
					label={'House'}
					key={setting}/>);
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
						setUnit(value);
						return;
					}

					let newValue = parseInt(value, 10);
					if (isNaN(newValue)) {
						setUnit(unit);
						return;
					}

					let acceptValue = (newValue <= max) && (newValue >= min);
					if (!acceptValue) {
						setUnit(unit);
						return;
					}

					setUnit(newValue.toString());
				}

				Setting.push(
					<InputSetting
						key={setting}
						label={'Unit'}
						value={unit}
						onChangeText={onChangeText}/>
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
					setUnit(key);
				}

				const ddValue = unit === '' ? items[0].key : unit;
				Setting.push(<DropDownSetting
					items={items}
					value={ddValue}
					onValueChange={onValueChange}
					label={'Unit'}
					key={setting}/>);
			}
		}
		if (setting === 'fade') {
			const { optionValues } = settings[setting];

			const fadeSetting = Object.keys(optionValues).map((key: string, i: number): Object => {
				const value = optionValues[key];
				function onToggleCheckBox() {
					setFade(value);
				}

				return (
					<FadeSetting
						isChecked={fade === value}
						onToggleCheckBox={onToggleCheckBox}
						intl={intl}
						option={key}
						key={key}/>
				);
			});

			Setting.push(
				<View style={optionInputCover} key={setting}>
					<Text style={optionInputLabelStyle}>
						Fade
					</Text>
					<View style={fadeSettingsCover}>
						{fadeSetting}
					</View>
				</View>);
		}
	});

	return (
		<View style={coverStyle}>
			{Setting}
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
		coverStyle: {
			marginTop: padding / 2,
			marginHorizontal: padding,
			backgroundColor: '#fff',
			...shadow,
			width: width - (2 * padding),
		},
		radioButtonsCover: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			paddingRight: padding,
			flexWrap: 'wrap',
			paddingBottom: padding,
		},
		optionInputLabelStyle: {
			fontSize: fontSizeText * 1.4,
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
	};
};

export default DeviceSettings;

