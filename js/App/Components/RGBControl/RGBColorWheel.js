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
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import { ColorWheel } from 'react-native-color-wheel';
const colorsys = require('colorsys');

import {
	View,
	Swatches,
} from '../../../BaseComponents';

import { deviceSetStateRGB, requestDeviceAction } from '../../Actions/Devices';
import { getMainColorRGB } from '../../Lib/rgbUtils';

type Props = {
	device: Object,
	deviceSetStateRGB: (id: number, r: number, g: number, b: number) => void,
    appLayout: Object,

    style?: Array<any> | Object | number,
	thumStyle?: Array<any> | Object | number,
	swatchesCover?: Array<any> | Object | number,
	swatchStyle?: Array<any> | Object | number,
    swatchesCover?: Array<any> | Object | number,
    colorWheelCover?: Array<any> | Object | number,
    swatchWheelCover?: Array<any> | Object | number,
	thumbSize?: number,
	setScrollEnabled?: (boolean) => void,
};

type DefaultProps = {
    thumbSize: number,
};

type State = {
	rgbValue: string,
	isLoading: boolean,
	mainColorRGB: string,
	methodRequested: string,
};

class RGBColorWheel extends View<Props, State> {
props: Props;
static defaultProps: DefaultProps = {
	thumbSize: 15,
};

onColorChangeComplete: string => void;
onChooseColor: (string) => void;

static getDerivedStateFromProps(props: Object, state: Object): Object | null {
	const { stateValues, methodRequested } = props.device;
	const { RGB: rgbValue } = stateValues;
	if (state.rgbValue !== rgbValue) {
		return {
			rgbValue,
			isLoading: true,
			methodRequested,
		};
	}
	if (methodRequested !== state.methodRequested && (methodRequested !== 'DIM' && methodRequested !== 'TURNON' && methodRequested !== 'TURNOFF')) {
		return {
			methodRequested,
			isLoading: methodRequested === '' && state.methodRequested === 'RGB',
		};
	}
	return null;
}

constructor(props: Props) {
	super(props);
	this.onColorChangeComplete = this.onColorChangeComplete.bind(this);

	this.COLOR_SWATCHES = [
		'#FF0000',
		'#FF0066',
		'#0000FF',
		'#00FFFF',
		'#00FF00',
		'#FFFF00',
		'#FF3200',
		'#9696FF',
		'#FFFFFF',
		'#FFFF96',
	];
	const { stateValues, methodRequested } = props.device;
	const { RGB: rgbValue } = stateValues;
	const mainColorRGB = getMainColorRGB(rgbValue);

	this.state = {
		isLoading: false,
		mainColorRGB,
		rgbValue,
		methodRequested,
	};

	this.onChooseColor = this.onChooseColor.bind(this);
}

onColorChangeComplete(color: string) {
	this.props.setScrollEnabled(true);
	if (!color) {
		return;
	}
	const { device } = this.props;

	const hex = colorsys.hsvToHex(color);
	this.setState({
		mainColorRGB: hex,
	}, () => {
		const rgb = colorsys.hsvToRgb(color);
		const { r, g, b } = rgb;
		this.props.deviceSetStateRGB(device.id, r, g, b);
	});
}

onColorChange = () => {
	this.props.setScrollEnabled(false);
}

componentDidUpdate(prevProps: Object, prevState: Object) {
	const { rgbValue, isLoading, methodRequested, mainColorRGB } = this.state;
	const { rgbValue: rgbValuePrev } = prevState;
	if (rgbValue !== rgbValuePrev && isLoading) {// device set state
		const mainColorRGBN = getMainColorRGB(rgbValue);
		this.setState({
			mainColorRGB: mainColorRGBN,
			isLoading: false,
		});
	} else if (isLoading && methodRequested === 'RGB' && prevState.methodRequested === '') {
		this.setState({
			mainColorRGB,
			isLoading: false,
		});
	} else if (isLoading && methodRequested === '' && prevState.methodRequested === 'RGB') {
		const mainColorRGBN = getMainColorRGB(rgbValue);
		this.setState({
			mainColorRGB: mainColorRGBN,
			isLoading: false,
		});
	} else if (isLoading) {
		this.setState({
			mainColorRGB,
			isLoading: false,
		});
	}
}

getSwatches(color: string, key: number): Object {
	const {
		swatchStyle,
	} = this.props;
	return (
		<Swatches
			key={key}
			style={[
				swatchStyle,
				{
					backgroundColor: color,
				}]}
			onPress={this.onChooseColor}
			swatch={color}/>
	);
}

onChooseColor(item: string) {
	if (!item) {
		return;
	}
	const { device } = this.props;
	const rgb = colorsys.hexToRgb(item);
	const { r, g, b } = rgb;
	this.setState({
		mainColorRGB: item,
	}, () => {
		this.props.deviceSetStateRGB(device.id, r, g, b);
	});
}

render(): Object {
	const { isLoading, mainColorRGB } = this.state;
	const {
		thumStyle,
		style,
		thumbSize,
		swatchesCover,
		colorWheelCover,
		swatchWheelCover,
	} = this.props;

	const colorSwatches = this.COLOR_SWATCHES.map((color: string, i: number): any => {
		return this.getSwatches(color, i);
	});

	return (
		<View style={swatchWheelCover}>
			<View style={colorWheelCover}>
				{isLoading ?
					<View style={{
						flex: 1,
						justifyContent: 'center',
						alignItems: 'center',
					}}>
						<ActivityIndicator animating={true} color={'#cccccc'} size={'small'}/>
					</View>
					:
					<ColorWheel
						initialColor={mainColorRGB}
						onColorChangeComplete={this.onColorChangeComplete}
						style={style}
						onColorChange={this.onColorChange}
						thumbStyle={thumStyle}
						thumbSize={thumbSize}
					/>
				}
			</View>
			<View style={swatchesCover}>
				{colorSwatches}
			</View>
		</View>
	);
}

getStyles(): Object {
	return {
	};
}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		deviceSetStateRGB: (id: number, r: number, g: number, b: number) => {
			dispatch(requestDeviceAction(id, 1024, false));
			dispatch(deviceSetStateRGB(id, r, g, b));
		},
	};
}

export default connect(null, mapDispatchToProps)(RGBColorWheel);
