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
import Slider from 'react-native-slider';
import { connect } from 'react-redux';

import {
	Text,
	View,
} from '../../../../../BaseComponents';

import { saveDimmerInitialState, setDimmerValue } from '../../../../Actions/Dimmer';
import { deviceSetState } from '../../../../Actions/Devices';
import {
	toDimmerValue,
	toSliderValue,
	getDimmerValue,
} from '../../../../Lib';

type Props = {
    value: number,
    showTitle?: boolean,
    isInState: string,
    id: number,
    prefix?: string,

    commandON: number,
	commandOFF: number,
	commandDIM: number,
};

type DefaultProps = {
	commandON: number,
	commandOFF: number,
	commandDIM: number,
};

class DimSlider extends View<Props, null> {

static defaultProps: DefaultProps = {
	commandON: 1,
	commandOFF: 2,
	commandDIM: 16,
	showTitle: true,
};

    onSlidingStart: (name: string, sliderValue: number) => void;
	onSlidingComplete: number => void;
	onValueChange: number => void;
	constructor(props: Props) {
		super(props);

		this.onValueChange = this.onValueChange.bind(this);
		this.onSlidingStart = this.onSlidingStart.bind(this);
		this.onSlidingComplete = this.onSlidingComplete.bind(this);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return this.props.value !== nextProps.value;
	}

	onValueChange(sliderValue: number) {
		const { id } = this.props;
		this.props.onDimmerSlide(id, toDimmerValue(sliderValue));
	}

	onSlidingStart(name: string, sliderValue: number) {
		const { isInState, id, value } = this.props;

		this.props.saveDimmerInitialState(id, value, isInState);
	}

	onSlidingComplete(sliderValue: number) {
		let { id, commandON, commandOFF, commandDIM } = this.props;
		let command = commandDIM;
		if (sliderValue === 100) {
			command = commandON;
		}
		if (sliderValue === 0) {
			command = commandOFF;
		}
		let dimValue = toDimmerValue(sliderValue);
		this.props.deviceSetState(id, command, dimValue);
	}

	render(): Object {
		const {
			showTitle,
			value,
			prefix,
			isInState,
			appLayout,
			minimumTrackTintColor,
			maximumTrackTintColor,
			thumbTintColor,
			sliderContainerStyle,
			headerStyle,
			sliderStyle,
			thumbStyle,
		} = this.props;
		const {
			headerStyleDef,
			thumbStyleDef,
		} = this.getStyles(appLayout);
		const dimValue = getDimmerValue(value, isInState);
		const sliderValue = toSliderValue(dimValue);

		return (
			<View style={sliderContainerStyle}>
				{!!showTitle && <Text style={[headerStyleDef, headerStyle]}>
					{prefix}{sliderValue}%
				</Text>
				}
				<Slider
					minimumValue={0}
					maximumValue={100}
					step={1}
					value={sliderValue}
					style={sliderStyle}
					thumbStyle={[thumbStyleDef, thumbStyle]}
					minimumTrackTintColor={minimumTrackTintColor}
					maximumTrackTintColor={maximumTrackTintColor}
					thumbTintColor={thumbTintColor}
					onValueChange={this.onValueChange}
					onSlidingStart={this.onSlidingStart}
					onSlidingComplete={this.onSlidingComplete}
					animateTransitions={true}/>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		return {
			headerStyleDef: {
				color: '#000',
				fontSize: 12,
			},
			thumbStyleDef: {
				height: 12,
				width: 12,
				borderRadius: 6,
			},
		};
	}
}

const mapDispatchToProps = (dispatch: Function): Object => {
	return {
		saveDimmerInitialState: (deviceId: number, initalValue: number, initialState: string) => {
			dispatch(saveDimmerInitialState(deviceId, initalValue, initialState));
		},
		onDimmerSlide: (id: number, value: number): any => dispatch(setDimmerValue(id, value)),
		deviceSetState: (id: number, command: number, value?: number): any => dispatch(deviceSetState(id, command, value)),
	};
};

const mapStateToProps = (store: Object, ownProps: Object): Object => {
	const device = store.devices.byId[ownProps.id];
	const { isInState, value, stateValues } = device ? device : {};
	return {
		isInState,
		value: (stateValues && stateValues.DIM) ? stateValues.DIM : value,
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(DimSlider);
