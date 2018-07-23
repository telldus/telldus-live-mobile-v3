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
 */

// @flow

'use strict';

import React from 'react';
import { StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DeviceInfo from 'react-native-device-info';

import Text from './Text';
import View from './View';
import Poster from './Poster';
import BlockIcon from './BlockIcon';
import NavigationHeader from './NavigationHeader';
import RoundedInfoButton from './RoundedInfoButton';

import i18n from '../App/Translations/common';

type InfoButton = {
	onPress?: Function,
	infoButtonContainerStyle?: Array<any> | Object | number,
	infoButtonStyle?: Array<any> | Object | number,
};

type Props = {
    h1: string,
    h2: string,
	icon: string,
    navigation: Object,
    handleBackPress: () => void,
    intl: Object,
    appLayout: Object,
    showBackButton?: boolean,
    posterCoverStyle?: Array<any> | Object | number,
    align?: 'right' | 'center',
	infoButton?: InfoButton,
	showLeftIcon?: boolean,
};

type DefaultProps = {
    showBackButton: boolean,
	align: 'right' | 'center',
	showLeftIcon: boolean,
};

class NavigationHeaderPoster extends React.Component<Props, null> {
props: Props;

static defaultProps: DefaultProps = {
	showBackButton: true,
	align: 'center',
	showLeftIcon: true,
};

goBack: () => void;
handleBackPress: () => boolean;

noName: string;
defaultDescription: string;
labelLeftIcon: string;
isTablet: boolean;

constructor(props: Props) {
	super(props);
	this.goBack = this.goBack.bind(this);
	this.handleBackPress = this.handleBackPress.bind(this);

	this.isTablet = DeviceInfo.isTablet();

	let { formatMessage } = props.intl;

	this.defaultDescription = `${formatMessage(i18n.defaultDescriptionButton)}`;
	this.labelLeftIcon = `${formatMessage(i18n.navigationBackButton)} .${this.defaultDescription}`;

	this.noName = formatMessage(i18n.noName);
}

goBack() {
	this.props.navigation.pop();
}

componentDidMount() {
	BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
}

componentWillUnmount() {
	BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
}

handleBackPress(): boolean {
	let { handleBackPress } = this.props;
	if (handleBackPress) {
		handleBackPress();
		return true;
	}
	return false;
}

_renderInfoButton = (button: Object): Object => {
	return (
		<RoundedInfoButton buttonProps={button}/>
	);
};

render(): Object {
	const { navigation, h1, h2, icon, appLayout, showBackButton, posterCoverStyle, infoButton, showLeftIcon } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;

	const adjustItems = !this.isTablet && !isPortrait;

	const {
		posterCover,
		iconBackground,
		iconStyle,
		h1Style,
		h2Style,
		posterHeight,
		posterItemsContainer,
	} = this.getStyles(appLayout, adjustItems);

	return (
		<View style={styles.container}>
			<NavigationHeader navigation={navigation} showLeftIcon={showLeftIcon}/>
			<Poster posterHeight={posterHeight}>
				<View style={[posterCover, posterCoverStyle]}>
					<View style={posterItemsContainer}>
						{!!icon && (
							<BlockIcon icon={icon} style={iconStyle} containerStyle={iconBackground}/>
						)}
						{!!h1 && (
							<Text style={h1Style}>
								{h1}
							</Text>
						)}
						{!!h2 && (
							<Text style={h2Style}>
								{h2}
							</Text>
						)}
					</View>
					{adjustItems && showBackButton && (
						<TouchableOpacity
							style={styles.backButtonLand}
							onPress={this.goBack}
							accessibilityLabel={this.labelLeftIcon}>
							<Icon name="arrow-back" size={width * 0.047} color="#fff"/>
						</TouchableOpacity>
					)}
					{!!infoButton && this._renderInfoButton(infoButton)}
				</View>
			</Poster>
		</View>
	);
}

getStyles(appLayout: Object, adjustItems: boolean): Object {
	const { align, icon } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const posterHeight = adjustItems ? deviceWidth * 0.155 : deviceWidth * 0.333;
	const iconBackgroundSize = posterHeight * 0.6;
	const fontSizeIcon = posterHeight * 0.4;

	const topWhenRight = adjustItems ? posterHeight * 0.25 : posterHeight * 0.25;

	const fontSizeH1 = posterHeight * 0.30;
	const fontSizeH2 = adjustItems ? (icon ? posterHeight * 0.24 : posterHeight * 0.2) : posterHeight * 0.15;

	return {
		posterCover: {
			position: 'absolute',
			left: 0,
			bottom: 0,
			top: 0,
			right: 0,
			alignItems: 'center',
			justifyContent: 'center',
			flexDirection: 'row',
		},
		posterItemsContainer: align === 'center' ?
			{
				flex: 1,
				position: 'absolute',
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: adjustItems ? 'row' : 'column',
			}
			:
			{
				flex: 1,
				position: 'absolute',
				top: align === 'center' ? 0 : topWhenRight,
				right: align === 'center' ? 0 : deviceWidth * 0.124,
				alignItems: align === 'right' ? 'flex-end' : 'center',
				justifyContent: 'center',
				flexDirection: 'column',
			},
		iconBackground: {
			backgroundColor: '#fff',
			alignItems: 'center',
			justifyContent: 'center',
			width: iconBackgroundSize,
			height: iconBackgroundSize,
			borderRadius: iconBackgroundSize / 2,
			marginRight: isPortrait ? 0 : 10,
		},
		iconStyle: {
			fontSize: fontSizeIcon,
			color: '#F06F0C',
		},
		h1Style: {
			fontSize: fontSizeH1,
			color: '#fff',
		},
		h2Style: {
			fontSize: fontSizeH2,
			color: '#fff',
		},
		posterHeight,
	};
}
}

const styles = StyleSheet.create({
	container: {
		flex: 0,
	},
	backButtonLand: {
		position: 'absolute',
		alignItems: 'flex-start',
		justifyContent: 'center',
		backgroundColor: 'transparent',
		left: 10,
		top: 10,
	},
});

export default NavigationHeaderPoster;
