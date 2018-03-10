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
import PropTypes from 'prop-types';
import { View } from '../../../../BaseComponents';

type Props = {
	children: string,
	style?: Object,
	appLayout: Object,
};

export default class TextRowWrapper extends View<null, Props, null> {

	static propTypes = {
		children: PropTypes.node.isRequired,
		style: PropTypes.object,
	};

	render(): React$Element<any> {
		const { children, style, appLayout } = this.props;
		const defaultStyle = this._getDefaultStyle(appLayout);

		return (
			<View style={[defaultStyle, style]}>
				{children}
			</View>
		);
	}

	_getDefaultStyle = (appLayout: Object): Object => {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		return {
			justifyContent: 'center',
			backgroundColor: 'transparent',
			alignItems: 'flex-start',
			width: deviceWidth * 0.586666667,
			paddingLeft: deviceWidth * 0.101333333,
			paddingRight: 10,
			paddingVertical: 5,
		};
	};

}
