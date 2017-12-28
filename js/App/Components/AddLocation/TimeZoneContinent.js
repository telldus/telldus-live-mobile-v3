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
import { defineMessages, intlShape } from 'react-intl';
import uniqBy from 'lodash/uniqBy';
import differenceWith from 'lodash/differenceWith';

import timeZone from '../../Lib/TimeZone';
import {View, List, ListDataSource} from 'BaseComponents';
import { ListRow } from 'AddNewLocation_SubViews';


const messages = defineMessages({
	headerOne: {
		id: 'addNewLocation.timeZoneContinent.headerOne',
		defaultMessage: 'Time Zone',
		description: 'Main header for the Select Continent Screen',
	},
	headerTwo: {
		id: 'addNewLocation.timeZoneContinent.headerTwo',
		defaultMessage: 'Select Continent',
		description: 'Secondary header for the Select Continent Screen',
	},
});

const listDataSource = new ListDataSource({
	rowHasChanged: (r1, r2) => r1 !== r2,
});

type Props = {
	navigation: Object,
	onDidMount: Function,
	intl: intlShape.isRequired,
	appLayout: Object,
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

		this.h1 = `3. ${props.intl.formatMessage(messages.headerOne)}`;
		this.h2 = props.intl.formatMessage(messages.headerTwo);

		this.renderRow = this.renderRow.bind(this);
		this.onContinentChoose = this.onContinentChoose.bind(this);
	}

	componentDidMount() {
		const { h1, h2 } = this;
		this.props.onDidMount(h1, h2);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'TimeZoneContinent';
	}

	parseDataForList(data) {
		return uniqBy(data, value => {
			let items = value.split('/');
			return items[0];
		});
	}

	onContinentChoose(continent) {
		let clientInfo = this.props.navigation.state.params.clientInfo;
		if (continent === 'UTC') {
			clientInfo.timezone = continent;
			this.props.navigation.navigate('Position', {clientInfo});
		} else {
			let data = differenceWith(timeZone, [continent], (v1, v2) => {
				let items = v1.split('/');
				let flag = items[0] === v2 ? false : true;
				return flag;
			});
			clientInfo.continent = continent;
			this.props.navigation.navigate('TimeZoneCity', {cities: data, clientInfo});
		}
	}

	renderRow(item) {
		item = item.split('/');
		item = item[0];
		return (
			<ListRow item={item} onPress={this.onContinentChoose} appLayout={this.props.appLayout}/>
		);
	}

	render() {

		return (
			<View style={{flex: 1}}>
				<List
					contentContainerStyle={{paddingTop: 20, justifyContent: 'center'}}
					dataSource={this.state.dataSource}
					renderRow={this.renderRow}
					key={this.props.appLayout.width}
				/>
			</View>
		);
	}
}

export default connect()(TimeZoneContinent);
