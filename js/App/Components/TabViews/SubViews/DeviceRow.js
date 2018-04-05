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

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { SwipeRow } from 'react-native-swipe-list-view';
import { TouchableOpacity, PixelRatio, Animated } from 'react-native';

import { ListItem, Text, View, BlockIcon } from '../../../../BaseComponents';
import ToggleButton from './ToggleButton';
import BellButton from './BellButton';
import NavigationalButton from './NavigationalButton';
import DimmerButton from './DimmerButton';
import { getLabelDevice } from '../../../Lib';
import HiddenRow from './Device/HiddenRow';
import ShowMoreButton from './Device/ShowMoreButton';
import MultiActionModal from './Device/MultiActionModal';

import { getPowerConsumed } from '../../../Lib';
import i18n from '../../../Translations/common';

import Theme from '../../../Theme';
const paddingHorizontal = 12;

type Props = {
	onBell: (number) => void,
	onDown: (number) => void,
	onUp: (number) => void,
	onStop: (number) => void,
	onDimmerSlide: (number) => void,
	onDim: (number) => void,
	onTurnOn: (number) => void,
	onTurnOff: (number) => void,
	onSettingsSelected: (Object) => void,
	device: Object,
	setScrollEnabled: boolean,
	intl: Object,
	currentTab: string,
	currentScreen: string,
	appLayout: Object,
	isGatewayActive: boolean,
	tab: string,
	powerConsumed: string | null,
	setIgnoreDevice: (Object) => void;
	onPressMore: (Array<Object>) => void;
	onHiddenRowOpen: (string) => void;
	propsSwipeRow: Object,
};

type State = {
	disableSwipe: boolean,
	isOpen: boolean,
	showMoreActions: boolean,
	showFullName: boolean,
	coverMaxWidth: number,
	coverOccupiedWidth: number,
	nameWidth?: number,
};

class DeviceRow extends PureComponent<Props, State> {
	props: Props;
	state: State;

	helpViewHiddenRow: string;
	helpCloseHiddenRow: string;

	onSettingsSelected: Object => void;
	onSlideActive: () => void;
	onSlideComplete: () => void;
	onRowOpen: () => void;
	onRowClose: () => void;
	onSetIgnoreDevice: () => void;
	onPressMore: (Object) => void;
	closeMoreActions: () => void;
	onShowFullName: () => void;
	hideButtons: () => void;
	showButtons: () => void;
	onLayoutDeviceName: (Object) => void;
	onLayoutCover: (Object) => void;
	animatedX: any;

	state = {
		disableSwipe: false,
		isOpen: false,
		showMoreActions: false,
		showFullName: false,
		coverMaxWidth: 0,
		coverOccupiedWidth: 0,
		nameWidth: undefined,
	};

	constructor(props: Props) {
		super(props);

		let { formatMessage } = props.intl;

		this.helpViewHiddenRow = formatMessage(i18n.helpViewHiddenRow);
		this.helpCloseHiddenRow = formatMessage(i18n.helpCloseHiddenRow);

		this.onSettingsSelected = this.onSettingsSelected.bind(this);
		this.onSlideActive = this.onSlideActive.bind(this);
		this.onSlideComplete = this.onSlideComplete.bind(this);
		this.onSetIgnoreDevice = this.onSetIgnoreDevice.bind(this);

		this.onRowOpen = this.onRowOpen.bind(this);
		this.onRowClose = this.onRowClose.bind(this);
		this.onPressMore = this.onPressMore.bind(this);
		this.closeMoreActions = this.closeMoreActions.bind(this);
		this.onShowFullName = this.onShowFullName.bind(this);
		this.onLayoutDeviceName = this.onLayoutDeviceName.bind(this);
		this.onLayoutCover = this.onLayoutCover.bind(this);

		this.animatedX = new Animated.Value(0);

		this.hideButtons = this.hideButtons.bind(this);
		this.showButtons = this.showButtons.bind(this);
	}

	componentWillReceiveProps(nextProps: Object) {
		let { tab, propsSwipeRow, device } = nextProps;
		let { idToKeepOpen, forceClose } = propsSwipeRow;
		if (this.state.isOpen && ((tab !== 'devicesTab') || (forceClose && device.id !== idToKeepOpen))) {
			this.refs.SwipeRow.closeRow();
		}
	}

	onSlideActive() {
		this.setState({
			disableSwipe: true,
		});
	}

	onSlideComplete() {
		this.setState({
			disableSwipe: false,
		});
	}

	onRowOpen() {
		this.setState({
			isOpen: true,
		});
		let { onHiddenRowOpen, device } = this.props;
		if (onHiddenRowOpen) {
			onHiddenRowOpen(device.id);
		}
	}

	onRowClose() {
		this.setState({
			isOpen: false,
		});
	}

	onSettingsSelected() {
		this.props.onSettingsSelected(this.props.device);
	}

	onSetIgnoreDevice() {
		this.props.setIgnoreDevice(this.props.device);
	}

	onShowFullName() {
		let { showFullName, coverOccupiedWidth, coverMaxWidth, isOpen } = this.state;
		if (isOpen) {
			this.refs.SwipeRow.closeRow();
		} else if (coverOccupiedWidth >= coverMaxWidth || showFullName) {
			if (!showFullName) {
				let { appLayout } = this.props;
				this.startOnShowAnimation();
				this.setState({
					nameWidth: appLayout.width - (2 * paddingHorizontal),
				});
			} else {
				this.setState({
					showFullName: false,
					nameWidth: undefined,
				});
				this.startOnHideAnimation();
			}
		}
	}

	startOnShowAnimation() {
		Animated.parallel([
			this.hideButtons(),
		]).start();
	}

	startOnHideAnimation() {
		Animated.parallel([
			this.showButtons(),
		]).start();
	}

	hideButtons() {
		let { appLayout } = this.props;
		Animated.spring(this.animatedX, {
			duration: 5000,
			toValue: appLayout.width,
			useNativeDriver: true,
		  }).start((event: Object) => {
			if (event.finished) {
				this.setState({
					showFullName: true,
				});
			}
		});
	}

	showButtons() {
		let { appLayout } = this.props;
		this.animatedX.setValue(appLayout.width);
		Animated.spring(this.animatedX, {
			duration: 5000,
			toValue: 0,
			useNativeDriver: true,
		  }).start();
	}

	onLayoutDeviceName(ev: Object) {
		if (!this.state.showFullName) {
			let { x, width } = ev.nativeEvent.layout;
			// adding a const to the calculated space as some text seem to leave extra space in the right after truncating.
			const maxRightPadd = 12;
			this.setState({
				coverOccupiedWidth: width + x + maxRightPadd,
			});
		}
	}

	onLayoutCover(ev: Object) {
		if (!this.state.showFullName) {
			let { width } = ev.nativeEvent.layout;
			this.setState({
				coverMaxWidth: width,
			});
		}
	}

	render(): Object {
		let button = [], icon = null;
		let { isOpen, showMoreActions, showFullName, nameWidth } = this.state;
		const { device, intl, currentTab, currentScreen, appLayout, isGatewayActive, powerConsumed } = this.props;
		const { isInState, name } = device;
		const styles = this.getStyles(appLayout, isGatewayActive, isInState);
		const deviceName = name ? name : intl.formatMessage(i18n.noName);
		const showDeviceIcon = PixelRatio.getPixelSizeForLayoutSize(appLayout.width) >= 750;

		const {
			TURNON,
			TURNOFF,
			BELL,
			DIM,
			UP,
			DOWN,
			STOP,
		} = device.supportedMethods;

		if (UP || DOWN || STOP) {
			button.unshift( <NavigationalButton
				device={device}
				style={styles.navigation}
				intl={intl}
				isGatewayActive={isGatewayActive}
				appLayout={appLayout}
				key={1}
			/>
			);
			icon = 'curtain';
		}
		if (BELL) {
			button.unshift( <BellButton
				device={device}
				style={styles.bell}
				intl={intl}
				isGatewayActive={isGatewayActive}
				appLayout={appLayout}
				key={4}
			/>
			);
			icon = 'bell';
		}
		if (DIM) {
			button.unshift( <DimmerButton
				device={device}
				setScrollEnabled={this.props.setScrollEnabled}
				intl={intl}
				isGatewayActive={isGatewayActive}
				appLayout={appLayout}
				onSlideActive={this.onSlideActive}
				onSlideComplete={this.onSlideComplete}
				key={2}
			/>
			);
			icon = 'device-alt';
		}
		if ((TURNON || TURNOFF) && !DIM) {
			button.unshift( <ToggleButton
				device={device}
				style={styles.toggle}
				intl={intl}
				isGatewayActive={isGatewayActive}
				appLayout={appLayout}
				key={3}
			/>
			);
			icon = 'device-alt';
		}
		if (!TURNON && !TURNOFF && !BELL && !DIM && !UP && !DOWN && !STOP) {
			button.unshift( <ToggleButton
				device={device}
				style={styles.toggle}
				intl={intl}
				isGatewayActive={isGatewayActive}
				appLayout={appLayout}
				key={5}
			/>
			);
			icon = 'device-alt';
		}

		let accessible = currentTab === 'Devices' && currentScreen === 'Tabs';
		let accessibilityLabel = isOpen ? `${getLabelDevice(intl.formatMessage, device)}. ${this.helpCloseHiddenRow}` :
			`${getLabelDevice(intl.formatMessage, device)}. ${this.helpViewHiddenRow}`;

		const interpolatedX = this.animatedX.interpolate({
			inputRange: [0, appLayout.width],
			outputRange: [0, appLayout.width],
		});

		return (
			<View>
				<SwipeRow
					ref="SwipeRow"
					rightOpenValue={-Theme.Core.buttonWidth * 2}
					disableLeftSwipe={this.state.disableSwipe}
					disableRightSwipe={true}
					onRowOpen={this.onRowOpen}
					onRowClose={this.onRowClose}
					recalculateHiddenLayout={true}
					swipeToOpenPercent={20}
					directionalDistanceChangeThreshold={0.5}>
					<HiddenRow device={device} intl={intl} onPressSettings={this.onSettingsSelected}
						onSetIgnoreDevice={this.onSetIgnoreDevice} isOpen={isOpen}/>
					<ListItem
						style={styles.row}>
						<View style={styles.cover}>
							<TouchableOpacity
								style={[styles.touchableContainer]}
								onPress={this.onShowFullName}
								accessible={accessible}
								importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}
								accessibilityLabel={accessibilityLabel}>
								{showDeviceIcon && <BlockIcon icon={icon} style={styles.deviceIcon} containerStyle={styles.iconContainerStyle}/>}
								<View style={styles.name} onLayout={this.onLayoutCover}>
									<Text style = {[styles.text, { opacity: device.name ? 1 : 0.5, width: nameWidth }]} numberOfLines={1} onLayout={this.onLayoutDeviceName}>
										{deviceName}
									</Text>
									{powerConsumed && (
										<Text style = {styles.textPowerConsumed}>
											{`${intl.formatNumber(powerConsumed, {maximumFractionDigits: 1})} W`}
										</Text>
									)}
								</View>
							</TouchableOpacity>
							{!showFullName && (<Animated.View style={[styles.buttonsCover, {
								transform: [{
									translateX: interpolatedX,
								}],
							},
							]}>
								{button.length === 1 ?
									button[0]
									:
									[
										button[0],
										<ShowMoreButton onPress={this.onPressMore} name={name} buttons={button} key={6}/>,
									]
								}
							</Animated.View>
							)}
						</View>
					</ListItem>
				</SwipeRow>
				{
					button.length !== 1 && (
						<MultiActionModal
							showModal={showMoreActions}
							buttons={button}
							name={name}
							closeModal={this.closeMoreActions}
						/>
					)}
			</View>
		);
	}

	onPressMore(buttons: Array<Object>, name: string) {
		this.setState({
			showMoreActions: true,
		});
	}

	closeMoreActions() {
		this.setState({
			showMoreActions: false,
		});
	}

	getStyles(appLayout: Object, isGatewayActive: boolean, deviceState: string): Object {
		let rowHeight = Theme.Core.rowHeight;
		let buttonWidth = Theme.Core.buttonWidth;

		let color = (deviceState === 'TURNOFF' || deviceState === 'STOP') ? Theme.Core.brandPrimary : Theme.Core.brandSecondary;
		let backgroundColor = !isGatewayActive ? Theme.Core.offlineColor : color;

		return {
			touchableContainer: {
				flex: 1,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
			},
			row: {
				marginHorizontal: paddingHorizontal,
				marginBottom: 5,
				backgroundColor: '#FFFFFF',
				height: rowHeight,
				borderRadius: 2,
				...Theme.Core.shadow,
			},
			cover: {
				flex: 1,
				overflow: 'hidden',
				justifyContent: 'space-between',
				paddingLeft: 5,
				alignItems: 'center',
				flexDirection: 'row',
				borderRadius: 2,
			},
			buttonsCover: {
				justifyContent: 'space-between',
				alignItems: 'center',
				flexDirection: 'row',
			},
			name: {
				flex: 1,
				justifyContent: 'center',
				alignItems: 'flex-start',
			},
			text: {
				color: Theme.Core.rowTextColor,
				fontSize: 15,
				textAlignVertical: 'center',
				textAlign: 'left',
				marginLeft: 6,
			},
			deviceIcon: {
				fontSize: 18,
				color: '#fff',
			},
			iconContainerStyle: {
				backgroundColor: backgroundColor,
				borderRadius: 25,
				width: 25,
				height: 25,
				alignItems: 'center',
				justifyContent: 'center',
				marginHorizontal: 5,
			},
			toggle: {
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
			},
			bell: {
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#eeeeee',
				width: buttonWidth * 2,
				borderLeftWidth: 1,
				borderLeftColor: '#ddd',
				height: rowHeight,
			},
			navigation: {
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
			},
			textPowerConsumed: {
				marginLeft: 6,
				color: Theme.Core.rowTextColor,
				fontSize: 12,
				textAlignVertical: 'center',
			},
		};
	}
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	let powerConsumed = getPowerConsumed(store.sensors.byId, ownProps.device.clientDeviceId);
	return {
		tab: store.navigation.tab,
		powerConsumed,
	};
}

module.exports = connect(mapStateToProps, null)(DeviceRow);
