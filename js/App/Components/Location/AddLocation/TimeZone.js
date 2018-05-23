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
 *
 *
 */

// @flow

'use strict';

import React from 'react';
import { TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { defineMessages, intlShape } from 'react-intl';
import { announceForAccessibility } from 'react-native-accessibility';

import {
	View,
	FormattedMessage,
	Text,
	Icon,
	FloatingButton,
} from '../../../../BaseComponents';
import LabelBox from '../Common/LabelBox';
import { reportError } from '../../../Lib';

import i18n from '../../../Translations/common';
const messages = defineMessages({
	headerOne: {
		id: 'addNewLocation.timeZone.headerOne',
		defaultMessage: 'Time Zone',
		description: 'Main header for the Select City Screen',
	},
	headerTwo: {
		id: 'addNewLocation.timeZone.headerTwo',
		defaultMessage: 'Select Time Zone',
		description: 'Secondary header for the Select City Screen',
	},
	hint: {
		id: 'addNewLocation.timeZone.hint',
		defaultMessage: 'Autodetected',
		description: 'hint text for user',
	},
	labelHintChangeTimeZone: {
		id: 'addNewLocation.timeZone.labelHintChangeTimeZone',
		defaultMessage: 'Double tap to change',
		description: 'accessibility message to change time zone',
	},
});

type Props = {
	timeZone: string,
	navigation: Object,
	dispatch: Function,
	intl: intlShape.isRequired,
	onDidMount: Function,
	activateGateway: (clientInfo: Object) => Promise<any>,
	appLayout: Object,
	screenReaderEnabled: boolean,
	currentScreen: string,
	actions: Object,
};

type State = {
	timeZone: string,
	autoDetected: boolean,
	isLoading: boolean,
};

class TimeZone extends View<void, Props, State> {

	props: Props;
	state: State;

	onTimeZoneSubmit: () => void;
	onEditTimeZone: () => void;
	getTimeZone: () => Object;

	constructor(props: Props) {
		super(props);
		let {timeZone, autoDetected} = this.getTimeZone();
		this.state = {
			timeZone,
			autoDetected,
			isLoading: false,
		};

		let { formatMessage } = props.intl;

		this.h1 = `3. ${formatMessage(messages.headerOne)}`;
		this.h2 = formatMessage(messages.headerTwo);
		this.label = formatMessage(messages.headerOne);

		this.labelMessageToAnnounce = `${formatMessage(i18n.screen)} ${this.h1}. ${this.h2}`;
		this.labelHintChangeTimeZone = formatMessage(messages.labelHintChangeTimeZone);
		this.labelHint = formatMessage(messages.hint);

		this.onTimeZoneSubmit = this.onTimeZoneSubmit.bind(this);
		this.onEditTimeZone = this.onEditTimeZone.bind(this);
	}

	componentDidMount() {
		const { h1, h2 } = this;
		this.props.onDidMount(h1, h2);

		let { screenReaderEnabled } = this.props;
		if (screenReaderEnabled) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	componentWillReceiveProps(nextProps: Object) {
		let { screenReaderEnabled, currentScreen } = nextProps;
		let shouldAnnounce = currentScreen === 'TimeZone' && this.props.currentScreen !== 'TimeZone';
		if (screenReaderEnabled && shouldAnnounce) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'TimeZone';
	}

	getTimeZone(): Object {
		let clientInfo = this.props.navigation.state.params.clientInfo;
		let timeZone = clientInfo.timezone;
		let autoDetected = clientInfo.autoDetected;
		return {timeZone, autoDetected};
	}

	onTimeZoneSubmit() {
		let clientInfo = this.props.navigation.state.params.clientInfo;
		clientInfo.timezone = this.state.timeZone;
		let { screenReaderEnabled, actions } = this.props;
		if (screenReaderEnabled) {
			this.setState({
				isLoading: true,
			});
			clientInfo.coordinates = {};
			actions.activateGateway(clientInfo)
				.then((response: Object) => {
					this.props.navigation.navigate('Success', {clientInfo});
					this.setState({
						isLoading: false,
					});
				}).catch((error: Object) => {
					this.setState({
						isLoading: false,
					});
					let log = JSON.stringify(error);
					reportError(log);
				});
		} else {
			this.props.navigation.navigate('Position', {clientInfo});
		}
	}

	onEditTimeZone() {
		let clientInfo = this.props.navigation.state.params.clientInfo;
		this.props.navigation.navigate('TimeZoneContinent', {clientInfo});
	}

	render(): Object {
		const { appLayout } = this.props;
		const { isLoading, timeZone, autoDetected } = this.state;
		const styles = this.getStyle(appLayout);

		let timeZoneInfo = `${this.label}, ${timeZone}, ${autoDetected ? this.labelHint : ''}`;
		let accessibilityLabel = `${timeZoneInfo}. ${this.labelHintChangeTimeZone}.`;

		return (
			<View style={{flex: 1}}>
				<LabelBox
					showIcon={false}
					appLayout={appLayout}>
					<Text style={styles.label}>
						{this.label}
					</Text>
					<TouchableOpacity onPress={this.onEditTimeZone} style={{flex: 1}} accessibilityLabel={accessibilityLabel}>
						<View style={styles.timeZoneContainer}>
							<Text style={styles.timeZone}>
								{timeZone}
							</Text>
							<Icon name="pencil" size={styles.iconSize} color="#A59F9A" style={styles.iconStyle}/>
						</View>
						{autoDetected && (
							<FormattedMessage {...messages.hint} style={styles.hint} prefix="(" postfix=")"/>
						)
						}
					</TouchableOpacity>
				</LabelBox>
				<FloatingButton
					buttonStyle={styles.buttonStyle}
					onPress={this.onTimeZoneSubmit}
					imageSource={isLoading ? false : require('../../TabViews/img/right-arrow-key.png')}
					showThrobber={isLoading}
				/>
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const fontSizeTZ = deviceWidth * 0.06;
		const fontSizeTZHint = deviceWidth * 0.038;

		const fontSizeLabel = deviceWidth * 0.045;

		return {
			timeZoneContainer: {
				flexDirection: 'row',
				justifyContent: 'flex-start',
				alignItems: 'center',
				width: deviceWidth * 0.8,
				marginTop: fontSizeTZ * 0.5,
				marginBottom: fontSizeTZHint * 0.15,
			},
			timeZone: {
				color: '#00000099',
				fontSize: fontSizeTZ,
				marginRight: fontSizeTZ * 0.5,
			},
			hint: {
				color: '#A59F9A',
				fontSize: fontSizeTZHint,
			},
			buttonStyle: {
				right: isPortrait ? width * 0.053333333 : height * 0.053333333,
				elevation: 10,
			},
			iconStyle: {

			},
			iconSize: deviceWidth * 0.038,
			label: {
				color: '#e26901',
				fontSize: fontSizeLabel,
			},
		};
	}
}

export default connect(null, null)(TimeZone);
