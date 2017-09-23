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

import Banner from './Banner';
import {View, List, ListDataSource, Text, ScreenContainer} from 'BaseComponents';
import ListRow from './ListRow';

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
	closeModal: () => void;

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
		let clientInfo = this.props.navigation.state.params.clientInfo;
		clientInfo.timezone = `${clientInfo.continent}/${city}`;
		this.props.navigation.navigate('TimeZone', {clientInfo});
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
			<ScreenContainer banner={BannerComponent}>
				{this.state.dataSource ?
					<List
						contentContainerStyle={{paddingTop: 20, justifyContent: 'center'}}
						dataSource={this.state.dataSource}
						renderRow={this.renderRow}
					/>
					:
					<Text> UTC </Text>
				}
			</ScreenContainer>
		);
	}
}

export default connect()(TimeZoneCity);
