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
} from 'react';
import {
	TouchableOpacity,
	LayoutAnimation,
} from 'react-native';
import { useSelector } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {
	View,
	Text,
	EmptyView,
} from '../../../../BaseComponents';

import ZWaveFunctions from '../../../Lib/ZWaveFunctions';
import * as LayoutAnimations from '../../../Lib/LayoutAnimations';

import Theme from '../../../Theme';

type Props = {
	id: string,
};

const SupportedCommandClasses = (props: Props): Object => {
	const {
		id,
	} = props;

	const [ expand, setExpand ] = useState(true);

	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		nodeInfo,
	} = useSelector((state: Object): Object => state.devices.byId[id]) || {};
	const { userProfile } = useSelector((state: Object): Object => state.user);
	const {
		admin = 0,
	} = userProfile;

	const {
		titleCoverStyle,
		coverStyle,
		textStyle,
		titleStyle,
		iconStyle,
		iconSize,
		iconColor,
		interviewLinkStyle,
	} = getStyles(layout);

	const commands = useMemo((): ?Array<Object> => {

		if (!id || !nodeInfo) {
			return;
		}

		function onPressInterview() {

		}

		const {
			isFailed = false,
			listening = false,
		} = nodeInfo;

		const zWaveFunctions = new ZWaveFunctions(nodeInfo);
		const cmdClass = zWaveFunctions.supportedCommandClasses || [];

		return cmdClass.map((cmdCls: Object, i: number): Object => {

			const {
				cmdName,
				version,
			} = cmdCls;

			const showInterview = admin === 1 || (!isFailed && version === 0 && listening);

			return (
				<View style={coverStyle} key={`${i}`}>
					<Text style={textStyle}>
						{cmdName}
					</Text>
					{showInterview && (
						<Text style={interviewLinkStyle} onPress={onPressInterview}>
							Interview
						</Text>
					)}
				</View>
			);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		nodeInfo,
		layout,
		id,
		admin,
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
				<MaterialIcons
					name={expand ? 'expand-more' : 'expand-less'}
					size={iconSize}
					color={iconColor}
					style={iconStyle}/>
				<Text style={titleStyle}>
					Supported Command Classes
				</Text>
			</TouchableOpacity>
			{!expand && commands}
		</>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const fontSize = Math.floor(deviceWidth * 0.045);

	const {
		rowTextColor,
		paddingFactor,
		brandSecondary,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		iconSize: deviceWidth * 0.06,
		iconColor: brandSecondary,
		titleCoverStyle: {
			flexDirection: 'row',
			marginLeft: padding,
			marginBottom: padding / 2,
			alignItems: 'center',
		},
		titleStyle: {
			marginLeft: 8,
			fontSize: deviceWidth * 0.04,
			color: rowTextColor,
		},
		coverStyle: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			backgroundColor: '#fff',
			marginTop: 2,
			marginHorizontal: padding,
			borderRadius: 2,
			paddingHorizontal: padding,
			paddingVertical: padding / 2,
		},
		textStyle: {
			color: rowTextColor,
			fontSize,
		},
		interviewLinkStyle: {
			color: brandSecondary,
			fontSize,
		},
	};
};

export default memo<Object>(SupportedCommandClasses);
