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

import { FormattedMessage, Text, View, TabBar } from '../../../BaseComponents';
import { StyleSheet, Switch } from 'react-native';
import { defineMessages } from 'react-intl';
import i18n from '../../Translations/common';

import { LearnButton } from '../TabViews/SubViews';

import { getDevices, setIgnoreDevice } from '../../Actions/Devices';
import { addToDashboard, removeFromDashboard, showToast } from '../../Actions';
import {
	getRelativeDimensions,
} from '../../Lib';
import Theme from '../../Theme';

const messages = defineMessages({
	showOnDashborad: {
		id: 'showOnDashboard',
		defaultMessage: 'Show on dashboard',
		description: 'Select if this item should be shown on the dashboard',
	},
	hideFromList: {
		id: 'hideFromList',
		defaultMessage: 'Hide from device list',
		description: 'Select if this item should be shown on the device list',
	},
});

type Props = {
	dispatch: Function,
	device: Object,
	inDashboard: boolean,
	onAddToDashboard: (id: number) => void,
	onRemoveFromDashboard: (id: number) => void,
	appLayout: Object,
	screenProps: Object,
};

type State = {
	isHidden: boolean,
};


class SettingsTab extends View {
	props: Props;
	state: State;

	onValueChange: number => void;
	setIgnoreDevice: (boolean) => void;

	constructor(props: Props) {
		super(props);
		this.onValueChange = this.onValueChange.bind(this);
		this.setIgnoreDevice = this.setIgnoreDevice.bind(this);

		this.state = {
			isHidden: props.device.ignored,
		};

		let { formatMessage } = props.screenProps.intl;

		this.addedToHiddenList = formatMessage(i18n.deviceAddedToHiddenList);
		this.removedFromHiddenList = formatMessage(i18n.deviceRemovedFromHiddenList);
	}

	static navigationOptions = ({ navigation }: Object): Object => ({
		tabBarLabel: ({ tintColor }: Object): Object => (
			<TabBar
				icon="icon_settings"
				tintColor={tintColor}
				label={i18n.settingsHeader}
				accessibilityLabel={i18n.deviceSettingsTab}/>
		),
		tabBarOnPress: ({scene, jumpToIndex}: Object) => {
			navigation.navigate('Settings');
		},
	});

	onValueChange(value: boolean) {
		if (!value) {
			this.props.onRemoveFromDashboard(this.props.device.id);
		} else {
			this.props.onAddToDashboard(this.props.device.id);
		}
	}

	setIgnoreDevice(value: boolean) {
		let { device } = this.props;
		let ignore = device.ignored ? 0 : 1;
		this.setState({
			isHidden: value,
		});
		this.props.dispatch(setIgnoreDevice(device.id, ignore)).then((res: Object) => {
			let message = device.ignored ?
				this.removedFromHiddenList : this.addedToHiddenList;
			this.props.dispatch(getDevices());
			this.props.dispatch(showToast(message));
		}).catch((err: Object) => {
			let	message = err.message ? err.message : null;
			this.setState({
				isHidden: device.ignored,
			});
			this.props.dispatch(showToast(message));
		});
	}

	componentWillReceiveProps(nextProps: Object) {
		if (this.props.device.ignored !== nextProps.device.ignored) {
			this.setState({
				isHidden: nextProps.device.ignored,
			});
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.screenProps.currentTab === 'Settings';
	}

	render(): Object {
		let { appLayout } = this.props;

		let {
			ShowOnDashCover,
			textShowOnDashCover,
			textShowOnDash,
			dashSwitchCover,
			dashSwitch,
			learn,
		} = this.getStyle(appLayout);

		const { device } = this.props;
		const { LEARN } = device.supportedMethods;

		let learnButton = null;

		if (LEARN) {
			learnButton = <LearnButton id={device.id} style={learn} />;
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
				<View style={ShowOnDashCover}>
					<View style={textShowOnDashCover}>
						<Text style={textShowOnDash}>
							<FormattedMessage {...messages.hideFromList} style={textShowOnDash}/>
						</Text>
					</View>
					<View style={dashSwitchCover}>
						<Switch
							style={dashSwitch}
							onValueChange={this.setIgnoreDevice}
							value={this.state.isHidden}
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
				marginTop: 8,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
				marginHorizontal: 10,
				paddingHorizontal: 20,
				...Theme.Core.shadow,
			},
			textShowOnDashCover: {
				alignItems: 'flex-start',
				justifyContent: 'center',
			},
			dashSwitchCover: {
				alignItems: 'flex-end',
				justifyContent: 'center',
			},
			dashSwitch: {
				height: isPortrait ? height * 0.06 : width * 0.06,
			},
			textShowOnDash: {
				color: '#8A8682',
				fontSize: 15,
				marginLeft: 8,
				justifyContent: 'center',
			},
			learn: {
				marginHorizontal: width * 0.25,
				marginVertical: 15,
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
		paddingTop: 15,
	},
});

function mapDispatchToProps(dispatch: Function): Object {
	return {
		onAddToDashboard: (id: number): any => dispatch(addToDashboard('device', id)),
		onRemoveFromDashboard: (id: number): any => dispatch(removeFromDashboard('device', id)),
		dispatch,
	};
}
function mapStateToProps(state: Object, ownProps: Object): Object {
	return {
		device: ownProps.screenProps.device,
		inDashboard: !!state.dashboard.devicesById[ownProps.screenProps.device.id],
		appLayout: getRelativeDimensions(state.App.layout),
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SettingsTab);
