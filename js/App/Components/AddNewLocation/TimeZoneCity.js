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
 *
 */

// @flow

'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { defineMessages } from 'react-intl';

import StackScreenContainer from 'StackScreenContainer';
import Banner from './Banner';
import {View, List, ListDataSource, Text} from 'BaseComponents';
import ListRow from './ListRow';

import {activateGateway} from 'Actions';

const messages = defineMessages({
	banner: {
		id: 'addNewLocation.timeZone.banner',
		defaultMessage: 'Time Zone',
		description: 'Main Banner Text for the Select City Screen',
	},
	bannerSub: {
		id: 'addNewLocation.timeZoneCity.bannerSub',
		defaultMessage: 'Select City',
		description: 'Secondary Banner Text for the Select City Screen',
	},
});

type Props = {
	navigation: Object,
	activateGateway: (clientInfo: Object) => void;
}
const listDataSource = new ListDataSource({
	rowHasChanged: (r1, r2) => r1 !== r2,
});

class TimeZoneCity extends View {
	renderRow:(string) => void;
	parseDataForList:(string) => void;
	onCityChoose: () => void;

	props: Props;

	constructor(props: Props) {
		super(props);
		this.state = {
			dataSource: this.parseDataForList(props.navigation.state.params.cities),
		};
		this.renderRow = this.renderRow.bind(this);
		this.parseDataForList = this.parseDataForList.bind(this);
		this.onCityChoose = this.onCityChoose.bind(this);
	}

	parseDataForList(data) {
		let dataSource = false;
		if (data.length === 1 && data[0] === 'UTC') {
			dataSource = false;
		} else {
			dataSource = listDataSource.cloneWithRows(data);
		}
		return dataSource;
	}

	onCityChoose(city) {
		let navigation = this.props.navigation;
		let clientInfo = {
			clientId: navigation.state.params.clientInfo.clientId,
			uuid: navigation.state.params.clientInfo.uuid,
			name: navigation.state.params.clientInfo.name,
			timezone: `${navigation.state.params.clientInfo.continent}/${city}`,
		};
		this.props.activateGateway(clientInfo);
	}

	renderRow(item) {
		item = item.split('/');
		item = item[1];
		return (
			<ListRow item={item} onPress={this.onCityChoose}/>
		);
	}

	render() {
		let bannerProps = {
			prefix: '3. ',
			bannerMain: messages.banner,
			bannerSub: messages.bannerSub,
		};
		let BannerComponent = Banner(bannerProps);
		return (
			<StackScreenContainer banner={BannerComponent}>
				{this.state.dataSource ?
					<List
						contentContainerStyle={{ marginTop: 20}}
						dataSource={this.state.dataSource}
						renderRow={this.renderRow}
					/>
					:
					<Text> UTC </Text>
				}
			</StackScreenContainer>
		);
	}
}

function mapDispatchToProps(dispatch, store) {
	return {
		activateGateway: (clientInfo) => dispatch(activateGateway(clientInfo)),
	};
}

export default connect(null, mapDispatchToProps)(TimeZoneCity);
