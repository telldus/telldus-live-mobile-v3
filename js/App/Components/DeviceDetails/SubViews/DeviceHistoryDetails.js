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
import { StyleSheet, Dimensions, ScrollView } from 'react-native';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import { defineMessages } from 'react-intl';

import { FormattedMessage, View, Text, Icon, Modal, FormattedDate, FormattedTime } from 'BaseComponents';
import i18n from '../../../Translations/common';

const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;

import { states, statusMessage } from '../../../../Config';

let statusBarHeight = ExtraDimensions.get('STATUS_BAR_HEIGHT');
let stackNavHeaderHeight = deviceHeight * 0.1;
let deviceIconCoverHeight = (deviceHeight * 0.2);
let tabViewHeaderHeight = (deviceHeight * 0.085);
let totalTop = statusBarHeight + stackNavHeaderHeight + deviceIconCoverHeight + tabViewHeaderHeight;
let screenSpaceRemaining = deviceHeight - totalTop;

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
	}

	getPercentage(value: number) {
		return Math.round(value * 100.0 / 255);
	}

	getRelativeStyle() {
		let relativeStyle = {
			container: styles.container,
			detailsRow: styles.detailsRowPort,
			detailsLabelCover: styles.detailsLabelCover,
			detailsValueCover: styles.detailsValueCover,
			timeCover: styles.timeCover,
			detailsContainer: styles.detailsContainerPort,
		};
		if (this.props.appOrientation !== 'PORTRAIT') {
			relativeStyle.container = styles.containerLand;
			relativeStyle.detailsRow = styles.detailsRowLand;
			relativeStyle.detailsLabelCover = styles.detailsLabelCoverLand;
			relativeStyle.detailsValueCover = styles.detailsValueCoverLand;
			relativeStyle.timeCover = styles.timeCoverLand;
			relativeStyle.detailsContainer = styles.detailsContainerLand;
		}
		return relativeStyle;
	}

	render() {
		let { detailsData, screenProps } = this.props;
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

		let {
			container,
			detailsRow,
			detailsLabelCover,
			detailsValueCover,
			timeCover,
			detailsContainer,
		} = this.getRelativeStyle();
		let startValue = -(screenSpaceRemaining - screenProps.posterNextTop);

		return (
			<Modal
				modalStyle={container}
				modalContainerStyle={container}
				entry="SlideInY"
				exit="SlideOutY"
				showOverlay={false}
				entryDuration={300}
				exitDuration={100}
				startValue={startValue}
				endValue={0}
				showModal={this.props.showDetails}>
				<View style={styles.titleTextCover}>
					<Text style={styles.titleText}>
						<FormattedMessage {...i18n.details} style={styles.titleText}/>
					</Text>
				</View>
				<ScrollView contentContainerStyle={[styles.detailsContainer, detailsContainer]}>
					<View style={[styles.detailsRow, detailsRow]}>
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
					<View style={[styles.detailsRow, detailsRow]}>
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
					<View style={[styles.detailsRow, detailsRow]}>
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
					<View style={[styles.detailsRow, detailsRow]}>
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
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'absolute',
		backgroundColor: '#eeeeef',
		top: 0,
		bottom: 0,
		width: deviceWidth,
	},
	containerLand: {
		flex: 1,
		position: 'absolute',
		backgroundColor: '#eeeeef',
		top: 0,
		bottom: 0,
		width: deviceHeight,
	},
	titleTextCover: {
		width: deviceWidth,
		height: deviceHeight * 0.09,
		justifyContent: 'center',
	},
	titleText: {
		marginLeft: 10,
		color: '#A59F9A',
		fontSize: 16,
	},
	detailsContainer: {
		alignItems: 'center',
		justifyContent: 'flex-end',
		flexDirection: 'column',
	},
	detailsContainerPort: {
		width: deviceWidth,
	},
	detailsContainerLand: {
		width: deviceHeight,
	},
	detailsRow: {
		flexDirection: 'row',
		height: deviceHeight * 0.09,
		marginTop: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	detailsRowPort: {
		width: deviceWidth,
	},
	detailsRowLand: {
		width: deviceHeight,
	},
	detailsLabelCover: {
		alignItems: 'flex-start',
		width: deviceWidth * 0.3,
	},
	detailsLabelCoverLand: {
		alignItems: 'flex-start',
		width: deviceHeight * 0.3,
	},
	detailsLabel: {
		marginLeft: 10,
		fontSize: 16,
		color: '#4C4C4C',
	},
	detailsValueCover: {
		alignItems: 'flex-end',
		width: deviceWidth * 0.7,
	},
	detailsValueCoverLand: {
		alignItems: 'flex-end',
		width: deviceHeight * 0.7,
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
	timeCover: {
		justifyContent: 'flex-end',
		width: deviceWidth * 0.7,
		flexDirection: 'row',
	},
	timeCoverLand: {
		justifyContent: 'flex-end',
		width: deviceHeight * 0.7,
		flexDirection: 'row',
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
	};
}

export default connect(mapStateToProps, null)(DeviceHistoryDetails);
