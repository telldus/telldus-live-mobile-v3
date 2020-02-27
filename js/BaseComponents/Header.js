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
import { Platform, Image, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import { hasStatusBar } from '../App/Lib';
import Theme from '../App/Theme';

import computeProps from './computeProps';
import Button from './Button';
import View from './View';
import Base from './Base';
import Title from './Title';
import InputGroup from './InputGroup';
import Subtitle from './Subtitle';
import AttentionCatcher from './AttentionCatcher';
import _ from 'lodash';

type Props = {
	children?: Object,
	logoStyle?: Object | number,
	rounded?: number,
	searchBar?: ?Object,
	rightButton?: Object,
	leftButton: Object,
	appLayout: Object,
	showAttentionCapture: boolean,
	attentionCaptureText?: string,
	forceHideStatus?: boolean,
};

type DefaultProps = {
	showAttentionCapture: boolean,
	forceHideStatus?: boolean,
};

export default class HeaderComponent extends Base {

	deviceWidth: number;
	paddingHorizontal: number;
	paddingTop: number;
	props: Props;
	state: Object;

	getTheme: () => Object;

	static defaultProps: DefaultProps = {
		showAttentionCapture: false,
		forceHideStatus: false,
	};

	getInitialStyle: () => Object;
	prepareRootProps: () => Object;
	renderChildren: () => Object;
	renderRightButton: (Object) => Object;
	renderLeftButton: (Object) => Object;
	renderButtonContent: (Object) => Object;

	_hasStatusBar: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
			hasStatusBar: false,
		};

		this._hasStatusBar();
	}

	_hasStatusBar = async () => {
		const _hasStatusBar = await hasStatusBar();
		this.setState({
			hasStatusBar: _hasStatusBar,
		});
	}

	getInitialStyle(): Object {
		let { appLayout } = this.props;
		let { height, width } = appLayout;
		this.deviceWidth = height > width ? width : height;

		this.paddingHorizontal = 15;
		this.paddingTop = Theme.Core.navBarTopPadding;

		return {
			navbar: {
				backgroundColor: this.getTheme().toolbarDefaultBg,
				justifyContent: (!Array.isArray(this.props.children)) ? 'center' : 'space-between',
				flexDirection: 'row',
				alignItems: 'center',
				paddingHorizontal: this.paddingHorizontal,
				paddingTop: this.paddingTop,
				height: this.getTheme().toolbarHeight,
				position: 'relative',
			},
			statusBar: {
				height: ExtraDimensions.get('STATUS_BAR_HEIGHT'),
				backgroundColor: this.getTheme().toolbarDefaultBg,
			},
			logoImage: {
				width: this.deviceWidth * 0.307333333,
				height: this.deviceWidth * 0.046666667,
				resizeMode: 'contain',
			},
			iosToolbarSearch: {
				backgroundColor: this.getTheme().toolbarInputColor,
				borderRadius: this.props.rounded ? 25 : 2,
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
				paddingHorizontal: this.paddingHorizontal,
			},
			headerButton: {
				position: 'absolute',
				flex: 1,
				justifyContent: 'center',
				paddingTop: this.paddingTop,
				paddingHorizontal: this.paddingHorizontal,
			},
		};
	}

	prepareRootProps(): Object {

		let defaultProps = {
			style: this.getInitialStyle().navbar,
		};

		return computeProps(this.props, defaultProps);

	}

	renderChildren(): ?Object | ?Array<any> {
		if (!this.props.children) {
			return (
				<Image
					source={{uri: 'telldus_logo'}}
					style={[this.getInitialStyle().logoImage, this.props.logoStyle]}
				/>
			);
		} else if (!Array.isArray(this.props.children)) {
			return this.props.children;
		} else if (Array.isArray(this.props.children)) {
			let newChildren = [];
			let childrenArray = React.Children.toArray(this.props.children);

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

			if (this.props.searchBar) {
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
								style: this.getInitialStyle().iosToolbarSearch,
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
								color: this.getTheme().iosToolbarBtnColor,
								style: this.getInitialStyle().toolbarButton,
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
								style: this.getInitialStyle().androidToolbarSearch,
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
							color: this.getTheme().iosToolbarBtnColor,
							style: this.getInitialStyle().toolbarButton,
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
								color: this.getTheme().iosToolbarBtnColor,
								style: this.getInitialStyle().toolbarButton,
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
							style: this.getInitialStyle().toolbarButton,
							header: true,
							textStyle: { color: this.getTheme().toolbarTextColor },
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
								style: this.getInitialStyle().toolbarButton,
								header: true,
								textStyle: { color: this.getTheme().toolbarTextColor },
							}
						)}
					</View>);

				}
			}
			return newChildren;
		}
	}

	renderButtonContent = (button: Object): ?Object => {
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
	};

	getPropsAttentionCatcher(): Object {
		const { appLayout, attentionCaptureText } = this.props;
		let top = Theme.Core.navBarTopPadding, pos = 'right', right = 35, left;

		if (Platform.OS === 'android') {
			const { height, width } = appLayout;
			const isPortrait = height > width;

			top = isPortrait ? Theme.Core.navBarTopPadding : 0;
			if (!isPortrait) {
				pos = 'left';
				right = undefined;
				left = height - 35;
			}
		}
		return {top, right, left, pos, text: attentionCaptureText};
	}

	renderRightButtonAttentionCapture = (): Object => {
		const { top, right, left, pos, text } = this.getPropsAttentionCatcher();
		return (
			<AttentionCatcher
				containerTop={top}
				right={right}
				arrowPos={pos}
				left={left}
				text={text}/>
		);
	}

	renderRightButton = (rightButton: Object): Object => {
		let { accessibilityLabel, icon, style } = rightButton;
		style = icon ? icon.style : style;
		return (
			<TouchableOpacity
				onPress={rightButton.onPress}
				accessibilityLabel={accessibilityLabel}
				style={[
					this.getInitialStyle().headerButton,
					{
						alignItems: 'flex-end',
						backgroundColor: 'transparent',
						right: 0,
					},
					style,
				]}
			>
				{this.renderButtonContent(rightButton)}
			</TouchableOpacity>
		);
	};

	renderLeftButton = (leftButton: Object): Object => {
		let { accessibilityLabel, icon, customComponent } = leftButton;
		let style = icon ? icon.style : null;
		if (customComponent) {
			return customComponent;
		}
		return (
			<TouchableOpacity
				onPress={leftButton.onPress}
				accessibilityLabel={accessibilityLabel}
				style={[
					this.getInitialStyle().headerButton,
					{
						alignItems: 'flex-start',
						backgroundColor: 'transparent',
						left: 0,
					},
					style,
				]}
			>
				{this.renderButtonContent(leftButton)}
			</TouchableOpacity>
		);
	};

	render(): Object {
		const { leftButton, rightButton, showAttentionCapture, forceHideStatus } = this.props;

		return (
			<View style={{ flex: 0 }}>
				{
					(!forceHideStatus && Platform.OS === 'android' && this.state.hasStatusBar) ? (
						<View style={this.getInitialStyle().statusBar}/>
					) : null
				}
				<View {...this.prepareRootProps()}>
					{!!leftButton && this.renderLeftButton(leftButton)}
					{this.renderChildren()}
					{showAttentionCapture && this.renderRightButtonAttentionCapture()}
					{!!rightButton && this.renderRightButton(rightButton)}
				</View>
			</View>
		);
	}
}

