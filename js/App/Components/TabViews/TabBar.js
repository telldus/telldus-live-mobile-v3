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
import { StyleSheet, ScrollView } from 'react-native';
import Theme from 'Theme';

import { View } from 'BaseComponents';
import Tabs from './Tabs';
import {
	getWindowDimensions,
} from 'Lib';

type Props = {
	navigationState: Object,
	navigation: Object,
	screenProps: Object,
};

type State = {
};

export default class TabBar extends View {
	props: Props;
	state: State;

	renderTabs: (Object, number) => Object;
	scrollToTab: (Object) => void;
	getRelativeStyle: () => Object;

	constructor(props: Props) {
		super(props);

		this.state = {
		};

		this.renderTabs = this.renderTabs.bind(this);
		this.scrollToTab = this.scrollToTab.bind(this);
		this.getRelativeStyle = this.getRelativeStyle.bind(this);
	}

	scrollToTab(layout: Object) {
		let {x, y, width, height} = layout;
		if (this.props.screenProps.orientation === 'PORTRAIT') {
			let position = (x + width) / 3;
			position = x <= 0 ? 0 : position;
			this.refs.scrollView.scrollTo({x: position, y: undefined, animated: true});
		} else {
			let position = (y + height) / 3;
			position = y <= 0 ? 0 : position;
			this.refs.scrollView.scrollTo({x: undefined, y: position, animated: true});
		}
	}

	renderTabs(tab: Object, index: number): Object {
		let { screenProps, navigation } = this.props;
		return (
			<Tabs key={index} adjustScroll={this.scrollToTab} screenProps={screenProps} tab={tab} navigation={navigation}/>
		);
	}

	getRelativeStyle() {
		let relativeStyle = {
			containerStyle: styles.container,
			scrollViewStyle: styles.scrollView,
		};
		if (this.props.screenProps.orientation !== 'PORTRAIT') {
			relativeStyle.containerStyle = styles.containerLand;
			relativeStyle.scrollViewStyle = styles.scrollViewLand;
		}
		return relativeStyle;
	}

	render() {
		let { navigationState, screenProps } = this.props;
		let tabs = navigationState.routes.map((tab, index) => {
			return this.renderTabs(tab, index);
		});

		let {
			containerStyle,
			scrollViewStyle,
		} = this.getRelativeStyle();

		return (
			<View style={scrollViewStyle}>
				<ScrollView
					ref="scrollView"
					contentContainerStyle={containerStyle}
					horizontal={screenProps.orientation === 'PORTRAIT'}
					showsHorizontalScrollIndicator={false}
					showsVerticalScrollIndicator={false}
					overScrollMode="never"
				>
					{tabs}
				</ScrollView>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	scrollView: {
		flex: 0,
		backgroundColor: Theme.Core.brandPrimary,
		...Theme.Core.shadow,
		zIndex: 1,
	},
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-start',
		zIndex: 1,
	},
	scrollViewLand: {
		top: 0,
		bottom: 0,
		position: 'absolute',
		backgroundColor: Theme.Core.brandPrimary,
		...Theme.Core.shadow,
		zIndex: 1,
	},
	containerLand: {
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'flex-start',
		width: getWindowDimensions().width * 0.1444,
		zIndex: 1,
	},
});
