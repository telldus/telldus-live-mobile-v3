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

import {
	NavigationHeaderPoster,
	View,
	LocationDetails,
} from '../../../BaseComponents';
import ButtonLoadingIndicator from '../TabViews/SubViews/ButtonLoadingIndicator';
import SliderDetails from '../Device/DeviceDetails/SubViews/SliderDetails';
import RGBColorWheel from './RGBColorWheel';

import { getDeviceManufacturerInfo, deviceZWaveInfo } from '../../Actions/Devices';
import { requestNodeInfo } from '../../Actions/Websockets';
import getLocationImageUrl from '../../Lib/getLocationImageUrl';

import i18n from '../../Translations/common';
import Theme from '../../Theme';

type Props = {
	gatewayType: string,
	gatewayName: string,
	device: Object,
	deviceName: string,
	isGatewayActive: boolean,
	appLayout: Object,
	route: Object,
	currentScreen: string,

	openModal: () => void,
	deviceSetStateRGB: (id: number, r: number, g: number, b: number) => void,
	intl: Object,
	dispatch: Function,
	navigation: Object,
	onPressOverride?: (Object) => void,
};

type State = {
	sliderValue: number,
	scrollEnabled: boolean,
};

class RGBControlScreen extends View<Props, State> {
	props: Props;
	state: State;

	state = {
		sliderValue: 10,
		scrollEnabled: true,
	};

	constructor(props: Props) {
		super(props);
	}

	componentDidMount() {
		const { dispatch, device } = this.props;
		const { nodeInfo, id, clientId, clientDeviceId } = device;
		if (nodeInfo) {
			const {
				manufacturerId,
				productId,
				productTypeId,
			} = nodeInfo;
			dispatch(getDeviceManufacturerInfo(manufacturerId, productTypeId, productId))
				.then((res: Object) => {
					if (res && res.Name) {
						const { Image, Name, Brand } = res;
						const payload = {
							Image,
							Name,
							Brand,
							deviceId: id,
						};
						dispatch(deviceZWaveInfo(payload));
					}
				});
		}
		dispatch(requestNodeInfo(clientId, clientDeviceId));
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'RGBControl';
	}

	setScrollEnabled = (scrollEnabled: boolean) => {
		this.setState({
			scrollEnabled,
		});
	}

	_deviceSetStateRGBOverride = (id: number, valueHex: string) => {
		const { route } = this.props;
		const {
			onPressOverride,
		} = route.params || {};

		onPressOverride({
			deviceId: id,
			method: 1024,
			stateValues: {
				'1024': valueHex,
			},
		});
	}

	renderColorPicker(styles: Object): Object {
		const { device, appLayout, route } = this.props;
		const {
			onPressOverride,
		} = route.params || {};

		return (
			<View style={styles.wheelCover}>
				<RGBColorWheel
					device={device}
					appLayout={appLayout}
					style={styles.colorWheel}
					thumStyle={styles.thumStyle}
					swatchStyle={styles.swatchStyle}
					swatchesCover={styles.swatchesCover}
					colorWheelCover={styles.colorWheelCover}
					swatchWheelCover={styles.swatchWheelCover}
					thumbSize={15}
					deviceSetStateRGBOverride={onPressOverride ? this._deviceSetStateRGBOverride : undefined}
					showActionIndicator={true}
					colorWheelCoverLevel={2}
					swatchesCoverLevel={2}/>
			</View>
		);
	}

	_onPressOverride = (params: Object) => {
		const { route } = this.props;
		const {
			onPressOverride,
			id = null,
		} = route.params || {};
		onPressOverride({
			deviceId: id,
			...params,
		});
	}

	renderSlider(styles: Object): Object {
		const { device, intl, isGatewayActive, appLayout, route } = this.props;
		const {
			onPressOverride,
		} = route.params || {};
		const {
			methodRequested,
		} = device;

		return (
			<View
				level={2}
				style={styles.sliderCover}>
				{
					methodRequested === 'DIM' ?
						<ButtonLoadingIndicator style={styles.dot}/>
						: null
				}
				<SliderDetails
					device={device}
					intl={intl}
					isGatewayActive={isGatewayActive}
					appLayout={appLayout}
					onPressOverride={onPressOverride ? this._onPressOverride : undefined}/>
			</View>
		);
	}

	renderDetails(locationData: Object, locationDataZWave: Object, styles: Object): Object {
		return (
			<>
				{!!locationDataZWave.H1 && <LocationDetails {...locationDataZWave} isStatic={false} style={styles.LocationDetail}/>}
				<LocationDetails {...locationData} isStatic={true} style={[styles.LocationDetail, {
					marginBottom: styles.outerPadding,
				}]}/>
			</>
		);
	}

	render(): Object | null {
		const { intl, appLayout, navigation, device, gatewayName, gatewayType } = this.props;
		const { scrollEnabled } = this.state;

		if (!device || !device.id) {
			return null;
		}

		const { name, zwaveInfo = {} } = device;

		const styles = this.getStyles();
		const cPicker = this.renderColorPicker(styles);
		const slider = this.renderSlider(styles);

		const deviceName = name ? name : intl.formatMessage(i18n.noName);

		const locationImageUrl = getLocationImageUrl(gatewayType);
		const locationData = {
			title: this.boxTitle,
			image: locationImageUrl,
			H1: gatewayName,
			H2: gatewayType,
		};
		const {
			Image,
			Name,
			Brand,
		} = zwaveInfo;
		const locationDataZWave = {
			image: Image,
			H1: Name,
			H2: Brand,
		};

		const details = this.renderDetails(locationData, locationDataZWave, styles);

		return (
			<View
				level={3}
				style={{
					flex: 1,
				}}>
				<NavigationHeaderPoster
					icon={'device-alt'}
					h2={deviceName}
					align={'center'}
					leftIcon="close"
					intl={intl}
					appLayout={appLayout}
					navigation={navigation}/>
				<ScrollView
					scrollEnabled={scrollEnabled}
					style={{flex: 1}}
					contentContainerStyle={{flexGrow: 1}}>
					{cPicker}
					{slider}
					{details}
				</ScrollView>
			</View>
		);
	}

	getStyles(): Object {
		const { appLayout } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const { paddingFactor } = Theme.Core;

		const padding = deviceWidth * paddingFactor;

		const swatchMaxSize = 100;
		const numOfItemsPerRow = 5;
		const itemsBorder = numOfItemsPerRow * 4;
		const outerPadding = padding * 2;
		const itemsPadding = Math.ceil(numOfItemsPerRow * padding * 2);
		let swatchSize = Math.floor((deviceWidth - (itemsPadding + outerPadding + itemsBorder)) / numOfItemsPerRow);
		swatchSize = swatchSize > swatchMaxSize ? swatchMaxSize : swatchSize;

		const colorWheelSize = deviceWidth * 0.6;

		return {
			colorWheel: {
				width: colorWheelSize,
				height: colorWheelSize,
				alignItems: 'center',
				borderRadius: deviceWidth * 0.25,
			},
			thumStyle: {
				height: 30,
				width: 30,
				borderRadius: 30,
			},
			swatchWheelCover: {
				flex: 1,
			},
			swatchesCover: {
				width: '100%',
				flexDirection: 'row',
				flexWrap: 'wrap',
				...Theme.Core.shadow,
				borderRadius: 2,
				paddingHorizontal: padding,
				paddingTop: padding / 2,
				paddingBottom: padding,
				alignItems: 'center',
				justifyContent: 'center',
			},
			swatchStyle: {
				height: swatchSize,
				width: swatchSize,
				borderRadius: swatchSize / 2,
				marginHorizontal: padding,
				marginTop: padding,
			},
			colorWheelCover: {
				...Theme.Core.shadow,
				borderRadius: 2,
				marginVertical: padding,
				width: width - (padding * 2),
				height: colorWheelSize * 1.1,
				alignItems: 'center',
			},
			sliderCover: {
				...Theme.Core.shadow,
				borderRadius: 2,
				marginHorizontal: padding,
				marginTop: -(padding / 2),
				marginBottom: padding,
				width: width - (padding * 2),
				padding: padding,
			},
			wheelCover: {
				flex: 1,
				marginHorizontal: padding,
				marginBottom: padding,
			},
			outerPadding,
			LocationDetail: {
				flex: 0,
				marginTop: (padding / 2),
				marginHorizontal: padding,
			},
			dot: {
				zIndex: 3,
				position: 'absolute',
				top: 6,
				left: 6,
			},
		};
	}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	const { screenProps, route } = ownProps;
	const {
		id = null,
	} = route.params || {};
	const device = store.devices.byId[id];

	const { clientId } = device ? device : {};
	const gateway = store.gateways.byId[clientId];
	const { online: isGatewayActive, name: gatewayName, type: gatewayType } = gateway ? gateway : {};

	const {
		screen: currentScreen,
	} = store.navigation;

	return {
		...screenProps,
		device: device ? device : {},
		isGatewayActive,
		gatewayName,
		gatewayType,
		currentScreen,
	};
}

export default (connect(mapStateToProps, mapDispatchToProps)(RGBControlScreen): Object);
