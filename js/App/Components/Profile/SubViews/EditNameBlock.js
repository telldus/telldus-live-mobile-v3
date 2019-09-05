
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

import React, { useState } from 'react';
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

import i18n from '../../../Translations/common';

const EditNameBlock = (props: Object): Object => {
	const {
		contentCoverStyle,
		valueCoverStyle,
		textFieldStyle,
		labelTextStyle,
		toggleDialogueBox,
	} = props;
	const [ inLineEditActive, setInLineEditActive ] = useState(false);

	const intl = useIntl();

	const { app: {layout}, user: {userProfile} } = useSelector((state: Object): Object => state);
	const { firstname = '', lastname = '' } = userProfile || {};
	const FN = `${firstname} ${lastname}`;

	const [ nameEditValue, setNameEditValue ] = useState(FN);

	function toggleEdit() {
		if (inLineEditActive) {
			setUserNameConfirm();
		}
		setInLineEditActive(!inLineEditActive);
	}

	function onDoneEdit() {
		setInLineEditActive(false);
		setUserNameConfirm();
	}
	const dispatch = useDispatch();
	function setUserNameConfirm() {
		if (!nameEditValue || nameEditValue.trim() === '') {
			toggleDialogueBox({
				show: true,
				showHeader: true,
				text: 'name cannot be empty.', // TODO: translate
				showPositive: true,
				closeOnPressPositive: true,
			});
		}
		let [fn, ln] = nameEditValue.split(' ');
		dispatch(setUserName(fn, ln)).then(() => {
			dispatch(showToast('Name has been updated.')); // TODO: translate
			dispatch(getUserProfile());
		}).catch(() => {
			dispatch(showToast('Sorry something went wrong while updating the name. Please try later.')); // TODO: translate
			dispatch(getUserProfile());
		});
	}

	function onChangeText(text: string) {
		setNameEditValue(text);
	}


	const {
		iconValueRightSize,
	} = getStyle(layout);

	return (
		<SettingsRow
			type={'text'}
			edit={false}
			inLineEditActive={inLineEditActive}
			label={intl.formatMessage(i18n.name)}
			value={nameEditValue}
			appLayout={layout}
			iconValueRight={inLineEditActive ? 'done' : 'edit'}
			onPress={false}
			iconValueRightSize={inLineEditActive ? iconValueRightSize : null}
			onPressIconValueRight={toggleEdit}
			onChangeText={onChangeText}
			onSubmitEditing={onDoneEdit}
			intl={intl}
			contentCoverStyle={contentCoverStyle}
			valueCoverStyle={valueCoverStyle}
			textFieldStyle={textFieldStyle}
			labelTextStyle={labelTextStyle}/>
	);
};

const getStyle = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;


	return {
		iconValueRightSize: deviceWidth * 0.05,
	};
};

export default EditNameBlock;
