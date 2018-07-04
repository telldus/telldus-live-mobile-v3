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
import GeoPosition from '../Common/GeoPosition';
import { googleMapsAPIKey } from '../../../../Config';

import i18n from '../../../Translations/common';
import { messages as commonMessages } from '../Common/messages';

type Props = {
	intl: intlShape.isRequired,
	onDidMount: Function,
	actions: Object,
	navigation: Object,
	appLayout: Object,
	screenReaderEnabled: boolean,
	currentScreen: string,
};

type State = {
	isLoading: boolean,
	latitude: number,
	longitude: number,
	latitudeDelta: number,
	longitudeDelta: number,
};

class EditGeoPosition extends View {
	props: Props;
	state: State;

	onSubmit: () => void;

	constructor(props: Props) {
		super(props);
		const { navigation } = this.props;
		const longitude = navigation.getParam('longitude', null);
		const latitude = navigation.getParam('latitude', null);

		this.state = {
			isLoading: false,
			latitude,
			longitude,
			latitudeDelta: 0.74442,
			longitudeDelta: 0.74442,
		};

		let { formatMessage } = props.intl;

		this.h1 = `${formatMessage(commonMessages.headerOnePosition)}`;
		this.h2 = formatMessage(commonMessages.headerTwoPosition);

		this.labelMessageToAnnounce = `${formatMessage(i18n.screen)} ${this.h1}. ${this.h2}`;
		this.onSetGeoPositionError = `${formatMessage(commonMessages.failureEditGeoPosition)}, ${formatMessage(i18n.please).toLowerCase()} ${formatMessage(i18n.tryAgain)}.`;

		this.onSubmit = this.onSubmit.bind(this);
		this.getGeoCodeInfo(latitude, longitude);
	}

	componentDidMount() {
		const { h1, h2} = this;
		this.props.onDidMount(h1, h2);

		let { screenReaderEnabled } = this.props;
		if (screenReaderEnabled) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	getDeltas(viewport: Object): Object {
		let { northeast, southwest } = viewport;
		let longitudeDelta = northeast.lng - southwest.lng, latitudeDelta = northeast.lat - southwest.lat;
		return {longitudeDelta, latitudeDelta};
	}

	getGeoCodeInfo(lat: number, lng: number) {
		let latitude = parseFloat(lat).toFixed(7);
		let latitude1 = parseFloat(latitude);
		let longitude = parseFloat(lng).toFixed(7);
		let longitude1 = parseFloat(longitude);
		this.props.actions.getGeoCodeInfoUsingLatLng(latitude1, longitude1, googleMapsAPIKey).then((response: Object) => {
			if (response.status && response.status === 'OK' && response.results[0]) {
				let { viewport } = response.results[0].geometry;
				let { longitudeDelta, latitudeDelta } = this.getDeltas(viewport);
				this.setState({
					latitudeDelta,
					longitudeDelta,
				});
			}
		});
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		let { screenReaderEnabled, currentScreen } = this.props;
		let shouldAnnounce = currentScreen === 'EditGeoPosition' && prevProps.currentScreen !== 'EditGeoPosition';
		if (screenReaderEnabled && shouldAnnounce) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	onSubmit(latitude: number, longitude: number) {
		if (this.state.isKeyboardShown) {
			Keyboard.dismiss();
		}
		this.setState({
			isLoading: true,
		});
		const { actions, navigation } = this.props;
		const id = navigation.getParam('id', null);
		actions.setCoordinates(id, longitude, latitude).then((res: Object) => {
			this.setState({
				isLoading: false,
			});
			actions.getGateways();
			navigation.goBack();
		}).catch(() => {
			this.setState({
				isLoading: false,
			});
			actions.showModal(this.onSetGeoPositionError);
		});
	}

	render(): Object {
		const {
			latitude,
			longitude,
			latitudeDelta,
			longitudeDelta,
		} = this.state;

		const region = {
			latitude,
			longitude,
			latitudeDelta,
			longitudeDelta,
		};

		return (
			<GeoPosition
				{...this.props}
				region={region}
				{...region}
				isLoading={this.state.isLoading}
				onSubmit={this.onSubmit}/>
		);
	}
}

export default EditGeoPosition;
