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
import { Text, View } from '../../../../BaseComponents';
import Theme from '../../../Theme';

import {
	withTheme,
	PropsThemedComponent,
} from '../../HOC/withTheme';

type Props = PropsThemedComponent & {
	children: string,
	style?: Object,
	color?: string,
	appLayout: Object,
};

class Title extends View<Props, null> {

	render(): React$Element<any> {
		const { children, style, appLayout, ...props } = this.props;
		const defaultStyle = this._getDefaultStyle(appLayout);

		return (
			<Text {...props} style={[defaultStyle, style]}>
				{children}
			</Text>
		);
	}

	_getDefaultStyle = (appLayout: Object): Object => {
		const { height, width } = appLayout;
		const isPortrait = height > width;

		const {
			colors,
			color,
		} = this.props;

		const deviceWidth = isPortrait ? width : height;
		return {
			color: color || colors.inAppBrandSecondary,
			fontFamily: Theme.Core.fonts.robotoRegular,
			fontSize: deviceWidth * 0.053333333,
			marginBottom: deviceWidth * 0.008,
		};
	};

}

export default withTheme(Title);
