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

'use strict';

import React from 'react';
import { connect } from 'react-redux';

import { Button, Container, FormattedNumber, I18n, Icon, Image, List, ListDataSource, ListItem, Text, View } from 'BaseComponents';
import { getSensors } from 'Actions';
import { TouchableHighlight } from 'react-native';
import SensorDetailView from '../DetailViews/SensorDetailView'

import type { Tab } from '../reducers/navigation';

import format from 'date-format';
import Theme from 'Theme';

class SensorsTab extends View {

	render() {
		return (
			<List
				dataSource = {this.props.dataSource}
				renderHiddenRow = {this._renderHiddenRow.bind(this)}
				renderRow = {this._renderRow.bind(this)}
				renderSectionHeader = {this._renderSectionHeader.bind(this)}
				rightOpenValue = {-40}
				onRefresh = {() =>
					this.props.dispatch(getSensors())
				}
			/>
		);
	}

	_renderHiddenRow(data) {
		return (
			<View style={Theme.Styles.rowBack}>
				{/*<Text style={Theme.Styles.rowBackButton}>Dashboard</Text>*/}
				{/*<Icon.Button name="star" backgroundColor="#3b5998" />*/}
				<TouchableHighlight style={Theme.Styles.rowBackButton}>
					<Icon name="star" size={26} color="yellow"/>
				</TouchableHighlight>
			</View>
		)
	}

	_renderSectionHeader(sectionData, sectionId) {
		const gateway = this.props.gateways.find((gateway) => gateway.id === sectionId);
		return (
			<View style = { Theme.Styles.sectionHeader }>
				<Text style = { Theme.Styles.sectionHeaderText }>
					{(gateway && gateway.name) ? gateway.name : ''}
				</Text>
			</View>
		)
	}

	_renderRow(item) {
		const minutesAgo =  Math.round(((Date.now() / 1000) - item.lastUpdated) / 60);
		try {
			return (
				<ListItem style = { Theme.Styles.rowFront }>
					<View>
						<Text style = {{
							color: 'rgba(0,0,0,0.87)',
							fontSize: 16,
							opacity: item.name ? 1 : 0.5,
							marginBottom: 2
						}}>
							{item.name ? item.name : '(no name)'}
						</Text>
						<Text style = {{
							color: minutesAgo < 1440 ? 'rgba(0,0,0,0.71)' : '#990000',
							fontSize: 12,
							opacity: minutesAgo < 1440 ? 1 : 0.5
						}}>
							{this._formatLastUpdated(minutesAgo, item.lastUpdated)}
						</Text>
					</View>
					{ item.humidity ? (
						<View style={Theme.Styles.sensorValue}>
							<Image source={require('./img/sensorIcons/Humidity.png')} />
							<Text>
								<FormattedNumber value = {item.humidity / 100} formatStyle = 'percent' />
							</Text>
						</View>
					) : null }

					{ item.temperature ? (
						<View style={Theme.Styles.sensorValue}>
							<Image source={require('./img/sensorIcons/Temperature.png')} />
							<Text>
								<FormattedNumber value = {item.temperature} maximumFractionDigits = {1} />
								{String.fromCharCode(176) + 'C'}
							</Text>
						</View>
					) : null }

					{ item.rainRate || item.rainTotal ? (
						<View style={Theme.Styles.sensorValue}>
							<Image source={require('./img/sensorIcons/Rain.png')} />
							<Text>
								{ item.rainRate && ( <Text><FormattedNumber value = {item.rainRate} maximumFractionDigits = {0} /> {'mm/h\n'} </Text> ) }
								{ item.rainTotal && ( <Text><FormattedNumber value = {item.rainTotal} maximumFractionDigits = {0} /> {'mm'} </Text> ) }
							</Text>
						</View>
					) : null }

					{ item.windGust || item.windAverage || item.windDirection ? (
						<View style={Theme.Styles.sensorValue}>
							<Image source={require('./img/sensorIcons/Wind.png')} />
							<Text>
								{ item.windAverage && ( <Text><FormattedNumber value = {item.windAverage} maximumFractionDigits = {1} /> {'m/s\n'} </Text> ) }
								{ item.windGust && ( <Text><FormattedNumber value = {item.windGust} maximumFractionDigits = {1} /> {'m/s*\n'} </Text> ) }
								{ item.windDirection && ( <Text>{this._windDirection(item.windDirection)}</Text> ) }
							</Text>
						</View>
					) : null }

					{ item.uv ? (
						<View style={Theme.Styles.sensorValue}>
							<Image source={require('./img/sensorIcons/UV.png')} />
							<FormattedNumber value = {item.uv} maximumFractionDigits = {0} />
						</View>
					) : null }

					{ item.watt ? (
						<View style={Theme.Styles.sensorValue}>
							<Image source={require('./img/sensorIcons/Watt.png')} />
							<Text>
								<FormattedNumber value = {item.watt} maximumFractionDigits = {1} />
								{'W'}
							</Text>
						</View>
					) : null }

					{ item.luminance ? (
						<View style={Theme.Styles.sensorValue}>
							<Image source={require('./img/sensorIcons/Luminance.png')} />
							<Text>
								<FormattedNumber value = {item.luminance} maximumFractionDigits = {0} />
								{'lx'}
							</Text>
						</View>
					) : null }
				</ListItem>
			)
		} catch(e) {
			console.log(e);
			return ( <View /> )
		}
	}

	_windDirection(value) {
		const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'];
		return directions[Math.floor(value / 22.5)]
	}

	_formatLastUpdated(minutes, lastUpdated) {
		if (minutes === 0) {
			return 'Just now';
		}
		if (minutes === 1) {
			return '1 minute ago';
		}
		if (minutes < 60) {
			return `${minutes} minutes ago`;
		}
		var hours = Math.round(minutes / 60);
		if (hours === 1) {
			return '1 hour ago';
		}
		if (hours < 24) {
			return `${hours} hours ago`;
		}
		var days = Math.round(minutes / 60 / 24);
		if (days == 1) {
			return '1 day ago';
		}
		if (days <= 7) {
			return `${days} days ago`;
		}
		return format.asString('yyyy-MM-dd', new Date(lastUpdated * 1000));
	}
}

SensorsTab.propTypes = {
	dataSource: React.PropTypes.object,
};

const dataSource = new ListDataSource({
	rowHasChanged: (r1, r2) => r1 !== r2,
	sectionHeaderHasChanged : (s1, s2) => s1 !== s2
});

function _parseDataIntoItemsAndSectionIds(sensors, gateways) {
	var items = {};
	var sectionIds = [];
	if (sensors) {
		sensors.map((item) => {
			var sectionId = item.clientId ? item.clientId : '';
			if (sectionIds.indexOf(sectionId) === -1) {
				sectionIds.push(sectionId);
				items[sectionId] = [];
			}
			items[sectionId].push(item);
		});
	}
	sectionIds.sort((a,b) => {
		try {
			const gatewayA = gateways.find((gateway) => gateway.id === a);
			const gatewayB = gateways.find((gateway) => gateway.id === b);
			if (gatewayA.name < gatewayB.name) {
				return -1;
			}
			if (gatewayA.name > gatewayB.name) {
				return 1;
			}
			return 0;
		} catch (e) {
			return 0;
		}
	});
	return {items, sectionIds};
}

function select(store) {
	var {items, sectionIds} = _parseDataIntoItemsAndSectionIds(store.sensors || [], store.gateways || [])
	return {
		dataSource: dataSource.cloneWithRowsAndSections(items, sectionIds),
		gateways: store.gateways
	};
}

module.exports = connect(select)(SensorsTab);
