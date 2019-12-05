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
import { TouchableOpacity } from 'react-native';

import {
	View,
	Text,
	IconTelldus,
} from '../../../BaseComponents';
import { ScheduleProps } from './ScheduleScreen';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

interface Props extends ScheduleProps {
}

type State = {
	onChange: (Object) => void,
};

export default class ActionThermostatTwo extends View<null, Props, State> {

	constructor(props: Props) {
		super(props);
	}

	onPressOne = () => {
		const { methodValue } = this.props;
		const newMethValue = {
			...methodValue,
			changeMode: 1,
			changeTemp: true,
		};
		this.props.onChange(newMethValue);
	}

	onPressTwo = () => {
		const { methodValue } = this.props;
		const newMethValue = {
			...methodValue,
			changeMode: 1,
			changeTemp: false,
		};
		this.props.onChange(newMethValue);
	}

	onPressThree = () => {
		const { methodValue } = this.props;
		const newMethValue = {
			...methodValue,
			changeMode: 0,
			changeTemp: true,
		};
		this.props.onChange(newMethValue);
	}

	render(): React$Element<any> | null {
		const {
			appLayout,
			intl,
			methodValue,
		} = this.props;
		const {
			optionsCover,
			optionCover,
			iconStyle,
			textStyle,
			eulaContentColor,
			brandSecondary,
		} = this._getStyle(appLayout);

		let { changeMode, temperature, changeTemp } = methodValue || {};
		changeTemp = changeTemp && temperature !== null && typeof temperature !== 'undefined';
		const changeBoth = changeTemp && changeMode;
		const changeTempAlone = changeTemp && !changeMode;
		const changeModeAlone = !changeTemp && changeMode;

		return (
			<View style={optionsCover}>
				<TouchableOpacity onPress={this.onPressOne}>
					<View style={[optionCover, {
						backgroundColor: changeBoth ? brandSecondary : '#fff',
					}]}>
						<IconTelldus icon={'thermostatheatcool'} style={[iconStyle, {
							color: changeBoth ? '#fff' : eulaContentColor,
						}]}/>
						<IconTelldus icon={'temperature'} style={[iconStyle, {
							color: changeBoth ? '#fff' : eulaContentColor,
						}]}/>
						<Text style={[textStyle, {
							color: changeBoth ? '#fff' : eulaContentColor,
						}]}>
							{intl.formatMessage(i18n.changeSettAndMode)}
						</Text>
					</View>
				</TouchableOpacity>
				<TouchableOpacity onPress={this.onPressTwo}>
					<View style={[optionCover, {
						backgroundColor: changeModeAlone ? brandSecondary : '#fff',
					}]}>
						<IconTelldus icon={'thermostatheatcool'} style={[iconStyle, {
							color: changeModeAlone ? '#fff' : eulaContentColor,
						}]}/>
						<Text style={[textStyle, {
							color: changeModeAlone ? '#fff' : eulaContentColor,
						}]}>
							{intl.formatMessage(i18n.changeModeOnly)}
						</Text>
					</View>
				</TouchableOpacity>
				<TouchableOpacity onPress={this.onPressThree}>
					<View style={[optionCover, {
						backgroundColor: changeTempAlone ? brandSecondary : '#fff',
					}]}>
						<IconTelldus icon={'temperature'} style={[iconStyle, {
							color: changeTempAlone ? '#fff' : eulaContentColor,
						}]}/>
						<Text style={[textStyle, {
							color: changeTempAlone ? '#fff' : eulaContentColor,
						}]}>
							{intl.formatMessage(i18n.changeSettOnly)}
						</Text>
					</View>
				</TouchableOpacity>
			</View>
		);
	}

	_getStyle = (appLayout: Object): Object => {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const {
			paddingFactor,
			shadow,
			brandSecondary,
			eulaContentColor,
		} = Theme.Core;

		const outerPadding = deviceWidth * paddingFactor;

		const blockWidth = width - (outerPadding * 2);

		return {
			outerPadding,
			brandSecondary,
			eulaContentColor,
			optionsCover: {
				justifyContent: 'center',
				alignItems: 'center',
			},
			optionCover: {
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
				padding: 10,
				width: blockWidth,
				...shadow,
				borderRadius: 2,
				marginHorizontal: outerPadding,
				marginTop: outerPadding / 2,
			},
			iconStyle: {
				fontSize: deviceWidth * 0.062,
				textAlignVertical: 'center',
			},
			textStyle: {
				flex: 1,
				fontSize: deviceWidth * 0.032,
				marginLeft: 10,
				textAlignVertical: 'center',
				flexWrap: 'wrap',
			},
		};
	};

}
