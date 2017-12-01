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
 *
 *
 */

// @flow

'use strict';

import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Theme from 'Theme';
import i18n from '../../Translations/common';

import { View, Text } from 'BaseComponents';
import {
	getDeviceHeight,
} from 'Lib';

type Props = {
	screenProps: Object,
	tab: Object,
	navigation: Object,
	onLayout: Object,
	onPress: Function,
};

type State = {
	xCord: number,
	width: number,
	widthLand: any,
	heightLand: any,
};

export default class Tabs extends View {
	props: Props;
	state: State;

	onTabPress: () => void;
	onLayout: (Object) => void;
	onLabelLayout: (Object) => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			xCord: 0,
			width: 0,
			widthLand: undefined,
			heightLand: undefined,
		};

		let { intl } = this.props.screenProps;

		this.dashboard = intl.formatMessage(i18n.dashboard).toUpperCase();
		this.devices = intl.formatMessage(i18n.devices).toUpperCase();
		this.sensors = intl.formatMessage(i18n.sensors).toUpperCase();
		this.scheduler = intl.formatMessage(i18n.scheduler).toUpperCase();

		this.onTabPress = this.onTabPress.bind(this);
		this.onLayout = this.onLayout.bind(this);
		this.onLabelLayout = this.onLabelLayout.bind(this);

	}

	onTabPress() {
		let { navigation, tab, onPress } = this.props;
		let { xCord, width } = this.state;
		navigation.navigate(tab.routeName);
		onPress(xCord, width);
	}

	onLayout(ev: Object) {
		this.setState({
			xCord: ev.nativeEvent.layout.x,
			width: ev.nativeEvent.layout.width,
		});
	}

	onLabelLayout(ev: Object) {
		if (this.props.screenProps.orientation !== 'PORTRAIT' && !this.state.heightLand && !this.state.widthLand) {
			this.setState({
				heightLand: ev.nativeEvent.layout.width + 30,
				widthLand: ev.nativeEvent.layout.height + (getDeviceHeight() * 0.05),
			});
		}
	}

	render() {
		let label = '';
		let { tab, screenProps } = this.props;
		let { widthLand, heightLand } = this.state;
		if (tab.routeName === 'Dashboard') {
			label = this.dashboard;
		}
		if (tab.routeName === 'Devices') {
			label = this.devices;
		}
		if (tab.routeName === 'Sensors') {
			label = this.sensors;
		}
		if (tab.routeName === 'Scheduler') {
			label = this.scheduler;
		}

		let labelLand = screenProps.orientation === 'PORTRAIT' ? styles.label : styles.labelLand;
		let tabBarLand = screenProps.orientation === 'PORTRAIT' ? {flexDirection: 'column'} : {flexDirection: 'row', height: heightLand, width: widthLand};

		return (
			<TouchableOpacity onPress={this.onTabPress} onLayout={this.onLayout}>
				<View style={[styles.tabBar, tabBarLand]}>
					<Text style={labelLand} onLayout={this.onLabelLayout}>
						{label}
					</Text>
					{!!(screenProps.currentTab === tab.routeName) &&
						<View style={styles.indicator}/>
					}
				</View>
			</TouchableOpacity>
		);
	}
}

const styles = StyleSheet.create({
	tabBar: {
		backgroundColor: Theme.Core.brandPrimary,
		alignItems: 'center',
		justifyContent: 'center',
		flexWrap: 'nowrap',
	},
	label: {
		paddingHorizontal: 30,
		paddingVertical: getDeviceHeight() * 0.02599,
		color: '#fff',
	},
	labelLand: {
		transform: [{rotateZ: '-90deg'}],
		color: '#fff',
		paddingHorizontal: 30,
		paddingVertical: getDeviceHeight() * 0.02599,
	},
	indicator: {
		backgroundColor: '#fff',
		height: 2,
	},
});
