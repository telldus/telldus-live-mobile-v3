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
	useMemo,
	useState,
	useCallback,
	useRef,
	useEffect,
} from 'react';
import {
	LayoutAnimation,
} from 'react-native';
const isEqual = require('react-fast-compare');
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
	Throbber,
	IconTelldus,
} from '../../../../BaseComponents';

import {
	usePreviousValue,
} from '../../../Hooks/App';
import ZWaveFunctions from '../../../Lib/ZWaveFunctions';
import * as LayoutAnimations from '../../../Lib/LayoutAnimations';
import {
	sendSocketMessage,
	requestNodeInfo,
} from '../../../Actions/Websockets';
import {
	startCommandClassInterview,
	stopCommandClassInterview,
} from '../../../Actions/WebsocketExtras';

import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

type Props = {
	id: string,
	clientDeviceId: string,
	clientId: string,
};

const KEY_FAIL = '0';
const KEY_SUCCESS = '1';

const SupportedCommandClasses = (props: Props): Object => {
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
	const [ interviewStatusConf, setInterviewStatusConf ] = useState({
		cmdClass: null,
		status: '',
	});

	const { manualInterviewConf = {} } = useSelector((state: Object): Object => state.websocketExtras);
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
		cmd: interviewingCommand,
		interviewDoneData,
	} = manualInterviewConf;
	const {
		listening,
	} = nodeInfo || {};

	const {
		itemsCoverStyle,
		titleCoverStyle,
		coverStyle,
		textStyle,
		titleStyle,
		iconStyle,
		iconSize,
		interviewLinkStyle,
		throbberContainerStyle,
		throbberStyle,
	} = getStyles(layout);

	const prevNodeInfo = usePreviousValue(nodeInfo);
	const isNodeInfoEqual = isEqual(prevNodeInfo, nodeInfo);
	const timeoutInterviewRef = useRef(null);
	useEffect((): Function => {
		return () => {
			dispatch(stopCommandClassInterview());
			clearTimeout(timeoutInterviewRef.current);
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const _setInterviewStatusConf = useCallback(({
		cmdClass,
		status,
	}: Object) => {
		setInterviewStatusConf({
			cmdClass,
			status,
		});
	}, []);

	useEffect((): Function => {
		if (interviewDoneData && interviewDoneData.cmdClass === interviewingCommand && interviewDoneData.data && interviewDoneData.data.interviewed) {
			dispatch(requestNodeInfo(clientId, clientDeviceId));
			if (listening) {
				_setInterviewStatusConf({
					cmdClass: interviewDoneData.cmdClass,
					status: KEY_SUCCESS,
				});
				dispatch(stopCommandClassInterview());
				clearTimeout(timeoutInterviewRef.current);
			}
		}
	}, [_setInterviewStatusConf, clientDeviceId, clientId, dispatch, interviewDoneData, interviewingCommand, listening]);

	const onPressInterview = useCallback(({cmd}: Object) => {
		const cmdClass = parseInt(cmd, 10);
		dispatch(startCommandClassInterview({
			cmd: cmdClass,
			deviceId: id,
		}));
		setInterviewStatusConf({
			cmdClass: null,
			status: '',
		});
		dispatch(sendSocketMessage(clientId, 'client', 'forward', {
			'module': 'zwave',
			'action': 'interview',
			'device': clientDeviceId,
			'class': cmdClass,
		}));
		if (listening) {
			timeoutInterviewRef.current = setTimeout(() => {
				dispatch(stopCommandClassInterview());
				_setInterviewStatusConf({
					cmdClass,
					status: KEY_FAIL,
				});
			}, 8000);
		}
	}, [_setInterviewStatusConf, clientDeviceId, clientId, dispatch, id, listening]);

	const [cWidth, setCWidth] = useState();
	const onItemLayout = useCallback(({
		nativeEvent,
	}: Object) => {
		const {
			layout: l = {},
		} = nativeEvent;
		if (cWidth !== l.width) {
			setCWidth(l.width);
		}
	}, [cWidth]);

	const commands = useMemo((): ?Array<Object> => {

		if (!id || !nodeInfo) {
			return;
		}

		const zWaveFunctions = new ZWaveFunctions(nodeInfo);
		const cmdClass = zWaveFunctions.supportedCommandClasses || [];

		return cmdClass.map((cmdCls: Object, i: number): Object => {
			const {
				cmdName,
				secure,
				cmd,
			} = cmdCls;
			const disableInterview = !isOnline || typeof interviewingCommand === 'number';
			const isTheOneCurrentlyInterviewing = interviewingCommand === parseInt(cmd, 10);
			const showFail = interviewStatusConf.cmdClass === parseInt(cmd, 10) && interviewStatusConf.status === KEY_FAIL;
			const showSuccess = interviewStatusConf.cmdClass === parseInt(cmd, 10) && interviewStatusConf.status === KEY_SUCCESS;

			return (
				<View
					level={2}
					style={coverStyle}
					key={`${i}`}>
					<Text
						level={4}
						style={textStyle}>
						{cmdName}
					</Text>
					<View style={{
						flexDirection: 'row',
						justifyContent: 'flex-end',
					}}>
						{isTheOneCurrentlyInterviewing ?
							<>
								{!listening ?
									<IconTelldus
										icon={'time'}
										style={throbberStyle}
										level={23}/>
									:
									<Throbber
										throbberStyle={throbberStyle}
										throbberContainerStyle={[
											throbberContainerStyle,
											{width: cWidth},
										]}
									/>
								}
							</>
							: <TouchableOpacity
								onPress={onPressInterview}
								onPressData={{cmd}}
								style={{
									alignSelf: 'flex-end',
									marginRight: 5,
								}}
								disabled={disableInterview}>
								<Text
									level={showFail ? 32 : (showSuccess ? 31 : (disableInterview ? 47 : 23))}
									style={interviewLinkStyle}
									onLayout={onItemLayout}>
									{formatMessage(i18n.interview)}
								</Text>
							</TouchableOpacity>
						}
						{secure === true && (
							<Text
								level={23}
								style={interviewLinkStyle}>
								{formatMessage(i18n.secure)}
							</Text>
						)}
					</View>
				</View>
			);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		isNodeInfoEqual,
		layout,
		id,
		isOnline,
		onPressInterview,
		interviewingCommand,
		interviewStatusConf,
		onItemLayout,
		cWidth,
		listening,
	]);

	const onPressToggle = useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		setExpand(!expand);
	}, [expand]);

	if (!id || !nodeInfo || !commands || commands.length === 0) {
		return <EmptyView/>;
	}

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
					{formatMessage(i18n.supCmdClass)}
				</Text>
			</TouchableOpacity>
			{!expand && (
				<View style={itemsCoverStyle}>
				 {commands}
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
			flexDirection: 'row',
			justifyContent: 'space-between',
			marginTop: 2,
			marginHorizontal: padding,
			borderRadius: 2,
			paddingHorizontal: padding,
			paddingVertical: padding / 2,
		},
		itemsCoverStyle: {
			marginBottom: padding,
		},
		textStyle: {
			fontSize,
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

export default (memo<Object>(SupportedCommandClasses): Object);
