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
import { StyleSheet, TouchableOpacity, BackHandler, Platform, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DeviceInfo from 'react-native-device-info';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
const isEqual = require('react-fast-compare');

import Text from './Text';
import View from './View';
import Poster from './Poster';
import BlockIcon from './BlockIcon';
import NavigationHeader from './NavigationHeader';
import RoundedInfoButton from './RoundedInfoButton';

import { shouldUpdate } from '../App/Lib';

import Theme from '../App/Theme';

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
    appLayout: Object,
    showBackButton?: boolean,
    align?: 'right' | 'center',
	infoButton?: InfoButton,
	showLeftIcon?: boolean,
	leftIcon: string,

	navigation: Object,
    handleBackPress: () => boolean,
    intl: Object,
	posterCoverStyle?: Array<any> | Object | number,
};

type DefaultProps = {
    showBackButton: boolean,
	align: 'right' | 'center',
	showLeftIcon: boolean,
	leftIcon: string,
};

type State = {
	isHeaderLong: boolean,
	isHeaderTwoLong: boolean,
};

class NavigationHeaderPoster extends React.Component<Props, State> {
props: Props;
state: State;

static defaultProps: DefaultProps = {
	showBackButton: true,
	align: 'center',
	showLeftIcon: true,
	leftIcon: Platform.OS === 'ios' ? 'angle-left' : 'arrow-back',
};

goBack: () => void;
handleBackPress: () => boolean;
onLayoutHeaderOne: (Object) => void;
onLayoutHeaderTwo: (Object) => void;

noName: string;
defaultDescription: string;
labelLeftIcon: string;
isTablet: boolean;

constructor(props: Props) {
	super(props);

	this.state = {
		isHeaderLong: false,
		isHeaderTwoLong: false,
	};

	this.isTablet = DeviceInfo.isTablet();

	let { formatMessage } = props.intl;

	this.defaultDescription = `${formatMessage(i18n.defaultDescriptionButton)}`;
	this.labelLeftIcon = `${formatMessage(i18n.navigationBackButton)} .${this.defaultDescription}`;

	this.noName = formatMessage(i18n.noName);

	this.goBack = this.goBack.bind(this);
	this.handleBackPress = this.handleBackPress.bind(this);

	this.onLayoutHeaderOne = this.onLayoutHeaderOne.bind(this);
	this.onLayoutHeaderTwo = this.onLayoutHeaderTwo.bind(this);
}

goBack() {
	this.props.navigation.pop();
}

componentDidMount() {
	BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	const isStateEqual = isEqual(this.state, nextState);
	if (!isStateEqual) {
		return true;
	}

	const { appLayout, h1, h2, ...others } = this.props;
	const { appLayout: appLayoutN, h1: h1N, h2: h2N, ...othersN} = nextProps;
	if (appLayout.width !== appLayoutN.width || h1 !== h1N || h2 !== h2N) {
		return true;
	}

	const propsChange = shouldUpdate(others, othersN, ['icon', 'showBackButton', 'showLeftIcon', 'align', 'infoButton', 'leftIcon']);
	if (propsChange) {
		return true;
	}

	return false;
}

componentWillUnmount() {
	BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
}

handleBackPress(): boolean {
	let { handleBackPress } = this.props;
	if (handleBackPress) {
		return handleBackPress();
	}
	return false;
}

onLayoutHeaderOne(ev: Object) {
	const { width } = this.props.appLayout;
	const { layout } = ev.nativeEvent;
	const posterWidth = width * 0.8;
	const headerWidth = layout.width + layout.x + 5;
	if (headerWidth >= posterWidth) {
		this.setState({
			isHeaderLong: true,
		});
	}
}

onLayoutHeaderTwo(ev: Object) {
	const { width } = this.props.appLayout;
	const { layout } = ev.nativeEvent;
	const posterWidth = width * 0.8;
	const headerWidth = layout.width + layout.x + 5;
	if (headerWidth >= posterWidth) {
		this.setState({
			isHeaderTwoLong: true,
		});
	}
}

_renderInfoButton = (button: Object): Object => {
	return (
		<RoundedInfoButton buttonProps={button}/>
	);
};

render(): Object {
	const {
		navigation,
		h1, h2,
		icon,
		appLayout,
		showBackButton,
		posterCoverStyle,
		infoButton,
		showLeftIcon,
		leftIcon,
	} = this.props;
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
			<NavigationHeader navigation={navigation} showLeftIcon={showLeftIcon} leftIcon={leftIcon}/>
			<Poster posterHeight={posterHeight}>
				<View style={[posterCover, posterCoverStyle]}>
					<View style={posterItemsContainer}>
						{!!icon && (
							<BlockIcon icon={icon} style={iconStyle} containerStyle={iconBackground}/>
						)}
						{!!h1 && (
							<ScrollView
								horizontal={true} bounces={false} showsHorizontalScrollIndicator={false}>
								<Text style={h1Style} onLayout={this.onLayoutHeaderOne}>
									{h1}
								</Text>
							</ScrollView>
						)}
						{!!h2 && (
							<Text style={h2Style} onLayout={this.onLayoutHeaderTwo}>
								{h2}
							</Text>
						)}
					</View>
					{adjustItems && showBackButton && (
						<TouchableOpacity
							style={styles.backButtonLand}
							onPress={this.goBack}
							accessibilityLabel={this.labelLeftIcon}>
							{Platform.OS === 'ios' && leftIcon !== 'close' ?
								<FontAwesome name={leftIcon} size={width * 0.047} color="#fff"/>
								:
								<Icon name={leftIcon} size={width * 0.047} color="#fff"/>
							}
						</TouchableOpacity>
					)}
					{!!infoButton && this._renderInfoButton(infoButton)}
				</View>
			</Poster>
		</View>
	);
}

getStyles(appLayout: Object, adjustItems: boolean): Object {
	const { isHeaderLong, isHeaderTwoLong } = this.state;
	const { align, icon, h1 } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const posterHeight = adjustItems ? deviceWidth * 0.155 : deviceWidth * 0.311;
	const iconBackgroundSize = posterHeight * 0.6;
	const fontSizeIcon = posterHeight * 0.4;

	const fontSizeH1 = adjustItems ? posterHeight * 0.42
		:
		(isHeaderLong ? posterHeight * 0.2
			:
			posterHeight * 0.23);
	const fontSizeH2 = adjustItems ? (icon ? posterHeight * 0.29
		:
		posterHeight * 0.25)
		:
		(h1 ? ((isHeaderLong || isHeaderTwoLong) ? posterHeight * 0.13
			:
			posterHeight * 0.15)
			:
			posterHeight * 0.17);

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
				width: width * 0.8,
				position: 'absolute',
				right: deviceWidth * 0.124,
				alignItems: 'flex-end',
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
			fontFamily: Theme.Core.fonts.robotoLight,
			fontSize: fontSizeH1,
			color: '#fff',
		},
		h2Style: {
			fontFamily: Theme.Core.fonts.robotoLight,
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
