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
import { connect } from 'react-redux';
import { ScrollView } from 'react-native';
import Theme from 'Theme';

import { View } from 'BaseComponents';
import Tabs from './Tabs';

type Props = {
	navigationState: Object,
	navigation: Object,
	screenProps: Object,
	appLayout: Object,
};

type State = {
};

class TabBar extends View {
	props: Props;
	state: State;

	renderTabs: (Object, number) => Object;
	scrollToTab: (Object) => void;

	constructor(props: Props) {
		super(props);

		this.state = {
		};

		this.renderTabs = this.renderTabs.bind(this);
		this.scrollToTab = this.scrollToTab.bind(this);
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
		let { screenProps, navigation, appLayout } = this.props;
		return (
			<Tabs
				key={index}
				adjustScroll={this.scrollToTab}
				screenProps={screenProps}
				tab={tab}
				navigation={navigation}
				appLayout={appLayout}/>
		);
	}

	render() {
		let { navigationState, appLayout } = this.props;
		let tabs = navigationState.routes.map((tab, index) => {
			return this.renderTabs(tab, index);
		});
		let {
			container,
			contentContainer,
		} = this.getStyles(appLayout);

		return (
			<View style={container}>
				<ScrollView
					ref="scrollView"
					contentContainerStyle={contentContainer}
					horizontal={appLayout.height > appLayout.width}
					showsHorizontalScrollIndicator={false}
					showsVerticalScrollIndicator={false}
					overScrollMode="never"
				>
					{tabs}
				</ScrollView>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		let isPortrait = height > width;

		return {
			container: {
				flex: 0,
				backgroundColor: Theme.Core.brandPrimary,
				...Theme.Core.shadow,
				zIndex: 1,
				top: 0,
				bottom: 0,
				position: isPortrait ? 'relative' : 'absolute',
			},
			contentContainer: {
				flexDirection: isPortrait ? 'row' : 'column-reverse',
				alignItems: 'center',
				justifyContent: 'flex-start',
				width: isPortrait ? undefined : height * 0.13,
				zIndex: 1,
			},
		};
	}
}

function mapStateToProps(store) {
	return {
		appLayout: store.App.layout,
	};
}

module.exports = connect(mapStateToProps, null)(TabBar);
