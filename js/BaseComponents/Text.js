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
import { Text } from 'react-native';
import Base from './Base';

import {
	withTheme,
	PropsThemedComponent,
} from '../App/Components/HOC/withTheme';

import {
	prepareRootPropsText,
} from './prepareRootProps';

import Theme from '../App/Theme';

type Props = {
	children: Object,
	level?: number,
	style?: Object | Array<Object>,
};

type PropsThemedTextComponent = Props & PropsThemedComponent;

class TextComponent extends Base {
	props: PropsThemedTextComponent;
	render(): React$Element<any> {
		const {
			children,
			...others
		} = this.props;
		const props = prepareRootPropsText(others, {
			style: Array.isArray(others.style) ?
				[
					{
						fontFamily: Theme.Core.fonts.suisseIntlRegular,
					},
				] :
				{
					fontFamily: Theme.Core.fonts.suisseIntlRegular,
				},
		});

		return (
			<Text
				{...props}
				allowFontScaling={false}
			>{children}</Text>
		);
	}

}

export default (withTheme(TextComponent): Object);
