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

'use_strict';

import _ from 'lodash';
import ReactNativePropRegistry from 'react-native/Libraries/Renderer/src/renderers/native/ReactNativePropRegistry';

module.exports = function(incomingProps, defaultProps) {
	// External props has a higher precedence
	let computedProps = {};

	incomingProps = _.clone(incomingProps);
	delete incomingProps.children;

	let incomingPropsStyle = incomingProps.style;
	delete incomingProps.style;

	// console.log(defaultProps, incomingProps);
	if (incomingProps)		{
_.merge(computedProps, defaultProps, incomingProps);
}	else		{
computedProps = defaultProps;
}
	// Pass the merged Style Object instead
	if (incomingPropsStyle) {

		let computedPropsStyle = {};
		computedProps.style = {};
		if (Array.isArray(incomingPropsStyle)) {
			_.forEach(incomingPropsStyle, (style)=>{
				if (typeof style === 'number') {
					_.merge(computedPropsStyle, ReactNativePropRegistry.getByID(style));
				} else {
					_.merge(computedPropsStyle, style);
				}
			});

		}		else {
			if (typeof incomingPropsStyle === 'number') {
				computedPropsStyle = ReactNativePropRegistry.getByID(incomingPropsStyle);
			} else {
				computedPropsStyle = incomingPropsStyle;
			}
		}

		_.merge(computedProps.style, defaultProps.style, computedPropsStyle);


	}
	// console.log("computedProps ", computedProps);
	return computedProps;
};
