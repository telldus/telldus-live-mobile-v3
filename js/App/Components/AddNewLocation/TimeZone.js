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
import { TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import { defineMessages } from 'react-intl';

import {
	View,
	FormattedMessage,
	ScreenContainer,
	StyleSheet,
	Dimensions,
	Text,
	Icon,
} from 'BaseComponents';
import Banner from './Banner';

const deviceWidth = Dimensions.get('window').width;

const messages = defineMessages({
	banner: {
		id: 'addNewLocation.timeZone.banner',
		defaultMessage: 'Time Zone',
		description: 'Main Banner Text for the Select City Screen',
	},
	bannerSub: {
		id: 'addNewLocation.timeZone.bannerSub',
		defaultMessage: 'Select Time Zone',
		description: 'Secondary Banner Text for the Select City Screen',
	},
	hint: {
		id: 'addNewLocation.timeZone.hint',
		defaultMessage: 'Autodetected',
		description: 'hint text for user',
	},
});

type Props = {
}

type State = {
}

class TimeZone extends View<void, Props, State> {

	onTimeZoneSubmit: () => void;

	constructor(props: Props) {
		super(props);
		this.onTimeZoneSubmit = this.onTimeZoneSubmit.bind(this);
	}

	onTimeZoneSubmit() {
	}

	render() {

		let bannerProps = {
			prefix: '3. ',
			bannerMain: messages.banner,
			bannerSub: messages.bannerSub,
		};
		let BannerComponent = Banner(bannerProps);

		return (
			<ScreenContainer banner={BannerComponent}>
				<View style={[styles.itemsContainer, styles.shadow]}>
					<FormattedMessage {...messages.banner} style={styles.title}/>
					<Text style={styles.hint}>
						(
						<FormattedMessage {...messages.hint} style={styles.hint}/>
						)
					</Text>
				</View>
				<View style={styles.circularViewContainer}>
					<TouchableWithoutFeedback onPress={this.onTimeZoneSubmit}>
						<View style={styles.circularView}>
							<Icon name="angle-right" size={44} color="#ffffff"/>
						</View>
					</TouchableWithoutFeedback>
				</View>
			</ScreenContainer>
		);
	}
}

const styles = StyleSheet.create({
	itemsContainer: {
		flexDirection: 'column',
		backgroundColor: '#fff',
		marginTop: 20,
		paddingLeft: 10,
		paddingRight: 10,
		paddingBottom: 10,
		paddingTop: 10,
		alignItems: 'flex-start',
		width: (deviceWidth - 20),
	},
	shadow: {
		borderRadius: 4,
		backgroundColor: '#fff',
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 0,
		},
		shadowRadius: 1,
		shadowOpacity: 1.0,
		elevation: 2,
	},
	title: {
		color: '#e26901',
		fontSize: 14,
		paddingLeft: 2,
	},
	hint: {
		color: '#A59F9A',
		fontSize: 14,
		paddingLeft: 2,
	},
	circularViewContainer: {
		width: (deviceWidth - 20),
		alignItems: 'flex-end',
		justifyContent: 'flex-end',
		flex: 1,
		marginBottom: 20,
	},
	circularView: {
		height: 50,
		width: 50,
		borderRadius: 50,
		backgroundColor: '#e26901',
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 0,
		},
		alignItems: 'center',
		justifyContent: 'center',
		shadowRadius: 50,
		shadowOpacity: 1.0,
		elevation: 25,
	},
});

export default connect()(TimeZone);
