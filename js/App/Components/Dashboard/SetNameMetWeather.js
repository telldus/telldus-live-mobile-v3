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
import { useIntl } from 'react-intl';

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
import capitalize from '../../Lib/capitalize';
import {
	useDialogueBox,
} from '../../Hooks/Dialoguebox';

import i18n from '../../Translations/common';

import Theme from '../../Theme';

const SetNameMetWeather = memo<Object>((props: Object): Object => {
	const {
		onDidMount,
		navigation,
		route,
	} = props;

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

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

	useEffect(() => {
		onDidMount(formatMessage(i18n.selectAName));
	}, [formatMessage, onDidMount]);

	const {
		container,
		body,
		exitButtonStyle,
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
		if (!name || !name.trim()) {
			showDialogue(formatMessage(i18n.errorNameFieldEmpty));
			return;
		}
		const {
			url,
		} = getSupportedWeatherProviders()[selectedType];
		setIsLoading(true);
		dispatch(getWeatherInfo(url, {
			lon: longitude,
			lat: latitude,
		}, {
			providerId: selectedType,
			id: uniqueId,
			forcastDay: timeKey,
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
			} else {
				showDialogue(formatMessage(i18n.messageCantFetchWeatherData));
			}
		}).catch(() => {
			setIsLoading(false);
			showDialogue(formatMessage(i18n.messageCantFetchWeatherData));
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
						label={capitalize(formatMessage(i18n.name))}
						onChangeText={_onChangeText}
						appLayout={layout}/>
				</View>
				<TouchableButton
					text={formatMessage(i18n.labelAdd)}
					onPress={onPressNext}
					disabled={isLoading}
					showThrobber={isLoading}/>
				<TouchableButton
					text={formatMessage(i18n.exit)}
					buttonLevel={isLoading ? 7 : 10}
					onPress={goBack}
					style={exitButtonStyle}
					disabled={isLoading}/>
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
		exitButtonStyle: {
			marginTop: padding,
		},
	};
};

export default (SetNameMetWeather: Object);
