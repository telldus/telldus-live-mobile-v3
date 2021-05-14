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
 *
 */

// @flow

'use strict';

import React from 'react';
import {
	LayoutAnimation,
	Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as RNLocalize from 'react-native-localize';

import {
	View,
	Text,
	EmptyView,
	Switch,
	SettingsRow,
} from '../../../../BaseComponents';

import {
	withTheme,
	PropsThemedComponent,
} from '../../HOC/withTheme';

import Theme from '../../../Theme';

import {
	LayoutAnimations,
} from '../../../Lib';

import i18n from '../../../Translations/common';

type Props = PropsThemedComponent & {
	value: Object,
	appLayout: Object,

	onChange: (boolean, ?number, ?number, ?number, ?number) => void,

	labelStyle?: Array<any> | Object,
	rowStyle?: Array<any> | Object,
	intl: Object,
};

type State = {
	alwaysActive: boolean,
	showTimePicker: boolean,
	editingValue: 'from' | 'to',
	timeFrom: Date,
	timeTo: Date,
};

class TimePicker extends View<Props, State> {
	state: State;

	onSwitch: (boolean) => void;

	constructor(props: Props) {
		super(props);
		const {
			fromHr,
			fromMin,
			toHr,
			toMin,
			alwaysActive,
		} = this.props.value || {};

		const timeFrom = new Date();
		if (typeof fromHr !== 'undefined') {
			timeFrom.setHours(fromHr);
		}
		if (typeof fromMin !== 'undefined') {
			timeFrom.setMinutes(fromMin);
		}
		const timeTo = new Date();
		if (typeof toHr !== 'undefined') {
			timeTo.setHours(toHr);
		}
		if (typeof toMin !== 'undefined') {
			timeTo.setMinutes(toMin);
		}

		this.state = {
			alwaysActive: typeof alwaysActive !== 'undefined' ? alwaysActive : true,
			showTimePicker: false,
			editingValue: 'from',
			timeFrom,
			timeTo,
		};

		this.hrs = [];
		this.mins = [];
		for (let i = 0; i < 24; i++) {
			this.hrs.push(i);
		}
		for (let i = 0; i < 60; i++) {
			this.mins.push(i);
		}
	}

	onSwitch = (value: boolean) => {
		LayoutAnimation.configureNext(LayoutAnimations.linearCUD(200));
		if (value) {
			this.setState({ alwaysActive: value});
			this.props.onChange(true);
		} else {
			this.setState({ alwaysActive: false});
			this.props.onChange(false);
		}
	}

	_onDateChange = (event: Object, time: Object) => {
		if (Platform.OS === 'ios') {
			if (time === undefined) {
				// dismissedAction
				this.setState({
					showTimePicker: false,
				});
			}
		} else {
			this.setState({
				showTimePicker: false,
			});
		}

		if (!time) {
			return;
		}

		const { editingValue } = this.state;
		const key = editingValue === 'from' ? 'timeFrom' : 'timeTo';
		this.setState({// $FlowFixMe
			[key]: time,
		}, () => {
			const {
				timeFrom,
				timeTo,
			} = this.state;
			this.props.onChange(
				false,
				timeFrom.getHours(),
				timeFrom.getMinutes(),
				timeTo.getHours(),
				timeTo.getMinutes());
		});
	};

	editTo = () => {
		const {
			showTimePicker,
			editingValue,
		} = this.state;
		if (showTimePicker && editingValue === 'to') {
			this.setState({
				showTimePicker: false,
			});
			return;
		}
		this.setState({
			showTimePicker: true,
			editingValue: 'to',
		});
	}

	editFrom = () => {
		const {
			showTimePicker,
			editingValue,
		} = this.state;
		if (showTimePicker && editingValue === 'from') {
			this.setState({
				showTimePicker: false,
			});
			return;
		}
		this.setState({
			showTimePicker: true,
			editingValue: 'from',
		});
	}

	render(): Object {
		const {
			labelStyle,
			rowStyle,
			appLayout,
			intl,
			colors,
		} = this.props;

		const {
			showTimePicker,
			timeFrom,
			timeTo,
			editingValue,
		} = this.state;

		const {
			formatMessage,
			formatTime,
		} = intl;
		const hour12 = !RNLocalize.uses24HourClock();

		const styles = getStyles({
			appLayout,
			colors,
		});

		return (
			<View style={styles.container}>
				<View
					level={2}
					style={[styles.switchHeader, rowStyle]}>
					<Text
						level={3}
						style={[styles.switchLabel, labelStyle]}>{formatMessage(i18n.alwaysActive)}</Text>
					<Switch
						value={this.state.alwaysActive}
						onValueChange={this.onSwitch}/>
				</View>
				{
					(this.state.alwaysActive) ?
						<EmptyView/>
						:
						(

							<View style={styles.body}>
								<SettingsRow
									label={`${formatMessage(i18n.activeFrom)}:`}
									value={formatTime(timeFrom, {
										hour12,
									})}
									iconValueRight={(showTimePicker && editingValue === 'from') ? 'done' : 'edit'}
									onPress={this.editFrom}
									appLayout={appLayout}
									intl={intl}
									type={'text'}
									labelTextStyle={styles.labelTextStyle}
									touchableStyle={styles.touchableStyle}
									style={styles.contentCoverStyle}/>
								{
									(showTimePicker && Platform.OS === 'ios' && editingValue === 'from') && (
										<DateTimePicker
											mode="time"
											display={'spinner'}
											value={editingValue === 'from' ? timeFrom : timeTo}
											onChange={this._onDateChange}
											textColor={colors.textThree}
											style={styles.timePickerStyle}/>
									)
								}
								<SettingsRow
									label={`${formatMessage(i18n.activeTo)}:`}
									value={formatTime(timeTo, {
										hour12,
									})}
									iconValueRight={(showTimePicker && editingValue === 'to') ? 'done' : 'edit'}
									onPress={this.editTo}
									appLayout={appLayout}
									intl={intl}
									type={'text'}
									labelTextStyle={styles.labelTextStyle}
									touchableStyle={styles.touchableStyle}
									style={styles.contentCoverStyle}/>
							</View>
						)
				}
				{
					(showTimePicker && (Platform.OS === 'android' || editingValue === 'to')) && (
						<DateTimePicker
							mode="time"
							display={'spinner'}
							value={editingValue === 'from' ? timeFrom : timeTo}
							onChange={this._onDateChange}
							textColor={colors.textThree}
							style={styles.timePickerStyle}/>
					)
				}
			</View>
		);
	}
}

const getStyles = ({
	appLayout,
	colors,
}: Object): Object => {

	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		fontSizeFactorFour,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const fontSize = deviceWidth * fontSizeFactorFour;

	return {
		container: {
			flex: 1,
		},
		switchHeader: {
			flexDirection: 'row',
			alignItems: 'center',
			paddingHorizontal: padding * 1.5,
			marginHorizontal: padding,
			borderRadius: 2,
			marginBottom: padding / 2,
			...shadow,
		},
		switchLabel: {
			flex: 1,
			fontSize,
		},
		body: {
			marginHorizontal: padding * 2,
		},
		labelTextStyle: {
			fontSize,
			justifyContent: 'center',
		},
		touchableStyle: {
			height: fontSize * 3.1,
		},
		contentCoverStyle: {
			marginBottom: padding / 2,
			marginTop: 0,
		},
		timePickerStyle: {
			flex: 1,
			marginBottom: padding / 2,
		},
	};
};

module.exports = (withTheme(TimePicker): Object);
