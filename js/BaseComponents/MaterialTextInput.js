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

import React from 'react';

import {
	TextField,
} from 'react-native-material-textfield';

import Theme from '../App/Theme';

const MaterialTextInput = (props: Object = {}): Object => {
	const {
		containerStyle,
		renderLeftAccessory,
		...others
	} = props;

	function _renderLeftAccessory(): Function | Object | null {
		if (typeof renderLeftAccessory === 'function') {
			return renderLeftAccessory();
		} else if (React.isValidElement(renderLeftAccessory)) {
			return renderLeftAccessory;
		}
		return null;
	}

	const {
		containerStyleDef,
	} = getStyles();

	return (
		<TextField
			{...others}
			containerStyle={[containerStyleDef, containerStyle]}
			renderLeftAccessory={_renderLeftAccessory}/>
	);
};

const {
	inputBaseColor,
} = Theme.Core;

MaterialTextInput.defaultProps = {
	baseColor: inputBaseColor,
	tintColor: inputBaseColor,
	contentInset: {
		top: 0,
		left: 0,
		right: 0,
		label: 4,
		input: 8,
	},
};

const getStyles = (): Object => {
	return {
		containerStyleDef: {
			width: '100%',
		},
	};
};

export default MaterialTextInput;
