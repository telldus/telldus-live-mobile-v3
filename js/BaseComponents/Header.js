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

import React, {
	useCallback,
	useState,
	useEffect,
} from 'react';
import {
	Platform,
	Image,
	Text,
	TouchableOpacity,
} from 'react-native';
import {
	useSelector,
} from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
const ExtraDimensions = Platform.OS === 'ios' ? {} : require('react-native-extra-dimensions-android');
import { useIntl } from 'react-intl';

import Theme from '../App/Theme';

import Button from './Button';
import View from './View';
import Title from './Title';
import InputGroup from './InputGroup';
import Subtitle from './Subtitle';
import AttentionCatcher from './AttentionCatcher';
import _ from 'lodash';

import {
	useAppTheme,
} from '../App/Hooks/Theme';

import TelldusLogo from '../App/Components/TabViews/img/telldus_logo.svg';
import TelldusLogoTwo from '../App/Components/TabViews/img/telldus_logo_two.svg';

import { hasStatusBar as hasStatusBarMeth } from '../App/Lib';

import i18n from '../App/Translations/common';

type Props = {
	children?: Object,
	logoStyle?: Object,
	rounded?: number,
	searchBar?: ?Object,
	rightButton?: Object,
	leftButton: Object,
	showAttentionCapture: boolean,
	forceHideStatus?: boolean,
	style: Object | Array<any>,
	onPressLogo?: Function,
};

const HeaderComponent = (props: Props): Object => {

	const {
		children,
		rounded,
		logoStyle,
		searchBar,
		leftButton,
		rightButton,
		showAttentionCapture,
		style,
		onPressLogo,
		forceHideStatus,
	} = props;

	const {
		iosToolbarBtnColor,
		toolbarTextColor,
	} = Theme.Core;

	const [ hasStatusBar, setHasStatusBar ] = useState(false);

	useEffect(() => {
		(async () => {
			const _hasStatusBar = await hasStatusBarMeth();
			setHasStatusBar(_hasStatusBar);
		})();
	}, []);

	const intl = useIntl();

	const {
		colors,
		selectedThemeSet,
	} = useAppTheme();

	const { layout: appLayout } = useSelector((state: Object): Object => state.app);
	const {
		height,
		width,
	} = appLayout;
	const {
		navbar,
		iosToolbarSearch,
		toolbarButton,
		androidToolbarSearch,
		headerButton,
		statusBar,
		logoWidth,
		logoHeight,
	} = getStyles(appLayout, {
		rounded,
		children,
	});

	const renderChildren = useCallback((): ?Object | ?Array<any> => {
		if (!children) {
			return (
				<TouchableOpacity
					disabled={!onPressLogo}
					onPress={onPressLogo}>
					{(selectedThemeSet && selectedThemeSet.key === 2) ?
						<TelldusLogoTwo
							colorHomeLogo={colors.headerLogoColor}
							style={logoStyle}
							height={logoHeight}
							width={logoWidth}/>
						:
						<TelldusLogo
							colorHomeLogo={colors.headerLogoColor}
							colorTextLogo={colors.headerIconColor}
							colorWaveLogo={colors.headerIconColor}
							style={logoStyle}
							height={logoHeight}
							width={logoWidth}/>
					}
				</TouchableOpacity>
			);
		} else if (!Array.isArray(children)) {
			return children;
		} else if (Array.isArray(children)) {
			let newChildren = [];
			let childrenArray = React.Children.toArray(children);

			let buttons = [];
			buttons = _.remove(childrenArray, (item: Object): ?boolean => {
				if (item.type === Button) {
					return true;
				}
			});

			let title = [];
			title = _.remove(childrenArray, (item: Object): ?boolean => {
				if (item.type === Title) {
					return true;
				}
			});

			let subtitle = [];
			subtitle = _.remove(childrenArray, (item: Object): ?boolean => {
				if (item.type === Subtitle) {
					return true;
				}
			});

			let input = [];
			input = _.remove(childrenArray, (item: Object): ?boolean => {
				if (item.type === InputGroup) {
					return true;
				}
			});

			if (searchBar) {
				if (Platform.OS === 'ios') {
					newChildren.push(<View key="search" style={{
						flex: 1,
						alignSelf: 'center',
						justifyContent: 'flex-start',
						flexDirection: 'row',
						marginLeft: -7,
					}}>
						{React.cloneElement(
							input[0],
							{
								style: iosToolbarSearch,
								toolbar: true,
								key: 'inp',
							}
						)}
					</View>);
					newChildren.push(<View key="searchBtn" style={{
						alignItems: 'center',
						justifyContent: 'center',
						flexDirection: 'row',
						marginRight: -14,
					}}>
						{React.cloneElement(
							buttons[0],
							{
								color: iosToolbarBtnColor,
								style: toolbarButton,
							}
						)}
					</View>);
				} else {
					newChildren.push(<View key="search" style={{
						flex: 1,
						alignSelf: 'center',
						justifyContent: 'flex-start',
						flexDirection: 'row',
						marginLeft: -8,
						marginRight: -8,
					}}>
						{React.cloneElement(
							input[0],
							{
								style: androidToolbarSearch,
								atoolbar: true,
							}
						)}
					</View>);
				}
			} else if (Platform.OS === 'ios') {
				newChildren.push(<View key="btn1" style={{
					alignItems: 'center',
					justifyContent: 'flex-start',
					flexDirection: 'row',
					marginLeft: -14,
				}}>
					{React.cloneElement(
						buttons[0],
						{
							color: iosToolbarBtnColor,
							style: toolbarButton,
						}
					)}
				</View>);
				newChildren.push(<View key="title" style={{
					flex: 3,
					alignSelf: 'center',
					justifyContent: 'space-between',
				}}>
					{[title[0], subtitle[0]]}
				</View>);
				for (let i = 1; i < buttons.length; i++) {
					newChildren.push(<View key={`btn${i + 1}`} style={{
						alignItems: 'center',
						justifyContent: 'flex-start',
						flexDirection: 'row',
						marginRight: -14,
					}}>
						{React.cloneElement(
							buttons[i],
							{
								color: iosToolbarBtnColor,
								style: toolbarButton,
							}
						)}
					</View>);
				}
			} else {
				newChildren.push(<View key="btn1" style={{
					alignItems: 'center',
					justifyContent: 'flex-start',
					flexDirection: 'row',
					marginLeft: -10,
					marginRight: 12,
				}}>
					{React.cloneElement(
						buttons[0],
						{
							style: toolbarButton,
							header: true,
							textStyle: { color: toolbarTextColor },
						}
					)}
				</View>);
				newChildren.push(<View key="title" style={{
					flex: 3,
					alignSelf: 'stretch',
					justifyContent: 'center',
				}}>
					{[title[0]]}
				</View>);
				for (let i = 1; i < buttons.length; i++) {
					newChildren.push(<View key={`btn${i + 1}`} style={{
						alignItems: 'center',
						justifyContent: 'flex-start',
						flexDirection: 'row',
						marginRight: -7,
					}}>
						{React.cloneElement(
							buttons[i],
							{
								style: toolbarButton,
								header: true,
								textStyle: { color: toolbarTextColor },
							}
						)}
					</View>);

				}
			}
			return newChildren;
		}
	}, [children, selectedThemeSet, onPressLogo, colors.headerLogoColor, colors.headerIconColor, logoStyle, logoHeight, logoWidth, searchBar, iosToolbarSearch, iosToolbarBtnColor, toolbarButton, androidToolbarSearch, toolbarTextColor]);

	const renderButtonContent = useCallback((button: Object): ?Object => {
		if (button.image) {
			return <Image source={button.image}/>;
		}
		if (button.icon) {
			const { name, size, color, iconStyle } = button.icon;
			return <Icon name={name} size={size} color={color} style={iconStyle}/>;
		}
		if (button.title) {
			return <Text allowFontScaling={false}>{button.title}</Text>;
		}
		if (button.component) {
			return button.component;
		}
	}, []);



	const renderRightButtonAttentionCapture = useCallback((): Object => {
		const getPropsAttentionCatcher = (): Object => {
			let top = Theme.Core.navBarTopPadding, pos = 'right', right = 35, left;

			if (Platform.OS === 'android') {
				const isPortrait = height > width;

				top = isPortrait ? Theme.Core.navBarTopPadding : 0;
				if (!isPortrait) {
					pos = 'left';
					right = undefined;
					left = height - 35;
				}
			}
			return {top, right, left, pos, text: intl.formatMessage(i18n.labelAddNewDevice)};
		};
		const { top, right, left, pos, text } = getPropsAttentionCatcher();
		return (
			<AttentionCatcher
				containerTop={top}
				right={right}
				arrowPos={pos}
				left={left}
				text={text}/>
		);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [appLayout]);

	const renderRightButton = useCallback((button: Object): Object => {

		let { accessibilityLabel, icon } = button;
		let coverStyle = icon ? icon.style : button.style;
		return (
			<TouchableOpacity
				onPress={button.onPress}
				disabled={!button.onPress}
				accessibilityLabel={accessibilityLabel}
				style={[
					headerButton,
					{
						alignItems: 'flex-end',
						backgroundColor: 'transparent',
						right: 0,
					},
					coverStyle,
				]}
			>
				{renderButtonContent(button)}
			</TouchableOpacity>
		);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [appLayout]);

	const renderLeftButton = useCallback((button: Object): Object => {
		let { accessibilityLabel, icon, customComponent } = button;
		let coverStyle = icon ? icon.style : null;
		if (customComponent) {
			return customComponent;
		}
		return (
			<TouchableOpacity
				onPress={button.onPress}
				disabled={!button.onPress}
				accessibilityLabel={accessibilityLabel}
				style={[
					headerButton,
					{
						alignItems: 'flex-start',
						backgroundColor: 'transparent',
						left: 0,
					},
					coverStyle,
				]}
			>
				{renderButtonContent(button)}
			</TouchableOpacity>
		);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [appLayout]);

	return (
		<>
			{
				(!forceHideStatus && Platform.OS === 'android' && hasStatusBar) ? (
					<View
						level={19}
						style={statusBar}/>
				) : null
			}
			<View
				level={19}
				style={[navbar, style]}>
				{!!leftButton && renderLeftButton(leftButton)}
				{renderChildren()}
				{showAttentionCapture && renderRightButtonAttentionCapture()}
				{!!rightButton && renderRightButton(rightButton)}
			</View>
		</>
	);
};

const getStyles = (appLayout: Object, {
	children,
	rounded,
}: Object): Object => {

	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		navBarTopPadding: paddingTop,
		toolbarHeight,
		toolbarInputColor,
		headerButtonHorizontalPadding,
	 } = Theme.Core;

	const paddingHorizontal = headerButtonHorizontalPadding;

	return {
		logoWidth: deviceWidth * 0.307333333,
		logoHeight: deviceWidth * 0.046666667,
		navbar: {
			justifyContent: (!Array.isArray(children)) ? 'center' : 'space-between',
			flexDirection: 'row',
			alignItems: 'center',
			paddingHorizontal: paddingHorizontal,
			paddingTop: paddingTop,
			height: toolbarHeight,
			position: 'relative',
		},
		statusBar: {
			height: Platform.OS === 'android' ? ExtraDimensions.get('STATUS_BAR_HEIGHT') : 0,
		},
		iosToolbarSearch: {
			backgroundColor: toolbarInputColor,
			borderRadius: rounded ? 25 : 2,
			height: 30,
			borderColor: 'transparent',
			flex: 1,
		},
		androidToolbarSearch: {
			backgroundColor: '#fff',
			borderRadius: 2,
			borderColor: 'transparent',
			elevation: 2,
			flex: 1,
		},
		toolbarButton: {
			paddingHorizontal: paddingHorizontal,
		},
		headerButton: {
			position: 'absolute',
			flex: 1,
			justifyContent: 'center',
			paddingTop: paddingTop,
			paddingHorizontal: paddingHorizontal,
		},
	};
};

HeaderComponent.defaultProps = {
	showAttentionCapture: false,
	forceHideStatus: false,
};

export default (React.memo<Object>(HeaderComponent): Object);
