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
import { intlShape, injectIntl, defineMessages } from 'react-intl';

import {View, TouchableButton, Throbber} from '../../../BaseComponents';
import { ScheduleProps } from './ScheduleScreen';
import { getSelectedDays } from '../../Lib';
import { ActionRow, DaysRow, ScheduleSwitch, TimeRow } from 'Schedule_SubViews';
import Theme from '../../Theme';
import i18n from '../../Translations/common';

interface Props extends ScheduleProps {
	devices: Object,
	intl: intlShape.isRequired,
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
	updateScheduleSuccess: {
		id: 'toast.updateScheduleSuccess',
		defaultMessage: 'Schedule has been updated successfully',
		description: 'The message to show, when a schedule is updated and saved successfully',
	},
	deleteScheduleSuccess: {
		id: 'toast.deleteScheduleSuccess',
		defaultMessage: 'Schedule has been deleted successfully',
		description: 'The message to show, when a schedule is deleted successfully',
	},
	deleteScheduleDialogue: {
		id: 'modal.deleteScheduleDialogue',
		defaultMessage: 'Are you sure you want to delete the schedule ?',
		description: 'Dialogue box content when user choose to delete schedule.',
	},
	deleteScheduleDialogueHeader: {
		id: 'modal.deleteScheduleDialogueHeader',
		defaultMessage: 'DELETE',
		description: 'Dialogue box header when user choose to delete schedule.',
	},
	posterEditDevice: {
		id: 'schedule.posterEditDevice',
		defaultMessage: 'Click the details you want to edit',
	},
});

type State = {
	isSaving: boolean,
	isDeleting: boolean,
	choseDelete: boolean,
};

class Edit extends View<null, Props, State> {

	state: State;

	onSaveSchedule: () => void;
	onDeleteSchedule: () => void;
	onDeleteConfirm: () => void;

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
			choseDelete: false,
		};

		this.device = this._getDeviceById(this.props.schedule.deviceId);

		let { formatMessage } = this.props.intl;

		this.h1 = `${formatMessage(i18n.edit)} ${this.device.name}`;
		this.h2 = formatMessage(messages.posterEditDevice);
		this.messageOnDelete = formatMessage(messages.deleteScheduleSuccess);
		this.messageOnUpdate = formatMessage(messages.updateScheduleSuccess);
		this.deleteScheduleDialogue = formatMessage(messages.deleteScheduleDialogue);
		this.deleteScheduleDialogueHeader = `${formatMessage(messages.deleteScheduleDialogueHeader)}?`;

		this.onSaveSchedule = this.onSaveSchedule.bind(this);
		this.onDeleteSchedule = this.onDeleteSchedule.bind(this);

		this.onDeleteConfirm = this.onDeleteConfirm.bind(this);
	}

	componentDidMount() {
		this.props.onDidMount(this.h1, this.h2);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'InitialScreen';
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
		if (!this.state.isDeleting && !this.state.choseDelete) {
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
					this.props.actions.showToast('schedule', this.messageOnUpdate, 'LONG');
				} else if (response.message) {
					this.props.actions.showModal(response.message);
				}
			});
		}
	};

	resetNavigation = () => {
		this.props.rootNavigator.goBack();
	}

	onDeleteCancel = () => {
		this.props.actions.hideModal();
		this.setState({
			choseDelete: false,
		});
	}

	onDeleteConfirm = () => {
		this.props.actions.hideModal();
		this.setState({
			isDeleting: true,
		});
		this.props.actions.deleteSchedule(this.props.schedule.id).then((response: Object) => {
			this.setState({
				isDeleting: false,
				choseDelete: false,
			});
			if (response.status && response.status === 'success') {
				this.resetNavigation();
				this.props.actions.getJobs();
				this.props.actions.showToast('schedule', this.messageOnDelete, 'LONG');
			} else if (response.message) {
				this.props.actions.showModal(response.message);
			}
		});
	}

	onDeleteSchedule = () => {
		if (!this.state.isSaving) {
			this.setState({
				choseDelete: true,
			});
			let modalExtras = {
				dialogueHeader: this.deleteScheduleDialogueHeader,
				showNegative: true,
				onPressPositive: this.onDeleteConfirm,
				onPressNegative: this.onDeleteCancel,
				showBackground: true,
			};
			this.props.actions.showModal(this.deleteScheduleDialogue, modalExtras);
		}
	}

	render(): React$Element<any> {
		const { appLayout, schedule, intl } = this.props;
		const { active, method, methodValue, weekdays } = schedule;
		const { container, row, save, cancel, throbber,
			throbberContainer, throbberContainerOnSave, throbberContainerOnDelete } = this._getStyle(appLayout);
		const selectedDays = getSelectedDays(weekdays);
		const throbberContainerStyle = this.state.isSaving ? throbberContainerOnSave : this.state.isDeleting ? throbberContainerOnDelete : {};

		return (
			<ScrollView>
				<ScheduleSwitch value={active} onValueChange={this.setScheduleActiveState} appLayout={appLayout} intl={intl}/>
				<View style={container}>
					<ActionRow
						method={method}
						showValue={true}
						methodValue={methodValue}
						onPress={this.editAction}
						containerStyle={row}
						appLayout={appLayout}
						intl={intl}
					/>
					<TimeRow
						schedule={this.props.schedule}
						device={this.device}
						containerStyle={row}
						onPress={this.editTime}
						appLayout={appLayout}
						intl={intl}
					/>
					<DaysRow selectedDays={selectedDays} onPress={this.editDays} appLayout={appLayout}/>
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
			</ScrollView>
		);
	}

	_navigate = (routeName: string) => {
		this.props.rootNavigator.setParams({
			renderRootHeader: false,
		});
		this.props.navigation.navigate(routeName, { editMode: true });
	};

	_getDeviceById = (deviceId: number): Object => {
		return this.props.devices.byId[deviceId];
	};

	_getStyle = (appLayout: Object): Object => {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const deviceHeight = isPortrait ? height : width;

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
			},
			cancel: {
				marginTop: 10,
				backgroundColor: Theme.Core.brandDanger,
			},
			throbberContainer: {
				right: -(deviceWidth * 0.12),
			},
			throbberContainerOnDelete: {
				top: deviceHeight * 0.65,
				left: deviceWidth * 0.65,
			},
			throbberContainerOnSave: {
				top: deviceHeight * 0.53,
				left: deviceWidth * 0.65,
			},
			throbber: {
				fontSize: 30,
				color: Theme.Core.brandSecondary,
			},
		};
	};

}

export default injectIntl(Edit);
