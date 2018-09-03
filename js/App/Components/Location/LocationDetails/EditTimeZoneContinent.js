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
import { ScrollView, TouchableOpacity } from 'react-native';
import { intlShape } from 'react-intl';
import differenceWith from 'lodash/differenceWith';
import { announceForAccessibility } from 'react-native-accessibility';

import timeZone from '../../../Lib/TimeZone';
import { View, Text } from '../../../../BaseComponents';
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
};

class EditTimeZoneContinent extends View {
	props: Props;

	labelAutodetect: string;
	h1: string;
	h2: string;
	labelMessageToAnnounce: string;

	onContinentChoose: (string) => void;
	onPressAutodetect: () => void;
	onPressAutodetected: () => void;

	constructor(props: Props) {
		super(props);

		let { formatMessage } = props.intl;

		this.h1 = `${formatMessage(commonMessages.headerOneTimeZoneContinent)}`;
		this.h2 = formatMessage(commonMessages.headerTwoTimeZoneContinent);
		this.labelAutodetect = formatMessage(commonMessages.autodetect);

		this.labelMessageToAnnounce = `${formatMessage(i18n.screen)} ${this.h1}. ${this.h2}`;
		this.onSetTimezoneError = `${formatMessage(commonMessages.failureEditTimezone)}, ${formatMessage(i18n.please).toLowerCase()} ${formatMessage(i18n.tryAgain)}.`;

		this.onContinentChoose = this.onContinentChoose.bind(this);
		this.onPressAutodetect = this.onPressAutodetect.bind(this);
		this.onPressAutodetected = this.onPressAutodetected.bind(this);
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
		let shouldAnnounce = currentScreen === 'EditTimeZoneContinent' && prevProps.currentScreen !== 'EditTimeZoneContinent';
		if (screenReaderEnabled && shouldAnnounce) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'EditTimeZoneContinent';
	}

	onContinentChoose(continent: string) {
		const { actions, navigation } = this.props;
		const id = navigation.getParam('id', null);
		if (continent === 'UTC') {
			actions.setTimezone(id, continent).then(() => {
				actions.getGateways();
				navigation.goBack();
			}).catch(() => {
				actions.showModal(this.onSetTimezoneError);
			});
		} else {
			let data = differenceWith(timeZone, [continent], (v1: string, v2: string): boolean => {
				let items = v1.split('/');
				return !(items[0] === v2);
			});
			navigation.navigate({
				routeName: 'EditTimeZoneCity',
				key: 'EditTimeZoneCity',
				params: {
					cities: data, continent, id,
				},
			});
		}
	}

	onPressAutodetect() {
		const { actions, navigation } = this.props;
		const id = navigation.getParam('id', null);
		actions.setTimezone(id, '').then(() => {
			actions.getGateways();
			navigation.goBack();
		}).catch(() => {
			actions.showModal(this.onSetTimezoneError);
		});
	}

	onPressAutodetected() {
		const { actions, navigation } = this.props;
		const autodetectedTimezone = navigation.getParam('autodetectedTimezone', null);
		const id = navigation.getParam('id', null);
		actions.setTimezone(id, autodetectedTimezone).then(() => {
			actions.getGateways();
			navigation.goBack();
		}).catch(() => {
			actions.showModal(this.onSetTimezoneError);
		});
	}

	render(): Object {
		const { appLayout, navigation } = this.props;
		const autodetectedTimezone = navigation.getParam('autodetectedTimezone', null);
		const styles = this.getStyle(appLayout);

		return (
			<ScrollView style={{paddingTop: 20}}>
				<TouchableOpacity onPress={this.onPressAutodetect} style={styles.rowItems}>
					<Text style={styles.text}>
						{this.labelAutodetect}
					</Text>
				</TouchableOpacity>
				{!!autodetectedTimezone && (
					<TouchableOpacity onPress={this.onPressAutodetected} style={styles.rowItems}>
						<Text style={styles.text}>
							{autodetectedTimezone}
						</Text>
					</TouchableOpacity>
				)}
				<ContinentsList
					{...this.props}
					onSubmit={this.onContinentChoose}/>
			</ScrollView>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const fontSize = deviceWidth * 0.035;

		return {
			rowItems: {
				width: width,
				backgroundColor: '#ffffff',
				marginTop: 2,
				justifyContent: 'center',
			},
			text: {
				fontSize,
				marginLeft: 10 + (fontSize * 0.2),
				paddingVertical: 10 + (fontSize * 0.2),
				color: '#A59F9A',
			},
		};
	}
}

export default EditTimeZoneContinent;
