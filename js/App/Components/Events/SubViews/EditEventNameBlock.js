
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

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import {
	SettingsRow,
	View,
} from '../../../../BaseComponents';

import {
	eventSetName,
} from '../../../Actions/Event';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

function usePrevious(value: string): ?string {
	const ref = useRef();
	useEffect(() => {
	  ref.current = value;
	});
	return ref.current;
}

const EditEventNameBlock = (props: Object): Object => {
	const {
		description,
		toggleDialogueBox,
	} = props;
	const [ inLineEditActive, setInLineEditActive ] = useState(false);

	const intl = useIntl();
	const { formatMessage } = intl;

	const { layout } = useSelector((state: Object): Object => state.app);

	const [ nameEditValue, setNameEditValue ] = useState(description);
	const prevNameEditValue = usePrevious(description);
	useEffect(() => {
		if (prevNameEditValue !== description) {
			setNameEditValue(description);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [description]);

	const dispatch = useDispatch();
	const setEventNameConfirm = useCallback(() => {
		if (!nameEditValue || nameEditValue.trim() === '') {
			toggleDialogueBox({
				show: true,
				showHeader: true,
				text: formatMessage(i18n.errorNameFieldEmpty),
				showPositive: true,
				onPressPositive: () => {
					toggleDialogueBox({
						show: false,
					});
				},
			});
			return;
		}
		dispatch(eventSetName(nameEditValue));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [nameEditValue]);

	const toggleEdit = useCallback(() => {
		if (inLineEditActive) {
			setEventNameConfirm();
		}
		setInLineEditActive(!inLineEditActive);
	}, [inLineEditActive, setEventNameConfirm]);

	const onDoneEdit = useCallback(() => {
		setInLineEditActive(false);
		setEventNameConfirm();
	}, [setEventNameConfirm]);

	const onChangeText = useCallback((text: string) => {
		setNameEditValue(text);
	}, []);

	const {
		iconValueRightSize,
		containerStyle,
	} = getStyle(layout);

	return (
		<View
			style={containerStyle}>
			<SettingsRow
				type={'text'}
				edit={false}
				inLineEditActive={inLineEditActive}
				label={formatMessage(i18n.name)}
				value={nameEditValue}
				appLayout={layout}
				iconValueRight={inLineEditActive ? 'done' : 'edit'}
				onPress={false}
				iconValueRightSize={inLineEditActive ? iconValueRightSize : null}
				onPressIconValueRight={toggleEdit}
				onChangeText={onChangeText}
				onSubmitEditing={onDoneEdit}
				intl={intl}
				keyboardTypeInLineEdit={'default'}/>
		</View>
	);
};

const getStyle = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const {
		fontSizeFactorFive,
		paddingFactor,
	} = Theme.Core;
	const padding = deviceWidth * paddingFactor;
	return {
		containerStyle: {
			flex: 1,
			marginHorizontal: padding,
		},
		iconValueRightSize: deviceWidth * fontSizeFactorFive,
	};
};

export default React.memo<Object>(EditEventNameBlock);
