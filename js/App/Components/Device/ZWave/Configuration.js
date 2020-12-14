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
import ProtectionConf from './ProtectionConf';
import AdvancedConf from './AdvancedConf';

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
		padding,
	} = getStyles(layout);

	const protectionClass = nodeInfo.cmdClasses[ZWaveFunctions.COMMAND_CLASS_PROTECTION];
	const configurationClass = nodeInfo.cmdClasses[ZWaveFunctions.COMMAND_CLASS_CONFIGURATION];
	const manufacturerAttributes = nodeInfo.cmdClasses[ZWaveFunctions.COMMAND_CLASS_MANUFACTURER_SPECIFIC];
	const hasProtection = !!protectionClass;
	const hasConfiguration = !!configurationClass;

	const protection = useMemo((): ?Object => {
		if (!hasProtection) {
			return;
		}
		return (
			<ProtectionConf
				{...protectionClass}/>
		);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasProtection]);

	const configuration = useMemo((): ?Object => {
		if (!hasConfiguration) {
			return;
		}
		return (
			<AdvancedConf
				{...configurationClass}
				manufacturerAttributes={manufacturerAttributes}/>
		);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasConfiguration, manufacturerAttributes]);

	const onPressToggle = useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		setExpand(!expand);
	}, [expand]);

	if (!id || !nodeInfo || !protection || !configuration) {
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
				<Text // TODO: Translate
					level={2}
					style={titleStyle}>
					Configuration
				</Text>
			</TouchableOpacity>
			{!expand && (
				<View style={{
					marginBottom: padding / 2,
				}}>
					{!!protection && protection}
					{!!configuration && configuration}
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
		fontSizeFactorFour,
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
			fontSize: deviceWidth * fontSizeFactorFour,
		},
		buttonStyle: {
			marginTop: padding / 2,
			width: buttonWidth,
			maxWidth: buttonWidth,
		},
	};
};

export default memo<Object>(Configuration);
