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

import { View, Text, TouchableButton, StyleSheet, FormattedNumber, Icon } from 'BaseComponents';
import LabelBox from '../Common/LabelBox';

import Theme from 'Theme';
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
		this.labelLat = formatMessage(commonMessages.lat);
		this.labelLong = formatMessage(commonMessages.long);
		this.labelIP = formatMessage(commonMessages.ip).toUpperCase();
		this.labelSoftware = formatMessage(commonMessages.software);

		this.confirmMessage = formatMessage(commonMessages.confirmDelete);

		this.onEditName = this.onEditName.bind(this);
		this.onEditTimeZone = this.onEditTimeZone.bind(this);
		this.onEditGeoPosition = this.onEditGeoPosition.bind(this);
		this.onPressRemoveLocation = this.onPressRemoveLocation.bind(this);
	}

	componentDidMount() {
		const { actions, location, navigation } = this.props;
		let { id } = location, extras = 'timezoneAutodetect';
		actions.getGatewayInfo({id}, extras).then(response => {
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
		navigation.navigate('EditGeoPosition', {id: location.id});
	}

	onPressRemoveLocation() {
		let { actions } = this.props;
		actions.showModal(this.confirmMessage, 'DELETE_LOCATION');
	}

	render(): Object | null {
		const { containerWidth, location } = this.props;

		if (!location) {
			return null;
		}


		const { name, type, ip, version, timezone, latitude, longitude } = location;
		const image = getLocationImageUrl(type);

		return (
			<View style={{flex: 1}}>
				<LabelBox containerStyle={styles.infoOneContainerStyle}>
					<Image resizeMode={'contain'} style={styles.locationImage} source={{ uri: image, isStatic: true }} />
					<View>
						<Text style={[styles.textName]}>
							{type}
						</Text>
						<Text style={{color: Theme.Core.rowTextColor}}>
							{`${this.labelIP}: ${ip}`}
						</Text>
						<Text style={{color: Theme.Core.rowTextColor}}>
							{`${this.labelSoftware}: v${version}`}
						</Text>
					</View>
				</LabelBox>
				<TouchableOpacity style={styles.infoTwoContainerStyle} onPress={this.onEditName}>
					<Text style={[styles.textLabel, {width: containerWidth * 0.36}]}>
						{this.labelName}
					</Text>
					<Text style={[styles.textValue, {width: containerWidth * 0.51}]} numberOfLines={1}>
						{name}
					</Text>
					<Icon name="angle-right" size={40} color="#A59F9A90"/>
				</TouchableOpacity>
				<TouchableOpacity style={styles.infoTwoContainerStyle} onPress={this.onEditTimeZone}>
					<Text style={[styles.textLabel, {width: containerWidth * 0.36}]}>
						{this.labelTimeZone}
					</Text>
					<Text style={[styles.textValue, {width: containerWidth * 0.51}]}>
						{timezone}
					</Text>
					<Icon name="angle-right" size={40} color="#A59F9A90"/>
				</TouchableOpacity>
				<TouchableOpacity style={styles.infoTwoContainerStyle} onPress={this.onEditGeoPosition}>
					<Text style={[styles.textLabel, {width: containerWidth * 0.36}]}>
						{this.labelGeoPosition}
					</Text>
					<Text style={[styles.textValue, {width: containerWidth * 0.51}]}>{`${this.labelLat}: `}
						<FormattedNumber value={latitude} maximumFractionDigits={3} style={styles.textValue}/>
						{` ${this.labelLong}: `}
						<FormattedNumber value={longitude} maximumFractionDigits={3} style={styles.textValue}/>
					</Text>
					<Icon name="angle-right" size={40} color="#A59F9A90"/>
				</TouchableOpacity>
				<TouchableButton text={'delete'} style={styles.button} onPress={this.onPressRemoveLocation}/>
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
});

function mapStateToProps(store: Object, ownProps: Object): Object {
	let id = ownProps.rootNavigator.state.params.location.id;
	return {
		location: store.gateways.byId[id],
	};
}

export default connect(mapStateToProps, null)(Details);
