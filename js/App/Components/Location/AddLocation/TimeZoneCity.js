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
import { announceForAccessibility } from 'react-native-accessibility';

import { View } from '../../../../BaseComponents';
import CitiesList from '../Common/CitiesList';

import i18n from '../../../Translations/common';

type Props = {
	navigation: Object,
	intl: intlShape.isRequired,
	onDidMount: Function,
	appLayout: Object,
	screenReaderEnabled: boolean,
	currentScreen: string,
	route: Object,
};

class TimeZoneCity extends View {
	onCityChoose: () => void;

	props: Props;

	constructor(props: Props) {
		super(props);
		this.onCityChoose = this.onCityChoose.bind(this);

		let { formatMessage } = props.intl;

		this.h1 = formatMessage(i18n.headerOneTimeZoneCity);
		this.h2 = formatMessage(i18n.headerTwoTimeZoneCity);

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

	componentDidUpdate(prevProps: Object, prevState: Object) {
		let { screenReaderEnabled, currentScreen } = this.props;
		let shouldAnnounce = currentScreen === 'TimeZoneCity' && prevProps.currentScreen !== 'TimeZoneCity';
		if (screenReaderEnabled && shouldAnnounce) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'TimeZoneCity';
	}

	onCityChoose(city: string) {
		const { navigation, route } = this.props;
		let { clientInfo } = route.params || {};
		clientInfo.timezone = `${clientInfo.continent}/${city}`;
		clientInfo.autoDetected = false;
		navigation.navigate('TimeZone', {clientInfo});
	}

	render(): Object {
		return (
			<CitiesList
				{...this.props}
				onSubmit={this.onCityChoose}/>
		);
	}
}

export default TimeZoneCity;
