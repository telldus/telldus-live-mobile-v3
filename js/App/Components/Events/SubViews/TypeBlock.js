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

import React, {
	memo,
	useCallback,
} from 'react';

import {
	IconedSelectableBlock,
} from '../../../../BaseComponents';

type Props = {
    onPress: (number) => void,
    h1: string,
    index: number,
    icon: string,
    h2: string,
};

const TypeBlock: Object = memo<Object>((props: Props): Object => {

	const {
		onPress,
		h1,
		index,
		icon,
		h2,
	} = props;

	const _onPress = useCallback(() => {
		if (onPress) {
			onPress(index);
		}
	}, [onPress, index]);

	return (
		<IconedSelectableBlock
			onPress={_onPress}
			h1={h1}
			h2={h2}
			icon={icon}
			enabled
		/>
	);
});

export default TypeBlock;
