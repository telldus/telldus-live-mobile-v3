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

import React, {
	useCallback,
} from 'react';

import {
	View,
	Text,
	RippleButton,
} from '../../../../BaseComponents';

type Props = {
};

const ThemesRow = (props: Props): Object => {
	const {
		style,
		item,
		textStyle,
		boxSize,
		onValueChange,
	} = props;

	const _onValueChange = useCallback(() => {
		onValueChange(item);
	}, [item, onValueChange]);

	return (
		<RippleButton
			onPress={_onValueChange}
			style={[...style, {
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				width: '100%',
			}]}>
			<Text style={textStyle}>
				{item.value}
			</Text>
			<View style={{
				flex: 1,
				flexDirection: 'row',
				justifyContent: 'flex-end',
				alignItems: 'center',
			}}>
				{item.shades.map((s: string): Object => {
					return (
						<View style={{
							backgroundColor: s,
							height: boxSize,
							width: boxSize,
							borderRadius: 5,
							marginLeft: 5,
						}}/>
					);
				})
				}
			</View>
		</RippleButton>
	);
};

export default React.memo<Object>(ThemesRow);
