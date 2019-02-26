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
import GeoPosition from '../Common/GeoPosition';

import i18n from '../../../Translations/common';

type Props = {
	intl: intlShape.isRequired,
	onDidMount: Function,
	actions: Object,
	navigation: Object,
	dispatch: Function,
	appLayout: Object,
	screenReaderEnabled: boolean,
	currentScreen: string,
};

type State = {
	isLoading: boolean,
};

class Position extends View {
	props: Props;
	state: State;

	onSubmit: () => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			isLoading: false,
		};

		let { formatMessage } = props.intl;

		this.h1 = formatMessage(i18n.headerOnePosition);
		this.h2 = formatMessage(i18n.headerTwoPosition);

		this.labelMessageToAnnounce = `${formatMessage(i18n.screen)} ${this.h1}. ${this.h2}`;

		this.infoButton = {
			onPress: this.onInfoPress.bind(this),
		};

		this.onSubmit = this.onSubmit.bind(this);

	}

	componentDidMount() {
		const { h1, h2, infoButton} = this;
		this.props.onDidMount(h1, h2, infoButton);

		let { screenReaderEnabled } = this.props;
		if (screenReaderEnabled) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		let { screenReaderEnabled, currentScreen } = this.props;
		let shouldAnnounce = currentScreen === 'Position' && prevProps.currentScreen !== 'Position';
		if (screenReaderEnabled && shouldAnnounce) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	onInfoPress() {
		this.props.actions.showModal(null, {source: 'Position'});
	}

	onSubmit(latitude: number, longitude: number) {
		this.setState({
			isLoading: true,
		});
		const { navigation, actions } = this.props;
		let clientInfo = navigation.getParam('clientInfo', {});
		clientInfo.coordinates = { latitude, longitude };
		actions.activateGateway(clientInfo)
			.then((response: Object) => {
				navigation.navigate({
					routeName: 'Success',
					key: 'Success',
					params: {clientInfo},
				});
				this.setState({
					isLoading: false,
				});
			}).catch((error: Object) => {
				let message = error.message ? (error.message === 'Network request failed' ? this.networkFailed : error.message) :
					error.error ? error.error : this.unknownError;
				actions.showModal(message);
				this.setState({
					isLoading: false,
				});
			});
	}

	render(): Object {
		return (
			<GeoPosition
				{...this.props}
				isLoading={this.state.isLoading}
				onSubmit={this.onSubmit}
			/>
		);
	}
}

export default Position;
