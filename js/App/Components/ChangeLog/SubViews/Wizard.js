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
import { intlShape, defineMessages } from 'react-intl';

import { View, Text, IconTelldus } from '../../../../BaseComponents';

const messages = defineMessages({
	wizardOneTitle: {
		id: 'changeLog.wizardOne.title',
		defaultMessage: 'Create account to get started',
	},
	wizardOneDescription: {
		id: 'changeLog.wizardOne.description',
		defaultMessage: 'If you don\'t have an account already you can now do that in the app ' +
		'without the need of a computer.',
	},
	WizardTwoTitle: {
		id: 'changeLog.WizardTwo.title',
		defaultMessage: 'Add your location right here in the app',
	},
	WizardTwoDescription: {
		id: 'changeLog.WizardTwo.description',
		defaultMessage: 'In this version we have also added the functionality to add your location directly in ' +
		'the app. This is done in a step-by-step wizard for easy setup.',
	},
	wizardThreeTitle: {
		id: 'changeLog.wizardThree.title',
		defaultMessage: 'Updated device details and device history',
	},
	wizardThreeDescription: {
		id: 'changeLog.wizardThree.description',
		defaultMessage: 'Click on a device to see extended information and history for that device. You ' +
		'can see what location it is connected to and when it was controlled and from what platform.',
	},
	WizardFourTitle: {
		id: 'changeLog.WizardFour.title',
		defaultMessage: 'Dim your device by holding and dragging',
	},
	WizardFourDescription: {
		id: 'changeLog.WizardFour.description',
		defaultMessage: 'You can easily dim your dimmable devices directly from the device list by holding ' +
		'and dragging the action button up or down. Drag up to dim up and down to dim to a lower value.',
	},
	wizardFiveTitle: {
		id: 'changeLog.wizardFive.title',
		defaultMessage: 'Support for multiple languages',
	},
	wizardFiveDescription: {
		id: 'changeLog.wizardFive.description',
		defaultMessage: 'Enjoy the app in your native language! The language in the app is detected ' +
		'automatically based on the selected language on your device.',
	},
});

type Props = {
	intl: intlShape,
	styles: Object,
	currentScreen: string,
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

		this.titleWOne = formatMessage(messages.wizardOneTitle);
		this.descriptionWOne = formatMessage(messages.wizardOneDescription);

		this.titleWTwo = formatMessage(messages.WizardTwoTitle);
		this.descriptionWTwo = formatMessage(messages.WizardTwoDescription);

		this.titleWThree = formatMessage(messages.wizardThreeTitle);
		this.descriptionWThree = formatMessage(messages.wizardThreeDescription);

		this.titleWFour = formatMessage(messages.WizardFourTitle);
		this.descriptionWFour = formatMessage(messages.WizardFourDescription);

		this.titleWFive = formatMessage(messages.wizardFiveTitle);
		this.descriptionWFive = formatMessage(messages.wizardFiveDescription);
	}

	getScreenData(currentScreen: string): Object {
		let icon = '', title = '', description = '';
		switch (currentScreen) {
			case 'WizardOne':
				icon = 'security';
				title = this.titleWOne;
				description = this.descriptionWOne;
				return { icon, title, description };
			case 'WizardTwo':
				icon = 'location';
				title = this.titleWTwo;
				description = this.descriptionWTwo;
				return { icon, title, description };
			case 'WizardThree':
				icon = 'device-alt-solid';
				title = this.titleWThree;
				description = this.descriptionWThree;
				return { icon, title, description };
			case 'WizardFour':
				icon = 'dim-assist';
				title = this.titleWFour;
				description = this.descriptionWFour;
				return { icon, title, description };
			case 'WizardFive':
				icon = 'language';
				title = this.titleWFive;
				description = this.descriptionWFive;
				return { icon, title, description };
			default:
				icon = 'security';
				title = this.titleWOne;
				description = this.descriptionWOne;
				return { icon, title, description };
		}
	}

	render(): Object {
		const { styles, currentScreen } = this.props;
		const { icon, title, description } = this.getScreenData(currentScreen);

		return (
			<View style={styles.container}>
				<IconTelldus icon={icon} style={styles.icon}/>
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

