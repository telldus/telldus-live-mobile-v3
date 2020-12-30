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
	memo,
	useCallback,
} from 'react';

import {
	TitledInfoBlock,
} from '../../../../BaseComponents';

type Props = {
    onPress: Function,
    description: string,
    blockContainerStyle: Object,
	id: number,
	group: string,
	minRepeatInterval: number,
	active: boolean,
};

const EventRow = memo<Object>((props: Props): Object => {
	const {
		description,
		onPress,
		blockContainerStyle,
		id,
		group,
		minRepeatInterval,
		active,
	} = props;

	const onPressPushSettings = useCallback(() => {
		onPress({
			id,
			description,
			group,
			minRepeatInterval,
			active,
		});
	}, [onPress, id, description, group, minRepeatInterval, active]);

	return (
		<TitledInfoBlock
			label={description}
			icon={'angle-right'}
			onPress={onPressPushSettings}
			blockContainerStyle={blockContainerStyle}
		/>
	);
});

export default EventRow;
