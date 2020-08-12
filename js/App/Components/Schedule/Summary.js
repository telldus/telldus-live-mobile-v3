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
import {
	ScrollView,
} from 'react-native';
import { intlShape, injectIntl } from 'react-intl';
import {
	CommonActions,
} from '@react-navigation/native';

import {
	FloatingButton,
	View,
} from '../../../BaseComponents';
import { ScheduleProps } from './ScheduleScreen';
import {
	getSelectedDays,
	getDeviceActionIcon,
	prepareVisibleTabs,
} from '../../Lib';
import { ActionRow, DaysRow, DeviceRow, TimeRow, AdvancedSettingsBlock } from './SubViews';
import Theme from '../../Theme';

import i18n from '../../Translations/common';

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

	onToggleAdvanced: (boolean) => void;
	setRefScroll: (any) => void;
	scrollView: any;

	constructor(props: Props) {
		super(props);

		const { schedule, intl } = this.props;

		this.state = {
			isLoading: false,
		};

		let { formatMessage } = intl;

		this.h1 = formatMessage(i18n.summary);
		this.h2 = formatMessage(i18n.posterSummary);
		this.messageOnAdd = formatMessage(i18n.addScheduleSuccess);
		this.device = this._getDeviceById(schedule.deviceId);

		this.onToggleAdvanced = this.onToggleAdvanced.bind(this);
		this.setRefScroll = this.setRefScroll.bind(this);
		this.scrollView = null;

		this.messageOnUpdateFail = formatMessage(i18n.updateScheduleFailure);
	}

	componentDidMount() {
		const { h1, h2 } = this;
		this.props.onDidMount(h1, h2);
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
			let message = error.message ? error.message : this.messageOnUpdateFail;
			this.openDialogueBox({
				text: message,
			});
		});
	};

	openDialogueBox(otherDialogueConfs?: Object = {}) {
		const { toggleDialogueBox } = this.props;
		const dialogueData = {
			...otherDialogueConfs,
			show: true,
			showHeader: true,
			showPositive: true,
			closeOnPressPositive: true,
		};
		toggleDialogueBox(dialogueData);
	}

	resetNavigation = () => {
		const { navigation, schedule, hiddenTabsCurrentUser } = this.props;

		const {
			visibleTabs = [],
			tabToCheckOrVeryNextIndex,
		} = prepareVisibleTabs(hiddenTabsCurrentUser, 'Scheduler');

		let routes = [
			{
				name: 'Tabs',
				state: {
					index: tabToCheckOrVeryNextIndex,
					routes: visibleTabs.map((vt: string): Object => {
						return {'name': vt};
					}),
				},
			},
			{
				name: 'InfoScreen',
				params: {
					info: 'add_schedule_another',
					deviceId: schedule.deviceId,
				},
			},
		];

		const resetAction = CommonActions.reset({
			index: 1,
			routes,
		});
		navigation.dispatch(resetAction);
	}

	onToggleAdvanced(state: boolean) {
		if (state && this.scrollView) {
			this.scrollView.scrollToEnd({animated: true});
		}
	}

	setRefScroll(ref: any) {
		this.scrollView = ref;
	}

	render(): React$Element<any> {
		const { schedule, paddingRight, appLayout, intl, actions, toggleDialogueBox } = this.props;
		const { formatDate } = intl;
		const { method, methodValue, weekdays } = schedule;
		const {
			container,
			row, iconSize,
			buttonStyle,
			iconStyle,
			iconContainerStyle,
		} = this._getStyle(appLayout);
		const selectedDays = getSelectedDays(weekdays, formatDate);
		const { deviceType, supportedMethods = {} } = this.device;
		const actionIcons = getDeviceActionIcon(deviceType, null, supportedMethods);

		const { retries = 0, retryInterval = 0, reps = 0 } = schedule;

		return (
			<ScrollView
				ref={this.setRefScroll}
				keyboardShouldPersistTaps={'always'}
				style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
				<View style={container}>
					<DeviceRow row={this.device} containerStyle={row} appLayout={appLayout} intl={intl}/>
					<ActionRow
						method={method}
						actionIcons={actionIcons}
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
						getSuntime={actions.getSuntime}
					/>
					<DaysRow selectedDays={selectedDays} appLayout={appLayout} intl={intl}/>
					<AdvancedSettingsBlock
						appLayout={appLayout}
						intl={intl}
						onPressInfo={toggleDialogueBox}
						onDoneEditAdvanced={actions.setAdvancedSettings}
						retries={retries}
						retryInterval={retryInterval}
						reps={reps}
						onToggleAdvanced={this.onToggleAdvanced}/>
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
				paddingVertical: padding - (padding / 4),
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
