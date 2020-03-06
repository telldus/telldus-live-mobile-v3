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

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { NavigationActions } from '@react-navigation/compat';

import { View, Image, LocationDetails } from '../../../../BaseComponents';

import { hasTokenExpired } from '../../../Lib/LocalControl';
import getLocationImageUrl from '../../../Lib/getLocationImageUrl';
import Status from './Gateway/Status';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
    location: Object,
	appLayout: Object,
	screenReaderEnabled: boolean,
	intl: Object,
	navigation: Object,
	onPress: (Object) => void,
	dispatch: Function,
};

type State = {
};

class GatewayRow extends PureComponent<Props, State> {
	props: Props;
	state: State;

	onPressGateway: () => void;

	constructor(props: Props) {
		super(props);

		this.onPressGateway = this.onPressGateway.bind(this);
	}

	onPressGateway() {
		let { location, onPress } = this.props;
		if (onPress) {
			onPress(location);
		} else {
			const navigateAction = NavigationActions.navigate({
				routeName: 'LocationDetails',
				key: 'LocationDetails',
				params: { location },
				action: NavigationActions.navigate({
					routeName: 'Details',
					key: 'Details',
					params: { location },
				}),
			  });
			this.props.navigation.dispatch(navigateAction);
		}
	}

	getLocationStatus(online: boolean, websocketOnline: boolean, localKey: Object): Object {
		return (
			<Status online={online} websocketOnline={websocketOnline} intl={this.props.intl} localKey={localKey}/>
		);
	}

	render(): Object {
		let {
			location,
			appLayout,
			intl,
			screenReaderEnabled,
		} = this.props;
		let { name, type, online, websocketOnline, localKey = {} } = location;

		let info = this.getLocationStatus(online, websocketOnline, localKey);

		let styles = this.getStyles(appLayout);

		let locationImageUrl = getLocationImageUrl(type);
		let locationData = {
			image: locationImageUrl,
			H1: name,
			H2: type,
			info,
		};

		let accessibilityLabel = '';
		if (screenReaderEnabled) {
			const { address, key, ttl, supportLocal } = localKey;
			const tokenExpired = hasTokenExpired(ttl);
			const supportLocalControl = !!(address && key && ttl && !tokenExpired && supportLocal);

			const { formatMessage } = intl;
			const pOne = `${formatMessage(i18n.location)} ${name}`;
			const pTwo = `${formatMessage(i18n.labelType)} ${type}`;

			const labelLocal = formatMessage(i18n.labelLocal);
			const labelCloud = formatMessage(i18n.labelCloud);
			const pThree = `${formatMessage(i18n.labelControl)} ${supportLocalControl ? labelLocal : labelCloud}`;

			const labelOnline = formatMessage(i18n.online);
			const offline = formatMessage(i18n.offline);
			const noLiveUpdates = formatMessage(i18n.noLiveUpdates);

			const pFour = `${formatMessage(i18n.status)} ${!online ? offline :
				!websocketOnline ? noLiveUpdates : labelOnline}`;
			const pFive = `${formatMessage(i18n.labelAddEditDetails)}`;
			accessibilityLabel = `${pOne}, ${pTwo}, ${pThree}, ${pFour}, ${pFive}.`;
		}

		return (
			<View style={styles.rowItemsCover}
				accessible={true}
				accessibilityLabel={accessibilityLabel}>
				<LocationDetails {...locationData}
					style={styles.locationDetails}
					onPress={this.onPressGateway}/>
				<View style={styles.arrowCover} pointerEvents={'none'}>
					<Image source={{uri: 'right_arrow_key'}} style={styles.arrow}/>
				</View>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const padding = deviceWidth * Theme.Core.paddingFactor;
		const rowWidth = width - (padding * 2);
		const rowHeight = deviceWidth * 0.34;

		return {
			rowItemsCover: {
				flexDirection: 'column',
				alignItems: 'center',
			},
			locationDetails: {
				width: rowWidth,
				height: rowHeight,
				marginVertical: padding / 4,
			},
			arrowCover: {
				flex: 0,
				position: 'absolute',
				zIndex: 1,
				right: padding * 2,
				top: '40%',
			},
			arrow: {
				tintColor: '#A59F9A90',
				height: rowHeight * 0.25,
				width: rowHeight * 0.2,
			},
			coverStyle: {
				paddingVertical: 5,
			},
		};
	}
}

function mapStateToProps(state: Object, props: Object): Object {
	const { screenReaderEnabled } = state.app;

	return {
		appLayout: state.app.layout,
		screenReaderEnabled,
	};
}

function mapDispatchToProps(dispatch: Object, props: Object): Object {
	return {
		dispatch,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(GatewayRow);
