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

import computeProps from './computeProps';


const prepareRootPropsView = (props: Object = {}, defaultPropsAdditional?: Object = {}): Object => {
	const backgroundColor = getBGColor(props);
	let defaultProps = {
		style: {
			backgroundColor,
		},
		...defaultPropsAdditional,
	};
	if (!props.style) {
		defaultProps = {
			style: {
				flex: 1,
				backgroundColor,
			},
		};
	} else if (Array.isArray(props.style)) {
		defaultProps = {
			style: [{
				backgroundColor,
			}],
		};
	}

	return computeProps(props, defaultProps);

};

const getBGColor = (props: Object): ?string => {
	const {
		level,
		colors,
	} = props;

	if (!level) {
		return 'transparent';
	}
	switch (level) {
		case 1: {
			return colors.background;
		}
		case 2: {
			return colors.card;
		}
		case 3: {
			return colors.screenBackground;
		}
		default:
			return 'transparent';
	}
};


module.exports = {
	prepareRootPropsView,
};
