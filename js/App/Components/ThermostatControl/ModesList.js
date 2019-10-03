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

	modesCoverStyle: number | Array<any> | Object,
	onPressRow: (string) => void,
	intl: intlShape,
	onControlThermostat: (mode: string, temperature?: number | null, changeMode: 1 | 0, requestedState: number) => void,
	onEditSubmitValue: (number) => void,
	updateCurrentValueInScreen: (string) => void,
};

class ModesList extends View<Props, null> {
props: Props;

onPressRow: (string) => void;

constructor(props: Props) {
	super(props);

	this.onPressRow = this.onPressRow.bind(this);

	this.maxALength = Math.PI * 1.5;
	this.minALength = 0;
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return true;
}

onPressRow = (controlType: string) => {
	this.props.onPressRow(controlType);
}

render(): Object {

	const {
		appLayout,
		controllingMode,
		modes,
		intl,
		currentValueInScreen,
		currentValue,
		modesCoverStyle,
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
				value={controllingMode === mode ? currentValueInScreen : value}
				controllingMode={controllingMode}
				scale={scale}
				unit={unit}
				active={active}
				onPressRow={this.onPressRow}
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
				initialValue={value}/>
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
