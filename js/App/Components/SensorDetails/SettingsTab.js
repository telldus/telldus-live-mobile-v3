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
} from 'react-native';
import { connect } from 'react-redux';
const isEqual = require('react-fast-compare');

import {
	View,
	Text,
	SettingsRow,
	TouchableButton,
	EditBox,
	ThemedScrollView,
	EmptyView,
} from '../../../BaseComponents';
import {
	ExcludeDevice,
} from '../Device/Common';
import {
	ReplaceFailedNode,
} from '../Device/DeviceDetails/SubViews';
import {
	AddToDashboardScale,
} from './SubViews';

import {
	addToDashboard,
	removeFromDashboard,
	showToast,
	setKeepHistory,
	setIgnoreSensor,
	getSensorInfo,
	setSensorName,
	removeSensorHistory,
	resetSensorMaxMin,
	registerForWebSocketEvents,
	sendSocketMessage,
} from '../../Actions';
import { clearHistory } from '../../Actions/LocalStorage';

import { requestNodeInfo } from '../../Actions/Websockets';

import {
	shouldUpdate,
	LayoutAnimations,
	ZWaveFunctions,
} from '../../Lib';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

type Props = {
	dispatch: Function,
	sensor: Object,
	inDashboard: boolean,
	navigation: Object,
	isGatewayReachable: boolean,
	currentScreen: string,

	screenProps: Object,
	onAddToDashboard: (id: number) => void,
	onRemoveFromDashboard: (id: number) => void,
	sendSocketMessage: (number, string, string, Object) => any,
};

type State = {
	isHidden: boolean,
	keepHistory: boolean,
	editName: boolean,
	sensorName: string,
	switchConf: {
		transition: boolean,
		source: string,
	},
	excludeActive: boolean,
	isReplacing: boolean,
	isMarking: boolean,
};


class SettingsTab extends View {
	props: Props;
	state: State;

	onValueChange: boolean => void;
	setIgnoreSensor: (boolean) => void;
	setKeepHistory: (boolean) => void;

	editName: () => void;
	onChangeName: (string) => void;
	clearHistory: () => void;
	resetMaxMin: () => void;
	onConfirmResetMaxMin: () => void;
	onConfirmClearHistory: () => void;
	closeModal: () => void;
	submitName: () => void;
	clearHistoryCache: () => void;
	onConfirmClearHistoryCache: () => void;

	handleBackPress: () => boolean;

	static getDerivedStateFromProps(props: Object, state: Object): null | Object {
		const { currentScreen, sensor } = props;
		const { switchConf } = state;
		const { transition, source } = switchConf;

		// This is required to make the 'keepHistory' prop update when changed from history tab
		// also while toggling switch prevent update in between API response.
		if (currentScreen === 'SSettings' &&
			state.keepHistory !== sensor.keepHistory &&
			source !== 'keepHistory' && !transition
		) {
			return {
				keepHistory: sensor.keepHistory,
			};
		}
		return null;
	}

	constructor(props: Props) {
		super(props);
		this.onValueChange = this.onValueChange.bind(this);
		this.setIgnoreSensor = this.setIgnoreSensor.bind(this);
		this.setKeepHistory = this.setKeepHistory.bind(this);

		this.state = {
			isHidden: props.sensor.ignored,
			keepHistory: props.sensor.keepHistory,
			editName: false,
			sensorName: props.sensor.name,
			switchConf: {
				transition: false,
				source: '',
			},
			excludeActive: false,
			isReplacing: false,
			isMarking: false,
		};

		const { formatMessage } = props.screenProps.intl;

		this.addedToHiddenList = formatMessage(i18n.sensorAddedToHiddenList);
		this.removedFromHiddenList = formatMessage(i18n.sensorRemovedFromHiddenList);

		this.toastStoreHistory = formatMessage(i18n.toastStoreHistory);
		this.toastStoreNotHistory = formatMessage(i18n.toastStoreNotHistory);

		this.editName = this.editName.bind(this);
		this.onChangeName = this.onChangeName.bind(this);
		this.clearHistory = this.clearHistory.bind(this);
		this.resetMaxMin = this.resetMaxMin.bind(this);
		this.onConfirmClearHistory = this.onConfirmClearHistory.bind(this);
		this.onConfirmResetMaxMin = this.onConfirmResetMaxMin.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.submitName = this.submitName.bind(this);
		this.clearHistoryCache = this.clearHistoryCache.bind(this);
		this.onConfirmClearHistoryCache = this.onConfirmClearHistoryCache.bind(this);

		this.handleBackPress = this.handleBackPress.bind(this);

		this.markAsFailedTimeoutOne = null;
		this.markAsFailedTimeoutTwo = null;
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
	}

	componentWillUnmount() {
		clearTimeout(this.markAsFailedTimeoutOne);
		clearTimeout(this.markAsFailedTimeoutTwo);
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { currentScreen, screenProps: screenPropsN, inDashboard: inDashboardN, ...othersN } = nextProps;
		const { appLayout } = screenPropsN;
		if (currentScreen === 'SSettings') {
			if (this.props.currentScreen !== 'SSettings') {
				return true;
			}

			const isStateEqual = isEqual(this.state, nextState);
			if (!isStateEqual) {
				return true;
			}

			const { screenProps, inDashboard, ...others } = this.props;
			if ((screenProps.appLayout.width !== appLayout.width) || (inDashboardN !== inDashboard)) {
				return true;
			}

			const propsChange = shouldUpdate(others, othersN, ['sensor', 'isGatewayReachable']);
			if (propsChange) {
				return true;
			}

			return false;
		}
		return false;
	}

	handleBackPress(): boolean {
		const { editName } = this.state;
		if (editName) {
			LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
			this.setState({
				editName: false,
				sensorName: this.props.sensor.name,
			});
			return true;
		}
		return false;
	}

	editName() {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		this.setState({
			editName: true,
		});
	}

	onChangeName(sensorName: string) {
		this.setState({
			sensorName,
		});
	}

	submitName() {
		const { sensorName } = this.state;
		const { dispatch, sensor, screenProps } = this.props;
		const { toggleDialogueBox, intl } = screenProps;

		if (!sensorName || !sensorName.trim()) {
			toggleDialogueBox({
				show: true,
				showHeader: true,
				imageHeader: true,
				text: intl.formatMessage(i18n.errorNameFieldEmpty),
				showPositive: true,
			});
			return;
		}

		dispatch(setSensorName(sensor.id, sensorName)).then(() => {
			LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
			dispatch(getSensorInfo(sensor.id));
			this.setState({
				editName: false,
			});
		}).catch((err: Object) => {
			LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
			this.setState({
				editName: false,
				sensorName: sensor.name,
			});
			const	message = err.message ? err.message : null;
			dispatch(showToast(message));
		});
	}

	clearHistoryCache() {
		this.openDialogueBox('clearHistoryCache');
	}

	onConfirmClearHistoryCache() {
		const { dispatch, sensor, screenProps } = this.props;
		const { formatMessage } = screenProps.intl;

		clearHistory('sensor', sensor.id).then(() => {
			dispatch(showToast(formatMessage(i18n.clearCacheSuccess)));
			this.closeModal();
		}).catch(() => {
			dispatch(showToast(null));
			this.closeModal();
		});
	}

	clearHistory() {
		this.openDialogueBox('clearHistory');
	}

	onConfirmClearHistory() {
		const { dispatch, sensor, screenProps } = this.props;
		const { formatMessage } = screenProps.intl;

		dispatch(removeSensorHistory(sensor.id)).then(() => {
			dispatch(showToast(formatMessage(i18n.clearSuccess)));
			this.closeModal();
			clearHistory('sensor', sensor.id);
		}).catch((err: Object) => {
			this.closeModal();
			const	message = err.message ? err.message : null;
			dispatch(showToast(message));
		});
	}

	resetMaxMin() {
		this.openDialogueBox('resetMaxMin');
	}

	closeModal() {
		const { screenProps } = this.props;
		const { toggleDialogueBox } = screenProps;
		const dialogueData = {show: false};
		toggleDialogueBox(dialogueData);
	}

	onConfirmResetMaxMin() {
		const { dispatch, sensor, screenProps } = this.props;
		const { formatMessage } = screenProps.intl;

		dispatch(resetSensorMaxMin(sensor.id)).then(() => {
			dispatch(getSensorInfo(sensor.id));
			this.closeModal();
			dispatch(showToast(formatMessage(i18n.resetSuccess)));
		}).catch((err: Object) => {
			this.closeModal();
			const	message = err.message ? err.message : null;
			dispatch(showToast(message));
		});
	}

	onValueChange(value: boolean) {
		if (!value) {
			this.props.onRemoveFromDashboard(this.props.sensor.id);
		} else {
			this.props.onAddToDashboard(this.props.sensor.id);
		}
	}

	setIgnoreSensor(value: boolean) {
		const { sensor } = this.props;
		const ignore = sensor.ignored ? 0 : 1;
		this.setState({
			isHidden: value,
		});
		this.props.dispatch(setIgnoreSensor(sensor.id, ignore)).then(async (res: Object) => {
			const message = !value ?
				this.removedFromHiddenList : this.addedToHiddenList;
			try {
				await this.props.dispatch(getSensorInfo(sensor.id));
			} catch (e) {
			// Ignore
			} finally {
				const { sensor: _sensor } = this.props;
				this.setState({
					isHidden: _sensor.ignored,
				});
				this.props.dispatch(showToast(message));
			}
		}).catch((err: Object) => {
			const	message = err.message ? err.message : null;
			this.setState({
				isHidden: sensor.ignored,
			});
			this.props.dispatch(showToast(message));
		});
	}

	setKeepHistory(value: boolean) {
		const { sensor } = this.props;
		const keepHistory = sensor.keepHistory ? 0 : 1;
		this.setState({
			keepHistory: value,
			switchConf: {
				transition: true,
				source: 'keepHistory',
			},
		});
		this.props.dispatch(setKeepHistory(sensor.id, keepHistory)).then(async (res: Object) => {
			const message = !value ?
				this.toastStoreNotHistory : this.toastStoreHistory;
			try {
				await this.props.dispatch(getSensorInfo(sensor.id));
			} catch (e) {
				// Ignore
			} finally {
				this.props.dispatch(showToast(message));
				const { sensor: _sensor } = this.props;
				this.setState({
					keepHistory: _sensor.keepHistory,
					switchConf: {
						transition: false,
						source: '',
					},
				});
			}


		}).catch((err: Object) => {
			const	message = err.message ? err.message : null;
			this.setState({
				keepHistory: sensor.keepHistory,
				switchConf: {
					transition: false,
					source: '',
				},
			});
			this.props.dispatch(showToast(message));
		});
	}

	formatProtocol(protocol: string): string {
		switch (protocol) {
			case 'zwave':
				return 'Z-Wave';
			default:
				return protocol;
		}
	}

	onPressReplaceFailedNode = () => {
		this.setState({
			isReplacing: true,
		});
	}

	onDoneReplaceFailedNode = () => {
		const { dispatch, sensor } = this.props;
		const { clientId, sensorId } = sensor;
		dispatch(requestNodeInfo(clientId, sensorId));
		this.setState({
			isReplacing: false,
		});
	}

	openDialogueBox(action: string) {
		const { screenProps } = this.props;
		const { toggleDialogueBox } = screenProps;
		const dialogueData = this.prepareDialogueConfig(action);
		toggleDialogueBox(dialogueData);
	}

	deleteSensor = () => {
		this.openDialogueBox('deleteSensor');
	}

	onConfirmDeleteSensor = () => {
		const { dispatch, sensor, navigation } = this.props;

		dispatch(setSensorName(sensor.id, '')).then(() => {
			dispatch(setKeepHistory(sensor.id, 0));
			clearHistory('sensor', sensor.id);
			dispatch(removeSensorHistory(sensor.id));

			navigation.navigate('Sensors');
		}).catch((err: Object) => {
			const	message = err.message ? err.message : null;
			dispatch(showToast(message));
		});
	}

	prepareDialogueConfig(action: string): Object {
		const { formatMessage } = this.props.screenProps.intl;
		const data = {
			showPositive: true,
			showNegative: true,
			dialogueContainerStyle: { elevation: 0 },
			onPressNegative: this.closeModal,
		};
		if (action === 'clearHistory') {
			return {
				...data,
				show: true,
				showHeader: true,
				header: `${formatMessage(i18n.clearHistory)}?`,
				text: formatMessage(i18n.messageClearHistory),
				positiveText: formatMessage(i18n.labelClearHistory),
				onPressPositive: this.onConfirmClearHistory,
			};
		}
		if (action === 'clearHistoryCache') {
			return {
				...data,
				show: true,
				showHeader: true,
				header: `${formatMessage(i18n.clearHistoryCache)}?`,
				text: formatMessage(i18n.messageClearCache),
				positiveText: formatMessage(i18n.labelClearCache),
				onPressPositive: this.onConfirmClearHistoryCache,
			};
		}
		if (action === 'deleteSensor') {
			return {
				...data,
				show: true,
				showHeader: true,
				header: formatMessage(i18n.deleteSensorWarningTitle),
				text: formatMessage(i18n.deleteSensorWarningContent),
				positiveText: formatMessage(i18n.delete),
				onPressPositive: this.onConfirmDeleteSensor,
				closeOnPressPositive: true,
			};
		}
		return {
			...data,
			show: true,
			showHeader: true,
			header: `${formatMessage(i18n.resetMaxMin)}?`,
			text: formatMessage(i18n.messageResetMaxMin),
			positiveText: formatMessage(i18n.labelResetMaxMin),
			onPressPositive: this.onConfirmResetMaxMin,
		};
	}

	onPressExcludeDevice = () => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		this.setState({
			excludeActive: true,
		});
	}

	onPressCancelExclude = () => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		this.setState({
			excludeActive: false,
		});
	}

	_showToast = (message: string) => {
		const { dispatch } = this.props;
		dispatch(showToast(message));
	}

	goBack = () => {
		this.props.navigation.navigate('Sensors');
	}

	registerForWebSocketEvents = (callbacks: Object): () => Object => {
		const { sensor, dispatch } = this.props;
		return dispatch(registerForWebSocketEvents(sensor.clientId, callbacks));
	}

	onPressRemoveFailedNode = () => {
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

	onConfirmRemoveFailedNode = () => {
		const { clientId, sensorId } = this.props.sensor;
		this.sendSocketMessage(clientId, 'removeFailedNode', sensorId);
	}

	sendSocketMessage = (clientId: number, action: string, clientDeviceId: number) => {
		const { sendSocketMessage: SSM } = this.props;
		SSM(clientId, 'client', 'forward', {
			'module': 'zwave',
			'action': action,
			'device': clientDeviceId,
		});
	}

	onPressMarkAsFailed = () => {
		const { screenProps, sensor } = this.props;
		const { formatMessage } = screenProps.intl;
		const { clientId, sensorId } = sensor;
		this.setState({
			isMarking: true,
		});
		this.sendSocketMessage(clientId, 'markNodeAsFailed', sensorId);

		const that = this;
		this.markAsFailedTimeoutOne = setTimeout(() => {
			// Request for latest node info
			that.sendSocketMessage(clientId, 'nodeInfo', sensorId);

			// Can take some time to receive, so the second timeout
			that.markAsFailedTimeoutTwo = setTimeout(() => {
				const { nodeInfo = {} } = that.props.sensor;
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
						negTextColorLevel: 23,
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

	render(): Object | null {
		const {
			keepHistory,
			isHidden,
			editName,
			sensorName,
			excludeActive,
			isReplacing,
			isMarking,
		} = this.state;
		const {
			inDashboard,
			sensor,
			isGatewayReachable,
			screenProps,
		} = this.props;

		const {
			model,
			protocol = '',
			sensorId,
			name,
			clientId,
			id,
			nodeInfo = {},
			data = {},
		} = sensor;
		const showScales = Object.keys(data).length > 1;

		if (!id && !excludeActive) {
			return null;
		}

		const { appLayout, intl } = screenProps;
		const { formatMessage } = intl;

		const {
			container,
			infoHeaderText,
			buttonStyle,
			editBoxStyle,
			clearCacheHintStyle,
			brandDanger,
			btnDisabledBg,
		} = this.getStyle(appLayout);

		if (editName) {
			return (
				<View
					level={3}
					style={container}>
					<EditBox
						value={sensorName}
						icon={'sensor'}
						label={formatMessage(i18n.name)}
						onChangeText={this.onChangeName}
						onSubmitEditing={this.submitName}
						appLayout={appLayout}
						containerStyle={editBoxStyle}
					/>
				</View>
			);
		}

		const isZWave = protocol.trim().toLowerCase() === 'zwave';
		const { isFailed = false } = nodeInfo;
		const manufacturerAttributes = nodeInfo.cmdClasses ? nodeInfo.cmdClasses[ZWaveFunctions.COMMAND_CLASS_MANUFACTURER_SPECIFIC] : {};

		return (
			<ThemedScrollView
				level={3}
				style={{
					flex: 1,
				}}
				contentContainerStyle={{flexGrow: 1}}>
				{excludeActive ?
					<ExcludeDevice
						clientId={clientId}
						manufacturerAttributes={manufacturerAttributes}
						appLayout={appLayout}
						intl={intl}
						showToast={this._showToast}
						onExcludeSuccess={this.goBack}
						onPressCancelExclude={this.onPressCancelExclude}
						registerForWebSocketEvents={this.registerForWebSocketEvents}/>
					:
					<View style={container}>
						{isReplacing ?
							<ReplaceFailedNode
								intl={intl}
								appLayout={appLayout}
								idToReplace={sensorId}
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
									keyboardTypeInLineEdit={'default'}
								/>
								<SettingsRow
									label={formatMessage(i18n.showOnDashborad)}
									onValueChange={this.onValueChange}
									value={inDashboard}
									appLayout={appLayout}
									intl={intl}
								/>
								{showScales && inDashboard &&
									<AddToDashboardScale
										data={data}
										sensorId={id}
										appLayout={appLayout}
										intl={intl}/>
								}
								<SettingsRow
									label={formatMessage(i18n.hideFromListS)}
									onValueChange={this.setIgnoreSensor}
									value={isHidden}
									appLayout={appLayout}
									intl={intl}
								/>
								<SettingsRow
									label={formatMessage(i18n.labelStoreHistory)}
									onValueChange={this.setKeepHistory}
									value={keepHistory}
									appLayout={appLayout}
									intl={intl}
								/>
								<TouchableButton
									text={formatMessage(i18n.clearHistory)}
									onPress={this.clearHistory}
									style={buttonStyle}
									accessible={true}/>
								<TouchableButton
									text={formatMessage(i18n.resetMaxMin)}
									onPress={this.resetMaxMin}
									style={buttonStyle}
									accessible={true}/>
								<TouchableButton
									text={formatMessage(i18n.clearHistoryCache)}
									onPress={this.clearHistoryCache}
									style={buttonStyle}
									accessible={true}/>
								{isZWave ?
									<>
										{isFailed ?
											<>
												{!isReplacing &&
											<>
												<TouchableButton
													text={i18n.labelRemoveFailed}
													onPress={this.onPressRemoveFailedNode}
													disabled={!isGatewayReachable}
													style={[buttonStyle, {
														backgroundColor: isGatewayReachable ? brandDanger : btnDisabledBg,
													}]}/>
												<TouchableButton
													text={i18n.labelReplaceFailed}
													onPress={this.onPressReplaceFailedNode}
													disabled={!isGatewayReachable}
													style={[buttonStyle, {
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
													style={[buttonStyle, {
														backgroundColor: isGatewayReachable ? brandDanger : btnDisabledBg,
													}]}
													showThrobber={isMarking}/>
												<TouchableButton
													text={formatMessage(i18n.headerExclude)}
													onPress={this.onPressExcludeDevice}
													disabled={!isGatewayReachable}
													style={[buttonStyle, {
														backgroundColor: isGatewayReachable ? brandDanger : btnDisabledBg,
													}]}/>
											</>
										}
									</>
									:
									<>
										<EmptyView/>
										{/* <TouchableButton
											text={formatMessage(i18n.deleteSensor)}
											onPress={this.deleteSensor}
											style={[buttonStyle, {
											backgroundColor: brandDanger,
											}]}
											accessible={true}/>
											*/}
									</>
								}
								<Text
									level={26}
									style={clearCacheHintStyle}>
									{formatMessage(i18n.hintHistoryCache)}.
								</Text>
								<Text
									level={2}
									style={infoHeaderText}>
									{formatMessage(i18n.labelTechnicalInfo)}
								</Text>
								<SettingsRow
									type={'text'}
									label={formatMessage(i18n.labelProtocol)}
									value={this.formatProtocol(protocol)}
									appLayout={appLayout}
									intl={intl}
								/>
								<SettingsRow
									type={'text'}
									label={formatMessage(i18n.labelModel)}
									value={model}
									appLayout={appLayout}
									intl={intl}
								/>
								<SettingsRow
									type={'text'}
									label={`${formatMessage(i18n.labelSensor)} ${formatMessage(i18n.labelId)}`}
									value={sensorId}
									appLayout={appLayout}
									intl={intl}
								/>
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
			fontSizeFactorFour,
		} = Theme.Core;

		const padding = deviceWidth * paddingFactor;
		const fontSize = deviceWidth * fontSizeFactorFour;

		return {
			btnDisabledBg,
			brandDanger,
			container: {
				flex: 1,
				paddingHorizontal: padding,
				paddingBottom: padding,
				paddingTop: padding / 2,
			},
			infoHeaderText: {
				fontSize,
				marginTop: padding * 2,
			},
			editBoxStyle: {
				marginTop: padding * 2,
			},
			buttonStyle: {
				marginTop: padding * 2,
				paddingHorizontal: 15,
				maxWidth: width * 0.9,
				width: width * 0.8,
				minWidth: width * 0.5,
			},
			dialogueHeaderStyle: {
				paddingVertical: Math.floor(deviceWidth * 0.042),
				paddingHorizontal: 5 + Math.floor(deviceWidth * 0.042),
				width: deviceWidth * 0.75,
			},
			dialogueHeaderTextStyle: {
				fontSize: 13,
			},
			clearCacheHintStyle: {
				fontSize,
				textAlign: 'center',
				marginTop: padding * 2,
				marginHorizontal: padding * 2,
			},
		};
	}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		onAddToDashboard: (id: number): any => dispatch(addToDashboard('sensor', id)),
		onRemoveFromDashboard: (id: number): any => dispatch(removeFromDashboard('sensor', id)),
		sendSocketMessage: (id: number, module: string, action: string, data: Object): any => dispatch(sendSocketMessage(id, module, action, data)),
		dispatch,
	};
}
function mapStateToProps(state: Object, ownProps: Object): Object {
	const { route } = ownProps;
	const { id } = route.params || {};
	const sensor = state.sensors.byId[id] || {};

	const {
		dashboard,
		user: { userId },
		app: {defaultSettings},
	} = state;

	const { activeDashboardId } = defaultSettings || {};

	const { sensorsById = {} } = dashboard;
	const userDbsAndSensorsById = sensorsById[userId] || {};
	const sensorsByIdInCurrentDb = userDbsAndSensorsById[activeDashboardId] || {};

	const { clientId } = sensor;
	const { online = false, websocketOnline = false } = state.gateways.byId[clientId] || {};

	const { screen: currentScreen } = state.navigation;

	return {
		sensor,
		inDashboard: !!sensorsByIdInCurrentDb[id],
		isGatewayReachable: online && websocketOnline,
		currentScreen,
	};
}

module.exports = (connect(mapStateToProps, mapDispatchToProps)(SettingsTab): Object);
