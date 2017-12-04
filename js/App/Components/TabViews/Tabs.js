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
	layout: Object,
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
			layout: {},
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
		navigation.navigate(tab.routeName);
		onPress(this.state.layout);
	}

	onLayout(ev: Object) {
		this.setState({
			layout: ev.nativeEvent.layout,
		});
	}

	onLabelLayout(ev: Object) {
		if (this.props.screenProps.orientation !== 'PORTRAIT' && !this.state.heightLand && !this.state.widthLand) {
			this.setState({
				heightLand: ev.nativeEvent.layout.width + 60,
				widthLand: ev.nativeEvent.layout.height + 60,
			});
		}
	}

	render() {
		let label = '';
		let { tab, screenProps } = this.props;
		let { heightLand } = this.state;
		let { width } = this.state.layout;
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
		let tabBarLand = screenProps.orientation === 'PORTRAIT' ? {flexDirection: 'column'} : {height: heightLand, width: heightLand};
		let touchable = screenProps.orientation === 'PORTRAIT' ? {flexDirection: 'column'} : {flexDirection: 'row'};
		let indicator = screenProps.orientation === 'PORTRAIT' ? [styles.indicator, {}] : [styles.indicatorLand, {left: heightLand * 0.68888}];
		let stretch = screenProps.orientation === 'PORTRAIT' ? {width} : {height: width};
		return (
			<TouchableOpacity onPress={this.onTabPress} style={touchable} onLayout={this.onLayout}>
				<View style={[styles.tabBar, tabBarLand]}>
					<Text style={labelLand} onLayout={this.onLabelLayout}>
						{label}
					</Text>
				</View>
				{!!(screenProps.currentTab === tab.routeName) &&
						<View style={[indicator, stretch]}/>
				}
			</TouchableOpacity>
		);
	}
}

const styles = StyleSheet.create({
	tabBar: {
		backgroundColor: Theme.Core.brandPrimary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	label: {
		paddingHorizontal: 30,
		paddingVertical: getDeviceHeight() * 0.015,
		color: '#fff',
	},
	labelLand: {
		color: '#fff',
		transform: [{rotateZ: '-90deg'}],
	},
	indicator: {
		backgroundColor: '#fff',
		height: 2,
	},
	indicatorLand: {
		position: 'absolute',
		backgroundColor: '#fff',
		width: 2,
	},
});
