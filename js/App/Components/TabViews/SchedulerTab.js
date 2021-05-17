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

import React from 'react';
import {
	FlatList,
	Platform,
} from 'react-native';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
let dayjs = require('dayjs');
import Swiper from 'react-native-swiper';

import {
	FullPageActivityIndicator,
	View,
	Text,
	Icon,
	ThemedRefreshControl,
} from '../../../BaseComponents';
import { JobRow, JobsPoster } from './SubViews';
import {
	NoGateways,
} from './SubViews/EmptyInfo';

import { editSchedule, getJobs, toggleInactive } from '../../Actions';

import { parseJobsForListView } from '../../Reducers/Jobs';
import type { Schedule } from '../../Actions/Types';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

type Props = {
	rowsAndSections: Object,
	showInactive: boolean,
	navigation: Object,
	screenProps: Object,
	dispatch: Function,
	gatewayTimezone: string,
	gatewaysDidFetch: boolean,
	gateways: Array<any>,
	currentScreen: string,
	ScreenName: string,
	removeClippedSubviews?: boolean,
};

type State = {
	todayIndex?: number,
	isRefreshing: boolean,
	loading: boolean,
};

class SchedulerTab extends View<null, Props, State> {

	keyExtractor: (Object) => string;
	onToggleVisibility: (boolean) => void;

	static defaultProps = {
		removeClippedSubviews: true,
	};

	constructor(props: Props) {
		super(props);

		this.noScheduleMessage = props.screenProps.intl.formatMessage(i18n.noUpcommingSchedule);

		this.contentOffset = 0;

		this.state = {
			todayIndex: 0,
			isRefreshing: false,
			isLoading: !Object.keys(props.rowsAndSections).length,
		};
		this.onIndexChanged = this.onIndexChanged.bind(this);
		this.keyExtractor = this.keyExtractor.bind(this);
		this.onToggleVisibility = this.onToggleVisibility.bind(this);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { currentScreen, screenProps, ScreenName } = nextProps;
		const { screenReaderEnabled } = screenProps;
		const { currentScreen: prevScreen } = this.props;
		return (currentScreen === ScreenName) || (currentScreen !== ScreenName && prevScreen === ScreenName && screenReaderEnabled);
	}

	componentDidMount() {
		const { currentScreen, ScreenName } = this.props;
		if (currentScreen === ScreenName) {
			this.refreshJobs();
		}
	}

	onRefresh = () => {
		this.setState({
			isRefreshing: true,
		});
		this.refreshJobs();
	}

	refreshJobs() {
		this.props.dispatch(getJobs()).then(() => {
			this.setState({
				isRefreshing: false,
				isLoading: false,
			});
		}).catch(() => {
			this.setState({
				isRefreshing: false,
				isLoading: false,
			});
		});
	}

	editJob = (schedule: Schedule) => {
		const { dispatch, navigation } = this.props;

		dispatch(editSchedule(schedule));
		navigation.navigate('Schedule', {
			editMode: true,
			screen: 'Edit',
			params: {
				editMode: true,
			},
		});
	};

	onIndexChanged = (index: number) => {
		if (index < 0 || index > 7) {
			this._scroll(0);
		} else {
			this.setState({
				todayIndex: index,
			});
		}
	}

	onToggleVisibility(show: boolean) {
		const { dispatch } = this.props;
		dispatch(toggleInactive(show));
	}

	render(): React$Element<any> {
		const {
			rowsAndSections,
			screenProps,
			showInactive,
			gatewaysDidFetch,
			gateways,
			currentScreen,
			ScreenName,
			removeClippedSubviews,
		} = this.props;
		const {
			appLayout,
			addingNewLocation,
			addNewLocation,
		} = screenProps;
		const { todayIndex, isLoading } = this.state;
		const { days, daysToRender } = this._getDaysToRender(rowsAndSections, appLayout);

		if (isLoading) {
			return <FullPageActivityIndicator/>;
		}

		if (gateways.length === 0 && gatewaysDidFetch) {
			return <NoGateways
				disabled={addingNewLocation}
				onPress={addNewLocation}/>;
		}

		const { swiperContainer } = this.getStyles({
			appLayout,
		});

		return (
			<View
				level={3}
				style={swiperContainer}
				accessible={false}
				importantForAccessibility={currentScreen === ScreenName ? 'no' : 'no-hide-descendants'}>
				<JobsPoster
					days={days}
					todayIndex={todayIndex}
					scroll={this._scroll}
					appLayout={appLayout}
					intl={screenProps.intl}
					onToggleVisibility={this.onToggleVisibility}
					currentScreen={currentScreen}
					showInactive={showInactive}
					ScreenName={ScreenName}
				/>
				<Swiper
					ref={this._refScroll}
					showsButtons={false}
					loadMinimal={true}
					loadMinimalSize={0}
					loop={false}
					index={todayIndex}
					showsPagination={false}
					onIndexChanged={this.onIndexChanged}
					removeClippedSubviews={removeClippedSubviews}>
					{daysToRender}
				</Swiper>
			</View>
		);
	}

	getStyles({
		appLayout,
	}: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const {
			androidLandMarginLeftFactor,
			fontSizeFactorFive,
		} = Theme.Core;

		const headerHeight = (Platform.OS === 'android' && !isPortrait) ? (width * 0.05) + (height * 0.13) : 0;
		const marginLeft = (Platform.OS === 'android' && !isPortrait) ? (width * androidLandMarginLeftFactor) : 0;

		const fontSizeNoData = deviceWidth * 0.03;
		const iconSize = deviceWidth * fontSizeFactorFive;

		return {
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
		};
	}

	_refScroll = (scroll: any): mixed => {
		this.scroll = scroll;
	};

	_scroll = (days: number) => {
		this.scroll.scrollBy(days, true);
	};

	keyExtractor(item: Object): string {
		return item.id.toString();
	}

	_getDaysToRender = (dataArray: Object, appLayout: Object): Object => {
		let days = [], daysToRender = [];
		let { screenProps } = this.props;
		let { todayIndex } = this.state;
		let { formatDate } = screenProps.intl;

		for (let key in dataArray) {
			let schedules = dataArray[key];

			let isEmpty = !schedules || schedules.length === 0;

			const {
				line,
				textWhenNoData,
				iconSize,
				container,
				containerWhenNoData,
			} = this.getStyles({
				appLayout,
			});
			daysToRender.push(
				<View
					level={3}
					style={container}
					key={key}>
					{isEmpty ?
						<View style={containerWhenNoData}>
							<Icon
								level={23}
								name="exclamation-circle"
								size={iconSize}/>
							<Text style={textWhenNoData}>
								{this.noScheduleMessage}
							</Text>
						</View>
						:
						<View
							level={3}
							style={container}>
							<View style={line}/>
							<FlatList
								data={schedules}
								renderItem={this._renderRow}
								keyExtractor={this.keyExtractor}
								// To re-render the list to update row style on different weekdays(today screen will have different row design
								// if there is any expired schedule)
								extraData={{
									todayIndex,
									appLayout,
								}}
								refreshControl={
									<ThemedRefreshControl
										onRefresh={this.onRefresh}
										refreshing={this.state.isRefreshing}
									/>
								}
							/>
						</View>
					}
				</View>
			);

			const day = dayjs().add(key, 'day');
			const weekday = formatDate(day, {weekday: 'long'});
			const date = formatDate(day, {
				day: '2-digit',
				month: 'long',
				year: 'numeric',
			});

			days.push({
				day: weekday,
				date: date,
			});
		}
		return { days, daysToRender };
	};

	_renderRow = (props: Object): React$Element<Object> => {
		// Trying to identify if&where the 'Now' row has to be inserted.
		const { rowsAndSections, screenProps, currentScreen, ScreenName } = this.props;
		const { todayIndex } = this.state;
		const { item } = props;
		const expiredJobs = rowsAndSections[7] ? rowsAndSections[7] : [];
		const lengthExpired = expiredJobs.length;
		const lastExpired = lengthExpired === 0 ? null : expiredJobs[lengthExpired - 1];
		const showNow = ((todayIndex === 0) && lastExpired && (lastExpired.id === item.id));

		return (
			<JobRow
				{...item}
				showNow={showNow}
				editJob={this.editJob}
				isFirst={props.index === 0}
				gatewayTimezone={item.gatewayTimezone}
				currentScreen={currentScreen}
				ScreenName={ScreenName}
				{...screenProps}/>
		);
	};
}

const getRowsAndSections = createSelector(
	[
		({ jobs }: { jobs: Object[] }): Object[] => jobs,
		({ gateways }: { gateways: Object }): Object => gateways,
		({ devices }: { devices: Object }): Object => devices,
		({ jobsList }: { jobsList: Object }): Object => jobsList.userOptions,
	],
	(jobs: Object[], gateways: Object, devices: Object, userOptions: Object): Object => {
		const { sections } = parseJobsForListView(jobs, gateways, devices, userOptions);

		return sections;
	},
);

type MapStateToPropsType = {
	rowsAndSections: Object[],
	showInactive: boolean,
	gateways: Array<string>,
	gatewaysDidFetch: boolean,
	currentScreen: string,
};

const mapStateToProps = (store: Object): MapStateToPropsType => {
	const { jobsList = {}, navigation } = store;
	const { userOptions = {} } = jobsList;
	const { showInactive = true } = userOptions;
	const { screen: currentScreen } = navigation;

	return {
		rowsAndSections: getRowsAndSections(store),
		showInactive,
		gateways: store.gateways.allIds,
		gatewaysDidFetch: store.gateways.didFetch,
		currentScreen,
	};
};

const mapDispatchToProps = (dispatch: Function): { dispatch: Function } => {
	return {
		dispatch,
	};
};

export default (connect(mapStateToProps, mapDispatchToProps)(SchedulerTab): Object);

