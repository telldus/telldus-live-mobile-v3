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
 */

// @flow

'use strict';

import React, { PureComponent } from 'react';
import { Platform } from 'react-native';
import { intlShape, defineMessages } from 'react-intl';

import { View, Text, IconTelldus, StyleSheet } from '../../../../BaseComponents';
import Theme from '../../../Theme';

const messages = defineMessages({
	wizardOneTitle36: {
		id: 'changeLog36.wizardOne.title',
		defaultMessage: 'Add and edit schedules',
	},
	wizardOneDescription36: {
		id: 'changeLog6.wizardOne.description',
		defaultMessage: 'You are now able to add and edit schedules for your devices directly in the app!',
	},
	WizardTwoTitle36: {
		id: 'changeLog36.WizardTwo.title',
		defaultMessage: 'Location details',
	},
	WizardTwoDescription36: {
		id: 'changeLog36.WizardTwo.description',
		defaultMessage: 'We\'ve also added functionality to edit your location details, such as name, time zone and position.',
	},
	wizardThreeTitle36: {
		id: 'changeLog36.wizardThree.title',
		defaultMessage: 'Updated design',
	},
	wizardThreeDescription36: {
		id: 'changeLog36.wizardThree.description',
		defaultMessage: 'The design of the dashboard, device list and sensor list has been updated to make the ' +
		'interface more clear. The active state has a colored background and a white icon to be easily distinguishable.',
	},
	WizardFourTitle36: {
		id: 'changeLog36.WizardFour.title',
		defaultMessage: 'Swipe to see more',
	},
	WizardFourDescription36: {
		id: 'changeLog36.WizardFour.description',
		defaultMessage: 'To add devices or sensors to the dashboard or hide it from the list, swipe it to the left ' +
		'and then tap the icons. it\'s also here you can access device settings, including overview, history and settings.',
	},
});

type Props = {
	intl: intlShape,
	currentScreen: string,
	animatedX: Object,
	animatedOpacity: Object,
};

export default class WizardOne extends PureComponent<Props, null> {
	props: Props;

	titleWOne: string;
	descriptionWOne: string;

	titleWTwo: string;
	descriptionWTwo: string;

	titleWThree: string;
	descriptionWThree: string;

	titleWFour: string;
	descriptionWFour: string;

	titleWFive: string;
	descriptionWFive: string;

	constructor(props: Props) {
		super(props);
		let { formatMessage } = props.intl;

		this.titleWOne = formatMessage(messages.wizardOneTitle36);
		this.descriptionWOne = formatMessage(messages.wizardOneDescription36);

		this.titleWTwo = formatMessage(messages.WizardTwoTitle36);
		this.descriptionWTwo = formatMessage(messages.WizardTwoDescription36);

		this.titleWThree = formatMessage(messages.wizardThreeTitle36);
		this.descriptionWThree = formatMessage(messages.wizardThreeDescription36);

		this.titleWFour = formatMessage(messages.WizardFourTitle36);
		this.descriptionWFour = formatMessage(messages.WizardFourDescription36);
	}

	getScreenData(currentScreen: string): Object {
		let icon = null, iconTwo = null, iconThree = null, iconSize = 100, iconTwoSize = 100, iconThreeSize = 100,
			title = '', description = '';
		switch (currentScreen) {
			case 'WizardOne':
				icon = 'time';
				title = this.titleWOne;
				description = this.descriptionWOne;
				return { icon, iconSize, iconTwoSize, iconThreeSize, title, description };
			case 'WizardTwo':
				icon = 'location';
				title = this.titleWTwo;
				description = this.descriptionWTwo;
				return { icon, iconSize, iconTwoSize, iconThreeSize, title, description };
			case 'WizardThree':
				icon = 'buttononoff';
				iconSize = 110;
				title = this.titleWThree;
				description = this.descriptionWThree;
				return { icon, iconSize, iconTwoSize, iconThreeSize, title, description };
			case 'WizardFour':
				icon = 'hidden';
				iconTwo = 'favorite-outline';
				iconTwoSize = 70;
				iconThree = 'settings';
				iconThreeSize = 70;
				title = this.titleWFour;
				description = this.descriptionWFour;
				return { icon, iconTwo, iconSize, iconTwoSize, iconThreeSize, iconThree, title, description };
			default:
				icon = 'time';
				title = this.titleWOne;
				description = this.descriptionWOne;
				return { icon, iconSize, iconTwoSize, iconThreeSize, title, description };
		}
	}

	render(): Object {
		const { currentScreen, animatedX, animatedOpacity } = this.props;
		const { icon, iconTwo, iconThree, iconSize, iconTwoSize, iconThreeSize,
			title, description } = this.getScreenData(currentScreen);
		// IconTelldus, on setting different font sizes causing alignment issue. So, handling with negative margin.
		return (
			<View style={[styles.container, {opacity: animatedOpacity, transform: [{
				translateX: animatedX,
			}]}]}>
				<View style={{flexDirection: 'row', justifyContent: 'center', marginLeft: iconTwo ? -16 : 0}}>
					{icon && <IconTelldus icon={icon} style={styles.icon} size={iconSize}/>}
					{iconTwo && <IconTelldus icon={iconTwo} style={styles.iconTwo} size={iconTwoSize}/>}
					{iconThree && <IconTelldus icon={iconThree} style={styles.iconThree} size={iconThreeSize}/>}
				</View>
				<Text style={styles.title}>
					{title}
				</Text>
				<Text style={styles.description}>
					{description}
				</Text>
			</View>
		);
	}
}
const styles = StyleSheet.create({
	icon: {
		color: Theme.Core.brandSecondary,
		textAlign: 'center',
	},
	// IconTelldus, on setting different font sizes causing alignment issue. So, handling with margin.
	iconTwo: {
		color: Theme.Core.brandSecondary,
		textAlignVertical: 'center',
		marginTop: Platform.OS === 'ios' ? 10 : 0,
		textAlign: 'center',
	},
	// IconTelldus, on setting different font sizes causing alignment issue. So, handling with margin.
	iconThree: {
		color: Theme.Core.brandSecondary,
		textAlignVertical: 'center',
		marginTop: Platform.OS === 'ios' ? 10 : 0,
		marginLeft: 12,
		textAlign: 'center',
	},
	container: {
		...Theme.Core.shadow,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 15,
		paddingVertical: 15,
		marginHorizontal: 10,
		marginVertical: 10,
	},
	title: {
		fontSize: 20,
		color: '#00000090',
		textAlign: 'center',
		marginVertical: 10,
	},
	description: {
		fontSize: 14,
		color: '#00000080',
		textAlign: 'left',
	},
});

