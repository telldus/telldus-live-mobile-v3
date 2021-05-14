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
import { connect } from 'react-redux';
import { ColorWheel } from 'react-native-color-wheel';
const colorsys = require('colorsys');
import ButtonLoadingIndicator from '../TabViews/SubViews/ButtonLoadingIndicator';

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
	colorWheelCoverLevel: number,
	swatchesCoverLevel: number,

    style?: Array<any> | Object,
	thumStyle?: Array<any> | Object,
	swatchesCover?: Array<any> | Object,
	swatchStyle?: Array<any> | Object,
    swatchesCover?: Array<any> | Object,
    colorWheelCover?: Array<any> | Object,
    swatchWheelCover?: Array<any> | Object,
	thumbSize?: number,
	setScrollEnabled?: (boolean) => void,
	deviceSetStateRGBOverride?: (id: number, value: string) => void,
	showActionIndicator?: boolean,
};

type DefaultProps = {
	thumbSize: number,
	showActionIndicator: boolean,
};

type State = {
	rgbValue: string,
	mainColorRGB: string,
	methodRequested: string,
	controlSource: string,
};

class RGBColorWheel extends View<Props, State> {
props: Props;
static defaultProps: DefaultProps = {
	thumbSize: 15,
	showActionIndicator: false,
};

onColorChangeComplete: string => void;
onChooseColor: (string) => void;

static getDerivedStateFromProps(props: Object, state: Object): Object | null {
	const { stateValues, methodRequested } = props.device;
	const { RGB: rgbValue } = stateValues;
	if (state.rgbValue !== rgbValue) {
		return {
			rgbValue,
			methodRequested,
		};
	}
	if (methodRequested !== state.methodRequested && (methodRequested !== 'DIM' && methodRequested !== 'TURNON' && methodRequested !== 'TURNOFF')) {
		return {
			methodRequested,
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
		mainColorRGB,
		rgbValue,
		methodRequested,
		controlSource: '',
		toggleMeToforceUpdateInitialColor: 0,
	};
}

onColorChangeComplete(color: string) {
	const { setScrollEnabled, device, deviceSetStateRGBOverride } = this.props;
	if (setScrollEnabled) {
		setScrollEnabled(true);
	}
	if (!color) {
		return;
	}

	const hex = colorsys.hsvToHex(color);
	this.setState({
		mainColorRGB: hex,
		controlSource: 'wheel',
	}, () => {
		if (deviceSetStateRGBOverride) {
			deviceSetStateRGBOverride(device.id, hex);
			return;
		}
		const rgb = colorsys.hsvToRgb(color);
		const { r, g, b } = rgb;
		this.props.deviceSetStateRGB(device.id, r, g, b);
	});
}

onColorChange = () => {
	const { setScrollEnabled } = this.props;
	if (setScrollEnabled) {
		setScrollEnabled(false);
	}
}

componentDidUpdate(prevProps: Object, prevState: Object) {
	const {
		rgbValue,
		methodRequested,
		mainColorRGB,
		toggleMeToforceUpdateInitialColor,
	} = this.state;
	const { rgbValue: rgbValuePrev } = prevState;
	if (rgbValue !== rgbValuePrev) {// device set state
		const mainColorRGBN = getMainColorRGB(rgbValue);
		this.setState({
			mainColorRGB: mainColorRGBN,
			toggleMeToforceUpdateInitialColor: toggleMeToforceUpdateInitialColor ? 0 : 1,
		});
	} else if (methodRequested === 'RGB' && prevState.methodRequested === '') {
		this.setState({
			mainColorRGB,
			toggleMeToforceUpdateInitialColor: toggleMeToforceUpdateInitialColor ? 0 : 1,
		});
	} else if (methodRequested === '' && prevState.methodRequested === 'RGB') {
		const mainColorRGBN = getMainColorRGB(rgbValue);
		this.setState({
			mainColorRGB: mainColorRGBN,
			toggleMeToforceUpdateInitialColor: toggleMeToforceUpdateInitialColor ? 0 : 1,
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

onChooseColor = (item: string) => {
	if (!item) {
		return;
	}
	const { device, deviceSetStateRGBOverride } = this.props;
	const rgb = colorsys.hexToRgb(item);
	const { r, g, b } = rgb;
	this.setState({
		mainColorRGB: item,
		controlSource: 'swatch',
		toggleMeToforceUpdateInitialColor: this.state.toggleMeToforceUpdateInitialColor ? 0 : 1,
	}, () => {
		if (deviceSetStateRGBOverride) {
			deviceSetStateRGBOverride(device.id, item);
			return;
		}
		this.props.deviceSetStateRGB(device.id, r, g, b);
	});
}

render(): Object {
	const {
		mainColorRGB,
		controlSource,
		toggleMeToforceUpdateInitialColor,
	} = this.state;
	const {
		thumStyle,
		style,
		thumbSize,
		swatchesCover,
		colorWheelCover,
		swatchWheelCover,
		device,
		showActionIndicator,
		colorWheelCoverLevel = 2,
		swatchesCoverLevel = 2,
	} = this.props;

	const colorSwatches = this.COLOR_SWATCHES.map((color: string, i: number): any => {
		return this.getSwatches(color, i);
	});

	const {
		methodRequested,
	} = device;

	const {
		dot,
	} = this.getStyles();

	return (
		<View style={swatchWheelCover}>
			<View
				level={colorWheelCoverLevel}
				style={colorWheelCover}>
				{(showActionIndicator && controlSource === 'wheel' && methodRequested === 'RGB') ?
					<ButtonLoadingIndicator style={dot}/>
					: null
				}
				<ColorWheel
					initialColor={mainColorRGB}
					onColorChangeComplete={this.onColorChangeComplete}
					style={style}
					onColorChange={this.onColorChange}
					thumbStyle={thumStyle}
					thumbSize={thumbSize}
					toggleMeToforceUpdateInitialColor={toggleMeToforceUpdateInitialColor}
				/>
			</View>
			<View
				level={swatchesCoverLevel}
				style={swatchesCover}>
				{(showActionIndicator && controlSource === 'swatch' && methodRequested === 'RGB') ?
					<ButtonLoadingIndicator style={dot}/>
					: null
				}
				{colorSwatches}
			</View>
		</View>
	);
}

getStyles(): Object {
	return {
		dot: {
			position: 'absolute',
			top: 6,
			left: 6,
		},
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

export default (connect(null, mapDispatchToProps)(RGBColorWheel): Object);
