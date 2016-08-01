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

'use strict';

import React from 'React';
import { connect } from 'react-redux';
import { switchTab, getUserProfile, getGateways, getSensors, getDevices } from 'Actions';

import { Button, Container, Content, Header, Text, Title, View } from 'BaseComponents';
import Platform from 'Platform';
import BackAndroid from 'BackAndroid';
import TabsView from 'TabsView';
import Navigator from 'Navigator';
import StyleSheet from 'StyleSheet';
import StatusBar from 'StatusBar';
import Orientation from 'react-native-orientation';

class AppNavigator extends View {

	constructor() {
		super();
		if (Platform.OS !== 'android') {
			const init = Orientation.getInitialOrientation();
			this.state = {
				specificOrientation: init,
			};
			Orientation.unlockAllOrientations();
			this._updateSpecificOrientation = this._updateSpecificOrientation.bind(this);
			Orientation.addSpecificOrientationListener(this._updateSpecificOrientation);
		}
	}

	componentDidMount() {
		Platform.OS === 'ios' && StatusBar && StatusBar.setBarStyle('light-content');
		this.props.dispatch(getUserProfile(this.props.accessToken));
		this.props.dispatch(getDevices(this.props.accessToken));
		this.props.dispatch(getGateways(this.props.accessToken));
		this.props.dispatch(getSensors(this.props.accessToken));
	}

	_updateSpecificOrientation(specificOrientation) {
		if (Platform.OS !== 'android') {
			this.setState({ specificOrientation });
		}
	}

	render() {
		if (Platform.OS === 'android' || this.state.specificOrientation == 'PORTRAIT' || this.state.specificOrientation == 'UNKNOWN') {
			return (
				<Navigator
					ref="navigator"
					configureScene={(route) => {
						if (Platform.OS === 'android') {
							return Navigator.SceneConfigs.FloatFromBottomAndroid;
						}
						// TODO: Proper scene support
	//					if (route.shareSettings || route.friend) {
	//						return Navigator.SceneConfigs.FloatFromRight;
	//					} else {
	//						return Navigator.SceneConfigs.FloatFromBottom;
	//					}
					}}
					initialRoute={{}}
					renderScene={this.renderScene}
				/>
			);
		}
		return (
			<View style={{
				flex: 1,
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: "#ffffff"
			}}>
				<Text>
					This will be a dashboard view!
				</Text>
			</View>
		)
	}

	renderScene(route, navigator) {
//		if (route.notices) {
//			return <COMPONENT navigator={navigator} />;
//		}
		return (
			<View>
				<Header style>
					<Title>Telldus Live!</Title>
				</Header>
				<TabsView navigator={navigator} />
			</View>
		)
	}
};

var styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: "#666666"
	}
});

function select(store) {
	return {
		tab: store.navigation.tab,
		accessToken: store.user.accessToken,
		userProfile: store.user.userProfile || {firstname: '', lastname: '', email: ""}
	};
}

module.exports = connect(select)(AppNavigator);
