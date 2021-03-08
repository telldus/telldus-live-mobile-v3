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
} from 'react';
import {
	LayoutAnimation,
	Linking,
} from 'react-native';
import {
	useSelector,
} from 'react-redux';
import {
	useIntl,
} from 'react-intl';

import {
	View,
	Text,
	EmptyView,
	ThemedMaterialIcon,
	TouchableOpacity,
} from '../../../../../BaseComponents';

import {
	useDialogueBox,
} from '../../../../Hooks/Dialoguebox';
import * as LayoutAnimations from '../../../../Lib/LayoutAnimations';

import Theme from '../../../../Theme';
import i18n from '../../../../Translations/common';

type Props = {
	manualUrl: string,
    fileName: string,
};

const DeviceManualUI = (props: Props): Object => {
	const {
		manualUrl,
		fileName,
	} = props;

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	const [ expand, setExpand ] = useState(true);

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		titleCoverStyle,
		coverStyle,
		titleStyle,
		iconStyle,
		iconSize,
		manualLinkStyle,
	} = getStyles(layout);

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	const onPressViewManual = useCallback(({link}: Object) => {
		const defaultMessage = formatMessage(i18n.errortoast);
		Linking.canOpenURL(link)
			.then((supported: boolean): any => {
				if (!supported) {
					toggleDialogueBoxState({
						show: true,
						showHeader: true,
						imageHeader: true,
						text: defaultMessage,
						showPositive: true,
					});
				} else {
					return Linking.openURL(link);
				}
			})
			.catch((err: any) => {
				const message = err.message || defaultMessage;
				toggleDialogueBoxState({
					show: true,
					showHeader: true,
					imageHeader: true,
					text: message,
					showPositive: true,
				});
			});
	}, [formatMessage, toggleDialogueBoxState]);

	const onPressToggle = useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		setExpand(!expand);
	}, [expand]);

	if (!manualUrl) {
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
					{formatMessage(i18n.linkToManual)}
				</Text>
			</TouchableOpacity>
			{!expand && (
				<View
					level={2}
					style={coverStyle}>
					{!!manualUrl && (
						<>
							<TouchableOpacity
								onPress={onPressViewManual}
								onPressData={{
									link: manualUrl,
								}}>
								<Text
									level={36}
									style={manualLinkStyle}
									ellipsizeMode={'middle'}
									numberOfLines={1}>
									{fileName}
								</Text>
							</TouchableOpacity>
						</>
					)}
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
		shadow,
		fontSizeFactorEight,
		fontSizeFactorOne,
	} = Theme.Core;
	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);
	const padding = deviceWidth * paddingFactor;

	return {
		iconSize: deviceWidth * 0.07,
		titleCoverStyle: {
			flexDirection: 'row',
			marginLeft: padding,
			marginBottom: padding / 2,
			alignItems: 'center',
		},
		titleStyle: {
			marginLeft: 8,
			fontSize: deviceWidth * fontSizeFactorOne,
		},
		coverStyle: {
			marginTop: 2,
			marginHorizontal: padding,
			borderRadius: 2,
			padding,
			marginBottom: padding,
			flexDirection: 'row',
			justifyContent: 'flex-start',
			...shadow,
		},
		manualLinkStyle: {
			flex: 1,
			fontSize,
			marginLeft: 10,
			flexWrap: 'nowrap',
		},
	};
};

export default memo<Object>(DeviceManualUI);
