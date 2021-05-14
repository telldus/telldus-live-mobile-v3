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
import {
	LayoutAnimation,
} from 'react-native';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import {
	useIntl,
} from 'react-intl';

import {
	View,
	Text,
	EmptyView,
	ThemedMaterialIcon,
	TouchableOpacity,
} from '../../../../BaseComponents';
import BasicCommandButton from './BasicCommandButton';

import ZWaveFunctions from '../../../Lib/ZWaveFunctions';
import * as LayoutAnimations from '../../../Lib/LayoutAnimations';
import {
	sendSocketMessage,
} from '../../../Actions/Websockets';

import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

type Props = {
	id: string,
	clientDeviceId: string,
	clientId: string,
};

const BasicSettings = (props: Props): Object => {
	const {
		id,
		clientDeviceId,
		clientId,
	} = props;

	const dispatch = useDispatch();
	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	const [ expand, setExpand ] = useState(true);

	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		nodeInfo,
	} = useSelector((state: Object): Object => state.devices.byId[id]) || {};
	const {
		online,
		websocketOnline,
	} = useSelector((state: Object): Object => state.gateways.byId[clientId]) || {};
	const isOnline = online && websocketOnline;

	const {
		titleCoverStyle,
		coverStyle,
		commandsCover,
		textStyle,
		titleStyle,
		iconStyle,
		iconSize,
	} = getStyles(layout);

	const onPressSendCommand = useCallback(({
		value,
		secure,
	}: Object) => {
		dispatch(sendSocketMessage(clientId, 'client', 'forward', {
			'module': 'zwave',
			'action': 'basic',
			'device': clientDeviceId,
			'command': 'set',
			value,
			secure,
		}));
	}, [clientDeviceId, clientId, dispatch]);

	const onPressToggle = useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		setExpand(!expand);
	}, [expand]);

	if (!id || !nodeInfo || !nodeInfo.cmdClasses) {
		return <EmptyView/>;
	}

	const showSecure = nodeInfo && nodeInfo.cmdClasses && nodeInfo.cmdClasses[ZWaveFunctions.COMMAND_CLASS_SECURITY] && nodeInfo.cmdClasses[ZWaveFunctions.COMMAND_CLASS_SECURITY].includedSecure === true;

	// TODO: Translate
	return (
		<>
			<TouchableOpacity
				style={titleCoverStyle}
				onPress={onPressToggle}>
				<ThemedMaterialIcon
					name={expand ? 'expand-more' : 'expand-less'}
					size={iconSize}
					style={iconStyle}
					level={38}/>
				<Text
					level={2}
					style={titleStyle}>
					{formatMessage(i18n.basicCommands)}
				</Text>
			</TouchableOpacity>
			{!expand && (
				<View
					level={2}
					style={coverStyle}>
					<Text
						level={4}
						style={textStyle}>
						{formatMessage(i18n.basicCommandsInfoMessage)}
					</Text>
					<View style={commandsCover}>
						<BasicCommandButton
							index={0}
							label={formatMessage(i18n.basicSetOff)}
							disabled={!isOnline}
							onPress={onPressSendCommand}
							onPressData={{
								value: 0x0,
								secure: 0,
							}}/>
						<BasicCommandButton
							index={1}
							label={formatMessage(i18n.basicSetOn)}
							disabled={!isOnline}
							onPress={onPressSendCommand}
							onPressData={{
								value: 0xFF,
								secure: 0,
							}}/>
						{showSecure && (
							<>
								<BasicCommandButton
									index={2}
									label={formatMessage(i18n.secBasicSetOff)}
									disabled={!isOnline}
									onPress={onPressSendCommand}
									onPressData={{
										value: 0x0,
										secure: 1,
									}}/>
								<BasicCommandButton
									index={3}
									label={formatMessage(i18n.secBasicSetOn)}
									disabled={!isOnline}
									onPress={onPressSendCommand}
									onPressData={{
										value: 0xFF,
										secure: 1,
									}}/>
							</>
						)}
					</View>
				</View>
			)}
		</>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		fontSizeFactorEight,
		fontSizeFactorOne,
	} = Theme.Core;
	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);
	const padding = deviceWidth * paddingFactor;

	return {
		iconSize: deviceWidth * 0.07,
		titleCoverStyle: {
			flexDirection: 'row',
			marginLeft: padding,
			marginBottom: padding / 2,
			alignItems: 'center',
		},
		titleStyle: {
			marginLeft: 8,
			fontSize: deviceWidth * fontSizeFactorOne,
		},
		coverStyle: {
			justifyContent: 'space-between',
			marginTop: 2,
			marginHorizontal: padding,
			borderRadius: 2,
			padding,
			marginBottom: padding,
			...shadow,
		},
		commandsCover: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			justifyContent: 'center',
			marginTop: padding,
		},
		textStyle: {
			fontSize,
			textAlign: 'left',
		},
		interviewLinkStyle: {
			fontSize,
		},
		throbberContainerStyle: {
			position: 'relative',
			alignSelf: 'center',
			justifyContent: 'center',
			alignItems: 'center',
		},
		throbberStyle: {
			fontSize,
		},
	};
};

export default (memo<Object>(BasicSettings): Object);
