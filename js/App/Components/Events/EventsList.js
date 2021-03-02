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
	useMemo,
} from 'react';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import {
	SectionList,
} from 'react-native';
import groupBy from 'lodash/groupBy';
import reduce from 'lodash/reduce';
import orderBy from 'lodash/orderBy';

import {
	View,
	ThemedRefreshControl,
	Text,
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
import {
	getSectionHeaderFontSize,
	getSectionHeaderHeight,
} from '../../Lib';

import Theme from '../../Theme';

type Props = {
	onDidMount: Function,
	navigation: Object,
	route: Object,
};

const EventsList = memo<Object>((props: Props): Object => {
	const {
		onDidMount,
		navigation,
		route,
	} = props;
	const {
		params = {},
	} = route;

	const dispatch = useDispatch();

	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		colors,
	} = useAppTheme();

	const events = useSelector((state: Object): Object => state.events);
	const eventGroups = useSelector((state: Object): Object => state.eventGroups) || {};

	const sections = useMemo((): Array<Object> => {
		let orderedD = orderBy(events, [(e: Object): any => {
			let { description = '' } = e;
			description = typeof description !== 'string' ? '' : description;
			return description.toLowerCase();
		}], ['asc']);
		const ev = groupBy(orderedD, (it: Object): string => it.group);
		const list = reduce(ev, (acc: Array<any>, next: Object, index: number): Array<any> => {
			acc.push({
				data: next,
				header: index,
			});
			return acc;
		}, []);
		let orderedList = orderBy(list, [(e: Object): any => {
			let { header = '' } = e;
			header = typeof header !== 'string' ? '' : header;
			return header.toLowerCase();
		}], ['asc']);
		return orderedList;
	}, [events]);

	useEffect(() => {
		onDidMount('Events', 'Manage and add events'); // TODO: Translate
	}, [onDidMount]);

	const {
		container,
		contentContainerStyle,
		blockContainerStyle,
		sectionHeaderCoverStyle,
		sectionHeaderTextStyle,
		pauseIconStyle,
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
		trigger,
		condition,
		action,
	}: Object) => {
		dispatch(eventSetEdit({
			id,
			description,
			group,
			minRepeatInterval,
			active,
			trigger,
			condition,
			action,
		}));
		navigation.navigate('EditEvent', {
			...params,
			isEditMode: true,
		});
	}, [dispatch, navigation, params]);

	const renderSectionHeader = useCallback(({section}: Object = {}): Object => {
		let item = eventGroups[section.header] || {};
		return (
			<View
				style={sectionHeaderCoverStyle}>
				<Text
					level={3}
					style={sectionHeaderTextStyle}>
					{item.name || section.header}
				</Text>
			</View>
		);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sectionHeaderCoverStyle, sectionHeaderTextStyle, Object.keys(eventGroups).length]);

	const renderRow = useCallback((rowData: Object = {}): Object => {
		const {
			description,
			id,
			group,
			minRepeatInterval,
			active,
			trigger,
			condition,
			action,
		} = rowData.item || {};
		return (
			<EventRow
				id={id}
				description={description}
				group={group}
				minRepeatInterval={minRepeatInterval}
				active={active}
				onPress={onPress}
				trigger={trigger}
				condition={condition}
				action={action}
				iconStyle={pauseIconStyle}
				blockContainerStyle={{
					...blockContainerStyle,
					opacity: active ? 1 : 0.6,
				}}/>
		);
	}, [blockContainerStyle, onPress, pauseIconStyle]);

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
			<SectionList
				sections={sections}
				contentContainerStyle={contentContainerStyle}
				renderSectionHeader={renderSectionHeader}
				stickySectionHeadersEnabled={true}
				renderItem={renderRow}
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
		shadow,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	let nameFontSize = getSectionHeaderFontSize(deviceWidth);

	return {
		container: {
			flex: 1,
		},
		contentContainerStyle: {
			paddingBottom: padding,
			paddingHorizontal: padding,
			justifyContent: 'center',
		},
		blockContainerStyle: {
			marginBottom: padding / 2,
		},
		sectionHeaderCoverStyle: {
			flexDirection: 'row',
			height: getSectionHeaderHeight(nameFontSize),
			alignItems: 'center',
			paddingLeft: 5 + (nameFontSize * 0.2),
			justifyContent: 'flex-start',
			marginBottom: padding / 2,
			...shadow,
		},
		sectionHeaderTextStyle: {
			fontSize: nameFontSize,
		},
		pauseIconStyle: {
			fontSize: nameFontSize * 1.2,
			marginRight: padding * 3,
		},
	};
};

export default EventsList;
