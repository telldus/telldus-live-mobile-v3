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
} from '../../../BaseComponents';
import SliderDetails from '../Device/DeviceDetails/SubViews/SliderDetails';
import RGBColorWheel from './RGBColorWheel';

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

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'RGBControl';
	}

	renderColorPicker(styles: Object): Object {
		const { device, appLayout } = this.props;

		return (
			<RGBColorWheel
				device={device}
				appLayout={appLayout}
				style={styles.colorWheel}
				thumStyle={styles.thumStyle}
				thumbSize={15}/>
		);
	}

	renderSlider(styles: Object): Object {
		const { device, intl, isGatewayActive, appLayout } = this.props;

		return (
			<View style={styles.sliderCover}>
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
			<View style={{flex: 1}}>
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
			thumStyle: {
				height: 30,
				width: 30,
				borderRadius: 30,
			},
			sliderCover: {
				backgroundColor: '#fff',
				...Theme.Core.shadow,
				borderRadius: 2,
				marginHorizontal: padding,
				marginTop: -(padding / 2),
				marginBottom: padding,
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

export default connect(mapStateToProps, null)(RGBControlScreen);
