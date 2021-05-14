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

import React, { useEffect, useState, useCallback } from 'react';
import {
	ScrollView,
} from 'react-native';
import { useDispatch } from 'react-redux';

import {
	View,
	FloatingButton,
	IconTelldus,
	MaterialTextInput,
} from '../../../../BaseComponents';

import {
	setSensorName,
	getSensorInfo,
	setKeepHistory,
	setIgnoreSensor,
} from '../../../Actions/Sensors';
import {
	showToast,
} from '../../../Actions/App';
import {
	withTheme,
} from '../../HOC/withTheme';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

const SetSensorName = (props: Object): Object => {

	const {
		onDidMount,
		intl,
		appLayout,
		navigation,
		toggleDialogueBox,
		route,
		colors,
	} = props;
	const { formatMessage } = intl;

	const { sensor = {}} = route.params || {};

	const [nameConf, setNameConf] = useState({
		isLoading: false,
		name: '',
	});
	const {
		isLoading,
		name,
	} = nameConf;

	const dispatch = useDispatch();

	useEffect(() => {
		onDidMount(formatMessage(i18n.name), formatMessage(i18n.Add433SNameHeaderTwo));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onChangeName = useCallback((value: string) => {
		setNameConf({
			name: value,
			isLoading,
		});
	}, [isLoading]);

	function submitName() {
		if (!name || !name.trim()) {
			toggleDialogueBox({
				show: true,
				showHeader: true,
				imageHeader: true,
				text: formatMessage(i18n.errorNameFieldEmpty),
				showPositive: true,
			});
			return;
		}
		setNameConf({
			name,
			isLoading: true,
		});
		dispatch(setSensorName(sensor.id, name)).then(async () => {
			try {
				if (sensor.ignored) {
					await dispatch(setIgnoreSensor(sensor.id, 0));
				}
				await dispatch(getSensorInfo(sensor.id));
			} catch (e) {
				// Not imp
			} finally {
				setNameConf({
					name,
					isLoading: false,
				});

				dispatch(setKeepHistory(sensor.id, 1));

				const sensorData = {[sensor.id]: {
					id: sensor.id,
					name,
					mainNode: true,
					clientDeviceId: sensor.clientDeviceId,
				}};
				const prevParams = route.params || {};
				navigation.navigate('Sensors', {
					newSensors: sensorData,
					...prevParams,
				});
			}
		}).catch((err: Object) => {
			const	message = err.message ? err.message : null;
			dispatch(showToast(message));
			setNameConf({
				name,
				isLoading: false,
			});
		});
	}

	const {
		baseColorFour,
		coverStyle,
		textFieldStyle,
		textFieldCoverStyle,
		labelStyle,
		iconStyle,
		accessoryiconStyle,
	} = getStyles({
		appLayout,
		colors,
	});

	const renderLeftAccessory = useCallback((): Object => {
		return <IconTelldus icon={'sensor'} style={accessoryiconStyle}/>;
	}, [accessoryiconStyle]);

	return (
		<ScrollView
			style={{
				flex: 1,
			}}
			contentContainerStyle={{
				flexGrow: 1,
			}}
			keyboardShouldPersistTaps={'always'}>
			<View style={coverStyle}>
				<MaterialTextInput
					value={name}
					label={formatMessage(i18n.name)}
					labelTextStyle={labelStyle}
					baseColor={baseColorFour}
					tintColor={baseColorFour}
					style={textFieldStyle}
					containerStyle={textFieldCoverStyle}
					onChangeText={onChangeName}
					autoCorrect={false}
					autoFocus={true}
					returnKeyType={'done'}
					autoCapitalize={'sentences'}
					renderLeftAccessory={renderLeftAccessory}
					onSubmitEditing={submitName}/>
			</View>
			<FloatingButton
				onPress={submitName}
				iconName={isLoading ? false : 'checkmark'}
				showThrobber={isLoading}
				iconStyle={iconStyle}
			/>
		</ScrollView>
	);
};

const getStyles = ({
	appLayout,
	colors,
}: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		card,
		baseColorFour,
	} = colors;

	const {
		shadow,
		paddingFactor,
		fontSizeFactorEight,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);

	const blockWidth = Math.floor(width - (padding * 2));

	return {
		baseColorFour,
		coverStyle: {
			flex: 1,
		},
		textFieldCoverStyle: {
			width: blockWidth,
			marginTop: padding,
			backgroundColor: card,
			...shadow,
			marginHorizontal: padding,
			padding,
		},
		textFieldStyle: {
			fontSize: fontSize * 1.4,
			color: '#A59F9A',
		},
		labelStyle: {
			fontSize: fontSize,
			color: baseColorFour,
		},
		iconStyle: {
			color: '#fff',
		},
		accessoryiconStyle: {
			marginRight: 5,
			marginBottom: 4,
			fontSize: fontSize * 1.2,
			color: baseColorFour,
		},
	};
};

export default (React.memo<Object>(withTheme(SetSensorName)): Object);
