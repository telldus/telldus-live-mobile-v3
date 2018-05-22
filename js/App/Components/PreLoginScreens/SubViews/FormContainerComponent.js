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

import { BackgroundImage, View, Image } from '../../../../BaseComponents';

import { getRelativeDimensions } from '../../../Lib';
import Theme from '../../../Theme';

type Props = {
	children: any,
	appLayout: Object,
	navigation: Object,
	screenProps: Object,
};

class FormContainerComponent extends View<Props, null> {
	props: Props;

	isTablet: boolean;

	constructor(props: Props) {
		super(props);

		this.isTablet = DeviceInfo.isTablet();
		this.background = require('./../img/home5.jpg');
		this.logo = require('./../img/telldusLogoBlack.png');
	}

	render(): Object {
		const {
			navigation,
			screenProps,
			children,
			appLayout,
		} = this.props;

		const styles = this.getStyles(appLayout);

		return (
			<BackgroundImage source={this.background} style={styles.container}>
				<ScrollView
					keyboardShouldPersistTaps={'always'}
					style={{ flex: 1 }}
					contentContainerStyle={styles.contentContainerStyle}>
					<KeyboardAvoidingView
						behavior="padding"
						style={{ justifyContent: 'center', alignItems: 'center' }}
						contentContainerStyle={{ paddingTop: 20, justifyContent: 'center' }}>
						<Image
							source={this.logo}
							style={styles.logoStyle}
						/>
						<View style={styles.formContainer}>
							{React.cloneElement(
								children,
								{
									isTablet: this.isTablet,
									appLayout,
									navigation,
									screenProps,
									styles,
								},
							)}
						</View>
					</KeyboardAvoidingView>
				</ScrollView>
			</BackgroundImage>
		);
	}

	getStyles(appLayout: Object): Object {
		let { height, width } = appLayout;
		let isPortrait = height > width;
		let deviceWidth = isPortrait ? width : height;
		let deviceHeight = isPortrait ? height : width;

		let headerFontSize = Math.floor(deviceWidth * 0.05);
		let maxFontSize = Theme.Core.maxSizeTextButton + 4;
		headerFontSize = headerFontSize > maxFontSize ? maxFontSize : headerFontSize;

		let textFieldFontSize = Math.floor(deviceWidth * 0.04);
		let maxTextFieldFontSize = Theme.Core.maxSizeTextButton - 4;
		textFieldFontSize = textFieldFontSize > maxTextFieldFontSize ? maxTextFieldFontSize : textFieldFontSize;

		return {
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
				color: '#ffffff80',
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
			},
			textFieldIconCoverOne: {
				justifyContent: this.isTablet ? 'flex-end' : 'center',
			},
			textFieldStyle: {
				paddingLeft: 12 + textFieldFontSize,
				width: this.isTablet ? width * 0.4 : width * 0.8,
				paddingTop: textFieldFontSize,
				minWidth: 200,
				borderRadius: 3,

				fontSize: textFieldFontSize,
				color: '#ffffff80',
				textAlign: 'left',
				textAlignVertical: 'bottom',
			},
			iconStyle: {
				position: 'absolute',
				bottom: Platform.OS === 'android' ? 10 : 0,
				left: Platform.OS === 'android' ? 3 : 0,
			},
			iconSize: textFieldFontSize,
		};
	}
}

function mapStateToProps(store: Object): Object {
	return {
		appLayout: getRelativeDimensions(store.App.layout),
	};
}

export default connect(mapStateToProps, null)(FormContainerComponent);

