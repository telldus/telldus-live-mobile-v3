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
import { View } from 'BaseComponents';
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
	actions: Object,
}

class EditTimeZoneContinent extends View {
	onContinentChoose:(string) => void;

	props: Props;

	constructor(props: Props) {
		super(props);

		let { formatMessage } = props.intl;

		this.h1 = `${formatMessage(commonMessages.headerOneTimeZoneContinent)}`;
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

	componentWillReceiveProps(nextProps: Object) {
		let { screenReaderEnabled, currentScreen } = nextProps;
		let shouldAnnounce = currentScreen === 'EditTimeZoneContinent' && this.props.currentScreen !== 'EditTimeZoneContinent';
		if (screenReaderEnabled && shouldAnnounce) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'EditTimeZoneContinent';
	}

	onContinentChoose(continent: string) {
		let { actions, navigation } = this.props;
		if (continent === 'UTC') {
			actions.setTimezone(navigation.state.params.id, continent).then(() => {
				actions.getGateways();
				navigation.goBack();
			}).catch(() => {
				actions.showModal('Error setting time zone');
			});
		} else {
			let data = differenceWith(timeZone, [continent], (v1, v2) => {
				let items = v1.split('/');
				let flag = items[0] === v2 ? false : true;
				return flag;
			});
			navigation.navigate('EditTimeZoneCity', {cities: data, continent, id: navigation.state.params.id});
		}
	}

	render() {
		return (
			<ContinentsList
				{...this.props}
				onSubmit={this.onContinentChoose}/>
		);
	}
}

export default EditTimeZoneContinent;
