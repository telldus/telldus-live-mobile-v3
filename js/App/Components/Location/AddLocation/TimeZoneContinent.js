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
import { intlShape } from 'react-intl';
import differenceWith from 'lodash/differenceWith';
import { announceForAccessibility } from 'react-native-accessibility';

import timeZone from '../../../Lib/TimeZone';
import { View } from '../../../../BaseComponents';
import ContinentsList from '../Common/ContinentsList';

import i18n from '../../../Translations/common';
import { messages as commonMessages } from '../Common/messages';

type Props = {
	navigation: Object,
	onDidMount: Function,
	intl: intlShape.isRequired,
	appLayout: Object,
	screenReaderEnabled: boolean,
	currentScreen: string,
};

class TimeZoneContinent extends View {
	onContinentChoose: (string) => void;

	props: Props;

	constructor(props: Props) {
		super(props);

		let { formatMessage } = props.intl;

		this.h1 = `3. ${formatMessage(commonMessages.headerOneTimeZoneContinent)}`;
		this.h2 = formatMessage(commonMessages.headerTwoTimeZoneContinent);

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

	componentDidUpdate(prevProps: Object, prevState: Object) {
		let { screenReaderEnabled, currentScreen } = this.props;
		let shouldAnnounce = currentScreen === 'TimeZoneContinent' && prevProps.currentScreen !== 'TimeZoneContinent';
		if (screenReaderEnabled && shouldAnnounce) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'TimeZoneContinent';
	}

	onContinentChoose(continent: string) {
		const { navigation } = this.props;
		let clientInfo = navigation.getParam('clientInfo', {});
		if (continent === 'UTC') {
			clientInfo.timezone = continent;
			navigation.navigate({
				routeName: 'Position',
				key: 'Position',
				params: {clientInfo},
			});
		} else {
			let data = differenceWith(timeZone, [continent], (v1: string, v2: string): boolean => {
				let items = v1.split('/');
				return !(items[0] === v2);
			});
			clientInfo.continent = continent;
			navigation.navigate({
				routeName: 'TimeZoneCity',
				key: 'TimeZoneCity',
				params: {
					clientInfo,
					cities: data,
				},
			});
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
