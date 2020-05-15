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
	useCallback,
} from 'react';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {
	useSelector,
} from 'react-redux';
import { useIntl } from 'react-intl';

import {
	View,
	NavigationHeader,
	PosterWithText,
	SettingsRow,
	Text,
} from '../../../BaseComponents';

import Theme from '../../Theme';

type Props = {
	navigation: Object,
};

const AdvancedSettings = memo<Object>((props: Props): Object => {

	const {
		navigation,
	} = props;

	const intl = useIntl();

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		itemsContainer,
		headerMainStyle,
		labelTextStyle,
		touchableStyle,
		contentCoverStyle,
	} = getStyles(layout);

	const showOnGeoFenceLog = useCallback(() => {
		navigation.navigate('GeoFenceEventsLogScreen');
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<View style={{
			flex: 1,
			backgroundColor: Theme.Core.appBackground,
		}}>
			<NavigationHeader
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}/>
			<KeyboardAvoidingView
				behavior="padding"
				style={{flex: 1}}
				contentContainerStyle={{ justifyContent: 'center'}}
				enabled
				keyboardVerticalOffset={Platform.OS === 'android' ? -500 : 0}>
				<ScrollView
					style={{flex: 1}}
					contentContainerStyle={{
						flexGrow: 1,
						alignItems: 'stretch',
					}}
					keyboardShouldPersistTaps={'always'}>
					<PosterWithText
						appLayout={layout}
						align={'center'}
						h2={'Advanced settings'}
						navigation={navigation}/>
					<View style={itemsContainer}>
						<Text style={headerMainStyle}>
							GeoFence
						</Text>
						<SettingsRow
							label={'View Fences Event Log'}
							onPress={showOnGeoFenceLog}
							appLayout={layout}
							intl={intl}
							type={'text'}
							labelTextStyle={labelTextStyle}
							touchableStyle={touchableStyle}
							style={[contentCoverStyle, {
								marginTop: 0,
							}]}/>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
});

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		subHeader,
		paddingFactor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * 0.045);

	return {
		itemsContainer: {
			flex: 1,
			paddingHorizontal: padding,
			paddingBottom: padding,
			paddingTop: padding * 1.5,
		},
		headerMainStyle: {
			marginBottom: 5,
			color: subHeader,
			fontSize,
		},
		labelTextStyle: {
			fontSize,
			color: '#000',
			justifyContent: 'center',
		},
		touchableStyle: {
			height: fontSize * 3.1,
		},
		contentCoverStyle: {
			marginBottom: fontSize / 2,
		},
	};
};

export default AdvancedSettings;
