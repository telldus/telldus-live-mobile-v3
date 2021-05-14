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
	useMemo,
	useCallback,
	useState,
} from 'react';
import {
	SectionList,
	Platform,
} from 'react-native';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import {
	useIntl,
} from 'react-intl';
import moment from 'moment';

import {
	View,
	Text,
	Icon,
	FloatingButton,
} from '../../../../BaseComponents';
import {
	JobRow,
} from '../../TabViews/SubViews';

import { parseJobsForListView } from '../../../Reducers/Jobs';
import {
	getSectionHeaderFontSize,
} from '../../../Lib';
import {
	getJobs,
} from '../../../Actions/Jobs';
import {
	selectDevice,
	editSchedule,
} from '../../../Actions/Schedule';
import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

type Props = {
	ScreenName: string,
	route: Object,
	navigation: Object,
};

const SchedulesTab = memo<Object>((props: Props): Object => {

	const {
		route,
		ScreenName,
		navigation,
	} = props;
	const { id } = route.params || {};

	const dispatch = useDispatch();

	const intl = useIntl();
	const {
		formatDate,
		formatMessage,
	} = intl;

	const {
		layout,
	} = useSelector((state: Object): Object => state.app);
	const {
		screen,
	} = useSelector((state: Object): Object => state.navigation);
	const jobs = useSelector((state: Object): Object => state.jobs);
	const gateways = useSelector((state: Object): Object => state.gateways);
	const devices = useSelector((state: Object): Object => state.devices);
	const {
		userOptions,
	} = useSelector((state: Object): Object => state.jobsList);

	const _jobs = jobs.filter((job: Object): boolean => {
		return job.deviceId === id;
	});

	const {
		sectionIds,
		sections,
	} = useMemo((): Object => {
		const {
			sectionIds: _sectionIds,
			sections: _sections = {},
		} = parseJobsForListView(_jobs, gateways, devices, userOptions);
		let __sections = [];
		Object.keys(_sections).map((key: string): Object => {
			if (_sections[key] && _sections[key].length > 0) {
				__sections.push({
					data: _sections[key],
					key,
				});
			}
		});

		return {
			sectionIds: _sectionIds,
			sections: __sections,
		};
	}, [_jobs, devices, gateways, userOptions]);

	const device = devices.byId[id] || {};
	const {
		supportedMethods = {},
	} = device;

	const [
		isRefreshing,
		setIsRefreshing,
	] = useState(false);

	const {
		container,
		containerWhenNoData,
		line,
		iconSize,
		textWhenNoData,
		sectionCoverStyle,
		sectionTextStyle,
		padding,
	} = getStyles({layout});

	const _editJob = useCallback((schedule: Object) => {
		dispatch(editSchedule(schedule));
		navigation.navigate('Schedule', {
			editMode: true,
			screen: 'Edit',
			origin: 'DeviceDetails_SchedulesTab',
			params: {
				editMode: true,
				origin: 'DeviceDetails_SchedulesTab',
			},
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const _renderItem = useCallback(({item, index}: Object): Object => {
		return (
			<JobRow
				{...item}
				showNow={false}
				editJob={_editJob}
				isFirst={index === 0}
				gatewayTimezone={item.gatewayTimezone}
				currentScreen={screen}
				ScreenName={ScreenName}
				appLayout={layout}
				intl={intl}
				showName={false}/>
		);
	}, [ScreenName, _editJob, intl, layout, screen]);

	const _renderSectionHeader = useCallback(({section}: Object): Object => {
		const {
			key,
		} = section;

		const day = moment().add(key, 'days');
		const weekday = formatDate(day, {weekday: 'long'});
		const date = formatDate(day, {
			day: '2-digit',
			month: 'long',
			year: 'numeric',
		});

		return (
			<View
				level={2}
				style={[sectionCoverStyle, {
					marginTop: sectionIds.indexOf(parseInt(key, 10)) === 0 ? 0 : padding,
				}]}>
				<Text
					level={6}
					style={sectionTextStyle}>
					{weekday} {date}
				</Text>
			</View>
		);
	}, [formatDate, padding, sectionCoverStyle, sectionTextStyle, sectionIds]);

	const _onRefresh = useCallback(() => {
		setIsRefreshing(true);
		dispatch(getJobs()).then(() => {
			setIsRefreshing(false);
		}).catch(() => {
			setIsRefreshing(false);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const _keyExtractor = useCallback((data: Object = {}, index: number): string => {
		return `${data.id}-${index}`;
	}, []);

	const isEmpty = sectionIds.length === 0;

	const _onPress = useCallback(() => {
		dispatch(selectDevice(id));
		navigation.navigate('Schedule', {
			editMode: false,
			origin: 'DeviceDetails_SchedulesTab',
			screen: supportedMethods.THERMOSTAT ? 'ActionThermostat' : 'Action',
			params: {
				editMode: false,
				origin: 'DeviceDetails_SchedulesTab',
			},
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [supportedMethods, id]);

	return (
		<View
			level={3}
			style={container}>
			{isEmpty ?
				<View style={containerWhenNoData}>
					<Icon name="exclamation-circle" size={iconSize} level={23} />
					<Text style={textWhenNoData}>
						{formatMessage(i18n.noSheduleDevice)}
					</Text>
				</View>
				:
				<View
					level={3}
					style={container}>
					<View style={line}/>
					<SectionList
						sections={sections}
						renderItem={_renderItem}
						renderSectionHeader={_renderSectionHeader}
						onRefresh={_onRefresh}
						keyExtractor={_keyExtractor}
						refreshing={isRefreshing}
						contentContainerStyle={{
							paddingBottom: padding * 6,
						}}
						// To re-render the list to update row style on different weekdays(today screen will have different row design
						// if there is any expired schedule)
						extraData={{
							layout,
						}}
					/>
				</View>
			}
			<FloatingButton
				onPress={_onPress}
				imageSource={{uri: 'icon_plus'}}/>
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
		androidLandMarginLeftFactor,
		paddingFactor,
	} = Theme.Core;

	const headerHeight = (Platform.OS === 'android' && !isPortrait) ? (width * 0.05) + (height * 0.13) : 0;
	const marginLeft = (Platform.OS === 'android' && !isPortrait) ? (width * androidLandMarginLeftFactor) : 0;

	const fontSizeNoData = deviceWidth * 0.03;
	const iconSize = deviceWidth * 0.05;

	const padding = deviceWidth * paddingFactor;

	let nameFontSize = getSectionHeaderFontSize(deviceWidth);

	return {
		padding,
		container: {
			flex: 1,
		},
		containerWhenNoData: {
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
			marginTop: 20,
		},
		line: {
			backgroundColor: '#929292',
			height: '100%',
			width: 1,
			position: 'absolute',
			left: (width - headerHeight) * 0.069333333,
			top: 0,
			zIndex: -1,
		},
		swiperContainer: {
			flex: 1,
			marginLeft,
		},
		textWhenNoData: {
			marginLeft: 10 + (fontSizeNoData * 0.5),
			color: '#A59F9A',
			fontSize: fontSizeNoData,
		},
		iconSize,
		sectionCoverStyle: {
			paddingVertical: 5,
			paddingLeft: padding,
		},
		sectionTextStyle: {
			fontSize: nameFontSize,
		},
	};
};

export default (SchedulesTab: Object);
