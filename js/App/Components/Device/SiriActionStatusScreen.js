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
	useEffect,
} from 'react';
import {
	ScrollView,
} from 'react-native';
import {
	useSelector,
	useDispatch,
} from 'react-redux';

import {
	View,
	NavigationHeaderPoster,
	Text,
} from '../../../BaseComponents';

import {
	siriShortcutsEventHandler,
} from '../../Actions/App';

import Theme from '../../Theme';

type Props = {
    navigation: Object,
	screenProps: Object,
	route: Object,
};

const SiriActionStatusScreen = memo<Object>((props: Props): Object => {

	const {
		navigation,
		screenProps,
		route = {},
	} = props;
	const {
		params = {},
	} = route;
	const {
		userInfo,
	} = params;

	const dispatch = useDispatch();

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		container,
		contentContainerStyle,
		statusTextStyle,
		blockCoverStyle,
	} = getStyles({
		layout,
	});

	useEffect(() => {
		console.log('TEST userInfo', userInfo);
		dispatch(siriShortcutsEventHandler({
			userInfo,
		}));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<View
			level={3}
			style={container}>
			<NavigationHeaderPoster
				h1={'Siri shortcuts'} // TODO: Translate
				h2={'Action performed from siri shortcut'}
				align={'left'}
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}
				{...screenProps}/>
			<ScrollView
				style={{flex: 1}}
				contentContainerStyle={contentContainerStyle}>
				<View
					level={2}
					style={blockCoverStyle}>
					<Text
						level={3}
						style={statusTextStyle}>
                        status
					</Text>
				</View>
			</ScrollView>
		</View>
	);
});

const getStyles = ({
	layout,
}: Object): Object => {
	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		shadow,
		paddingFactor,
		fontSizeFactorEight,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);

	return {
		container: {
			flex: 1,
		},
		contentContainerStyle: {
			flexGrow: 1,
			padding,
		},
		statusTextStyle: {
			fontSize,
		},
		blockCoverStyle: {
			...shadow,
		},
	};
};

export default SiriActionStatusScreen;
