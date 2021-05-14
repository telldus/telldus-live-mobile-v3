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
	useIntl,
} from 'react-intl';

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
import i18n from '../../../Translations/common';

type Props = {
    id: string,
	clientId: string,
	clientDeviceId: string,
};

const hasAssociationChanged = (groupings: Object, two: Object): boolean => {
	if (!groupings || !two || Object.keys(two).length <= 0) {
		return false;
	}
	let hasChanged = false;
	for (let key in groupings) {
		const {
			group = {},
		} = groupings[key];
		if (!two[key]) {
			continue;
		}
		if (xor(two[key], group.queue).length > 0) {
			hasChanged = true;
			break;
		}
	}
	return hasChanged;
};

const Associations = (props: Props): Object => {
	const {
		id,
		clientId,
		clientDeviceId,
	} = props;

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

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

	const { layout } = useSelector((state: Object): Object => state.app);
	const { byId = {} } = useSelector((state: Object): Object => state.gateways);
	const {
		nodeList = {},
	} = byId[clientId];
	const {
		nodeInfo,
		zwaveInfo = {},
	} = useSelector((state: Object): Object => state.devices.byId[id]) || {};
	const {
		AssociationGroups = [],
	} = zwaveInfo;

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
		selectedList: {},
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
			changedGroupsAndDevices,
			changedGroups,
			selectedList: {
				...associationsConf.selectedList,
				[group]: selectedList,
			},
		});
	}, [associationsConf]);

	const nodeId = nodeInfo ? nodeInfo.nodeId : '';
	const prevNodeInfo = usePreviousValue(nodeInfo);
	const isNodeInfoEqual = isEqual(prevNodeInfo, nodeInfo);
	const prevNodeList = usePreviousValue(nodeList);
	const isNodeListEqual = isEqual(prevNodeList, nodeList);

	const groupings = useMemo((): Object => {
		return ZWaveFunctions.prepareGroups(nodeList, nodeId, nodeInfo, {
			AssociationGroups,
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		isNodeInfoEqual,
		isNodeListEqual,
		AssociationGroups,
	]);

	const groups = useMemo((): ?Array<Object> => {

		if (!id || !nodeInfo) {
			return;
		}

		if (!groupings) {
			return;
		}

		let g = [];
		for (let key in groupings) {
			g.push(
				<AssociationGroup
					key={key}
					group={key}
					nodeList={groupings[key].nodesList}
					clientId={clientId}
					nodeId={nodeId}
					{...groupings[key].group}
					description={groupings[key].description}
					currentAssociations={groupings[key].currentAssociations.join(', ')}
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
		clientId,
		nodeId,
		onAssociationsChange,
	]);

	const onPressToggle = useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		setExpand(!expand);
	}, [expand]);

	const [ isLoading, setIsLoading ] = useState(false);
	const saveAssociation = useCallback((data: Object) => {
		setIsLoading(true);
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
			setIsLoading(false);
		}, 1000);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [clientId, nodeId, clientDeviceId]);

	const {
		selectedList,
	} = associationsConf;
	const onPressSave = useCallback(() => {
		saveAssociation(associationsConf.changedGroupsAndDevices);
	}, [associationsConf.changedGroupsAndDevices, saveAssociation]);

	if (!id || !nodeInfo || !groups || groups.length === 0) {
		return <EmptyView/>;
	}

	const hasChanged = hasAssociationChanged(groupings, selectedList);

	return (
		<>
			<TouchableOpacity
				style={titleCoverStyle}
				onPress={onPressToggle}>
				<ThemedMaterialIcon
					name={expand ? 'expand-more' : 'expand-less'}
					size={iconSize}
					level={38}
					style={iconStyle}/>
				<Text
					level={2}
					style={titleStyle}>
					{formatMessage(i18n.associations)}
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
					text={formatMessage(i18n.saveNewAssociations)}
					onPress={onPressSave}
					showThrobber={isLoading}
					disabled={isLoading}/>
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
		fontSizeFactorOne,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const buttonWidth = width - (padding * 9);

	return {
		padding,
		iconSize: deviceWidth * 0.07,
		titleCoverStyle: {
			flexDirection: 'row',
			marginBottom: padding / 2,
			alignItems: 'center',
		},
		titleStyle: {
			marginLeft: 8,
			fontSize: deviceWidth * fontSizeFactorOne,
		},
		buttonStyle: {
			marginTop: padding / 2,
			width: buttonWidth,
			maxWidth: buttonWidth,
		},
	};
};

export default (memo<Object>(Associations): Object);
