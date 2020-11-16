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

import {
	Text,
	EmptyView,
	ThemedMaterialIcon,
} from '../../../../BaseComponents';
import AssociationGroup from './AssociationGroup';

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
};

const Associations = (props: Props): Object => {
	const {
		id,
		clientId,
	} = props;

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
	} = getStyles(layout);

	const prevNodeInfo = usePreviousValue(nodeInfo);
	const isNodeInfoEqual = isEqual(prevNodeInfo, nodeInfo);
	const prevNodeList = usePreviousValue(nodeList);
	const isNodeListEqual = isEqual(prevNodeList, nodeList);
	const groups = useMemo((): ?Array<Object> => {

		if (!id || !nodeInfo) {
			return;
		}

		const zWaveFunctions = new ZWaveFunctions(nodeInfo);
		const {
			groupings,
		} = zWaveFunctions.supportsCommandClass(ZWaveFunctions.COMMAND_CLASS_ASSOCIATION) || {};

		if (!groupings) {
			return;
		}

		let g = [];
		for (let key in groupings) {
			g.push(
				<AssociationGroup
					key={key}
					group={key}
					nodeList={nodeList}
					{...groupings[key]}/>
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
	]);

	const onPressToggle = useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		setExpand(!expand);
	}, [expand]);

	if (!id || !nodeInfo || !groups || groups.length === 0) {
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
					level={23}
					style={iconStyle}/>
				<Text
					level={2}
					style={titleStyle}>
                    Associations
				</Text>
			</TouchableOpacity>
			{!expand && groups}
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

	return {
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
	};
};

export default memo<Object>(Associations);
