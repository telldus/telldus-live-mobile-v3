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

import capitalize from '../../../Lib/capitalize';

import i18n from '../../../Translations/common';

type Props = {
	navigation: Object,
	activateGateway: (clientInfo: Object) => void,
	intl: intlShape.isRequired,
	onDidMount: Function,
	appLayout: Object,
	screenReaderEnabled: boolean,
	currentScreen: string,
	actions: Object,
	route: Object,

	toggleDialogueBox: (Object) => void,
};

class EditTimeZoneCity extends View {
	renderRow: (string) => void;
	parseDataForList: (string) => void;
	onCityChoose: () => void;

	props: Props;

	constructor(props: Props) {
		super(props);
		this.onCityChoose = this.onCityChoose.bind(this);

		let { formatMessage } = props.intl;

		this.h1 = `${capitalize(formatMessage(i18n.headerOneTimeZoneCity))}`;
		this.h2 = formatMessage(i18n.headerTwoTimeZoneCity);

		this.labelMessageToAnnounce = `${formatMessage(i18n.screen)} ${this.h1}. ${this.h2}`;
		this.onSetTimezoneError = `${formatMessage(i18n.failureEditTimezone)}, ${formatMessage(i18n.please).toLowerCase()} ${formatMessage(i18n.tryAgain)}.`;
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
		let shouldAnnounce = currentScreen === 'EditTimeZoneCity' && prevProps.currentScreen !== 'EditTimeZoneCity';
		if (screenReaderEnabled && shouldAnnounce) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'EditTimeZoneCity';
	}

	onCityChoose(city: string) {
		const { navigation, actions, toggleDialogueBox, route } = this.props;
		const {
			id,
			continent,
		} = route.params || {};
		const timezone = `${continent}/${city}`;
		actions.setTimezone(id, timezone).then(() => {
			actions.getGateways();
			navigation.popToTop();
		}).catch(() => {
			toggleDialogueBox({
				show: true,
				showHeader: true,
				text: this.onSetTimezoneError,
				dialogueContainerStyle: {elevation: 0},
				showPositive: true,
				showNegative: false,
				closeOnPressPositive: true,
			});
		});
	}

	render(): Object {
		return (
			<CitiesList
				{...this.props}
				onSubmit={this.onCityChoose}/>
		);
	}
}

export default (EditTimeZoneCity: Object);
