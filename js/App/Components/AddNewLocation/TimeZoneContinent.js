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
import uniqBy from 'lodash/uniqBy';
import differenceWith from 'lodash/differenceWith';

import StackScreenContainer from 'StackScreenContainer';
import Banner from './Banner';
import timeZone from '../../Lib/TimeZone';
import {View, List, ListDataSource} from 'BaseComponents';
import ListRow from './ListRow';


const messages = defineMessages({
	banner: {
		id: 'addNewLocation.timeZone.banner',
		defaultMessage: 'Time Zone',
		description: 'Main Banner Text for the Select Continent Screen',
	},
	bannerSub: {
		id: 'addNewLocation.timeZoneContinent.bannerSub',
		defaultMessage: 'Select Continent',
		description: 'Secondary Banner Text for the Select Continent Screen',
	},
});

const listDataSource = new ListDataSource({
	rowHasChanged: (r1, r2) => r1 !== r2,
});

type Props = {
	navigation: Object,
}

class TimeZoneContinent extends View {
	renderRow:(string) => void;
	onContinentChoose:(string) => void;

	props: Props;

	constructor(props: Props) {
		super(props);
		this.state = {
			dataSource: listDataSource.cloneWithRows(this.parseDataForList(timeZone)),
		};
		this.renderRow = this.renderRow.bind(this);
		this.onContinentChoose = this.onContinentChoose.bind(this);
	}

	parseDataForList(data) {
		return uniqBy(data, value => {
			let items = value.split('/');
			return items[0];
		});
	}

	onContinentChoose(continent) {
		let data = differenceWith(timeZone, [continent], (v1, v2) => {
			let items = v1.split('/');
			let flag = items[0] === v2 ? false : true;
			return flag;
		});
		let clientInfo = this.props.navigation.state.params.clientInfo;
		clientInfo.continent = continent;
		this.props.navigation.navigate('TimeZoneCity', {cities: data, clientInfo});
	}

	renderRow(item) {
		item = item.split('/');
		item = item[0];
		return (
			<ListRow item={item} onPress={this.onContinentChoose}/>
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
				<List
					contentContainerStyle={{paddingTop: 20, justifyContent: 'center'}}
					dataSource={this.state.dataSource}
					renderRow={this.renderRow}
				/>
			</StackScreenContainer>
		);
	}
}

export default connect()(TimeZoneContinent);
