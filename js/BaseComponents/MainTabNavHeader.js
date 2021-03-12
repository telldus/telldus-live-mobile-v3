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
} from 'react-native';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import { useIntl } from 'react-intl';

import Header from './Header';
import HeaderLeftButtonsMainTab from './HeaderLeftButtonsMainTab';
import CampaignIcon from './CampaignIcon';
import Icon from './Icon';
import ThemedImage from './ThemedImage';

import {
	resetSchedule,
} from '../App/Actions';
import {
	useCampaignAction,
} from '../App/Hooks';
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

	addNewDevice: Function,
	addNewSensor: Function,
};

const MainTabNavHeader = memo<Object>((props: Props): Object => {

	const {
		drawer,
		screenReaderEnabled,
		openDrawer,
		addNewDevice,
		addNewSensor,
	} = props;

	const { layout: appLayout } = useSelector((state: Object): Object => state.app);
	const { screen } = useSelector((state: Object): Object => state.navigation);
	const { didFetch: gDidFetch, allIds: gAllIds } = useSelector((state: Object): Object => state.gateways);
	const { didFetch: dDidFetch, allIds: dAllIds } = useSelector((state: Object): Object => state.devices);
	const { didFetch: sDidFetch, allIds: sAllIds } = useSelector((state: Object): Object => state.sensors);
	const hasGateways = gDidFetch && gAllIds.length > 0;
	const hasDevices = dDidFetch && dAllIds.length > 0;
	const hasSensors = sDidFetch && sAllIds.length > 0;

	const {
		style,
		logoStyle,
	} = useMemo((): Object => getStyles(appLayout), [appLayout]);

	const {
		navigateToCampaign,
	} = useCampaignAction();

	const dispatch = useDispatch();

	const intl = useIntl();
	const { formatMessage } = intl;

	const leftButton = useMemo((): Object | null => {

		const {
			settingsButtonStyle,
			buttonSize,
			menuIconStyle,
			campaingButtonStyle,
			campaingIconStyle,
			menuButtonStyle,
		} = getStyles(appLayout);

		const labelButton = formatMessage(i18n.button);
		const labelButtondefaultDescription = formatMessage(i18n.defaultDescriptionButton);

		const buttons = [
			Platform.select({
				android: {
					style: settingsButtonStyle,
					accessibilityLabel: `${formatMessage(i18n.menuIcon)} ${labelButton}. ${labelButtondefaultDescription}`,
					onPress: openDrawer,
					iconComponent: <Icon
						name="bars"
						size={buttonSize}
						style={menuIconStyle}
						level={22}/>,
				},
				ios: {},
			}),
			Platform.select({
				android: {
					style: campaingButtonStyle,
					accessibilityLabel: formatMessage(i18n.linkToCampaigns),
					onPress: navigateToCampaign,
					iconComponent: <CampaignIcon
						size={buttonSize}
						style={campaingIconStyle}
						level={22}/>,
				},
				ios: {},
			}),
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

	const newSchedule = useCallback(() => {
		dispatch(resetSchedule());
		navigate('Schedule', {
			editMode: false,
			screen: 'Device',
			params: {
				editMode: false,
			},
		});
	}, [dispatch]);

	const editDb = useCallback(() => {
		navigate('SelectTypeScreen');
	}, []);

	const rightButton = useMemo((): Object | null => {

		const {
			addIconStyle,
			rightButtonStyle,
		} = getStyles(appLayout);

		const AddButton = {
			component: <ThemedImage
				source={{uri: 'icon_plus'}}
				style={addIconStyle}
				level={4}
			/>,
			style: rightButtonStyle,
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
			case 'Scheduler':
				if (!hasGateways) {
					return null;
				}
				return {
					...AddButton,
					onPress: newSchedule,
					accessibilityLabel: `${formatMessage(i18n.labelAddEditSchedule)}, ${formatMessage(i18n.defaultDescriptionButton)}`,
				};
			case 'Dashboard':
				if (!hasGateways || (!hasDevices && !hasSensors)) {
					return null;
				}
				return {
					...AddButton,
					onPress: editDb,
					accessibilityLabel: `${formatMessage(i18n.editDashboard)}, ${formatMessage(i18n.defaultDescriptionButton)}`,
				};
			default:
				return null;
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		screen,
		hasGateways,
		appLayout,
		hasDevices,
		hasSensors,
		newSchedule,
		editDb,
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
	const deviceWidth = isPortrait ? width : height;

	const {
		headerHeightFactor,
		fontSizeFactorFour,
		fontSizeFactorSix,
	} = Theme.Core;

	const { land, port } = headerHeightFactor;

	const buttonSize = Math.floor(deviceWidth * fontSizeFactorFour);
	const size = Math.floor(deviceHeight * fontSizeFactorSix);
	const fontSizeIcon = size < 20 ? 20 : size;

	return {
		buttonSize: buttonSize > 22 ? buttonSize : 22,
		fontSizeIcon,
		style: {
			...Platform.select({
				ios: {
					height: deviceHeight * land,
				},
				android:
					isPortrait ? {
						height: deviceHeight * port,
						alignItems: 'center',
					} : {
						transform: [{rotateZ: '-90deg'}],
						position: 'absolute',
						zIndex: 1,
						left: -(deviceHeight * 0.459931204),
						top: deviceHeight * 0.459,
						width: deviceHeight,
						height: deviceHeight * land,
					},
			}),
		},
		logoStyle: {
			...Platform.select({
				android:
					isPortrait ? {}
						:
						{
							position: 'absolute',
							left: (deviceHeight * 0.15),
							top: -(deviceHeight * 0.009),
						},
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
		menuButtonStyle: isPortrait ? null : Platform.select({
			android: {
				position: 'absolute',
				left: undefined,
				right: 20,
				top: deviceHeight * 0.03666,
				paddingTop: 0,
				paddingHorizontal: 0,
			},
		}),
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
