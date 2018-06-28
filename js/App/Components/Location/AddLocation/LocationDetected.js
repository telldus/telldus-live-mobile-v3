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
import {ScrollView} from 'react-native';
import { defineMessages, intlShape } from 'react-intl';
import { announceForAccessibility } from 'react-native-accessibility';

import { View, TouchableButton } from '../../../../BaseComponents';
import { Clients } from './SubViews';

import i18n from '../../../Translations/common';
const messages = defineMessages({
	headerOne: {
		id: 'addNewLocation.locationDetected.headerOne',
		defaultMessage: 'Select Location',
		description: 'Main header Text for the Location Detected Screen',
	},
	headerTwo: {
		id: 'addNewLocation.locationDetected.headerTwo',
		defaultMessage: 'Setup your TellStick to start',
		description: 'Seconday header Text for the Location Detected Screen',
	},
});

type Props = {
	navigation: Object,
	intl: intlShape.isRequired,
	rootNavigator: Object,
	onDidMount: Function,
	appLayout: Object,
	screenReaderEnabled: boolean,
	currentScreen: string,
	paddingHorizontal: number,
};

class LocationDetected extends View {
	props: Props;

	onActivateAuto: (Object) => void;
	onActivateManual: () => void;

	constructor(props: Props) {
		super(props);

		let { formatMessage } = props.intl;

		this.h1 = `1. ${formatMessage(messages.headerOne)}`;
		this.h2 = formatMessage(messages.headerTwo);
		this.buttonLabel = formatMessage(i18n.manualActivation).toUpperCase();

		this.labelMessageToAnnounce = `${formatMessage(i18n.screen)} ${this.h1}. ${this.h2}`;

		this.onActivateAuto = this.onActivateAuto.bind(this);
		this.onActivateManual = this.onActivateManual.bind(this);
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
		let shouldAnnounce = currentScreen === 'LocationDetected' && prevProps.currentScreen !== 'LocationDetected';
		if (screenReaderEnabled && shouldAnnounce) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'LocationDetected';
	}

	onActivateAuto(client: Object) {
		let clientInfo = {
			clientId: client.id,
			uuid: client.uuid,
			type: client.type,
			timezone: client.timezone,
			autoDetected: client.timezoneAutodetected,
		};
		this.props.navigation.push('LocationName', {clientInfo});
	}

	onActivateManual() {
		this.props.navigation.push('LocationActivationManual');
	}

	renderClient(client: Object, i: number, appLayout: Object): Object {
		return (
			<Clients key={i} client={client} appLayout={appLayout} onPress={this.onActivateAuto} intl={this.props.intl}/>
		);
	}

	render(): Object {
		let items = [];
		let { rootNavigator, appLayout, paddingHorizontal } = this.props;

		const styles = this.getStyle(appLayout, paddingHorizontal);

		if (rootNavigator.state.params.clients) {
			items = rootNavigator.state.params.clients.map((client: Object, i: number): Object => {
				return this.renderClient(client, i, appLayout);
			});
		}

		return (
			<View style={styles.container}>
				<ScrollView contentContainerStyle={styles.itemsContainer}>
					{items}
					<TouchableButton
						style={styles.button}
						onPress={this.onActivateManual}
						text={this.buttonLabel}
						accessible={true}
					/>
				</ScrollView>
			</View>
		);
	}

	getStyle(appLayout: Object, padding: number): Object {

		return {
			container: {
				flex: 1,
				marginVertical: padding,
			},
			itemsContainer: {
				justifyContent: 'center',
			},
			button: {
				alignSelf: 'center',
			},
		};
	}
}

export default LocationDetected;

