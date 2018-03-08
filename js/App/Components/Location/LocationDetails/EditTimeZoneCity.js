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
import { messages as commonMessages } from '../Common/messages';

type Props = {
	navigation: Object,
	activateGateway: (clientInfo: Object) => void,
	intl: intlShape.isRequired,
	onDidMount: Function,
	appLayout: Object,
	screenReaderEnabled: boolean,
	currentScreen: string,
	actions: Object,
};

class EditTimeZoneCity extends View {
	renderRow:(string) => void;
	parseDataForList:(string) => void;
	onCityChoose: () => void;

	props: Props;

	constructor(props: Props) {
		super(props);
		this.onCityChoose = this.onCityChoose.bind(this);

		let { formatMessage } = props.intl;

		this.h1 = `${formatMessage(commonMessages.headerOneTimeZoneCity)}`;
		this.h2 = formatMessage(commonMessages.headerTwoTimeZoneCity);

		this.labelMessageToAnnounce = `${formatMessage(i18n.screen)} ${this.h1}. ${this.h2}`;
		this.onSetTimezoneError = `${formatMessage(commonMessages.failureEditTimezone)}, ${formatMessage(i18n.please).toLowerCase()} ${formatMessage(i18n.tryAgain)}.`;
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
		let shouldAnnounce = currentScreen === 'EditTimeZoneCity' && this.props.currentScreen !== 'EditTimeZoneCity';
		if (screenReaderEnabled && shouldAnnounce) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'EditTimeZoneCity';
	}

	onCityChoose(city: string) {
		let { navigation, actions } = this.props;
		let continent = navigation.state.params.continent;
		let timezone = `${continent}/${city}`;
		actions.setTimezone(navigation.state.params.id, timezone).then(() => {
			actions.getGateways();
			navigation.navigate('Details');
		}).catch(() => {
			actions.showModal(this.onSetTimezoneError);
		});
	}

	render() {
		return (
			<CitiesList
				{...this.props}
				onSubmit={this.onCityChoose}/>
		);
	}
}

export default EditTimeZoneCity;
