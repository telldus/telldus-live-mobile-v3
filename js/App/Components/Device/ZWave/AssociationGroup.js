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
	useCallback,
	useState,
} from 'react';
import {
	useSelector,
} from 'react-redux';
const isEqual = require('react-fast-compare');
import {
	LayoutAnimation,
} from 'react-native';

import {
	View,
	Text,
	TouchableButton,
} from '../../../../BaseComponents';

import * as LayoutAnimations from '../../../Lib/LayoutAnimations';
import {
	usePreviousValue,
} from '../../../Hooks/App';
import Theme from '../../../Theme';

type Props = {
    nodeList: Object,
    maxNodes: number,
    queue: string,
    nodes: Array<string>,
    group: string,
};

const AssociationGroup = memo<Object>((props: Props): Object => {
	const {
		nodeList,
		maxNodes,
		group,
		nodes,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		verticalCoverDef,
		horizontalCoverDef,
		hItemLabelDef,
		hItemValueDef,
		buttonStyle,
		labelStyle,
		selectListCover,
		selectListText,
	} = getStyles({
		layout,
	});

	const prevNodeList = usePreviousValue(nodeList);
	const isNodeListEqual = isEqual(prevNodeList, nodeList);
	const associatedDevices = useMemo((): string => {
		let an = [];
		for (let i = 0; i < nodes.length; i++) {
			if (nodeList[nodes[i]]) {
				an.push(nodeList[nodes[i]].name);
			}
		}
		return an.join(',');
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isNodeListEqual, nodes]);

	const selectionList = useMemo((): Array<Object> => {
		let list = [];
		for (let key in nodeList) {
			list.push(
				<View
					key={key}
					style={selectListCover}>
					<Text
						style={selectListText}
						key={key}>
						{nodeList[key].name}
					</Text>
				</View>
			);
		}
		return list;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isNodeListEqual, layout]);

	const [ editActive, setEditActive ] = useState(false);
	const toggleEditSave = useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		setEditActive(!editActive);
	}, [editActive]);

	return (
		<View
			level={2}
			style={verticalCoverDef}>
			<View style={horizontalCoverDef}>
				<Text
					level={3}
					style={hItemLabelDef}>
					{'Group: '}
				</Text>
				<Text
					level={4}
					style={hItemValueDef}>
					{group}
				</Text>
			</View>
			<View style={horizontalCoverDef}>
				<Text
					level={3}
					style={hItemLabelDef}>
					{'Max devices: '}
				</Text>
				<Text
					level={4}
					style={hItemValueDef}>
					{maxNodes}
				</Text>
			</View>
			<View style={horizontalCoverDef}>
				<Text
					level={3}
					style={hItemLabelDef}>
					{'Currently associated devices: '}
				</Text>
				<Text
					level={4}
					style={hItemValueDef}>
					{associatedDevices}
				</Text>
			</View>
			<TouchableButton
				text={editActive ? 'Save new associations' : 'Edit device associations'}
				style={buttonStyle}
				labelStyle={labelStyle}
				throbberStyle={labelStyle}
				onPress={toggleEditSave}/>
			{(editActive && !!selectionList) && selectionList}
		</View>
	);
});

const getStyles = ({
	layout,
}: Object): Object => {
	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const fontSize = Math.floor(deviceWidth * 0.045);

	const {
		paddingFactor,
		shadow,
		maxSizeTextButton,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const buttonWidth = width - (padding * 9);

	let fontSizeButtonText = deviceWidth * 0.035;
	fontSizeButtonText = fontSizeButtonText > maxSizeTextButton ? maxSizeTextButton : fontSizeButtonText;

	return {
		verticalCoverDef: {
			marginHorizontal: padding,
			padding,
			marginBottom: padding,
			...shadow,
		},
		horizontalCoverDef: {
			flexDirection: 'row',
			marginTop: 5,
		},
		hItemLabelDef: {
			fontSize,
		},
		hItemValueDef: {
			fontSize,
		},
		buttonStyle: {
			marginBottom: padding / 2,
			marginTop: padding,
			width: buttonWidth,
			maxWidth: buttonWidth,
			paddingVertical: fontSizeButtonText,
		},
		labelStyle: {
			fontSize: fontSizeButtonText,
		},
		selectListCover: {
			flexDirection: 'row',
			marginTop: 5,
		},
		selectListText: {

		},
	};
};

export default AssociationGroup;
