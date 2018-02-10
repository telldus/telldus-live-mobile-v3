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
import { defineMessages, intlShape } from 'react-intl';
import differenceWith from 'lodash/differenceWith';
import { announceForAccessibility } from 'react-native-accessibility';

import timeZone from '../../../Lib/TimeZone';
import { View } from 'BaseComponents';
import ContinentsList from '../Common/ContinentsList';

import i18n from '../../../Translations/common';
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

type Props = {
	navigation: Object,
	onDidMount: Function,
	intl: intlShape.isRequired,
	appLayout: Object,
	screenReaderEnabled: boolean,
	currentScreen: string,
}

class TimeZoneContinent extends View {
	onContinentChoose:(string) => void;

	props: Props;

	constructor(props: Props) {
		super(props);

		let { formatMessage } = props.intl;

		this.h1 = `3. ${formatMessage(messages.headerOne)}`;
		this.h2 = formatMessage(messages.headerTwo);

		this.labelMessageToAnnounce = `${formatMessage(i18n.screen)} ${this.h1}. ${this.h2}`;

		this.onContinentChoose = this.onContinentChoose.bind(this);
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
		let shouldAnnounce = currentScreen === 'TimeZoneContinent' && this.props.currentScreen !== 'TimeZoneContinent';
		if (screenReaderEnabled && shouldAnnounce) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'TimeZoneContinent';
	}

	onContinentChoose(continent: string) {
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

	render(): Object {
		return (
			<ContinentsList
				{...this.props}
				onSubmit={this.onContinentChoose}/>
		);
	}
}

export default TimeZoneContinent;
