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
import { ScrollView } from 'react-native';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import { announceForAccessibility } from 'react-native-accessibility';
import Platform from 'Platform';
import StatusBar from 'StatusBar';

import { FormattedMessage, View, Text, Icon, Modal, FormattedDate, FormattedTime } from '../../../../../BaseComponents';
import { states, statusMessage } from '../../../../../Config';

import { getOriginString } from '../../../../Lib';

let statusBarHeight = ExtraDimensions.get('STATUS_BAR_HEIGHT');

import i18n from '../../../../Translations/common';

type Props = {
	detailsData: Object,
	appLayout: Object,
	currentScreen: string,
	intl: Object,
};

class DeviceHistoryDetails extends View {
	constructor(props: Props) {
		super(props);

		let { formatMessage } = props.intl;

		this.labelAnnouncementOnOpen = formatMessage(i18n.announcementOnDetailsModalOpen);
		this.labelAnnouncementOnClose = `${formatMessage(i18n.announcementOnModalClose)}.`;
	}

	getPercentage(value: number): number {
		return Math.round(value * 100.0 / 255);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { width } = nextProps.appLayout;
		const { width: prevWidth } = this.props.appLayout;
		const visibilityChange = nextProps.showDetails !== this.props.showDetails;
		const layoutChange = width !== prevWidth;
		return visibilityChange || layoutChange;
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		if (this.props.showDetails && !prevProps.showDetails) {
			announceForAccessibility(this.labelAnnouncementOnOpen);
		}
		if (prevProps.showDetails && !this.props.showDetails) {
			announceForAccessibility(this.labelAnnouncementOnClose);
		}
	}

	render(): Object {
		let { detailsData, appLayout, currentScreen, intl } = this.props;
		let textState = '', textDate = '', textStatus = '', originText = '';
		let { origin, stateValue, ts, successStatus } = detailsData;

		let {
			startValue,
			container,
			titleTextCover,
			detailsContainer,
			detailsRow,
			detailsLabelCover,
			detailsValueCover,
			timeCover,
			titleText,
			statusIconSize,
			detailsLabel,
			detailsText,
			timeText,
			detailsTextError,
		} = this.getStyle(appLayout);

		originText = getOriginString(origin, intl.formatMessage);

		if (this.props.detailsData.state) {
			let state = states[this.props.detailsData.state];
			textState = state === 'Dim' ? `${state} ${this.getPercentage(stateValue)}%` : state;
			switch (state) {
				case 'On':
					textState = <FormattedMessage {...i18n.on} style={detailsText}/>;
					break;
				case 'Off':
					textState = <FormattedMessage {...i18n.off} style={detailsText}/>;
					break;
				case 'Dim':
					textState = <Text style={detailsText}><FormattedMessage {...i18n.dimmingLevel} style={detailsText}/>: {this.getPercentage(stateValue)}% </Text>;
					break;
				case 'Bell':
					textState = <FormattedMessage {...i18n.bell} style={detailsText}/>;
					break;
				case 'Down':
					textState = <FormattedMessage {...i18n.down} style={detailsText}/>;
					break;
				case 'Up':
					textState = <FormattedMessage {...i18n.up} style={detailsText}/>;
					break;
				case 'Stop':
					textState = <FormattedMessage {...i18n.stop} style={detailsText}/>;
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
					textStatus = <FormattedMessage {...i18n.success} style={detailsText}/>;
					break;
				case '1':
					textStatus = <FormattedMessage {...i18n.failed} style={detailsTextError}/>;
					break;
				case '2':
					textStatus = <Text style={detailsTextError}><FormattedMessage {...i18n.failed} style={detailsTextError}/> (<FormattedMessage {...i18n.noReply} style={detailsTextError}/>)</Text>;
					break;
				case '3':
					textStatus = <Text style={detailsTextError}><FormattedMessage {...i18n.failed} style={detailsTextError}/> (<FormattedMessage {...i18n.timedOut} style={detailsTextError}/>)</Text>;
					break;
				case '4':
					textStatus = <Text style={detailsTextError}><FormattedMessage {...i18n.failed} style={detailsTextError}/> (<FormattedMessage {...i18n.notConfirmed} style={detailsTextError}/>)</Text>;
					break;
				default:
					let message = statusMessage[successStatus];
					textStatus = successStatus === 0 ? message : `Failed (${message})`;
			}
		}

		let accessible = currentScreen === 'History';

		return (
			<Modal
				modalStyle={container}
				modalContainerStyle={container}
				entry= "SlideInY"
				exit= "SlideOutY"
				showOverlay= {false}
				entryDuration= {500}
				exitDuration= {500}
				startValue= {-startValue}
				endValue= {0}
				showModal={this.props.showDetails}>
				<View style={titleTextCover}>
					<Text style={titleText}>
						<FormattedMessage {...i18n.details} style={titleText}/>
					</Text>
				</View>
				<ScrollView contentContainerStyle={detailsContainer}>
					<View style={detailsRow}
						accessible={accessible}
						importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}>
						<View style={detailsLabelCover}>
							<Text style={detailsLabel}>
								<FormattedMessage {...i18n.state} style={detailsLabel}/>
							</Text>
						</View>
						<View style={detailsValueCover}>
							<Text style={detailsText}>
								{textState}
							</Text>
						</View>
					</View>
					<View style={detailsRow}
						accessible={accessible}
						importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}>
						<View style={detailsLabelCover}>
							<Text style={detailsLabel}>
								<FormattedMessage {...i18n.time} style={detailsLabel}/>
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
									style={timeText} />
								<FormattedTime
									value={textDate}
									localeMatcher= "best fit"
									formatMatcher= "best fit"
									hour="numeric"
									minute="numeric"
									second="numeric"
									style={[timeText, {paddingLeft: 6, marginRight: 15}]} />
							</View>
							:
							null
						}
					</View>
					<View style={detailsRow}
						accessible={accessible}
						importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}>
						<View style={detailsLabelCover}>
							<Text style={detailsLabel}>
								<FormattedMessage {...i18n.origin} style={detailsLabel}/>
							</Text>
						</View>
						<View style={detailsValueCover}>
							<Text style={detailsText} numberOfLines={1}>
								{originText}
							</Text>
						</View>
					</View>
					<View style={detailsRow}
						accessible={accessible}
						importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}>
						<View style={detailsLabelCover}>
							<Text style={detailsLabel}>
								<FormattedMessage {...i18n.status} style={detailsLabel}/>
							</Text>
						</View>
						<View style={[detailsValueCover, { flexDirection: 'row-reverse' }]}>
							<Text style={successStatus === 0 ? detailsText : detailsTextError} >
								{textStatus}
							</Text>
							{successStatus === 0 ?
								null
								:
								<Icon name="exclamation-triangle" size={statusIconSize} color="#d32f2f" />
							}
						</View>
					</View>
				</ScrollView>
			</Modal>
		);
	}

	getStyle(appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		let isPortrait = height > width;

		let stackNavHeaderHeight = appLayout.height * 0.1;
		let deviceIconCoverHeight = appLayout.height * 0.2;
		let tabViewHeaderHeight = appLayout.height * 0.085;
		statusBarHeight = (Platform.OS === 'android' && StatusBar) ? statusBarHeight : 0;
		stackNavHeaderHeight = isPortrait ? stackNavHeaderHeight : 0;
		let totalTop = statusBarHeight + stackNavHeaderHeight + deviceIconCoverHeight + tabViewHeaderHeight;
		let screenSpaceRemaining = appLayout.height - totalTop;

		return {
			startValue: screenSpaceRemaining,
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
			titleText: {
				marginLeft: 10,
				color: '#A59F9A',
				fontSize: isPortrait ? Math.floor(width * 0.04) : Math.floor(height * 0.04),
			},
			statusIconSize: isPortrait ? Math.floor(width * 0.047) : Math.floor(height * 0.047),
			detailsLabel: {
				marginLeft: 10,
				fontSize: isPortrait ? Math.floor(width * 0.04) : Math.floor(height * 0.04),
				color: '#4C4C4C',
			},
			detailsText: {
				marginRight: 15,
				color: '#A59F9A',
				fontSize: isPortrait ? Math.floor(width * 0.04) : Math.floor(height * 0.04),
			},
			detailsTextError: {
				marginRight: 15,
				color: '#d32f2f',
				fontSize: isPortrait ? Math.floor(width * 0.04) : Math.floor(height * 0.04),
			},
			timeText: {
				color: '#A59F9A',
				fontSize: isPortrait ? Math.floor(width * 0.04) : Math.floor(height * 0.04),
			},
		};
	}
}

function mapStateToProps(state: Object): Object {
	return {
		appLayout: state.app.layout,
	};
}

export default connect(mapStateToProps, null)(DeviceHistoryDetails);
