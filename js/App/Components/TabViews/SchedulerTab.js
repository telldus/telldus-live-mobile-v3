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
import { defineMessages } from 'react-intl';
import { createSelector } from 'reselect';
import moment from 'moment';
import Swiper from 'react-native-swiper';

import {
	FloatingButton,
	FullPageActivityIndicator,
	List,
	ListDataSource,
	View,
	StyleSheet,
	Text,
	Icon,
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

		this.noScheduleMessage = props.screenProps.intl.formatMessage(messages.noScheduleMessage);

		this.contentOffset = 0;
		this.days = this._getDays(props.rowsAndSections);

		this.state = {
			daysToRender: this._getDaysToRender(props.rowsAndSections.slice(0, 1)),
			todayIndex: 0,
			loading: true,
		};
		this.newSchedule = this.newSchedule.bind(this);
		this.onIndexChanged = this.onIndexChanged.bind(this);
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

	_refScroll = (scroll: any): mixed => {
		this.scroll = scroll;
	};

	_scroll = (days: number) => {
		this.scroll.scrollBy(days, true);
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

	_getDaysToRender = (dataArray: Object[]): React$Element<any>[] | Object=> {
		return dataArray.map((section: Object, i: number): Object => {

			let isEmpty = !Object.keys(section).length;
			if (isEmpty) {
				return (
					<View style={[styles.container, styles.containerWhenNoData]} key={i}>
						<Icon name="exclamation-circle" size={20} color="#F06F0C" />
						<Text style={styles.textWhenNoData}>
							{this.noScheduleMessage}
						</Text>
					</View>
				);
			}

			const dataSource = new ListDataSource(
				{
					rowHasChanged: this._rowHasChanged,
				},
			).cloneWithRows(section);

			return (
				<View style={styles.container} key={i}>
					<View style={styles.line}/>
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

const deviceWidth = getDeviceWidth();

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
	line: {
		backgroundColor: '#929292',
		height: '100%',
		width: 1,
		position: 'absolute',
		left: deviceWidth * 0.069333333,
		top: 0,
		zIndex: -1,
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
