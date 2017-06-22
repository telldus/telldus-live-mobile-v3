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
import { Platform, Image, Dimensions, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Base from './Base';
import computeProps from './computeProps';
import Button from './Button';
import View from './View';
import Title from './Title';
import InputGroup from './InputGroup';
import Subtitle from './Subtitle';
import _ from 'lodash';
import Icon from 'react-native-vector-icons/FontAwesome';

type Props = {
	children: Object,
	rounded: number,
	searchBar: ?Object,
	rightButton: Object
};

export default class HeaderComponent extends Base {
	props: Props;

	getInitialStyle() {
		return {
			navbar: {
				backgroundColor: this.getTheme().toolbarDefaultBg,
				justifyContent: (!Array.isArray(this.props.children)) ? 'center' : 'space-between',
				flexDirection: 'row',
				alignItems: 'center',
				paddingHorizontal: 15,
				paddingTop: (Platform.OS === 'ios' ) ? 15 : 0,
				height: this.getTheme().toolbarHeight,
				elevation: 3,
				position: 'relative',
			},
			logoImage: {
				width: Dimensions.get('window').width * 0.277333333,
				height: Dimensions.get('window').height * 0.026236882,
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
				paddingHorizontal: 15,
			},
		};
	}

	prepareRootProps() {

		let defaultProps = {
			style: this.getInitialStyle().navbar,
		};

		return computeProps(this.props, defaultProps);

	}

	renderChildren() {
		if (!this.props.children) {
			return (
				<Image
					source={require('../App/Components/TabViews/img/telldus-logo@3x.png')}
					style={this.getInitialStyle().logoImage}
				/>
			);
		} else if (!Array.isArray(this.props.children)) {
			return this.props.children;
		} else if (Array.isArray(this.props.children)) {
			let newChildren = [];
			let childrenArray = React.Children.toArray(this.props.children);

			let buttons = [];
			buttons = _.remove(childrenArray, (item) => {
				if (item.type === Button) {
					return true;
				}
			});

			let title = [];
			title = _.remove(childrenArray, (item) => {
				if (item.type === Title) {
					return true;
				}
			});

			let subtitle = [];
			subtitle = _.remove(childrenArray, (item) => {
				if (item.type === Subtitle) {
					return true;
				}
			});

			let input = [];
			input = _.remove(childrenArray, (item) => {
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

	renderRightButton() {
		const { rightButton } = this.props;

		return (
			<TouchableWithoutFeedback onPress={rightButton.onPress}>
				<View
					style={{
						...StyleSheet.absoluteFillObject,
						alignItems: 'flex-end',
						justifyContent: 'center',
						backgroundColor: 'transparent',
						paddingTop: this.getInitialStyle().navbar.paddingTop,
						paddingHorizontal: this.getInitialStyle().navbar.paddingHorizontal,
					}}
				>
					{renderButtonContent()}
				</View>
			</TouchableWithoutFeedback>
		);

		function renderButtonContent() {
			if (rightButton.image) {
				return <Image source={this.props.rightButton.image}/>;
			}
			if (rightButton.icon) {
				const { name, size, color } = rightButton.icon;

				return <Icon name={name} size={size} color={color}/>;
			}
			if (rightButton.title) {
				return <Text>this.props.rightButton.title</Text>;
			}
		}
	}

	render() {
		return (
			<View {...this.prepareRootProps()} >
				{this.renderChildren()}
				{this.props.rightButton && this.renderRightButton()}
			</View>
		);
	}
}
