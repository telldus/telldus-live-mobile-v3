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
 */

// @flow

'use strict';

import React from 'react';
import { TouchableOpacity } from 'react-native';
import { View, Text, StyleSheet } from '../../../../../BaseComponents';

import i18n from '../../../../Translations/common';

type Props = {
    onPressDim: (number) => void,
	value: number,
	importantForAccessibility?: string,
	intl: Object,
};

class Step extends View {
props: Props;
onPressDim: () => void;

defaultDescriptionButton: string;

constructor(props: Props) {
	super(props);

	this.onPressDim = this.onPressDim.bind(this);

	let { formatMessage } = this.props.intl;
	this.defaultDescriptionButton = formatMessage(i18n.defaultDescriptionButton);
}

onPressDim() {
	let { onPressDim, value } = this.props;
	if (onPressDim) {
		onPressDim(value);
	}
}

render(): Object {
	let { value, importantForAccessibility } = this.props;
	let accessibilityLabel = `${value}%, ${this.defaultDescriptionButton}`;

	return (
		<TouchableOpacity onPress={this.onPressDim} style={styles.button}
			accessibilityLabel={accessibilityLabel} importantForAccessibility={importantForAccessibility}>
			<Text style={styles.value}>
				{`${value}%`}
			</Text>
		</TouchableOpacity>
	);
}
}

const styles = StyleSheet.create({
	button: {
		borderRadius: 2,
		backgroundColor: '#e26901',
		marginVertical: 5,
		marginHorizontal: 5,
	},
	value: {
		color: '#fff',
		fontSize: 15,
		marginVertical: 10,
		marginHorizontal: 10,
	},
});

export default Step;
