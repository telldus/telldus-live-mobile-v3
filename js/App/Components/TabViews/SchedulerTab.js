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

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { ScrollView } from 'react-native';
import { defineMessages } from 'react-intl';
import { NavigationActions } from 'react-navigation';
import { createSelector } from 'reselect';
import moment from 'moment';

import {
	FloatingButton,
	FullPageActivityIndicator,
	List,
	ListDataSource,
	View,
} from 'BaseComponents';
import { JobRow, JobsPoster } from 'TabViews_SubViews';
import { editSchedule, getJobs } from 'Actions';

import { parseJobsForListView } from 'Reducers_Jobs';
import type { Schedule } from 'Reducers_Schedule';

import { getDeviceWidth, getTabBarIcon } from 'Lib';

const messages = defineMessages({
	scheduler: {
		id: 'pages.scheduler',
		defaultMessage: 'Scheduler',
		description: 'The Schedulers tab',
	},
});

type NavigationParams = {
	focused: boolean, tintColor: string,
};

type Props = {
	rowsAndSections: Object[],
	devices: Object,
	dispatch: Function,
	navigation: Object,
	screenProps: Object,
};

type State = {
	daysToRender?: React$Element<any>[],
	todayIndex?: number,
};

class SchedulerTab extends View<null, Props, State> {

	static propTypes = {
		rowsAndSections: PropTypes.arrayOf(PropTypes.object),
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

		this.contentOffset = 0;
		this.days = this._getDays(props.rowsAndSections);

		this.state = {
			daysToRender: this._getDaysToRender(props.rowsAndSections.slice(0, 1)),
			todayIndex: 0,
			loading: true,
		};
		this.newSchedule = this.newSchedule.bind(this);
	}

	componentDidMount() {
		const daysToRender = this._getDaysToRender(this.props.rowsAndSections);
		this.setState({ daysToRender });
	}

	componentWillReceiveProps(nextProps: Props) {
		const { rowsAndSections } = nextProps;
		const daysToRender = this._getDaysToRender(rowsAndSections);
		this.setState({ daysToRender });
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.tab === 'schedulerTab';
	}

	componentDidUpdate() {
		const { loading, daysToRender } = this.state;

		if (loading && daysToRender.length === this.props.rowsAndSections.length) {
			setTimeout(() => {
				this.setState({ loading: false });
			});
		}
	}

	onRefresh = () => {
		this.props.dispatch(getJobs());
	}

	newSchedule = () => {
		this.props.screenProps.stackNavigator.navigate('Schedule');
	};

	editJob = (schedule: Schedule) => {
		const { dispatch, screenProps } = this.props;

		const goToEdit = NavigationActions.navigate({
			routeName: 'Schedule',
			params: {},
			action: NavigationActions.navigate({ routeName: 'Edit' }),
		});
		console.log('TEST EDIT');
		dispatch(editSchedule(schedule));
		screenProps.stackNavigator.dispatch(goToEdit);
	};

	render(): React$Element<any> {
		if (this.state.loading) {
			return <FullPageActivityIndicator/>;
		}

		const { todayIndex, daysToRender } = this.state;

		return (
			<View>
				<JobsPoster
					days={this.days}
					todayIndex={todayIndex}
					scroll={this._scroll}
				/>
				<ScrollView
					horizontal={true}
					pagingEnabled={true}
					scrollEnabled={false}
					showsHorizontalScrollIndicator={false}
					ref={this._refScroll}
				>
					{daysToRender}
				</ScrollView>
				<FloatingButton
					onPress={this.newSchedule}
					imageSource={require('./img/iconPlus.png')}
				/>
			</View>
		);
	}

	_refScroll = (scroll: React$Element<ScrollView>) => {
		this.scroll = scroll;
	};

	_scroll = (days: number) => {
		if (this.scroll) {
			const { todayIndex, daysToRender } = this.state;

			const newTodayIndex = todayIndex + days;

			if (newTodayIndex >= 0 && newTodayIndex < daysToRender.length) {
				this.contentOffset += getDeviceWidth() * days;

				this.setState({ todayIndex: newTodayIndex }, () => {
					this.scroll.scrollTo({
						x: this.contentOffset,
						y: 0,
					});
				});
			}
		}
	};

	_getDays = (dataArray: Object[]): Object[] => {
		const days: Object[] = [];

		for (let i = 0; i < dataArray.length; i++) {
			const day = moment().add(i, 'days');

			days.push({
				day: day.format('dddd'),
				date: day.format('DD MMMM YYYY'),
			});
		}

		return days;
	};

	_getDaysToRender = (dataArray: Object[]): React$Element<any>[] => {
		const { container, line } = this._getStyle();

		return dataArray.map((section: Object, i: number): Object => {
			const dataSource = new ListDataSource(
				{
					rowHasChanged: this._rowHasChanged,
				},
			).cloneWithRows(section);

			return (
				<View style={container} key={i}>
					<View style={line}/>
					<List
						dataSource={dataSource}
						renderRow={this._renderRow}
						onRefresh={this.onRefresh}
					/>
				</View>
			);
		});
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
	};

	_renderRow = (props: Object, sectionId: number, rowId: string): React$Element<JobRow> => {
		return (
			<JobRow {...props} editJob={this.editJob} isFirst={+rowId === 0}/>
		);
	};

	_getStyle = (): Object => {
		const deviceWidth = getDeviceWidth();

		return {
			container: {
				flex: 1,
				paddingHorizontal: deviceWidth * 0.04,
				backgroundColor: '#eeeeef',
			},
			line: {
				backgroundColor: '#929292',
				height: '100%',
				width: 1,
				position: 'absolute',
				left: deviceWidth * 0.069333333,
				top: 0,
				zIndex: -1,
			},
		};
	};

}

const getRowsAndSections = createSelector(
	[
		({ jobs }: { jobs: Object[] }): Object[] => jobs,
		({ gateways }: { gateways: Object }): Object => gateways,
		({ devices }: { devices: Object }): Object => devices,
	],
	(jobs: Object[], gateways: Object, devices: Object): Object[] => {
		const { sections, sectionIds } = parseJobsForListView(jobs, gateways, devices);

		const sectionObjects: Object[] = [];

		for (let i = 0; i < sectionIds.length; i++) {
			sectionObjects.push(
				sections[i].reduce((acc: Object, cur: Object, j: number): Object => {
					acc[j] = cur;
					return acc;
				}, {}),
			);
		}

		return sectionObjects;
	},
);

type MapStateToPropsType = {
	rowsAndSections: Object[],
	devices: Object,
	tab: string,
};

const mapStateToProps = (store: Object): MapStateToPropsType => {
	return {
		rowsAndSections: getRowsAndSections(store),
		devices: store.devices,
		tab: store.navigation.tab,
	};
};

const mapDispatchToProps = (dispatch: Function): { dispatch: Function } => {
	return {
		dispatch,
	};
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(SchedulerTab);
