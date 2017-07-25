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
import { createSelector } from 'reselect';
import { defineMessages } from 'react-intl';
import i18n from '../../Translations/common';

import { I18n, List, ListDataSource, Text, View } from 'BaseComponents';
import { JobRow } from 'TabViews_SubViews';
import { getJobs } from 'Actions';
import Theme from 'Theme';

import moment from 'moment-timezone';

import { parseJobsForListView } from 'Reducers_Jobs';

const messages = defineMessages({
	friday: {
		id: 'days.friday',
		defaultMessage: 'Friday',
	},
	monday: {
		id: 'days.monday',
		defaultMessage: 'Monday',
	},
	nextWeekday: {
		id: 'days.nextWeekday',
		defaultMessage: 'Next {weekday}',
		description: 'Used by the scheduler to display the day one week from now. Example "Next Wednesday"',
	},
	saturday: {
		id: 'days.saturday',
		defaultMessage: 'Saturday',
	},
	sunday: {
		id: 'days.sunday',
		defaultMessage: 'Sunday',
	},
	thursday: {
		id: 'days.thursday',
		defaultMessage: 'Thursday',
	},
	today: {
		id: 'days.today',
		defaultMessage: 'Today',
		description: 'Used by the scheduler to display a header with the schedules running today',
	},
	tomorrow: {
		id: 'days.tomorrow',
		defaultMessage: 'Tomorrow',
		description: 'Used by the scheduler to display a header with the schedules running tomorrow',
	},
	tuesday: {
		id: 'days.tuesday',
		defaultMessage: 'Tuesday',
	},
	wednesday: {
		id: 'days.wednesday',
		defaultMessage: 'Wednesday',
	},
});
import { Image, Dimensions, TouchableOpacity } from 'react-native';
import getTabBarIcon from '../../Lib/getTabBarIcon';
import getDeviceWidth from '../../Lib/getDeviceWidth';

type NavigationParams = {
	focused: boolean, tintColor: string,
};

type Props = {
	rowsAndSections: Object,
	devices: Object,
	dispatch: Function,
	screenProps: Object,
};

type State = {
	dataSource: Object,
};


class SchedulerTab extends View<null, Props, State> {

	static propTypes = {
		rowsAndSections: PropTypes.object,
	};

	static navigationOptions = {
		title: I18n.t('pages.scheduler'),
		tabBarIcon: ({ focused, tintColor }: NavigationParams): Object => {
			return getTabBarIcon(focused, tintColor, 'scheduler');
		},
	};

	constructor(props: Props) {
		super(props);

		const { sections, sectionIds } = this.props.rowsAndSections;

		this.state = {
			dataSource: new ListDataSource({
				rowHasChanged: this._rowHasChanged,
				sectionHeaderHasChanged: (s1: Object, s2: Object): boolean => s1 !== s2,
			}).cloneWithRowsAndSections(sections, sectionIds),
		};

		this.windowHeight = Dimensions.get('window').height;
		this.windowWidth = Dimensions.get('window').width;
		this.addButtonSize = this.windowWidth * 0.134666667;
		this.addButtonOffset = this.windowWidth * 0.034666667;
		this.addButtonTextSize = this.windowWidth * 0.056;

		const centerContent = {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
		};

		this.styles = {
			centerContent,
			container: {
				flex: 1,
			},
			header: {
				...centerContent,
				paddingTop: 20,
				backgroundColor: Theme.Core.brandPrimary,
				maxHeight: this.windowHeight * 0.095952024,
			},
			addButton: {
				backgroundColor: Theme.Core.brandSecondary,
				borderRadius: 50,
				position: 'absolute',
				height: this.addButtonSize,
				width: this.addButtonSize,
				bottom: this.addButtonOffset,
				right: this.addButtonOffset,
				shadowColor: '#000',
				shadowOpacity: 0.5,
				shadowRadius: 2,
				shadowOffset: {
					height: 2,
					width: 0,
				},
				elevation: 3,
			},
			iconPlus: {
				width: this.addButtonTextSize,
				height: this.addButtonTextSize,
			},
		};

		this.renderRow = this.renderRow.bind(this);
		this.renderSectionHeader = this.renderSectionHeader.bind(this);
		this.onRefresh = this.onRefresh.bind(this);
	}

	componentWillReceiveProps(nextProps: Props) {
		const { sections, sectionIds } = nextProps.rowsAndSections;

		this.setState({
			dataSource: this.state.dataSource.cloneWithRowsAndSections(sections, sectionIds),
		});
	}

	onRefresh() {
		this.props.dispatch(getJobs());
	}

	render() {
		const { container, line } = this._getStyle();

		return (
			<View style={container}>
				<View style={line}/>
				<List
					dataSource={this.state.dataSource}
					renderRow={this._renderRow}
					onRefresh={this.onRefresh}
				/>
				<TouchableOpacity style={this.styles.addButton} onPress={this.handleAddingSchedule}>
					<View style={this.styles.centerContent}>
						<Image source={require('./img/iconPlus.png')} style={this.styles.iconPlus}/>
					</View>
				</TouchableOpacity>
			</View>
		);
	}

	_renderSectionHeader = (sectionData: Object, sectionId: number): Object => {
		// TODO: move to own Component
		const {formatMessage} = this.props.screenProps.intl;
		const todayInWeek = parseInt(moment().format('d'), 10);
		const absoluteDayInWeek = (todayInWeek + sectionId) % 7;
		const daysInWeek = [messages.sunday, messages.monday, messages.tuesday, messages.wednesday, messages.thursday, messages.friday, messages.saturday];

		let sectionName;
		if (sectionId === 0) {
			sectionName = formatMessage(messages.today);
		} else if (sectionId === 1) {
			sectionName = formatMessage(messages.tomorrow);
		} else if (sectionId === 7) {
			sectionName = formatMessage(messages.nextWeekday, {weekday: formatMessage(daysInWeek[todayInWeek])});
		} else {
			sectionName = formatMessage(daysInWeek[absoluteDayInWeek]);
		}

		return (
			<View style={Theme.Styles.sectionHeader}>
				<Text style={Theme.Styles.sectionHeaderText}>
					{sectionName}
				</Text>
			</View>
		);
	}

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

	_renderRow = (props: Object, sectionId: number, rowId: string): Object => {
		return (
			<JobRow
				{...props}
				isFirst={this._isFirstRow(sectionId, rowId)}
				isLast={this._isLastRow(sectionId, rowId)}
			/>
		);
	};

	_isFirstRow = (sectionId: number, rowId: string): boolean => {
		const { sectionIds } = this.props.rowsAndSections;

		return sectionIds.indexOf(sectionId) === 0 && +rowId === 0;
	};

	_isLastRow = (sectionId: number, rowId: string): boolean => {
		const { sections, sectionIds } = this.props.rowsAndSections;
		const currentSection = sections[sectionId];
		const lastSectionIndex = sectionIds.length - 1;
		const lastRowIndex = currentSection.length - 1;

		return sectionIds.indexOf(sectionId) === lastSectionIndex && +rowId === lastRowIndex;
	};

	_getStyle = (): Object => {
		const deviceWidth = getDeviceWidth();

		return {
			container: {
				flex: 1,
				paddingHorizontal: deviceWidth * 0.04,
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
	(jobs: Object[], gateways: Object, devices: Object): Object => {
		const { sections, sectionIds } = parseJobsForListView(jobs, gateways, devices);
		return {
			sections,
			sectionIds,
		};
	},
);

type MapStateToPropsType = {
	rowsAndSections: Object,
	devices: Object,
};

const mapStateToProps = (store: Object): MapStateToPropsType => {
	return {
		rowsAndSections: getRowsAndSections(store),
		devices: store.devices,
	};
};

const mapDispatchToProps = (dispatch: Function): { dispatch: Function } => {
	return {
		dispatch,
	};
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(SchedulerTab);
