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
import computeProps from './computeProps';

import {
	withTheme,
	PropsThemedComponent,
} from '../App/Components/HOC/withTheme';

type Props = {
	children: Object,
	level?: number,
};

type PropsThemedTextComponent = Props & PropsThemedComponent;

class TextComponent extends Base {
	props: PropsThemedTextComponent;

	prepareRootProps = (): Object => {

		let type = {
			color: this.getTextColor(),
			backgroundColor: 'transparent',
			fontSize: this.getTheme().fontSizeBase,
		};

		let defaultProps = {
			style: type,
		};

		if (this.props.style && Array.isArray(this.props.style)) {
			defaultProps = {
				style: [type],
			};
		}

		return computeProps(this.props, defaultProps);

	}

	getTextColor = (): ?string => {
		const {
			level,
			colors,
		} = this.props;
		if (!level) {
			return;
		}
		switch (level) {
			case 1: {
				return colors.text;
			}
			case 2: {
				return colors.textTwo;
			}
			case 3: {
				return colors.textThree;
			}
			case 4: {
				return colors.textFour;
			}
			case 5: {
				return colors.textFive;
			}
			default:
				return;
		}
	}

	render(): React$Element<any> {
		return (
			<Text
				{...this.prepareRootProps()}
				allowFontScaling={false}
			>{this.props.children}</Text>
		);
	}

}

export default withTheme(TextComponent);
