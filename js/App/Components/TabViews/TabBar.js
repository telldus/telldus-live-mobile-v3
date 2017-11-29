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
import { StyleSheet, Dimensions } from 'react-native';
import Orientation from 'react-native-orientation';
const orientation = Orientation.getInitialOrientation();
import Theme from 'Theme';

import { View } from 'BaseComponents';
import Tabs from './Tabs';

const deviceHeight = orientation === 'PORTRAIT' ? Dimensions.get('screen').height : Dimensions.get('screen').width;
const deviceWidth = orientation === 'PORTRAIT' ? Dimensions.get('screen').width : Dimensions.get('screen').height;

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

	orientationDidChange: (string) => void;
	renderTabs: (Object, number) => Object;

	constructor(props: Props) {
		super(props);
		this.orientationDidChange = this.orientationDidChange.bind(this);

		this.state = {
			orientation,
		};

		this.renderTabs = this.renderTabs.bind(this);
	}

	componentDidMount() {
		Orientation.addOrientationListener(this.orientationDidChange);
	}

	orientationDidChange(deviceOrientation: string) {
		this.setState({
			orientation: deviceOrientation,
		});
	}

	componentWillUnmount() {
		Orientation.removeOrientationListener(this.orientationDidChange);
	}

	renderTabs(tab: Object, index: number): Object {
		let { screenProps, navigation } = this.props;
		return (
			<Tabs key={index} intl={screenProps.intl} tab={tab} navigation={navigation}/>
		);
	}

	render() {
		let { navigationState } = this.props;
		let tabs = navigationState.routes.map((tab, index) => {
			return this.renderTabs(tab, index);
		});
		let containerStyle = this.state.orientation === 'PORTRAIT' ? styles.container : styles.containerOnLand;

		return (
			<View style={containerStyle}>
				{tabs}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'flex-start',
		height: deviceHeight * 0.0777,
		width: deviceHeight,
		backgroundColor: Theme.Core.brandPrimary,
		...Theme.Core.shadow,
		zIndex: 1,
	},
	containerOnLand: {
		flexDirection: 'row',
		position: 'absolute',
		transform: [{rotateZ: '-90deg'}],
		left: -(deviceHeight * 0.4666),
		top: orientation === 'PORTRAIT' ? deviceWidth * 0.7444 : deviceHeight * 0.7444,
		height: deviceHeight * 0.0777,
		alignItems: 'center',
		justifyContent: 'flex-end',
		width: deviceHeight,
		backgroundColor: Theme.Core.brandPrimary,
		...Theme.Core.shadow,
		zIndex: 1,
	},
	tabBar: {
		backgroundColor: Theme.Core.brandPrimary,
	},
	label: {
		paddingHorizontal: 20,
		color: '#fff',
	},
});
