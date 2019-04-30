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
	BackHandler,
	Animated,
	PanResponder,
	TouchableWithoutFeedback,
	ImageBackground,
	ScrollView,
} from 'react-native';
import { connect } from 'react-redux';
import { getPixelRGBA } from 'react-native-get-pixel';

import { deviceSetStateRGB } from '../../Actions/Devices';

import SliderDetails from '../Device/DeviceDetails/SubViews/SliderDetails';

import {
	NavigationHeaderPoster,
	View,
} from '../../../BaseComponents';

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
	PixelColor: string,
	scrollEnabled: boolean,
};

class RGBControlScreen extends View<Props, State> {
	props: Props;
	state: State;

	state = {
		sliderValue: 10,
		pixelColor: [255, 73, 51],
		scrollEnabled: true,
	};

	animations = {
		handlePosition: new Animated.ValueXY({ x: 0, y: 0 }),
	}

	panResponders = {
		handle: PanResponder.create({
			onMoveShouldSetResponderCapture: (): boolean => true,
			onStartShouldSetPanResponder: (e: Object, gestureState: Object): boolean => true,
			onMoveShouldSetPanResponderCapture: (): boolean => true,
			onResponderTerminationRequest: (): boolean => false,
			onPanResponderGrant: (e: Object, gestureState: Object) => {
				this.setState({
					scrollEnabled: false,
				});
				this.animations.handlePosition.setOffset({ x: this.lastHandlePosition.x, y: this.lastHandlePosition.y });
				this.animations.handlePosition.setValue({ x: 0, y: 0 });
			},
			onPanResponderMove: (e: Object, gestureState: Object) => {
				getPixelRGBA('rgbpicker', e.nativeEvent.pageX, e.nativeEvent.pageY)
					.then((color: Array<number>) => {
						this.setState({
							pixelColor: color,
							scrollEnabled: false,
						});
				 });
				 this.animations.handlePosition.setValue({ x: gestureState.dx, y: gestureState.dy });
			},
			onPanResponderRelease: () => {
				this.onRelease();
			},
		}),
	}

	onRelease = () => {
		this.animations.handlePosition.flattenOffset();
		const { pixelColor } = this.state;
		const { device } = this.props;
		this.setState({
			scrollEnabled: true,
		});
		this.props.deviceSetStateRGB(device.id, pixelColor[0], pixelColor[1], pixelColor[2]);
	}

	lastHandlePosition = {
		x: 0,
		y: 0,
	}

	componentWillMount() {
		this.animations.handlePosition.x.addListener(({ value }: { value: number }) => {
			this.lastHandlePosition.x = value;
		});
		this.animations.handlePosition.y.addListener(({ value }: { value: number }) => {
			this.lastHandlePosition.y = value;
		});
		BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return true;
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
	}

	handleBackButtonClick = () => {
		const { openModal } = this.props;
		openModal();
	}

	renderColorPicker(styles: Object): Object {
		const { pixelColor } = this.state;
		return (
			<Animated.View style={[styles.shadowCard]} >
				<TouchableWithoutFeedback>
					<ImageBackground
						imageStyle={{ borderRadius: 2 }}
						style={{ height: '100%', width: '100%' }}
						source={require('../TabViews/img/rgbpicker.png')}>
						<Animated.View
							{...this.panResponders.handle.panHandlers}
							// $FlowFixMe
							style={[styles.handle, { transform: this.animations.handlePosition.getTranslateTransform(), backgroundColor: `rgb(${pixelColor})` }]}
						/>
					</ImageBackground>
				</TouchableWithoutFeedback>
			</Animated.View>
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
					onClose={this.handleBackButtonClick}
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
			shadowCard: {
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
