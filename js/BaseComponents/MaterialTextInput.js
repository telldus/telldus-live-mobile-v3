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

function getFontSize(style: Object | Array<Object>): ?number {
	if (!style) {
		return undefined;
	}
	if (style.fontSize && typeof style.fontSize === 'number') {
		return style.fontSize;
	}
	let fs;
	if (Array.isArray(style)) {
		style.forEach((s: Object) => {
			if (s && s.fontSize) {
				fs = s.fontSize;
			}
		});
	}
	return fs;
}

const MaterialTextInput = (props: Object = {}): Object => {
	const {
		containerStyle,
		renderLeftAccessory,
		setRef,
		style,
		fontSize,
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

	const _fontSize = fontSize || getFontSize(style);

	const {
		containerStyleDef,
	} = getStyles();

	return (
		<TextField
			{...others}
			style={style}
			fontSize={_fontSize}
			containerStyle={[containerStyleDef, containerStyle]}
			renderLeftAccessory={_renderLeftAccessory}
			ref={setRef}/>
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

export default (React.memo<Object>(MaterialTextInput): Object);
