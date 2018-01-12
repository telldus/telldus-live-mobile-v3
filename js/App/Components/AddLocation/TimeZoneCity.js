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
import { announceForAccessibility } from 'react-native-accessibility';

import {View, List, ListDataSource} from 'BaseComponents';
import { ListRow } from 'AddNewLocation_SubViews';

import i18n from '../../Translations/common';
const messages = defineMessages({
	headerOne: {
		id: 'addNewLocation.timeZoneCity.headerOne',
		defaultMessage: 'Time Zone',
		description: 'Main header for the Select City Screen',
	},
	headerTwo: {
		id: 'addNewLocation.timeZoneCity.headerTwo',
		defaultMessage: 'Select City',
		description: 'Secondary header for the Select City Screen',
	},
});

type Props = {
	navigation: Object,
	activateGateway: (clientInfo: Object) => void,
	intl: intlShape.isRequired,
	onDidMount: Function,
	appLayout: Object,
	screenReaderEnabled: boolean,
	currentScreen: string,
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

		let { formatMessage } = props.intl;

		this.h1 = `3. ${formatMessage(messages.headerOne)}`;
		this.h2 = formatMessage(messages.headerTwo);

		this.labelMessageToAnnounce = `${formatMessage(i18n.screen)} ${this.h1}. ${this.h2}`;
	}

	componentDidMount() {
		const { h1, h2 } = this;
		this.props.onDidMount(h1, h2);

		let { screenReaderEnabled } = this.props;
		if (screenReaderEnabled) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	componentWillReceiveProps(nextProps: Object) {
		let { screenReaderEnabled, currentScreen } = nextProps;
		let shouldAnnounce = currentScreen === 'TimeZoneCity' && this.props.currentScreen !== 'TimeZoneCity';
		if (screenReaderEnabled && shouldAnnounce) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'TimeZoneCity';
	}

	parseDataForList(data) {
		return listDataSource.cloneWithRows(data);
	}

	onCityChoose(city) {
		let clientInfo = this.props.navigation.state.params.clientInfo;
		clientInfo.timezone = `${clientInfo.continent}/${city}`;
		clientInfo.autoDetected = false;
		this.props.navigation.navigate('TimeZone', {clientInfo});
	}

	renderRow(item) {
		item = item.split('/');
		item = item[1];
		return (
			<ListRow item={item} appLayout={this.props.appLayout} onPress={this.onCityChoose}/>
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

export default connect()(TimeZoneCity);
