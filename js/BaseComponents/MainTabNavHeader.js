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
 */

// @flow

'use strict';

import React, {
	memo,
	useMemo,
	useCallback,
} from 'react';
import {
	Platform,
	Linking,
	Image,
} from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import { useIntl } from 'react-intl';

import Header from './Header';
import HeaderLeftButtonsMainTab from './HeaderLeftButtonsMainTab';
import CampaignIcon from './CampaignIcon';
import Icon from './Icon';
import IconTelldus from './IconTelldus';
import Throbber from './Throbber';

import {
	campaignVisited,
	resetSchedule,
} from '../App/Actions';
import {
	useDialogueBox,
} from '../App/Hooks/Dialoguebox';
import {
	navigate,
} from '../App/Lib/NavigationService';

import Theme from '../App/Theme';

import i18n from '../App/Translations/common';

type Props = {
	children?: Object,
	logoStyle?: Object,
	rounded?: number,
	searchBar?: ?Object,
	showAttentionCapture: boolean,
	forceHideStatus?: boolean,
    style: Object | Array<any>,
    openDrawer?: Function, // Required in Android
    screenReaderEnabled?: boolean,
	drawer?: boolean, // Required in Android
	addingNewLocation?: boolean,

	addNewDevice: Function,
	addNewSensor: Function,
	addNewLocation: Function,
};

const MainTabNavHeader = memo<Object>((props: Props): Object => {

	const {
		drawer,
		screenReaderEnabled,
		openDrawer,
		addingNewLocation,
		addNewDevice,
		addNewSensor,
		addNewLocation,
	} = props;

	const { layout: appLayout } = useSelector((state: Object): Object => state.app);
	const { screen } = useSelector((state: Object): Object => state.navigation);
	const { didFetch: gDidFetch, allIds: gAllIds } = useSelector((state: Object): Object => state.gateways);
	const hasGateways = gDidFetch && gAllIds.length > 0;

	const {
		style,
		logoStyle,
	} = useMemo((): Object => getStyles(appLayout), [appLayout]);

	const dispatch = useDispatch();

	const intl = useIntl();
	const { formatMessage } = intl;

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	const showDialogue = useCallback((message: string) => {
		toggleDialogueBoxState({
			show: true,
			showHeader: true,
			text: message,
			showPositive: true,
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const leftButton = useMemo((): Object | null => {

		const {
			settingsButtonStyle,
			buttonSize,
			menuIconStyle,
			campaingButtonStyle,
			campaingIconStyle,
			menuButtonStyle,
			fontSizeIcon,
		} = getStyles(appLayout);

		const labelButton = formatMessage(i18n.button);
		const labelButtondefaultDescription = formatMessage(i18n.defaultDescriptionButton);

		const navigateToCampaign = () => {
			let url = 'https://live.telldus.com/profile/campaigns';
			const defaultMessage = formatMessage(i18n.errorMessageOpenCampaign);
			Linking.canOpenURL(url)
				.then((supported: boolean): any => {
					if (!supported) {
						showDialogue(defaultMessage);
					} else {
						dispatch(campaignVisited(true));
						return Linking.openURL(url);
					}
				})
				.catch((err: any) => {
					const message = err.message || defaultMessage;
					showDialogue(message);
				});
		};

		const onOpenSetting = () => {
			navigate('Profile');
		};

		const buttons = [
			Platform.select({
				android: {
					style: settingsButtonStyle,
					accessibilityLabel: `${formatMessage(i18n.menuIcon)} ${labelButton}. ${labelButtondefaultDescription}`,
					onPress: openDrawer,
					iconComponent: <Icon
						name="bars"
						size={buttonSize > 22 ? buttonSize : 22}
						style={menuIconStyle}
						color={'#fff'}/>,
				},
				ios: {
					style: settingsButtonStyle,
					accessibilityLabel: `${formatMessage(i18n.settingsHeader)}, ${formatMessage(i18n.defaultDescriptionButton)}`,
					onPress: onOpenSetting,
					iconComponent: <IconTelldus icon={'settings'} style={{
						fontSize: fontSizeIcon,
						color: '#fff',
					}}/>,
				},
			}),
			{
				style: campaingButtonStyle,
				accessibilityLabel: formatMessage(i18n.linkToCampaigns),
				onPress: navigateToCampaign,
				iconComponent: <CampaignIcon
					size={buttonSize > 22 ? buttonSize : 22}
					style={campaingIconStyle}/>,
			},
		];

		const customComponent = <HeaderLeftButtonsMainTab style={menuButtonStyle} buttons={buttons}/>;

		return (drawer && screenReaderEnabled) ? null : {
			customComponent,
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		drawer,
		appLayout,
		screenReaderEnabled,
	]);

	const rightButton = useMemo((): Object | null => {

		const {
			addIconStyle,
			rightButtonStyle,
			fontSizeIcon,
		} = getStyles(appLayout);

		const newSchedule = () => {
			dispatch(resetSchedule());
			navigate('Schedule', {
				editMode: false,
				screen: 'Device',
				params: {
					editMode: false,
				},
			});
		};

		const AddButton = {
			component: <Image source={{uri: 'icon_plus'}} style={addIconStyle}/>,
			style: rightButtonStyle,
			onPress: () => {},
		};

		const throbber = {
			component: <Throbber
				throbberStyle={{
					fontSize: fontSizeIcon,
					color: '#fff',
				}}
				throbberContainerStyle={{
					position: 'relative',
				}}/>,
			onPress: () => {},
		};

		switch (screen) {
			case 'Devices':
				if (!hasGateways) {
					return null;
				}
				return {
					...AddButton,
					onPress: addNewDevice,
					accessibilityLabel: `${formatMessage(i18n.labelAddNewDevice)}, ${formatMessage(i18n.defaultDescriptionButton)}`,
				};
			case 'Sensors':
				if (!hasGateways) {
					return null;
				}
				return {
					...AddButton,
					onPress: addNewSensor,
					accessibilityLabel: `${formatMessage(i18n.labelAddNewSensor)}, ${formatMessage(i18n.defaultDescriptionButton)}`,
				};
			case 'Gateways':
				if (addingNewLocation) {
					return {
						...throbber,
					};
				}
				return {
					...AddButton,
					onPress: addNewLocation,
					accessibilityLabel: `${formatMessage(i18n.addNewLocation)}, ${formatMessage(i18n.defaultDescriptionButton)}`,
				};
			case 'Scheduler':
				if (!hasGateways) {
					return null;
				}
				return {
					...AddButton,
					onPress: newSchedule,
					accessibilityLabel: `${formatMessage(i18n.labelAddEditSchedule)}, ${formatMessage(i18n.defaultDescriptionButton)}`,
				};
			default:
				return null;
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		screen,
		hasGateways,
		appLayout,
		addingNewLocation,
	]);

	return (
		<Header
			{...props}
			style={style}
			logoStyle={logoStyle}
			leftButton={leftButton}
			rightButton={rightButton}/>
	);
});

const getStyles = (appLayout: Object): Object => {

	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceHeight = isPortrait ? height : width;

	const {
		headerHeightFactor,
	} = Theme.Core;

	const { land, port } = headerHeightFactor;

	const buttonSize = isPortrait ? Math.floor(width * 0.04) : Math.floor(height * 0.04);
	const size = Math.floor(deviceHeight * 0.025);
	const fontSizeIcon = size < 20 ? 20 : size;

	return {
		buttonSize,
		fontSizeIcon,
		style: {
			...Platform.select({
				ios: {
					height: (isIphoneX() ? deviceHeight * 0.08 : deviceHeight * land ),
				},
				android:
					isPortrait ? {
						height: deviceHeight * port,
						alignItems: 'center',
					} : {
						transform: [{rotateZ: '-90deg'}],
						position: 'absolute',
						left: Math.ceil(-deviceHeight * 0.4444),
						top: Math.ceil(deviceHeight * 0.4444),
						width: deviceHeight,
						height: Math.ceil(deviceHeight * land),
					},
			}),
		},
		logoStyle: {
			...Platform.select({
				android:
					(!isPortrait) ? {
						position: 'absolute',
						left: deviceHeight * 0.6255,
						top: deviceHeight * 0.0400,
					}
						:
						{},
			}),
		},
		settingsButtonStyle: {
			paddingLeft: 15,
			paddingRight: 8,
			paddingVertical: 4,
		},
		menuIconStyle: {
			...Platform.select({
				android: isPortrait ? null :
					{
						transform: [{rotateZ: '90deg'}],
					},
			}),
		},
		campaingButtonStyle: {
			marginLeft: 4,
			paddingRight: 15,
			paddingLeft: 8,
			paddingVertical: 4,
		},
		campaingIconStyle: {
			...Platform.select({
				android: isPortrait ? null : {
					transform: [{rotateZ: '90deg'}],
				},
			}),
		},
		menuButtonStyle: isPortrait ? null : {
			position: 'absolute',
			left: undefined,
			right: 50,
			top: deviceHeight * 0.03666,
			paddingTop: 0,
			paddingHorizontal: 0,
		},
		addIconStyle: {
			height: fontSizeIcon,
			width: fontSizeIcon,
		},
		rightButtonStyle:
		Platform.select({
			android: isPortrait ? null : {
				top: deviceHeight * 0.03666,
				right: height - 50,
				paddingTop: 0,
				paddingHorizontal: 0,
			},
		}),
	};
};

export default MainTabNavHeader;
