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

import { setDimmerValue, saveDimmerInitialState } from '../../../Actions/Dimmer';
import { deviceSetState, requestDeviceAction } from '../../../Actions/Devices';
import { FormattedMessage, Text, View } from '../../../../BaseComponents';
import i18n from '../../../Translations/common';
import {
	toDimmerValue,
} from '../../../Lib';
import Theme from '../../../Theme';

type Props = {
	commandON: number,
	commandOFF: number,
	commandDIM: number,
	device: Object,
	locationData: Object,
	deviceSetState: (id: number, command: number, value?: number) => void,
	requestDeviceAction: (number, number) => void,
	onTurnOff: number => void,
	onTurnOn: number => void,
	onLearn: number => void,
	saveDimmerInitialState: (deviceId: number, initalValue: number, initialState: string) => void,
	intl: Object,
	isGatewayActive: boolean,
	style: Object | number | Array<any>,
	appLayout: Object,
};

type State = {
	dimmerValue: number,
};

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

	constructor(props: Props) {
		super(props);

		const dimmerValue: number = this.getDimmerValue(this.props.device);

		this.state = {
			dimmerValue,
			isControlling: false,
		};
		this.onSlidingStart = this.onSlidingStart.bind(this);
		this.onValueChange = this.onValueChange.bind(this);
		this.onSlidingComplete = this.onSlidingComplete.bind(this);
		this.onTurnOn = this.onTurnOn.bind(this);
		this.onTurnOff = this.onTurnOff.bind(this);
	}

	getDimmerValue(device: Object): number {
		if (device !== null) {
			const { stateValues, isInState } = device;
			const value = stateValues.DIM;
			if (isInState === 'TURNON') {
				return 100;
			} else if (isInState === 'TURNOFF') {
				return 0;
			} else if (isInState === 'DIM') {
				return Math.round(value * 100.0 / 255);
			}
		}
		return 0;
	}

	onSlidingStart() {
		this.setState({
			isControlling: true,
		});
		const { id, stateValues, isInState } = this.props.device;
		this.props.saveDimmerInitialState(id, stateValues.DIM, isInState);
	}

	onValueChange(dimmerValue: number) {
		this.setState({ dimmerValue });
	}

	onSlidingComplete(sliderValue: number) {
		if (sliderValue > 0) {
			this.props.requestDeviceAction(this.props.device.id, this.props.commandON);
		}
		if (sliderValue === 0) {
			this.props.requestDeviceAction(this.props.device.id, this.props.commandOFF);
		}
		this.setState({
			isControlling: false,
		});
		let dimValue = toDimmerValue(sliderValue);
		let command = dimValue === 0 ? this.props.commandOFF : this.props.commandDIM;
		this.props.deviceSetState(this.props.device.id, command, dimValue);
	}

	onTurnOn() {
		this.props.deviceSetState(this.props.device.id, this.props.commandON);
		this.props.requestDeviceAction(this.props.device.id, this.props.commandON);
	}

	onTurnOff() {
		this.props.deviceSetState(this.props.device.id, this.props.commandOFF);
		this.props.requestDeviceAction(this.props.device.id, this.props.commandOFF);
	}


	componentWillReceiveProps(nextProps: Object) {
		const device = nextProps.device;
		const dimmerValue = this.getDimmerValue(device);
		if (this.state.dimmerValue !== dimmerValue && !this.state.isControlling) {
			this.setState({ dimmerValue });
		}

		this.setState({ request: 'none' });
	}

	render(): Object {
		const { device, intl, isGatewayActive, style, appLayout } = this.props;
		const { DIM } = device.supportedMethods;
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
		onDimmerSlide: (id: number, value: number): any => dispatch(setDimmerValue(id, value)),
		deviceSetState: (id: number, command: number, value: number): any => dispatch(deviceSetState(id, command, value)),
		requestDeviceAction: (id: number, command: number): any => dispatch(requestDeviceAction(id, command)),
		saveDimmerInitialState: (deviceId: number, initalValue: number, initialState: number): any => dispatch(saveDimmerInitialState(deviceId, initalValue, initialState)),
	};
}

module.exports = connect(null, mapDispatchToProps)(SliderDetails);
