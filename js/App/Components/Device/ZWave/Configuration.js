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
	useMemo,
} from 'react';
import { useSelector } from 'react-redux';
import {
	LayoutAnimation,
} from 'react-native';

import {
	EmptyView,
	TouchableOpacity,
	ThemedMaterialIcon,
	Text,
	View,
} from '../../../../BaseComponents';

import ZWaveFunctions from '../../../Lib/ZWaveFunctions';
import * as LayoutAnimations from '../../../Lib/LayoutAnimations';
import Theme from '../../../Theme';

type Props = {
    id: string,
	clientId: string,
	clientDeviceId: string,
};

const Configuration = (props: Props): Object => {
	const {
		id,
	} = props;

	const [ expand, setExpand ] = useState(true);

	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		nodeInfo,
	} = useSelector((state: Object): Object => state.devices.byId[id]) || {};

	const {
		titleCoverStyle,
		titleStyle,
		iconStyle,
		iconSize,
		verticalCover,
		coverStyle,
		subTitleTextStyle,
		hItemLabelDef,
	} = getStyles(layout);

	const protectionClass = nodeInfo.cmdClasses[ZWaveFunctions.COMMAND_CLASS_PROTECTION];
	const configurationClass = nodeInfo.cmdClasses[ZWaveFunctions.COMMAND_CLASS_CONFIGURATION];
	const hasProtection = !!protectionClass;
	const hasConfiguration = !!configurationClass;

	const protection = useMemo((): ?Object => {
		if (!hasProtection) {
			return;
		}
		return (
			<View
				style={verticalCover}>
				<Text
					level={2}
					style={subTitleTextStyle}>
                Protection
				</Text>
				<View
					level={2}
					style={coverStyle}>
					<Text
						level={3}
						style={hItemLabelDef}>
						{'State: '}
					</Text>
				</View>
			</View>
		);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasProtection, layout]);

	const configuration = useMemo((): ?Object => {
		if (!hasConfiguration) {
			return;
		}
		return (
			<View
				style={verticalCover}>
				<Text
					level={2}
					style={subTitleTextStyle}>
                Advanced settings
				</Text>
				<View
					level={2}
					style={coverStyle}>
					<Text
						level={3}
						style={hItemLabelDef}>
                Advanced settings
					</Text>
				</View>
			</View>
		);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasConfiguration, layout]);

	const onPressToggle = useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		setExpand(!expand);
	}, [expand]);

	if (!id || !nodeInfo) {
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
					level={23}/>
				<Text
					level={2}
					style={titleStyle}>
					Configuration
				</Text>
			</TouchableOpacity>
			{!expand && (
				<>
					{!!protection && protection}
					{!!configuration && configuration}
				</>
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
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const buttonWidth = width - (padding * 9);
	const fontSize = Math.floor(deviceWidth * 0.045);

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
		coverStyle: {
			justifyContent: 'space-between',
			marginTop: 2,
			marginHorizontal: padding,
			borderRadius: 2,
			padding,
			...shadow,
		},
		verticalCover: {
		},
		subTitleTextStyle: {
			fontSize: fontSize * 1.1,
			marginLeft: padding,
			marginTop: 8,
			marginBottom: 5,
		},
		hItemLabelDef: {
			fontSize,
		},
	};
};

export default memo<Object>(Configuration);
