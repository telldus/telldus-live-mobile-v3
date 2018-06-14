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

import {
	View, Text, TouchableButton, StyleSheet,
	FormattedNumber, Icon, TitledInfoBlock,
} from '../../../../BaseComponents';
import LabelBox from '../Common/LabelBox';
import Status from '../../TabViews/SubViews/Gateway/Status';

import Theme from '../../../Theme';
import { getRelativeDimensions } from '../../../Lib';
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
	labelIPPublic: string;
	labelIPLocal: string;
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
		this.labelIPPublic = formatMessage(commonMessages.ipPublic);
		this.labelIPLocal = formatMessage(commonMessages.ipLocal);
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
			<Status online={online} websocketOnline={websocketOnline} intl={this.props.intl}/>
		);
	}

	render(): Object | null {
		const { containerWidth, location, appLayout } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const fontSize = Math.floor(deviceWidth * 0.045);
		const iconSize = Math.floor(deviceWidth * 0.08);
		const padding = deviceWidth * Theme.Core.paddingFactor;

		if (!location) {
			return null;
		}


		const { name, type, ip, version, timezone, latitude, longitude, online, websocketOnline, localKey } = location;
		const { address, key } = localKey;
		const image = getLocationImageUrl(type);
		const {
			locationImage, textName, locationInfo,
			infoOneContainerStyle, boxItemsCover,
		} = this.getStyles(appLayout);
		const labelWidth = containerWidth * 0.36;

		let info = this.getLocationStatus(online, websocketOnline);

		return (
			<View style={{flex: 1, paddingVertical: padding}}>
				<LabelBox containerStyle={infoOneContainerStyle} appLayout={appLayout}>
					<Image resizeMode={'contain'} style={locationImage} source={{ uri: image, isStatic: true }} />
					<View style={boxItemsCover}>
						<Text style={[textName]}>
							{type}
						</Text>
						<Text style={locationInfo}>
							{`${this.labelIPPublic}: ${ip}`}
						</Text>
						{
							(address && key) && (
								<Text style={locationInfo}>
									{`${this.labelIPLocal}: ${address}`}
								</Text>
							)
						}
						<Text style={locationInfo}>
							{`${this.labelSoftware}: v${version}`}
						</Text>
						{info && (info)}
					</View>
				</LabelBox>
				<TitledInfoBlock
					label={this.labelName}
					value={name}
					icon={'angle-right'}
					iconColor="#A59F9A90"
					blockContainerStyle={{
						marginTop: padding / 2,
						marginBottom: padding / 2,
					}}
					valueTextStyle={{
						marginRight: 20,
					}}
					onPress={this.onEditName}
				/>
				<TitledInfoBlock
					label={this.labelTimeZone}
					value={timezone}
					icon={'angle-right'}
					iconColor="#A59F9A90"
					blockContainerStyle={{
						marginBottom: padding / 2,
					}}
					valueTextStyle={{
						marginRight: 20,
					}}
					onPress={this.onEditTimeZone}
				/>
				<TouchableOpacity style={[styles.infoTwoContainerStyle, {
					padding: fontSize,
					marginBottom: padding / 2,
				}]} onPress={this.onEditGeoPosition}>
					<Text style={[styles.textLabel, {fontSize, width: labelWidth}]}>
						{this.labelGeoPosition}
					</Text>
					<View style={{ flexDirection: 'column', justifyContent: 'center', marginRight: 20 }}>
						<Text style={[styles.textValue, {fontSize}]}>
							{`${this.labelLat}: `}
							<FormattedNumber value={latitude} maximumFractionDigits={3} style={styles.textValue}/>
						</Text>
						<Text style={[styles.textValue, {fontSize}]}>
							{` ${this.labelLong}: `}
							<FormattedNumber value={longitude} maximumFractionDigits={3} style={styles.textValue}/>
						</Text>
					</View>
					<Icon name="angle-right" size={iconSize} color="#A59F9A90" style={styles.nextIcon}/>
				</TouchableOpacity>
				<TouchableButton text={this.labelDelete} style={styles.button} onPress={this.onPressRemoveLocation}/>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const deviceHeight = isPortrait ? height : width;

		const fontSizeName = Math.floor(deviceWidth * 0.053333333);

		return {
			infoOneContainerStyle: {
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'flex-start',
				flex: 0,
				marginBottom: 0,
				marginTop: 0,
				padding: fontSizeName * 0.6,
			},
			boxItemsCover: {
				flex: 1,
				alignItems: 'flex-start',
				padding: fontSizeName * 0.3,
			},
			locationImage: {
				width: deviceWidth * 0.22,
				height: deviceHeight * 0.12,
			},
			textName: {
				color: Theme.Core.brandSecondary,
				fontSize: fontSizeName,
			},
			locationInfo: {
				fontSize: Math.floor(deviceWidth * 0.045),
				color: Theme.Core.rowTextColor,
			},
		};
	}
}

const styles = StyleSheet.create({
	button: {
		backgroundColor: Theme.Core.brandDanger,
	},
	infoTwoContainerStyle: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: '#fff',
		...Theme.Core.shadow,
	},
	textLabel: {
		color: '#000',
	},
	textValue: {
		color: Theme.Core.rowTextColor,
		textAlign: 'right',
	},
	nextIcon: {
		position: 'absolute',
		right: 10,
	},
});

function mapStateToProps(store: Object, ownProps: Object): Object {
	let id = ownProps.rootNavigator.state.params.location.id;
	return {
		location: store.gateways.byId[id],
		appLayout: getRelativeDimensions(store.App.layout),
	};
}

export default connect(mapStateToProps, null)(Details);
