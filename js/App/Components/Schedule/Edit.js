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

import React, { PropTypes } from 'react';
import { ScrollView } from 'react-native';
import {NavigationActions} from 'react-navigation';
import { defineMessages } from 'react-intl';

import {View, TouchableButton, Dimensions, Throbber} from 'BaseComponents';
import { ScheduleProps } from './ScheduleScreen';
import { getDeviceWidth, getSelectedDays } from 'Lib';
import { ActionRow, DaysRow, ScheduleSwitch, TimeRow } from 'Schedule_SubViews';
import Theme from 'Theme';

interface Props extends ScheduleProps {
	devices: Object,
}

const messages = defineMessages({
	confirmAndSave: {
		id: 'button.confirmAndSave',
		defaultMessage: 'Confirm & Save',
		description: 'save button label in edit schedule page',
	},
	delete: {
		id: 'button.delete',
		defaultMessage: 'Delete',
		description: 'delete button label in edit schedule page',
	},
});

type State = {
	isSaving: boolean,
	isDeleting: boolean,
};

export default class Edit extends View<null, Props, State> {

	state: State;

	onSaveSchedule: () => void;
	onDeleteSchedule: () => void;

	static propTypes = {
		navigation: PropTypes.object,
		actions: PropTypes.object,
		onDidMount: PropTypes.func,
		schedule: PropTypes.object,
		devices: PropTypes.object,
		loading: PropTypes.func,
	};

	constructor(props: Props) {
		super(props);

		this.state = {
			isSaving: false,
			isDeleting: false,
		};

		this.device = this._getDeviceById(this.props.schedule.deviceId);

		this.h1 = `Edit ${this.device.name}`;
		this.h2 = 'Click the details you want to edit';

		this.onSaveSchedule = this.onSaveSchedule.bind(this);
		this.onDeleteSchedule = this.onDeleteSchedule.bind(this);
	}

	componentDidMount() {
		this.props.onDidMount(this.h1, this.h2);
	}

	componentWillUnmount() {
		this.props.actions.resetSchedule();
		clearInterval(this.rotateInterval);
	}

	editAction = () => {
		this._navigate('Action');
	};

	editTime = () => {
		this._navigate('Time');
	};

	editDays = () => {
		this._navigate('Days');
	};

	setScheduleActiveState = (active: boolean) => {
		this.props.actions.setActiveState(active);
	};

	onSaveSchedule = () => {
		if (!this.state.isDeleting) {
			this.setState({
				isSaving: true,
			});
			let options = this.props.actions.getScheduleOptions(this.props.schedule);
			this.props.actions.saveSchedule(options).then((response: Object) => {
				this.setState({
					isSaving: false,
				});
				if (response.id) {
					this.resetNavigation();
					this.props.actions.getJobs();
				} else if (response.message) {
					this.props.actions.showModal(response.message);
				}
			});
		}
	};

	resetNavigation = () => {
		this.props.navigation.dispatch(NavigationActions.reset({
			index: 0,
			actions: [
				NavigationActions.navigate({
					routeName: 'Device',
					params: {
						reset: true,
					},
				}),
			],
		}));
	}

	onDeleteSchedule = () => {
		if (!this.state.isSaving) {
			this.setState({
				isDeleting: true,
			});
			this.props.actions.deleteSchedule(this.props.schedule.id).then((response: Object) => {
				this.setState({
					isDeleting: false,
				});
				if (response.status && response.status === 'success') {
					this.resetNavigation();
					this.props.actions.getJobs();
				} else if (response.message) {
					this.props.actions.showModal(response.message);
				}
			});
		}
	}

	render(): React$Element<any> {
		const { active, method, methodValue, weekdays } = this.props.schedule;
		const { container, row, save, cancel, throbber,
			throbberContainer, throbberContainerOnSave, throbberContainerOnDelete } = this._getStyle();
		const selectedDays = getSelectedDays(weekdays);
		const throbberContainerStyle = this.state.isSaving ? throbberContainerOnSave : this.state.isDeleting ? throbberContainerOnDelete : {};

		return (
			<ScrollView>
				<ScheduleSwitch value={active} onValueChange={this.setScheduleActiveState}/>
				<View style={container}>
					<ActionRow
						method={method}
						showValue={true}
						methodValue={methodValue}
						onPress={this.editAction}
						containerStyle={row}
					/>
					<TimeRow
						schedule={this.props.schedule}
						device={this.device}
						containerStyle={row}
						onPress={this.editTime}
					/>
					<DaysRow selectedDays={selectedDays} onPress={this.editDays}/>
					<View style={{flexDirection: 'column'}}>
						<TouchableButton
							text={messages.confirmAndSave}
							style={save}
							onPress={this.onSaveSchedule}
						/>
						<TouchableButton
							text={messages.delete}
							style={cancel}
							onPress={this.onDeleteSchedule}
						/>
						{!!(this.state.isDeleting || this.state.isSaving) &&
						(
							<Throbber
								throbberContainerStyle={[throbberContainer, throbberContainerStyle]}
								throbberStyle={throbber}
							/>
						)}
					</View>
				</View>
			</ScrollView>
		);
	}

	_navigate = (routeName: string) => {
		this.props.navigation.navigate(routeName, { editMode: true });
	};

	_getDeviceById = (deviceId: number): Object => {
		return this.props.devices.byId[deviceId];
	};

	_getStyle = (): Object => {
		const deviceWidth = getDeviceWidth();
		const deviceHeight = Dimensions.get('window').height;

		const offsetSmall = deviceWidth * 0.026666667;
		const offsetMiddle = deviceWidth * 0.033333333;

		return {
			container: {
				paddingHorizontal: offsetMiddle,
				alignItems: 'center',
				marginBottom: offsetSmall,
			},
			row: {
				marginBottom: offsetSmall,
			},
			save: {
				marginTop: 10,
				backgroundColor: Theme.Core.brandSecondary,
				color: '#fff',
			},
			cancel: {
				marginTop: 10,
				backgroundColor: Theme.Core.brandDanger,
				color: '#fff',
			},
			throbberContainer: {
				right: -(deviceWidth * 0.12),
			},
			throbberContainerOnDelete: {
				top: deviceHeight * 0.16,
			},
			throbberContainerOnSave: {
				top: deviceHeight * 0.04,
			},
			throbber: {
				fontSize: 30,
				color: Theme.Core.brandSecondary,
			},
		};
	};

}
