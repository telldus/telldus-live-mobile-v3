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
	LayoutAnimation,
	BackHandler,
	Platform,
} from 'react-native';
import { connect } from 'react-redux';
const isEqual = require('react-fast-compare');

import {
	View,
	SettingsRow,
	TouchableButton,
	EditBox,
	ThemedScrollView,
} from '../../../../BaseComponents';

import {
	Associations,
	Configuration,
} from '../ZWave';

import {
	withTheme,
	PropsThemedComponent,
} from '../../HOC/withTheme';

import { LearnButton } from '../../TabViews/SubViews';
import {
	ExcludeDevice,
	DeviceSettings,
} from '../Common';
import {
	ReplaceFailedNode,
	Device433EditModel,
	ChangeDevicetypeBlock,
} from './SubViews';

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
	toggleStatusUpdatedViaScan433MHZ,
	setDeviceName,
	setDeviceModel,
	setDeviceProtocol,
	setWidgetParamsValue,
	setMetadata,
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
	prepare433MHzDeviceDefaultValueForParams,
	doesSupportEditModel,
	ZWaveFunctions,
	isBasicUser,
} from '../../../Lib';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = PropsThemedComponent & {
	isGatewayReachable: boolean,
	device: Object,
	inDashboard: boolean,
	addDevice433: Object,
	transports: string,
	gatewaySupportEditModel: boolean,
	currentScreen: string,
	gatewayTimezone: string,
	isBasic: string,

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
	editName: boolean,
	deviceName: string,
	devicetype: string,
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

	timeoutConfirmDeviceRemove: any;
	isMount: boolean;

	constructor(props: Props) {
		super(props);
		this.onValueChange = this.onValueChange.bind(this);
		this.setIgnoreDevice = this.setIgnoreDevice.bind(this);

		this.DeviceVendorInfo433MHz = undefined;
		const {
			widget433MHz = null,
			settings433MHz = null,
		} = this.get433MHzDeviceSettings();

		const {
			name,
			deviceType,
			ignored,
		} = props.device || {};

		this.state = {
			isHidden: ignored,
			excludeActive: false,
			isMarking: false,
			isReplacing: false,
			isDeleting433MHz: false,
			settings433MHz,
			widget433MHz,
			isSaving433MhzParams: false,
			editName: false,
			deviceName: name,
			devicetype: deviceType,
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

		this.timeoutConfirmDeviceRemove = null;
		this.refreshInfoDelay = null;

		this.onConfirmRemoveFailedNode = this.onConfirmRemoveFailedNode.bind(this);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { screenProps: screenPropsN, currentScreen, inDashboard: inDashboardN, ...othersN } = nextProps;
		const { appLayout } = screenPropsN;
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
				'gatewaySupportEditModel',
				'gatewayTimezone',
				'isBasic',
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
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
		if (this.timeoutConfirmDeviceRemove) {
			clearTimeout(this.timeoutConfirmDeviceRemove);
			this.timeoutConfirmDeviceRemove = null;
		}
		this.isMount = false;
		clearTimeout(this.refreshInfoDelay);
	}

	get433MHzDeviceSettings(): Object {
		const { device } = this.props;
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
		return this.getWidgetAndSettings(widget);
	}

	getWidgetAndSettings = (widget: string): Object => {
		const { formatMessage } = this.props.screenProps.intl;
		if (widget) {
			return {
				widget433MHz: widget,
				settings433MHz: getDeviceSettings(parseInt(widget, 10), formatMessage),
			};
		}
		return {};
	}

	onPressExcludeDevice() {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		this.setState({
			excludeActive: true,
		});
	}

	onPressCancelExclude() {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		this.setState({
			excludeActive: false,
		});
	}

	onPressMarkAsFailed() {
		const { screenProps, device, colors } = this.props;
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
						positiveText: formatMessage(i18n.remove),
						onPressPositive: this.onPressRemoveFailedNode,
						closeOnPressPositive: true,
						showNegative: true,
						negativeText: formatMessage(i18n.labelReplace),
						onPressNegative: this.onPressReplaceFailedNode,
						closeOnPressNegative: true,
						negTextColor: colors.inAppBrandSecondary,
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
			positiveText: formatMessage(i18n.remove),
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
			positiveText: formatMessage(i18n.delete),
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
			} else if (res.status && res.status === 'pending') {
				this.timeoutConfirmDeviceRemove = setTimeout(async () => {
					try {

						if (!this.isMount) {
							return;
						}

						const response = await dispatch(getDevices()) || {};

						if (!this.isMount) {
							return;
						}

						if (!response || !response.device) {
							this.onErrorDelete433();
						}

						let isRemoved = true;
						for (let i = 0; i < response.device.length; i++) {
							if (response.device[i].id && parseInt(response.device[i].id, 10) === device.id) {
								isRemoved = false;
								break;
							}
						}

						if (isRemoved && this.isMount) {
							this.setState({
								isDeleting433MHz: false,
							}, () => {
								this.goBack();
							});
						} else if (this.isMount) {
							this.onErrorDelete433();
						}

					} catch (err) {
						if (this.isMount) {
							this.onErrorDelete433();
						}
					}
				}, 1000);
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
		this.props.navigation.navigate('Devices');
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

	onPressSaveParams433MHz = async () => {
		const {
			addDevice433,
			device,
			dispatch,
		} = this.props;
		const {
			widget433MHz,
			devicetype: devicetypeNext,
		} = this.state;

		const {
			parameter,
			model,
			protocol,
			id,
		} = device;

		const { widgetParams433Device = {} } = addDevice433;

		const {
			model: _model,
			protocol: _protocol,
		} = widgetParams433Device;

		let promises = [];

		const isDeviceTypeEqual = this.isDeviceTypeEqual(device.deviceType, devicetypeNext);
		if (!isDeviceTypeEqual) {
			promises.push(
				dispatch(setMetadata(id, 'devicetype', devicetypeNext)),
				dispatch(setDeviceParameter(id, 'devicetype', devicetypeNext))
			);
		}

		const hasProtocolChanged = protocol !== _protocol;
		if (hasProtocolChanged) {
			promises.push(
				dispatch(setDeviceProtocol(id, _protocol))
			);
		}
		const hasModelChanged = model !== _model;
		if (hasModelChanged) {
			promises.push(
				dispatch(setDeviceModel(id, _model))
			);
		}

		const {
			devicetype,
		} = this.DeviceVendorInfo433MHz ? (this.DeviceVendorInfo433MHz.deviceInfo || {}) : {};

		const updateAllParamsFromLocal = hasModelChanged || hasProtocolChanged;

		const parameters = prepareDeviceParameters(parseInt(widget433MHz, 10), widgetParams433Device);
		if (parameters) {
			const settings = prepare433DeviceParamsToStore(parseInt(widget433MHz, 10), parameter) || {};
			if (settings || updateAllParamsFromLocal) {

				if (isDeviceTypeEqual) {
					promises.push(
						dispatch(setDeviceParameter(id, 'devicetype', devicetype))
					);
				}

				Object.keys(parameters).map((p: string) => {
					if (typeof parameters[p] !== 'undefined' && parameters[p] !== null) {
						promises.push(
							dispatch(setDeviceParameter(id, p, parameters[p]))
						);
					}
				});
			}
		}
		this.setState({
			isSaving433MhzParams: true,
		});

		let isAllGood = true;
		try {
			await Promise.all(promises.map((promise: Promise<any>): Promise<any> => {
				return promise.then((res: any): any => {
					if (!res || !res.status || res.status !== 'success') {
						isAllGood = false;
					}
					return res;
				}).catch((err: any): any => {
					isAllGood = false;
					return err;
				});
			}));
		} catch (e) {
			isAllGood = false;
		} finally {
			this.postSaveParams433MHz(id, isAllGood);
		}
	}

	postSaveParams433MHz = (deviceId: string, success: boolean = true) => {
		const {
			dispatch,
			screenProps,
		} = this.props;
		const { formatMessage } = screenProps.intl;

		if (success) {
			dispatch(toggleStatusUpdatedViaScan433MHZ(false));
		} else {
			this.props.showToast(formatMessage(i18n.settingsNotSaved));
		}

		this.refreshInfoDelay = setTimeout(() => {
			this.props.dispatch(getDeviceInfoCommon(deviceId)).then(() => {
				this.setState({
					isSaving433MhzParams: false,
				});
			}).catch(() => {
				this.setState({
					isSaving433MhzParams: false,
				});
			});
		}, 1000);
	}

	isDeviceTypeEqual = (devicetypeCurrent: string = '', devicetypeNext: string = ''): boolean => {
		devicetypeCurrent = devicetypeCurrent.toUpperCase();
		return devicetypeCurrent === devicetypeNext || devicetypeCurrent.slice(1, devicetypeCurrent.length) === devicetypeNext;
	}

	hasSettingsChanged = (widget433MHz: Object): boolean => {
		const {
			devicetype,
		} = this.state;

		const {
			addDevice433,
			device = {},
		} = this.props;

		const isDeviceTypeEqual = this.isDeviceTypeEqual(device.deviceType, devicetype);
		if (!isDeviceTypeEqual) {
			return true;
		}

		if (!widget433MHz) {
			return false;
		}

		const {
			parameter,
			model,
			protocol,
		} = device;

		const { widgetParams433Device = {} } = addDevice433;

		const {
			model: _model,
			protocol: _protocol,
		} = widgetParams433Device;
		const hasProtocolChanged = protocol !== _protocol;
		const hasModelChanged = model !== _model;

		if (hasProtocolChanged || hasModelChanged) {
			return true;
		}

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
			if (widgetParams433Device[s]) {
				hasChanged = !isEqual(availableSettings[s], widgetParams433Device[s]);
				if (hasChanged) {
					break;
				}
			}
		}

		return hasChanged;
	}

	_onValueChange = (devicetype: string) => {
		this.setState({
			devicetype,
		});
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
		this.isMount = true;
	}

	handleBackPress = (): boolean => {
		const { editName } = this.state;
		if (editName) {
			LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
			this.setState({
				editName: false,
				deviceName: this.props.device.name,
			});
			return true;
		}
		return false;
	}

	editName = () => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		this.setState({
			editName: true,
		});
	}

	onChangeName = (deviceName: string) => {
		this.setState({
			deviceName,
		});
	}

	submitName = () => {
		const { deviceName } = this.state;
		const { dispatch, device, screenProps } = this.props;
		const { toggleDialogueBox, intl } = screenProps;

		if (!deviceName || !deviceName.trim()) {
			toggleDialogueBox({
				show: true,
				showHeader: true,
				imageHeader: true,
				text: intl.formatMessage(i18n.errorNameFieldEmpty),
				showPositive: true,
			});
			return;
		}

		dispatch(setDeviceName(device.id, deviceName)).then(() => {
			LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
			dispatch(getDeviceInfoCommon(device.id));
			this.setState({
				editName: false,
			});
		}).catch((err: Object) => {
			LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
			this.setState({
				editName: false,
				deviceName: device.name,
			});
			const message = err.message ? err.message : null;
			dispatch(showToast(message));
		});
	}

	_onSelectModel = ({
		widget,
		protocol,
		model,
	}: Object) => {
		this.DeviceVendorInfo433MHz = getDeviceVendorInfo433MHz(protocol, model);
		const {
			widget433MHz = null,
			settings433MHz = null,
		} = this.getWidgetAndSettings(widget);
		this.setState({
			widget433MHz,
			settings433MHz,
		}, () => {

			const {
				device,
				dispatch,
			} = this.props;

			dispatch(setWidgetParamsValue({
				id: widget433MHz,
				deviceId: device.id,
				edit: true,
				...prepare433MHzDeviceDefaultValueForParams(parseInt(widget, 10)),
				model,
				protocol,
			}));
		});
	}

	renderExtraSettingsTop = (): Object => {
		const { device } = this.props;
		return (
			<Device433EditModel
				device={device}
				onSelectModel={this._onSelectModel}/>
		);
	}

	onPressManageShortcuts = () => {
		const {
			navigation,
			device,
			isBasic,
			screenProps,
		} = this.props;
		if (isBasic) {
			const {
				toggleDialogueBox,
				intl,
			} = screenProps;
			toggleDialogueBox({
				show: true,
				showHeader: true,
				imageHeader: true,
				header: intl.formatMessage(i18n.upgradeToPremium),
				text: intl.formatMessage(i18n.infoWhenAccessPremFromBasic),
				showPositive: true,
				showNegative: true,
				positiveText: intl.formatMessage(i18n.upgrade),
				onPressPositive: () => {
					navigation.navigate('PremiumUpgradeScreen');
				},
				closeOnPressPositive: true,
				timeoutToCallPositive: 200,
			});
			return;
		}
		navigation.navigate('SiriShortcutActionsScreen', {
			device,
		});
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
			editName,
			deviceName,
		} = this.state;
		const {
			device,
			screenProps,
			inDashboard,
			isGatewayReachable,
			transports,
			gatewaySupportEditModel,
			colors,
			gatewayTimezone,
		} = this.props;
		const { appLayout, intl } = screenProps;
		const { formatMessage } = intl;
		const {
			supportedMethods = {},
			id,
			clientId,
			transport,
			nodeInfo = {},
			name,
			clientDeviceId,
			deviceType,
		} = device;

		if (!id && !excludeActive) {
			return null;
		}

		const {
			container,
			containerWhenEditName,
			touchableButtonCommon,
			brandDanger,
			btnDisabledBg,
			coverStyleDeviceSettings433,
			labelStyleDeviceSettings433,
			learnButtonWithScan,
			labelStyle,
			editBoxStyle,
			padding,
			addToSiriButtonStyle,
			coverStyle,
		} = this.getStyle(appLayout);

		if (editName) {
			return (
				<View
					level={3}
					style={containerWhenEditName}>
					<EditBox
						value={deviceName}
						icon={'sensor'}
						label={formatMessage(i18n.name)}
						onChangeText={this.onChangeName}
						onSubmitEditing={this.submitName}
						appLayout={appLayout}
						containerStyle={editBoxStyle}/>
				</View>
			);
		}

		const { deviceInfo = {}} = this.DeviceVendorInfo433MHz || {};
		const {
			scannable,
			devicetype,
		} = deviceInfo;

		const settingsHasChanged = this.hasSettingsChanged(widget433MHz);

		const { LEARN } = supportedMethods;

		let learnButton = null;
		if (LEARN) {
			learnButton = <LearnButton
				id={id}
				style={!settings433MHz ? touchableButtonCommon : learnButtonWithScan}
				labelStyle={!settings433MHz ? {} : labelStyle}
				disabled={settingsHasChanged}/>;
		}

		const isZWave = transport === 'zwave';
		const is433MHz = is433MHzTransport(transport) || transport === 'egroup';
		const { isFailed = false } = nodeInfo;
		const manufacturerAttributes = nodeInfo && nodeInfo.cmdClasses ? nodeInfo.cmdClasses[ZWaveFunctions.COMMAND_CLASS_MANUFACTURER_SPECIFIC] : {};

		const transportsArray = transports.split(',');
		const showScan = supportsScan(transportsArray) && scannable;

		const showAssociations = nodeInfo.cmdClasses ? nodeInfo.cmdClasses[ZWaveFunctions.COMMAND_CLASS_ASSOCIATION] : false;

		const showConfiguration = nodeInfo.cmdClasses ? (nodeInfo.cmdClasses[ZWaveFunctions.COMMAND_CLASS_CONFIGURATION] ||
			nodeInfo.cmdClasses[ZWaveFunctions.COMMAND_CLASS_INDICATOR] ||
			nodeInfo.cmdClasses[ZWaveFunctions.COMMAND_CLASS_PROTECTION] ||
			nodeInfo.cmdClasses[ZWaveFunctions.COMMAND_CLASS_SWITCH_ALL]) :
			false;

		const isIOS = Platform.OS === 'ios';

		return (
			<ThemedScrollView
				level={3}
				style={{
					flex: 1,
				}}>
				{excludeActive ?
					<ExcludeDevice
						clientId={clientId}
						appLayout={appLayout}
						manufacturerAttributes={manufacturerAttributes}
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
								device={clientDeviceId}
								onDoneReplaceFailedNode={this.onDoneReplaceFailedNode}
								registerForWebSocketEvents={this.registerForWebSocketEvents}/>
							:
							<>
								<SettingsRow
									type={'text'}
									edit={true}
									onPress={this.editName}
									label={formatMessage(i18n.name)}
									value={name}
									appLayout={appLayout}
									intl={intl}
									keyboardTypeInLineEdit={'default'}/>
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
								{isIOS && (
									<TouchableButton
										text={formatMessage(i18n.manageSiriShortcuts)}
										onPress={this.onPressManageShortcuts}
										style={addToSiriButtonStyle}
										coverStyle={coverStyle}
										preformatted/>
								)}
								<ChangeDevicetypeBlock
									devicetype={deviceType}
									onValueChange={this._onValueChange}
									coverStyle={{
										marginTop: padding / 2,
									}}/>
								{!!showAssociations && (
									<Associations
										id={device.id}
										clientId={clientId}
										gatewayTimezone={gatewayTimezone}
										clientDeviceId={clientDeviceId}/>
								)}
								{!!showConfiguration && (
									<Configuration
										id={device.id}
										clientId={clientId}
										gatewayTimezone={gatewayTimezone}
										clientDeviceId={clientDeviceId}/>
								)}
								{!!settings433MHz &&
									<DeviceSettings
										coverStyle={coverStyleDeviceSettings433}
										labelStyle={labelStyleDeviceSettings433}
										deviceId={id}
										initializeValueFromStore={true}
										settings={settings433MHz}
										widgetId={widget433MHz}
										showScan={showScan}
										clientId={clientId}
										learnButton={learnButton}
										isSaving433MhzParams={isSaving433MhzParams}
										devicetype={devicetype}
										renderExtraSettingsTop={gatewaySupportEditModel ? this.renderExtraSettingsTop : undefined}/>
								}
								{settingsHasChanged &&
										<TouchableButton
											text={i18n.saveLabel}
											onPress={isSaving433MhzParams ? null : this.onPressSaveParams433MHz}
											disabled={isSaving433MhzParams}
											style={[touchableButtonCommon, {
												backgroundColor: isSaving433MhzParams ? btnDisabledBg : colors.inAppBrandSecondary,
											}]}
											showThrobber={isSaving433MhzParams}/>
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
													text={formatMessage(i18n.headerExclude)}
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
											text={formatMessage(i18n.delete)}
											onPress={this.onPressDelete433Device}
											disabled={isDeleting433MHz || isSaving433MhzParams}
											showThrobber={isDeleting433MHz}
											style={[touchableButtonCommon, {
												backgroundColor: (isDeleting433MHz || isSaving433MhzParams) ? btnDisabledBg : brandDanger,
											}]}/>
									)
								}
							</>
						}
					</View>
				}
			</ThemedScrollView>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const {
			paddingFactor,
			brandDanger,
			btnDisabledBg,
			subHeader,
			fontSizeFactorFour,
		} = Theme.Core;

		const padding = deviceWidth * paddingFactor;

		const fontSize = deviceWidth * fontSizeFactorFour;

		const fontSize2 = Math.floor(deviceWidth * 0.03);
		const heightCover = fontSize2 * 2.8;

		return {
			brandDanger,
			btnDisabledBg,
			padding,
			container: {
				flex: 0,
				paddingHorizontal: padding,
				paddingBottom: padding,
				paddingTop: padding / 2,
			},
			containerWhenEditName: {
				flex: 1,
				paddingHorizontal: padding,
				paddingBottom: padding,
				paddingTop: padding / 2,
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
				fontSize,
			},
			labelStyle: {
				fontSize: fontSize2,
			},
			editBoxStyle: {
				marginTop: padding * 2,
			},
			titleStyle: {
				marginTop: padding,
				marginBottom: 5,
				color: subHeader,
				fontSize: Math.floor(deviceWidth * 0.045),
			},
			addToSiriButtonStyle: {
				marginTop: padding / 2,
				width: undefined,
				maxWidth: deviceWidth - (padding * 3),
			},
			coverStyle: {
				flex: 0,
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
	const { route } = ownProps;
	const { id } = route.params || {};
	let device = state.devices.byId[id] || {};

	const { clientId } = device;
	const {
		online = false,
		websocketOnline = false,
		transports = '',
		type,
		timezone: gatewayTimezone,
	} = state.gateways.byId[clientId] || {};

	const gatewaySupportEditModel = doesSupportEditModel(type);
	const { addDevice433 = {}} = state.addDevice;

	const {
		dashboard,
		user: {
			userId,
			userProfile = {},
		},
		app: {defaultSettings},
	} = state;

	const { activeDashboardId } = defaultSettings || {};

	const { devicesById = {} } = dashboard;
	const userDbsAndDevicesById = devicesById[userId] || {};
	const devicesByIdInCurrentDb = userDbsAndDevicesById[activeDashboardId] || {};

	const {
		screen: currentScreen,
	} = state.navigation;

	const isBasic = isBasicUser(userProfile.pro);

	return {
		device,
		inDashboard: !!devicesByIdInCurrentDb[id],
		isGatewayReachable: online && websocketOnline,
		addDevice433,
		transports,
		gatewaySupportEditModel,
		currentScreen,
		gatewayTimezone,
		isBasic,
	};
}

const ThemedSettingsTab = withTheme(SettingsTab);
ThemedSettingsTab.displayName = 'SettingsTab';
module.exports = (connect(mapStateToProps, mapDispatchToProps)(ThemedSettingsTab): Object);
