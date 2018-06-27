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
import { TouchableOpacity, PixelRatio, Animated, Easing } from 'react-native';
import DeviceInfo from 'react-native-device-info';

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
	setIgnoreDevice: (Object) => void,
	onPressMore: (Array<Object>) => void,
	onHiddenRowOpen: (string) => void,
	propsSwipeRow: Object,
};

type State = {
	disableSwipe: boolean,
	isOpen: boolean,
	forceClose: boolean,
	showMoreActions: boolean,
	showFullName: boolean,
	coverMaxWidth: number,
	coverOccupiedWidth: number,
	buttonsWidth?: number,
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
	onLayoutDeviceName: (Object) => void;
	onLayoutCover: (Object) => void;
	onLayoutButtons: (Object) => void;
	animatedWidth: any;
	isAnimating: boolean;
	animatedScaleX: any;
	isTablet: boolean;

	state = {
		disableSwipe: false,
		isOpen: false,
		forceClose: false,
		showMoreActions: false,
		showFullName: false,
		coverMaxWidth: 0,
		coverOccupiedWidth: 0,
		buttonsWidth: undefined,
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
		this.onLayoutButtons = this.onLayoutButtons.bind(this);

		this.animatedWidth = null;
		this.animatedScaleX = new Animated.Value(1);
		this.isAnimating = false;

		this.isTablet = DeviceInfo.isTablet();
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		let { tab, propsSwipeRow, device } = this.props;
		const { isOpen } = this.state;
		let { idToKeepOpen, forceClose } = propsSwipeRow;
		if (isOpen && (tab !== 'devicesTab' || (forceClose && device.id !== idToKeepOpen)) ) {
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
			forceClose: false,
		});
		let { onHiddenRowOpen, device } = this.props;
		if (onHiddenRowOpen) {
			onHiddenRowOpen(device.id);
		}
	}

	onRowClose() {
		this.setState({
			isOpen: false,
			forceClose: false,
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
				this.isAnimating = true;
				this.setState({
					showFullName: true,
				}, () => {
					this.showFullName(200, 10, Easing.linear());
				});
			} else {
				this.isAnimating = true;
				this.setState({
					showFullName: false,
				}, () => {
					this.hideFullName(200, 10, Easing.linear());
				});
			}
		}
	}

	showFullName(duration: number, delay: number, easing: any) {
		Animated.parallel([
			this.reduceButtons(duration, delay, easing),
			this.scaleDown(duration, delay, easing),
		]).start();
	}

	hideFullName(duration: number, delay: number, easing: any) {
		Animated.parallel([
			this.expandButtons(duration, delay, easing),
			this.scaleUp(duration, delay, easing),
		]).start();
	}

	scaleDown(duration: number, delay: number, easing: any) {
		Animated.timing(this.animatedScaleX, {
			duration,
			delay,
			toValue: 0,
			easing,
		  }).start();
	}

	scaleUp(duration: number, delay: number, easing: any) {
		Animated.timing(this.animatedScaleX, {
			duration,
			delay,
			toValue: 1,
			easing,
		  }).start();
	}

	reduceButtons(duration: number, delay: number, easing: any) {
		Animated.timing(this.animatedWidth, {
			duration,
			delay,
			toValue: 0,
			easing,
		  }).start(({finished}: Object) => {
			  if (finished) {
				this.isAnimating = false;
			}
		});
	}

	expandButtons(duration: number, delay: number, easing: any) {
		Animated.timing(this.animatedWidth, {
			duration,
			delay,
			toValue: this.state.buttonsWidth,
			easing,
		  }).start(({finished}: Object) => {
			if (finished) {
			  this.isAnimating = false;
			}
		});
	}

	onLayoutDeviceName(ev: Object) {
		if (!this.state.showFullName && !this.isAnimating) {
			let { x, width } = ev.nativeEvent.layout;
			// adding a const to the calculated space as some text seem to leave extra space in the right after truncating.
			const maxRightPadd = 12;
			this.setState({
				coverOccupiedWidth: width + x + maxRightPadd,
			});
		}
	}

	onLayoutCover(ev: Object) {
		if (!this.state.showFullName && !this.isAnimating) {
			let { width } = ev.nativeEvent.layout;
			this.setState({
				coverMaxWidth: width,
			});
		}
	}

	onLayoutButtons(ev: Object) {
		let { buttonsWidth } = this.state;
		if (!buttonsWidth) {
			this.animatedWidth = new Animated.Value(ev.nativeEvent.layout.width);
			this.setState({
				buttonsWidth: ev.nativeEvent.layout.width,
			});
		}
	}

	render(): Object {
		let button = [], icon = null;
		let { isOpen, showMoreActions, coverOccupiedWidth, coverMaxWidth } = this.state;
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
		if (UP || DOWN || STOP) {
			button.unshift( <NavigationalButton
				device={device}
				style={styles.navigation}
				intl={intl}
				showStopButton={!TURNON && !TURNOFF && !BELL && !DIM}
				isGatewayActive={isGatewayActive}
				appLayout={appLayout}
				key={1}
			/>
			);
			icon = 'curtain';
		}
		if (DIM) {
			button.unshift( <DimmerButton
				device={device}
				setScrollEnabled={this.props.setScrollEnabled}
				intl={intl}
				showSlider={!BELL && !UP && !DOWN && !STOP}
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

		const interpolatedScale = this.animatedScaleX.interpolate({
			inputRange: [0, 0.5, 1],
			outputRange: [0, 1, 1],
		});

		let accessible = currentTab === 'Devices' && currentScreen === 'Tabs';
		let accessibilityLabel = isOpen ? `${getLabelDevice(intl.formatMessage, device)}. ${this.helpCloseHiddenRow}` :
			`${getLabelDevice(intl.formatMessage, device)}. ${this.helpViewHiddenRow}`;

		const nameInfo = this.getNameInfo(device, deviceName, powerConsumed, styles);

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
					directionalDistanceChangeThreshold={2}>
					<HiddenRow device={device} intl={intl} style={styles.hiddenRow}
						onPressSettings={this.onSettingsSelected} onSetIgnoreDevice={this.onSetIgnoreDevice}
						isOpen={isOpen}/>
					<ListItem
						style={styles.row}
						// Fixes issue controlling device in IOS, in accessibility mode
						// By passing onPress to visible content of 'SwipeRow', prevents it from
						// being placed inside a touchable.
						onPress={this.noOp}>
						<View style={styles.cover}>
							<TouchableOpacity
								style={[styles.touchableContainer]}
								disabled={coverOccupiedWidth < coverMaxWidth}
								onPress={this.onShowFullName}
								accessible={accessible}
								importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}
								accessibilityLabel={accessibilityLabel}>
								{showDeviceIcon && <BlockIcon icon={icon} style={styles.deviceIcon} containerStyle={styles.iconContainerStyle}/>}
								{nameInfo}
							</TouchableOpacity>
							<Animated.View style={[styles.buttonsCover, {
								width: this.animatedWidth,
								transform: [{
									scaleX: interpolatedScale,
								}],
							},
							]} onLayout={this.onLayoutButtons}>
								{button.length === 1 ?
									button[0]
									:
									[
										button[0],
										<ShowMoreButton onPress={this.onPressMore} name={name} buttons={button} key={6} intl={intl}/>,
									]
								}
							</Animated.View>
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

	getNameInfo(device: Object, deviceName: string, powerConsumed: string | null, styles: Object): Object {
		let { intl } = this.props;
		let { name, nameTablet, textPowerConsumed, textPowerConsumedTablet } = styles;
		let coverStyle = name;
		let textPowerStyle = textPowerConsumed;
		if (this.isTablet) {
			coverStyle = nameTablet;
			textPowerStyle = textPowerConsumedTablet;
		}

		return (
			<View style={coverStyle} onLayout={this.onLayoutCover}>
				<Text style = {[styles.text, { opacity: device.name ? 1 : 0.5 }]} numberOfLines={1} onLayout={this.onLayoutDeviceName}>
					{deviceName}
				</Text>
				{powerConsumed && (
					<Text style = {textPowerStyle}>
						{`${intl.formatNumber(powerConsumed, {maximumFractionDigits: 1})} W`}
					</Text>
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
		let { height, width } = appLayout;
		let isPortrait = height > width;
		let deviceWidth = isPortrait ? width : height;

		let {
			rowHeight,
			maxSizeRowTextOne,
			maxSizeRowTextTwo,
			buttonWidth,
		} = Theme.Core;

		let nameFontSize = Math.floor(deviceWidth * 0.047);
		nameFontSize = nameFontSize > maxSizeRowTextOne ? maxSizeRowTextOne : nameFontSize;

		let infoFontSize = Math.floor(deviceWidth * 0.039);
		infoFontSize = infoFontSize > maxSizeRowTextTwo ? maxSizeRowTextTwo : infoFontSize;

		let color = (deviceState === 'TURNOFF' || deviceState === 'STOP') ? Theme.Core.brandPrimary : Theme.Core.brandSecondary;
		let backgroundColor = !isGatewayActive ? Theme.Core.offlineColor : color;

		const padding = deviceWidth * Theme.Core.paddingFactor;

		return {
			touchableContainer: {
				flex: 1,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
			},
			row: {
				marginHorizontal: padding,
				marginBottom: padding / 2,
				backgroundColor: '#FFFFFF',
				height: rowHeight,
				borderRadius: 2,
				...Theme.Core.shadow,
			},
			hiddenRow: {
				flexDirection: 'row',
				height: Theme.Core.rowHeight,
				width: Theme.Core.buttonWidth * 2,
				alignSelf: 'flex-end',
				justifyContent: 'center',
				alignItems: 'center',
				marginRight: padding,
			},
			cover: {
				flex: 1,
				overflow: 'hidden',
				justifyContent: 'space-between',
				paddingLeft: 5,
				alignItems: 'stretch',
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
			nameTablet: {
				flex: 1,
				justifyContent: 'space-between',
				alignItems: 'flex-start',
				flexDirection: 'row',
			},
			text: {
				color: Theme.Core.rowTextColor,
				fontSize: nameFontSize,
				textAlignVertical: 'center',
				textAlign: 'left',
				marginLeft: 6,
				marginRight: 4,
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
				fontSize: infoFontSize,
				textAlignVertical: 'center',
			},
			textPowerConsumedTablet: {
				marginRight: 6,
				marginTop: infoFontSize * 0.411,
				color: Theme.Core.rowTextColor,
				fontSize: infoFontSize,
				textAlignVertical: 'center',
			},
		};
	}

	noOp() {
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
