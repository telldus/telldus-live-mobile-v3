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
import {
	ScrollView,
	TouchableOpacity,
	BackHandler,
	Platform,
	StatusBar,
} from 'react-native';
const ExtraDimensions = Platform.OS === 'ios' ? {} : require('react-native-extra-dimensions-android');
import { announceForAccessibility } from 'react-native-accessibility';

import {
	FormattedMessage,
	View,
	Text,
	Icon,
	Modal,
	FormattedDate,
	FormattedTime,
	IconTelldus,
} from '../../../../../BaseComponents';
import { states, statusMessage } from '../../../../../Config';

import {
	getOriginString,
	getDeviceStateMethod,
	getKnownModes,
} from '../../../../Lib';

let statusBarHeight = Platform.OS === 'android' ? ExtraDimensions.get('STATUS_BAR_HEIGHT') : 0;

import i18n from '../../../../Translations/common';

import Theme from '../../../../Theme';

type Props = {
	detailsData: Object,
	appLayout: Object,
	currentScreen: string,
	intl: Object,
	closeHistoryDetailsModal: () => void,
};

class DeviceHistoryDetails extends View {
	constructor(props: Props) {
		super(props);

		let { formatMessage } = props.intl;

		this.labelAnnouncementOnOpen = formatMessage(i18n.announcementOnDetailsModalOpen);
		this.labelAnnouncementOnClose = `${formatMessage(i18n.announcementOnModalClose)}.`;
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	handleBackPress = (): boolean => {
		let {
			showDetails,
			closeHistoryDetailsModal,
		} = this.props;
		if (showDetails) {
			closeHistoryDetailsModal();
			return true;
		}
		return false;
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
		let {
			detailsData,
			appLayout,
			currentScreen,
			intl,
			closeHistoryDetailsModal,
		} = this.props;
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
			closeIconCoverStyle,
			closeIconStyle,
		} = this.getStyle(appLayout);

		originText = getOriginString(origin, intl.formatMessage);

		if (this.props.detailsData.state) {
			let state = states[this.props.detailsData.state];
			textState = state === 'Dim' ? `${state} ${this.getPercentage(stateValue)}%` : state;
			switch (state) {
				case 'On':
					textState = <FormattedMessage {...i18n.on} level={4} style={detailsText}/>;
					break;
				case 'Off':
					textState = <FormattedMessage {...i18n.off} level={4} style={detailsText}/>;
					break;
				case 'Dim':
					textState = <Text level={4} style={detailsText}><FormattedMessage {...i18n.dimmingLevel} style={detailsText}/>: {this.getPercentage(stateValue)}% </Text>;
					break;
				case 'Bell':
					textState = <FormattedMessage level={4} {...i18n.bell} style={detailsText}/>;
					break;
				case 'Down':
					textState = <FormattedMessage level={4} {...i18n.down} style={detailsText}/>;
					break;
				case 'Up':
					textState = <FormattedMessage level={4} {...i18n.up} style={detailsText}/>;
					break;
				case 'Stop':
					textState = <FormattedMessage level={4} {...i18n.stop} style={detailsText}/>;
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
					textStatus = <FormattedMessage {...i18n.success} level={4} style={detailsText}/>;
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

		let deviceState = getDeviceStateMethod(detailsData.state);
		if (deviceState === 'THERMOSTAT') {
			let thermoStateValue = {};
			let sv = detailsData.stateValue.replace(/'/g, '"');
			try {
				thermoStateValue = JSON.parse(sv);
			} catch (e) {
				// Ignore
			}
			const {
				mode,
				temperature,
				changeMode,
			} = thermoStateValue;

			let modeValue = '';
			const knownModes = getKnownModes(intl.formatMessage);
			if (mode) {
				knownModes.map((km: Object) => {
					if (mode === km.mode) {
						modeValue = km.label.toLowerCase();
					}
				});
			}

			if (mode && changeMode && typeof temperature !== 'undefined') {
				textState = intl.formatMessage(i18n.modeAndTempLarge, {
					mode: modeValue,
					tempAndUnit: `${temperature}°C`,
				});
			} else if (mode && changeMode) {
				textState = intl.formatMessage(i18n.modeOnlyLarge, {
					mode: modeValue,
				});
			} else {
				textState = intl.formatMessage(i18n.tempOnlyLarge, {
					mode: modeValue,
					tempAndUnit: `${temperature}°C`,
				});
			}
		}

		return (
			<Modal
				modalStyle={container}
				entry= "SlideInY"
				exit= "SlideOutY"
				showOverlay= {false}
				entryDuration= {500}
				exitDuration= {500}
				startValue= {-startValue}
				endValue= {0}
				showModal={this.props.showDetails}>
				<View style={titleTextCover}>
					<Text
						level={2}
						style={titleText}>
						<FormattedMessage {...i18n.details} style={titleText}/>
					</Text>
					<TouchableOpacity
						style={closeIconCoverStyle}
						onPress={closeHistoryDetailsModal}>
						<IconTelldus
							level={23}
							icon="statusx"
							style={closeIconStyle}/>
					</TouchableOpacity>
				</View>
				<ScrollView
					style={{
						flex: 1,
					}}
					contentContainerStyle={detailsContainer}>
					<View
						level={2}
						style={detailsRow}
						accessible={accessible}
						importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}>
						<View style={detailsLabelCover}>
							<Text
								level={3}
								style={detailsLabel}>
								<FormattedMessage {...i18n.state} style={detailsLabel}/>
							</Text>
						</View>
						<View style={detailsValueCover}>
							<Text
								level={4}
								style={detailsText}>
								{textState}
							</Text>
						</View>
					</View>
					<View
						level={2}
						style={detailsRow}
						accessible={accessible}
						importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}>
						<View style={detailsLabelCover}>
							<Text
								level={3}
								style={detailsLabel}>
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
									style={timeText}
									level={4}/>
								<FormattedTime
									value={textDate}
									localeMatcher= "best fit"
									formatMatcher= "best fit"
									hour="numeric"
									minute="numeric"
									second="numeric"
									style={[timeText, {paddingLeft: 6}]}
									level={4}/>
							</View>
							:
							null
						}
					</View>
					<View
						level={2}
						style={detailsRow}
						accessible={accessible}
						importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}>
						<View style={detailsLabelCover}>
							<Text
								level={3}
								style={detailsLabel}>
								<FormattedMessage {...i18n.origin} style={detailsLabel}/>
							</Text>
						</View>
						<View style={detailsValueCover}>
							<Text
								level={4}
								style={detailsText}
								numberOfLines={1}>
								{originText}
							</Text>
						</View>
					</View>
					<View
						level={2}
						style={detailsRow}
						accessible={accessible}
						importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}>
						<View style={detailsLabelCover}>
							<Text
								level={3}
								style={detailsLabel}>
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
		const { height, width } = appLayout;
		let isPortrait = height > width;

		const deviceWidth = isPortrait ? width : height;

		const {
			shadow,
			paddingFactor,
			fontSizeFactorFive,
			fontSizeFactorFour,
			fontSizeFactorOne,
		} = Theme.Core;

		const padding = deviceWidth * paddingFactor;

		let stackNavHeaderHeight = height * 0.1;
		let deviceIconCoverHeight = height * 0.2;
		let tabViewHeaderHeight = height * 0.085;
		statusBarHeight = (Platform.OS === 'android' && StatusBar) ? statusBarHeight : 0;
		stackNavHeaderHeight = isPortrait ? stackNavHeaderHeight : 0;
		let totalTop = statusBarHeight + stackNavHeaderHeight + deviceIconCoverHeight + tabViewHeaderHeight;
		let screenSpaceRemaining = height - totalTop;

		const closeIconSize = Math.floor(deviceWidth * fontSizeFactorFive);
		const closeIconCSize = closeIconSize;

		const detailsRowWidth = width - (padding * 2);

		const itemInnerPadding = padding + 3;

		return {
			startValue: screenSpaceRemaining,
			container: {
				flex: 1,
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				alignItems: 'center',
				paddingTop: 8,
			},
			titleTextCover: {
				flexDirection: 'row',
				alignItems: 'center',
				marginVertical: padding,
				width: detailsRowWidth,
				justifyContent: 'space-between',
			},
			closeIconCoverStyle: {
				alignItems: 'center',
				justifyContent: 'center',
				height: closeIconCSize,
				width: closeIconCSize,
				borderRadius: closeIconCSize / 2,
			},
			closeIconStyle: {
				fontSize: closeIconSize,
				backgroundColor: 'transparent',
			},
			detailsContainer: {
				flexGrow: 1,
			},
			detailsRow: {
				flexDirection: 'row',
				padding: itemInnerPadding,
				alignItems: 'center',
				justifyContent: 'space-between',
				marginHorizontal: padding,
				...shadow,
				marginBottom: padding / 2,
				borderRadius: 2,
			},
			detailsLabelCover: {
				alignItems: 'flex-start',
				width: '20%',
			},
			detailsValueCover: {
				alignItems: 'flex-end',
				width: '80%',
			},
			timeCover: {
				justifyContent: 'flex-end',
				width: '80%',
				flexDirection: 'row',
			},
			titleText: {
				fontSize: Math.floor(deviceWidth * fontSizeFactorFour),
			},
			statusIconSize: Math.floor(deviceWidth * fontSizeFactorOne),
			detailsLabel: {
				fontSize: Math.floor(deviceWidth * fontSizeFactorFour),
			},
			detailsText: {
				fontSize: Math.floor(deviceWidth * fontSizeFactorFour),
			},
			detailsTextError: {
				color: '#d32f2f',
				fontSize: Math.floor(deviceWidth * fontSizeFactorFour),
			},
			timeText: {
				fontSize: Math.floor(deviceWidth * fontSizeFactorFour),
			},
		};
	}
}

function mapStateToProps(state: Object): Object {
	return {
		appLayout: state.app.layout,
	};
}

export default (connect(mapStateToProps, null)(DeviceHistoryDetails): Object);
