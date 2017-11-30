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
import { StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Orientation from 'react-native-orientation';
const orientation = Orientation.getInitialOrientation();
import Theme from 'Theme';
import i18n from '../../Translations/common';

import { View, Text } from 'BaseComponents';

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
};

const deviceHeight = orientation === 'PORTRAIT' ? Dimensions.get('screen').height : Dimensions.get('screen').width;

export default class Tabs extends View {
	props: Props;
	state: State;

	onTabPress: () => void;
	onLayout: (Object) => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			xCord: 0,
			width: 0,
		};

		let { intl } = this.props.screenProps;

		this.dashboard = intl.formatMessage(i18n.dashboard).toUpperCase();
		this.devices = intl.formatMessage(i18n.devices).toUpperCase();
		this.sensors = intl.formatMessage(i18n.sensors).toUpperCase();
		this.scheduler = intl.formatMessage(i18n.scheduler).toUpperCase();

		this.onTabPress = this.onTabPress.bind(this);
		this.onLayout = this.onLayout.bind(this);

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

	render() {
		let label = '';
		let { tab, screenProps } = this.props;
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

		return (
			<TouchableOpacity style={styles.tabBar} onPress={this.onTabPress} onLayout={this.onLayout}>
				<Text style={styles.label}>
					{label}
				</Text>
				{!!(screenProps.currentTab === tab.routeName) &&
					<View style={styles.indicator}/>
				}
			</TouchableOpacity>
		);
	}
}

const styles = StyleSheet.create({
	tabBar: {
		backgroundColor: Theme.Core.brandPrimary,
	},
	label: {
		paddingHorizontal: 30,
		paddingVertical: deviceHeight * 0.02599,
		color: '#fff',
	},
	indicator: {
		flex: 1,
		backgroundColor: '#fff',
		height: 2,
	},
});
