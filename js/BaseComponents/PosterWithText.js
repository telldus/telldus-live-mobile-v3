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
import { StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import DeviceInfo from 'react-native-device-info';
const isEqual = require('react-fast-compare');

import Text from './Text';
import View from './View';
import Poster from './Poster';
import BlockIcon from './BlockIcon';
import RoundedInfoButton from './RoundedInfoButton';
import Icon from './Icon';
import ThemedMaterialIcon from './ThemedMaterialIcon';

import { shouldUpdate } from '../App/Lib';
import Theme from '../App/Theme';

type InfoButton = {
	onPress?: Function,
	infoButtonContainerStyle?: Array<any> | Object,
	infoButtonStyle?: Array<any> | Object,
};

type Props = {
    h1: string,
    h2: string,
	icon: string,
    appLayout: Object,
    showBackButton?: boolean,
    align?: 'right' | 'center' | 'left',
	infoButton?: InfoButton,
	showLeftIcon?: boolean,
	leftIcon: string,
	scrollableH1?: boolean,
	posterWidth?: number,
	customComponent?: Object,
	extraData?: Object,

	navigation: Object,
	posterCoverStyle?: Array<any> | Object,
	h1Style?: Array<any> | Object,
	posterItemsContainerStyle?: Array<any> | Object,
};

type DefaultProps = {
    showBackButton: boolean,
	align: 'right' | 'center' | 'left',
	showLeftIcon: boolean,
	leftIcon: string,
};

type State = {
	isHeaderLong: boolean,
	isHeaderTwoLong: boolean,
};

class PosterWithText extends React.Component<Props, State> {
props: Props;
state: State;

static defaultProps: DefaultProps = {
	showBackButton: true,
	align: 'center',
	showLeftIcon: true,
	leftIcon: Platform.OS === 'ios' ? 'angle-left' : 'arrow-back',
	scrollableH1: true,
};

goBack: () => void;
onLayoutHeaderOne: (Object) => void;
onLayoutHeaderTwo: (Object) => void;

labelLeftIcon: string;
isTablet: boolean;

constructor(props: Props) {
	super(props);

	this.state = {
		isHeaderLong: false,
		isHeaderTwoLong: false,
	};

	this.isTablet = DeviceInfo.isTablet();

	this.goBack = this.goBack.bind(this);

	this.onLayoutHeaderOne = this.onLayoutHeaderOne.bind(this);
	this.onLayoutHeaderTwo = this.onLayoutHeaderTwo.bind(this);
}

goBack() {
	this.props.navigation.pop();
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

	const propsChange = shouldUpdate(others, othersN, [
		'icon',
		'showBackButton',
		'showLeftIcon',
		'align',
		'infoButton',
		'leftIcon',
		'scrollableH1',
		'posterWidth',
		'extraData',
	]);
	if (propsChange) {
		return true;
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
		h1, h2,
		icon,
		appLayout,
		showBackButton,
		posterCoverStyle,
		infoButton,
		showLeftIcon,
		leftIcon,
		h1Style,
		posterItemsContainerStyle,
		scrollableH1,
		posterWidth,
		customComponent,
	} = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;

	const adjustItems = !this.isTablet && !isPortrait;

	const {
		posterCover,
		iconBackground,
		iconStyle,
		h1StyleDef,
		h2StyleDef,
		posterHeight,
		posterItemsContainerDef,
		scolllViewCCStyle,
		scolllViewStyle,
	} = this.getStyles(appLayout, adjustItems);

	return (
		<View style={styles.container}>
			<Poster
				posterHeight={posterHeight}
				posterWidth={posterWidth}>
				<View style={[posterCover, posterCoverStyle]}>
					<View style={[posterItemsContainerDef, posterItemsContainerStyle]}>
						{!!icon && (
							<BlockIcon
								iconLevel={41}
								blockLevel={18}
								icon={icon}
								style={iconStyle}
								containerStyle={iconBackground}/>
						)}
						{!!h1 && (
							scrollableH1 ?
								<ScrollView
									nestedScrollEnabled={true}
									horizontal={true}
									bounces={false}
									showsHorizontalScrollIndicator={false}
									style={scolllViewStyle}
									contentContainerStyle={scolllViewCCStyle}>
									<Text
										level={33}
										style={[h1StyleDef, h1Style]}
										onLayout={this.onLayoutHeaderOne}>
										{h1}
									</Text>
								</ScrollView>
								:
								<Text
									level={33}
									style={[h1StyleDef, h1Style]}
									onLayout={this.onLayoutHeaderOne}>
									{h1}
								</Text>
						)}
						{!!h2 && (
							<Text
								level={33}
								style={h2StyleDef} onLayout={this.onLayoutHeaderTwo}>
								{h2}
							</Text>
						)}
					</View>
					{adjustItems && showBackButton && showLeftIcon && (
						<TouchableOpacity
							style={styles.backButtonLand}
							onPress={this.goBack}
							accessibilityLabel={this.labelLeftIcon}>
							{Platform.OS === 'ios' && leftIcon !== 'close' ?
								<Icon
									level={17}
									name={leftIcon}
									size={width * Theme.Core.fontSizeFactorSeven} />
								:
								<ThemedMaterialIcon
									level={17}
									name={leftIcon}
									size={width * Theme.Core.fontSizeFactorSeven} />
							}
						</TouchableOpacity>
					)}
					{!!infoButton && this._renderInfoButton(infoButton)}
					{!!customComponent && customComponent}
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
	const iconBackgroundSize = posterHeight * 0.55;
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
			flex: 1,
			position: 'absolute',
			left: 0,
			bottom: 0,
			top: 0,
			right: 0,
			alignItems: 'center',
			justifyContent: 'center',
			flexDirection: 'row',
		},
		posterItemsContainerDef: align === 'center' ?
			{
				flex: 0,
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: adjustItems ? 'row' : 'column',
			}
			:
			{
				flex: 0,
				width: width * 0.8,
				marginRight: deviceWidth * 0.124,
				alignItems: 'flex-start',
				justifyContent: 'center',
				flexDirection: 'column',
			},
		iconBackground: {
			alignItems: 'center',
			justifyContent: 'center',
			width: iconBackgroundSize,
			height: iconBackgroundSize,
			borderRadius: iconBackgroundSize / 2,
			marginRight: isPortrait ? 0 : 10,
			marginBottom: 3,
		},
		scolllViewCCStyle: {
			alignItems: 'center',
			justifyContent: 'center',
			flex: 0,
			flexGrow: 0,
		},
		scolllViewStyle: {
			flex: 0,
			flexGrow: 0,
		},
		iconStyle: {
			fontSize: fontSizeIcon,
		},
		h1StyleDef: {
			flex: 0,
			fontSize: fontSizeH1,
			fontWeight: '500',
			textAlign: align === 'center' ? 'center' : 'left',
		},
		h2StyleDef: {
			fontSize: fontSizeH2,
			fontWeight: '400',
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

export default (PosterWithText: Object);
