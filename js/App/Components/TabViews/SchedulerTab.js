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
import { FlatList } from 'react-native';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import moment from 'moment';
import Swiper from 'react-native-swiper';
import Platform from 'Platform';

import {
	FloatingButton,
	FullPageActivityIndicator,
	View,
	StyleSheet,
	Text,
	Icon,
} from '../../../BaseComponents';
import { JobRow, JobsPoster } from './SubViews';
import { editSchedule, getJobs, toggleInactive } from '../../Actions';

import { parseJobsForListView } from '../../Reducers/Jobs';
import type { Schedule } from '../../Reducers/Schedule';

import { getTabBarIcon } from '../../Lib';
import i18n from '../../Translations/common';

type NavigationParams = {
	focused: boolean, tintColor: string,
};

type Props = {
	rowsAndSections: Object,
	showInactive: boolean,
	navigation: Object,
	screenProps: Object,
	dispatch: Function,
};

type State = {
	todayIndex?: number,
	isRefreshing: boolean,
	loading: boolean,
};

class SchedulerTab extends View<null, Props, State> {

	keyExtractor: (Object) => string;
	onToggleVisibility: (boolean) => void;

	static navigationOptions = (props: Object): Object => ({
		title: props.screenProps.intl.formatMessage(i18n.scheduler),
		tabBarIcon: ({ focused, tintColor }: NavigationParams): Object => {
			return getTabBarIcon(focused, tintColor, 'scheduler');
		},
	});

	constructor(props: Props) {
		super(props);

		this.noScheduleMessage = props.screenProps.intl.formatMessage(i18n.noUpcommingSchedule);

		this.contentOffset = 0;

		this.state = {
			todayIndex: 0,
			isRefreshing: false,
			isLoading: !Object.keys(props.rowsAndSections).length,
		};
		this.newSchedule = this.newSchedule.bind(this);
		this.onIndexChanged = this.onIndexChanged.bind(this);
		this.keyExtractor = this.keyExtractor.bind(this);
		this.onToggleVisibility = this.onToggleVisibility.bind(this);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { currentScreen } = nextProps.screenProps;
		return currentScreen === 'Scheduler';
	}

	componentDidMount() {
		const { currentScreen } = this.props.screenProps;
		if (currentScreen === 'Scheduler') {
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

	newSchedule = () => {
		this.props.navigation.navigate({
			routeName: 'Schedule',
			key: 'Schedule',
			params: { editMode: false },
		});
	};

	editJob = (schedule: Schedule) => {
		const { dispatch, navigation } = this.props;

		dispatch(editSchedule(schedule));
		navigation.navigate({
			routeName: 'Schedule',
			key: 'Schedule',
			params: { editMode: true },
		});
	};

	onIndexChanged = (index: number) => {
		this.setState({
			todayIndex: index,
		});
	}

	onToggleVisibility(show: boolean) {
		const { dispatch } = this.props;
		dispatch(toggleInactive(show));
	}

	render(): React$Element<any> {
		const { rowsAndSections, screenProps, showInactive } = this.props;
		const { appLayout, intl, currentScreen } = screenProps;
		const { formatMessage } = intl;
		const { todayIndex, isLoading } = this.state;
		const { days, daysToRender } = this._getDaysToRender(rowsAndSections, appLayout);

		if (isLoading) {
			return <FullPageActivityIndicator/>;
		}

		const { swiperContainer } = this.getStyles(appLayout);

		return (
			<View style={swiperContainer}>
				<JobsPoster
					days={days}
					todayIndex={todayIndex}
					scroll={this._scroll}
					appLayout={appLayout}
					intl={screenProps.intl}
					onToggleVisibility={this.onToggleVisibility}
					currentScreen={currentScreen}
					showInactive={showInactive}
				/>
				<Swiper
					ref={this._refScroll}
					showsButtons={false}
					loadMinimal={true}
					loadMinimalSize={0}
					loop={false}
					showsPagination={false}
					onIndexChanged={this.onIndexChanged}>
					{daysToRender}
				</Swiper>
				<FloatingButton
					onPress={this.newSchedule}
					imageSource={{uri: 'icon_plus'}}
					accessibilityLabel={`${formatMessage(i18n.addSchedule)}, ${formatMessage(i18n.defaultDescriptionButton)}`}
				/>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const headerHeight = (Platform.OS === 'android' && !isPortrait) ? (width * 0.05) + (height * 0.13) : 0;
		const marginLeft = (Platform.OS === 'android' && !isPortrait) ? (width * 0.07303) : 0;

		const fontSizeNoData = deviceWidth * 0.03;
		const iconSize = deviceWidth * 0.05;

		return {
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

			const { line, textWhenNoData, iconSize } = this.getStyles(appLayout);
			daysToRender.push(
				<View style={styles.container} key={key}>
					{isEmpty ?
						<View style={styles.containerWhenNoData}>
							<Icon name="exclamation-circle" size={iconSize} color="#F06F0C" />
							<Text style={textWhenNoData}>
								{this.noScheduleMessage}
							</Text>
						</View>
						:
						<View style={styles.container}>
							<View style={line}/>
							<FlatList
								data={schedules}
								renderItem={this._renderRow}
								onRefresh={this.onRefresh}
								keyExtractor={this.keyExtractor}
								refreshing={this.state.isRefreshing}
								// To re-render the list to update row style on different weekdays(today screen will have different row design
								// if there is any expired schedule)
								extraData={{
									todayIndex,
								}}
							/>
						</View>
					}
				</View>
			);

			const day = moment().add(key, 'days');
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

	_renderRow = (props: Object): React$Element<JobRow> => {
		// Trying to identify if&where the 'Now' row has to be inserted.
		const { rowsAndSections, screenProps } = this.props;
		const { appLayout, intl } = screenProps;
		const { todayIndex } = this.state;
		const { item } = props;
		const expiredJobs = rowsAndSections[7] ? rowsAndSections[7] : [];
		const lengthExpired = expiredJobs.length;
		const lastExpired = lengthExpired === 0 ? null : expiredJobs[lengthExpired - 1];
		const showNow = ((todayIndex === 0) && lastExpired && (lastExpired.id === item.id));

		return (
			<JobRow {...item}
				showNow={showNow}
				editJob={this.editJob}
				isFirst={props.index === 0}
				intl={intl}
				appLayout={appLayout}/>
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#eeeeef',
	},
	containerWhenNoData: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 20,
	},
});

type MapStateToPropsType = {
	rowsAndSections: Object[],
};

const mapStateToProps = (store: Object): MapStateToPropsType => {
	const { jobsList = {} } = store;
	const { userOptions = {} } = jobsList;
	const { showInactive = true } = userOptions;
	return {
		rowsAndSections: getRowsAndSections(store),
		showInactive,
	};
};

const mapDispatchToProps = (dispatch: Function): { dispatch: Function } => {
	return {
		dispatch,
	};
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(SchedulerTab);
