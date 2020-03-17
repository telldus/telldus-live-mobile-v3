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
	useEffect,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
	TouchableOpacity,
	LayoutAnimation,
} from 'react-native';
import { useIntl } from 'react-intl';

import {
	View,
	Text,
} from '../../../../BaseComponents';

import {
	LayoutAnimations,
	capitalizeFirstLetterOfEachWord,
	getScanButtonLabel,
} from '../../../Lib';

import {
	initiateScanTransmitter433MHz,
} from '../../../Actions';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

let noOp = () => {};
let startScan = noOp, stopScan = noOp, destroyInstance = noOp;

const ScanButton = (props: Object): Object => {
	const {
		scanButtonCover,
		scanButtonTextStyle,
		clientId,
		deviceId,
		callbackOnParamUpdate,
		devicetype,
	} = props;

	const intl = useIntl();
	const { formatMessage } = intl;
	const dispatch = useDispatch();

	const { layout } = useSelector((state: Object): Object => state.app);
	const { addDevice433 = {} } = useSelector((state: Object): Object => state.addDevice);
	const { isScanning = false } = addDevice433;

	useEffect((): Function => {
		const methods = dispatch(initiateScanTransmitter433MHz(clientId, deviceId, formatMessage, callbackOnParamUpdate));
		if (methods) {
			startScan = methods.startScan;
			stopScan = methods.stopScan;
			destroyInstance = methods.destroyInstance;
		}
		return (): Function => {
			stopScan();
			destroyInstance();
			startScan = noOp;
			stopScan = noOp;
			destroyInstance = noOp;
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const {
		scanButtonCoverDef,
		scanButtonTextDefStyle,
		touchableStyleDef,
	} = getStyles(layout);

	function onPress() {
		LayoutAnimation.configureNext(LayoutAnimations.linearCUD(200));
		if (isScanning) {
			stopScan();
		} else {
			startScan();
		}
	}

	const text = isScanning ? capitalizeFirstLetterOfEachWord(formatMessage(i18n.stopScan)) :
		getScanButtonLabel(devicetype, formatMessage);

	return (
		<TouchableOpacity onPress={onPress} style={touchableStyleDef}>
			<View style={[scanButtonCoverDef, scanButtonCover]}>
				<Text style={[scanButtonTextDefStyle, scanButtonTextStyle]}>
					{text.toUpperCase()}
				</Text>
			</View>
		</TouchableOpacity>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		brandSecondary,
		shadow,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * 0.03);
	const heightCover = fontSize * 2.8;

	return {
		scanButtonCoverDef: {
			backgroundColor: brandSecondary,
			height: heightCover,
			...shadow,
			borderRadius: heightCover / 2,
			alignItems: 'center',
			justifyContent: 'center',
			width: Math.floor((deviceWidth - (padding * 3)) / 2 ),
		},
		scanButtonTextDefStyle: {
			fontSize,
			color: '#fff',
		},
		touchableStyleDef: {
			flex: 0,
			borderRadius: heightCover / 2,
		},
	};
};

export default React.memo<Object>(ScanButton);

