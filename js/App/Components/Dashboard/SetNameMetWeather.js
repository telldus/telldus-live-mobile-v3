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
	useEffect,
	useState,
} from 'react';
import {
	useSelector,
	useDispatch,
} from 'react-redux';

import {
	View,
	ThemedScrollView,
	FloatingButton,
	EditBox,
	TouchableButton,
} from '../../../BaseComponents';

import {
	addToDashboardBatch,
} from '../../Actions/Dashboard';
import {
	getWeatherInfo,
} from '../../Actions/ThirdParties';
import {
	getSupportedWeatherProviders,
} from '../../Lib/thirdPartyUtils';
import {
	useDialogueBox,
} from '../../Hooks/Dialoguebox';

import Theme from '../../Theme';

const SetNameMetWeather = memo<Object>((props: Object): Object => {
	const {
		onDidMount,
		navigation,
		route,
	} = props;

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	const {
		uniqueId,
		selectedType,
		latitude,
		longitude,
		time,
		timeKey,
		selectedAttributes,
	} = route.params || {};

	const { layout } = useSelector((state: Object): Object => state.app);

	useEffect(() => {// TODO: translate
		onDidMount('Set Name', 'Select a name for the dashboard tile');
	}, [onDidMount]);

	const {
		container,
		body,
	} = getStyles({layout});

	const [ isLoading, setIsLoading ] = useState(false);
	const [ name, setName ] = useState('');

	const dispatch = useDispatch();

	const showDialogue = useCallback((message: string) => {
		toggleDialogueBoxState({
			show: true,
			showHeader: true,
			imageHeader: true,
			text: message,
			showPositive: true,
		});
	}, [toggleDialogueBoxState]);

	const onPressNext = useCallback((params: Object) => {
		if (!name || !name.trim()) { // TODO: translate
			showDialogue('Tile name cannot be empty. Please enter valid name for the dashboard tile.');
			return;
		}
		const {
			id: pId,
			url,
		} = getSupportedWeatherProviders()[selectedType];
		if (!url || !pId) { // TODO: translate
			showDialogue('Data provider URL not found. Please try again later.');
			return;
		}
		setIsLoading(true);
		dispatch(getWeatherInfo(url, {
			lon: longitude,
			lat: latitude,
		}, {
			providerId: selectedType,
			id: uniqueId,
		})).then((res: Object) => {
			setIsLoading(false);
			if (res && res.data) {
				dispatch(addToDashboardBatch(selectedType, {
					[uniqueId]: {
						id: uniqueId,
						latitude,
						longitude,
						selectedType,
						time,
						timeKey,
						selectedAttributes,
						name,
					},
				}));
				navigation.popToTop();
			} else { // TODO: translate
				showDialogue('Could not fetch weather data at the moment. Please try again later.');
			}
		}).catch(() => {
			setIsLoading(false); // TODO: translate
			showDialogue('Could not fetch weather data at the moment. Please try again later.');
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [name, selectedType, longitude, latitude, uniqueId, showDialogue, time, timeKey, selectedAttributes]);

	const _onChangeText = useCallback((value: string) => {
		setName(value);
	}, []);

	const goBack = useCallback(() => {
		navigation.popToTop();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<View style={{flex: 1}}>
			<ThemedScrollView
				level={3}
				style={container}>
				<View
					level={3}
					style={body}>
					<EditBox
						value={name}
						autoFocus={false}
						icon={'sensor'}
						label={'Name'}
						onChangeText={_onChangeText}
						appLayout={layout}/>
				</View>
				<TouchableButton
					text={'EXIT'}
					buttonLevel={isLoading ? 7 : 10}
					onPress={goBack}/>
			</ThemedScrollView>
			<FloatingButton
				onPress={onPressNext}
				showThrobber={isLoading}
				iconName={isLoading ? undefined : 'checkmark'}/>
		</View>
	);
});

const getStyles = ({layout}: Object): Object => {

	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		container: {
			flex: 1,
		},
		body: {
			flex: 1,
			paddingHorizontal: padding,
			paddingBottom: padding,
			paddingTop: padding * 1.5,
		},
	};
};

export default SetNameMetWeather;