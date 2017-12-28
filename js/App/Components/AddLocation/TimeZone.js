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

import {
	View,
	FormattedMessage,
	Text,
	Icon,
	FloatingButton,
} from 'BaseComponents';
import { LabelBox } from 'AddNewLocation_SubViews';

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
});

type Props = {
	timeZone: string,
	navigation: Object,
	dispatch: Function,
	intl: intlShape.isRequired,
	onDidMount: Function,
	activateGateway: (clientInfo: Object) => Promise<any>,
	appLayout: Object,
}

type State = {
	timeZone: string,
}

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
		};

		this.h1 = `3. ${props.intl.formatMessage(messages.headerOne)}`;
		this.h2 = props.intl.formatMessage(messages.headerTwo);
		this.label = props.intl.formatMessage(messages.headerOne);

		this.onTimeZoneSubmit = this.onTimeZoneSubmit.bind(this);
		this.onEditTimeZone = this.onEditTimeZone.bind(this);
	}

	componentDidMount() {
		const { h1, h2 } = this;
		this.props.onDidMount(h1, h2);
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
		this.props.navigation.navigate('Position', {clientInfo});
	}

	onEditTimeZone() {
		let clientInfo = this.props.navigation.state.params.clientInfo;
		this.props.navigation.navigate('TimeZoneContinent', {clientInfo});
	}

	render() {
		let { appLayout } = this.props;
		const styles = this.getStyle(appLayout);

		return (
			<View style={{flex: 1}}>
				<LabelBox
					label={this.label}
					showIcon={false}
					appLayout={appLayout}>
					<TouchableOpacity onPress={this.onEditTimeZone} style={{flex: 0}}>
						<View style={styles.timeZoneContainer}>
							<Text style={styles.timeZone}>
								{this.state.timeZone}
							</Text>
							<Icon name="pencil" size={16} color="#A59F9A" style={{marginTop: 7}}/>
						</View>
						{this.state.autoDetected ?
							<Text style={styles.hint}>
							(
								<FormattedMessage {...messages.hint} style={styles.hint}/>
							)
							</Text>
							:
							null
						}
					</TouchableOpacity>
				</LabelBox>
				<FloatingButton
					buttonStyle={styles.buttonStyle}
					onPress={this.onTimeZoneSubmit}
					imageSource={require('../TabViews/img/right-arrow-key.png')}
					showThrobber={false}
				/>
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		let isPortrait = height > width;

		return {
			timeZoneContainer: {
				flexDirection: 'row',
				justifyContent: 'flex-start',
				marginTop: 10,
				width: width - 40,
			},
			timeZone: {
				color: '#00000099',
				fontSize: isPortrait ? Math.floor(width * 0.06) : Math.floor(height * 0.06),
				paddingLeft: 2,
				marginRight: 10,
			},
			hint: {
				color: '#A59F9A',
				fontSize: isPortrait ? Math.floor(width * 0.042) : Math.floor(height * 0.042),
				paddingLeft: 2,
			},
			buttonStyle: {
				right: isPortrait ? width * 0.053333333 : height * 0.053333333,
				elevation: 10,
				shadowOpacity: 0.99,
			},
		};
	}
}

export default connect(null, null)(TimeZone);
