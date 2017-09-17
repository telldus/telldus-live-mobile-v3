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
import { StyleSheet, Dimensions } from 'react-native';
import Slider from 'react-native-slider';

const deviceHeight = Dimensions.get('window').height;

import { setDimmerValue, saveDimmerInitialState } from 'Actions_Dimmer';
import { deviceSetState } from 'Actions_Devices';
import { FormattedMessage, RoundedCornerShadowView, Text, View } from 'BaseComponents';
import { OnButton, OffButton } from 'TabViews_SubViews';
import i18n from '../../../../../Translations/common';

type Props = {
	commandDIM: number,
	device: Object,
	locationData: Object,
	onDim: (id: number, command: number, value: number) => void,
	onTurnOff: number => void,
	onTurnOn: number => void,
	onLearn: number => void,
	saveDimmerInitialState: (deviceId: number, initalValue: number, initialState: string) => void;
};

type State = {
	dimmerValue: number,
};

const ToggleButton = ({ device }) => (
	<RoundedCornerShadowView style={styles.toggleContainer}>
		<OffButton id={device.id} isInState={device.isInState} fontSize={16} style={styles.turnOff} methodRequested={device.methodRequested} />
		<OnButton id={device.id} isInState={device.isInState} fontSize={16} style={styles.turnOn} methodRequested={device.methodRequested} />
	</RoundedCornerShadowView>
);
class DimmerDeviceDetailModal extends View {
	props: Props;
	state: State;
	onTurnOn: () => void;
	onTurnOff: () => void;
	onLearn: () => void;
	onSlidingStart: () => void;
	onValueChange: (number) => void;
	onSlidingComplete: (number) => void;

	constructor(props: Props) {
		super(props);

		const dimmerValue: number = this.getDimmerValue(this.props.device);

		this.state = {
			dimmerValue,
		};

		this.onSlidingStart = this.onSlidingStart.bind(this);
		this.onValueChange = this.onValueChange.bind(this);
		this.onSlidingComplete = this.onSlidingComplete.bind(this);
	}

	getDimmerValue(device: Object) : number {
		if (device !== null && device.value !== null) {
			if (device.isInState === 'TURNON') {
				return 100;
			} else if (device.isInState === 'TURNOFF') {
				return 0;
			} else if (device.isInState === 'DIM') {
				return Math.round(device.value * 100.0 / 255);
			}
		}
		return 0;
	}

	onSlidingStart() {
		this.props.saveDimmerInitialState(this.props.device.id, this.props.device.value, this.props.device.isInState);
	}

	onValueChange(dimmerValue) {
		this.setState({ dimmerValue });
	}

	onSlidingComplete(value) {
		this.props.onDim(this.props.device.id, this.props.commandDIM, 255 * value / 100.0);
	}

	componentWillReceiveProps(nextProps) {
		const device = nextProps.device;
		const dimmerValue = this.getDimmerValue(device);
		if (this.state.dimmerValue !== dimmerValue) {
			this.setState({ dimmerValue });
		}

		this.setState({ request: 'none' });
	}

	render() {
		const { device } = this.props;
		const { TURNON, TURNOFF, DIM } = device.supportedMethods;

		let toggleButton = null;
		let slider = null;

		if (TURNON || TURNOFF) {
			toggleButton = <ToggleButton device={device} onTurnOn={this.onTurnOn} onTurnOff={this.onTurnOff}/>;
		}

		if (DIM) {
			slider = <Slider minimumValue={0} maximumValue={100} step={1} value={this.state.dimmerValue}
			                 style={{
				                 marginHorizontal: 8,
				                 marginVertical: 8,
			                 }}
			                 minimumTrackTintColor="rgba(0,150,136,255)"
			                 maximumTrackTintColor="rgba(219,219,219,255)"
			                 thumbTintColor="rgba(0,150,136,255)"
			                 onValueChange={this.onValueChange}
							 onSlidingStart={this.onSlidingStart}
			                 onSlidingComplete={this.onSlidingComplete}
			                 animateTransitions={true}/>;
		}

		return (
			<View style={styles.container}>
				<View style={[styles.shadow, styles.dimmerContainer]}>
					<Text style={styles.textDimmingLevel}>
						<FormattedMessage {...i18n.dimmingLevel} style={styles.textDimmingLevel} />: {this.state.dimmerValue}%
					</Text>
					{slider}
					{toggleButton}
				</View>
			</View>
		);
	}

}

DimmerDeviceDetailModal.propTypes = {
	device: React.PropTypes.object.isRequired,
};

DimmerDeviceDetailModal.defaultProps = {
	commandDIM: 16,
};

const styles = StyleSheet.create({
	container: {
		flex: 0,
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
		borderTopLeftRadius: 7,
		borderBottomLeftRadius: 7,
	},
	turnOn: {
		flex: 1,
		alignItems: 'stretch',
		borderTopRightRadius: 7,
		borderBottomRightRadius: 7,
	},
	dimmerContainer: {
		marginTop: 20,
		height: (deviceHeight * 0.28),
	},
	shadow: {
		borderRadius: 4,
		backgroundColor: '#fff',
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 0,
		},
		shadowRadius: 1,
		shadowOpacity: 1.0,
		elevation: 2,
	},
});

function mapDispatchToProps(dispatch) {
	return {
		onDimmerSlide: (id, value) => dispatch(setDimmerValue(id, value)),
		onDim: (id, command, value) => dispatch(deviceSetState(id, command, value)),
		saveDimmerInitialState: (deviceId, initalValue, initialState) => dispatch(saveDimmerInitialState(deviceId, initalValue, initialState)),
	};
}

module.exports = connect(null, mapDispatchToProps)(DimmerDeviceDetailModal);
