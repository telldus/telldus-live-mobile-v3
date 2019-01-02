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
import { BackHandler } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
const isEqual = require('react-fast-compare');

import { FullPageActivityIndicator, View, DialogueBox, NavigationHeaderPoster } from '../../../BaseComponents';
import Theme from '../../Theme';

import * as scheduleActions from '../../Actions/Schedule';
import * as modalActions from '../../Actions/Modal';
import { getDevices } from '../../Actions/Devices';
import { showToast } from '../../Actions/App';
import { getJobs } from '../../Actions';
import type { Schedule } from '../../Reducers/Schedule';

import shouldUpdate from '../../Lib/shouldUpdate';

type Props = {
	gateways: Object,
	schedule?: Schedule,
	actions?: Object,
	devices: Object,
	screenProps: Object,
	ScreenName: string,

	navigation: Object,
	children: Object,
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

	handleBackPress: () => void;

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

		this.closeModal = this.closeModal.bind(this);
		this.handleBackPress = this.handleBackPress.bind(this);
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	handleBackPress(): boolean {
		let { navigation } = this.props;
		navigation.pop();
		return true;
	}


	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		if (nextProps.ScreenName === nextProps.screenProps.currentScreen) {
			const isStateEqual = isEqual(this.state, nextState);
			if (!isStateEqual) {
				return true;
			}
			const { gateways, devices, screenProps, ...otherProps } = this.props;
			const { gateways: gatewaysN, devices: devicesN, screenProps: screenPropsN, ...otherPropsN } = nextProps;
			if ((Object.keys(gateways.byId).length !== Object.keys(gatewaysN.byId).length) || (Object.keys(devices.byId).length !== Object.keys(devicesN.byId).length)) {
				return true;
			}
			if (screenProps.currentScreen !== screenPropsN.currentScreen) {
				return true;
			}
			const propsChange = shouldUpdate(otherProps, otherPropsN, ['schedule', 'showModal']);
			if (propsChange) {
				return true;
			}
			return false;
		}
		return false;
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

	closeModal = () => {
		this.props.actions.hideModal();
	};

	getRelativeData = (): Object => {
		const { modalExtras } = this.props;
		const {
			dialogueHeader = false,
			showPositive = true,
			showNegative = false,
			positiveText = null,
			onPressPositive = this.closeModal,
			onPressNegative = this.closeModal,
			imageHeader = false,
			showIconOnHeader = false,
			onPressHeader = this.closeModal,
			onPressHeaderIcon = this.closeModal,
		} = modalExtras;
		return {
			dialogueHeader,
			showPositive,
			showNegative,
			positiveText,
			onPressPositive,
			onPressNegative,
			imageHeader,
			showIconOnHeader,
			onPressHeader,
			onPressHeaderIcon,
		};
	};

	render(): React$Element<any> {
		const {
			children,
			navigation,
			actions,
			devices,
			schedule,
			screenProps,
			gateways,
		} = this.props;
		const {
			appLayout,
		} = screenProps;
		const { h1, h2, infoButton, loading } = this.state;
		const { style } = this._getStyle(appLayout);
		const {
			dialogueHeader,
			showPositive,
			showNegative,
			positiveText,
			onPressPositive,
			onPressNegative,
			imageHeader,
			showIconOnHeader,
			onPressHeader,
			onPressHeaderIcon,
		} = this.getRelativeData();

		return (
			<View style={{flex: 1}}>
				{loading && (
					<FullPageActivityIndicator/>
				)}
				<View style={{
					flex: 1,
					opacity: loading ? 0 : 1,
				}}>
					<NavigationHeaderPoster
						h1={h1} h2={h2}
						infoButton={infoButton}
						align={'right'}
						navigation={navigation}
						{...screenProps}
						leftIcon={screenProps.currentScreen === 'InitialScreen' ? 'close' : undefined}/>
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
								...screenProps,
								gateways,
							},
						)}
					</View>
					<DialogueBox
						showDialogue={this.props.showModal}
						header={dialogueHeader}
						text={this.props.validationMessage}
						showPositive={showPositive}
						showNegative={showNegative}
						positiveText={positiveText}
						onPressPositive={onPressPositive}
						onPressNegative={onPressNegative}
						imageHeader={imageHeader}
						showIconOnHeader={showIconOnHeader}
						onPressHeader={onPressHeader}
						onPressHeaderIcon={onPressHeaderIcon}/>
				</View>
			</View>
		);
	}

	_isEditMode = (): boolean => {
		const { navigation } = this.props;
		const editMode = navigation.getParam('editMode', false);
		return editMode;
	};

	_getStyle = (appLayout: Object): Object => {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const padding = deviceWidth * Theme.Core.paddingFactor;

		const { navigation } = this.props;
		const editMode = navigation.getParam('editMode', false);

		const notEdit = (this.props.screenProps.currentScreen === 'InitialScreen' && (!editMode))
			|| this.props.screenProps.currentScreen !== 'InitialScreen';
		return {
			style: {
				flex: 1,
				paddingHorizontal: notEdit ? padding : 0,
			},
		};
	};

}

type mapStateToPropsType = {
	schedule: Schedule,
	devices: Object,
	modal: Object,
	app: Object,
	gateways: Object,
};

const mapStateToProps = ({ schedule, devices, modal, app, gateways }: mapStateToPropsType): Object => (
	{
		schedule,
		devices,
		gateways,
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
