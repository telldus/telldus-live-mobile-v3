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
	} = props;

	const [ manual, setManual ] = useState(true);

	const [ latitude, setLatitude ] = useState('');
	const [ longitude, setLongitude ] = useState('');

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
		navigation.goBack();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const setLatLong = useCallback((lat: string, long: string) => {
		setLatitude(lat);
		setLongitude(long);
	}, []);

	const onChangeLatitude = useCallback((value: string) => {
		setLatitude(value);
	}, []);

	const onChangeLongitude = useCallback((value: string) => {
		setLongitude(value);
	}, []);

	const _toggleManualVisibility = useCallback((visibility: boolean) => {
		if (visibility) {
			setLatLong('', '');
		}
		setManual(visibility);
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
	}, [setLatLong]);

	return (
		<View style={{flex: 1}}>
			<ThemedScrollView
				level={3}
				style={container}>
				<View
					level={3}
					style={body}>
					<SelectCoordinatesDD
						toggleManualVisibility={_toggleManualVisibility}
						setLatLong={setLatLong}/>
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
