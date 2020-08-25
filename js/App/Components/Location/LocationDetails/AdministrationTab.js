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
	useCallback,
	useState,
} from 'react';
import { useDispatch } from 'react-redux';

import {
	TouchableButton,
	ThemedScrollView,
	EditBox,
	Text,
	InfoBlock,
} from '../../../../BaseComponents';

import {
	validateEmail,
} from '../../../Lib';
import {
	transferGateway,
} from '../../../Actions/Gateways';
import {
	useDialogueBox,
} from '../../../Hooks/Dialoguebox';

import Theme from '../../../Theme';

type Props = {
	screenProps: Object,
	location: Object,
	currentScreen: string,
	navigation: Object,
	route: Object,
};

const AdministrationTab = memo<Object>((props: Props): Object => {
	const {
		screenProps,
		route,
	} = props;
	const {
		location: {id},
	} = route.params || {};

	const { appLayout } = screenProps;

	const {
		container,
		padding,
		eBcontainerStyle,
		contentContainerStyle,
		titleStyle,
		infoContainer,
		infoIconErrorStyle,
		infoTextStyle,
	} = getStyles({appLayout});

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	const dispatch = useDispatch();

	const [
		isLoading,
		setIsLoading,
	] = useState(false);
	const [
		targetEmail,
		setTargetEmail,
	] = useState('');

	const showDialogue = useCallback((message: string, config?: Object = {}) => {
		toggleDialogueBoxState({
			show: true,
			showHeader: true,
			imageHeader: true,
			text: message,
			showPositive: true,
			...config,
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// TODO: Translate
	const onPressExcludeDevice = useCallback(() => {
		if (!targetEmail || !targetEmail.trim()) {
			showDialogue('Email cannot be empty. Please enter a valid email address.');
			return;
		}
		if (!validateEmail(targetEmail)) {
			showDialogue('Email is invalid. Please enter a valid email address.'); // TODO: Translate
			return;
		}

		setIsLoading(true);

		dispatch(transferGateway(id, targetEmail)).then(() => {
			setIsLoading(false);
			showDialogue('An email is sent to the entered address, please confirm.', {
				header: 'Confirm gateway transfer',
			}); // TODO: Translate
		}).catch((err: Object) => {
			setIsLoading(false);
			let message = 'Could not transfer gateway. Please try after sometime'; // TODO: Translate
			if (err.message) {
				message = err.message;
			}
			showDialogue(message);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, showDialogue, targetEmail]);

	const onChangeName = useCallback((value: string) => {
		setTargetEmail(value);
	}, []);

	// TODO: Translate
	return (
		<ThemedScrollView
			level={3}
			style={container}
			contentContainerStyle={contentContainerStyle}>
			<Text
				level={2}
				style={titleStyle}>
					Transfer Gateway
			</Text>
			<EditBox
				value={targetEmail}
				icon={'email'}
				label={'Email'}
				onChangeText={onChangeName}
				appLayout={appLayout}
				autoCapitalize={'none'}
				containerStyle={eBcontainerStyle}/>
			<InfoBlock
				text={'Transfer your gateway to a new owner. Devices, sensors and schedules will be transfered. Events will not be transfered.'}
				appLayout={appLayout}
				infoContainer={infoContainer}
				infoIconStyle={infoIconErrorStyle}
				textStyle={infoTextStyle}/>
			<TouchableButton
				text={'TRANSFER'}
				onPress={onPressExcludeDevice}
				disabled={isLoading}
				style={{
					marginTop: padding * 1.5,
				}}/>
		</ThemedScrollView>
	);
});

const getStyles = ({appLayout}: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const { paddingFactor, brandDanger, btnDisabledBg } = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * 0.045);
	const fontSizeText = deviceWidth * 0.035;

	return {
		padding,
		brandDanger,
		btnDisabledBg,
		container: {
			flex: 1,
		},
		contentContainerStyle: {
			flexGrow: 1,
			marginHorizontal: padding,
			marginTop: padding,
			marginBottom: padding * 2,
		},
		titleStyle: {
			marginBottom: 5,
			fontSize,
		},
		eBcontainerStyle: {
			width: width - (padding * 2),
		},
		infoContainer: {
			flex: 0,
			marginTop: padding / 2,
		},
		infoTextStyle: {
			fontSize: fontSizeText,
		},
	};
};

export default AdministrationTab;
