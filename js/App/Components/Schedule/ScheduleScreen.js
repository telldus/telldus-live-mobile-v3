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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import { FullPageActivityIndicator, View, Modal, Dimensions } from 'BaseComponents';
import { NotificationComponent} from 'PreLoginScreen_SubViews';
import { SchedulePoster } from 'Schedule_SubViews';
import { getDeviceWidth } from 'Lib';

import * as scheduleActions from 'Actions_Schedule';
import * as modalActions from 'Actions_Modal';
import { getDevices } from 'Actions_Devices';
import { showToast } from 'Actions_App';
import { getJobs } from 'Actions';
import type { Schedule } from 'Reducers_Schedule';
import Theme from 'Theme';

type Props = {
	navigation: Object,
	children: Object,
	schedule?: Schedule,
	actions?: Object,
	devices?: Object,
};

type State = {
	h1: string,
	h2: string,
	infoButton: null | Object,
	loading: boolean,
};

export interface ScheduleProps {
	navigation: Object,
	actions: Object,
	onDidMount: (h1: string, h2: string, infoButton: ?Object) => void,
	schedule: Schedule,
	loading: (loading: boolean) => void,
	isEditMode: () => boolean,
	devices: Object,
}

class ScheduleScreen extends View<null, Props, State> {

	static propTypes = {
		navigation: PropTypes.object.isRequired,
		children: PropTypes.object.isRequired,
		schedule: PropTypes.object,
		actions: PropTypes.objectOf(PropTypes.func),
		devices: PropTypes.object,
	};

	state = {
		h1: '',
		h2: '',
		infoButton: null,
		loading: false,
	};

	constructor(props: Props) {
		super(props);

		this.backButton = {
			back: true,
			onPress: this.goBack,
		};

		this.onModalOpen = this.onModalOpen.bind(this);
		this.closeModal = this.closeModal.bind(this);
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		const isStateEqual = _.isEqual(this.state, nextState);
		const isPropsEqual = _.isEqual(this.props, nextProps);
		return !(isStateEqual && isPropsEqual);
	}

	goBack = () => {
		this.props.navigation.goBack(null);
	};

	onChildDidMount = (h1: string, h2: string, infoButton?: Object | null = null) => {
		this.setState({
			h1,
			h2,
			infoButton: null,
		});
	};

	loading = (loading: boolean) => {
		this.setState({ loading });
	};

	onModalOpen = () => {
	};

	closeModal = () => {
		this.props.actions.hideModal();
	};

	getRelativeData = (): Object => {
		let {modalExtras} = this.props;
		return {
			dialgueHeader: modalExtras.dialogueHeader ? modalExtras.dialogueHeader : false,
			showNegative: modalExtras.showNegative ? true : false,
			positiveText: modalExtras.positiveText ? modalExtras.positiveText : false,
			onPressPositive: modalExtras.onPressPositive ? modalExtras.onPressPositive : this.closeModal,
			onPressNegative: modalExtras.onPressNegative ? modalExtras.onPressNegative : this.closeModal,
		};
	};

	render(): React$Element<any> {
		const { children, navigation, actions, devices, schedule } = this.props;
		const { h1, h2, infoButton, loading } = this.state;
		const { style, modal } = this._getStyle();
		const { dialgueHeader, showNegative, positiveText, onPressPositive, onPressNegative} = this.getRelativeData();

		return (
			<View>
				{loading && (
					<FullPageActivityIndicator/>
				)}
				<View style={{
					flex: 1,
					opacity: loading ? 0 : 1,
				}}>
					<SchedulePoster h1={h1} h2={h2} infoButton={infoButton}/>
					<View style={style}>
						{React.cloneElement(
							children,
							{
								onDidMount: this.onChildDidMount,
								navigation,
								actions,
								paddingRight: style.paddingHorizontal,
								devices,
								schedule,
								loading: this.loading,
								isEditMode: this._isEditMode,
							},
						)}
					</View>
					<Modal
						modalStyle={[Theme.Styles.notificationModal, modal]}
						entry="ZoomIn"
						exit="ZoomOut"
						entryDuration={300}
						exitDuration={100}
						onOpen={this.onModalOpen}
						showModal={this.props.showModal}>
						<NotificationComponent
							header={dialgueHeader}
							text={this.props.validationMessage}
							showPositive={true}
							showNegative={showNegative}
							positiveText={positiveText}
							onPressPositive={onPressPositive}
							onPressNegative={onPressNegative} />
					</Modal>
				</View>
			</View>
		);
	}

	_isEditMode = (): boolean => {
		const { params } = this.props.navigation.state;
		return params && params.editMode;
	};

	_getStyle = (): Object => {
		const deviceWidth = getDeviceWidth();
		const deviceHeight = Dimensions.get('window').height;
		const padding = deviceWidth * 0.033333333;

		const isEdit = this.props.navigation.state.routeName === 'Edit';

		return {
			style: {
				flex: 1,
				paddingHorizontal: isEdit ? 0 : padding,
				paddingTop: isEdit ? 0 : padding,
			},
			modal: {
				alignSelf: 'center',
				top: deviceHeight * 0.3,
			},
		};
	};

}

type mapStateToPropsType = {
	schedule: Schedule,
	devices: Object,
	modal: Object,
};

const mapStateToProps = ({ schedule, devices, modal }: mapStateToPropsType): Object => (
	{
		schedule,
		devices,
		validationMessage: modal.data,
		showModal: modal.openModal,
		modalExtras: modal.extras,
	}
);

const mapDispatchToProps = (dispatch: Function): Object => (
	{
		actions: {
			...bindActionCreators({getJobs, showToast, ...scheduleActions, ...modalActions}, dispatch),
			getDevices: (): Object => dispatch(getDevices()),
		},
	}
);

export default connect(mapStateToProps, mapDispatchToProps)(ScheduleScreen);
