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

import { Button, Container, I18n, Icon, List, ListDataSource, ListItem, Text, View } from 'BaseComponents';
import { getSensors } from 'Actions';

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
				rightOpenValue = {-72}
				onRefresh = {() =>
					this.props.dispatch(getSensors())
				}
			/>
		);
	}

	_renderHiddenRow(data) {
		return (
			<View style={Theme.Styles.rowBack}>
				<Text style={Theme.Styles.rowBackButton}>Dashboard</Text>
			</View>
		)
	}

	_renderSectionHeader(sectionData, sectionId) {
		const gateway = this.props.gateways.find((gateway) => gateway.id === sectionId);
		return (
			<View style = { Theme.Styles.sectionHeader }>
				<Text style = { Theme.Styles.sectionHeaderText }>
					{gateway.name}
				</Text>
			</View>
		)
	}

	_renderRow(item) {
		const minutesAgo =  Math.round(((Date.now() / 1000) - item.lastUpdated) / 60);
		return (
			<ListItem style = { Theme.Styles.rowFront }>
				<Container style = {{ marginLeft: 16 }}>
					<Text style = {{
						color: Theme.Core.brandPrimary,
						fontSize: 16,
						opacity: item.name !== '' ? 1 : 0.5
					}}>
						{item.name !== '' ? item.name : '(no name)'}
					</Text>
					<Text style = {{
						color: minutesAgo < 1440 ? '#999999' : '#990000',
						fontSize: 12,
						opacity: minutesAgo < 1440 ? 1 : 0.5
					}}>
						{this._formatLastUpdated(minutesAgo, item.lastUpdated)}
					</Text>
				</Container>
			</ListItem>
		)
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

function _parseDataIntoItemsAndSectionIds(data) {
	var items = {};
	var sectionIds = [];
	if (data) {
		data.map((item) => {
			var sectionId = item.clientId ? item.clientId : '';
			if (sectionIds.indexOf(sectionId) === -1) {
				sectionIds.push(sectionId);
				items[sectionId] = [];
			}
			items[sectionId].push(item);
		});
	}
	return {items, sectionIds};
}

function select(store) {
	var {items, sectionIds} = _parseDataIntoItemsAndSectionIds(store.sensors || [])
	return {
		dataSource: dataSource.cloneWithRowsAndSections(items, sectionIds),
		gateways: store.gateways
	};
}

module.exports = connect(select)(SensorsTab);
