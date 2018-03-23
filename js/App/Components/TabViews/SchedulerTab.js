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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages } from 'react-intl';
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
import { editSchedule, getJobs } from '../../Actions';

import { parseJobsForListView } from '../../Reducers/Jobs';
import type { Schedule } from '../../Reducers/Schedule';

import { getTabBarIcon, getRelativeDimensions } from '../../Lib';

const messages = defineMessages({
	scheduler: {
		id: 'pages.scheduler',
		defaultMessage: 'Scheduler',
		description: 'The Schedulers tab',
	},
	noScheduleMessage: {
		id: 'schedule.noScheduleMessage',
		defaultMessage: 'No schedules on this day',
		description: 'Message when no schedules',
	},
});

type NavigationParams = {
	focused: boolean, tintColor: string,
};

type Props = {
	rowsAndSections: Object,
	devices: Object,
	dispatch: Function,
	navigation: Object,
	screenProps: Object,
	appLayout: Object,
};

type State = {
	daysToRender?: React$Element<any>[],
	todayIndex?: number,
	isRefreshing: boolean,
	loading: boolean,
	days: Array<any>,
};

class SchedulerTab extends View<null, Props, State> {

	keyExtractor: (Object) => string;

	static propTypes = {
		rowsAndSections: PropTypes.object,
		devices: PropTypes.object,
		dispatch: PropTypes.func,
		navigation: PropTypes.object,
		screenProps: PropTypes.object,
	};

	static navigationOptions = (props: Object): Object => ({
		title: props.screenProps.intl.formatMessage(messages.scheduler),
		tabBarIcon: ({ focused, tintColor }: NavigationParams): Object => {
			return getTabBarIcon(focused, tintColor, 'scheduler');
		},
	});

	constructor(props: Props) {
		super(props);

		this.noScheduleMessage = props.screenProps.intl.formatMessage(messages.noScheduleMessage);

		this.contentOffset = 0;

		this.state = {
			todayIndex: 0,
			isRefreshing: false,
			isLoading: !Object.keys(props.rowsAndSections).length,
		};
		this.newSchedule = this.newSchedule.bind(this);
		this.onIndexChanged = this.onIndexChanged.bind(this);
		this.keyExtractor = this.keyExtractor.bind(this);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.tab === 'schedulerTab';
	}

	componentDidMount() {
		this.refreshJobs();
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
		this.props.screenProps.stackNavigator.navigate('Schedule', {renderRootHeader: true, editMode: false});
	};

	editJob = (schedule: Schedule) => {
		const { dispatch, screenProps } = this.props;

		dispatch(editSchedule(schedule));
		screenProps.stackNavigator.navigate('Schedule', {renderRootHeader: true, editMode: true});
	};

	onIndexChanged = (index: number) => {
		this.setState({
			todayIndex: index,
		});
	}

	render(): React$Element<any> {
		const { rowsAndSections, appLayout } = this.props;
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
					imageSource={require('./img/iconPlus.png')}
				/>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		const isPortrait = height > width;
		const headerHeight = (Platform.OS === 'android' && !isPortrait) ? (width * 0.05) + (height * 0.13) : 0;
		const marginLeft = (Platform.OS === 'android' && !isPortrait) ? (width * 0.07303) : 0;

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

		for (let key in dataArray) {
			let schedules = dataArray[key];

			let isEmpty = !schedules || schedules.length === 0;
			if (isEmpty) {
				daysToRender.push(
					<View style={[styles.container, styles.containerWhenNoData]} key={key}>
						<Icon name="exclamation-circle" size={20} color="#F06F0C" />
						<Text style={styles.textWhenNoData}>
							{this.noScheduleMessage}
						</Text>
					</View>
				);
			}

			const { line } = this.getStyles(appLayout);
			daysToRender.push(
				<View style={styles.container} key={key}>
					<View style={line}/>
					<FlatList
						data={schedules}
						renderItem={this._renderRow}
						onRefresh={this.onRefresh}
						keyExtractor={this.keyExtractor}
						refreshing={this.state.isRefreshing}
					/>
				</View>
			);

			const day = moment().add(key, 'days');

			days.push({
				day: day.format('dddd'),
				date: day.format('DD MMMM YYYY'),
			});
		}
		return { days, daysToRender };
	};

	_rowHasChanged = (r1: Object, r2: Object): boolean => {
		if (r1 === r2) {
			return false;
		}
		return (
			r1.effectiveHour !== r2.effectiveHour ||
			r1.effectiveMinute !== r2.effectiveMinute ||
			r1.method !== r2.method ||
			r1.deviceId !== r2.deviceId
		);
	}

	_renderRow = (props: Object): React$Element<JobRow> => {
		return (
			<JobRow {...props.item} editJob={this.editJob} isFirst={props.index === 0} intl={this.props.screenProps.intl}/>
		);
	};
}

const getRowsAndSections = createSelector(
	[
		({ jobs }: { jobs: Object[] }): Object[] => jobs,
		({ gateways }: { gateways: Object }): Object => gateways,
		({ devices }: { devices: Object }): Object => devices,
	],
	(jobs: Object[], gateways: Object, devices: Object): Object => {
		const { sections } = parseJobsForListView(jobs, gateways, devices);

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
		paddingTop: 40,
	},
	textWhenNoData: {
		marginLeft: 10,
		color: '#A59F9A',
		fontSize: 12,
	},
});

type MapStateToPropsType = {
	rowsAndSections: Object[],
	devices: Object,
	tab: string,
	appLayout: Object,
};

const mapStateToProps = (store: Object): MapStateToPropsType => {
	return {
		rowsAndSections: getRowsAndSections(store),
		devices: store.devices,
		tab: store.navigation.tab,
		appLayout: getRelativeDimensions(store.App.layout),
	};
};

const mapDispatchToProps = (dispatch: Function): { dispatch: Function } => {
	return {
		dispatch,
	};
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(SchedulerTab);
