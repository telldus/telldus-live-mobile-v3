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
 * @providesModule ChangeLogContainer
 */

// @flow

'use strict';

import React from 'react';
import { ScrollView } from 'react-native';
import { intlShape, defineMessages } from 'react-intl';
import DeviceInfo from 'react-native-device-info';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { View, TouchableButton, StyleSheet, Text } from 'BaseComponents';
import Theme from 'Theme';

import { setAppVersion } from 'Actions';
import i18n from '../../Translations/common';

const messages = defineMessages({
	skipButton: {
		id: 'changeLog.button.skipButton',
		defaultMessage: 'skip this',
	},
});

type Props = {
	children: Object,
	screenProps: Object,
	navigation: Object,
	intl: intlShape,
	actions: Object,
};


class ChangeLogContainer extends View {
	props: Props;

	onPressConfirm: () => void;
	onPressSkip: () => void;

	nextButton: string;
	skipButton: string;
	doneButton: string;

	appVersion: string;

	constructor(props: Props) {
		super(props);
		let { formatMessage } = props.screenProps.intl;

		this.nextButton = formatMessage(i18n.next);
		this.skipButton = formatMessage(messages.skipButton).toUpperCase();
		this.doneButton = formatMessage(i18n.done);

		this.appVersion = DeviceInfo.getVersion();

		this.onPressConfirm = this.onPressConfirm.bind(this);
		this.onPressSkip = this.onPressSkip.bind(this);
	}

	onPressConfirm() {
		let { navigation, screenProps, actions } = this.props;
		let { Screens, currentScreen } = screenProps;
		let nextIndex = Screens.indexOf(currentScreen) + 1;
		let nextScreen = Screens[nextIndex];

		let isFinalScreen = Screens.indexOf(currentScreen) === (Screens.length - 1);
		if (isFinalScreen) {
			actions.setAppVersion(this.appVersion);
		} else {
			navigation.navigate(nextScreen);
		}
	}

	onPressSkip() {
		let { actions } = this.props;
		actions.setAppVersion(this.appVersion);
	}

	render(): Object {
		const { children, screenProps } = this.props;
		const { Screens, currentScreen } = screenProps;

		const isFinalScreen = Screens.indexOf(currentScreen) === (Screens.length - 1);
		const buttonConfirm = isFinalScreen ? this.doneButton : this.nextButton;

		return (
			<View style={{flex: 1}}>
				<ScrollView>
					<View style={{flex: 1, paddingHorizontal: 10, paddingTop: 10}}>
						{React.cloneElement(
							children,
							{
								...screenProps,
								styles: styles,
							},
						)}
					</View>
					<View style={styles.stepIndicatorCover}>
						{screenProps.Screens.map((screen, index) => {
							let backgroundColor = screenProps.Screens[index] === screenProps.currentScreen ?
								Theme.Core.brandSecondary : '#00000080';
							return <View style={[styles.stepIndicator, { backgroundColor }]} key={index}/>;
						})
						}
					</View>
					<View style={styles.buttonCover}>
						<TouchableButton text={buttonConfirm} onPress={this.onPressConfirm}/>
						<Text style={styles.textSkip} onPress={this.onPressSkip}>
							{this.skipButton}
						</Text>
					</View>
				</ScrollView>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	stepIndicatorCover: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginVertical: 10,
	},
	buttonCover: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	textSkip: {
		paddingVertical: 10,
		color: Theme.Core.brandSecondary,
		textAlign: 'center',
	},
	stepIndicator: {
		height: 10,
		width: 10,
		borderRadius: 5,
		marginLeft: 7,
	},
	container: {
		...Theme.Core.shadow,
		backgroundColor: '#fff',
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 15,
		paddingVertical: 15,
	},
	icon: {
		fontSize: 100,
		color: Theme.Core.brandSecondary,
	},
	title: {
		fontSize: 20,
		color: '#00000090',
		textAlign: 'center',
		paddingHorizontal: 10,
		marginVertical: 10,
	},
	description: {
		fontSize: 14,
		color: '#00000080',
		textAlign: 'left',
	},
});

const mapDispatchToProps = (dispatch: Function): Object => (
	{
		actions: {
			...bindActionCreators({setAppVersion}, dispatch),
		},
	}
);

export default connect(null, mapDispatchToProps)(ChangeLogContainer);
