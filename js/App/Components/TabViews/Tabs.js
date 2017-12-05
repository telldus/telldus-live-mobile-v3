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
import { getWindowDimensions } from 'Lib';

type Props = {
	screenProps: Object,
	tab: Object,
	navigation: Object,
	onLayout: Object,
	adjustScroll: Function,
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
	getRelativeStyle: () => Object;

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
		this.getRelativeStyle = this.getRelativeStyle.bind(this);
	}

	onTabPress() {
		let { navigation, tab } = this.props;
		navigation.navigate(tab.routeName);
	}

	onLayout(ev: Object) {
		this.setState({
			layout: ev.nativeEvent.layout,
		});
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		let { adjustScroll, screenProps, tab } = prevProps;
		if (screenProps.currentTab === tab.routeName) {
			adjustScroll(this.state.layout);
		}
	}

	onLabelLayout(ev: Object) {
		if (this.props.screenProps.orientation !== 'PORTRAIT' && !this.state.heightLand && !this.state.widthLand) {
			let { width, height } = ev.nativeEvent.layout;
			this.setState({
				heightLand: width + 60,
				widthLand: height,
			});
		}
	}

	getRelativeStyle() {
		let { screenProps } = this.props;
		let { heightLand } = this.state;
		let { width } = this.state.layout;
		let relativeStyle = {
			labelStyle: styles.label,
			tabBarStyle: {},
			touchableStyle: styles.touchable,
			indicatorStyle: [styles.indicator, {width}],
		};
		if (screenProps.orientation !== 'PORTRAIT') {
			relativeStyle.labelStyle = styles.labelLand;
			relativeStyle.tabBarStyle = {height: heightLand, width: heightLand};
			relativeStyle.touchableStyle = styles.touchableLand;
			relativeStyle.indicatorStyle = [styles.indicatorLand, {height: width, left: heightLand * 0.68499}];
		}
		return relativeStyle;
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

		let {
			labelStyle,
			tabBarStyle,
			touchableStyle,
			indicatorStyle,
		} = this.getRelativeStyle();

		return (
			<TouchableOpacity onPress={this.onTabPress} style={touchableStyle} onLayout={this.onLayout}>
				<View style={[styles.tabBar, tabBarStyle]}>
					<Text style={labelStyle} onLayout={this.onLabelLayout}>
						{label}
					</Text>
				</View>
				{!!(screenProps.currentTab === tab.routeName) &&
				<View style={indicatorStyle}/>
				}
			</TouchableOpacity>
		);
	}
}

const styles = StyleSheet.create({
	touchable: {
		flexDirection: 'column',
	},
	touchableLand: {
		flexDirection: 'row',
	},
	tabBar: {
		backgroundColor: Theme.Core.brandPrimary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	label: {
		paddingHorizontal: getWindowDimensions().width * 0.0666,
		paddingVertical: 15,
		color: '#fff',
		fontSize: getWindowDimensions().width * 0.0333,
	},
	labelLand: {
		color: '#fff',
		transform: [{rotateZ: '-90deg'}],
		fontSize: getWindowDimensions().width * 0.0333,
	},
	indicator: {
		backgroundColor: '#fff',
		height: 2,
	},
	indicatorLand: {
		backgroundColor: '#fff',
		position: 'absolute',
		width: 2,
	},
});
