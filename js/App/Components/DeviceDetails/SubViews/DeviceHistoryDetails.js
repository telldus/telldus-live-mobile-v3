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
import { StyleSheet, ScrollView } from 'react-native';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import { defineMessages } from 'react-intl';
import Platform from 'Platform';
import StatusBar from 'StatusBar';

import { FormattedMessage, View, Text, Icon, Modal, FormattedDate, FormattedTime } from 'BaseComponents';
import i18n from '../../../Translations/common';

import { states, statusMessage } from '../../../../Config';

let statusBarHeight = ExtraDimensions.get('STATUS_BAR_HEIGHT');

const messages = defineMessages({
	success: {
		id: 'success',
		defaultMessage: 'Success',
	},
	failed: {
		id: 'error.failed',
		defaultMessage: 'Failed',
	},
	noReply: {
		id: 'error.noReply',
		defaultMessage: 'No reply',
	},
	notConfirmed: {
		id: 'error.notConfirmed',
		defaultMessage: 'Not confirmed',
	},
	timedOut: {
		id: 'error.timedOut',
		defaultMessage: 'Timed out',
	},
});

class DeviceHistoryDetails extends View {
	constructor(props) {
		super(props);

		let { appLayout } = this.props;

		let stackNavHeaderHeight = appLayout.height * 0.1;
		let deviceIconCoverHeight = appLayout.height * 0.2;
		let tabViewHeaderHeight = appLayout.height * 0.085;
		statusBarHeight = (Platform.OS === 'android' && StatusBar) ? statusBarHeight : 0;
		let totalTop = statusBarHeight + stackNavHeaderHeight + deviceIconCoverHeight + tabViewHeaderHeight;
		this.screenSpaceRemaining = appLayout.height - totalTop;
	}

	getPercentage(value: number) {
		return Math.round(value * 100.0 / 255);
	}

	render() {
		let { detailsData, appOrientation, appLayout } = this.props;
		let textState = '', textDate = '', textStatus = '', originText = '';
		let { origin, stateValue, ts, successStatus } = detailsData;
		if (origin && origin === 'Scheduler') {
			originText = <FormattedMessage {...i18n.scheduler} style={styles.detailsText}/>;
		} else if (origin && origin === 'Incoming signal') {
			originText = <FormattedMessage {...i18n.incommingSignal} style={styles.detailsText}/>;
		} else if (origin && origin === 'Unknown') {
			originText = <FormattedMessage {...i18n.unknown} style={styles.detailsText}/>;
		} else if (origin && origin.substring(0, 5) === 'Group') {
			originText = <Text style={styles.detailsText}><FormattedMessage {...i18n.group} style={styles.detailsText}/> {origin.substring(6, (origin.length))}</Text>;
		} else if (origin && origin.substring(0, 5) === 'Event') {
			originText = <Text style={styles.detailsText}><FormattedMessage {...i18n.event} style={styles.detailsText}/> {origin.substring(6, (origin.length))}</Text>;
		} else {
			originText = origin;
		}
		if (this.props.detailsData.state) {
			let state = states[this.props.detailsData.state];
			textState = state === 'Dim' ? `${state} ${this.getPercentage(stateValue)}%` : state;
			switch (state) {
				case 'On':
					textState = <FormattedMessage {...i18n.on} style={styles.detailsText}/>;
					break;
				case 'Off':
					textState = <FormattedMessage {...i18n.off} style={styles.detailsText}/>;
					break;
				case 'Dim':
					textState = <Text style={styles.detailsText}><FormattedMessage {...i18n.dimmingLevel} style={styles.detailsText}/>: {this.getPercentage(stateValue)}% </Text>;
					break;
				case 'Bell':
					textState = <FormattedMessage {...i18n.bell} style={styles.detailsText}/>;
					break;
				case 'Down':
					textState = <FormattedMessage {...i18n.down} style={styles.detailsText}/>;
					break;
				case 'Up':
					textState = <FormattedMessage {...i18n.up} style={styles.detailsText}/>;
					break;
				case 'Stop':
					textState = <FormattedMessage {...i18n.stop} style={styles.detailsText}/>;
					break;
				default:
					textState = state;
			}
		}
		if (ts) {
			textDate = new Date(ts * 1000);
		}
		if (successStatus >= 0) {
			switch (successStatus) {
				case 0:
					textStatus = <FormattedMessage {...messages.success} style={styles.detailsText}/>;
					break;
				case '1':
					textStatus = <FormattedMessage {...messages.failed} style={styles.detailsTextError}/>;
					break;
				case '2':
					textStatus = <Text style={styles.detailsTextError}><FormattedMessage {...messages.failed} style={styles.detailsTextError}/> (<FormattedMessage {...messages.noReply} style={styles.detailsTextError}/>)</Text>;
					break;
				case '3':
					textStatus = <Text style={styles.detailsTextError}><FormattedMessage {...messages.failed} style={styles.detailsTextError}/> (<FormattedMessage {...messages.timedOut} style={styles.detailsTextError}/>)</Text>;
					break;
				case '4':
					textStatus = <Text style={styles.detailsTextError}><FormattedMessage {...messages.failed} style={styles.detailsTextError}/> (<FormattedMessage {...messages.notConfirmed} style={styles.detailsTextError}/>)</Text>;
					break;
				default:
					let message = statusMessage[successStatus];
					textStatus = successStatus === 0 ? message : `Failed (${message})`;
			}
		}

		let isPortrait = appOrientation === 'PORTRAIT';

		let {
			container,
			titleTextCover,
			detailsContainer,
			detailsRow,
			detailsLabelCover,
			detailsValueCover,
			timeCover,
		} = this.getStyle(isPortrait, appLayout);

		return (
			<Modal
				modalStyle={container}
				modalContainerStyle={container}
				entry= "SlideInY"
				exit= "SlideOutY"
				showOverlay= {false}
				entryDuration= {300}
				exitDuration= {100}
				startValue= {-this.screenSpaceRemaining}
				endValue= {0}
				showModal={this.props.showDetails}>
				<View style={titleTextCover}>
					<Text style={styles.titleText}>
						<FormattedMessage {...i18n.details} style={styles.titleText}/>
					</Text>
				</View>
				<ScrollView contentContainerStyle={detailsContainer}>
					<View style={detailsRow}>
						<View style={detailsLabelCover}>
							<Text style={styles.detailsLabel}>
								<FormattedMessage {...i18n.state} style={styles.detailsLabel}/>
							</Text>
						</View>
						<View style={detailsValueCover}>
							<Text style={styles.detailsText}>
								{textState}
							</Text>
						</View>
					</View>
					<View style={detailsRow}>
						<View style={detailsLabelCover}>
							<Text style={styles.detailsLabel}>
								<FormattedMessage {...i18n.time} style={styles.detailsLabel}/>
							</Text>
						</View>
						{textDate !== '' ?
							<View style={timeCover}>

								<FormattedDate
									value={textDate}
									localeMatcher= "best fit"
									formatMatcher= "best fit"
									weekday="short"
									day="2-digit"
									month="short"
									style={styles.timeText} />
								<FormattedTime
									value={textDate}
									localeMatcher= "best fit"
									formatMatcher= "best fit"
									hour="numeric"
									minute="numeric"
									second="numeric"
									style={[styles.timeText, {paddingLeft: 6, marginRight: 15}]} />
							</View>
							:
							null
						}
					</View>
					<View style={detailsRow}>
						<View style={detailsLabelCover}>
							<Text style={styles.detailsLabel}>
								<FormattedMessage {...i18n.origin} style={styles.detailsLabel}/>
							</Text>
						</View>
						<View style={detailsValueCover}>
							<Text style={styles.detailsText} numberOfLines={1}>
								{originText}
							</Text>
						</View>
					</View>
					<View style={detailsRow}>
						<View style={detailsLabelCover}>
							<Text style={styles.detailsLabel}>
								<FormattedMessage {...i18n.status} style={styles.detailsLabel}/>
							</Text>
						</View>
						<View style={[detailsValueCover, { flexDirection: 'row-reverse' }]}>
							<Text style={successStatus === 0 ? styles.detailsText : styles.detailsTextError} >
								{textStatus}
							</Text>
							{successStatus === 0 ?
								null
								:
								<Icon name="exclamation-triangle" size={24} color="#d32f2f" />
							}
						</View>
					</View>
				</ScrollView>
			</Modal>
		);
	}

	getStyle(isPortrait: boolean, appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;

		return {
			container: {
				flex: 1,
				position: 'absolute',
				backgroundColor: '#eeeeef',
				top: 0,
				bottom: 0,
				width: width,
			},
			titleTextCover: {
				width: width,
				height: isPortrait ? height * 0.09 : width * 0.09,
				justifyContent: 'center',
			},
			detailsContainer: {
				alignItems: 'center',
				justifyContent: 'flex-end',
				flexDirection: 'column',
				width: width,
			},
			detailsRow: {
				flexDirection: 'row',
				height: isPortrait ? height * 0.09 : width * 0.09,
				marginTop: 1,
				backgroundColor: '#fff',
				alignItems: 'center',
				justifyContent: 'space-between',
				width: width,
			},
			detailsLabelCover: {
				alignItems: 'flex-start',
				width: width * 0.3,
			},
			detailsValueCover: {
				alignItems: 'flex-end',
				width: width * 0.7,
			},
			timeCover: {
				justifyContent: 'flex-end',
				width: width * 0.7,
				flexDirection: 'row',
			},
		};
	}
}

const styles = StyleSheet.create({
	titleText: {
		marginLeft: 10,
		color: '#A59F9A',
		fontSize: 16,
	},
	detailsLabel: {
		marginLeft: 10,
		fontSize: 16,
		color: '#4C4C4C',
	},
	detailsText: {
		marginRight: 15,
		color: '#A59F9A',
		fontSize: 16,
	},
	detailsTextError: {
		marginRight: 15,
		color: '#d32f2f',
		fontSize: 16,
	},
	timeText: {
		color: '#A59F9A',
		fontSize: 16,
	},
});

function mapStateToProps(state) {
	return {
		showDetails: state.modal.openModal,
		detailsData: state.modal.data,
		appOrientation: state.App.orientation,
		appLayout: state.App.layout,
	};
}

export default connect(mapStateToProps, null)(DeviceHistoryDetails);
