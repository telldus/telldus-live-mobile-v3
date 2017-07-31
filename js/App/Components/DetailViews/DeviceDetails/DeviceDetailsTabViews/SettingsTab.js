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

'use strict';

import React from 'react';
import { connect } from 'react-redux';

import { Text, View } from 'BaseComponents';
import { StyleSheet, Dimensions, Switch } from 'react-native';

import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icon_settings from './../../../TabViews/img/selection.json';
const Icon = createIconSetFromIcoMoon(icon_settings);

import { LearnButton } from 'TabViews_SubViews';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

import { addToDashboard, removeFromDashboard } from 'Actions';

type Props = {
  dispatch: Function,
  device: Object,
  inDashboard: Boolean,
  onAddToDashboard: () => void,
  onRemoveFromDashboard: () => void,
};

type State = {
};


class SettingsTab extends View {
	props: Props;
	state: State;

	constructor(props: Props) {
		super(props);
		this.onValueChange = this.onValueChange.bind(this);
	}

	static navigationOptions = ({ navigation }) => ({
		tabBarLabel: 'Settings',
		tabBarIcon: ({ tintColor }) => (
			<Icon name="icon_settings" size={24} color={tintColor}/>
		),
		tabBarOnPress: (scene, jumpToIndex) => {
		},
	});

	onValueChange(value) {
		if (!value) {
			this.props.onRemoveFromDashboard(this.props.device.id);
		} else {
			this.props.onAddToDashboard(this.props.device.id);
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (nextProps.screenProps.currentTab !== 'Settings') {
			return false;
		}
		return true;
	}

	render() {
		const device = this.props.device;
		const { LEARN } = device.supportedMethods;

		let learnButton = null;

		if (LEARN) {
			learnButton = <LearnButton id={device} style={styles.learn} />;
		}
		return (
			<View style={styles.container}>
				<View style={styles.ShowOnDashCover}>
					<View style={styles.textShowOnDashCover}>
						<Text style={styles.textShowOnDash}>
							Show on dashboard
						</Text>
					</View>
					<View style={styles.dashSwitchCover}>
						<Switch
							style={styles.dashSwitch}
							onValueChange={this.onValueChange}
							value={this.props.inDashboard}
							/>
					</View>
				</View>
				{learnButton}
			</View>
		);
	}

}

SettingsTab.propTypes = {
	device: React.PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
	container: {
		flex: 0,
	},
	ShowOnDashCover: {
		backgroundColor: '#fff',
		height: (deviceHeight * 0.09),
		marginTop: 25,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	textShowOnDashCover: {
		width: (deviceWidth / 2),
		alignItems: 'flex-start',
		justifyContent: 'center',
	},
	dashSwitchCover: {
		width: (deviceWidth / 2),
		alignItems: 'flex-end',
		justifyContent: 'center',
	},
	dashSwitch: {
	},
	textShowOnDash: {
		color: '#8A8682',
		fontSize: 14,
		marginLeft: 8,
		justifyContent: 'center',
	},
	learn: {
		height: (deviceHeight * 0.09),
		width: (deviceWidth * 0.5),
		marginHorizontal: (deviceWidth * 0.5) / 2,
		marginVertical: 25,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F06F0C',
		borderBottomRightRadius: 26,
		borderTopLeftRadius: 26,
		borderBottomLeftRadius: 26,
		borderTopRightRadius: 26,
	},
});

function mapDispatchToProps(dispatch) {
	return {
		onAddToDashboard: id => dispatch(addToDashboard('device', id)),
		onRemoveFromDashboard: id => dispatch(removeFromDashboard('device', id)),
		dispatch,
	};
}
function mapStateToProps(state, ownProps) {
	return {
		device: ownProps.screenProps.device,
		inDashboard: !!state.dashboard.devicesById[ownProps.screenProps.device.id],
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SettingsTab);
