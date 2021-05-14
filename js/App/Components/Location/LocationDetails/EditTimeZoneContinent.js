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
import { ScrollView } from 'react-native';
import { intlShape } from 'react-intl';
import differenceWith from 'lodash/differenceWith';
import { announceForAccessibility } from 'react-native-accessibility';

import timeZone from '../../../Lib/TimeZone';
import {
	View,
	Text,
	TouchableOpacity,
} from '../../../../BaseComponents';
import ContinentsList from '../Common/ContinentsList';
import Theme from '../../../Theme';
import capitalize from '../../../Lib/capitalize';

import i18n from '../../../Translations/common';

type Props = {
	navigation: Object,
	onDidMount: Function,
	intl: intlShape.isRequired,
	appLayout: Object,
	screenReaderEnabled: boolean,
	currentScreen: string,
	actions: Object,
	route: Object,

	toggleDialogueBox: (Object) => void,
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

		this.h1 = `${capitalize(formatMessage(i18n.headerOneTimeZoneContinent))}`;
		this.h2 = formatMessage(i18n.headerTwoTimeZoneContinent);
		this.labelAutodetect = formatMessage(i18n.autodetect);

		this.labelMessageToAnnounce = `${formatMessage(i18n.screen)} ${this.h1}. ${this.h2}`;
		this.onSetTimezoneError = `${formatMessage(i18n.failureEditTimezone)}, ${formatMessage(i18n.please).toLowerCase()} ${formatMessage(i18n.tryAgain)}.`;

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
		const { actions, navigation, toggleDialogueBox, route } = this.props;
		const {
			id,
		} = route.params || {};
		if (continent === 'UTC') {
			actions.setTimezone(id, continent).then(() => {
				actions.getGateways();
				navigation.goBack();
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
		} else {
			let data = differenceWith(timeZone, [continent], (v1: string, v2: string): boolean => {
				let items = v1.split('/');
				return !(items[0] === v2);
			});
			navigation.navigate('EditTimeZoneCity',
				{
					cities: data, continent, id,
				});
		}
	}

	onPressAutodetect() {
		const { actions, navigation, toggleDialogueBox, route } = this.props;
		const {
			id,
		} = route.params || {};
		actions.setTimezone(id, '').then(() => {
			actions.getGateways();
			navigation.goBack();
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

	onPressAutodetected() {
		const { actions, navigation, toggleDialogueBox, route } = this.props;
		const {
			id,
			autodetectedTimezone,
		} = route.params || {};
		actions.setTimezone(id, autodetectedTimezone).then(() => {
			actions.getGateways();
			navigation.goBack();
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
		const { appLayout, route } = this.props;
		const {
			autodetectedTimezone,
		} = route.params || {};
		const styles = this.getStyle(appLayout);

		return (
			<ScrollView style={{paddingTop: 20}}>
				<TouchableOpacity
					level={2}
					onPress={this.onPressAutodetect}
					style={styles.rowItems}>
					<Text
						level={25}
						style={styles.text}>
						{this.labelAutodetect}
					</Text>
				</TouchableOpacity>
				{!!autodetectedTimezone && (
					<TouchableOpacity
						level={2}
						onPress={this.onPressAutodetected}
						style={styles.rowItems}>
						<Text
							level={25}
							style={styles.text}>
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

		const {
			fontSizeFactorTen,
		} = Theme.Core;

		const fontSize = deviceWidth * fontSizeFactorTen;

		return {
			rowItems: {
				width: width,
				marginTop: 2,
				justifyContent: 'center',
			},
			text: {
				fontSize,
				marginLeft: 10 + (fontSize * 0.2),
				paddingVertical: 10 + (fontSize * 0.2),
			},
		};
	}
}

export default (EditTimeZoneContinent: Object);
