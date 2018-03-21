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
	setIgnoreDevice: (Object) => void;
	onPressMore: (Array<Object>) => void;
};

type State = {
	disableSwipe: boolean,
	isOpen: boolean,
	showMoreActions: boolean,
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

	state = {
		disableSwipe: false,
		isOpen: false,
		showMoreActions: false,
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
	}

	componentWillReceiveProps(nextProps: Object) {
		let { tab } = nextProps;
		if (tab !== 'devicesTab' && this.state.isOpen) {
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

	render(): Object {
		let button = [], icon = null;
		let { isOpen, showMoreActions } = this.state;
		const { device, intl, currentTab, currentScreen, appLayout, isGatewayActive, powerConsumed } = this.props;
		const { isInState, name } = device;
		const styles = this.getStyles(appLayout, isGatewayActive, isInState);
		const deviceName = name ? name : intl.formatMessage(i18n.noName);
		if (name === 'Ceiling') {
			device.supportedMethods = {
				UP: true,
				DOWN: true,
				STOP: true,
				TURNON: true,
				TURNOFF: true,
			};
		}

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
				key={0}
			/>
			);
			icon = 'bell';
		}
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
			icon = 'device-alt-solid';
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
			icon = 'device-alt-solid';
		}
		if (!TURNON && !TURNOFF && !BELL && !DIM && !UP && !DOWN && !STOP) {
			button.unshift( <ToggleButton
				device={device}
				style={styles.toggle}
				intl={intl}
				isGatewayActive={isGatewayActive}
				appLayout={appLayout}
				key={3}
			/>
			);
			icon = 'device-alt-solid';
		}
		let accessible = currentTab === 'Devices' && currentScreen === 'Tabs';
		let accessibilityLabel = isOpen ? `${getLabelDevice(intl.formatMessage, device)}. ${this.helpCloseHiddenRow}` :
			`${getLabelDevice(intl.formatMessage, device)}. ${this.helpViewHiddenRow}`;

		return (
			<View>
				<SwipeRow
					ref="SwipeRow"
					rightOpenValue={-Theme.Core.buttonWidth * 3}
					disableLeftSwipe={this.state.disableSwipe}
					disableRightSwipe={true}
					onRowOpen={this.onRowOpen}
					onRowClose={this.onRowClose}
					recalculateHiddenLayout={true}>
					<HiddenRow device={device} intl={intl} onPressSettings={this.onSettingsSelected}
						onSetIgnoreDevice={this.onSetIgnoreDevice} isOpen={isOpen}/>
					<ListItem
						style={styles.row}>
						<View
							style={styles.touchableContainer}
							accessible={accessible}
							importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}
							accessibilityLabel={accessibilityLabel}>
							<BlockIcon icon={icon} style={styles.deviceIcon} containerStyle={styles.iconContainerStyle}/>
							<View style={styles.name}>
								<Text style = {[styles.text, { opacity: device.name ? 1 : 0.5 }]}>
									{deviceName}
								</Text>
								{powerConsumed && (
									<Text style = {styles.textPowerConsumed}>
										{`${powerConsumed} W`}
									</Text>
								)}
							</View>
						</View>
						{button.length === 1 ?
							button[0]
							:
							[button[0],
								<ShowMoreButton onPress={this.onPressMore} name={name} buttons={button} key={5}/>]
						}
					</ListItem>
				</SwipeRow>
				<MultiActionModal
					showModal={showMoreActions}
					buttons={button}
					name={name}
					closeModal={this.closeMoreActions}
				/>
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
				height: rowHeight,
			},
			row: {
				marginHorizontal: 12,
				marginBottom: 5,
				backgroundColor: '#FFFFFF',
				flexDirection: 'row',
				height: rowHeight,
				justifyContent: 'space-between',
				paddingLeft: 5,
				alignItems: 'center',
				borderRadius: 2,
				...Theme.Core.shadow,
			},
			name: {
				flex: 20,
				justifyContent: 'center',
			},
			text: {
				marginLeft: 8,
				color: Theme.Core.rowTextColor,
				fontSize: 15,
				textAlignVertical: 'center',
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
				alignItems: 'stretch',
				backgroundColor: '#eeeeee',
				width: buttonWidth * 2,
				borderLeftWidth: 1,
				borderLeftColor: '#ddd',
			},
			navigation: {
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
			},
			textPowerConsumed: {
				marginLeft: 8,
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
