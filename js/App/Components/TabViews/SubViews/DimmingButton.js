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

'use strict';

import React from 'react';
import { connect } from 'react-redux';

import { Text, View, RoundedCornerShadowView } from 'BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { showDimmerPopup, hideDimmerPopup } from 'Actions/Dimmer';
import VerticalSlider from './VerticalSlider';

import throttle from 'lodash/throttle';

const OffButton = ({item, enabled, onPress}) => (
    <View style={[styles.buttonContainer, {
	backgroundColor: item.isInState === 'TURNOFF' && enabled ? '#fafafa' : '#eeeeee'}]}>
        <TouchableOpacity
			onPress={enabled ? onPress : null}
			style={styles.button} >
            <Text
                ellipsizeMode="middle"
                numberOfLines={1}
                style = {[styles.buttonText, {
	color: item.isInState === 'TURNOFF' && enabled ? 'red' : '#a2a2a2'}]}>
                {'Off'}
            </Text>
        </TouchableOpacity>
    </View>
);

const OnButton = ({item, enabled, onPress}) => (
    <View style={[styles.buttonContainer, {
	backgroundColor: item.isInState !== 'TURNOFF' && enabled ? '#fafafa' : '#eeeeee'}]}>
        <TouchableOpacity
			onPress={enabled ? onPress : null}
			style={styles.button} >
            <Text
                ellipsizeMode="middle"
                numberOfLines={1}
                style = {[styles.buttonText, {
	color: item.isInState !== 'TURNOFF' && enabled ? 'green' : '#a2a2a2'}]}>
                {'On'}
            </Text>
        </TouchableOpacity>
    </View>
);


function getDimmerValue(value, isInState) {
	let newValue = value || 0;
	if (isInState === 'TURNON') {
		return 255;
	}
	if (isInState === 'TURNOFF') {
		return 0;
	}

	newValue = parseInt(newValue, 10);
	return newValue;
}

function toDimmerValue(sliderValue) {
	return Math.round(sliderValue * 255 / 100.0);
}

function toSliderValue(dimmerValue) {
	return Math.round(dimmerValue * 100.0 / 255);
}

class DimmingButton extends View {
	constructor(props) {
		super(props);

		const value = getDimmerValue(this.props.item.value, this.props.item.isInState);
		this.parentScrollEnabled = true;
		this.state = {
			buttonWidth: 0,
			buttonHeight: 0,
			value,
		};

		this.onValueChangeThrottled = throttle(this.props.onDimmerSlide, 200, {
			trailing: true,
		});
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.item.value === this.props.item.value && nextProps.item.isInState === this.props.item.isInState) {
			return;
		}
		const dimmerValue = getDimmerValue(nextProps.item.value, nextProps.item.isInState);
		this.setState({value: dimmerValue});
	}

	layoutView(x) {
		let {width, height} = x.nativeEvent.layout;
		this.setState({
			buttonWidth: width,
			buttonHeight: height,
		});
	}

	onValueChange(sliderValue) {
		this.onValueChangeThrottled(toDimmerValue(sliderValue));
	}

	onSlidingStart(name:String, sliderValue:Number) {
		this.props.showDimmerPopup(name, toDimmerValue(sliderValue));
	}

	onSlidingComplete(sliderValue:Number) {
		this.props.onDim(toDimmerValue(sliderValue));
		this.props.hideDimmerPopup();
	}

	render() {
		const { TURNON, TURNOFF, DIM } = this.props.item.supportedMethods;

		const turnOnButton = <OnButton item={this.props.item} enabled={TURNON} onPress={this.props.onTurnOn} />;
		const turnOffButton = <OffButton item={this.props.item} enabled={TURNOFF} onPress={this.props.onTurnOff} />;
		const slider = DIM ?
            <VerticalSlider
                style={[styles.slider, {
	width: this.state.buttonWidth / 5,
	height: this.state.buttonHeight,
	left: this.state.buttonWidth / 2 - this.state.buttonWidth / 10,
	bottom: 0,
}]}
                thumbHeight={9}
                fontSize={7}
                item={this.props.item}
                value={toSliderValue(this.state.value)}
                setScrollEnabled={this.props.setScrollEnabled}
                onSlidingStart={this.onSlidingStart.bind(this)}
                onSlidingComplete={this.onSlidingComplete.bind(this)}
                onValueChange={this.onValueChange.bind(this)}
            /> :
            null;

		return (
            <RoundedCornerShadowView
                onLayout={this.layoutView.bind(this)}
                style={styles.container}>
                { turnOffButton }
                { turnOnButton }
                { slider }
            </RoundedCornerShadowView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 7,
		width: 88,
		height: 32,
		justifyContent: 'center',
		alignItems: 'center',
	},
	buttonContainer: {
		flex: 1,
		alignItems: 'stretch',
	},
	button: {
		flex: 1,
		justifyContent: 'center',
	},
	buttonText: {
		fontSize: 12,
		textAlign: 'center',
		textAlignVertical: 'center',
	},
	slider: {
		flex: 1,
		position: 'absolute',
	},
});

function actions(dispatch) {
	return {
		showDimmerPopup: (name:String, value:Number) => {
			dispatch(showDimmerPopup(name, value));
		},
		hideDimmerPopup: () => {
			dispatch(hideDimmerPopup());
		},
	};
}

module.exports = connect(() => ({}), actions)(DimmingButton);
