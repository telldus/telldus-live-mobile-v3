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

import { View } from '../../../../../BaseComponents';
import Theme from '../../../../Theme';
import i18n from '../../../../Translations/common';

import {
	withTheme,
	PropsThemedComponent,
} from '../../../HOC/withTheme';

type Props = PropsThemedComponent & {
	onPress: () => void,
	intl: Object,
	name: string,
	style: Object | Array<any>,
	dotStyle: Array<any> | Object,
	dBTileDisplayMode?: string,
};

class ShowMoreButton extends View<Props, null> {
props: Props;

onPress: () => void;

constructor(props: Props) {
	super(props);

	this.onPress = this.onPress.bind(this);

	let { formatMessage } = this.props.intl;
	this.labelShowMore = formatMessage(i18n.moreMethods);
	this.labelButton = formatMessage(i18n.button);
	this.defaultDescriptionButton = formatMessage(i18n.defaultDescriptionButton);
}

onPress() {
	let { onPress } = this.props;
	if (onPress) {
		onPress();
	}
}

render(): Object {
	const { name, style, dotStyle } = this.props;
	const accessibilityLabel = `${this.labelShowMore} ${this.labelButton}, ${name}. ${this.defaultDescriptionButton}`;

	const styles = this.getStyles();

	return (
		<TouchableOpacity style={[styles.moreButtonsCover, style]} onPress={this.onPress} accessibilityLabel={accessibilityLabel}>
			<View
				level={15}
				style={[styles.moreButtons, dotStyle]}/>
			<View
				level={15}
				style={[styles.moreButtons, {marginHorizontal: 5}, dotStyle]}/>
			<View
				level={15}
				style={[styles.moreButtons, dotStyle]}/>
		</TouchableOpacity>
	);
}
getStyles = (): Object => {
	const {
		colorOnInActiveBg,
		buttonSeparatorColor,
	} = this.props.colors;

	return {
		moreButtonsCover: {
			flexDirection: 'row',
			width: Theme.Core.buttonWidth,
			height: Theme.Core.rowHeight,
			justifyContent: 'center',
			alignItems: 'center',
			borderLeftWidth: 1,
			borderLeftColor: buttonSeparatorColor,
			backgroundColor: colorOnInActiveBg,
		},
		moreButtons: {
			height: 6,
			width: 6,
			borderRadius: 3,
		},
	};
}

}

export default (withTheme(ShowMoreButton): Object);
