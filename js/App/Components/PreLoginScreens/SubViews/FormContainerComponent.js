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
import { KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { connect } from 'react-redux';
import DeviceInfo from 'react-native-device-info';

import { BackgroundImage, View } from '../../../../BaseComponents';
import TelldusLogo from '../../TabViews/img/telldus_logo.svg';

import {
	withTheme,
	PropsThemedComponent,
} from '../../HOC/withTheme';

import Theme from '../../../Theme';

type Props = PropsThemedComponent & {
	children: any,
	appLayout: Object,
	navigation: Object,
	screenProps: Object,
	route: Object,
	screen: string,
	ScreenName: string,
};

class FormContainerComponent extends View<Props, null> {
	props: Props;

	isTablet: boolean;

	constructor(props: Props) {
		super(props);

		this.isTablet = DeviceInfo.isTablet();
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.ScreenName === nextProps.screen;
	}

	render(): Object {
		const {
			navigation,
			screenProps,
			route,
			children,
			appLayout,
			screen,
			dark,
			colors,
		} = this.props;

		const styles = this.getStyles(appLayout);

		return (
			<BackgroundImage source={{uri: dark ? 'telldusliveapp_launchscreen_darkmode' : 'telldusliveapp_launchscreen'}} style={styles.container}>
				{!!appLayout.width && (
					<ScrollView
						keyboardShouldPersistTaps={'always'}
						style={{ flex: 1 }}
						contentContainerStyle={styles.contentContainerStyle}>
						<KeyboardAvoidingView
							behavior="position"
							style={{ justifyContent: 'center', alignItems: 'center' }}
							contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}>
							<TelldusLogo
								colorHomeLogo={colors.inAppBrandSecondary}
								colorTextLogo={dark ? '#ffffff' : '#000000'}
								colorWaveLogo={'#ffffff'}
								style={styles.logoStyle}
								height={styles.logoHeight}
								width={styles.logoWidth}/>
							<View style={styles.formContainer}>
								{React.cloneElement(
									children,
									{
										isTablet: this.isTablet,
										appLayout,
										navigation,
										screenProps: {
											...screenProps,
											currentScreen: screen,
										},
										route,
										styles,
									},
								)}
							</View>
						</KeyboardAvoidingView>
					</ScrollView>
				)}
			</BackgroundImage>
		);
	}

	getStyles(appLayout: Object): Object {
		let { height, width } = appLayout;
		let isPortrait = height > width;
		let deviceWidth = isPortrait ? width : height;
		let deviceHeight = isPortrait ? height : width;

		const {
			maxSizeTextButton,
			baseColorPreloginScreen,
		} = Theme.Core;

		let headerFontSize = Math.floor(deviceWidth * 0.05);
		let maxFontSize = maxSizeTextButton + 4;
		headerFontSize = headerFontSize > maxFontSize ? maxFontSize : headerFontSize;

		let textFieldFontSize = Math.floor(deviceWidth * 0.04);
		let maxTextFieldFontSize = maxSizeTextButton - 4;
		textFieldFontSize = textFieldFontSize > maxTextFieldFontSize ? maxTextFieldFontSize : textFieldFontSize;

		return {
			logoHeight: Math.floor(deviceWidth * 0.3),
			logoWidth: Math.floor(deviceWidth * 0.7),
			container: {
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center',
			},
			contentContainerStyle: {
				flexGrow: 1,
				alignItems: 'center',
			},
			logoStyle: {
				marginTop: deviceHeight * 0.16,
				marginBottom: deviceHeight * 0.08,
			},
			formContainer: {
				backgroundColor: '#00000099',
				padding: 10,
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'stretch',
				width,
			},
			headerTextStyle: {
				margin: headerFontSize * 0.5,
				fontSize: headerFontSize,
				color: baseColorPreloginScreen,
				textAlign: 'center',
			},
			formCover: {
				flex: 1,
				alignItems: 'stretch',
			},
			fieldsContainerStyle: {
				flex: 1,
				alignItems: 'stretch',
				padding: headerFontSize,
			},
			fieldsPairContainerStyle: {
				flex: 1,
				flexDirection: this.isTablet ? 'row' : 'column',
				alignItems: this.isTablet ? 'flex-end' : 'flex-start',
				justifyContent: 'center',
			},
			textFieldIconContainer: {
				flex: 1,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
			},
			textFieldIconCover: {
				flex: 0,
				flexDirection: 'row',
				alignItems: 'flex-end',
				justifyContent: 'center',
				height: textFieldFontSize + 40,
				width: this.isTablet ? width * 0.4 : width * 0.8,
			},
			textFieldIconCoverOne: {
				justifyContent: this.isTablet ? 'flex-end' : 'center',
			},
			textFieldStyle: {
				paddingLeft: 12 + textFieldFontSize,
				height: '100%',
				minWidth: 200,
				borderRadius: 3,
				paddingBottom: Platform.OS === 'android' ? 10 : 0,

				fontSize: textFieldFontSize,
				color: Theme.Core.baseColorPreloginScreen,
				textAlign: 'left',
				textAlignVertical: 'bottom',
			},
			leftAccessoryStyle: {
				marginBottom: 10,
			},
			iconSize: textFieldFontSize,
			loginButtonStyleG: {
				maxWidth: 300,
				maxHeight: 80,
				alignSelf: 'center',
				alignItems: 'center',
				justifyContent: 'center',
			},
			contentInset: {
				top: 0,
				label: 0,
				input: 0,
				left: 0,
				right: 0,
				bottom: 0,
			},
			inputContainerStyle: {
				height: '100%',
			},
			containerStyle: {
				height: '100%',
			},
			loginButtonStyleA: {
				maxWidth: 300,
				maxHeight: 80,
				width: Math.floor(deviceWidth * 0.6),
				height: Math.floor(deviceWidth * 0.1),
				marginBottom: 8,
				alignSelf: 'center',
				alignItems: 'center',
				justifyContent: 'center',
			},
		};
	}
}

function mapStateToProps(store: Object): Object {
	return {
		appLayout: store.app.layout,
		screen: store.navigation.screen,
	};
}

export default connect(mapStateToProps, null)(withTheme(FormContainerComponent));

