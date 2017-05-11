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

import { Text, View } from 'BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';
import DashboardShadowTile from './DashboardShadowTile';
import { showDimmerPopup, hideDimmerPopup } from 'Actions/Dimmer';
import VerticalSlider from './VerticalSlider';

import throttle from 'lodash/throttle';

const Title = ({ isInState, name, tileWidth }) => (
    <View style={[styles.title, {
	backgroundColor: isInState === 'TURNOFF' ? '#bfbfbf' : '#e56e18'}]}>
		<Text
			ellipsizeMode="middle"
			numberOfLines={1}
			style = {[styles.name, {
				fontSize: Math.floor(tileWidth / 8),
				opacity: name ? 1 : 0.7,
			}]}>
			{name ? name : '(no name)'}
		</Text>
	</View>
);

const OffButton = ({ isInState, enabled, tileWidth, onPress }) => (
    <View style={{
	flex: 1,
	backgroundColor: isInState === 'TURNOFF' && enabled ? 'white' : '#eeeeee',
}}>
		<TouchableOpacity
			onPress={ enabled ? onPress : null}
			style={styles.button} >
			<Text
				ellipsizeMode="middle"
				numberOfLines={1}
				style = {[styles.buttonText, {
					color: isInState === 'TURNOFF' ? 'red' : '#a0a0a0',
					fontSize: Math.floor(tileWidth / 8),
				}]}>
				{'Off'}
			</Text>
		</TouchableOpacity>
	</View>
);

const OnButton = ({ isInState, enabled, tileWidth, onPress }) => (
    <View style={{
	flex: 1,
	backgroundColor: isInState !== 'TURNOFF' && enabled ? 'white' : '#eeeeee',
}}>
		<TouchableOpacity
			onPress={ enabled ? onPress : null}
			style={styles.button} >
			<Text
				ellipsizeMode="middle"
				numberOfLines={1}
				style = {[styles.buttonText, {
					color: isInState !== 'TURNOFF' ? 'green' : '#a0a0a0',
					fontSize: Math.floor(tileWidth / 8),
				}]}>
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

class DimmerDashboardTile extends View {
	constructor(props) {
		super(props);
		const value = getDimmerValue(this.props.item.childObject.value, this.props.item.isInState);
		this.parentScrollEnabled = true;
		this.state = {
			bodyWidth: 0,
			bodyHeight: 0,
			value,
		};

		this.onValueChangeThrottled = throttle(this.props.onDimmerSlide, 200, {
			trailing: true,
		});
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.item.childObject.value === this.props.item.childObject.value && nextProps.item.childObject.isInState === this.props.item.childObject.isInState) {
			return;
		}
		const dimmerValue = getDimmerValue(nextProps.item.childObject.value, nextProps.item.childObject.isInState);
		this.setState({value: dimmerValue});
	}

	layoutView(x) {
		let {width, height} = x.nativeEvent.layout;
		this.setState({
			bodyWidth: width,
			bodyHeight: height,
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
		const item = this.props.item;
		const isInState = item.childObject.isInState;
		const name = item.childObject.name;
		const tileWidth = item.tileWidth - 8;
		const { TURNON, TURNOFF, DIM } = item.childObject.supportedMethods;
		const turnOnButton = <OnButton isInState={isInState} enabled={TURNON} tileWidth={tileWidth} onPress={this.props.onTurnOn} />;
		const turnOffButton = <OffButton isInState={isInState} enabled={TURNOFF} tileWidth={tileWidth} onPress={this.props.onTurnOff} />;
		const slider = DIM ?
            <VerticalSlider
                style={[styles.slider, {
	width: this.state.bodyWidth / 5,
	height: this.state.bodyHeight,
	left: this.state.bodyWidth / 2 - this.state.bodyWidth / 10,
	bottom: 0,
}]}
                item={this.props.item.childObject}
                value={toSliderValue(this.state.value)}
                setScrollEnabled={this.props.setScrollEnabled}
                onSlidingStart={this.onSlidingStart.bind(this)}
                onSlidingComplete={this.onSlidingComplete.bind(this)}
                onValueChange={this.onValueChange.bind(this)}
            /> :
            null;
		return (
			<DashboardShadowTile
				item={item}
				style={	[this.props.style, {
					width: tileWidth,
					height: tileWidth,
				}]}>
				<View style={styles.body} onLayout={this.layoutView.bind(this)}>
                    { turnOffButton }
                    { turnOnButton }
                    { slider }
				</View>
                <Title isInState={isInState} tileWidth={tileWidth} name={name} tileWidth={tileWidth} />
			</DashboardShadowTile>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
	},
	body: {
		flex: 30,
		flexDirection: 'row',
	},
	title: {
		flex: 13,
		justifyContent: 'center',
	},
	name: {
		padding: 5,
		color: 'white',
		textAlign: 'center',
		textAlignVertical: 'center',
	},
	button: {
		flex: 1,
		justifyContent: 'center',
	},
	buttonText: {
		textAlign: 'center',
		textAlignVertical: 'center',
	},
	slider: {
		flex: 1,
		position: 'absolute',
	},
	thumb: {
		flex: 1,
		borderRadius: 7,
		borderWidth: 1,
		borderColor: 'gray',
		elevation: 2,
		position: 'absolute',
		bottom: 0,
		width: 30,
		height: 12,
		justifyContent: 'center',
		backgroundColor: 'white',
	},
	thumbText: {
		color: '#a2a2a2',
		fontSize: 10,
		textAlign: 'center',
		textAlignVertical: 'center',
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

module.exports = connect(() => ({}), actions)(DimmerDashboardTile);
