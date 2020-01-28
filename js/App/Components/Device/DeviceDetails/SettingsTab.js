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
import {
	ExcludeDevice,
	DeviceSettings,
} from '../Common';
import { ReplaceFailedNode } from './SubViews';

import { getDevices, setIgnoreDevice } from '../../../Actions/Devices';
import { requestNodeInfo } from '../../../Actions/Websockets';
import {
	addToDashboard,
	removeFromDashboard,
	showToast,
	sendSocketMessage,
	registerForWebSocketEvents,
	removeDevice,
	setDeviceParameter,
	getDeviceInfoCommon,
} from '../../../Actions';
import {
	shouldUpdate,
	LayoutAnimations,
	is433MHzTransport,
	getDeviceVendorInfo433MHz,
	getDeviceSettings,
	prepare433DeviceParamsToStore,
	prepareDeviceParameters,
	supportsScan,
} from '../../../Lib';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	isGatewayReachable: boolean,
	device: Object,
	inDashboard: boolean,
	addDevice433: Object,
	transports: string,

	dispatch: Function,
	onAddToDashboard: (id: number) => void,
	onRemoveFromDashboard: (id: number) => void,
	screenProps: Object,
	navigation: Object,
	showToast: (?string) => void,
	sendSocketMessage: (number, string, string, Object) => any,
};

type State = {
	isHidden: boolean,
	excludeActive: boolean,
	isMarking: boolean,
	isReplacing: boolean,
	isDeleting433MHz: boolean,
	settings433MHz: Object | null,
	widget433MHz: string | null,
	isSaving433MhzParams: boolean,
};


class SettingsTab extends View {
	props: Props;
	state: State;

	onValueChange: (boolean) => void;
	setIgnoreDevice: (boolean) => void;
	onPressExcludeDevice: () => void;
	goBack: () => void;
	onPressCancelExclude: () => void;

	onPressMarkAsFailed: () => void;
	onPressReplaceFailedNode: () => void;
	onPressRemoveFailedNode: () => void;
	onDoneReplaceFailedNode: () => void;

	onConfirmRemoveFailedNode: () => void;

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

		this.DeviceVendorInfo433MHz = undefined;
		const {
			widget433MHz = null,
			settings433MHz = null,
		} = this.get433MHzDeviceSettings();

		this.state = {
			isHidden: props.device.ignored,
			excludeActive: false,
			isMarking: false,
			isReplacing: false,
			isDeleting433MHz: false,
			settings433MHz,
			widget433MHz,
			isSaving433MhzParams: false,
		};

		let { formatMessage } = props.screenProps.intl;

		this.addedToHiddenList = formatMessage(i18n.deviceAddedToHiddenList);
		this.removedFromHiddenList = formatMessage(i18n.deviceRemovedFromHiddenList);

		this.onPressExcludeDevice = this.onPressExcludeDevice.bind(this);
		this.goBack = this.goBack.bind(this);
		this.onPressCancelExclude = this.onPressCancelExclude.bind(this);

		this.onPressMarkAsFailed = this.onPressMarkAsFailed.bind(this);
		this.onPressReplaceFailedNode = this.onPressReplaceFailedNode.bind(this);
		this.onPressRemoveFailedNode = this.onPressRemoveFailedNode.bind(this);
		this.onDoneReplaceFailedNode = this.onDoneReplaceFailedNode.bind(this);

		this.markAsFailedTimeoutOne = null;
		this.markAsFailedTimeoutTwo = null;

		this.onConfirmRemoveFailedNode = this.onConfirmRemoveFailedNode.bind(this);
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

			const propsChange = shouldUpdate(others, othersN, [
				'device',
				'isGatewayReachable',
				'addDevice433',
				'transports',
			]);
			if (propsChange) {
				return true;
			}

			return false;
		}
		return false;
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		const { device, navigation } = this.props;
		if ((prevProps.device && prevProps.device.id) && (!device || !device.id)) {
			navigation.popToTop();
		}
	}

	componentWillUnmount() {
		clearTimeout(this.markAsFailedTimeoutOne);
		clearTimeout(this.markAsFailedTimeoutTwo);
	}

	get433MHzDeviceSettings(): Object {
		const { screenProps, device } = this.props;
		const { formatMessage } = screenProps.intl;
		const { protocol, model, transport } = device;

		if (!is433MHzTransport(transport)) {
			return {};
		}
		this.DeviceVendorInfo433MHz = getDeviceVendorInfo433MHz(protocol, model);
		if (!this.DeviceVendorInfo433MHz) {
			return {};
		}
		const {
			widget,
		} = this.DeviceVendorInfo433MHz.deviceInfo || {};
		if (widget) {
			return {
				widget433MHz: widget,
				settings433MHz: getDeviceSettings(parseInt(widget, 10), formatMessage),
			};
		}
		return {};
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

	onPressMarkAsFailed() {
		const { screenProps, device } = this.props;
		const { formatMessage } = screenProps.intl;
		const { clientId, clientDeviceId } = device;
		this.setState({
			isMarking: true,
		});
		this.sendSocketMessage(clientId, 'markNodeAsFailed', clientDeviceId);

		const that = this;
		this.markAsFailedTimeoutOne = setTimeout(() => {
			// Request for latest node info
			that.sendSocketMessage(clientId, 'nodeInfo', clientDeviceId);

			// Can take some time to receive, so the second timeout
			that.markAsFailedTimeoutTwo = setTimeout(() => {
				const { nodeInfo = {} } = that.props.device;
				const { isFailed = false } = nodeInfo;
				this.setState({
					isMarking: false,
				});
				if (!isFailed) {
					const dialogueData = {
						show: true,
						showPositive: true,
						header: formatMessage(i18n.messageCouldNotMarkFailedH),
						imageHeader: true,
						text: formatMessage(i18n.messageCouldNotMarkFailedB),
						showHeader: true,
						closeOnPressPositive: true,
						capitalizeHeader: false,
					};
					screenProps.toggleDialogueBox(dialogueData);
				} else {
					const dialogueData = {
						show: true,
						showPositive: true,
						positiveText: formatMessage(i18n.remove).toUpperCase(),
						onPressPositive: this.onPressRemoveFailedNode,
						closeOnPressPositive: true,
						showNegative: true,
						negativeText: formatMessage(i18n.labelReplace).toUpperCase(),
						onPressNegative: this.onPressReplaceFailedNode,
						closeOnPressNegative: true,
						negTextColor: Theme.Core.brandSecondary,
						showHeader: true,
						header: formatMessage(i18n.messageMarkedFailedH),
						imageHeader: true,
						showIconOnHeader: true,
						closeOnPressHeader: true,
						capitalizeHeader: false,
						text: formatMessage(i18n.messageMarkedFailedB),
						timeoutToCallPositive: 400,
						timeoutToCallNegative: 200,
					};
					screenProps.toggleDialogueBox(dialogueData);
				}
			}, 1000);
		}, 8000);
	}

	onPressReplaceFailedNode() {
		this.setState({
			isReplacing: true,
		});
	}

	onDoneReplaceFailedNode() {
		const { dispatch, device } = this.props;
		const { clientId, clientDeviceId } = device;
		dispatch(requestNodeInfo(clientId, clientDeviceId));
		this.setState({
			isReplacing: false,
		});
	}

	onPressRemoveFailedNode() {
		const { toggleDialogueBox, intl } = this.props.screenProps;
		const { formatMessage } = intl;

		const dialogueData = {
			show: true,
			showPositive: true,
			positiveText: formatMessage(i18n.remove).toUpperCase(),
			showNegative: true,
			header: `${formatMessage(i18n.labelRemoveFailed)}?`,
			imageHeader: true,
			text: formatMessage(i18n.messageOnRemoveFailedNode),
			showHeader: true,
			closeOnPressPositive: true,
			onPressPositive: this.onConfirmRemoveFailedNode,
			capitalizeHeader: false,
		};
		toggleDialogueBox(dialogueData);
	}

	onConfirmRemoveFailedNode() {
		const { clientId, clientDeviceId } = this.props.device;
		this.sendSocketMessage(clientId, 'removeFailedNode', clientDeviceId);
	}

	onPressDelete433Device = () => {
		const { toggleDialogueBox, intl } = this.props.screenProps;
		const { formatMessage } = intl;

		const dialogueData = {
			show: true,
			showPositive: true,
			positiveText: formatMessage(i18n.delete).toUpperCase(),
			showNegative: true,
			header: formatMessage(i18n.deleteDeviceWarningTitle),
			imageHeader: true,
			text: formatMessage(i18n.deleteDeviceWarningContent),
			showHeader: true,
			closeOnPressPositive: true,
			onPressPositive: this.onConfirmDelete433Mhz,
			capitalizeHeader: false,
		};
		toggleDialogueBox(dialogueData);
	}

	onConfirmDelete433Mhz = () => {
		const { dispatch, device } = this.props;
		this.setState({
			isDeleting433MHz: true,
		});
		dispatch(removeDevice(device.id)).then(async (res: Object) => {
			if (res.status && res.status === 'success') {
				try {
					await dispatch(getDevices());
				// eslint-disable-next-line no-empty
				} catch (err) {

				} finally {
					this.setState({
						isDeleting433MHz: false,
					}, () => {
						this.goBack();
					});
				}
			} else {
				this.onErrorDelete433();
			}
		}).catch((err: Object) => {
			this.onErrorDelete433(err.message);
		});
	}

	onErrorDelete433 = (message?: string) => {
		this.setState({
			isDeleting433MHz: false,
		}, () => {
			const { toggleDialogueBox, intl } = this.props.screenProps;
			const { formatMessage } = intl;
			const dialogueData = {
				show: true,
				showPositive: true,
				imageHeader: true,
				text: message || formatMessage(i18n.unknownError),
				showHeader: true,
				closeOnPressPositive: true,
				capitalizeHeader: false,
			};
			toggleDialogueBox(dialogueData);
		});
	}

	sendSocketMessage(clientId: number, action: string, clientDeviceId: number) {
		const { sendSocketMessage: SSM } = this.props;
		SSM(clientId, 'client', 'forward', {
			'module': 'zwave',
			'action': action,
			'device': clientDeviceId,
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

	registerForWebSocketEvents = (callbacks: Object): () => Object => {
		const { device, dispatch } = this.props;
		return dispatch(registerForWebSocketEvents(device.clientId, callbacks));
	}

	onPressSaveParams433MHz = () => {
		const {
			addDevice433,
			device,
			dispatch,
		} = this.props;
		const {
			widget433MHz,
		} = this.state;

		const {
			parameter,
			id,
		} = device;

		const { widgetParams433Device = {} } = addDevice433;
		const parameters = prepareDeviceParameters(parseInt(widget433MHz, 10), widgetParams433Device);
		if (!parameters) {
			return;
		}

		const settings = prepare433DeviceParamsToStore(parseInt(widget433MHz, 10), parameter) || {};
		if (!settings) {
			return;
		}

		let availableSettings = {};
		Object.keys(settings).map((s: string) => {
			if (typeof settings[s] !== 'undefined' && settings[s] !== null) {
				availableSettings[s] = settings[s];
			}
		});

		let promises = [];
		Object.keys(parameters).map((p: string) => {
			if (!isEqual(availableSettings[p], widgetParams433Device[p])) {
				promises.push(
					dispatch(setDeviceParameter(id, p, parameters[p]))
				);
			}
		});

		this.setState({
			isSaving433MhzParams: true,
		});

		Promise.all(promises.map((promise: Promise<any>): Promise<any> => {
			return promise.then((res: any): any => res).catch((err: any): any => err);
		})).then(() => {
			this.postSaveParams433MHz(id, true);
		}).catch(() => {
			// TODO: Show message on error saving new params!
			this.postSaveParams433MHz(id, false);
		});
	}

	postSaveParams433MHz = (deviceId: string, success: boolean = true) => {
		this.props.dispatch(getDeviceInfoCommon(deviceId)).then(() => {
			this.setState({
				isSaving433MhzParams: false,
			});
		}).catch(() => {
			this.setState({
				isSaving433MhzParams: false,
			});
		});
	}

	hasSettingsChanged = (widget433MHz: Object): boolean => {
		if (!widget433MHz) {
			return false;
		}
		const {
			addDevice433,
			device,
		} = this.props;
		const {
			parameter,
		} = device;

		const { widgetParams433Device = {} } = addDevice433;
		const settings = prepare433DeviceParamsToStore(parseInt(widget433MHz, 10), parameter) || {};
		if (!settings) {
			return false;
		}

		let availableSettings = {};
		Object.keys(settings).map((s: string) => {
			if (typeof settings[s] !== 'undefined' && settings[s] !== null) {
				availableSettings[s] = settings[s];
			}
		});

		let hasChanged = false;
		for (let s in availableSettings) {
			hasChanged = !isEqual(availableSettings[s], widgetParams433Device[s]);
			if (hasChanged) {
				break;
			}
		}
		return hasChanged;
	}

	render(): Object | null {
		const {
			isHidden,
			excludeActive,
			isMarking,
			isReplacing,
			isDeleting433MHz,
			settings433MHz,
			widget433MHz,
			isSaving433MhzParams,
		} = this.state;
		const {
			device,
			screenProps,
			inDashboard,
			isGatewayReachable,
			transports,
		} = this.props;
		const { appLayout, intl } = screenProps;
		const { formatMessage } = intl;
		const {
			supportedMethods = {},
			id,
			clientId,
			transport,
			nodeInfo = {},
		} = device;

		if (!id && !excludeActive) {
			return null;
		}

		const {
			container,
			touchableButtonCommon,
			brandDanger,
			btnDisabledBg,
			coverStyleDeviceSettings433,
			labelStyleDeviceSettings433,
			brandSecondary,
			learnButtonWithScan,
			labelStyle,
		} = this.getStyle(appLayout);

		const { LEARN } = supportedMethods;

		let learnButton = null;

		if (LEARN) {
			learnButton = <LearnButton
				id={id}
				style={!settings433MHz ? touchableButtonCommon : learnButtonWithScan}
				labelStyle={!settings433MHz ? {} : labelStyle}/>;
		}

		const isZWave = transport === 'zwave';
		const is433MHz = is433MHzTransport(transport);
		const { isFailed = false } = nodeInfo;

		const settingsHasChanged = this.hasSettingsChanged(widget433MHz);

		const { deviceInfo = {}} = this.DeviceVendorInfo433MHz || {};
		const transportsArray = transports.split(',');
		const showScan = supportsScan(transportsArray) && deviceInfo.scannable;

		return (
			<ScrollView style={{
				backgroundColor: Theme.Core.appBackground,
			}}>
				{excludeActive ?

					<ExcludeDevice
						clientId={clientId}
						appLayout={appLayout}
						intl={intl}
						showToast={this.props.showToast}
						onExcludeSuccess={this.goBack}
						onPressCancelExclude={this.onPressCancelExclude}
						registerForWebSocketEvents={this.registerForWebSocketEvents}/>
					:
					<View style={container}>
						{isReplacing ?
							<ReplaceFailedNode
								intl={intl}
								appLayout={appLayout}
								device={device}
								onDoneReplaceFailedNode={this.onDoneReplaceFailedNode}
								registerForWebSocketEvents={this.registerForWebSocketEvents}/>
							:
							<>
								<SettingsRow
									label={formatMessage(i18n.showOnDashborad)}
									onValueChange={this.onValueChange}
									value={inDashboard}
									appLayout={appLayout}
									intl={intl}
								/>
								<SettingsRow
									label={formatMessage(i18n.hideFromListD)}
									onValueChange={this.setIgnoreDevice}
									value={isHidden}
									appLayout={appLayout}
									intl={intl}
								/>
								{!!settings433MHz &&
								<>
									<DeviceSettings
										coverStyle={coverStyleDeviceSettings433}
										labelStyle={labelStyleDeviceSettings433}
										deviceId={id}
										initializeValueFromStore={true}
										settings={settings433MHz}
										widgetId={widget433MHz}
										showScan={showScan}
										clientId={clientId}
										learnButton={learnButton}/>
										{settingsHasChanged &&
										<TouchableButton
											text={i18n.saveLabel}
											onPress={isSaving433MhzParams ? null : this.onPressSaveParams433MHz}
											disabled={isSaving433MhzParams}
											style={[touchableButtonCommon, {
												backgroundColor: isSaving433MhzParams ? btnDisabledBg : brandSecondary,
											}]}
											showThrobber={isSaving433MhzParams}/>
										}
								</>
								}
								{!settings433MHz && learnButton}
								{isZWave && (
									<>
										{isFailed ?
											<>
												{!isReplacing &&
													<>
														<TouchableButton
															text={i18n.labelRemoveFailed}
															onPress={this.onPressRemoveFailedNode}
															disabled={!isGatewayReachable}
															style={[touchableButtonCommon, {
																backgroundColor: isGatewayReachable ? brandDanger : btnDisabledBg,
															}]}/>
														<TouchableButton
															text={i18n.labelReplaceFailed}
															onPress={this.onPressReplaceFailedNode}
															disabled={!isGatewayReachable}
															style={[touchableButtonCommon, {
																backgroundColor: isGatewayReachable ? brandDanger : btnDisabledBg,
															}]}/>
													</>
												}
											</>
											:
											<>
												<TouchableButton
													text={i18n.labelMarkAsFailed}
													onPress={this.onPressMarkAsFailed}
													disabled={!isGatewayReachable || isMarking}
													style={[touchableButtonCommon, {
														backgroundColor: isGatewayReachable ? brandDanger : btnDisabledBg,
													}]}
													showThrobber={isMarking}/>
												<TouchableButton
													text={formatMessage(i18n.headerExclude).toUpperCase()}
													onPress={this.onPressExcludeDevice}
													disabled={!isGatewayReachable}
													style={[touchableButtonCommon, {
														backgroundColor: isGatewayReachable ? brandDanger : btnDisabledBg,
													}]}/>
											</>
										}
									</>
								)}
								{
									is433MHz && (
										<TouchableButton
											text={formatMessage(i18n.delete).toUpperCase()}
											onPress={this.onPressDelete433Device}
											disabled={isDeleting433MHz}
											showThrobber={isDeleting433MHz}
											style={[touchableButtonCommon, {
												backgroundColor: brandDanger,
											}]}/>
									)
								}
							</>
						}
					</View>
				}
			</ScrollView>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const {
			paddingFactor,
			appBackground,
			brandDanger,
			btnDisabledBg,
			brandSecondary,
		} = Theme.Core;

		const padding = deviceWidth * paddingFactor;

		const fontSize = deviceWidth * 0.04;

		const fontSize2 = Math.floor(deviceWidth * 0.03);
		const heightCover = fontSize2 * 2.8;

		return {
			brandDanger,
			btnDisabledBg,
			brandSecondary,
			container: {
				flex: 0,
				paddingHorizontal: padding,
				paddingBottom: padding,
				paddingTop: padding / 2,
				backgroundColor: appBackground,
			},
			touchableButtonCommon: {
				marginTop: padding * 2,
				minWidth: Math.floor(deviceWidth * 0.6),
			},
			learnButtonWithScan: {
				height: heightCover,
				width: Math.floor((deviceWidth - (padding * 3)) / 2 ),
				borderRadius: heightCover / 2,
				paddingVertical: undefined,
				paddingHorizontal: undefined,
				maxWidth: undefined,
				minWidth: undefined,
			},
			coverStyleDeviceSettings433: {
				marginHorizontal: 0,
			},
			labelStyleDeviceSettings433: {
				color: '#000',
				fontSize,
			},
			labelStyle: {
				fontSize: fontSize2,
			},
		};
	}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		onAddToDashboard: (id: number): any => dispatch(addToDashboard('device', id)),
		onRemoveFromDashboard: (id: number): any => dispatch(removeFromDashboard('device', id)),
		sendSocketMessage: (id: number, module: string, action: string, data: Object): any => dispatch(sendSocketMessage(id, module, action, data)),
		showToast: (message: string): any => dispatch(showToast(message)),
		dispatch,
	};
}
function mapStateToProps(state: Object, ownProps: Object): Object {
	const id = ownProps.navigation.getParam('id', null);
	let device = state.devices.byId[id];
	device = device ? device : {};

	const { clientId } = device;
	const { online = false, websocketOnline = false, transports = '' } = state.gateways.byId[clientId] || {};

	const { addDevice433 = {}} = state.addDevice;

	return {
		device: device ? device : {},
		inDashboard: !!state.dashboard.devicesById[id],
		isGatewayReachable: online && websocketOnline,
		addDevice433,
		transports,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SettingsTab);
