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

import React, { Component } from 'react';
import { FormattedMessage, FormattedNumber, Image, ListItem, Text, View } from 'BaseComponents';
import { ScrollView, StyleSheet } from 'react-native';
import { reportException } from 'Analytics';
import { defineMessages } from 'react-intl';
import i18n from '../../../Translations/common';

import { utils } from 'live-shared-data';
const { sensorUtils } = utils;
const { getSensorTypes, getSensorUnits } = sensorUtils;

import moment from 'moment';
import Theme from 'Theme';

const messages = defineMessages({
	dayAgo: {
		id: 'sensor.dayAgo',
		defaultMessage: 'day ago',
		description: 'How long ago a sensor was update',
	},
	daysAgo: {
		id: 'sensor.daysAgo',
		defaultMessage: 'days ago',
		description: 'How long ago a sensor was update',
	},
	hourAgo: {
		id: 'sensor.hourAgo',
		defaultMessage: 'hour ago',
		description: 'How long ago a sensor was update',
	},
	hoursAgo: {
		id: 'sensor.hoursAgo',
		defaultMessage: 'hours ago',
		description: 'How long ago a sensor was update',
	},
	justNow: {
		id: 'sensor.justNow',
		defaultMessage: 'just now',
		description: 'How long ago a sensor was update',
	},
	noName: {
		id: 'noName',
		defaultMessage: 'no name',
		description: 'Used when an item does not have a name',
	},
	minuteAgo: {
		id: 'sensor.minuteAgo',
		defaultMessage: 'minute ago',
		description: 'How long ago a sensor was update',
	},
	minutesAgo: {
		id: 'sensor.minutesAgo',
		defaultMessage: 'minutes ago',
		description: 'How long ago a sensor was update',
	},
});

const directions = [
	'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N',
];

const SensorHumidity = ({ humidity, unit }) => (
	<View style={Theme.Styles.sensorValue}>
		<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/Humidity.png')}/>
		<Text>
			<FormattedNumber value={humidity / 100}/>
			{unit}
		</Text>
	</View>
);

const SensorTemperature = ({ temperature, unit }) => (
	<View style={Theme.Styles.sensorValue}>
		<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/Temperature.png')}/>
		<Text>
			<FormattedNumber value={temperature} maximumFractionDigits={1} minimumFractionDigits={1}/>
			{unit}
		</Text>
	</View>
);

const SensorRain = ({ rainRate, rainTotal, unit }) => (
	<View style={Theme.Styles.sensorValue}>
		<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/Rain.png')}/>
		<Text>
			{ rainRate && ( <Text><FormattedNumber value={rainRate} maximumFractionDigits={0}/> {`${unit}\n`} </Text> ) }
			{ rainTotal && ( <Text><FormattedNumber value={rainTotal} maximumFractionDigits={0}/> {unit} </Text> ) }
		</Text>
	</View>
);

const SensorWind = ({ windAverage, windGust, windDirection, unit }) => {
	const getWindDirection = value => directions[Math.floor(value / 22.5)];

	return (
		<View style={Theme.Styles.sensorValue}>
			<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/Wind.png')}/>
			<Text>
				{ windAverage && (
					<Text><FormattedNumber value={windAverage} maximumFractionDigits={1}/> {`${unit}\n`} </Text> ) }
				{ windGust && (
					<Text><FormattedNumber value={windGust} maximumFractionDigits={1}/> {`${unit}\n`} </Text> ) }
				{ windDirection && ( <Text>{getWindDirection(windDirection)}</Text> ) }
			</Text>
		</View>
	);
};

const SensorUV = ({ uv, unit }) => (
	<View style={Theme.Styles.sensorValue}>
		<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/UV.png')}/>
		<Text>
			<FormattedNumber value={uv} maximumFractionDigits={0}/>
			{unit}
		</Text>
	</View>
);

const SensorWatt = ({ watt, unit }) => (
	<View style={Theme.Styles.sensorValue}>
		<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/Watt.png')}/>
		<Text>
			<FormattedNumber value={watt} maximumFractionDigits={1}/>
			{unit}
		</Text>
	</View>
);

const SensorLuminance = ({ luminance, unit }) => (
	<View style={Theme.Styles.sensorValue}>
		<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/Luminance.png')}/>
		<Text>
			<FormattedNumber value={luminance} maximumFractionDigits={0}/>
			{unit}
		</Text>
	</View>
);

const SensorNew = ({ value, unit }) => (
	<View style={Theme.Styles.sensorValue}>
		<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/Luminance.png')}/>
		<Text>
			<FormattedNumber value={value} maximumFractionDigits={1}/>
			{unit}
		</Text>
	</View>
);

type Props = {
	sensor: Object,
	intl: Object,
	currentTab: string,
	currentScreen: string,
};

class SensorRow extends Component<Props, void> {
	props: Props;
	onLayout: (Object) => void;
	labelSensor: string;
	labelHumidity: string;
	labelTemperature: string;
	labelRainRate: string;
	labelRainTotal: string;
	labelWindGust: string;
	labelWindAverage: string;
	labelWindDirection: string;
	labelUVIndex: string;
	labelWatt: string;
	labelLuminance: string;
	labelTimeAgo: string;
	width: number;
	sensorTypes: Object;

	constructor(props: Props) {
		super(props);
		this.width = 0;

		this.labelSensor = props.intl.formatMessage(i18n.labelSensor);
		this.labelHumidity = props.intl.formatMessage(i18n.labelHumidity);
		this.labelTemperature = props.intl.formatMessage(i18n.labelTemperature);
		this.labelRainRate = props.intl.formatMessage(i18n.labelRainRate);
		this.labelRainTotal = props.intl.formatMessage(i18n.labelRainTotal);
		this.labelWindGust = props.intl.formatMessage(i18n.labelWindGust);
		this.labelWindAverage = props.intl.formatMessage(i18n.labelWindAverage);
		this.labelWindDirection = props.intl.formatMessage(i18n.labelWindDirection);
		this.labelUVIndex = props.intl.formatMessage(i18n.labelUVIndex);
		this.labelWatt = props.intl.formatMessage(i18n.labelWatt);
		this.labelLuminance = props.intl.formatMessage(i18n.labelLuminance);
		this.labelTimeAgo = props.intl.formatMessage(i18n.labelTimeAgo);

		this.sensorTypes = getSensorTypes();

		this.onLayout = this.onLayout.bind(this);
	}

	getSensors(data: Object): Array<Object> {
		let sensors = [];
		for (let key in data) {
			let values = data[key];
			let { value, scale, name } = values;
			let sensorType = this.sensorTypes[values.name];
			let sensorUnits = getSensorUnits(sensorType);
			let unit = sensorUnits[scale];

			if (name === 'humidity') {
				sensors.push(<SensorHumidity humidity={value} unit={unit} key={key}/>);
			}
			if (name === 'temp') {
				sensors.push(<SensorTemperature temperature={value} unit={unit} key={key}/>);
			}
			if (name === 'rrate' || name === 'rtotal') {
				sensors.push(<SensorRain
					rainRate={name === 'rrate' ? value : null}
					rainTotal={name === 'rtotal' ? value : null}
					unit={unit}
					key={key}/>);
			}
			if (name === 'wgust' || name === 'wavg' || name === 'wdir') {
				// const getWindDirection = value => directions[Math.floor(value / 22.5)];
				// const direction = [...getWindDirection(windDirection)].toString();
				sensors.push(<SensorWind
					windGust={name === 'wgust' ? value : null}
					windAverage={name === 'wavg' ? value : null}
					windDirection={name === 'wdir' ? value : null}
					unit={unit}
					key={key}/>);
			}
			if (name === 'uv') {
				sensors.push(<SensorUV uv={value} key={key} unit={unit}/>);
			}
			if (name === 'watt') {
				sensors.push(<SensorWatt watt={value} key={key} unit={unit}/>);
			}
			if (name === 'luminance') {
				sensors.push(<SensorLuminance luminance={value} key={key} unit={unit}/>);
			}
			if (name === 'dewp') {
				sensors.push(<SensorNew value={value} key={key} unit={unit}/>);
			}
			if (name === 'barpress') {
				sensors.push(<SensorNew value={value} key={key} unit={unit}/>);
			}
			if (name === 'genmeter') {
				sensors.push(<SensorNew value={value} key={key} unit={unit}/>);
			}
		}
		return sensors;
	}

	render() {
		const { sensor, currentTab, currentScreen } = this.props;
		const minutesAgo = Math.round(((Date.now() / 1000) - sensor.lastUpdated) / 60);
		const {
			data,
			name,
		} = sensor;

		let sensors = this.getSensors(data);
		let [ lastUpdatedValue, lastUpdatedComponent ] = this.formatLastUpdated(minutesAgo, sensor.lastUpdated);

		let accessibilityLabel = `${this.labelSensor}, ${name}, ${lastUpdatedValue}`;
		let accessible = currentTab === 'Sensors' && currentScreen === 'Tabs';

		return (
			<ListItem
				style={Theme.Styles.rowFront}
				onLayout={this.onLayout}
				accessible={accessible}
				importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}
				accessibilityLabel={accessible ? accessibilityLabel : ''}>
				<View style={styles.container}>
					<Text style={[styles.name, { opacity: sensor.name ? 1 : 0.5 }]}
					      ellipsizeMode="middle"
					      numberOfLines={1}>
						{sensor.name ? sensor.name : <FormattedMessage {...messages.noName} /> }
					</Text>
					<Text style={[
						styles.time, {
							color: minutesAgo < 1440 ? 'rgba(0,0,0,0.71)' : '#990000',
							opacity: minutesAgo < 1440 ? 1 : 0.5,
						},
					]}>
						{lastUpdatedComponent}
					</Text>
				</View>
				{ sensors.length * 108 < Math.max(this.width / 2.0, 217) ?
					sensors :
					(<View style={styles.scrollView}>
						<ScrollView style={styles.scrollView} horizontal={true} pagingEnabled={true} directionalLockEnabled={true} >
							{sensors}
						</ScrollView>
					</View>)
				}
			</ListItem>
		);
	}

	onLayout(event: Object) {
		this.width = event.nativeEvent.layout.width;
	}

	formatLastUpdated(minutes: number, lastUpdated:number): Array<any> {
		let { intl } = this.props;
		if (minutes <= 0) {
			return [
				intl.formatMessage(messages.justNow),
				<FormattedMessage {...messages.justNow} />,
			];
		}
		if (minutes === 1) {
			return [
				`1 ${intl.formatMessage(messages.minuteAgo)}`,
				<Text>1 <FormattedMessage {...messages.minuteAgo} /></Text>,
			];
		}
		if (minutes < 60) {
			return [
				`${minutes} ${intl.formatMessage(messages.minutesAgo)}`,
				<Text>{minutes} <FormattedMessage {...messages.minutesAgo} /></Text>,
			];
		}
		const hours = Math.round(minutes / 60);
		if (hours === 1) {
			return [
				`1 ${intl.formatMessage(messages.hourAgo)}`,
				<Text>1 <FormattedMessage {...messages.hourAgo} /></Text>,
			];
		}
		if (hours < 24) {
			return [
				`${hours} ${intl.formatMessage(messages.hoursAgo)}`,
				<Text>{hours} <FormattedMessage {...messages.hoursAgo} /></Text>,
			];
		}
		const days = Math.round(minutes / 60 / 24);
		if (days === 1) {
			return [
				`1 ${intl.formatMessage(messages.dayAgo)}`,
				<Text>1 <FormattedMessage {...messages.dayAgo} /></Text>,
			];
		}
		if (days <= 7) {
			return [
				`${days} ${intl.formatMessage(messages.daysAgo)}`,
				<Text>{days} <FormattedMessage {...messages.daysAgo} /></Text>,
			];
		}
		try {
			return [
				moment.unix(lastUpdated).format('MM-DD-YYYY'),
				moment.unix(lastUpdated).format('MM-DD-YYYY'),
			];
		} catch (exception) {
			reportException(exception);
			return [
				`${intl.formatMessage(messages.unknown)}`,
				<FormattedMessage {...i18n.unknown} />,
			];
		}
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'transparent',
	},
	name: {
		color: 'rgba(0,0,0,0.87)',
		fontSize: 15,
		marginBottom: 2,
	},
	time: {
		fontSize: 12,
	},
	scrollView: {
		alignSelf: 'stretch',
		maxWidth: 216,
		flexDirection: 'row',
	},
});

module.exports = SensorRow;
