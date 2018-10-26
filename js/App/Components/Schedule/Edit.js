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
import { intlShape, injectIntl } from 'react-intl';

import {View, TouchableButton, Throbber} from '../../../BaseComponents';
import { ScheduleProps } from './ScheduleScreen';
import { getSelectedDays } from '../../Lib';
import { ActionRow, DaysRow, ScheduleSwitch, TimeRow, AdvancedSettingsBlock } from './SubViews';
import Theme from '../../Theme';
import i18n from '../../Translations/common';

interface Props extends ScheduleProps {
	devices: Object,
	intl: intlShape.isRequired,
}

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

	onToggleAdvanced: (boolean) => void;
	setRefScroll: (any) => void;
	scrollView: any;

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
		this.h2 = formatMessage(i18n.posterEditDevice);
		this.messageOnDelete = formatMessage(i18n.deleteScheduleSuccess);
		this.messageOnUpdate = formatMessage(i18n.updateScheduleSuccess);
		this.deleteScheduleDialogue = formatMessage(i18n.deleteScheduleDialogue);
		this.deleteScheduleDialogueHeader = `${formatMessage(i18n.deleteScheduleDialogueHeader)}?`;

		this.messageOnDeleteFail = formatMessage(i18n.deleteScheduleFailure);
		this.messageOnUpdateFail = formatMessage(i18n.updateScheduleFailure);

		this.onSaveSchedule = this.onSaveSchedule.bind(this);
		this.onDeleteSchedule = this.onDeleteSchedule.bind(this);

		this.onDeleteConfirm = this.onDeleteConfirm.bind(this);

		this.onToggleAdvanced = this.onToggleAdvanced.bind(this);
		this.setRefScroll = this.setRefScroll.bind(this);
		this.scrollView = null;
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
				this.resetNavigation();
				this.props.actions.getJobs();
				this.props.actions.showToast(this.messageOnUpdate, 'LONG');
			}).catch((error: Object) => {
				this.setState({
					isSaving: false,
				});
				let message = error.message ? error.message : this.messageOnUpdateFail;
				this.props.actions.showModal(message);
			});
		}
	};

	resetNavigation = () => {
		this.props.navigation.pop();
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
			this.resetNavigation();
			this.props.actions.getJobs();
			this.props.actions.showToast(this.messageOnDelete, 'LONG');
		}).catch((error: Object) => {
			this.setState({
				isDeleting: false,
				choseDelete: false,
			});
			let message = error.message ? error.message : this.messageOnDeleteFail;
			this.props.actions.showModal(message);
		});
	}

	onDeleteSchedule = () => {
		if (!this.state.isSaving) {
			this.setState({
				choseDelete: true,
			});
			const { formatMessage } = this.props.intl;
			const modalExtras = {
				dialogueHeader: this.deleteScheduleDialogueHeader,
				showPositive: true,
				showNegative: true,
				positiveText: formatMessage(i18n.delete).toUpperCase(),
				onPressPositive: this.onDeleteConfirm,
				onPressNegative: this.onDeleteCancel,
				showBackground: true,
			};
			this.props.actions.showModal(this.deleteScheduleDialogue, modalExtras);
		}
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
		const { appLayout, schedule, intl, actions } = this.props;
		const { formatMessage, formatDate } = intl;
		const { active, method, methodValue, weekdays, retries = 0, retryInterval = 0, reps = 0 } = schedule;
		const {
			container, row, save, cancel, throbber,
			buttonStyle, labelStyle,
			throbberContainer,
			buttonCoverStyle,
		} = this._getStyle(appLayout);
		const selectedDays = getSelectedDays(weekdays, formatDate);
		const labelPostScript = formatMessage(i18n.activateEdit);

		return (
			<ScrollView ref={this.setRefScroll} style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
				<View style={container}>
					<ScheduleSwitch value={active} onValueChange={this.setScheduleActiveState} appLayout={appLayout} intl={intl}/>
					<ActionRow
						method={method}
						showValue={true}
						methodValue={methodValue}
						onPress={this.editAction}
						containerStyle={row}
						appLayout={appLayout}
						intl={intl}
						labelPostScript={labelPostScript}
					/>
					<TimeRow
						schedule={this.props.schedule}
						device={this.device}
						containerStyle={row}
						onPress={this.editTime}
						appLayout={appLayout}
						intl={intl}
						labelPostScript={labelPostScript}
						getSuntime={actions.getSuntime}
					/>
					<DaysRow
						selectedDays={selectedDays}
						onPress={this.editDays}
						appLayout={appLayout}
						intl={intl}
						labelPostScript={labelPostScript}
						containerStyle={row}
					/>
					<AdvancedSettingsBlock
						appLayout={appLayout}
						intl={intl}
						onPressInfo={actions.showModal}
						onDoneEditAdvanced={actions.setAdvancedSettings}
						retries={retries}
						retryInterval={retryInterval}
						reps={reps}
						onToggleAdvanced={this.onToggleAdvanced}/>
					<View style={buttonCoverStyle}>
						<TouchableButton
							text={i18n.confirmAndSave}
							style={[buttonStyle, save]}
							labelStyle={labelStyle}
							onPress={this.onSaveSchedule}
							accessible={true}
						/>
						{this.state.isSaving &&
							(
								<Throbber
									throbberContainerStyle={throbberContainer}
									throbberStyle={throbber}
								/>
							)}
					</View>
					<View style={buttonCoverStyle}>
						<TouchableButton
							text={i18n.delete}
							style={[buttonStyle, cancel]}
							labelStyle={labelStyle}
							onPress={this.onDeleteSchedule}
							accessible={true}
						/>
						{this.state.isDeleting &&
					(
						<Throbber
							throbberContainerStyle={throbberContainer}
							throbberStyle={throbber}
						/>
					)}
					</View>
				</View>
			</ScrollView>
		);
	}

	_navigate = (routeName: string) => {
		this.props.navigation.navigate({
			routeName,
			key: routeName,
			params: {
				editMode: true,
			},
		});
	};

	_getDeviceById = (deviceId: number): Object => {
		const device = this.props.devices.byId[deviceId];
		return device ? device : {};
	};

	_getStyle = (appLayout: Object): Object => {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const { shadow: themeShadow } = Theme.Core;
		const shadow = Object.assign({}, themeShadow, {
			shadowOpacity: 0.5,
			shadowOffset: {
				...themeShadow.shadowOffset,
				height: 2,
			},
		});

		const padding = deviceWidth * Theme.Core.paddingFactor;

		const fontSizeButtonLabel = deviceWidth * 0.033;

		return {
			container: {
				flex: 1,
				paddingHorizontal: padding,
				paddingVertical: padding - (padding / 4),
			},
			row: {
				marginVertical: padding / 4,
			},
			save: {
				backgroundColor: Theme.Core.brandSecondary,
				marginTop: padding / 2,
			},
			cancel: {
				backgroundColor: Theme.Core.brandDanger,
			},
			buttonCoverStyle: {
				alignItems: 'center',
				justifyContent: 'center',
				marginVertical: padding / 4,
			},
			buttonStyle: {
				maxWidth: undefined,
				...shadow,
			},
			labelStyle: {
				fontSize: fontSizeButtonLabel,
			},
			throbberContainer: {
				right: -(deviceWidth * 0.12),
			},
			throbber: {
				fontSize: 30,
				color: Theme.Core.brandSecondary,
			},
		};
	};

}

export default injectIntl(Edit);
