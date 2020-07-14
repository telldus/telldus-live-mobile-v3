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
	LayoutAnimation,
} from 'react-native';

import {
	View,
	ThemedScrollView,
	FloatingButton,
	EditBox,
} from '../../../BaseComponents';

import {
	preAddDb,
} from '../../Actions/Dashboard';
import {
	LayoutAnimations,
} from '../../Lib';

import {
	SelectCoordinatesDD,
} from './SubViews';

import Theme from '../../Theme';

const SetCoordinates = memo<Object>((props: Object): Object => {
	const {
		onDidMount,
		navigation,
		route,
	} = props;

	const MANUAL_ID = 'manual';
	const MANUAL_VALUE = 'Manual';

	const { selectedType } = route.params || {};

	const [ config, setConfig ] = useState({
		manual: true,
		latitude: '',
		longitude: '',
		id: MANUAL_ID,
	});
	const {
		manual,
		latitude,
		longitude,
		id,
	} = config;

	const { layout } = useSelector((state: Object): Object => state.app);

	useEffect(() => {// TODO: translate
		onDidMount('Set Coordinates', 'Select or manually enter Coordinates');
	}, [onDidMount]);

	const {
		container,
		body,
		longitudeEditContainerStyle,
	} = getStyles({layout});

	const dispatch = useDispatch();

	const onPressNext = useCallback((params: Object) => {
		dispatch(preAddDb({}));
		navigation.navigate('SelectWeatherAttributes', {
			selectedType,
			id,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, selectedType]);

	const onChangeLatitude = useCallback((value: string) => {
		setConfig({
			...config,
			latitude: value,
		});
	}, [config]);

	const onChangeLongitude = useCallback((value: string) => {
		setConfig({
			...config,
			longitude: value,
		});
	}, [config]);

	const _setConfig = useCallback((_config: Object) => {
		setConfig({
			...config,
			..._config,
		});
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
	}, [config]);

	return (
		<View style={{flex: 1}}>
			<ThemedScrollView
				level={3}
				style={container}>
				<View
					level={3}
					style={body}>
					<SelectCoordinatesDD
						setConfig={_setConfig}
						MANUAL_ID={MANUAL_ID}
						MANUAL_VALUE={MANUAL_VALUE}/>
					{manual &&
						<>
							<EditBox
								value={latitude}
								autoFocus={false}
								icon={'sensor'}
								label={'Latitude'}
								onChangeText={onChangeLatitude}
								appLayout={layout}/>
							<EditBox
								value={longitude}
								autoFocus={false}
								icon={'sensor'}
								label={'Longitude'}
								onChangeText={onChangeLongitude}
								appLayout={layout}
								containerStyle={longitudeEditContainerStyle}/>
						</>
					}
				</View>
			</ThemedScrollView>
			<FloatingButton
				onPress={onPressNext}
				imageSource={{uri: 'right_arrow_key'}}/>
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
		longitudeEditContainerStyle: {
			marginTop: padding * 0.5,
		},
	};
};

export default SetCoordinates;
