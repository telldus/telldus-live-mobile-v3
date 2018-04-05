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
import { Animated, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import throttle from 'lodash/throttle';

import { View } from '../../../../BaseComponents';
import DashboardShadowTile from './DashboardShadowTile';
import { saveDimmerInitialState, showDimmerPopup, hideDimmerPopup, setDimmerValue, showDimmerStep } from '../../../Actions/Dimmer';
import { deviceSetState, requestDeviceAction } from '../../../Actions/Devices';
import DimmerOffButton from './DimmerOffButton';
import DimmerOnButton from './DimmerOnButton';
import HVSliderContainer from './Device/HVSliderContainer';
import SliderScale from './Device/SliderScale';

import { getLabelDevice } from '../../../Lib';
import {
	getDimmerValue,
	toDimmerValue,
	toSliderValue,
	getPowerConsumed,
} from '../../../Lib';

import Theme from '../../../Theme';

type Props = {
	item: Object,
	commandON: number,
	commandOFF: number,
	commandDIM: number,
	tileWidth: number,
	onDimmerSlide: number => void,
	saveDimmerInitialState: (deviceId: number, initalValue: number, initialState: string) => void;
	showDimmerPopup: (name: string, sliderValue: number) => void,
	hideDimmerPopup: () => void,
	deviceSetState: (id: number, command: number, value?: number) => void,
	requestDeviceAction: (id: number, command: number) => void,
	setScrollEnabled: boolean,
	style: Object,
	intl: Object,
	isGatewayActive: boolean,
	powerConsumed: string,
	screenReaderEnabled: boolean,
	showDimmerStep: (number) => void;
};

type State = {
	bodyWidth: number,
	bodyHeight: number,
	value: number,
	offButtonFadeAnim: Object,
	onButtonFadeAnim: Object,
};

type DefaultProps = {
	commandON: number,
	commandOFF: number,
	commandDIM: number,
};

class DimmerDashboardTile extends PureComponent<Props, State> {
	props: Props;
	state: State;

	static defaultProps: DefaultProps = {
		commandON: 1,
		commandOFF: 2,
		commandDIM: 16,
	}

	parentScrollEnabled: boolean;
	onValueChangeThrottled: number => void;
	onTurnOffButtonStart: () => void;
	onTurnOffButtonEnd: () => void;
	onTurnOnButtonStart: () => void;
	onTurnOnButtonEnd: () => void;
	onTurnOn: () => void;
	onTurnOff: () => void;
	layoutView: Object => void;
	onSlidingStart: (name: string, sliderValue: number) => void;
	onSlidingComplete: number => void;
	onValueChange: number => void;
	showDimmerStep: (number) => void;

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
		this.showDimmerStep = this.showDimmerStep.bind(this);
	}

	componentWillReceiveProps(nextProps: Object) {
		const { value, isInState } = nextProps.item;

		const dimmerValue = getDimmerValue(value, isInState);
		this.setState({ value: dimmerValue });
	}

	layoutView(x: Object) {
		let { width, height } = x.nativeEvent.layout;
		this.setState({
			bodyWidth: width,
			bodyHeight: height,
		});
	}

	onValueChange(sliderValue: number) {
		this.onValueChangeThrottled(toDimmerValue(sliderValue));
	}

	onSlidingStart(name: string, sliderValue: number) {
		this.props.saveDimmerInitialState(this.props.item.id, this.props.item.value, this.props.item.isInState);
		this.props.showDimmerPopup(name, toDimmerValue(sliderValue));
	}

	onSlidingComplete(sliderValue: number) {
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

	showDimmerStep(id: number) {
		this.props.showDimmerStep(id);
	}

	render(): Object {
		const { item, tileWidth, intl, isGatewayActive, powerConsumed, screenReaderEnabled } = this.props;
		const { name, isInState, supportedMethods, methodRequested } = item;
		const { DIM } = supportedMethods;

		const info = powerConsumed ? `${intl.formatNumber(powerConsumed, {maximumFractionDigits: 1})} W` : null;

		const sliderProps = {
			thumbWidth: 7,
			thumbHeight: 7,
			fontSize: 8,
			item: item,
			value: toSliderValue(this.state.value),
			setScrollEnabled: this.props.setScrollEnabled,
			onSlidingStart: this.onSlidingStart,
			onSlidingComplete: this.onSlidingComplete,
			onValueChange: this.onValueChange,
			onLeftStart: this.onTurnOffButtonStart,
			onLeftEnd: this.onTurnOffButtonEnd,
			onRightStart: this.onTurnOnButtonStart,
			onRightEnd: this.onTurnOnButtonEnd,
			intl: intl,
			isInState: isInState,
			isGatewayActive: isGatewayActive,
			screenReaderEnabled: screenReaderEnabled,
			showDimmerStep: this.showDimmerStep,
		};

		// TODO: refactor writing a higher order component
		const onButton =
		<HVSliderContainer
			{...sliderProps}
			onPress={this.onTurnOn}
			style={[styles.turnOn]}>
			<DimmerOnButton ref={'onButton'} name={name} isInState={isInState} enabled={false}
				style={[styles.turnOn]} iconStyle={styles.iconStyle} fontSize={Math.floor(tileWidth / 8)} methodRequested={methodRequested}
				intl={intl} isGatewayActive={isGatewayActive} onPress={this.onTurnOn}/>
		</HVSliderContainer>;

		const offButton =
		<HVSliderContainer
			{...sliderProps}
			style={styles.turnOff}
			onPress={this.onTurnOff}>
			<DimmerOffButton ref={'offButton'} name={name} isInState={isInState} enabled={false}
				style={styles.turnOff} iconStyle={styles.iconStyle} fontSize={Math.floor(tileWidth / 8)} methodRequested={methodRequested}
				intl={intl} isGatewayActive={isGatewayActive} onPress={this.onTurnOff}/>
		</HVSliderContainer>;

		const slider = DIM ?
			<HVSliderContainer
				{...sliderProps}
				style={styles.sliderContainer}
				onPress={this.onTurnOff}>
				<SliderScale
					style={styles.slider}
					thumbWidth={7}
					thumbHeight={7}
					fontSize={8}
					isGatewayActive={isGatewayActive}/>
			</HVSliderContainer>
			:
			null;

		const accessibilityLabel = getLabelDevice(intl.formatMessage, item);

		let iconContainerStyle = !isGatewayActive ? styles.itemIconContainerOffline :
			(isInState === 'TURNOFF' ? styles.itemIconContainerOff : styles.itemIconContainerOn);

		return (
			<DashboardShadowTile
				isEnabled={isInState === 'TURNON' || isInState === 'DIM'}
				name={name}
				info={info}
				icon={'device-alt'}
				iconStyle={{
					color: '#fff',
					fontSize: tileWidth / 5.2,
				}}
				iconContainerStyle={[iconContainerStyle, {
					width: tileWidth / 4.8,
					height: tileWidth / 4.8,
					borderRadius: tileWidth / 9.6,
					alignItems: 'center',
					justifyContent: 'center',
				}]}
				type={'device'}
				tileWidth={tileWidth}
				accessibilityLabel={accessibilityLabel}
				formatMessage={intl.formatMessage}
				style={[this.props.style, { width: tileWidth, height: tileWidth }]}>
				<View style={{
					width: tileWidth,
					height: tileWidth * 0.4,
					flexDirection: 'row',
					justifyContent: 'center',
				}} onLayout={this.layoutView}>
					{ offButton }
					{ slider }
					{ onButton }
				</View>
			</DashboardShadowTile>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
	},
	sliderContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'stretch',
		borderRightWidth: 1,
		borderRightColor: '#ddd',
		borderLeftWidth: 1,
		borderLeftColor: '#ddd',
	},
	slider: {
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	turnOff: {
		flex: 1,
		alignItems: 'stretch',
		justifyContent: 'center',
		borderBottomLeftRadius: 2,
	},
	turnOn: {
		flex: 1,
		alignItems: 'stretch',
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
	iconStyle: {
		fontSize: 22,
	},
});

function mapDispatchToProps(dispatch: Function): Object {
	return {
		saveDimmerInitialState: (deviceId: number, initalValue: number, initialState: number) => {
			dispatch(saveDimmerInitialState(deviceId, initalValue, initialState));
		},
		showDimmerPopup: (name: string, value: number) => {
			dispatch(showDimmerPopup(name, value));
		},
		hideDimmerPopup: () => {
			dispatch(hideDimmerPopup());
		},
		onDimmerSlide: (id: number): any => (value: number): any => dispatch(setDimmerValue(id, value)),
		deviceSetState: (id: number, command: number, value?: number) => {
			dispatch(deviceSetState(id, command, value));
		},
		requestDeviceAction: (id: number, command: number) => {
			dispatch(requestDeviceAction(id, command));
		},
		showDimmerStep: (id: number) => {
			dispatch(showDimmerStep(id));
		},
	};
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	let powerConsumed = getPowerConsumed(store.sensors.byId, ownProps.item.clientDeviceId);
	return {
		powerConsumed,
		screenReaderEnabled: store.App.screenReaderEnabled,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(DimmerDashboardTile);
