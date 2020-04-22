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

import React from 'react';
import { injectIntl, intlShape } from 'react-intl';

import {
	View,
	Text,
} from '../../../BaseComponents';
import ModeBlock from './ModeBlock';

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

class ModesList extends View<Props, null> {
props: Props;

constructor(props: Props) {
	super(props);

	this.maxALength = Math.PI * 1.5;
	this.minALength = 0;
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return true;
}

render(): Object {

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
	} = this.props;

	const {
		modeHeaderStyle,
		modesCover,
	} = this.getStyles();

	const modesL = modes.map((modeInfo: Object, i: number): Object => {
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
			IconActive,
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
				onPressRow={this.props.onPressRow}
				mode={mode}
				minVal={minVal}
				maxVal={maxVal}
				Icon={Icon}
				IconActive={IconActive}
				onControlThermostat={this.props.onControlThermostat}
				intl={intl}
				onEditSubmitValue={this.props.onEditSubmitValue}
				updateCurrentValueInScreen={this.props.updateCurrentValueInScreen}
				currentValue={currentValue}
				initialValue={value}
				setpointMode={setpointMode}
				setpointValueLocal={setpointValueLocal}
				handleAddMinus={handleAddMinus}
				hideTemperatureControl={hideTemperatureControl}/>
		);
	});

	return (
		<View style={[modesCover, modesCoverStyle]}>
			<Text style={modeHeaderStyle}>
				{intl.formatMessage(i18n.labelModes)}
			</Text>
			{modesL}
		</View>
	);
}

getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		rowTextColor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		modesCover: {
			marginVertical: padding,
		},
		modeHeaderStyle: {
			marginLeft: padding,
			fontSize: deviceWidth * 0.04,
			color: rowTextColor,
		},
	};
}
}

module.exports = injectIntl(ModesList);
