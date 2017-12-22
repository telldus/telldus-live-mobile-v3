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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { FormattedMessage, Text, View, TabBar } from 'BaseComponents';
import { StyleSheet, Switch } from 'react-native';
import { defineMessages } from 'react-intl';
import i18n from '../../Translations/common';

import { LearnButton } from 'TabViews_SubViews';

import { addToDashboard, removeFromDashboard } from 'Actions';

const messages = defineMessages({
	showOnDashborad: {
		id: 'showOnDashboard',
		defaultMessage: 'Show on dashboard',
		description: 'Select if this item should be shown on the dashboard',
	},
});

type Props = {
	dispatch: Function,
	device: Object,
	inDashboard: boolean,
	onAddToDashboard: (id: number) => void,
	onRemoveFromDashboard: (id: number) => void,
	appLayout: Object,
};

type State = {
};


class SettingsTab extends View {
	props: Props;
	state: State;

	onValueChange: number => void;

	constructor(props: Props) {
		super(props);
		this.onValueChange = this.onValueChange.bind(this);
	}

	static navigationOptions = ({ navigation }) => ({
		tabBarLabel: ({ tintColor }) => (
			<TabBar icon="icon_settings" tintColor={tintColor} label={i18n.settingsHeader}/>
		),
		tabBarOnPress: ({scene, jumpToIndex}: Object) => {
			jumpToIndex(scene.index);
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

		let { appLayout } = this.props;

		let {
			ShowOnDashCover,
			textShowOnDashCover,
			textShowOnDash,
			dashSwitchCover,
			dashSwitch,
		} = this.getStyle(appLayout);

		const device = this.props.device;
		const { LEARN } = device.supportedMethods;

		let learnButton = null;

		if (LEARN) {
			learnButton = <LearnButton id={device.id} style={styles.learn} />;
		}
		return (
			<View style={styles.container}>
				<View style={ShowOnDashCover}>
					<View style={textShowOnDashCover}>
						<Text style={textShowOnDash}>
							<FormattedMessage {...messages.showOnDashborad} style={textShowOnDash}/>
						</Text>
					</View>
					<View style={dashSwitchCover}>
						<Switch
							style={dashSwitch}
							onValueChange={this.onValueChange}
							value={this.props.inDashboard}
						/>
					</View>
				</View>
				{learnButton}
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		let isPortrait = height > width;

		return {
			ShowOnDashCover: {
				backgroundColor: '#fff',
				height: isPortrait ? height * 0.09 : width * 0.09,
				marginTop: 25,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
			},
			textShowOnDashCover: {
				width: width * 0.5,
				alignItems: 'flex-start',
				justifyContent: 'center',
			},
			dashSwitchCover: {
				width: width * 0.5,
				alignItems: 'flex-end',
				justifyContent: 'center',
			},
			dashSwitch: {
				height: isPortrait ? height * 0.06 : width * 0.06,
			},
			textShowOnDash: {
				color: '#8A8682',
				fontSize: isPortrait ? width * 0.047 : height * 0.047,
				marginLeft: 8,
				justifyContent: 'center',
			},
			learn: {
				marginHorizontal: width * 0.25,
				marginVertical: 25,
			},
		};
	}
}

SettingsTab.propTypes = {
	device: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
	container: {
		flex: 0,
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
		appLayout: state.App.layout,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SettingsTab);
