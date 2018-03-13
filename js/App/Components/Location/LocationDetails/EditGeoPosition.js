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
};

class EditGeoPosition extends View {
	props: Props;
	state: State;

	onSubmit: () => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			isLoading: false,
		};

		let { formatMessage } = props.intl;

		this.h1 = `${formatMessage(commonMessages.headerOnePosition)}`;
		this.h2 = formatMessage(commonMessages.headerTwoPosition);

		this.labelMessageToAnnounce = `${formatMessage(i18n.screen)} ${this.h1}. ${this.h2}`;
		this.onSetGeoPositionError = `${formatMessage(commonMessages.failureEditGeoPosition)}, ${formatMessage(i18n.please).toLowerCase()} ${formatMessage(i18n.tryAgain)}.`;

		this.onSubmit = this.onSubmit.bind(this);
	}

	componentDidMount() {
		const { h1, h2} = this;
		this.props.onDidMount(h1, h2);

		let { screenReaderEnabled } = this.props;
		if (screenReaderEnabled) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	componentWillReceiveProps(nextProps: Object) {
		let { screenReaderEnabled, currentScreen } = nextProps;
		let shouldAnnounce = currentScreen === 'EditGeoPosition' && this.props.currentScreen !== 'EditGeoPosition';
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
		let { actions, navigation } = this.props;
		actions.setCoordinates(navigation.state.params.id, latitude, longitude).then((res: Object) => {
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
		return (
			<GeoPosition
				{...this.props}
				isLoading={this.state.isLoading}
				onSubmit={this.onSubmit}/>
		);
	}
}

export default EditGeoPosition;
