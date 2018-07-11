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
import { ScrollView } from 'react-native';
import { connect } from 'react-redux';

import { View, TabBar } from '../../../BaseComponents';
import { DeviceLocationDetail } from '../DeviceDetails/SubViews';
import { SensorTypes, BatteryInfo } from './SubViews';

import { getLocationImageUrl } from '../../Lib';
import Theme from '../../Theme';
import i18n from '../../Translations/common';

type Props = {
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

		this.boxTitle = `${props.screenProps.intl.formatMessage(i18n.location)}:`;
	}

	static navigationOptions = ({ navigation }: Object): Object => ({
		tabBarLabel: ({ tintColor }: Object): Object => (
			<TabBar
				icon="home"
				tintColor={tintColor}
				label={i18n.overviewHeader}
				accessibilityLabel={i18n.deviceOverviewTab}/>
		),
		tabBarOnPress: ({scene, jumpToIndex}: Object) => {
			navigation.navigate('Overview');
		},
	});

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.screenProps.currentScreen === 'Overview';
	}

	render(): Object {
		const { sensor, screenProps, gateway } = this.props;
		const { battery } = sensor;
		const { intl, appLayout } = screenProps;
		const locationImageUrl = getLocationImageUrl(gateway.type);
		const locationData = {
			title: this.boxTitle,
			image: locationImageUrl,
			H1: gateway.name,
			H2: gateway.type,
		};

		const {
			contentContainerStyle,
			LocationDetailsStyle,
			batterInfoStyle,
		} = this.getStyles(appLayout);

		return (
			<ScrollView style={{flex: 1}} contentContainerStyle={contentContainerStyle}>
				<SensorTypes sensor={sensor} intl={intl} appLayout={appLayout}/>
				<DeviceLocationDetail {...locationData} style={LocationDetailsStyle}/>
				{battery && (<BatteryInfo battery={battery} appLayout={appLayout} style={batterInfoStyle}/>)}
			</ScrollView>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const padding = deviceWidth * Theme.Core.paddingFactor;

		return {
			contentContainerStyle: {
				flexGrow: 1,
				paddingVertical: padding,
			},
			LocationDetailsStyle: {
				marginHorizontal: padding,
				marginBottom: padding / 2,
			},
			batterInfoStyle: {
				marginHorizontal: padding,
			},
		};
	}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	const id = ownProps.navigation.getParam('id', null);
	const sensor = state.sensors.byId[id];
	const { clientId } = sensor;

	return {
		sensor,
		gateway: state.gateways.byId[clientId],
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(OverviewTab);
