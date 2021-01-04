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

import {
	View,
	ThemedRefreshControl,
	Text,
	ListRow,
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
	const sections = useMemo((): Array<Object> => {
		const ev = groupBy(events, (it: Object): string => it.group);
		return reduce(ev, (acc: Array<any>, next: Object, index: number): Array<any> => {
			acc.push({
				data: next,
				header: index,
			});
			return acc;
		}, []);
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
		roundIconStyle,
		roundIconContainerStyle,
		timeStyle,
		rowContainerStyle,
		rowWithTriangleContainerStyle,
		triangleColor,
		line,
		rowStyle,
		containerStyle,
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
		navigation.navigate('EditEvent');
	}, [dispatch, navigation]);

	const renderSectionHeader = useCallback(({section}: Object = {}): Object => {
		return (
			<View
				style={sectionHeaderCoverStyle}>
				<Text
					style={sectionHeaderTextStyle}>
					{section.header}
				</Text>
			</View>
		);
	}, [sectionHeaderCoverStyle, sectionHeaderTextStyle]);

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
			<ListRow
				roundIcon={!active ? 'pause' : ''}
				roundIconStyle={roundIconStyle}
				roundIconContainerStyle={{
					...roundIconContainerStyle,
					opacity: active ? 1 : 0.5,
				}}
				timeFormat= {{
					hour: 'numeric',
					minute: 'numeric',
				}}
				timeStyle={timeStyle}
				rowStyle={rowStyle}
				containerStyle={containerStyle}
				rowContainerStyle={rowContainerStyle}
				rowWithTriangleContainerStyle={{
					...rowWithTriangleContainerStyle,
					opacity: active ? 1 : 0.5,
				}}
				triangleColor={triangleColor}
				showShadow={active}
				isFirst={rowData.index === 0}
				appLayout={layout}>
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
					blockContainerStyle={blockContainerStyle}/>
			</ListRow>
		);
	}, [blockContainerStyle, containerStyle, layout, onPress, roundIconContainerStyle, roundIconStyle, rowContainerStyle, rowStyle, rowWithTriangleContainerStyle, timeStyle, triangleColor]);

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
			<View style={line}/>
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

	const roundIconSize = deviceWidth * 0.044;

	return {
		container: {
			flex: 1,
		},
		contentContainerStyle: {
			paddingBottom: padding,
			justifyContent: 'center',
		},
		blockContainerStyle: {
			flex: 1,
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
		line: {
			backgroundColor: '#929292',
			height: '100%',
			width: 1,
			position: 'absolute',
			left: (padding * 1.5) + (roundIconSize * 0.6),
			top: 0,
			zIndex: -1,
		},
		roundIconStyle: {
			fontSize: roundIconSize,
		},
		roundIconContainerStyle: {
			marginLeft: padding / 2,
		},
		timeStyle: {

		},
		rowStyle: {
			overflow: 'visible',
		},
		containerStyle: {
			marginLeft: padding,
		},
		rowContainerStyle: {
			flex: 1,
			elevation: 0,
			shadowColor: undefined,
			backgroundColor: 'transparent',
			shadowRadius: 0,
			shadowOpacity: 0,
			shadowOffset: {
				width: 0,
				height: 0,
			},
			marginRight: padding,
		},
		rowWithTriangleContainerStyle: {
			flex: 1,
			marginLeft: padding,
			opacity: 0.5,
		},
		triangleColor: colors.inAppBrandSecondary,
	};
};

export default EventsList;
