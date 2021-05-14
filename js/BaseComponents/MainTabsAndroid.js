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

import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import i18n from '../App/Translations/common';
const isEqual = require('react-fast-compare');
import { connect } from 'react-redux';

import View from './View';
import Text from './Text';
import Theme from '../App/Theme';
import shouldUpdate from '../App/Lib/shouldUpdate';

type Props = {
	tab: Object,
	navigation: Object,
	adjustScroll: Function,
	appLayout: Object,
	currentScreen: string,
	intl: Object,
};

type State = {
	layout: Object,
	widthLand: any,
	heightLand: any,
};

class MainTabsAndroid extends Component<Props, State> {
	props: Props;
	state: State;

	onTabPress: () => void;
	onLayout: (Object) => void;
	onLabelLayout: (Object) => void;

	dashboard: Object;
	devices: Object;
	sensors: Object;
	scheduler: Object;
	constructor(props: Props) {
		super(props);

		this.state = {
			layout: {},
			widthLand: undefined,
			heightLand: undefined,
		};

		const { intl } = this.props;

		this.dashboard = {
			label: intl.formatMessage(i18n.dashboard),
			accessibilityLabel: intl.formatMessage(i18n.dashboardTab),
		};
		this.devices = {
			label: intl.formatMessage(i18n.devices),
			accessibilityLabel: intl.formatMessage(i18n.devicesTab),
		};
		this.sensors = {
			label: intl.formatMessage(i18n.sensors),
			accessibilityLabel: intl.formatMessage(i18n.sensorsTab),
		};
		this.scheduler = {
			label: intl.formatMessage(i18n.scheduler),
			accessibilityLabel: intl.formatMessage(i18n.schedulerTab),
		};

		this.onTabPress = this.onTabPress.bind(this);
		this.onLayout = this.onLayout.bind(this);
		this.onLabelLayout = this.onLabelLayout.bind(this);
	}

	onTabPress() {
		let { navigation, tab } = this.props;
		navigation.navigate(tab.name);
	}

	onLayout(ev: Object) {
		this.setState({
			layout: ev.nativeEvent.layout,
		});
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return !isEqual(this.state, nextState) || shouldUpdate(this.props, nextProps, [
			'tab',
			'appLayout',
			'currentScreen',
		]);
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		let { adjustScroll, currentScreen, tab } = prevProps;
		if (currentScreen === tab.name) {
			adjustScroll(this.state.layout);
		}
	}

	onLabelLayout(ev: Object) {
		const { appLayout } = this.props;
		const isPortrait = appLayout.height > appLayout.width;
		if (!isPortrait && !this.state.heightLand && !this.state.widthLand) {
			let { width, height } = ev.nativeEvent.layout;
			this.setState({
				heightLand: width + 60,
				widthLand: height,
			});
		}
	}

	getLabel(name: string): Object {
		if (name === 'Dashboard') {
			return this.dashboard;
		}
		if (name === 'Devices') {
			return this.devices;
		}
		if (name === 'Sensors') {
			return this.sensors;
		}
		if (name === 'Scheduler') {
			return this.scheduler;
		}
		return {};
	}

	render(): Object {
		const { tab, currentScreen, appLayout, intl } = this.props;
		const { formatMessage } = intl;
		let {label, accessibilityLabel} = this.getLabel(tab.name);

		const {
			tabBarStyle,
			labelStyle,
			indicatorActiveStyle,
			indicatorPassiveStyle,
		} = this.getStyles(appLayout);

		const postScript = currentScreen === tab.name ? formatMessage(i18n.labelActive) : formatMessage(i18n.defaultDescriptionButton);
		accessibilityLabel = `${accessibilityLabel}, ${postScript}`;

		return (
			<TouchableOpacity
				accessibilityLabel={accessibilityLabel}
				onPress={this.onTabPress}
				onLayout={this.onLayout}>
				<View
					level={19}
					style={[styles.tabBar, tabBarStyle]}>
					<Text
						style={labelStyle}
						onLayout={this.onLabelLayout}
						level={22}>
						{label}
					</Text>
					{(currentScreen === tab.name) ?
						<View
							level={12}
							style={indicatorActiveStyle}/>
						:
						<View style={indicatorPassiveStyle}/>
					}
				</View>
			</TouchableOpacity>
		);
	}

	getStyles(appLayout: Object): Object {

		const {
			fontSizeFactorOne,
		} = Theme.Core;

		let { heightLand, layout } = this.state;

		const { height, width } = appLayout;
		const isPortrait = height > width;

		return {
			tabBarStyle: isPortrait ?
				{
					flex: 1,
				}
				:
				{
					height: heightLand,
					width: heightLand,
					transform: [{rotateZ: '-90deg'}],
				},
			labelStyle: {
				paddingHorizontal: isPortrait ? height * fontSizeFactorOne * 0.5 : 0,
				paddingVertical: isPortrait ? 15 : 0,
				fontSize: isPortrait ? width * fontSizeFactorOne : height * fontSizeFactorOne,
			},
			indicatorPassiveStyle: {
				backgroundColor: 'transparent',
				position: isPortrait ? 'absolute' : 'relative',
				bottom: 0,
				height: 2,
				width: layout.width,
				marginTop: isPortrait ? undefined : height * 0.08,
			},
			indicatorActiveStyle: {
				height: 2,
				width: layout.width,
				position: isPortrait ? 'absolute' : 'relative',
				bottom: 0,
				marginTop: isPortrait ? undefined : height * 0.08,
			},
		};
	}
}

function mapStateToProps(state: Object, ownprops: Object): Object {

	const { screen: currentScreen } = state.navigation;

	return {
		currentScreen,
	};
}

export default (connect(mapStateToProps, null)(MainTabsAndroid): Object);

const styles = StyleSheet.create({
	tabBar: {
		alignItems: 'center',
		justifyContent: 'center',
	},
});
