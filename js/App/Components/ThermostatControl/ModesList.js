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
	memo,
	useMemo,
} from 'react';
import { injectIntl, intlShape } from 'react-intl';

import {
	View,
	Text,
} from '../../../BaseComponents';
import ModeBlock from './ModeBlock';

import {
	useAppTheme,
} from '../../Hooks/Theme';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

type Props = {
    appLayout: Object,
	controllingMode: 'heat' | 'cool' | 'heat-cool' | 'off',
	modes: Array<Object>,
	currentValue: number,
	currentValueInScreen: number,
	setpointMode: string,
	setpointValue: string,
	setpointValueLocal: string,
	hideTemperatureControl: boolean,

	modesCoverStyle: Array<any> | Object,
	onPressRow: (mode: string, changeMode: 0 | 1, callback: Function) => void,
	intl: intlShape,
	onControlThermostat: (mode: string, temperature?: number | null, changeMode: 1 | 0, requestedState: number) => void,
	onEditSubmitValue: (number, ?number) => void,
	updateCurrentValueInScreen: (string, ?string) => void,
	handleAddMinus: (string, 0 | 1, number) => void,
};

const ModesList = memo<Object>((props: Props): Object => {

	const {
		appLayout,
		controllingMode,
		modes,
		intl,
		setpointValue,
		currentValue,
		modesCoverStyle,
		setpointMode,
		setpointValueLocal,
		handleAddMinus,
		hideTemperatureControl,
		onControlThermostat,
		onPressRow,
	} = props;

	const {
		selectedThemeSet,
	} = useAppTheme();

	const {
		modeHeaderStyle,
		modesCover,
	} = getStyles({
		appLayout,
	});

	const modesL = useMemo((): Array<Object> => {
		return modes.map((modeInfo: Object, i: number): Object => {
			let {
				label,
				icon,
				edit,
				value,
				scale,
				unit,
				mode,
				minVal,
				maxVal,
				Icon,
				Icon2,
				IconActive,
				onEditSubmitValue,
				updateCurrentValueInScreen,
			} = modeInfo;
			let active = false;

			if (controllingMode === mode) {
				active = true;
			}
			return (
				<ModeBlock
					key={i}
					appLayout={appLayout}
					label={label}
					edit={edit}
					icon={icon}
					value={setpointMode === mode ? setpointValue : value}
					controllingMode={controllingMode}
					scale={scale}
					unit={unit}
					active={active}
					onPressRow={onPressRow}
					mode={mode}
					minVal={minVal}
					maxVal={maxVal}
					Icon={selectedThemeSet && selectedThemeSet.key === 1 ? Icon : Icon2}
					IconActive={IconActive}
					onControlThermostat={onControlThermostat}
					intl={intl}
					onEditSubmitValue={onEditSubmitValue}
					updateCurrentValueInScreen={updateCurrentValueInScreen}
					currentValue={currentValue}
					initialValue={value}
					setpointMode={setpointMode}
					setpointValueLocal={setpointValueLocal}
					handleAddMinus={handleAddMinus}
					hideTemperatureControl={hideTemperatureControl}/>
			);
		});
	}, [appLayout, controllingMode, currentValue, handleAddMinus, hideTemperatureControl, intl, modes, onControlThermostat, onPressRow, selectedThemeSet, setpointMode, setpointValue, setpointValueLocal]);

	return (
		<View style={[modesCover, modesCoverStyle]}>
			<Text
				level={2}
				style={modeHeaderStyle}>
				{intl.formatMessage(i18n.labelModes)}
			</Text>
			{modesL}
		</View>
	);
});

const getStyles = ({
	appLayout,
}: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		fontSizeFactorFour,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		modesCover: {
			marginVertical: padding,
		},
		modeHeaderStyle: {
			marginLeft: padding,
			fontSize: deviceWidth * fontSizeFactorFour,
		},
	};
};

module.exports = (injectIntl(ModesList): Object);
