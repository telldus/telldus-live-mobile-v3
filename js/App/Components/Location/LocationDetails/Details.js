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
 */

// @flow

'use strict';

import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { isIphoneX } from 'react-native-iphone-x-helper';

import { View, Text, TouchableButton, StyleSheet, FormattedNumber, Icon } from '../../../../BaseComponents';
import LabelBox from '../Common/LabelBox';
import Status from '../../TabViews/SubViews/Gateway/Status';

import Theme from '../../../Theme';
import getLocationImageUrl from '../../../Lib/getLocationImageUrl';
import i18n from '../../../Translations/common';
import { messages as commonMessages } from '../Common/messages';

type Props = {
	rootNavigator: Object,
	containerWidth: number,
	navigation: Object,
	location: Object,
	actions: Object,
	intl: Object,
	appLayout: Object,
};

class Details extends View {
	props: Props;

	onEditName: () => void;
	onEditTimeZone: () => void;
	onEditGeoPosition: () => void;
	onPressRemoveLocation: () => void;

	labelName: string;
	labelTimeZone: string;
	labelGeoPosition: string;
	labelLat: string;
	labelLong: string;
	labelIP: string;
	labelSoftware: string;
	confirmMessage: string;

	constructor(props: Props) {
		super(props);

		let { formatMessage } = props.intl;
		this.labelName = formatMessage(i18n.name);
		this.labelTimeZone = formatMessage(commonMessages.headerOneTimeZoneCity);
		this.labelGeoPosition = formatMessage(commonMessages.geoPosition);
		this.labelLat = formatMessage(commonMessages.latitude);
		this.labelLong = formatMessage(commonMessages.longitude);
		this.labelIP = formatMessage(commonMessages.ip).toUpperCase();
		this.labelSoftware = formatMessage(commonMessages.software);

		this.confirmMessage = formatMessage(commonMessages.confirmDelete);

		this.labelDelete = formatMessage(i18n.delete);

		this.onEditName = this.onEditName.bind(this);
		this.onEditTimeZone = this.onEditTimeZone.bind(this);
		this.onEditGeoPosition = this.onEditGeoPosition.bind(this);
		this.onPressRemoveLocation = this.onPressRemoveLocation.bind(this);
	}

	componentDidMount() {
		const { actions, location, navigation } = this.props;
		let { id } = location, extras = 'timezoneAutodetect';
		actions.getGatewayInfo({id}, extras).then((response: Object) => {
			let { autodetectedTimezone } = response;
			let { params } = navigation.state;
			let newParams = { ...params, autodetectedTimezone };
			navigation.setParams(newParams);
		});
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'Details';
	}

	onEditName() {
		const { navigation, location } = this.props;
		navigation.navigate('EditName', {id: location.id, name: location.name});
	}

	onEditTimeZone() {
		let { navigation, location } = this.props;
		let { params } = navigation.state;
		let newParams = { ...params, id: location.id, timezone: location.timezone };
		navigation.navigate('EditTimeZoneContinent', newParams);
	}

	onEditGeoPosition() {
		let { navigation, location } = this.props;
		let { latitude, longitude, id } = location;
		navigation.navigate('EditGeoPosition', { id, latitude, longitude });
	}

	onPressRemoveLocation() {
		let { actions } = this.props;
		actions.showModal(this.confirmMessage, 'DELETE_LOCATION');
	}

	getLocationStatus(online: boolean, websocketOnline: boolean): Object {
		return (
			<Status online={online} websocketOnline={websocketOnline} intl={this.props.intl} />
		);
	}

	render(): Object | null {
		const { containerWidth, location, appLayout } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;

		if (!location) {
			return null;
		}


		const { name, type, ip, version, timezone, latitude, longitude, online, websocketOnline } = location;
		const image = getLocationImageUrl(type);
		const labelWidth = isIphoneX() ? (!isPortrait ? containerWidth * 0.345 : containerWidth * 0.3755) : containerWidth * 0.36;
		const valueWidth = isIphoneX() ? (!isPortrait ? containerWidth * 0.495 : containerWidth * 0.5255) : containerWidth * 0.51;

		let info = this.getLocationStatus(online, websocketOnline);

		return (
			<View style={{flex: 1}}>
				<LabelBox containerStyle={styles.infoOneContainerStyle}>
					<Image resizeMode={'contain'} style={styles.locationImage} source={{ uri: image, isStatic: true }} />
					<View style={{flex: 1, alignItems: 'flex-start', flexWrap: 'wrap'}}>
						<Text style={[styles.textName]}>
							{type}
						</Text>
						<Text style={styles.locationInfo}>
							{`${this.labelIP}: ${ip}`}
						</Text>
						<Text style={styles.locationInfo}>
							{`${this.labelSoftware}: v${version}`}
						</Text>
						{info && (info)}
					</View>
				</LabelBox>
				<TouchableOpacity style={styles.infoTwoContainerStyle} onPress={this.onEditName}>
					<Text style={[styles.textLabel, {width: labelWidth}]}>
						{this.labelName}
					</Text>
					<Text style={[styles.textValue, {width: valueWidth}]} numberOfLines={1}>
						{name}
					</Text>
					<Icon name="angle-right" size={40} color="#A59F9A90"/>
				</TouchableOpacity>
				<TouchableOpacity style={styles.infoTwoContainerStyle} onPress={this.onEditTimeZone}>
					<Text style={[styles.textLabel, {width: labelWidth}]}>
						{this.labelTimeZone}
					</Text>
					<Text style={[styles.textValue, {width: valueWidth}]}>
						{timezone}
					</Text>
					<Icon name="angle-right" size={40} color="#A59F9A90"/>
				</TouchableOpacity>
				<TouchableOpacity style={styles.infoTwoContainerStyle} onPress={this.onEditGeoPosition}>
					<Text style={[styles.textLabel, {width: labelWidth}]}>
						{this.labelGeoPosition}
					</Text>
					<View style={{ flexDirection: 'column', justifyContent: 'center' }}>
						<Text style={[styles.textValue, {width: valueWidth}]}>
							{`${this.labelLat}: `}
							<FormattedNumber value={latitude} maximumFractionDigits={3} style={styles.textValue}/>
						</Text>
						<Text style={[styles.textValue, {width: valueWidth}]}>
							{` ${this.labelLong}: `}
							<FormattedNumber value={longitude} maximumFractionDigits={3} style={styles.textValue}/>
						</Text>
					</View>
					<Icon name="angle-right" size={40} color="#A59F9A90"/>
				</TouchableOpacity>
				<TouchableButton text={this.labelDelete} style={styles.button} onPress={this.onPressRemoveLocation}/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	button: {
		backgroundColor: Theme.Core.brandDanger,
		marginVertical: 20,
	},
	locationImage: {
		height: 80,
		width: 100,
	},
	infoOneContainerStyle: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	infoTwoContainerStyle: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: '#fff',
		marginTop: 15,
		padding: 10,
		...Theme.Core.shadow,
	},
	textName: {
		color: Theme.Core.brandSecondary,
		fontSize: 20,
	},
	textLabel: {
		color: '#000',
		fontSize: 14,
	},
	textValue: {
		color: Theme.Core.rowTextColor,
		fontSize: 14,
		textAlign: 'right',
		paddingRight: 10,
	},
	locationInfo: {
		fontSize: 14,
		color: Theme.Core.rowTextColor,
	},
});

function mapStateToProps(store: Object, ownProps: Object): Object {
	let id = ownProps.rootNavigator.state.params.location.id;
	return {
		location: store.gateways.byId[id],
		appLayout: store.App.layout,
	};
}

export default connect(mapStateToProps, null)(Details);
