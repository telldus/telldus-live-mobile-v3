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
import { connect } from 'react-redux';

import { View } from 'BaseComponents';
import { Animated, StyleSheet } from 'react-native';
import DashboardShadowTile from './DashboardShadowTile';
import { saveDimmerInitialState, showDimmerPopup, hideDimmerPopup, setDimmerValue } from 'Actions_Dimmer';
import { deviceSetState, requestDeviceAction } from 'Actions_Devices';
import HorizontalSlider from './HorizontalSlider';
import DimmerOffButton from './DimmerOffButton';
import DimmerOnButton from './DimmerOnButton';
import throttle from 'lodash/throttle';
import { getLabelDevice } from 'Accessibility';
import Theme from 'Theme';
import {
	getDimmerValue,
	toDimmerValue,
	toSliderValue,
} from 'Lib';

type Props = {
	item: Object,
	commandON: number,
	commandOFF: number,
	commandDIM: number,
	tileWidth: number,
	onDimmerSlide: number => void,
	saveDimmerInitialState: (deviceId: number, initalValue: number, initialState: string) => void;
	showDimmerPopup: (name:string, sliderValue:number) => void,
	hideDimmerPopup: () => void,
	deviceSetState: (id: number, command: number, value?: number) => void,
	requestDeviceAction: (id: number, command: number) => void,
	setScrollEnabled: boolean,
	style: Object,
	intl: Object,
	isGatewayActive: boolean,
};

type State = {
	bodyWidth: number,
	bodyHeight: number,
	value: number,
	offButtonFadeAnim: Object,
	onButtonFadeAnim: Object,
};

class DimmerDashboardTile extends View {
	props: Props;
	state: State;
	parentScrollEnabled: boolean;
	onValueChangeThrottled: number => void;
	onTurnOffButtonStart: () => void;
	onTurnOffButtonEnd: () => void;
	onTurnOnButtonStart: () => void;
	onTurnOnButtonEnd: () => void;
	onTurnOn: () => void;
	onTurnOff: () => void;
	layoutView: Object => void;
	onSlidingStart: (name:string, sliderValue:number) => void;
	onSlidingComplete: number => void;
	onValueChange: number => void;

	constructor(props: Props) {
		super(props);
		const { item, onDimmerSlide } = this.props;
		const { value, isInState } = item;
		this.parentScrollEnabled = true;
		this.state = {
			bodyWidth: 0,
			bodyHeight: 0,
			value: getDimmerValue(value, isInState),
			offButtonFadeAnim: new Animated.Value(1),
			onButtonFadeAnim: new Animated.Value(1),
		};

		this.onValueChangeThrottled = throttle(onDimmerSlide(item.id), 200, {
			trailing: true,
		});

		this.onTurnOffButtonStart = this.onTurnOffButtonStart.bind(this);
		this.onTurnOffButtonEnd = this.onTurnOffButtonEnd.bind(this);
		this.onTurnOnButtonStart = this.onTurnOnButtonStart.bind(this);
		this.onTurnOnButtonEnd = this.onTurnOnButtonEnd.bind(this);
		this.onTurnOn = this.onTurnOn.bind(this);
		this.onTurnOff = this.onTurnOff.bind(this);
		this.layoutView = this.layoutView.bind(this);
		this.onSlidingStart = this.onSlidingStart.bind(this);
		this.onSlidingComplete = this.onSlidingComplete.bind(this);
		this.onValueChange = this.onValueChange.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		const { value, isInState } = nextProps.item;

		const dimmerValue = getDimmerValue(value, isInState);
		this.setState({ value: dimmerValue });
	}

	layoutView(x) {
		let { width, height } = x.nativeEvent.layout;
		this.setState({
			bodyWidth: width,
			bodyHeight: height,
		});
	}

	onValueChange(sliderValue) {
		this.onValueChangeThrottled(toDimmerValue(sliderValue));
	}

	onSlidingStart(name:string, sliderValue:number) {
		this.props.saveDimmerInitialState(this.props.item.id, this.props.item.value, this.props.item.isInState);
		this.props.showDimmerPopup(name, toDimmerValue(sliderValue));
	}

	onSlidingComplete(sliderValue:number) {
		if (sliderValue > 0) {
			this.props.requestDeviceAction(this.props.item.id, this.props.commandON);
		}
		if (sliderValue === 0) {
			this.props.requestDeviceAction(this.props.item.id, this.props.commandOFF);
		}
		let dimValue = toDimmerValue(sliderValue);
		let command = dimValue === 0 ? this.props.commandOFF : this.props.commandDIM;
		this.props.deviceSetState(this.props.item.id, command, dimValue);
		this.props.hideDimmerPopup();
	}

	onTurnOffButtonStart() {
		this.refs.offButton.fadeOut();
	}

	onTurnOffButtonEnd() {
		this.refs.offButton.fadeIn();
	}

	onTurnOnButtonStart() {
		this.refs.onButton.fadeOut();
	}

	onTurnOnButtonEnd() {
		this.refs.onButton.fadeIn();
	}

	onTurnOn() {
		this.props.deviceSetState(this.props.item.id, this.props.commandON);
		this.props.requestDeviceAction(this.props.item.id, this.props.commandON);
	}

	onTurnOff() {
		this.props.deviceSetState(this.props.item.id, this.props.commandOFF);
		this.props.requestDeviceAction(this.props.item.id, this.props.commandOFF);
	}

	render() {
		const { item, tileWidth, intl, isGatewayActive } = this.props;
		const { name, isInState, supportedMethods, methodRequested } = item;
		const { TURNON, TURNOFF, DIM } = supportedMethods;

		const onButton = <DimmerOnButton ref={'onButton'} name={name} isInState={isInState} enabled={!!TURNON}
			style={[styles.turnOn, {marginLeft: tileWidth / 3}]} fontSize={Math.floor(tileWidth / 8)} methodRequested={methodRequested}
			intl={intl} isGatewayActive={isGatewayActive} onPress={this.onTurnOn}/>;
		const offButton = <DimmerOffButton ref={'offButton'} name={name} isInState={isInState} enabled={!!TURNOFF}
			style={styles.turnOff} fontSize={Math.floor(tileWidth / 8)} methodRequested={methodRequested}
			intl={intl} isGatewayActive={isGatewayActive} onPress={this.onTurnOff}/>;
		const slider = DIM ?
			<HorizontalSlider
				style={[styles.slider, {
					width: (tileWidth - 4) / 3,
					height: tileWidth * 0.4,
					bottom: 0,
					left: (tileWidth - 4) / 3,
				}]}
				thumbWidth={7}
				thumbHeight={7}
				fontSize={8}
				item={item}
				value={toSliderValue(this.state.value)}
				setScrollEnabled={this.props.setScrollEnabled}
				onSlidingStart={this.onSlidingStart}
				onSlidingComplete={this.onSlidingComplete}
				onValueChange={this.onValueChange}
				onLeftStart={this.onTurnOffButtonStart}
				onLeftEnd={this.onTurnOffButtonEnd}
				onRightStart={this.onTurnOnButtonStart}
				onRightEnd={this.onTurnOnButtonEnd}
				intl={intl}
				isInState={isInState}
				isGatewayActive={isGatewayActive}
			/> :
			null;

		const accessibilityLabel = getLabelDevice(intl.formatMessage, item);

		let iconContainerStyle = !isGatewayActive ? styles.itemIconContainerOffline :
			(isInState === 'TURNOFF' ? styles.itemIconContainerOff : styles.itemIconContainerOn);

		return (
			<DashboardShadowTile
				isEnabled={isInState === 'TURNON' || isInState === 'DIM'}
				name={name}
				icon={'device-alt-solid'}
				iconStyle={{
					color: '#fff',
					fontSize: tileWidth / 4.5,
				}}
				iconContainerStyle={[iconContainerStyle, {
					width: tileWidth / 4,
					height: tileWidth / 4,
					borderRadius: tileWidth / 8,
					alignItems: 'center',
					justifyContent: 'center',
				}]}
				type={'device'}
				tileWidth={tileWidth}
				accessibilityLabel={accessibilityLabel}
				style={[this.props.style, { width: tileWidth, height: tileWidth }]}>
				<View style={{
					width: tileWidth - 4,
					height: tileWidth * 0.4,
					flexDirection: 'row',
				}} onLayout={this.layoutView}>
					{ offButton }
					{ onButton }
					{ slider }
				</View>
			</DashboardShadowTile>
		);
	}
}

DimmerDashboardTile.defaultProps = {
	commandON: 1,
	commandOFF: 2,
	commandDIM: 16,
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
	},
	slider: {
		position: 'absolute',
		justifyContent: 'center',
		alignItems: 'center',
		borderRightWidth: 1,
		borderRightColor: '#ddd',
		borderLeftWidth: 1,
		borderLeftColor: '#ddd',
	},
	turnOff: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		borderBottomLeftRadius: 2,
	},
	turnOn: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		borderBottomRightRadius: 2,
	},
	itemIconContainerOn: {
		backgroundColor: Theme.Core.brandSecondary,
	},
	itemIconContainerOff: {
		backgroundColor: Theme.Core.brandPrimary,
	},
	itemIconContainerOffline: {
		backgroundColor: Theme.Core.offlineColor,
	},
});

function mapDispatchToProps(dispatch) {
	return {
		saveDimmerInitialState: (deviceId, initalValue, initialState) => dispatch(saveDimmerInitialState(deviceId, initalValue, initialState)),
		showDimmerPopup: (name:string, value:number) => {
			dispatch(showDimmerPopup(name, value));
		},
		hideDimmerPopup: () => {
			dispatch(hideDimmerPopup());
		},
		onDimmerSlide: id => value => dispatch(setDimmerValue(id, value)),
		deviceSetState: (id: number, command: number, value?: number) => dispatch(deviceSetState(id, command, value)),
		requestDeviceAction: (id: number, command: number) => dispatch(requestDeviceAction(id, command)),
	};
}

module.exports = connect(null, mapDispatchToProps)(DimmerDashboardTile);
