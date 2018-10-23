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
import { Keyboard } from 'react-native';
import { intlShape } from 'react-intl';
import { announceForAccessibility } from 'react-native-accessibility';

import { View } from '../../../../BaseComponents';
import Name from '../Common/Name';

import i18n from '../../../Translations/common';

type Props = {
	navigation: Object,
	intl: intlShape.isRequired,
	onDidMount: Function,
	actions: Object,
	appLayout: Object,
	screenReaderEnabled: boolean,
	currentScreen: string,
};

class LocationName extends View {
	props: Props;

	onNameSubmit: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
			isLoading: false,
		};

		let { formatMessage } = props.intl;

		this.h1 = `2. ${formatMessage(i18n.name)}`;
		this.h2 = formatMessage(i18n.LNheaderTwo);

		this.unknownError = `${formatMessage(i18n.unknownError)}.`;
		this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;

		this.labelMessageToAnnounce = `${formatMessage(i18n.screen)} ${this.h1}. ${this.h2}`;

		this.onNameSubmit = this.onNameSubmit.bind(this);
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
		let shouldAnnounce = currentScreen === 'LocationName' && prevProps.currentScreen !== 'LocationName';
		if (screenReaderEnabled && shouldAnnounce) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'LocationName';
	}

	onNameSubmit(locationName: string) {
		const { navigation, intl, actions } = this.props;
		if (locationName !== '') {
			Keyboard.dismiss();
			let clientInfo = navigation.getParam('clientInfo', {});
			clientInfo.name = locationName;
			this.props.navigation.navigate({
				routeName: 'TimeZone',
				key: 'TimeZone',
				params: {clientInfo},
			});
		} else {
			let message = intl.formatMessage(i18n.invalidLocationName);
			actions.showModal(message);
		}
	}

	render(): Object {
		return (
			<Name
				{...this.props}
				isLoading={this.state.isLoading}
				onSubmit={this.onNameSubmit}/>
		);
	}
}

export default LocationName;
