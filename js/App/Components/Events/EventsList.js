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
	useEffect,
	useCallback,
	useState,
} from 'react';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import {
	FlatList,
} from 'react-native';

import {
	View,
	ThemedRefreshControl,
} from '../../../BaseComponents';

import {
	EventRow,
} from './SubViews';
import {
	useAppTheme,
} from '../../Hooks/Theme';
import {
	eventSetEdit,
} from '../../Actions/Event';
import {
	getEvents,
} from '../../Actions/Events';

import Theme from '../../Theme';

type Props = {
	onDidMount: Function,
	navigation: Object,
};

const EventsList = memo<Object>((props: Props): Object => {
	const {
		onDidMount,
		navigation,
	} = props;

	const dispatch = useDispatch();

	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		colors,
	} = useAppTheme();

	const events = useSelector((state: Object): Object => state.events);

	useEffect(() => {
		onDidMount('Events', 'Manage and add events'); // TODO: Translate
	}, [onDidMount]);

	const {
		container,
		contentContainerStyle,
		blockContainerStyle,
	} = getStyle({
		layout,
		colors,
	});

	const onPress = useCallback(({
		id,
		description,
		group,
		minRepeatInterval,
		active,
	}: Object) => {
		dispatch(eventSetEdit({
			id,
			description,
			group,
			minRepeatInterval,
			active,
		}));
		navigation.navigate('EditEvent');
	}, [dispatch, navigation]);

	const renderRow = useCallback((rowData: Object = {}): Object => {
		const {
			description,
			id,
			group,
			minRepeatInterval,
			active,
		} = rowData.item || {};
		return (
			<EventRow
				id={id}
				description={description}
				group={group}
				minRepeatInterval={minRepeatInterval}
				active={active}
				onPress={onPress}
				blockContainerStyle={blockContainerStyle}/>
		);
	}, [blockContainerStyle, onPress]);

	const keyExtractor = useCallback((data: Object): string => {
		return `${data.id}`;
	}, []);

	const [isRefreshing, setIsRefreshing] = useState(false);
	const onRefresh = useCallback(() => {
		(async () => {
			setIsRefreshing(true);
			try {
				await dispatch(getEvents());
			} catch {
				// Ignore
			} finally {
				setIsRefreshing(false);
			}
		})();
	}, [dispatch]);

	return (
		<View
			level={3}
			style={container}>
			<FlatList
				contentContainerStyle={contentContainerStyle}
				data={events}
				renderItem={renderRow}
				numColumns={1}
				keyExtractor={keyExtractor}
				extraData={layout.width}
				refreshControl={
					<ThemedRefreshControl
						enabled={true}
						refreshing={isRefreshing}
						onRefresh={onRefresh}
					/>
				}/>
		</View>
	);
});

const getStyle = ({
	layout,
	colors,
}: Object): Object => {
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
		contentContainerStyle: {
			padding: padding,
			justifyContent: 'center',
		},
		blockContainerStyle: {
			marginBottom: padding / 2,
		},
	};
};

export default EventsList;
