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
import { TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DeviceInfo from 'react-native-device-info';
import { ifIphoneX } from 'react-native-iphone-x-helper';

import { View, Text, Poster, RoundedInfoButton } from '../../../../BaseComponents';

import i18n from '../../../Translations/common';
import Theme from '../../../Theme';

type InfoButton = {
	onPress?: Function,
	infoButtonContainerStyle?: Array<any> | Object | number,
	infoButtonStyle?: Array<any> | Object | number,
};

type Props = {
	h1: string,
	h2: string,
	infoButton?: InfoButton,
	appLayout: Object,
	screenProps: Object,
	navigation: Object,
	intl: Object,
	headerContainerStyle: Object | number,
	showHeader?: boolean,
	customHeader?: Object | null,
};

class LocationDetailsPoster extends View {
	props: Props;
	goBack: () => void;

	static propTypes = {
		h1: PropTypes.string,
		h2: PropTypes.string,
		infoButton: PropTypes.object,
	};

	static defaultProps = {
		showHeader: true,
		customHeader: null,
	};

	constructor(props: Props) {
		super(props);
		this._renderInfoButton = this._renderInfoButton.bind(this);
		this.goBack = this.goBack.bind(this);
		this.isTablet = DeviceInfo.isTablet();

		let { formatMessage } = props.intl;

		this.defaultDescription = `${formatMessage(i18n.defaultDescriptionButton)}`;
		this.labelLeftIcon = `${formatMessage(i18n.navigationBackButton)} .${this.defaultDescription}`;
	}

	_renderInfoButton = (button: Object): Object => {
		return (
			<RoundedInfoButton buttonProps={button}/>
		);
	};

	goBack() {
		let { screenProps, navigation } = this.props;
		if (screenProps.currentScreen === screenProps.initialRouteName) {
			screenProps.rootNavigator.goBack();
		} else {
			navigation.goBack();
		}
	}

	render(): Object {
		const { h1, h2, infoButton, appLayout, showHeader, headerContainerStyle, customHeader, screenProps } = this.props;
		const styles = this.getStyle(appLayout);
		const isPortrait = appLayout.height > appLayout.width;

		return (
			<Poster>
				{(!this.isTablet) && (!isPortrait) && screenProps.currentScreen !== 'Success' &&
						<TouchableOpacity
							style={styles.backButtonLand}
							onPress={this.goBack}
							accessibilityLabel={this.labelLeftIcon}>
							<Icon name="arrow-back" size={appLayout.width * 0.047} color="#fff" style={styles.iconLeft}/>
						</TouchableOpacity>
				}
				{!!showHeader &&
				<View style={[styles.hContainer, headerContainerStyle]}>
					<Text style={[styles.h, styles.h1]}>
						{!!h1 && h1}
					</Text>
					<Text style={[styles.h, styles.h2]}>
						{!!h2 && h2}
					</Text>
				</View>
				}
				{customHeader && React.isValidElement(customHeader) &&
					customHeader
				}
				{!!infoButton && this._renderInfoButton(infoButton)}
			</Poster>
		);
	}

	getStyle = (appLayout: Object): Object => {
		const height = appLayout.height;
		const width = appLayout.width;
		const isPortrait = height > width;

		return {
			hContainer: {
				...ifIphoneX({
					position: 'absolute',
					right: 10,
					top: 10,
					left: 10,
					bottom: 10,
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				},
				{
					position: 'absolute',
					right: isPortrait ? width * 0.124 : height * 0.124,
					top: isPortrait ? width * 0.088 : height * 0.088,
					flex: 1,
					alignItems: 'flex-end',
				}),
			},
			h: {
				color: '#fff',
				backgroundColor: 'transparent',
				fontFamily: Theme.Core.fonts.robotoLight,
			},
			h1: {
				fontSize: isPortrait ? width * 0.085333333 : height * 0.085333333,
			},
			h2: {
				fontSize: isPortrait ? width * 0.053333333 : height * 0.053333333,
			},
			backButtonLand: {
				position: 'absolute',
				alignItems: 'flex-start',
				justifyContent: 'center',
				backgroundColor: 'transparent',
				left: 10,
				top: 10,
				zIndex: 1,
			},
			iconLeft: {
				paddingVertical: 10,
			},
		};
	}
}

function mapStateToProps(state: Object): Object {
	return {
		appLayout: state.App.layout,
	};
}

export default connect(mapStateToProps, null)(LocationDetailsPoster);
