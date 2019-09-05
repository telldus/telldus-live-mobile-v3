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

import React from 'react';
import { ScrollView } from 'react-native';
import { useSelector } from 'react-redux';

import {
	View,
	TabBar,
} from '../../../BaseComponents';
import {
	UserInfoBlock,
	LogoutButton,
} from '../Settings/SubViews';
import EditNameBlock from './SubViews/EditNameBlock';
import Theme from '../../Theme';

const ProfileTab = (props: Object): Object => {
	const { screenProps: {toggleDialogueBox} } = props;
	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		container,
		body,
		contentCoverStyleENB,
		valueCoverStyleENB,
		textFieldStyleENB,
		labelTextStyleENB,
	} = getStyles(layout);

	return (
		<ScrollView style={container}>
			<View style={body}>
				<UserInfoBlock blockContainerStyle={{
					marginBottom: 0,
				}}/>
				<EditNameBlock
					contentCoverStyle={contentCoverStyleENB}
					valueCoverStyle={valueCoverStyleENB}
					textFieldStyle={textFieldStyleENB}
					labelTextStyle={labelTextStyleENB}
					toggleDialogueBox={toggleDialogueBox}
				/>
				<LogoutButton
					buttonAccessibleProp={true}
					toggleDialogueBox={toggleDialogueBox}
				/>
			</View>
		</ScrollView>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const padding = deviceWidth * Theme.Core.paddingFactor;
	const paddingEditNameBlock = Math.floor(deviceWidth * 0.045);

	const fontSize = Math.floor(deviceWidth * 0.045);

	return {
		contentCoverStyleENB: {
			padding: paddingEditNameBlock,
		},
		valueCoverStyleENB: {
			paddingVertical: 0,
		},
		textFieldStyleENB: {
			fontSize: fontSize,
		},
		labelTextStyleENB: {
			fontSize: fontSize,
		},
		container: {
			flex: 1,
			backgroundColor: Theme.Core.appBackground,
		},
		body: {
			flex: 1,
			padding,
		},
	};
};

ProfileTab.navigationOptions = ({ navigation }: Object): Object => ({
	tabBarLabel: ({ tintColor }: Object): Object => (
		<TabBar
			icon="user"
			tintColor={tintColor}
			label={'Profile'} // TODO: translate
			accessibilityLabel={'profile settings tab'}/>
	),
	tabBarOnPress: ({scene, jumpToIndex}: Object) => {
		navigation.navigate({
			routeName: 'ProfileTab',
			key: 'ProfileTab',
		});
	},
});

export default ProfileTab;
