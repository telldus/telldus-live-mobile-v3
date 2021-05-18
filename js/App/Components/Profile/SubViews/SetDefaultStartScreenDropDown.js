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
	useRef,
	forwardRef,
	useMemo,
} from 'react';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import { useIntl } from 'react-intl';
import { Platform } from 'react-native';

import {
	DropDown,
	View,
	Text,
} from '../../../../BaseComponents';

import {
	changeDefaultStartScreen,
} from '../../../Actions/Navigation';

import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

type Props = {
};

const SetDefaultStartScreenDropDown = (props: Props, ref: Object): Object => {

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;
	const ddRef = useRef(null);

	const { userId } = useSelector((state: Object): Object => state.user);
	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		hiddenTabs = {},
		defaultStartScreen = {},
	} = useSelector((state: Object): Object => state.navigation);

	const defaultStartScreenCurrentUser = defaultStartScreen[userId] || {};
	const hiddenTabsCurrentUser = useMemo((): Array<string> => {
		return hiddenTabs[userId] || [];
	}, [hiddenTabs, userId]);
	const {
		options,
		screenName,
	 } = useMemo((): Object => {
		const IOS_EXTRA = {
			key: 'MoreOptionsTab',
			value: formatMessage(i18n.more),
		};
		const LIST_DEFAULT_START_SCREENS = [
			{
				key: 'Dashboard', // Navigation key/screen name
				value: formatMessage(i18n.dashboard),
			},
			{
				key: 'Devices',
				value: formatMessage(i18n.devices),
			},
			{
				key: 'Sensors',
				value: formatMessage(i18n.sensors),
			},
			{
				key: 'Scheduler',
				value: formatMessage(i18n.scheduler),
			},
			IOS_EXTRA,
		];
		let _options = [], _screenName, _screenKey;
		LIST_DEFAULT_START_SCREENS.forEach((s: Object) => {
			if (defaultStartScreenCurrentUser.screenKey === s.key) {
				_screenName = s.value;
			}
			if (hiddenTabsCurrentUser.indexOf(_screenKey) !== -1) {
				_screenName = '';
				_screenKey = '';
			}
			if (hiddenTabsCurrentUser.indexOf(s.key) === -1) {
				if (s.key === IOS_EXTRA.key) {
					if (Platform.OS === 'ios') {
						_options.push(s);
						if (!_screenName) {
							_screenName = s.value;
							_screenKey = s.key;
						}
					}
				} else {
					_options.push(s);
					if (!_screenName) {
						_screenName = s.value;
						_screenKey = s.key;
					}
				}
			}
		});
		return {
			options: _options,
			screenName: _screenName,
		};
	}, [defaultStartScreenCurrentUser.screenKey, formatMessage, hiddenTabsCurrentUser]);

	const {
		dropDownContainerStyleDef,
		dropDownHeaderStyle,
		fontSize,
		pickerContainerStyle,
		coverStyle,
		labelStyle,
		pickerBaseTextStyle,
	} = getStyles(layout);

	const dispatch = useDispatch();
	const onValueChange = useCallback((v: string, itemIndex: number, data: Array<any>) => {
		const item = data[itemIndex];
		const { key } = item;
		dispatch(changeDefaultStartScreen(key, userId));
	}, [dispatch, userId]);

	return (
		<View
			level={2}
			style={coverStyle}>
			<Text
				level={3}
				style={labelStyle} numberOfLine={1}>
				{formatMessage(i18n.selectDefStartP)}
			</Text>
			<DropDown
				ref={ddRef}
				dropDownPosition={'bottom'}
				showMax
				items={options}
				value={screenName}
				appLayout={layout}
				intl={intl}
				dropDownContainerStyle={dropDownContainerStyleDef}
				dropDownHeaderStyle={dropDownHeaderStyle}
				fontSize={fontSize}
				pickerContainerStyle={pickerContainerStyle}
				pickerBaseTextStyle={pickerBaseTextStyle}
				onValueChange={onValueChange}/>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const fontSize = Math.floor(deviceWidth * 0.045);

	const {
		paddingFactor,
		shadow,
		subHeader,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		dropDownContainerStyleDef: {
			marginBottom: 0,
			flex: 1,
		},
		dropDownHeaderStyle: {
			fontSize: Math.floor(deviceWidth * 0.045),
			color: subHeader,
		},
		fontSize,
		pickerContainerStyle: {
			elevation: 0,
			shadowColor: 'transparent',
			backgroundColor: 'transparent',
			shadowRadius: 0,
			shadowOpacity: 0,
			shadowOffset: {
				width: 0,
				height: 0,
			},
			marginBottom: 0,
		},
		pickerBaseTextStyle: {
			textAlign: 'right',
		},
		coverStyle: {
			flexDirection: 'row',
			alignItems: 'center',
			width: width - (padding * 2),
			justifyContent: 'space-between',
			...shadow,
			marginBottom: padding / 2,
		},
		labelStyle: {
			flex: 0,
			fontSize,
			flexWrap: 'wrap',
			marginLeft: fontSize,
		},
	};
};

export default (React.memo<Object>(forwardRef<Object, Object>(SetDefaultStartScreenDropDown)): Object);
