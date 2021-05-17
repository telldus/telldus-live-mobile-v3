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
import { BackHandler, KeyboardAvoidingView, Platform } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
const isEqual = require('react-fast-compare');

import { FullPageActivityIndicator, View, NavigationHeaderPoster } from '../../../BaseComponents';
import Theme from '../../Theme';

import * as scheduleActions from '../../Actions/Schedule';
import * as modalActions from '../../Actions/Modal';
import { getDevices } from '../../Actions/Devices';
import { showToast } from '../../Actions/App';
import { getJobs } from '../../Actions';
import type { Schedule } from '../../Actions/Types';

import shouldUpdate from '../../Lib/shouldUpdate';

type Props = {
	gateways: Object,
	schedule?: Schedule,
	actions?: Object,
	devices: Object,
	screenProps: Object,
	ScreenName: string,
	route: Object,
	currentScreen: string,
	hiddenTabsCurrentUser: Array<string>,

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
	route: Object,
}

class ScheduleScreen extends View<null, Props, State> {

	handleBackPress: () => boolean;

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
		if (nextProps.ScreenName === nextProps.currentScreen) {
			const isStateEqual = isEqual(this.state, nextState);
			if (!isStateEqual) {
				return true;
			}
			const { gateways, devices, currentScreen, ...otherProps } = this.props;
			const { gateways: gatewaysN, devices: devicesN, ...otherPropsN } = nextProps;
			if ((Object.keys(gateways.byId).length !== Object.keys(gatewaysN.byId).length) || (Object.keys(devices.byId).length !== Object.keys(devicesN.byId).length)) {
				return true;
			}
			if (currentScreen !== nextProps.currentScreen) {
				return true;
			}
			const propsChange = shouldUpdate(otherProps, otherPropsN, ['schedule', 'hiddenTabsCurrentUser']);
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
		const { screenProps } = this.props;
		const { toggleDialogueBox } = screenProps;
		const dialogueData = {
			show: false,
		};
		toggleDialogueBox(dialogueData);
	};

	render(): React$Element<any> {
		const {
			children,
			navigation,
			actions,
			devices,
			schedule,
			screenProps,
			currentScreen,
			gateways,
			route,
			hiddenTabsCurrentUser,
		} = this.props;
		const {
			appLayout,
		} = screenProps;
		const { h1, h2, infoButton, loading } = this.state;
		const { style } = this._getStyle(appLayout);

		return (
			<View
				level={3}
				style={{
					flex: 1,
				}}>
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
						align={'left'}
						navigation={navigation}
						{...screenProps}
						currentScreen={currentScreen}
						leftIcon={(currentScreen === 'Device' || currentScreen === 'Edit')
							? 'close' : undefined}/>
					<KeyboardAvoidingView
						behavior="padding"
						style={{flex: 1}}
						contentContainerStyle={{flexGrow: 1}}
						keyboardVerticalOffset={Platform.OS === 'android' ? -500 : 0}>
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
									currentScreen,
									gateways,
									route,
									hiddenTabsCurrentUser,
								},
							)}
						</View>
					</KeyboardAvoidingView>
				</View>
			</View>
		);
	}

	_isEditMode = (): boolean => {
		const { route } = this.props;
		const { editMode = false } = route.params || {};
		return editMode;
	};

	_getStyle = (appLayout: Object): Object => {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const padding = deviceWidth * Theme.Core.paddingFactor;

		const { currentScreen } = this.props;

		const screenDontPad = ['Device', 'Edit', 'ActionThermostat', 'ActionThermostatTwo'];
		const doPad = screenDontPad.indexOf(currentScreen) === -1;
		return {
			style: {
				flex: 1,
				paddingHorizontal: doPad ? padding : 0,
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
	navigation: Object,
	user: Object,
};

const mapStateToProps = ({ user, schedule, devices, modal, app, gateways, navigation }: mapStateToPropsType): Object => {

	const {
		screen: currentScreen,
		hiddenTabs = {},
	} = navigation;

	const { userId } = user;

	const hiddenTabsCurrentUser = hiddenTabs[userId] || [];

	return {
		schedule,
		devices,
		gateways,
		currentScreen,
		hiddenTabsCurrentUser,
	};
};

const mapDispatchToProps = (dispatch: Function): Object => (
	{
		actions: {
			...bindActionCreators({...scheduleActions, ...modalActions, getJobs, showToast}, dispatch),
			getDevices: (): Object => dispatch(getDevices()),
		},
	}
);

export default (connect(mapStateToProps, mapDispatchToProps)(ScheduleScreen): Object);
