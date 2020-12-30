
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
	useCallback,
	useState,
	memo,
	useEffect,
} from 'react';
import { useIntl } from 'react-intl';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import {
	LayoutAnimation,
} from 'react-native';

import {
	View,
	Text,
	TouchableOpacity,
	IconTelldus,
	SettingsRow,
} from '../../../../BaseComponents';

import LayoutAnimations from '../../../Lib/LayoutAnimations';
import {
	usePreviousValue,
} from '../../../Hooks/App';
import {
	eventSetMinRepeatInterval,
} from '../../../Actions/Event';

import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

type Props = {
    minRepeatInterval: number,
    toggleDialogueBox: Function,
};

const EventAdvancedSettingsBlock = memo<Object>((props: Props): Object => {

	const {
		minRepeatInterval,
		toggleDialogueBox,
	} = props;

	const intl = useIntl();

	const [inLineEditActive, setInLineEditActive] = useState(false);

	const [showAdvanced, setShowAdvanced] = useState(false);
	const toggleAdvanced = useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		setShowAdvanced(!showAdvanced);
	}, [showAdvanced]);

	const closeDialogue = useCallback(() => {
		toggleDialogueBox({
			show: false,
		});
	}, [toggleDialogueBox]);

	const onPressMinRepeatIntervalInfo = useCallback(() => {
		toggleDialogueBox({
			show: true,
			showHeader: true,
			header: 'Minimum repeat interval',
			showPositive: true,
			showNegative: false,
			onPressPositive: () => {
				closeDialogue();
			},
			showBackground: true,
			text: 'This is the minimum time (in seconds) this event can be ' +
            'triggered again after been triggered once. This can be set (in seconds) ' +
            'between two seconds and one day.',
		});
	}, [closeDialogue, toggleDialogueBox]);

	const [ valueInscreen, setValueInscreen ] = useState(minRepeatInterval);
	const prevValueInscreen = usePreviousValue(minRepeatInterval);
	useEffect(() => {
		if (prevValueInscreen !== valueInscreen) {
			setValueInscreen(minRepeatInterval);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [minRepeatInterval]);

	const onPressMinRepeatIntervalEdit = useCallback(() => {
		setInLineEditActive(true);
	}, []);

	const onChangeMinRepeatInterval = useCallback((value: string) => {
		setValueInscreen(value);
	}, []);

	const dispatch = useDispatch();
	const onDoneMinRepeatInterval = useCallback(() => {
		setInLineEditActive(false);
		let next = parseInt(valueInscreen, 10);
		next = isNaN(next) ? 0 : next;
		dispatch(eventSetMinRepeatInterval(next));
	}, [dispatch, valueInscreen]);

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		containerStyle,
		settingsTextStyle,
		iconSettingsStyle,
		toggleAdvancedCover,
		iconValueRightSize,
	} = getStyles({layout});

	return (
		<View
			style={containerStyle}>
			<TouchableOpacity
				onPress={toggleAdvanced}
				style={toggleAdvancedCover}>
				<IconTelldus
					level={36}
					icon={'settings'}
					style={iconSettingsStyle}/>
				<Text
					level={36}
					style={settingsTextStyle}>
					{showAdvanced ?
						intl.formatMessage(i18n.labelHideAdvanced)
						:
						intl.formatMessage(i18n.labelShowAdvanced)
					}
				</Text>
			</TouchableOpacity>
			{showAdvanced && (
				<SettingsRow
					type={'text'}
					edit={false}
					inLineEditActive={inLineEditActive}
					label={intl.formatMessage(i18n.labelNumberOfRetries)}
					value={valueInscreen}
					appLayout={layout}
					iconLabelRight={'help'}
					iconValueRight={inLineEditActive ? 'done' : 'edit'}
					onPress={false}
					iconValueRightSize={inLineEditActive ? iconValueRightSize : null}
					onPressIconLabelRight={onPressMinRepeatIntervalInfo}
					onPressIconValueRight={inLineEditActive ? onDoneMinRepeatInterval : onPressMinRepeatIntervalEdit}
					onChangeText={onChangeMinRepeatInterval}
					onSubmitEditing={onDoneMinRepeatInterval}
					intl={intl}/>
			)}
		</View>
	);
});

const getStyles = ({
	layout,
}: Object): Object => {
	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		fontSizeFactorFive,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	return {
		containerStyle: {
			flex: 1,
			marginHorizontal: padding,
		},
		toggleAdvancedCover: {
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
			paddingTop: 4 + padding,
			paddingBottom: padding,
		},
		iconSettingsStyle: {
			fontSize: deviceWidth * 0.040666667,
			marginRight: 8,
		},
		settingsTextStyle: {
			fontSize: deviceWidth * 0.040666667,
		},
		iconValueRightSize: deviceWidth * fontSizeFactorFive,
	};
};

export default EventAdvancedSettingsBlock;
