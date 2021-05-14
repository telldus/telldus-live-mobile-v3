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
import {
	useIntl,
} from 'react-intl';

import {
	Text,
	ThemedMaterialIcon,
	TouchableButton,
	View,
} from '../../../../BaseComponents';
import NodeRelationBlock from './NodeRelationBlock';

import {
	usePreviousValue,
} from '../../../Hooks/App';
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
    nodesRelation: Object,
    nodeId: string,
    nodeList: Object,
};

const NodeRelations = (props: Props): Object => {
	const {
		id,
		clientId,
		nodesRelation,
		nodeId,
		nodeList,
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

	const dispatch = useDispatch();
	const [ expand, setExpand ] = useState(true);
	const [ isLoading, setIsLoading ] = useState(false);

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		titleCoverStyle,
		titleStyle,
		iconStyle,
		iconSize,
		coverStyle,
		buttonStyle,
		textStyle,
	} = getStyles(layout);

	const prevNodeList = usePreviousValue(nodeList);
	const isNodeListEqual = isEqual(prevNodeList, nodeList);

	const nodeRelations = useMemo((): ?Array<Object> => {
		const {
			relations,
		} = nodesRelation;
		let nr = [];
		if (relations && relations.length > 0) {
			relations.forEach((n: string, i: number) => {
				const {
					name = '',
				} = nodeList[n] || {};
				nr.push(
					<NodeRelationBlock
						key={`${i}${n}`}
						nodeName={name}
					/>
				);
			});
		}
		return nr;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		isNodeListEqual,
		layout,
		id,
		nodeId,
		nodesRelation,
	]);

	const onPressToggle = useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		setExpand(!expand);
	}, [expand]);

	const onPressUpdate = useCallback(() => {
		setIsLoading(true);
		dispatch(sendSocketMessage(clientId, 'client', 'forward', {
			'module': 'zwave',
			'action': 'requestNodeNeighborUpdate',
			'device': clientDeviceId,
		}));
		timeoutRef.current = setTimeout(() => {
			dispatch(sendSocketMessage(clientId, 'client', 'forward', {
				'module': 'zwave',
				'action': 'getRoutingInfo',
				'nodeId': parseInt(nodeId, 10),
			}));
			setIsLoading(false);
		}, 10000);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		isNodeListEqual,
		clientId,
		nodeId,
		nodesRelation,
	]);

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
					{formatMessage(i18n.nodeRelations)}
				</Text>
			</TouchableOpacity>
			{!expand && (
				<View
					level={2}
					style={coverStyle}>
					<Text
						level={4}
						style={textStyle}>
						{formatMessage(i18n.nodeRelationInfoMessage)}
					</Text>
					{!!nodeRelations && nodeRelations}
					<TouchableButton
						style={buttonStyle}
						text={formatMessage(i18n.updateNeighbours)}
						onPress={onPressUpdate}
						showThrobber={isLoading}
						disabled={isLoading}/>
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
		fontSizeFactorOne,
		fontSizeFactorEight,
		shadow,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const buttonWidth = width - (padding * 9);
	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);

	return {
		padding,
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
		buttonStyle: {
			marginTop: padding / 2,
			width: buttonWidth,
			maxWidth: buttonWidth,
		},
		textStyle: {
			fontSize,
		},
		coverStyle: {
			...shadow,
			marginHorizontal: padding,
			padding,
		},
	};
};

export default (memo<Object>(NodeRelations): Object);
