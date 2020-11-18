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
	useEffect,
	useRef,
} from 'react';
import {
	TouchableOpacity,
	LayoutAnimation,
} from 'react-native';
import { useSelector } from 'react-redux';
const isEqual = require('react-fast-compare');
import {
	useDispatch,
} from 'react-redux';
import xor from 'lodash/xor';

import {
	Text,
	EmptyView,
	ThemedMaterialIcon,
	TouchableButton,
	View,
} from '../../../../BaseComponents';
import AssociationGroup from './AssociationGroup';

import { requestNodeInfo } from '../../../Actions/Websockets';
import {
	usePreviousValue,
} from '../../../Hooks/App';
import ZWaveFunctions from '../../../Lib/ZWaveFunctions';
import * as LayoutAnimations from '../../../Lib/LayoutAnimations';
import {
	sendSocketMessage,
} from '../../../Actions';

import Theme from '../../../Theme';

type Props = {
    id: string,
	clientId: string,
	clientDeviceId: string,
};

const Associations = (props: Props): Object => {
	const {
		id,
		clientId,
		clientDeviceId,
	} = props;

	const timeoutRef = useRef();
	useEffect((): Function => {
		return () => {
			if (timeoutRef) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const [ expand, setExpand ] = useState(true);
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(sendSocketMessage(clientId, 'client', 'forward', {
			'module': 'zwave',
			'action': 'nodeList',
		}));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [clientId]);

	const { layout } = useSelector((state: Object): Object => state.app);
	const { byId = {} } = useSelector((state: Object): Object => state.gateways);
	const {
		nodeList = {},
	} = byId[clientId];
	const {
		nodeInfo,
	} = useSelector((state: Object): Object => state.devices.byId[id]) || {};
	const { userProfile } = useSelector((state: Object): Object => state.user);
	const {
		admin = 0,
	} = userProfile;

	const {
		titleCoverStyle,
		titleStyle,
		iconStyle,
		iconSize,
		buttonStyle,
		padding,
	} = getStyles(layout);

	const [ associationsConf, setAssociationsConf ] = useState({
		changedGroups: [],
		changedGroupsAndDevices: {},
	});
	const onAssociationsChange = useCallback(({
		selectedList,
		queue,
		group,
	}: Object) => {
		let changedGroups = associationsConf.changedGroups;
		let changedGroupsAndDevices = associationsConf.changedGroupsAndDevices;
		if (xor(selectedList, queue).length > 0) {
			changedGroups = [
				...changedGroups,
				group,
			];
			changedGroupsAndDevices = {
				...changedGroupsAndDevices,
				[group]: selectedList,
			};
		} else {
			changedGroups = changedGroups.filter((item: string): boolean => item !== group);
			delete changedGroupsAndDevices[group];
		}
		setAssociationsConf({
			...associationsConf,
			changedGroupsAndDevices,
			changedGroups,
		});
	}, [associationsConf]);

	const nodeId = nodeInfo ? nodeInfo.nodeId : '';
	const prevNodeInfo = usePreviousValue(nodeInfo);
	const isNodeInfoEqual = isEqual(prevNodeInfo, nodeInfo);
	const prevNodeList = usePreviousValue(nodeList);
	const isNodeListEqual = isEqual(prevNodeList, nodeList);
	const groups = useMemo((): ?Array<Object> => {

		if (!id || !nodeInfo) {
			return;
		}

		const _groups = ZWaveFunctions.prepareGroups(nodeList, nodeId, nodeInfo);
		if (!_groups) {
			return;
		}

		let g = [];
		for (let key in _groups) {
			g.push(
				<AssociationGroup
					key={key}
					group={key}
					nodeList={_groups[key].nodesList}
					clientId={clientId}
					nodeId={nodeId}
					{..._groups[key].group}
					currentAssociations={_groups[key].currentAssociations}
					onAssociationsChange={onAssociationsChange}/>
			);
		}
		return g;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		isNodeInfoEqual,
		isNodeListEqual,
		layout,
		id,
		admin,
		clientId,
		nodeId,
		onAssociationsChange,
	]);

	const onPressToggle = useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		setExpand(!expand);
	}, [expand]);

	const saveAssociation = useCallback((data: Object) => {
		dispatch(sendSocketMessage(clientId, 'client', 'forward', {
			'module': 'zwave',
			'action': 'cmdClass',
			'nodeId': nodeId,
			'class': ZWaveFunctions.COMMAND_CLASS_ASSOCIATION,
			'cmd': 'setAssociations',
			'data': data,
		}));
		timeoutRef.current = setTimeout(() => {
			dispatch(requestNodeInfo(clientId, clientDeviceId));
		}, 1000);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [clientId, nodeId, clientDeviceId]);

	const {
		changedGroups,
	} = associationsConf;
	const onPressSave = useCallback(() => {
		saveAssociation(associationsConf.changedGroupsAndDevices);
	}, [associationsConf.changedGroupsAndDevices, saveAssociation]);

	if (!id || !nodeInfo || !groups || groups.length === 0) {
		return <EmptyView/>;
	}

	const hasChanged = changedGroups.length > 0;

	return (
		<>
			<TouchableOpacity
				style={titleCoverStyle}
				onPress={onPressToggle}>
				<ThemedMaterialIcon
					name={expand ? 'expand-more' : 'expand-less'}
					size={iconSize}
					level={23}
					style={iconStyle}/>
				<Text
					level={2}
					style={titleStyle}>
                    Associations
				</Text>
			</TouchableOpacity>
			{!expand &&
			<View style={{
				marginTop: padding / 2,
			}}>
				{groups}
				{hasChanged &&
				<TouchableButton
					style={buttonStyle}
					text={'Save new associations'}
					onPress={onPressSave}/>
				}
			</View>
			}
		</>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const buttonWidth = width - (padding * 9);

	return {
		padding,
		iconSize: deviceWidth * 0.06,
		titleCoverStyle: {
			flexDirection: 'row',
			marginLeft: padding,
			marginBottom: padding / 2,
			alignItems: 'center',
		},
		titleStyle: {
			marginLeft: 8,
			fontSize: deviceWidth * 0.04,
		},
		buttonStyle: {
			marginTop: padding / 2,
			width: buttonWidth,
			maxWidth: buttonWidth,
		},
	};
};

export default memo<Object>(Associations);
