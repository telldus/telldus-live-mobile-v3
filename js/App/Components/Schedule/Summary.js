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
import { ScrollView } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { intlShape, injectIntl, defineMessages } from 'react-intl';

import { FloatingButton, View } from '../../../BaseComponents';
import { ScheduleProps } from './ScheduleScreen';
import { getSelectedDays } from '../../Lib';
import { ActionRow, DaysRow, DeviceRow, TimeRow } from './SubViews';
import Theme from '../../Theme';

import i18n from '../../Translations/common';
const messages = defineMessages({
	addScheduleSuccess: {
		id: 'toast.addScheduleSuccess',
		defaultMessage: 'Schedule has been added successfully',
		description: 'The message to show, when a schedule is added successfully',
	},
	posterSummary: {
		id: 'schedule.posterSummary',
		defaultMessage: 'Please confirm the schedule',
	},
});

interface Props extends ScheduleProps {
	paddingRight: number,
	devices: Object,
	intl: intlShape.isRequired,
}

type State = {
	isLoading: boolean,
};

class Summary extends View<null, Props, State> {

	state: State;

	static propTypes = {
		navigation: PropTypes.object,
		actions: PropTypes.object,
		onDidMount: PropTypes.func,
		paddingRight: PropTypes.number,
		schedule: PropTypes.object,
		devices: PropTypes.object,
	};

	constructor(props: Props) {
		super(props);

		const { schedule, intl } = this.props;

		this.state = {
			isLoading: false,
		};

		let { formatMessage } = intl;

		this.h1 = `5. ${formatMessage(i18n.summary)}`;
		this.h2 = formatMessage(messages.posterSummary);
		this.messageOnAdd = formatMessage(messages.addScheduleSuccess);
		this.infoButton = {
			tmp: true, // TODO: fill with real fields
		};
		this.device = this._getDeviceById(schedule.deviceId);
	}

	componentDidMount() {
		const { h1, h2, infoButton } = this;
		this.props.onDidMount(h1, h2, infoButton);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'Summary';
	}

	saveSchedule = () => {
		this.setState({
			isLoading: true,
		});
		let options = this.props.actions.getScheduleOptions(this.props.schedule);
		this.props.actions.saveSchedule(options).then((response: Object) => {
			this.setState({
				isLoading: false,
			});
			this.props.actions.getJobs();
			this.props.actions.showToast(this.messageOnAdd, 'LONG');
			this.resetNavigation();
		}).catch((error: Object) => {
			this.setState({
				isLoading: false,
			});
			let message = error.message ? error.message : 'Could not save the shedule. Please try again later.';
			this.props.actions.showModal(message);
		});
	};

	resetNavigation = () => {
		const { navigation } = this.props;
		// There are issue while RESETTING the route and navigating/popping back(cannot set params and so) https://github.com/react-navigation/react-navigation/issues/2404
		// Also we do not have to push the screen on top of the stack once again, so 'navigate' seem to be the best option.
		const action = NavigationActions.navigate({
			routeName: 'Scheduler',
			key: 'Scheduler',
		});
		navigation.dispatch(action);
	}

	render(): React$Element<any> {
		const { schedule, paddingRight, appLayout, intl } = this.props;
		const { formatDate } = intl;
		const { method, methodValue, weekdays } = schedule;
		const { container, row, iconSize, buttonStyle, iconStyle, iconContainerStyle } = this._getStyle(appLayout);
		const selectedDays = getSelectedDays(weekdays, formatDate);

		return (
			<View style={{flex: 1}}>
				<ScrollView style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
					<View style={container}>
						<DeviceRow row={this.device} containerStyle={row} appLayout={appLayout} intl={intl}/>
						<ActionRow
							method={method}
							showValue={true}
							methodValue={methodValue}
							containerStyle={row}
							iconContainerStyle={iconContainerStyle}
							appLayout={appLayout}
							intl={intl}
						/>
						<TimeRow
							schedule={schedule}
							device={this.device}
							containerStyle={row}
							appLayout={appLayout}
							intl={intl}
						/>
						<DaysRow selectedDays={selectedDays} appLayout={appLayout} intl={intl}/>
					</View>
					<FloatingButton
						buttonStyle={buttonStyle}
						iconStyle={iconStyle}
						onPress={this.saveSchedule}
						iconName={this.state.isLoading ? false : 'checkmark'}
						iconSize={iconSize}
						paddingRight={paddingRight - 2}
						showThrobber={this.state.isLoading}
						accessibilityLabel={`${intl.formatMessage(i18n.confirmButton)}, ${intl.formatMessage(i18n.defaultDescriptionButton)}`}
					/>
				</ScrollView>
			</View>
		);
	}

	_getDeviceById = (deviceId: number): Object => {
		// TODO: use device description
		return Object.assign({}, this.props.devices.byId[deviceId], { description: '' });
	};

	_getStyle = (appLayout: Object): Object => {
		const { paddingFactor, maxSizeFloatingButton } = Theme.Core;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const padding = deviceWidth * paddingFactor;

		let buttonSize = deviceWidth * 0.134666667;
		buttonSize = buttonSize > maxSizeFloatingButton ? maxSizeFloatingButton : buttonSize;
		let buttonBottom = deviceWidth * 0.066666667;

		return {
			container: {
				flex: 1,
				marginBottom: (buttonSize / 2) + buttonBottom,
			},
			row: {
				marginBottom: padding / 4,
			},
			iconSize: deviceWidth * 0.050666667,
			buttonStyle: {
				elevation: 4,
				shadowOpacity: 0.50,
			},
			iconStyle: {
				fontSize: deviceWidth * 0.050666667,
				color: '#fff',
			},
			iconContainerStyle: {
				width: deviceWidth * 0.226666667,
			},
		};
	};

}

export default injectIntl(Summary);
