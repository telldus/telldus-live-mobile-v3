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
import { ScrollView, RefreshControl } from 'react-native';
import { connect } from 'react-redux';
const isEqual = require('react-fast-compare');

import { View, TabBar, LocationDetails } from '../../../BaseComponents';
import { SensorTypes, BatteryInfo } from './SubViews';

import { getSensorInfo } from '../../Actions';
import { getLocationImageUrl } from '../../Lib';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

type Props = {
	sensor: Object,
	gatewayType: string,
	gatewayName: string,

	screenProps: Object,
	getSensorInfo: (id: number, includeUnit: 1 | 0) => Promise<any>,
};

type State = {
	isRefreshing: boolean,
};

class OverviewTab extends View<Props, State> {
	props: Props;
	state: State;

	onRefresh: () => void;

	static navigationOptions = ({ navigation }: Object): Object => ({
		tabBarLabel: ({ tintColor }: Object): Object => (
			<TabBar
				icon="home"
				tintColor={tintColor}
				label={i18n.overviewHeader}
				accessibilityLabel={i18n.deviceOverviewTab}/>
		),
		tabBarOnPress: ({scene, jumpToIndex}: Object) => {
			navigation.navigate({
				routeName: 'Overview',
				key: 'Overview',
			});
		},
	});

	constructor(props: Props) {
		super(props);
		this.state = {
			isRefreshing: false,
		};

		this.onRefresh = this.onRefresh.bind(this);

		this.boxTitle = `${props.screenProps.intl.formatMessage(i18n.location)}:`;
	}

	onRefresh() {
		this.setState({
			isRefreshing: true,
		});
		const { id } = this.props.sensor;
		this.props.getSensorInfo(id, 0).then(() => {
			this.setState({
				isRefreshing: false,
			});
		}).catch(() => {
			this.setState({
				isRefreshing: false,
			});
		});
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { screenProps: screenPropsN, gatewayName: gatewayNameN, sensor: sensorN } = nextProps;
		const { currentScreen, appLayout } = screenPropsN;
		if (currentScreen === 'Overview') {
			if (this.props.screenProps.currentScreen !== 'Overview') {
				return true;
			}

			const { isRefreshing } = this.state;
			if (isRefreshing !== nextState.isRefreshing) {
				return true;
			}

			const { screenProps, gatewayName, sensor } = this.props;
			if ((screenProps.appLayout.width !== appLayout.width) || (gatewayName !== gatewayNameN)) {
				return true;
			}

			if (!isEqual(sensor, sensorN)) {
				return true;
			}

			return false;
		}

		return false;
	}

	render(): Object | null {
		const { isRefreshing } = this.state;
		const { sensor, screenProps, gatewayName, gatewayType } = this.props;

		if (!sensor) {
			return null;
		}

		const { battery } = sensor;
		const { intl, appLayout } = screenProps;
		const locationImageUrl = getLocationImageUrl(gatewayType);
		const locationData = {
			title: this.boxTitle,
			image: locationImageUrl,
			H1: gatewayName,
			H2: gatewayType,
		};

		const {
			contentContainerStyle,
			LocationDetailsStyle,
			batterInfoStyle,
			infoContainerStyle,
		} = this.getStyles(appLayout);

		return (
			<ScrollView
				style={{flex: 1}}
				contentContainerStyle={contentContainerStyle}
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={this.onRefresh}
					/>
				}>
				<SensorTypes sensor={sensor} intl={intl} appLayout={appLayout}/>
				<LocationDetails
					{...locationData}
					style={LocationDetailsStyle}
					infoContainerStyle={infoContainerStyle}/>
				{(!!battery && battery !== 254) && (
					<BatteryInfo battery={battery} appLayout={appLayout} style={batterInfoStyle}/>
				)}
			</ScrollView>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const padding = deviceWidth * Theme.Core.paddingFactor;
		const labelFontSize = deviceWidth * 0.031;

		return {
			contentContainerStyle: {
				flexGrow: 1,
				paddingVertical: padding,
			},
			LocationDetailsStyle: {
				flex: 0,
				padding: 5 + (labelFontSize * 0.4),
				marginHorizontal: padding,
				marginBottom: padding / 2,
			},
			batterInfoStyle: {
				marginHorizontal: padding,
			},
			infoContainerStyle: {
				flex: 1,
				marginRight: 0,
				width: undefined,
			},
		};
	}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		getSensorInfo: (id: number, includeUnit: 1 | 0): Promise<any> => {
			return dispatch(getSensorInfo(id, includeUnit));
		},
	};
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	const id = ownProps.navigation.getParam('id', null);
	const sensor = state.sensors.byId[id];
	const { clientId } = sensor ? sensor : {};

	const gateway = state.gateways.byId[clientId];
	const { name: gatewayName, type: gatewayType } = gateway ? gateway : {};

	return {
		sensor,
		gatewayType,
		gatewayName,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(OverviewTab);
