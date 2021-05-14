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

import React, { Component } from 'react';
import {
	Dimensions,
} from 'react-native';
import Text from './Text';
import Theme from '../App/Theme';

const deviceWidth = Dimensions.get('window').width;

import {
	prepareRootPropsText,
} from './prepareRootProps';

import {
	withTheme,
	PropsThemedComponent,
} from '../App/Components/HOC/withTheme';

type DefaultProps = {
	accessible: boolean,
	importantForAccessibility: string,
};

type Props = {
	icon?: string,
	size?: number,
	color?: string,
	style?: Array<any> | Object,
	accessible?: boolean,
	importantForAccessibility: string,
	level?: number,
};

type PropsThemedIconTelldusComponent = Props & PropsThemedComponent;

const prepareIncomingStyle = (incomingStyle: Object | Array<any>, {color, size}: Object): Object | Array<any> => {
	let incomingStyleUpdated = incomingStyle;
	if (Array.isArray(incomingStyle)) {
		if (color) {
			incomingStyleUpdated = [
				{color}, // $FlowFixMe
				...incomingStyleUpdated, // color in 'style' has higher priority
			];
		}
		if (size) {
			incomingStyleUpdated = [
				{fontSize: size}, // $FlowFixMe
				...incomingStyleUpdated, // size in 'style' has higher priority
			];
		}
	} else {
		if (color) {
			incomingStyleUpdated = {
				color, // $FlowFixMe
				...incomingStyleUpdated, // color in 'style' has higher priority
			};
		}
		if (size) {
			incomingStyleUpdated = {
				fontSize: size, // $FlowFixMe
				...incomingStyleUpdated, // size in 'style' has higher priority
			};
		}
	}
	return incomingStyleUpdated;
};

class IconTelldus extends Component<PropsThemedIconTelldusComponent, null> {
	props: PropsThemedIconTelldusComponent;

	static defaultProps: DefaultProps = {
		accessible: true,
		importantForAccessibility: 'yes',
	};

	render(): Object {
		const {
			icon,
			style: incomingStyle = {},
			size,
			color,
			...others
		} = this.props;



		const props = prepareRootPropsText({
			...others,
			style: prepareIncomingStyle(incomingStyle, {
				size,
				color,
			}),
		}, {
			style: Array.isArray(incomingStyle) ?
				[
					{
						fontFamily: Theme.Core.fonts.telldusIconFont,
						fontSize: deviceWidth * Theme.Core.fontSizeFactorFour,
					},
				] :
				{
					fontFamily: Theme.Core.fonts.telldusIconFont,
					fontSize: deviceWidth * Theme.Core.fontSizeFactorFour,
				},
		});

		return (
			<Text
				{...props}
				allowFontScaling={false}>
				{icon}
			</Text>
		);
	}
}

export default (withTheme(IconTelldus): Object);
