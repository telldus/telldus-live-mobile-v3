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
import { useIntl } from 'react-intl';

import {
	View,
	Text,
	TouchableButton,
	CheckBoxIconText,
	RoundedInfoButton,
} from '../../../../BaseComponents';

import * as LayoutAnimations from '../../../Lib/LayoutAnimations';
import {
	usePreviousValue,
} from '../../../Hooks/App';
import {
	useAppTheme,
} from '../../../Hooks/Theme';
import {
	useDialogueBox,
} from '../../../Hooks/Dialoguebox';

import Theme from '../../../Theme';

type Props = {
    nodeList: Object,
    maxNodes: number,
    queue: Array<string>,
    nodes: Array<string>,
	group: string,
	clientId: string,
	nodeId: string,
	onAssociationsChange: (Object) => void,
	currentAssociations: string,
};

const AssociationGroup = memo<Object>((props: Props): Object => {
	const {
		nodeList,
		maxNodes,
		group,
		queue = [],
		nodeId,
		onAssociationsChange,
		currentAssociations = '',
	} = props;

	const {
		colors,
	} = useAppTheme();
	const intl = useIntl();

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
		inAppBrandSecondary,
	} = getStyles({
		layout,
		colors,
	});

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	const prevNodeList = usePreviousValue(nodeList);
	const isNodeListEqual = isEqual(prevNodeList, nodeList);

	const [ selectedList, setSelectedList ] = useState(queue);
	const onToggleCheckBox = useCallback(({
		key,
	}: Object) => {
		let _selectedList = selectedList;
		if (selectedList.indexOf(key) === -1) {
			_selectedList = [..._selectedList, key];
		} else {
			_selectedList = _selectedList.filter((item: string): boolean => item !== key);
		}
		setSelectedList(_selectedList);
		onAssociationsChange({
			selectedList: _selectedList,
			queue,
			group,
		});
	}, [onAssociationsChange, selectedList, queue, group]);

	const onPressInfo = useCallback(({
		associationWarningDisabled,
		associationWarningQueue,
		associationWarningRemoved,
	}: Object) => {
		let text;
		if (associationWarningDisabled) {// TODO: Translate
			text = 'Setting association to multi channel endpoints is not supported in this device.';
		} else if (associationWarningQueue) {
			text = 'This device has been added to this association group but has not yet been stored in the device. This will happen next time the device is awake.';
		} else if (associationWarningRemoved) {
			text = 'This device has been removed from this association group but has not yet been removed from the device. This will happen next time the device is awake.';
		}
		if (text) {
			toggleDialogueBoxState({
				show: true,
				header: ' ',
				showHeader: true,
				imageHeader: true,
				text,
				showPositive: true,
			});
		}
	}, [toggleDialogueBoxState]);

	const selectionList = useMemo((): Array<Object> => {
		let list = [];
		for (let key in nodeList) {
			if (key === nodeId) {
				continue;
			}

			let isChecked = selectedList.indexOf(key) !== -1;
			const {
				name,
				associationWarningDisabled,
				associationWarningQueue,
				associationWarningRemoved,
			} = nodeList[key];
			const showInfo = associationWarningDisabled || associationWarningQueue || associationWarningRemoved;

			list.push(
				<View
					key={key}
					style={selectListCover}>
					<View style={{
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
					}}>
						<Text
							numberOfLines={1}
							level={3}
							style={selectListText}>
							{name}
						</Text>
						{showInfo && (
							<RoundedInfoButton
								iconLevel={6}
								buttonProps={{
									infoButtonContainerStyle: {
										position: 'relative',
										right: undefined,
										bottom: undefined,
										marginLeft: 5,
									},
									onPress: onPressInfo,
									onPressData: {
										associationWarningDisabled,
										associationWarningQueue,
										associationWarningRemoved,
									},
								}}/>
						)}
					</View>
					<CheckBoxIconText
						isChecked={isChecked}
						onPressData={{key}}
						iconStyle={{
							backgroundColor: isChecked ? inAppBrandSecondary : 'transparent',
							color: isChecked ? '#fff' : 'transparent',
							borderColor: inAppBrandSecondary,
						}}
						style={{
							overflow: 'visible',
						}}
						onToggleCheckBox={onToggleCheckBox}
						intl={intl}/>
				</View>
			);
		}
		return list;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isNodeListEqual, layout, inAppBrandSecondary, selectedList, onToggleCheckBox, onPressInfo]);

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
					{currentAssociations}
				</Text>
			</View>
			<TouchableButton
				text={editActive ? 'Hide device associations' : 'Edit device associations'}
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
	colors,
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
	const {
		inAppBrandSecondary,
	} = colors;

	const padding = deviceWidth * paddingFactor;
	const buttonWidth = width - (padding * 9);

	let fontSizeButtonText = deviceWidth * 0.035;
	fontSizeButtonText = fontSizeButtonText > maxSizeTextButton ? maxSizeTextButton : fontSizeButtonText;

	return {
		inAppBrandSecondary,
		verticalCoverDef: {
			marginHorizontal: padding,
			padding,
			marginBottom: padding / 2,
			...shadow,
		},
		horizontalCoverDef: {
			flexDirection: 'row',
			marginTop: padding,
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
			marginTop: padding,
			justifyContent: 'space-between',
		},
		selectListText: {
			fontSize,
		},
	};
};

export default AssociationGroup;
