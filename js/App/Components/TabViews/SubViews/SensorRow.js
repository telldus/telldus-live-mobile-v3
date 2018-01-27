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
import { TouchableWithoutFeedback, UIManager, LayoutAnimation } from 'react-native';

import { FormattedMessage, FormattedNumber, Image, ListItem, Text, View, BlockIcon } from 'BaseComponents';
import { reportException } from 'Analytics';
import { defineMessages } from 'react-intl';
import i18n from '../../../Translations/common';

import { utils, actions } from 'live-shared-data';
const { sensorUtils } = utils;
const { getSensorTypes, getSensorUnits } = sensorUtils;
const { Dashboard: { getSupportedDisplayTypes } } = actions;

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

const SensorHumidity = ({ value, unit, label }) => (
	<View style={Theme.Styles.sensorValue}>
		<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/Humidity.png')}/>
		<View style={Theme.Styles.sensorValueCover}>
			<Text style={Theme.Styles.sensorValueText}>
				<FormattedNumber value={value / 100}/>
				{unit}
			</Text>
			<Text style={{color: '#ffffff'}}>
				{label}
			</Text>
		</View>
	</View>
);

const SensorTemperature = ({ value, unit, label }) => (
	<View style={Theme.Styles.sensorValue}>
		<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/Temperature.png')}/>
		<View style={Theme.Styles.sensorValueCover}>
			<Text style={Theme.Styles.sensorValueText}>
				<FormattedNumber value={value} maximumFractionDigits={1} minimumFractionDigits={1}/>
				{unit}
			</Text>
			<Text style={{color: '#ffffff'}}>
				{label}
			</Text>
		</View>
	</View>
);

const SensorRain = ({value, unit, label }) => (
	<View style={Theme.Styles.sensorValue}>
		<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/Rain.png')}/>
		<View style={Theme.Styles.sensorValueCover}>
			<Text style={Theme.Styles.sensorValueText}><FormattedNumber value={value} maximumFractionDigits={0}/>{unit}</Text>
			<Text style={{color: '#ffffff'}}>
				{label}
			</Text>
		</View>
	</View>
);

const SensorWind = ({ name, value, unit, label }) => {
	return (
		<View style={Theme.Styles.sensorValue}>
			<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/Wind.png')}/>
			<View style={Theme.Styles.sensorValueCover}>
				<Text style={Theme.Styles.sensorValueText}>
					{
						name === 'wdir' ?
							value
							:
							<Text style={Theme.Styles.sensorValueText}>
								<FormattedNumber value={value} maximumFractionDigits={1}/>{unit}
							</Text>

					}
				</Text>
				<Text style={{color: '#ffffff'}}>
					{label}
				</Text>
			</View>
		</View>
	);
};

const SensorUV = ({ value, unit, label }) => (
	<View style={Theme.Styles.sensorValue}>
		<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/UV.png')}/>
		<View style={Theme.Styles.sensorValueCover}>
			<Text style={Theme.Styles.sensorValueText}>
				<FormattedNumber value={value} maximumFractionDigits={0}/>
				{unit}
			</Text>
			<Text style={{color: '#ffffff'}}>
				{label}
			</Text>
		</View>
	</View>
);

const SensorWatt = ({ value, unit, label }) => (
	<View style={Theme.Styles.sensorValue}>
		<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/Watt.png')}/>
		<View style={Theme.Styles.sensorValueCover}>
			<Text style={Theme.Styles.sensorValueText}>
				<FormattedNumber value={value} maximumFractionDigits={1}/>
				{unit}
			</Text>
			<Text style={{color: '#ffffff'}}>
				{label}
			</Text>
		</View>
	</View>
);

const SensorLuminance = ({ value, unit, label }) => (
	<View style={Theme.Styles.sensorValue}>
		<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/Luminance.png')}/>
		<View style={Theme.Styles.sensorValueCover}>
			<Text style={Theme.Styles.sensorValueText}>
				<FormattedNumber value={value} maximumFractionDigits={0}/>
				{unit}
			</Text>
			<Text style={{color: '#ffffff'}}>
				{label}
			</Text>
		</View>
	</View>
);

const SensorNew = ({ value, unit, label }) => (
	<View style={Theme.Styles.sensorValue}>
		<Image style={Theme.Styles.sensorIcon} source={require('../img/sensorIcons/Luminance.png')}/>
		<View style={Theme.Styles.sensorValueCover}>
			<Text style={Theme.Styles.sensorValueText}>
				<FormattedNumber value={value} maximumFractionDigits={1}/>
				{unit}
			</Text>
			<Text style={{color: '#ffffff'}}>
				{label}
			</Text>
		</View>
	</View>
);

type Props = {
	sensor: Object,
	intl: Object,
	currentTab: string,
	currentScreen: string,
	appLayout: Object,
	isGatewayActive: boolean,
};

type State = {
	currentIndex: number,
}

class SensorRow extends PureComponent<Props, State> {
	props: Props;
	state: State;

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
	labelDewPoint: string;
	labelBarometricPressure: string;
	labelGenricMeter: string;
	labelTimeAgo: string;
	width: number;
	offline: string;
	sensorTypes: Object;
	changeDisplayType: (number) => void;
	LayoutLinear: Object;

	state = {
		currentIndex: 0,
	};

	constructor(props: Props) {
		super(props);
		this.width = 0;
		let { formatMessage } = props.intl;

		this.labelSensor = formatMessage(i18n.labelSensor);
		this.labelHumidity = formatMessage(i18n.labelHumidity);
		this.labelTemperature = formatMessage(i18n.labelTemperature);
		this.labelRainRate = formatMessage(i18n.labelRainRate);
		this.labelRainTotal = formatMessage(i18n.labelRainTotal);
		this.labelWindGust = formatMessage(i18n.labelWindGust);
		this.labelWindAverage = formatMessage(i18n.labelWindAverage);
		this.labelWindDirection = formatMessage(i18n.labelWindDirection);
		this.labelUVIndex = formatMessage(i18n.labelUVIndex);
		this.labelWatt = formatMessage(i18n.labelWatt);
		this.labelLuminance = formatMessage(i18n.labelLuminance);
		this.labelDewPoint = formatMessage(i18n.labelDewPoint);
		this.labelBarometricPressure = formatMessage(i18n.labelBarometricPressure);
		this.labelGenricMeter = formatMessage(i18n.labelGenricMeter);
		this.labelTimeAgo = formatMessage(i18n.labelTimeAgo);

		this.offline = formatMessage(i18n.offline);

		this.sensorTypes = getSensorTypes();

		this.onLayout = this.onLayout.bind(this);
		this.changeDisplayType = this.changeDisplayType.bind(this);

		UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
		this.LayoutLinear = {
			duration: 200,
			create: {
				type: LayoutAnimation.Types.linear,
				property: LayoutAnimation.Properties.opacity,
			  },
			update: {
			  type: LayoutAnimation.Types.linear,
			},
		};
	}

	getSensors(data: Object): Object {
		let sensors = [], sensorInfo = '';
		for (let key in data) {
			let values = data[key];
			let { value, scale, name } = values;
			let sensorType = this.sensorTypes[values.name];
			let sensorUnits = getSensorUnits(sensorType);
			let unit = sensorUnits[scale];

			if (name === 'humidity') {
				sensors.push(<SensorHumidity value={value} unit={unit} key={key} label={'Humidity'}/>);
				sensorInfo = `${sensorInfo}, ${this.labelHumidity} ${value}${unit}`;
			}
			if (name === 'temp') {
				sensors.push(<SensorTemperature value={value} unit={unit} key={key} label={'Temperature'}/>);
				sensorInfo = `${sensorInfo}, ${this.labelTemperature} ${value}${unit}`;
			}
			if (name === 'rrate' || name === 'rtotal') {
				sensors.push(<SensorRain
					name={name}
					value={value}
					unit={unit}
					label={name === 'rrate' ? 'Rain Rate' : 'Rain Total'}
					key={key}/>);
				let rrateInfo = name === 'rrate' ? `${this.labelRainRate} ${value}${unit}` : '';
				let rtotalInfo = name === 'rtotal' ? `${this.labelRainTotal} ${value}${unit}` : '';
				sensorInfo = `${sensorInfo}, ${rrateInfo}, ${rtotalInfo}`;
			}
			if (name === 'wgust' || name === 'wavg' || name === 'wdir') {
				let direction = '', label = name === 'wgust' ? 'Wind Gust' : 'Wind Average';
				if (name === 'wdir') {
					const getWindDirection = sValue => directions[Math.floor(sValue / 22.5)];
					direction = [...getWindDirection(value)].toString();
					value = getWindDirection(value);
					label = 'Wind Direction';
				}
				sensors.push(<SensorWind
					name={name}
					value={value}
					unit={unit}
					label={label}
					key={key}/>);
				let wgustInfo = name === 'wgust' ? `${this.labelWindGust} ${value}${unit}` : '';
				let wavgInfo = name === 'wavg' ? `${this.labelWindAverage} ${value}${unit}` : '';
				let wdirInfo = name === 'wdir' ? `${this.labelWindDirection} ${direction}` : '';
				sensorInfo = `${sensorInfo}, ${wgustInfo}, ${wavgInfo}, ${wdirInfo}`;
			}
			if (name === 'uv') {
				sensors.push(<SensorUV value={value} key={key} unit={unit} label={'UV Index'}/>);
				sensorInfo = `${sensorInfo}, ${this.labelUVIndex} ${value}${unit}`;
			}
			if (name === 'watt') {
				sensors.push(<SensorWatt value={value} key={key} unit={unit} label={'Acc. Power'}/>);
				sensorInfo = `${sensorInfo}, ${this.labelWatt} ${value}${unit}`;
			}
			if (name === 'luminance') {
				sensors.push(<SensorLuminance value={value} key={key} unit={unit} label={'Luminance'}/>);
				sensorInfo = `${sensorInfo}, ${this.labelLuminance} ${value}${unit}`;
			}
			if (name === 'dewp') {
				sensors.push(<SensorNew value={value} key={key} unit={unit} label={'Dew Point'}/>);
				sensorInfo = `${sensorInfo}, ${this.labelDewPoint} ${value}${unit}`;
			}
			if (name === 'barpress') {
				sensors.push(<SensorNew value={value} key={key} unit={unit} label={'Bar Pressure'}/>);
				sensorInfo = `${sensorInfo}, ${this.labelBarometricPressure} ${value}${unit}`;
			}
			if (name === 'genmeter') {
				sensors.push(<SensorNew value={value} key={key} unit={unit} label={'Genric Meter'}/>);
				sensorInfo = `${sensorInfo}, ${this.labelGenricMeter} ${value}${unit}`;
			}
		}
		return {sensors, sensorInfo};
	}

	render() {
		const { sensor, currentTab, currentScreen, appLayout, isGatewayActive } = this.props;
		const styles = this.getStyles(appLayout, isGatewayActive);
		const minutesAgo = Math.round(((Date.now() / 1000) - sensor.lastUpdated) / 60);
		const {
			data,
			name,
		} = sensor;

		let { sensors, sensorInfo } = this.getSensors(data);
		let [ lastUpdatedValue, lastUpdatedComponent ] = this.formatLastUpdated(minutesAgo, sensor.lastUpdated, styles);

		let accessibilityLabel = `${this.labelSensor}, ${name}, ${sensorInfo},${this.labelTimeAgo} ${lastUpdatedValue}`;
		let accessible = currentTab === 'Sensors' && currentScreen === 'Tabs';

		let { currentIndex } = this.state;

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
							{isGatewayActive ?
								lastUpdatedComponent
								:
								<Text style={{color: Theme.Core.rowTextColor}}>
									{this.offline}
								</Text>
							}
						</Text>
					</View>
				</View>
				<TouchableWithoutFeedback onPress={this.changeDisplayType} style={styles.sensorValueCover}>
					<View style={styles.sensorValueCover}>
						{sensors[currentIndex] && (
							sensors[currentIndex]
						)}
					</View>
				</TouchableWithoutFeedback>
			</ListItem>
		);
	}

	changeDisplayType(index: number) {
		let { data } = this.props.sensor;
		let { currentIndex } = this.state;
		let displayTypes = getSupportedDisplayTypes(data);
		let nextIndex = currentIndex + 1;
		nextIndex = nextIndex > (displayTypes.length - 1) ? 0 : nextIndex;
		LayoutAnimation.configureNext(this.LayoutLinear);
		this.setState({
			currentIndex: nextIndex,
		});
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

	getStyles(appLayout: Object, isGatewayActive: boolean): Object {
		let { width } = appLayout;

		let labelBoxWidth = (width - 24) * 0.56;
		let valueBoxWidth = (width - 24) * 0.44;
		let rowHeight = 70;

		let backgroundColor = isGatewayActive ? Theme.Core.brandPrimary : Theme.Core.offlineColor;

		return {
			container: {
				flex: 0,
				backgroundColor: 'transparent',
				width: labelBoxWidth,
				flexDirection: 'row',
				alignItems: 'center',
				marginTop: 5,
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
				height: rowHeight,
				justifyContent: 'space-between',
				paddingLeft: 5,
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
				backgroundColor: backgroundColor,
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
			sensorValueCover: {
				width: valueBoxWidth,
				backgroundColor: backgroundColor,
				height: rowHeight,
				alignItems: 'flex-start',
				justifyContent: 'center',
			},
		};
	}
}

module.exports = SensorRow;
