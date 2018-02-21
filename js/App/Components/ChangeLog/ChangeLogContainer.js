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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { View, FloatingButton, StyleSheet, Text } from '../../../BaseComponents';
import Theme from 'Theme';

import { setChangeLogVersion } from 'Actions';
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

	onPressNext: () => void;
	onPressPrev: () => void;
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

		this.changeLogVersion = props.screenProps.changeLogVersion;

		this.onPressNext = this.onPressNext.bind(this);
		this.onPressPrev = this.onPressPrev.bind(this);
		this.onPressSkip = this.onPressSkip.bind(this);
	}

	onPressNext() {
		let { navigation, screenProps, actions } = this.props;
		let { Screens, currentScreen } = screenProps;
		let nextIndex = Screens.indexOf(currentScreen) + 1;
		let nextScreen = Screens[nextIndex];

		let isFinalScreen = Screens.indexOf(currentScreen) === (Screens.length - 1);
		if (isFinalScreen) {
			actions.setChangeLogVersion(this.changeLogVersion);
		} else {
			navigation.navigate(nextScreen);
		}
	}

	onPressPrev() {
		let { navigation, screenProps } = this.props;
		let { Screens, currentScreen } = screenProps;
		let prevIndex = Screens.indexOf(currentScreen) - 1;
		let prevScreen = Screens[prevIndex];

		let isFirstScreen = Screens.indexOf(currentScreen) === 0;
		if (!isFirstScreen) {
			navigation.navigate(prevScreen);
		}
	}

	onPressSkip() {
		let { actions } = this.props;
		actions.setChangeLogVersion(this.changeLogVersion);
	}

	render(): Object {
		const { children, screenProps } = this.props;
		const { appLayout, Screens, currentScreen } = screenProps;
		const isFirstScreen = Screens.indexOf(currentScreen) === 0;

		let { stepIndicatorCover, floatingButtonLeft } = this.getStyles(appLayout);

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
					<View style={styles.buttonCover}>
						<Text style={styles.textSkip} onPress={this.onPressSkip}>
							{this.skipButton}
						</Text>
					</View>
					<View style={stepIndicatorCover}>
						{!isFirstScreen && (<FloatingButton
							imageSource={require('../TabViews/img/right-arrow-key.png')}
							onPress={this.onPressPrev}
							buttonStyle={floatingButtonLeft}
							iconStyle={styles.buttonIconStyle}/>
						)}
						{Screens.map((screen, index) => {
							let backgroundColor = Screens[index] === currentScreen ?
								Theme.Core.brandSecondary : '#00000080';
							return <View style={[styles.stepIndicator, { backgroundColor }]} key={index}/>;
						})
						}
						<FloatingButton
							imageSource={require('../TabViews/img/right-arrow-key.png')}
							onPress={this.onPressNext}
							buttonStyle={{bottom: 0}}/>
					</View>
				</ScrollView>
			</View>
		);
	}

	getStyles(appLayout: Object) {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const buttonSize = deviceWidth * 0.134666667;

		return {
			stepIndicatorCover: {
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
				marginBottom: 10,
				height: buttonSize,
			},
			floatingButtonLeft: {
				left: deviceWidth * 0.034666667,
				bottom: 0,
			},
		};
	}
}

const styles = StyleSheet.create({
	buttonCover: {
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 10,
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
	buttonIconStyle: {
		transform: [{rotateZ: '180deg'}],
	},
});

const mapDispatchToProps = (dispatch: Function): Object => (
	{
		actions: {
			...bindActionCreators({setChangeLogVersion}, dispatch),
		},
	}
);

export default connect(null, mapDispatchToProps)(ChangeLogContainer);
