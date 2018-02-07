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

import { View, Text, IconTelldus } from 'BaseComponents';

const messages = defineMessages({
	title: {
		id: 'changeLog.wizardOne.title',
		defaultMessage: 'Create account to get started',
	},
	description: {
		id: 'changeLog.wizardOne.description',
		defaultMessage: 'If you don\'t have an account already you can now do that in the app ' +
		'without the need of a computer.',
	},
});

type Props = {
	intl: intlShape,
	styles: Object,
};

export default class WizardOne extends PureComponent<Props, null> {
	props: Props;

	constructor(props: Props) {
		super(props);
		let { formatMessage } = props.intl;

		this.title = formatMessage(messages.title);
		this.description = formatMessage(messages.description);
	}

	componentDidMount() {
		let { onDidMount } = this.props;
		onDidMount('WizardTwo');
	}

	render(): Object {
		let { styles } = this.props;
		return (
			<View style={styles.container}>
				<IconTelldus icon="security" style={styles.icon}/>
				<Text style={styles.title}>
					{this.title}
				</Text>
				<Text style={styles.description}>
					{this.description}
				</Text>
			</View>
		);
	}
}

