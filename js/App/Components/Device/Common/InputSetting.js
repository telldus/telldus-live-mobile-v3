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
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import {
	SettingsRow,
} from '../../../../BaseComponents';

import {
	useDialogueBox,
} from '../../../Hooks/Dialoguebox';

import Theme from '../../../Theme';

const InputSetting = (props: Object, ref: Object): Object => {
	const inputRef = React.useRef({
		blur: () => {},
	});
	const {
		label,
		value,
		onChangeText,
		paramUpdatedViaScan,
		textOnPressHelp,
		headerOnPressHelp,
	} = props;

	const intl = useIntl();

	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		optionInputCover,
		iconValueRightSize,
		contentCoverStyle,
	} = getStyles(layout, paramUpdatedViaScan);

	React.useImperativeHandle(ref, (): Object => ({
		blur: () => {
			if (inputRef.current && inputRef.current.blur) {
				inputRef.current.blur();
			}
		},
	}));

	const { toggleDialogueBoxState } = useDialogueBox();
	function onPressIconLabelRight() {
		if (textOnPressHelp && headerOnPressHelp) {
			toggleDialogueBoxState({
				show: true,
				showHeader: true,
				imageHeader: true,
				text: textOnPressHelp,
				header: headerOnPressHelp,
				showIconOnHeader: true,
				onPressHeader: () => {
					toggleDialogueBoxState({
						show: false,
					});
				},
			});
		}
	}

	const [ inLineEditActive, setInLineEditActive ] = React.useState(false);
	function onPressIconValueRight() {
		setInLineEditActive(!inLineEditActive);
	}

	return (
		<SettingsRow
			type={'text'}
			edit={false}
			inLineEditActive={inLineEditActive}
			label={label}
			value={value}
			appLayout={layout}
			iconLabelRight={'help'}
			iconValueRight={inLineEditActive ? 'done' : 'edit'}
			onPress={false}
			iconValueRightSize={inLineEditActive ? iconValueRightSize : null}
			onPressIconLabelRight={onPressIconLabelRight}
			onPressIconValueRight={onPressIconValueRight}
			onChangeText={onChangeText}
			style={optionInputCover}
			contentCoverStyle={contentCoverStyle}
			intl={intl}/>
	);
};

const getStyles = (appLayout: Object, paramUpdatedViaScan: boolean): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		iconValueRightSize: deviceWidth * 0.05,
		optionInputCover: {
			marginBottom: padding / 2,
			borderRadius: 2,
			marginTop: 0,
		},
		contentCoverStyle: {
			padding,
		},
	};
};

export default React.forwardRef<Object, Object>(InputSetting);
