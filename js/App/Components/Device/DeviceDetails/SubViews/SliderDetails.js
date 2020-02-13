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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { StyleSheet, Dimensions } from 'react-native';
import Slider from 'react-native-slider';

const deviceHeight = Dimensions.get('window').height;

import { setDimmerValue, saveDimmerInitialState } from '../../../../Actions/Dimmer';
import { deviceSetState, requestDeviceAction } from '../../../../Actions/Devices';
import { FormattedMessage, Text, View } from '../../../../../BaseComponents';
import i18n from '../../../../Translations/common';
import {
	toDimmerValue,
	getDimmerValue,
	toSliderValue,
} from '../../../../Lib';
import Theme from '../../../../Theme';

type Props = {
	commandON: number,
	commandOFF: number,
	commandDIM: number,
	device: Object,
	locationData: Object,
	deviceSetState: (id: number, command: number, value?: number) => void,
	onTurnOff: number => void,
	onTurnOn: number => void,
	onLearn: number => void,
	saveDimmerInitialState: (deviceId: number, initalValue: number, initialState: string) => void,
	requestDeviceAction: (number) => any,
	intl: Object,
	isGatewayActive: boolean,
	style: Object | number | Array<any>,
	appLayout: Object,
	onPressOverride?: (Object) => void,
};

type State = {
	dimmerValue: number,
};

function prepareDimmerValue(device: Object): number {
	if (device !== null) {
		const { stateValues, isInState, value } = device;
		const stateValue = stateValues ? stateValues.DIM : value;
		return toSliderValue(getDimmerValue(stateValue, isInState));
	}
	return 0;
}

class SliderDetails extends View {
	props: Props;
	state: State;
	onTurnOn: () => void;
	onTurnOff: () => void;
	onLearn: () => void;
	onSlidingStart: () => void;
	onValueChange: (number) => void;
	onSlidingComplete: (number) => void;
	onTurnOn: () => void;
	onTurnOff: () => void;

	static getDerivedStateFromProps(props: Object, state: Object): null | Object {
		const { device } = props;
		const dimmerValue = prepareDimmerValue(device);

		if (state.dimmerValue !== dimmerValue && device.methodRequested === '') {
			return {
				dimmerValue,
			};
		}
		return null;
	}

	constructor(props: Props) {
		super(props);

		const dimmerValue: number = prepareDimmerValue(this.props.device);

		this.state = {
			dimmerValue,
		};
		this.onSlidingStart = this.onSlidingStart.bind(this);
		this.onValueChange = this.onValueChange.bind(this);
		this.onSlidingComplete = this.onSlidingComplete.bind(this);
		this.onTurnOn = this.onTurnOn.bind(this);
		this.onTurnOff = this.onTurnOff.bind(this);
	}

	onSlidingStart() {
		const { device, requestDeviceAction: rDA, saveDimmerInitialState: sDIS } = this.props;

		const { id, stateValues, isInState, value } = device;
		const stateValue = stateValues ? stateValues.DIM : value;
		sDIS(id, stateValue, isInState);

		rDA(id);
	}

	onValueChange(dimmerValue: number) {
		this.setState({ dimmerValue });
	}

	onSlidingComplete(sliderValue: number) {
		const {
			device,
			commandOFF,
			commandDIM,
			onPressOverride,
		} = this.props;

		let dimValue = toDimmerValue(sliderValue);
		let command = dimValue === 0 ? commandOFF : commandDIM;

		if (onPressOverride) {
			onPressOverride({
				method: command,
				stateValues: {
					[commandDIM]: dimValue,
				},
			});
			return;
		}

		this.props.deviceSetState(device.id, command, dimValue);
	}

	onTurnOn() {
		const {
			device,
			commandON,
			onPressOverride,
		} = this.props;

		if (onPressOverride) {
			onPressOverride({
				method: commandON,
			});
			return;
		}

		this.props.deviceSetState(device.id, commandON);
	}

	onTurnOff() {
		const {
			device,
			commandOFF,
			onPressOverride,
		} = this.props;

		if (onPressOverride) {
			onPressOverride({
				method: commandOFF,
			});
			return;
		}

		this.props.deviceSetState(device.id, commandOFF);
	}

	render(): Object {
		const { device, intl, isGatewayActive, style, appLayout } = this.props;
		const { supportedMethods = {} } = device;
		const { DIM } = supportedMethods;
		const minimumTrackTintColor = isGatewayActive ? Theme.Core.brandSecondary : '#cccccc';
		const maximumTrackTintColor = isGatewayActive ? 'rgba(219, 219, 219, 255)' : '#e5e5e5';
		const thumbTintColor = isGatewayActive ? Theme.Core.brandSecondary : '#cccccc';

		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const fontSize = deviceWidth * 0.032;
		let slider = null;

		if (DIM) {
			slider = <Slider minimumValue={0} maximumValue={100} step={1} value={this.state.dimmerValue}
			                 style={{
				                 marginHorizontal: 8,
				                 marginVertical: 8,
			                 }}
			                 minimumTrackTintColor={minimumTrackTintColor}
			                 maximumTrackTintColor={maximumTrackTintColor}
			                 thumbTintColor={thumbTintColor}
			                 onValueChange={this.onValueChange}
							 onSlidingStart={this.onSlidingStart}
			                 onSlidingComplete={this.onSlidingComplete}
			                 animateTransitions={true}
							 intl={intl}/>;
		}

		return (
			<View style={[styles.container, style]}>
				<Text style={[styles.textDimmingLevel, {fontSize}]}>
					<FormattedMessage {...i18n.dimmingLevel} style={[styles.textDimmingLevel, {fontSize}]} />: {this.state.dimmerValue}%
				</Text>
				{slider}
			</View>
		);
	}

}

SliderDetails.propTypes = {
	device: PropTypes.object.isRequired,
};

SliderDetails.defaultProps = {
	commandON: 1,
	commandOFF: 2,
	commandDIM: 16,
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	textDimmingLevel: {
		color: '#1a355b',
		fontSize: 14,
		marginTop: 12,
		marginLeft: 8,
	},
	toggleContainer: {
		flexDirection: 'row',
		height: 36,
		marginHorizontal: 8,
		marginVertical: 16,
	},
	turnOff: {
		flex: 1,
		alignItems: 'stretch',
		justifyContent: 'center',
		borderTopLeftRadius: 7,
		borderBottomLeftRadius: 7,
	},
	turnOn: {
		flex: 1,
		alignItems: 'stretch',
		justifyContent: 'center',
		borderTopRightRadius: 7,
		borderBottomRightRadius: 7,
	},
	dimmerContainer: {
		marginTop: 20,
		height: (deviceHeight * 0.28),
		backgroundColor: '#fff',
	},
	shadow: {
		borderRadius: 2,
		...Theme.Core.shadow,
	},
});

function mapDispatchToProps(dispatch: Function): Object {
	return {
		requestDeviceAction: (deviceId: number): any => dispatch(requestDeviceAction(deviceId, 'DIM', false)),
		onDimmerSlide: (id: number, value: number): any => dispatch(setDimmerValue(id, value)),
		deviceSetState: (id: number, command: number, value: number): any => {
			return dispatch(deviceSetState(id, command, value));
		},
		saveDimmerInitialState: (deviceId: number, initalValue: number, initialState: number): any => dispatch(saveDimmerInitialState(deviceId, initalValue, initialState)),
	};
}

module.exports = connect(null, mapDispatchToProps)(SliderDetails);
