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
import { FormattedMessage, FormattedNumber, Image, ListItem, Text, View, BlockIcon } from 'BaseComponents';
import { ScrollView, StyleSheet } from 'react-native';
import { reportException } from 'Analytics';
import { defineMessages } from 'react-intl';
import i18n from '../../../Translations/common';

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

const SensorHumidity = ({ humidity }) => (
	<View style={Theme.Styles.sensorValue}>
		<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/Humidity.png')}/>
		<Text>
			<FormattedNumber value={humidity / 100} formatStyle="percent"/>
		</Text>
	</View>
);

const SensorTemperature = ({ temperature }) => (
	<View style={Theme.Styles.sensorValue}>
		<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/Temperature.png')}/>
		<Text>
			<FormattedNumber value={temperature} maximumFractionDigits={1} minimumFractionDigits={1}/>
			{`${String.fromCharCode(176)}C`}
		</Text>
	</View>
);

const SensorRain = ({ rainRate, rainTotal }) => (
	<View style={Theme.Styles.sensorValue}>
		<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/Rain.png')}/>
		<Text>
			{ rainRate && ( <Text><FormattedNumber value={rainRate} maximumFractionDigits={0}/> {'mm/h\n'} </Text> ) }
			{ rainTotal && ( <Text><FormattedNumber value={rainTotal} maximumFractionDigits={0}/> {'mm'} </Text> ) }
		</Text>
	</View>
);

const SensorWind = ({ windAverage, windGust, windDirection }) => {
	const getWindDirection = value => directions[Math.floor(value / 22.5)];

	return (
		<View style={Theme.Styles.sensorValue}>
			<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/Wind.png')}/>
			<Text>
				{ windAverage && (
					<Text><FormattedNumber value={windAverage} maximumFractionDigits={1}/> {'m/s\n'} </Text> ) }
				{ windGust && (
					<Text><FormattedNumber value={windGust} maximumFractionDigits={1}/> {'m/s*\n'} </Text> ) }
				{ windDirection && ( <Text>{getWindDirection(windDirection)}</Text> ) }
			</Text>
		</View>
	);
};

const SensorUV = ({ uv }) => (
	<View style={Theme.Styles.sensorValue}>
		<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/UV.png')}/>
		<FormattedNumber value={uv} maximumFractionDigits={0}/>
	</View>
);

const SensorWatt = ({ watt }) => (
	<View style={Theme.Styles.sensorValue}>
		<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/Watt.png')}/>
		<Text>
			<FormattedNumber value={watt} maximumFractionDigits={1}/>
			{'W'}
		</Text>
	</View>
);

const SensorLuminance = ({ luminance }) => (
	<View style={Theme.Styles.sensorValue}>
		<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/Luminance.png')}/>
		<Text>
			<FormattedNumber value={luminance} maximumFractionDigits={0}/>
			{'lx'}
		</Text>
	</View>
);

type Props = {
	sensor: Object,
	intl: Object,
	currentTab: string,
	currentScreen: string,
	appLayout: Object,
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

		this.onLayout = this.onLayout.bind(this);
	}

	render() {
		const { sensor, currentTab, currentScreen, appLayout } = this.props;
		const styles = this.getStyles(appLayout);
		const minutesAgo = Math.round(((Date.now() / 1000) - sensor.lastUpdated) / 60);
		let sensors = [];

		const {
			id,
			humidity,
			temperature,
			rainRate,
			rainTotal,
			windGust,
			windAverage,
			windDirection,
			uv,
			watt,
			luminance,
			name,
		} = sensor;

		let [ lastUpdatedValue, lastUpdatedComponent ] = this.formatLastUpdated(minutesAgo, sensor.lastUpdated, styles);
		let accessibilityLabel = `${this.labelSensor}, ${name}`;

		if (humidity) {
			accessibilityLabel = `${accessibilityLabel},  ${this.labelHumidity} ${humidity}%`;
			sensors.push(<SensorHumidity {...{ humidity }} key={`${id}humidity`}/>);
		}
		if (temperature) {
			accessibilityLabel = `${accessibilityLabel},  ${this.labelTemperature} ${temperature} ${String.fromCharCode(176)}C`;
			sensors.push(<SensorTemperature {...{ temperature }} key={`${id}temperature`}/>);
		}
		if (rainRate || rainTotal) {
			accessibilityLabel = `${accessibilityLabel},  ${this.labelRainRate} ${rainRate} mm/h,  ${this.labelRainTotal} ${rainTotal} mm`;
			sensors.push(<SensorRain {...{
				rainRate,
				rainTotal,
			}} key={`${id}rain`}/>);
		}
		if (windGust || windAverage || windDirection) {
			const getWindDirection = value => directions[Math.floor(value / 22.5)];
			const direction = [...getWindDirection(windDirection)].toString();
			accessibilityLabel = `${accessibilityLabel},  ${this.labelWindGust} ${windGust}m/s,  ${this.labelWindAverage} ${windAverage}m/s*
			,  ${this.labelWindDirection} ${direction}`;
			sensors.push(<SensorWind {...{
				windGust,
				windAverage,
				windDirection,
			}} key={`${id}wind`}/>);
		}
		if (uv) {
			accessibilityLabel = `${accessibilityLabel},  ${this.labelUVIndex} ${uv}`;
			sensors.push(<SensorUV {...{ uv }} key={`${id}uv`}/>);
		}
		if (watt) {
			accessibilityLabel = `${accessibilityLabel},  ${this.labelWatt} ${watt}W`;
			sensors.push(<SensorWatt {...{ watt }} key={`${id}watt`}/>);
		}
		if (luminance) {
			accessibilityLabel = `${accessibilityLabel},  ${this.labelLuminance} ${luminance}lx`;
			sensors.push(<SensorLuminance {...{ luminance }} key={`${id}luminance`}/>);
		}

		let accessible = currentTab === 'Sensors' && currentScreen === 'Tabs';
		accessibilityLabel = `${accessibilityLabel}, ${this.labelTimeAgo} ${lastUpdatedValue}`;

		return (
			<ListItem
				style={styles.row}
				onLayout={this.onLayout}
				accessible={accessible}
				importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}
				accessibilityLabel={accessible ? accessibilityLabel : ''}>
				<View style={styles.container}>
					<BlockIcon icon="sensor" style={styles.sensorIcon} containerStyle={styles.iconContainerStyle}/>
					<View>
						<Text style={[styles.name, { opacity: sensor.name ? 1 : 0.5 }]}
							ellipsizeMode="middle"
							numberOfLines={1}>
							{sensor.name ? sensor.name : <FormattedMessage {...messages.noName} /> }
						</Text>
						<Text style={[
							styles.time, {
								color: minutesAgo < 1440 ? Theme.Core.rowTextColor : '#990000',
								opacity: minutesAgo < 1440 ? 1 : 0.5,
							},
						]}>
							{lastUpdatedComponent}
						</Text>
					</View>
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

	formatLastUpdated(minutes: number, lastUpdated:number, styles: Object): Array<any> {
		let { intl } = this.props;
		if (minutes <= 0) {
			return [
				intl.formatMessage(messages.justNow),
				<FormattedMessage {...messages.justNow} style={styles.time}/>,
			];
		}
		if (minutes === 1) {
			return [
				`1 ${intl.formatMessage(messages.minuteAgo)}`,
				<Text style={styles.time}>1 <FormattedMessage {...messages.minuteAgo} style={styles.time}/></Text>,
			];
		}
		if (minutes < 60) {
			return [
				`${minutes} ${intl.formatMessage(messages.minutesAgo)}`,
				<Text style={styles.time}>{minutes} <FormattedMessage {...messages.minutesAgo} style={styles.time}/></Text>,
			];
		}
		const hours = Math.round(minutes / 60);
		if (hours === 1) {
			return [
				`1 ${intl.formatMessage(messages.hourAgo)}`,
				<Text style={styles.time}>1 <FormattedMessage {...messages.hourAgo} style={styles.time}/></Text>,
			];
		}
		if (hours < 24) {
			return [
				`${hours} ${intl.formatMessage(messages.hoursAgo)}`,
				<Text style={styles.time}>{hours} <FormattedMessage {...messages.hoursAgo} style={styles.time}/></Text>,
			];
		}
		const days = Math.round(minutes / 60 / 24);
		if (days === 1) {
			return [
				`1 ${intl.formatMessage(messages.dayAgo)}`,
				<Text style={styles.time}>1 <FormattedMessage {...messages.dayAgo} style={styles.time}/></Text>,
			];
		}
		if (days <= 7) {
			return [
				`${days} ${intl.formatMessage(messages.daysAgo)}`,
				<Text style={styles.time}>{days} <FormattedMessage {...messages.daysAgo} style={styles.time}/></Text>,
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
				<FormattedMessage {...i18n.unknown} style={styles.time} />,
			];
		}
	}

	getStyles(appLayout: Object) {
		let { width } = appLayout;

		let labelWidth = (width - 24) * 0.6;
		let valueWidth = (width - 24) * 0.4;

		return {
			container: {
				flex: 0,
				backgroundColor: 'transparent',
				width: labelWidth,
				flexDirection: 'row',
				alignItems: 'center',
			},
			name: {
				color: Theme.Core.rowTextColor,
				fontSize: 15,
				marginBottom: 2,
			},
			row: {
				marginHorizontal: 12,
				marginBottom: 5,
				backgroundColor: '#FFFFFF',
				flexDirection: 'row',
				height: 70,
				justifyContent: 'space-between',
				paddingLeft: 16,
				alignItems: 'center',
				borderRadius: 2,
				...Theme.Core.shadow,
			},
			sensorIcon: {
				fontSize: 12,
			},
			iconContainerStyle: {
				borderRadius: 25,
				width: 25,
				height: 25,
				alignItems: 'center',
				justifyContent: 'center',
				marginHorizontal: 5,
			},
			time: {
				fontSize: 12,
				color: Theme.Core.rowTextColor,
			},
			scrollView: {
				alignSelf: 'stretch',
				maxWidth: 216,
				flexDirection: 'row',
			},
		};
	}
}

module.exports = SensorRow;
