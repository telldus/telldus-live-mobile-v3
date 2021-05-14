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

import {
	withTheme,
	PropsThemedComponent,
} from '../HOC/withTheme';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

interface Props extends ScheduleProps {
}

type State = {
	onChange: (Object) => void,
};

class ActionThermostatTwo extends View<null, Props & PropsThemedComponent, State> {

	constructor(props: Props & PropsThemedComponent) {
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
			colors,
		} = this.props;
		const {
			optionsCover,
			optionCover,
			iconStyle,
			textStyle,
			inAppBrandSecondary,
		} = this._getStyle(appLayout);

		const { changeMode, changeTemp } = methodValue || {};

		const changeBoth = changeTemp && changeMode;
		const changeTempAlone = changeTemp && !changeMode;
		const changeModeAlone = (!changeTemp && changeMode);

		const {
			card,
			textFive,
		} = colors;

		const oneItemsColor = changeBoth ? card : textFive;
		const twoItemsColor = changeModeAlone ? card : textFive;
		const threeItemsColor = changeTempAlone ? card : textFive;

		return (
			<View style={optionsCover}>
				<TouchableOpacity onPress={this.onPressOne}>
					<View style={[optionCover, {
						backgroundColor: changeBoth ? inAppBrandSecondary : card,
					}]}>
						<IconTelldus icon={'thermostatheatcool'} style={[iconStyle, {
							color: oneItemsColor,
						}]}/>
						<IconTelldus icon={'temperature'} style={[iconStyle, {
							color: oneItemsColor,
						}]}/>
						<Text style={[textStyle, {
							color: oneItemsColor,
						}]}>
							{intl.formatMessage(i18n.changeSettAndMode)}
						</Text>
					</View>
				</TouchableOpacity>
				<TouchableOpacity onPress={this.onPressTwo}>
					<View style={[optionCover, {
						backgroundColor: changeModeAlone ? inAppBrandSecondary : card,
					}]}>
						<IconTelldus icon={'thermostatheatcool'} style={[iconStyle, {
							color: twoItemsColor,
						}]}/>
						<Text style={[textStyle, {
							color: twoItemsColor,
						}]}>
							{intl.formatMessage(i18n.changeModeOnly)}
						</Text>
					</View>
				</TouchableOpacity>
				<TouchableOpacity onPress={this.onPressThree}>
					<View style={[optionCover, {
						backgroundColor: changeTempAlone ? inAppBrandSecondary : card,
					}]}>
						<IconTelldus icon={'temperature'} style={[iconStyle, {
							color: threeItemsColor,
						}]}/>
						<Text style={[textStyle, {
							color: threeItemsColor,
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
			colors,
		} = this.props;
		const {
			inAppBrandSecondary,
		} = colors;

		const {
			paddingFactor,
			shadow,
			eulaContentColor,
			inactiveSwitchBackground,
		} = Theme.Core;

		const outerPadding = deviceWidth * paddingFactor;

		const blockWidth = width - (outerPadding * 2);

		return {
			inactiveSwitchBackground,
			outerPadding,
			inAppBrandSecondary,
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

export default (withTheme(ActionThermostatTwo): Object);
