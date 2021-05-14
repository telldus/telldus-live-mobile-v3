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
	useState,
	useCallback,
} from 'react';

import ManualConfigBlock from './ManualConfigBlock';

import i18n from '../../../Translations/common';

type Props = {
	formatMessage: Function,
	number: string,
	value: string,
	size: string,
	onChangeValue: Function,
};

const QueuedManualConfigBlock = memo<Object>((props: Props): Object => {
	const {
		formatMessage,
		number,
		value,
		size,
		onChangeValue,
	} = props;

	const [ inputs, setInputs ] = useState({
		value,
		size,
	});

	const _onChangeValue = useCallback((data: Object) => {
		const {
			inputValueKey,
			hasChanged,
			...others
		} = data;
		const changeItem = others[inputValueKey];
		const updatedInputs = {
			...inputs,
			[inputValueKey]: changeItem,
		};
		onChangeValue({
			number,
			value,
			size,
			hasChanged,
			...updatedInputs,
			type: 'QUEUED_MANUAL',
		});
		setInputs(updatedInputs);
	}, [inputs, onChangeValue, number, value, size]);

	return (
		<>
			<ManualConfigBlock
				label={`${formatMessage(i18n.size)} : `}
				inputValueKey={'size'}
				number={number}
				value={inputs.value}
				size={inputs.size}
				onChangeValue={_onChangeValue}
				resetOnSave={false}/>
			<ManualConfigBlock
				label={`${formatMessage(i18n.labelValue)} : `}
				inputValueKey={'value'}
				number={number}
				value={inputs.value}
				size={inputs.size}
				onChangeValue={_onChangeValue}
				resetOnSave={false}/>
		</>
	);
});

export default (QueuedManualConfigBlock: Object);
