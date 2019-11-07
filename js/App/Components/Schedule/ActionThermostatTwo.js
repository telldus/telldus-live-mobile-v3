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
import PropTypes from 'prop-types';
import { ScrollView, TouchableOpacity } from 'react-native';

import {
	TouchableButton,
	View,
	Text,
	IconTelldus,
} from '../../../BaseComponents';
import { ScheduleProps } from './ScheduleScreen';

import {
	shouldUpdate,
} from '../../Lib';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

interface Props extends ScheduleProps {
	paddingRight: number,
}

type State = {
	methodValue: number,
};

export default class ActionThermostatTwo extends View<null, Props, State> {

	static propTypes = {
		navigation: PropTypes.object,
		actions: PropTypes.object,
		onDidMount: PropTypes.func,
		schedule: PropTypes.object,
		paddingRight: PropTypes.number,
		isEditMode: PropTypes.func,
	};

	constructor(props: Props) {
		super(props);

		const { isEditMode, intl, schedule, devices } = this.props;
		const { formatMessage } = intl;

		this.h1 = isEditMode() ? formatMessage(i18n.labelAction) : formatMessage(i18n.labelAction);
		this.h2 = formatMessage(i18n.posterChooseAction);
		this.infoButton = {
			tmp: true, // TODO: fill with real fields
		};

		this.device = devices.byId[schedule.deviceId]; // We do not want scheduler to update on device prop change

		const { methodValue } = schedule;
		this.methodValue = {
			changeMode: 1,
		};
		try {
			this.methodValue = JSON.parse(methodValue);
			this.methodValue = {
				...this.methodValue,
				changeMode: typeof this.methodValue.changeMode === 'undefined' ? 1 : this.methodValue.changeMode,
			};
		} catch (err) {
			this.methodValue = {
				changeMode: 1,
			};
		}

		this.state = {
			methodValue: this.methodValue,
		};
		this.label = formatMessage(i18n.labelChangeMode);
	}

	componentDidMount() {
		const { h1, h2, infoButton } = this;
		this.props.onDidMount(h1, h2, infoButton);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		if (shouldUpdate(this.state, nextState, ['methodValue'])) {
			return true;
		}
		return nextProps.currentScreen === 'ActionThermostatTwo' && shouldUpdate(this.props, nextProps, ['schedule', 'appLayout']);
	}

	selectAction = () => {
		const { actions, navigation, isEditMode } = this.props;
		const { methodValue } = this.state;

		actions.selectAction(2048, JSON.stringify(methodValue));

		if (isEditMode()) {
			navigation.goBack(navigation.state.params.actionKey);
		} else {
			navigation.navigate({
				routeName: 'Time',
				key: 'Time',
			});
		}
	};

	onPressOne = () => {
		const { methodValue } = this.state;
		this.setState({
			methodValue: {
				...methodValue,
				changeMode: 1,
			},
		});
	}

	onPressTwo = () => {
		const { methodValue } = this.state;
		this.setState({
			methodValue: {
				...methodValue,
				changeMode: 0,
			},
		});
	}

	render(): React$Element<any> | null {
		const {
			appLayout,
			intl,
		} = this.props;
		const {
			container,
			buttonStyle,
			optionsCover,
			optionCover,
			iconStyle,
			textStyle,
			eulaContentColor,
			brandSecondary,
		} = this._getStyle(appLayout);

		if (!this.device) {
			return null;
		}

		const { methodValue } = this.state;
		const { changeMode } = methodValue || {};

		return (
			<View style={container}>
				<ScrollView
					style={{flex: 1}}
					contentContainerStyle={{
						flexGrow: 1,
						alignItems: 'stretch',
					}}
					keyboardShouldPersistTaps={'always'}>
					<View style={optionsCover}>
						<TouchableOpacity onPress={this.onPressOne}>
							<View style={[optionCover, {
								backgroundColor: changeMode ? brandSecondary : '#fff',
							}]}>
								<IconTelldus icon={'play'} style={[iconStyle, {
									color: changeMode ? '#fff' : eulaContentColor,
								}]}/>
								<Text style={[textStyle, {
									color: changeMode ? '#fff' : eulaContentColor,
								}]}>
									{intl.formatMessage(i18n.changeSettAndMode)}
								</Text>
							</View>
						</TouchableOpacity>
						<TouchableOpacity onPress={this.onPressTwo}>
							<View style={[optionCover, {
								backgroundColor: changeMode ? '#fff' : brandSecondary,
							}]}>
								<IconTelldus icon={'settings'} style={[iconStyle, {
									color: changeMode ? eulaContentColor : '#fff',
								}]}/>
								<Text style={[textStyle, {
									color: changeMode ? eulaContentColor : '#fff',
								}]}>
									{intl.formatMessage(i18n.changeSettOnly)}
								</Text>
							</View>
						</TouchableOpacity>
					</View>
					<TouchableButton
						text={i18n.confirmAndSave}
						style={buttonStyle}
						onPress={this.selectAction}
						accessible={true}
					/>
				</ScrollView>
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
			container: {
				flex: 1,
				paddingVertical: outerPadding - (outerPadding / 4),
			},
			optionsCover: {
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
				width: blockWidth,
				marginVertical: outerPadding * 2,
				marginHorizontal: outerPadding,
				backgroundColor: '#fff',
				height: (deviceWidth * 0.1) + 20,
				...shadow,
			},
			optionCover: {
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
				padding: 10,
				width: blockWidth / 2,
				height: '100%',
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
			buttonStyle: {
				marginTop: outerPadding,
				marginBottom: outerPadding * 2,
			},
		};
	};

}
