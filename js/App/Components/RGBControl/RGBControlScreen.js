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
import {
	ScrollView,
} from 'react-native';
import { connect } from 'react-redux';
import { ColorWheel } from 'react-native-color-wheel';
const colorsys = require('colorsys');

import {
	NavigationHeaderPoster,
	View,
} from '../../../BaseComponents';
import SliderDetails from '../Device/DeviceDetails/SubViews/SliderDetails';

import { deviceSetStateRGB } from '../../Actions/Devices';
import { getMainColorRGB } from '../../Lib/rgbUtils';

import i18n from '../../Translations/common';
import Theme from '../../Theme';

type Props = {
	openModal: () => void,
	device: Object,
	deviceName: string,
	deviceSetStateRGB: (id: number, r: number, g: number, b: number) => void,
	intl: Object,
    isGatewayActive: boolean,
    appLayout: Object,
    navigation: Object,
};

type State = {
	sliderValue: number,
	scrollEnabled: boolean,
	x1: number,
	x2: number,
	y1: number,
	y2: number,
};

class RGBControlScreen extends View<Props, State> {
	props: Props;
	state: State;

	state = {
		sliderValue: 10,
		scrollEnabled: true,
		x1: 0,
		x2: 0,
		y1: 0,
		y2: 0,
	};
	onColorChangeComplete: string => void;

	constructor(props: Props) {
		super(props);
		this.onColorChangeComplete = this.onColorChangeComplete.bind(this);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'RGBControl';
	}

	onColorChangeComplete(color: string) {
		if (!color) {
			return;
		}
		const { device } = this.props;
		const rgb = colorsys.hsvToRgb(color);
		const { r, g, b } = rgb;
		this.props.deviceSetStateRGB(device.id, r, g, b);
	}

	renderColorPicker(styles: Object): Object {
		const { device } = this.props;
		const { RGB: rgbValue } = device.stateValues;
		let mainColorRGB = getMainColorRGB(rgbValue);

		return (
			<ColorWheel
				initialColor={mainColorRGB}
				onColorChangeComplete={this.onColorChangeComplete}
				style={styles.colorWheel}
				thumbStyle={{ height: 30, width: 30, borderRadius: 30}}
				thumbSize={15}
			/>
		);
	}

	renderSlider(styles: Object): Object {
		const { device, intl, isGatewayActive, appLayout } = this.props;

		return (
			<View style={styles.shadowCard2}>
				<SliderDetails
					device={device}
					intl={intl}
					isGatewayActive={isGatewayActive}
					appLayout={appLayout}/>
			</View>
		);
	}

	render(): Object | null {
		const { intl, appLayout, navigation, device } = this.props;
		const { scrollEnabled } = this.state;

		if (!device || !device.id) {
			return null;
		}

		const { name } = device;

		const styles = this.getStyles();
		const cPicker = this.renderColorPicker(styles);
		const slider = this.renderSlider(styles);

		const deviceName = name ? name : intl.formatMessage(i18n.noName);

		return (
			<ScrollView
				scrollEnabled={scrollEnabled}
				style={{flex: 1}}
				contentContainerStyle={{flexGrow: 1}}>
				<NavigationHeaderPoster
					icon={'device-alt'}
					h2={deviceName}
					align={'center'}
					leftIcon="close"
					intl={intl}
					appLayout={appLayout}
					navigation={navigation}/>
				{cPicker}
				{slider}
			</ScrollView>
		);
	}

	getStyles(): Object {
		const { appLayout } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const { paddingFactor } = Theme.Core;

		const padding = deviceWidth * paddingFactor;

		return {
			colorWheel: {
				backgroundColor: '#fff',
				...Theme.Core.shadow,
				borderRadius: 2,
				margin: padding,
				width: deviceWidth - (padding * 2),
				height: '50%',
				alignItems: 'center',
			},
			shadowCard2: {
				backgroundColor: '#fff',
				...Theme.Core.shadow,
				borderRadius: 2,
				marginHorizontal: padding,
				marginTop: -(padding / 2),
				width: deviceWidth - (padding * 2),
				padding: padding,
			},
			handle: {
				borderRadius: 28,
				borderWidth: 4,
				borderColor: Theme.Core.brandSecondary,
				height: 28,
				width: 28,
			},
		};
	}
}


function mapDispatchToProps(dispatch: Function): Object {
	return {
		deviceSetStateRGB: (id: number, r: number, g: number, b: number) => {
			dispatch(deviceSetStateRGB(id, r, g, b));
		},
	};
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	const { screenProps, navigation } = ownProps;
	const id = navigation.getParam('id', null);
	const device = store.devices.byId[id];

	const { clientId } = device ? device : {};
	const gateway = store.gateways.byId[clientId];
	const { online: isGatewayActive } = gateway ? gateway : {};

	return {
		...screenProps,
		device: device ? device : {},
		isGatewayActive,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(RGBControlScreen);
