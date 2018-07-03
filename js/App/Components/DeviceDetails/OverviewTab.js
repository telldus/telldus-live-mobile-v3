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

import { View, TabBar } from '../../../BaseComponents';
import { ScrollView } from 'react-native';
import { defineMessages } from 'react-intl';

import getDeviceType from '../../Lib/getDeviceType';
import getLocationImageUrl from '../../Lib/getLocationImageUrl';
import {
	DeviceActionDetails,
	DeviceLocationDetail,
} from './SubViews';
import i18n from '../../Translations/common';
import Theme from '../../Theme';

const messages = defineMessages({
	overviewHeader: {
		id: 'deviceSettings.overviewHeader',
		defaultMessage: 'Overview',
	},
	location: {
		id: 'deviceSettings.location',
		defaultMessage: 'Location',
		description: 'Header for which location a device belongs to',
	},
});

type Props = {
	device: Object,
	gateway: Object,
	screenProps: Object,
};

type State = {
};

class OverviewTab extends View {
	props: Props;
	state: State;
	constructor(props: Props) {
		super(props);
		this.state = {
		};

		this.boxTitle = `${props.screenProps.intl.formatMessage(messages.location)}:`;
	}

	static navigationOptions = ({ navigation }: Object): Object => ({
		tabBarLabel: ({ tintColor }: Object): Object => (
			<TabBar
				icon="icon_home"
				tintColor={tintColor}
				label={messages.overviewHeader}
				accessibilityLabel={i18n.deviceOverviewTab}/>
		),
		tabBarOnPress: ({scene, jumpToIndex}: Object) => {
			navigation.navigate('Overview');
		},
	});

	getType(device: Object): string | null {
		if (!device) {
			return null;
		}

		const supportedMethods = device.supportedMethods;
		return getDeviceType(supportedMethods);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.screenProps.currentTab === 'Overview';
	}

	render(): Object {
		const { device, screenProps, gateway } = this.props;
		const { appLayout, intl } = screenProps;
		const locationImageUrl = getLocationImageUrl(gateway.type);
		const locationData = {
			title: this.boxTitle,
			image: locationImageUrl,
			H1: gateway.name,
			H2: gateway.type,
		};
		const {
			TURNON,
			TURNOFF,
			BELL,
			DIM,
			UP,
			DOWN,
			STOP,
		} = device.supportedMethods;
		const hasActions = TURNON || TURNOFF || BELL || DIM || UP || DOWN || STOP;
		const isGatewayActive = gateway && gateway.online;

		const styles = this.getStyles(appLayout, hasActions);

		return (
			<ScrollView contentContainerStyle={styles.itemsContainer}>
				{hasActions && (
					<DeviceActionDetails
						device={device}
						intl={intl}
						appLayout={appLayout}
						isGatewayActive={isGatewayActive}
						containerStyle={styles.actionDetails}/>
				)}
				<DeviceLocationDetail {...locationData} style={styles.LocationDetail}/>
			</ScrollView>
		);
	}

	getStyles(appLayout: Object, hasActions: boolean): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const padding = deviceWidth * Theme.Core.paddingFactor;

		return {
			container: {
				flex: 0,
				alignItems: 'center',
				justifyContent: 'center',
			},
			itemsContainer: {
				justifyContent: 'center',
				margin: padding,
			},
			LocationDetail: {
				marginTop: hasActions ? (padding / 2) : 0,
			},
			actionDetails: {
				marginTop: 0,
			},
		};
	}
}

OverviewTab.propTypes = {
	device: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	const id = ownProps.navigation.getParam('id', null);
	const device = state.devices.byId[id];
	const { clientId } = device;

	return {
		device: state.devices.byId[id],
		gateway: state.gateways.byId[clientId],
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(OverviewTab);
