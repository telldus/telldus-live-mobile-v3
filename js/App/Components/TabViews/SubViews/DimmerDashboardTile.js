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
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import throttle from 'lodash/throttle';

import { View } from '../../../../BaseComponents';
import { saveDimmerInitialState, showDimmerPopup, hideDimmerPopup, setDimmerValue, showDimmerStep } from '../../../Actions/Dimmer';
import { deviceSetState } from '../../../Actions/Devices';
import DimmerOffButton from './DimmerOffButton';
import DimmerOnButton from './DimmerOnButton';
import HVSliderContainer from './Device/HVSliderContainer';
import SliderScale from './Device/SliderScale';

import {
	getDimmerValue,
	toDimmerValue,
	toSliderValue,
	shouldUpdate,
} from '../../../Lib';

import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

type Props = {
	commandON: number,
	commandOFF: number,
	commandDIM: number,

	item: Object,
	tileWidth: number,
	showSlider?: boolean,
	setScrollEnabled: boolean,
	screenReaderEnabled: boolean,
	sensitive: number,

	style: Object,
	intl: Object,
	isGatewayActive: boolean,
	showDimmerStep: (number) => void,
	containerStyle?: Array<any> | Object,
	offButtonStyle?: Array<any> | Object,
	onButtonStyle?: Array<any> | Object,
	sliderStyle?: Array<any> | Object,
	onDimmerSlide: number => void,
	saveDimmerInitialState: (deviceId: number, initalValue: number, initialState: string) => void,
	showDimmerPopup: (name: string, sliderValue: number) => void,
	hideDimmerPopup: () => void,
	deviceSetState: (id: number, command: number, value?: number) => void,
	onPressDimButton: (Object) => void,
};

type DefaultProps = {
	commandON: number,
	commandOFF: number,
	commandDIM: number,
	showSlider: boolean,
};

class DimmerDashboardTile extends View<Props, void> {
	props: Props;

	static defaultProps: DefaultProps = {
		commandON: 1,
		commandOFF: 2,
		commandDIM: 16,
		showSlider: true,
	}

	parentScrollEnabled: boolean;
	onValueChangeThrottled: number => void;
	onTurnOn: () => void;
	onTurnOff: () => void;
	onSlidingStart: (name: string, sliderValue: number) => void;
	onSlidingComplete: number => void;
	onValueChange: number => void;
	showDimmerStep: (number) => void;

	onPressDimButton: () => void;

	constructor(props: Props) {
		super(props);
		const { item, onDimmerSlide } = this.props;
		this.parentScrollEnabled = true;

		this.onValueChangeThrottled = throttle(onDimmerSlide(item.id), 100, {
			trailing: true,
		});

		this.onTurnOn = this.onTurnOn.bind(this);
		this.onTurnOff = this.onTurnOff.bind(this);
		this.onSlidingStart = this.onSlidingStart.bind(this);
		this.onSlidingComplete = this.onSlidingComplete.bind(this);
		this.onValueChange = this.onValueChange.bind(this);
		this.showDimmerStep = this.showDimmerStep.bind(this);

		this.onPressDimButton = this.onPressDimButton.bind(this);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {

		const { tileWidth, setScrollEnabled, ...others } = this.props;
		const { tileWidth: tileWidthN, setScrollEnabled: setScrollEnabledN, ...othersN } = nextProps;
		if (tileWidth !== tileWidthN || setScrollEnabled !== setScrollEnabledN) {
			return true;
		}

		const propsChange = shouldUpdate(others, othersN, ['item', 'showSlider', 'screenReaderEnabled', 'sensitive']);
		if (propsChange) {
			return true;
		}

		return false;
	}

	onValueChange(sliderValue: number) {
		this.onValueChangeThrottled(toDimmerValue(sliderValue));
	}

	onSlidingStart(name: string, sliderValue: number) {
		this.props.saveDimmerInitialState(this.props.item.id, this.props.item.value, this.props.item.isInState);
		this.props.showDimmerPopup(name, toDimmerValue(sliderValue));
	}

	onSlidingComplete(sliderValue: number) {
		let { item, commandON, commandOFF, commandDIM } = this.props;
		let command = commandDIM;
		if (sliderValue === 100) {
			command = commandON;
		}
		if (sliderValue === 0) {
			command = commandOFF;
		}
		let dimValue = toDimmerValue(sliderValue);
		this.props.deviceSetState(item.id, command, dimValue);
		this.props.hideDimmerPopup();
	}

	onTurnOn() {
		this.props.deviceSetState(this.props.item.id, this.props.commandON);
	}

	onTurnOff() {
		this.props.deviceSetState(this.props.item.id, this.props.commandOFF);
	}

	showDimmerStep(id: number) {
		this.props.showDimmerStep(id);
	}

	onPressDimButton() {
		const { onPressDimButton, item } = this.props;
		if (onPressDimButton && typeof onPressDimButton === 'function') {
			onPressDimButton(item);
		}
	}

	render(): Object {
		const {
			item, tileWidth, intl, isGatewayActive,
			screenReaderEnabled, showSlider, onButtonStyle,
			offButtonStyle, sliderStyle, containerStyle,
			setScrollEnabled, sensitive,
		} = this.props;
		const { name, isInState, supportedMethods = {}, methodRequested, local, stateValues, value: val } = item;
		const { DIM } = supportedMethods;
		const deviceName = name ? name : intl.formatMessage(i18n.noName);

		const stateValue = stateValues ? stateValues.DIM : val;
		const value = getDimmerValue(stateValue, isInState);

		const sliderProps = {
			sensitive,
			thumbWidth: 7,
			thumbHeight: 7,
			fontSize: 8,
			value: toSliderValue(value),
			onSlidingStart: this.onSlidingStart,
			onSlidingComplete: this.onSlidingComplete,
			onValueChange: this.onValueChange,
			showDimmerStep: this.showDimmerStep,
			item,
			setScrollEnabled,
			intl,
			isInState,
			isGatewayActive,
			screenReaderEnabled,
		};

		// TODO: refactor writing a higher order component
		const onButton =
		<HVSliderContainer
			{...sliderProps}
			style={[styles.buttonContainerStyle, onButtonStyle]}
			onPress={this.onTurnOn}>
			<DimmerOnButton ref={'onButton'} name={deviceName} isInState={isInState} enabled={false}
				style={[styles.turnOn]} iconStyle={styles.iconStyle} fontSize={Math.floor(tileWidth / 8)} methodRequested={methodRequested}
				intl={intl} isGatewayActive={isGatewayActive} onPress={this.onTurnOn} local={local}/>
		</HVSliderContainer>;

		const offButton =
		<HVSliderContainer
			{...sliderProps}
			style={[styles.buttonContainerStyle, offButtonStyle]}
			onPress={this.onTurnOff}>
			<DimmerOffButton ref={'offButton'} name={deviceName} isInState={isInState} enabled={false}
				style={styles.turnOff} iconStyle={styles.iconStyle} fontSize={Math.floor(tileWidth / 8)} methodRequested={methodRequested}
				intl={intl} isGatewayActive={isGatewayActive} onPress={this.onTurnOff} local={local}/>
		</HVSliderContainer>;

		const slider = DIM ?
			<HVSliderContainer
				{...sliderProps}
				style={[styles.sliderContainer, sliderStyle]}
				onPress={this.onPressDimButton}>
				<SliderScale
					style={styles.slider}
					thumbWidth={7}
					thumbHeight={7}
					fontSize={8}
					isGatewayActive={isGatewayActive}
					methodRequested={methodRequested}
					local={local}
					isInState={isInState}
					name={deviceName}
					importantForAccessibility={'yes'}/>
			</HVSliderContainer>
			:
			null;

		return (
			<View style={containerStyle}>
				{ offButton }
				{!!showSlider && slider }
				{ onButton }
			</View>
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
		borderLeftWidth: 1,
		borderLeftColor: '#ddd',
	},
	slider: {
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	buttonContainerStyle: {
		flex: 1,
		alignItems: 'stretch',
		justifyContent: 'center',
		borderBottomLeftRadius: 2,
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
		showDimmerStep: (id: number) => {
			dispatch(showDimmerStep(id));
		},
	};
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	const { app = {} } = store;
	const { screenReaderEnabled, defaultSettings = {} } = app;
	const { dimmerSensitivity: sensitive = 5 } = defaultSettings;
	return {
		screenReaderEnabled,
		sensitive,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(DimmerDashboardTile);
