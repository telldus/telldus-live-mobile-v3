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
import {
	Platform,
	TouchableOpacity,
} from 'react-native';
const isEqual = require('react-fast-compare');

import {
	View,
	Text,
	Image,
	InfoBlock,
	ProgressBarLinear,
	Throbber,
	Icon,
} from '../../../../BaseComponents';

import {
	withTheme,
	PropsThemedComponent,
} from '../../HOC/withTheme';

import Theme from '../../../Theme';
import shouldUpdate from '../../../Lib/shouldUpdate';

import i18n from '../../../Translations/common';

type Props = PropsThemedComponent & {
	appLayout: Object,
	timer: number | null | string,
	status: string | null,
	percent: number,
	progress: number,
	showThrobber?: boolean,
	infoText?: string,
	deviceImage: string,
	actionsDescription?: string,

    action: 'include' | 'exclude',
	intl: Object,
	onPressCancel?: Function,
};

type State = {
	width: number,
};

type DefaultProps = {
	action: 'include' | 'exclude',
	showThrobber: boolean,
	deviceImage: string,
};

class ZWaveIncludeExcludeUI extends View<Props, State> {
props: Props;
state: State;

onLayout: (Object) => void;

static defaultProps: DefaultProps = {
	action: 'include',
	showThrobber: false,
	deviceImage: 'img_zwave_include',
};

constructor(props: Props) {
	super(props);

	this.state = {
		width: 0,
	};

	this.onLayout = this.onLayout.bind(this);

	const { action, intl } = this.props;
	const { formatMessage } = intl;

	this.isInclude = action === 'include';
	this.isExclude = action === 'exclude';

	this.messageOne = this.isInclude ? formatMessage(i18n.messageOne) : formatMessage(i18n.messageOneExclude);
	this.messageTwo = this.isInclude ? formatMessage(i18n.messageTwo) : formatMessage(i18n.messageTwoExclude);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	if (shouldUpdate(nextProps, this.props, [
		'showThrobber',
		'progress',
		'percent',
		'status',
		'timer',
		'appLayout',
		'deviceImage',
		'infoText',
		'themeInApp',
		'colorScheme',
		'selectedThemeSet',
		'actionsDescription',
	])) {
		return true;
	}
	if (!isEqual(this.state, nextState)) {
		return true;
	}
	return false;
}

onLayout(ev: Object) {
	let { width } = ev.nativeEvent.layout;
	if (this.state.width !== width) {
		this.setState({
			width,
		});
	}
}

render(): Object {
	const {
		intl,
		timer,
		status,
		progress,
		showThrobber,
		infoText,
		deviceImage,
		onPressCancel,
		appLayout,
		actionsDescription,
	} = this.props;
	const { width } = this.state;
	const {
		container,
		progressContainer,
		infoContainer,
		imageType,
		textStyle,
		infoIconStyle,
		markerTextCover,
		markerText,
		timerStyle,
		statusStyle,
		blockLeft,
		infoOneContainer,
		headerTextStyle,
		throbberContainerStyle,
		iconCancelStyle,
		iconCancelSize,
		iconCancelColor,
	} = this.getStyles();

	const { formatMessage } = intl;

	const showInfo = this.isInclude && !!infoText;

	const showIconCancel = !!onPressCancel;

	return (
		<View style={container}>
			<View
				level={2}
				style={progressContainer}>
				<View style={[blockLeft, {
					flexDirection: 'column',
					alignItems: 'flex-start',
				}]}>
					{this.isInclude && (
						[
							<View style={markerTextCover} key={'0'}/>,
							<Text style={markerText} key={'1'}>
                            1.
							</Text>,
						]
					)}
					<Image source={{uri: deviceImage}} resizeMode={'cover'} style={imageType}/>
				</View>
				<View style={infoOneContainer} onLayout={this.onLayout}>
					{this.isExclude && (
						[<Text style={headerTextStyle} key={'0'}>
							{formatMessage(i18n.headerExclude)}
						</Text>,
						<Text key={'1'}/>]
					)}
					{actionsDescription ?
						<>
							<Text>
								<Text
									level={4}
									style={textStyle}>
									{'Information from the manufacturer: '}
								</Text>
								<Text
									level={25}
									style={textStyle}>
									{actionsDescription}
								</Text>
							</Text>
							<Text/>
						</>
						:
						<>
							<Text
								level={25}
								style={textStyle}>
								{this.messageOne}
							</Text>
							<Text/>
							<Text
								level={25}
								style={textStyle}>
								{this.messageTwo}
							</Text>
							<Text/>
						</>
					}
					{showThrobber ?
						<Throbber throbberContainerStyle={throbberContainerStyle} throbberStyle={timerStyle}/>
						:
						<>
							<View style={{
								flexDirection: 'row',
								alignItems: 'center',
							}}>
								<Text style={timerStyle} key={'0'}>
									{timer}
								</Text>
								{showIconCancel && <TouchableOpacity
									onPress={onPressCancel}>
									<Icon
										style={iconCancelStyle}
										name={'times-circle'}
										size={iconCancelSize}
										color={iconCancelColor}/>
								</TouchableOpacity>
								}
							</View>
							<Text
								level={25}
								style={statusStyle} key={'1'}>
								{status}
							</Text>
						</>
					}
					<ProgressBarLinear
						progress={progress}
						height={4}
						width={width}
						borderWidth={0}
						borderColor="transparent"
						unfilledColor={Theme.Core.inactiveSwitchBackground} />
				</View>
			</View>
			{showInfo && (
				<InfoBlock
					text={infoText}
					appLayout={appLayout}
					infoContainer={infoContainer}
					textStyle={textStyle}
					infoIconStyle={infoIconStyle}/>
			)}
		</View>
	);
}

getStyles(): Object {
	const { appLayout, colors } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		inAppBrandSecondary,
		inAppBrandPrimary,
	} = colors;

	const {
		paddingFactor,
		shadow,
		inactiveSwitchBackground,
		fontSizeFactorFive,
		fontSizeFactorEight,
		fontSizeFactorTen,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeText = deviceWidth * fontSizeFactorTen;
	const fontSizeStatus = deviceWidth * 0.03;
	const blockIconContainerSize = deviceWidth * 0.26;

	const contPadding = 5 + (fontSizeText * 0.5);
	const markerHeight = deviceWidth * 0.075;

	const contOneTop = markerHeight - contPadding;

	const iconCancelSize = fontSizeText * 1.3;
	const iconCancelColor = inactiveSwitchBackground;

	return {
		innerPadding: contPadding,
		container: {
			paddingTop: padding,
			paddingBottom: padding / 2,
			marginHorizontal: padding,
		},
		progressContainer: {
			flex: 1,
			flexDirection: 'row',
			marginBottom: padding / 2,
			borderRadius: 2,
			padding: contPadding,
			...shadow,
		},
		infoContainer: {
			flex: 1,
			flexDirection: 'row',
			marginBottom: padding / 2,
			borderRadius: 2,
			padding: contPadding,
			...shadow,
		},
		markerTextCover: {
			position: 'absolute',
			left: -(contPadding),
			top: -(contPadding),
			width: deviceWidth * 0.2,
			height: Platform.OS === 'ios' ? deviceWidth * fontSizeFactorFive : 0,
			backgroundColor: 'transparent',
			borderStyle: 'solid',
			borderRightWidth: deviceWidth * fontSizeFactorFive,
			borderTopWidth: Platform.OS === 'ios' ? deviceWidth * 0.17 : deviceWidth * 0.1,
			borderRightColor: 'transparent',
			borderTopColor: inAppBrandPrimary,
			borderTopLeftRadius: 2,
		},
		markerText: {
			position: 'absolute',
			fontSize: deviceWidth * fontSizeFactorFive,
			color: '#fff',
			top: -(contPadding) + (deviceWidth * 0.025),
			left: deviceWidth * 0.025,
		},
		infoOneContainer: {
			flex: 1,
			flexDirection: 'column',
			paddingTop: contOneTop,
		},
		headerTextStyle: {
			fontSize: fontSizeText * 1.2,
			color: inAppBrandSecondary,
		},
		imageType: {
			marginTop: markerHeight,
			height: deviceWidth * 0.20,
			width: deviceWidth * 0.17,
		},
		textStyle: {
			fontSize: fontSizeText,
			flexWrap: 'wrap',
		},
		infoIconStyle: {
			fontSize: blockIconContainerSize / 2,
		},
		blockIcontainerStyle: {
			width: blockIconContainerSize,
			height: undefined,
			borderRadius: 0,
			backgroundColor: 'transparent',
		},
		timerStyle: {
			fontSize: deviceWidth * fontSizeFactorEight,
			color: inAppBrandSecondary,
			textAlignVertical: 'center',
			marginRight: 5,
		},
		throbberContainerStyle: {
			position: 'relative',
			alignSelf: 'flex-start',
			marginBottom: 4,
		},
		statusStyle: {
			fontSize: fontSizeStatus,
			marginBottom: 4,
		},
		blockLeft: {
			width: deviceWidth * 0.21,
			justifyContent: 'center',
			alignItems: 'center',
		},
		iconCancelStyle: {
			paddingHorizontal: 4,
			justifyContent: 'center',
			alignItems: 'center',
		},
		iconCancelSize,
		iconCancelColor,
	};
}
}

export default (withTheme(ZWaveIncludeExcludeUI): Object);
