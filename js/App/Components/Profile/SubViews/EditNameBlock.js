
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
} from '../../../../BaseComponents';

import {
	setUserName,
} from '../../../Actions/User';
import {
	getUserProfile,
} from '../../../Actions/Login';
import {
	showToast,
} from '../../../Actions/App';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

function usePrevious(value: string): ?string {
	const ref = useRef();
	useEffect(() => {
	  ref.current = value;
	});
	return ref.current;
}

const EditNameBlock = (props: Object): Object => {
	const {
		style,
		contentCoverStyle,
		valueCoverStyle,
		textFieldStyle,
		labelTextStyle,
		toggleDialogueBox,
		userProfile,
	} = props;
	const [ inLineEditActive, setInLineEditActive ] = useState(false);

	const intl = useIntl();
	const { formatMessage } = intl;

	const { layout } = useSelector((state: Object): Object => state.app);
	const { firstname = '', lastname = '' } = userProfile || {};
	const FN = `${firstname} ${lastname}`;

	const [ nameEditValue, setNameEditValue ] = useState(FN);
	const prevNameEditValue = usePrevious(FN);
	useEffect(() => {
		if (prevNameEditValue !== FN) {
			setNameEditValue(FN);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [FN]);

	const dispatch = useDispatch();
	const setUserNameConfirm = useCallback(() => {
		if (!nameEditValue || nameEditValue.trim() === '') {
			toggleDialogueBox({
				show: true,
				showHeader: true,
				text: formatMessage(i18n.errorNameFieldEmpty),
				showPositive: true,
				closeOnPressPositive: true,
			});
			return;
		}
		let [fn, ln] = nameEditValue.split(' ');
		dispatch(setUserName(fn, ln)).then(() => {
			dispatch(showToast(formatMessage(i18n.successEditName)));
			dispatch(getUserProfile());
		}).catch((error: Object) => {
			dispatch(showToast(error.message || formatMessage(i18n.updateFailed)));
			dispatch(getUserProfile());
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [nameEditValue]);

	const toggleEdit = useCallback(() => {
		if (inLineEditActive) {
			setUserNameConfirm();
		}
		setInLineEditActive(!inLineEditActive);
	}, [inLineEditActive, setUserNameConfirm]);

	const onDoneEdit = useCallback(() => {
		setInLineEditActive(false);
		setUserNameConfirm();
	}, [setUserNameConfirm]);

	const onChangeText = useCallback((text: string) => {
		setNameEditValue(text);
	}, []);

	const {
		iconValueRightSize,
	} = getStyle(layout);

	return (
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
			style={style}
			contentCoverStyle={contentCoverStyle}
			valueCoverStyle={valueCoverStyle}
			textFieldStyle={textFieldStyle}
			labelTextStyle={labelTextStyle}
			keyboardTypeInLineEdit={'default'}/>
	);
};

const getStyle = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const {
		fontSizeFactorFive,
	} = Theme.Core;

	return {
		iconValueRightSize: deviceWidth * fontSizeFactorFive,
	};
};

export default (React.memo<Object>(EditNameBlock): Object);
