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
	Modal,
	BackHandler,
	Animated,
	PanResponder,
	TouchableWithoutFeedback,
	ImageBackground,
	ScrollView,
} from 'react-native';
import { connect } from 'react-redux';
import { getPixelRGBA } from 'react-native-get-pixel';

import { deviceSetStateRGB } from '../../../../Actions/Devices';

import SliderDetails from '../../../Device/DeviceDetails/SubViews/SliderDetails';

import {
	NavigationHeader,
	IconTelldus,
	Poster,
	View,
	SafeAreaView,
	Text,
} from '../../../../../BaseComponents';
import Theme from '../../../../Theme';

type Props = {
	isModelRGB?: boolean,
	openModal: () => void,
	device: Object,
	deviceName: string,
	deviceSetStateRGB: (id: number, r: number, g: number, b: number) => void,
	intl: Object,
    isGatewayActive: boolean,
	appLayout: Object,
};

type State = {
	sliderValue: number,
	PixelColor: string,
	scrollEnabled: boolean,
};

class ModalRGB extends View<Props, State> {
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
		if (nextProps.isModelRGB) {
			return true;
		}
		if (nextProps.isModelRGB !== this.props.isModelRGB) {
			return true;
		}
		return false;
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
	}

	handleBackButtonClick = () => {
		const { openModal } = this.props;
		openModal();
	}

	renderBanner(): Object {
		const { circle, txtLbl } = styles;
		const { deviceName } = this.props;
		return (
			<Poster>
				<View style={{ position: 'absolute', alignSelf: 'center', top: 10 }}>
					<View style={circle}>
						<IconTelldus icon="device-alt" size={40} color={Theme.Core.brandSecondary} />
					</View>
					<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
						<Text style={txtLbl}>{deviceName}</Text>
					</View>
				</View>
			</Poster>
		);
	}

	renderColorPicker(): Object {
		const { pixelColor } = this.state;
		return (
			<Animated.View style={[styles.shadowCard, { flex: 1, alignItems: 'center' }]} >
				<TouchableWithoutFeedback>
					<ImageBackground
						imageStyle={{ borderRadius: 2 }}
						style={{ height: '100%', width: '100%' }}
						source={require('../../img/rgbpicker.png')}>
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

	renderSlider(): Object {
		const { device, intl, isGatewayActive, appLayout } = this.props;

		return (
			<View style={[styles.shadowCard2, { padding: 12 }]}>
				<SliderDetails
					device={device}
					intl={intl}
					isGatewayActive={isGatewayActive}
					appLayout={appLayout}/>
			</View>
		);
	}

	render(): Object {
		const { isModelRGB } = this.props;
		const { scrollEnabled } = this.state;
		return (
			<Modal
				animationType="slide"
				visible={isModelRGB}
				supportedOrientations={['portrait', 'landscape']}
				onRequestClose={this.handleBackButtonClick}>
				<SafeAreaView backgroundColor={Theme.Core.appBackground}>
					<ScrollView
						scrollEnabled={scrollEnabled}
						style={{flex: 1}}
						contentContainerStyle={{flexGrow: 1}}>
						<NavigationHeader leftIcon="close" isFromModal={true} onClose={this.handleBackButtonClick} />
						{this.renderBanner()}
						<View style={{ height: 300 }}>
							{this.renderColorPicker()}
						</View>
						{this.renderSlider()}
					</ScrollView>
				</SafeAreaView>
			</Modal>
		);
	}
}

const styles = {
	circle: {
		height: 80,
		width: 80,
		borderRadius: 40,
		backgroundColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
	},
	txtLbl: {
		color: 'white',
		fontSize: 14,
		marginTop: 10,
		textAlign: 'center',
	},
	shadowCard: {
		backgroundColor: '#fff',
		...Theme.Core.shadow,
		borderRadius: 2,
		marginHorizontal: 12,
		marginTop: 8,
	},
	shadowCard2: {
		flex: 1,
		backgroundColor: '#fff',
		...Theme.Core.shadow,
		borderRadius: 2,
		marginHorizontal: 12,
		marginTop: 8,
		maxHeight: 100,
	},
	handle: {
		borderRadius: 28,
		borderWidth: 4,
		borderColor: Theme.Core.brandSecondary,
		height: 28,
		width: 28,
	},
};


function mapDispatchToProps(dispatch: Function): Object {
	return {
		deviceSetStateRGB: (id: number, r: number, g: number, b: number) => {
			dispatch(deviceSetStateRGB(id, r, g, b));
		},
	};
}

export default connect(null, mapDispatchToProps)(ModalRGB);
