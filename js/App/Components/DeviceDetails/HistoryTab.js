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
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { StyleSheet, SectionList, RefreshControl } from 'react-native';
import _ from 'lodash';
import { defineMessages } from 'react-intl';

import { FormattedMessage, Text, View, Icon, FormattedDate, TabBar, Throbber } from 'BaseComponents';
import { DeviceHistoryDetails, HistoryRow } from 'DDSubViews';
import { getDeviceHistory } from 'Actions_Devices';
import { hideModal } from 'Actions_Modal';
import i18n from '../../Translations/common';
import Theme from 'Theme';

const messages = defineMessages({
	historyHeader: {
		id: 'history',
		defaultMessage: 'History',
	},
	loading: {
		id: 'loading',
		defaultMessage: 'Loading',
	},
	noRecentActivity: {
		id: 'deviceSettings.noRecentActivity',
		defaultMessage: 'No recent activity',
	},
});

type Props = {
	dispatch: Function,
	device: Object,
	deviceHistoryNavigator: Object,
	appLayout: Object,
	rowsAndSections: Array<any> | boolean,
	screenProps: Object,
	currentScreen: string,
	currentTab: string,
	showModal: boolean,
};

type State = {
	hasRefreshed: boolean,
	rowsAndSections: Array<any> | boolean,
	refreshing: boolean,
};

class HistoryTab extends View {
	props: Props;
	state: State;

	refreshHistoryData: () => void;
	renderSectionHeader: (Object, String) => void;
	renderRow: (Object, String) => void;
	closeHistoryDetailsModal: () => void;
	_onRefresh: () => void;

	static navigationOptions = ({ navigation }) => ({
		tabBarLabel: ({ tintColor }) => (
			<TabBar
				icon="icon_history"
				tintColor={tintColor}
				label={messages.historyHeader}
				accessibilityLabel={i18n.deviceHistoryTab}/>
		),
		tabBarOnPress: ({scene, jumpToIndex}: Object) => {
			let {state} = navigation;
			state.params.actionOnHistoryTabPress();
			navigation.navigate('History');
		},
	});

	constructor(props: Props) {
		super(props);
		this.state = {
			rowsAndSections: false,
			hasRefreshed: false,
			refreshing: false,
		};
		this.renderRow = this.renderRow.bind(this);
		this.renderSectionHeader = this.renderSectionHeader.bind(this);
		this.closeHistoryDetailsModal = this.closeHistoryDetailsModal.bind(this);

		this._onRefresh = this._onRefresh.bind(this);
	}

	componentDidMount() {
		let {setParams} = this.props.deviceHistoryNavigator;
		setParams({
			actionOnHistoryTabPress: this.closeHistoryDetailsModal,
		});
	}

	closeHistoryDetailsModal() {
		if (this.props.showModal) {
			this.props.dispatch(hideModal());
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.screenProps.currentTab === 'History') {
			if (!this.state.hasRefreshed) {
				this.refreshHistoryData();
				this.setState({
					hasRefreshed: true,
				});
			}
			if (nextProps.device && nextProps.device.history) {
				this.setState({
					rowsAndSections: getRowsAndSections(nextProps.device),
				});
			}
		} else {
			this.setState({
				hasRefreshed: false,
			});
		}
	}

	keyExtractor(item: Object, index: number) {
		let key = `${item.ts}${index}`;
		return key;
	}

	refreshHistoryData() {
		let that = this;
		this.delayRefreshHistoryData = setTimeout(() => {
			that.setState({
				refreshing: true,
			});
			that.props.dispatch(getDeviceHistory(that.props.device))
				.then(() => {
					that.setState({
						refreshing: false,
					});
				}).catch(() => {
					that.setState({
						refreshing: false,
					});
				});
		}, 2000);
	}

	getIcon(deviceState) {
		switch (deviceState) {
			case 'TURNON':
				return 'icon_on';
			case 'TURNOFF':
				return 'icon_off';
			case 'UP':
				return 'icon_up';
			case 'BELL':
				return 'icon_bell';
			case 'DOWN':
				return 'icon_down';
			case 'STOP':
				return 'icon_stop';
			default:
				return '';
		}

	}

	renderRow(item: Object) {
		let { screenProps } = this.props;
		let { intl, currentTab, currentScreen } = screenProps;

		return (
			<HistoryRow id={item.index}
				item={item.item} section={item.section.key}
				intl={intl} isFirst={+item.index === 0}
				currentTab={currentTab} currentScreen={currentScreen}
			/>
		);
	}

	renderSectionHeader(item: Object): Object {
		let { appLayout } = this.props;

		let {
			sectionHeader,
			sectionHeaderText,
		} = this.getStyle(appLayout);

		return (
			<View style={sectionHeader}>
				<FormattedDate
					value={item.section.key}
					localeMatcher= "best fit"
					formatMatcher= "best fit"
					weekday="long"
					day="2-digit"
					month="long"
					style={sectionHeaderText} />
			</View>
		);
	}

	componentWillUnmount() {
		clearTimeout(this.delayRefreshHistoryData);
	}

	shouldComponentUpdate(nextProps, nextState) {
		return nextProps.screenProps.currentTab === 'History';
	}

	_onRefresh() {
		this.setState({
			refreshing: true,
		});
		this.props.dispatch(getDeviceHistory(this.props.device))
			.then(() => {
				this.setState({
					refreshing: false,
				});
			}).catch(() => {
				this.setState({
					refreshing: false,
				});
			});
	}

	render() {
		let { appLayout, screenProps } = this.props;
		let { intl, currentTab, currentScreen } = screenProps;
		let { brandPrimary } = Theme.Core;

		let {
			line,
			throbberContainer,
			throbber,
		} = this.getStyle(appLayout);

		// Loader message when data has not received yet.
		if (!this.state.rowsAndSections) {
			return (
				<View style={styles.containerWhenNoData}>
					<Throbber
						throbberContainerStyle={throbberContainer}
						throbberStyle={throbber}/>
					<Text style={styles.textWhenNoData}>
						<FormattedMessage {...messages.loading} style={styles.textWhenNoData}/>...
					</Text>
				</View>
			);
		}
		// response received but, no history for the requested device, so empty list message.
		if (this.state.rowsAndSections && this.state.rowsAndSections.length === 0) {
			return (
				<View style={styles.containerWhenNoData}>
					<Icon name="exclamation-circle" size={20} color="#F06F0C" />
					<Text style={styles.textWhenNoData}>
						<FormattedMessage {...messages.noRecentActivity} style={styles.textWhenNoData}/>...
					</Text>
				</View>
			);
		}
		return (
			<View style={styles.container}>
				<SectionList
					sections={this.state.rowsAndSections}
					renderItem={this.renderRow}
					renderSectionHeader={this.renderSectionHeader}
					keyExtractor={this.keyExtractor}
					initialNumToRender={10}
					refreshControl={
						<RefreshControl
						  refreshing={this.state.refreshing}
						  onRefresh={this._onRefresh}
						  colors={[brandPrimary]}
						/>
					  }
				/>
				<View style={line}/>
				<DeviceHistoryDetails intl={intl} currentTab={currentTab} currentScreen={currentScreen}/>
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		let isPortrait = height > width;

		return {
			line: {
				backgroundColor: '#A59F9A',
				height: '100%',
				width: 1,
				position: 'absolute',
				left: isPortrait ? width * 0.071333333 : height * 0.071333333,
				top: 0,
				zIndex: -1,
			},
			sectionHeaderText: {
				color: '#A59F9A',
				fontSize: isPortrait ? Math.floor(width * 0.04) : Math.floor(height * 0.04),
			},
			sectionHeader: {
				height: isPortrait ? height * 0.04 : width * 0.04,
				backgroundColor: '#ffffff',
				shadowColor: '#000000',
				shadowOffset: {
					width: 0,
					height: 2,
				},
				shadowRadius: 1,
				shadowOpacity: 1.0,
				elevation: 2,
				justifyContent: 'center',
				paddingLeft: 5,
			},
			throbberContainer: {
				top: 20,
				right: width * 0.5999,
			},
			throbber: {
				fontSize: 24,
			},
		};
	}

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 2,
		backgroundColor: '#eeeeef',
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
	},
	containerWhenNoData: {
		flex: 1,
		paddingTop: 20,
		backgroundColor: '#eeeeef',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	textWhenNoData: {
		marginLeft: 10,
		color: '#A59F9A',
		fontSize: 12,
	},
});

// prepares the row and section data required for the List.
const parseHistoryForSectionList = (data): Array<any> => {
	let result = _.groupBy(data, items => {
		let date = new Date(items.ts * 1000).toDateString();
		return date;
	});
	result = _.reduce(result, (acc, next, index) => {
		acc.push({
			key: index,
			data: next,
		});
		return acc;
	}, []);
	return result;
};

const getRowsAndSections = createSelector(
	[
		({ history }) => history.data,
	],
	(history) => {
		let deviceHistory = parseHistoryForSectionList(history);
		return deviceHistory;
	}
);

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	return {
		deviceHistoryNavigator: ownProps.navigation,
		device: ownProps.screenProps.device,
		appLayout: state.App.layout,
		showModal: state.modal.openModal,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(HistoryTab);
