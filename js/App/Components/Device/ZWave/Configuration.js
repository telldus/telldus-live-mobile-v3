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
	useRef,
	useEffect,
} from 'react';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import {
	LayoutAnimation,
} from 'react-native';
const isEqual = require('react-fast-compare');

import {
	EmptyView,
	TouchableOpacity,
	ThemedMaterialIcon,
	Text,
	View,
	TouchableButton,
} from '../../../../BaseComponents';
import ProtectionConf from './ProtectionConf';
import AdvancedConf from './AdvancedConf';

import ZWaveFunctions from '../../../Lib/ZWaveFunctions';
import * as LayoutAnimations from '../../../Lib/LayoutAnimations';
import {
	usePreviousValue,
} from '../../../Hooks/App';

import Theme from '../../../Theme';

import {
	sendSocketMessage,
} from '../../../Actions';
import { requestNodeInfo } from '../../../Actions/Websockets';

type Props = {
    id: string,
	clientId: string,
	clientDeviceId: string,
};

const Configuration = (props: Props): Object => {
	const {
		id,
		clientId,
		clientDeviceId,
	} = props;

	const [ expand, setExpand ] = useState(true);
	const [ configurations, setConfigurations ] = useState({
		advanced: [],
		protection: [],
	});
	const [isLoading, setIsLoading] = useState({
		isLoadingAdv: false,
	});
	const {
		isLoadingAdv,
	} = isLoading;

	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		nodeInfo,
		zwaveInfo = {},
	} = useSelector((state: Object): Object => state.devices.byId[id]) || {};
	const nodeId = nodeInfo ? nodeInfo.nodeId : '';
	const {
		ConfigurationParameters = [],
	} = zwaveInfo;

	const {
		titleCoverStyle,
		titleStyle,
		iconStyle,
		iconSize,
		padding,
		buttonStyle,
	} = getStyles(layout);

	const protectionClass = nodeInfo.cmdClasses[ZWaveFunctions.COMMAND_CLASS_PROTECTION];
	const configurationClass = nodeInfo.cmdClasses[ZWaveFunctions.COMMAND_CLASS_CONFIGURATION];
	const manufacturerAttributes = nodeInfo.cmdClasses[ZWaveFunctions.COMMAND_CLASS_MANUFACTURER_SPECIFIC];
	const hasProtection = !!protectionClass;
	const hasConfiguration = !!configurationClass;

	const timeoutRef = useRef();
	useEffect((): Function => {
		return () => {
			if (timeoutRef) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const prevNodeInfo = usePreviousValue(nodeInfo);
	const isNodeInfoEqual = isEqual(prevNodeInfo, nodeInfo);

	const protection = useMemo((): ?Object => {
		if (!hasProtection) {
			return;
		}
		return (
			<ProtectionConf
				{...protectionClass}/>
		);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasProtection, isNodeInfoEqual]);

	const onChangeConfigurationAdv = useCallback((data: Object) => {
		const {
			advanced,
		} = configurations;
		const _advanced = advanced.filter((d: Object): boolean => d.number !== data.number);
		setConfigurations({
			...configurations,
			advanced: [
				..._advanced,
				data,
			],
		});
	}, [configurations]);

	const configuration = useMemo((): ?Object => {
		if (!hasConfiguration) {
			return;
		}
		return (
			<AdvancedConf
				{...configurationClass}
				manufacturerAttributes={manufacturerAttributes}
				configurationParameters={ConfigurationParameters}
				onChangeValue={onChangeConfigurationAdv}/>
		);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasConfiguration, manufacturerAttributes, ConfigurationParameters, isNodeInfoEqual]);

	const onPressToggle = useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		setExpand(!expand);
	}, [expand]);

	const dispatch = useDispatch();

	const onPressSave = useCallback(() => {
		const {
			advanced: advancedC = [],
			// protection: protectionC = [],
		} = configurations;
		const paramsConf = advancedC.map(({
			number,
			value,
			size,
		}: Object): Object => {
			return {
				number,
				value,
				size,
			};
		});
		if (paramsConf) {
			setIsLoading({
				...isLoading,
				isLoadingAdv: true,
			});
			dispatch(sendSocketMessage(clientId, 'client', 'forward', {
				'module': 'zwave',
				'action': 'cmdClass',
				'nodeId': nodeId,
				'class': ZWaveFunctions.COMMAND_CLASS_CONFIGURATION,
				'cmd': 'setConfigurations',
				'data': paramsConf,
			}));
		}
		timeoutRef.current = setTimeout(() => {
			dispatch(requestNodeInfo(clientId, clientDeviceId));
			setIsLoading({
				isLoadingAdv: false,
			});
		}, 1000);
	}, [clientDeviceId, clientId, configurations, dispatch, isLoading, nodeId]);

	let hasChanged = useMemo((): boolean => {
		const {
			advanced: advancedC = [],
			protection: protectionC = [],
		} = configurations;
		for (let i = 0; i < advancedC.length; i++) {
			if (advancedC[i].hasChanged) {
				return true;
			}
		}
		for (let i = 0; i < protectionC.length; i++) {
			if (protectionC[i].hasChanged) {
				return true;
			}
		}
		return false;
	}, [configurations]);

	if (!id || !nodeInfo || (!protection && (!configuration || ConfigurationParameters.length === 0))) {
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
					{hasChanged &&
						<TouchableButton
							style={buttonStyle}
							text={'Save new configurations'} // TODO: Translate
							onPress={onPressSave}
							showThrobber={isLoadingAdv}
							disabled={isLoadingAdv}/>
					}
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
