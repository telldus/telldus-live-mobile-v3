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
	useIntl,
} from 'react-intl';

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
	useDifferentFromPevValueWhenFalse,
} from '../../../Hooks/App';

import Theme from '../../../Theme';

import {
	sendSocketMessage,
} from '../../../Actions';
import { requestNodeInfo } from '../../../Actions/Websockets';
import i18n from '../../../Translations/common';

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

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	const [ expand, setExpand ] = useState(true);
	const [ configurationsProtection, setConfigurationsProtection ] = useState({});
	const [ configurationsNormal, setConfigurationsNormal ] = useState([]);
	const [ configurationsManual, setConfigurationsManual ] = useState([{
		number: '0',
		size: '1',
		value: '0',
		hasChanged: false,
	}]);
	const [ configurationsManualQueued, setConfigurationsManualQueued ] = useState([]);
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
	const isNodeInfoEqual = useDifferentFromPevValueWhenFalse(
		isEqual(prevNodeInfo, nodeInfo));

	const prevProtection = usePreviousValue(configurationsProtection);
	const isProtectionEqual = useDifferentFromPevValueWhenFalse(
		isEqual(prevProtection, configurationsProtection));
	const configurationsProtectionLength = Object.keys(configurationsProtection).length;

	const prevConfNormal = usePreviousValue(configurationsNormal);
	const isConfNormalEqual = useDifferentFromPevValueWhenFalse(
		isEqual(prevConfNormal, configurationsNormal));
	const prevConfManual = usePreviousValue(configurationsManual);
	const isConfManualEqual = useDifferentFromPevValueWhenFalse(
		isEqual(prevConfManual, configurationsManual));
	const prevConfManualQueued = usePreviousValue(configurationsManualQueued);
	const isConfManualQueuedEqual = useDifferentFromPevValueWhenFalse(
		isEqual(prevConfManualQueued, configurationsManualQueued));

	const onChangeConfigurationProtect = useCallback((protection: Object) => {
		setConfigurationsProtection({
			...configurationsProtection,
			...protection,
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isProtectionEqual, configurationsProtectionLength]);

	const protection = useMemo((): ?Object => {
		if (!hasProtection) {
			return;
		}
		return (
			<ProtectionConf
				{...protectionClass}
				onChangeValue={onChangeConfigurationProtect}/>
		);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasProtection, isNodeInfoEqual, onChangeConfigurationProtect]);

	const onChangeConfigurationAdv = useCallback((data: Object) => {
		const _configurationsNormal = configurationsNormal.filter((d: Object): boolean => d.number !== data.number && d.number !== '');
		setConfigurationsNormal([
			..._configurationsNormal,
			data,
		]);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isConfNormalEqual, configurationsNormal.length]);

	const onChangeConfigurationAdvManual = useCallback((data: Object) => {
		const {
			index,
			inputValueKey,
			hasChanged,
			...others
		} = data;
		const current = configurationsManual[index];
		const changeItem = others[inputValueKey];
		const updatedCurrent = {
			...current,
			[inputValueKey]: changeItem,
			hasChanged,
		};
		let updateManualL = configurationsManual.map((i: Object, ii: number): Object => {
			if (ii === index) {
				return updatedCurrent;
			}
			return i;
		});
		updateManualL = updateManualL.filter((d: Object): boolean => d.hasChanged);
		setConfigurationsManual(updateManualL);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isConfManualEqual, configurationsManual.length]);

	const onChangeConfigurationAdvManualQueued = useCallback((data: Object) => {
		const _configurationsManualQueued = configurationsManualQueued.filter((d: Object): boolean => d.number !== data.number && d.number !== '');
		setConfigurationsManualQueued([
			..._configurationsManualQueued,
			data,
		]);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isConfManualQueuedEqual, configurationsManualQueued.length]);

	const addNewManual = useCallback(() => {
		setConfigurationsManual([
			...configurationsManual,
			{
				number: '0',
				size: '1',
				value: '0',
				hasChanged: false,
			},
		]);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isConfManualEqual, configurationsManual.length]);

	const configuration = useMemo((): ?Object => {
		if (!hasConfiguration) {
			return;
		}
		return (
			<AdvancedConf
				{...configurationClass}
				manufacturerAttributes={manufacturerAttributes}
				configurationParameters={ConfigurationParameters}
				onChangeValue={onChangeConfigurationAdv}
				onChangeConfigurationAdvManual={onChangeConfigurationAdvManual}
				onChangeConfigurationAdvManualQueued={onChangeConfigurationAdvManualQueued}
				configurationsManual={configurationsManual}
				configurationsManualQueued={configurationsManualQueued}
				isLoadingAdv={isLoadingAdv}
				addNewManual={addNewManual}/>
		);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		onChangeConfigurationAdv,
		onChangeConfigurationAdvManual,
		onChangeConfigurationAdvManualQueued,
		addNewManual,
		isLoadingAdv,
		hasConfiguration,
		manufacturerAttributes,
		ConfigurationParameters,
		isNodeInfoEqual,
	]);

	const onPressToggle = useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		setExpand(!expand);
	}, [expand]);

	const dispatch = useDispatch();
	const onPressSave = useCallback(() => {
		let paramsConfAdv = [];
		configurationsNormal.map(({
			number,
			value,
			size,
			hasChanged,
		}: Object): Object => {
			if (hasChanged) {
				paramsConfAdv.push({
					number,
					value,
					size,
				});
			}
		});
		configurationsManual.map(({
			number,
			value,
			size,
			hasChanged,
		}: Object): Object => {
			if (hasChanged) {
				paramsConfAdv.push({
					number,
					value,
					size,
				});
			}
		});
		configurationsManualQueued.map(({
			number,
			value,
			size,
			hasChanged,
		}: Object): Object => {
			if (hasChanged) {
				paramsConfAdv.push({
					number,
					value,
					size,
				});
			}
		});
		if (paramsConfAdv) {
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
				'data': paramsConfAdv,
			}));
		}
		if (configurationsProtection && configurationsProtection.hasChanged) {
			setIsLoading({
				...isLoading,
				isLoadingAdv: true,
			});
			dispatch(sendSocketMessage(clientId, 'client', 'forward', {
				'module': 'zwave',
				'action': 'cmdClass',
				'nodeId': nodeId,
				'class': ZWaveFunctions.COMMAND_CLASS_PROTECTION,
				'cmd': 'setProtection',
				'data': configurationsProtection,
			}));
		}
		timeoutRef.current = setTimeout(() => {
			dispatch(requestNodeInfo(clientId, clientDeviceId));
			setIsLoading({
				isLoadingAdv: false,
			});

			// One dummy call to be able to reset manual conf
			setConfigurationsManual([]);

			setConfigurationsProtection({});
			setConfigurationsNormal([]);
			setConfigurationsManual([{
				number: '0',
				size: '1',
				value: '0',
				hasChanged: false,
			}]);
			setConfigurationsManualQueued([]);
		}, 1000);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		clientDeviceId,
		clientId,
		dispatch,
		isLoading,
		nodeId,
		isConfManualQueuedEqual,
		configurationsManualQueued.length,
		isConfManualEqual,
		configurationsManual.length,
		isConfNormalEqual,
		configurationsNormal.length,
		isProtectionEqual,
		configurationsProtectionLength,
	]);

	let hasChanged = useMemo((): boolean => {
		for (let i = 0; i < configurationsNormal.length; i++) {
			if (configurationsNormal[i].hasChanged) {
				return true;
			}
		}
		for (let i = 0; i < configurationsManual.length; i++) {
			if (configurationsManual[i].hasChanged) {
				return true;
			}
		}
		for (let i = 0; i < configurationsManualQueued.length; i++) {
			if (configurationsManualQueued[i].hasChanged) {
				return true;
			}
		}
		if (!configurationsProtection) {
			return false;
		}
		if (configurationsProtection.hasChanged) {
			return true;
		}
		return false;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isConfManualQueuedEqual,
		configurationsManualQueued.length,
		isConfManualEqual,
		configurationsManual.length,
		isConfNormalEqual,
		configurationsNormal.length,
		isProtectionEqual,
		configurationsProtectionLength,
	]);

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
				<Text
					level={2}
					style={titleStyle}>
					{formatMessage(i18n.configurations)}
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
							text={formatMessage(i18n.saveNewConfigurations)}
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

export default (memo<Object>(Configuration): Object);
