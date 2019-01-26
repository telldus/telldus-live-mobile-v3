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
import { ScrollView, LayoutAnimation } from 'react-native';
import { connect } from 'react-redux';
const isEqual = require('react-fast-compare');

import {
	View,
	TabBar,
	SettingsRow,
	TouchableButton,
} from '../../../../BaseComponents';

import { LearnButton } from '../../TabViews/SubViews';
import { ExcludeDevice } from './SubViews';

import { getDevices, setIgnoreDevice } from '../../../Actions/Devices';
import {
	addToDashboard,
	removeFromDashboard,
	showToast,
	getSocketObject,
	sendSocketMessage,
	processWebsocketMessage,
} from '../../../Actions';
import { shouldUpdate, LayoutAnimations } from '../../../Lib';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	isGatewayReachable: boolean,
	device: Object,
	inDashboard: boolean,

	dispatch: Function,
	onAddToDashboard: (id: number) => void,
	onRemoveFromDashboard: (id: number) => void,
	screenProps: Object,
	navigation: Object,
	showToast: (?string) => void,
	getSocketObject: (number) => any,
	sendSocketMessage: (number, string, string, Object) => any,
	processWebsocketMessage: (number, string, string, Object) => any,
};

type State = {
	isHidden: boolean,
	excludeActive: boolean,
};


class SettingsTab extends View {
	props: Props;
	state: State;

	onValueChange: number => void;
	setIgnoreDevice: (boolean) => void;
	onPressExcludeDevice: () => void;
	goBack: () => void;
	onPressCancelExclude: () => void;

	static navigationOptions = ({ navigation }: Object): Object => ({
		tabBarLabel: ({ tintColor }: Object): Object => (
			<TabBar
				icon="settings"
				tintColor={tintColor}
				label={i18n.settingsHeader}
				accessibilityLabel={i18n.deviceSettingsTab}/>
		),
		tabBarOnPress: ({scene, jumpToIndex}: Object) => {
			navigation.navigate({
				routeName: 'Settings',
				key: 'Settings',
			});
		},
	});

	constructor(props: Props) {
		super(props);
		this.onValueChange = this.onValueChange.bind(this);
		this.setIgnoreDevice = this.setIgnoreDevice.bind(this);

		this.state = {
			isHidden: props.device.ignored,
			excludeActive: false,
		};

		let { formatMessage } = props.screenProps.intl;

		this.addedToHiddenList = formatMessage(i18n.deviceAddedToHiddenList);
		this.removedFromHiddenList = formatMessage(i18n.deviceRemovedFromHiddenList);

		this.onPressExcludeDevice = this.onPressExcludeDevice.bind(this);
		this.goBack = this.goBack.bind(this);
		this.onPressCancelExclude = this.onPressCancelExclude.bind(this);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { screenProps: screenPropsN, inDashboard: inDashboardN, ...othersN } = nextProps;
		const { currentScreen, appLayout } = screenPropsN;
		if (currentScreen === 'Settings') {
			const isStateEqual = isEqual(this.state, nextState);
			if (!isStateEqual) {
				return true;
			}

			const { screenProps, inDashboard, ...others } = this.props;
			if ((screenProps.appLayout.width !== appLayout.width) || (inDashboardN !== inDashboard)) {
				return true;
			}

			const propsChange = shouldUpdate(others, othersN, ['device', 'isGatewayReachable']);
			if (propsChange) {
				return true;
			}

			return false;
		}
		return false;
	}

	onPressExcludeDevice() {
		LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
		this.setState({
			excludeActive: true,
		});
	}

	onPressCancelExclude() {
		LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
		this.setState({
			excludeActive: false,
		});
	}

	goBack() {
		this.props.navigation.navigate({
			routeName: 'Devices',
			key: 'Devices',
		});
	}

	onValueChange(value: boolean) {
		if (!value) {
			this.props.onRemoveFromDashboard(this.props.device.id);
		} else {
			this.props.onAddToDashboard(this.props.device.id);
		}
	}

	setIgnoreDevice(value: boolean) {
		const { device } = this.props;
		const ignore = device.ignored ? 0 : 1;
		this.setState({
			isHidden: value,
		});
		this.props.dispatch(setIgnoreDevice(device.id, ignore)).then((res: Object) => {
			const message = !value ?
				this.removedFromHiddenList : this.addedToHiddenList;
			this.props.dispatch(getDevices());
			this.props.showToast(message);
		}).catch((err: Object) => {
			const	message = err.message ? err.message : null;
			this.setState({
				isHidden: device.ignored,
			});
			this.props.showToast(message);
		});
	}

	render(): Object | null {
		const { isHidden, excludeActive } = this.state;
		const { device, screenProps, inDashboard, isGatewayReachable } = this.props;
		const { appLayout, intl } = screenProps;
		const { formatMessage } = intl;
		const { supportedMethods = {}, id, clientId, transport } = device;

		if (!id && !excludeActive) {
			return null;
		}

		const {
			container,
			learn,
			excludeButtonStyle,
			brandSecondary,
			btnDisabledBg,
		} = this.getStyle(appLayout);

		const { LEARN } = supportedMethods;

		let learnButton = null;

		if (LEARN) {
			learnButton = <LearnButton id={id} style={learn} />;
		}

		const canExclude = transport === 'zwave';

		return (
			<ScrollView style={{
				backgroundColor: Theme.Core.appBackground,
			}}>{excludeActive ?

					<ExcludeDevice
						clientId={clientId}
						appLayout={appLayout}
						intl={intl}
						sendSocketMessage={this.props.sendSocketMessage}
						getSocketObject={this.props.getSocketObject}
						showToast={this.props.showToast}
						processWebsocketMessage={this.props.processWebsocketMessage}
						onExcludeSuccess={this.goBack}
						onPressCancelExclude={this.onPressCancelExclude}/>
					:
					<View style={container}>
						<SettingsRow
							label={formatMessage(i18n.showOnDashborad)}
							onValueChange={this.onValueChange}
							value={inDashboard}
							appLayout={appLayout}
						/>
						<SettingsRow
							label={formatMessage(i18n.hideFromListD)}
							onValueChange={this.setIgnoreDevice}
							value={isHidden}
							appLayout={appLayout}
						/>
						{learnButton}
						{canExclude && (
							<TouchableButton
								text={formatMessage(i18n.headerExclude).toUpperCase()}
								onPress={this.onPressExcludeDevice}
								disabled={!isGatewayReachable}
								style={[excludeButtonStyle, {
									backgroundColor: isGatewayReachable ? brandSecondary : btnDisabledBg,
								}]}/>
						)}
					</View>
				}
			</ScrollView>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const { paddingFactor, appBackground, brandSecondary, btnDisabledBg } = Theme.Core;

		const padding = deviceWidth * paddingFactor;

		return {
			brandSecondary,
			btnDisabledBg,
			container: {
				flex: 0,
				paddingHorizontal: padding,
				paddingBottom: padding,
				paddingTop: padding / 2,
				backgroundColor: appBackground,
			},
			learn: {
				marginHorizontal: width * 0.25,
				marginVertical: padding / 2,
			},
			excludeButtonStyle: {
				marginTop: padding * 2,
			},
		};
	}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		onAddToDashboard: (id: number): any => dispatch(addToDashboard('device', id)),
		onRemoveFromDashboard: (id: number): any => dispatch(removeFromDashboard('device', id)),
		sendSocketMessage: (id: number, module: string, action: string, data: Object): any => dispatch(sendSocketMessage(id, module, action, data)),
		getSocketObject: (id: number): any => dispatch(getSocketObject(id)),
		showToast: (message: string): any => dispatch(showToast(message)),
		processWebsocketMessage: (gatewayId: number, message: string, title: string, websocket: Object): any => processWebsocketMessage(gatewayId, message, title, dispatch, websocket),
		dispatch,
	};
}
function mapStateToProps(state: Object, ownProps: Object): Object {
	const id = ownProps.navigation.getParam('id', null);
	let device = state.devices.byId[id];
	device = device ? device : {};

	const { clientId } = device;
	const { online = false, websocketOnline = false } = state.gateways.byId[clientId] || {};

	return {
		device: device ? device : {},
		inDashboard: !!state.dashboard.devicesById[id],
		isGatewayReachable: online && websocketOnline,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SettingsTab);
