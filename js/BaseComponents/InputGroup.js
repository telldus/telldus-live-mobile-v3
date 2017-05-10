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

'use strict';

import React from 'react';
import { View } from 'react-native';
import Base from './Base';
import Icon from './Icon';
import Button from './Button';
import computeProps from './computeProps';
import Input from './Input';
import _ from 'lodash';

export default class InputGroup extends Base {

	getInitialStyle() {
		return {
			textInput: {
				backgroundColor: 'transparent',
				flexDirection: 'row',
				borderColor: this.getTheme().inputBorderColor,
				paddingRight: 5,
				alignItems: 'center'
			},
			outerBorder: {
				position:'relative',
				borderColor: 'white',
				borderWidth: this.getTheme().borderWidth,
				borderTopWidth: 0,
				borderRightWidth: 0,
				borderLeftWidth: 0
			},
			darkborder: {
				borderColor: '#000'
			},
			lightborder: {
				borderColor: '#fff'
			},
			underline: {
				position:'relative',
				borderWidth: this.getTheme().borderWidth,
				borderTopWidth: 0,
				borderRightWidth: 0,
				borderLeftWidth: 0
			},

			bordered: {
				position:'relative',
				borderWidth: this.getTheme().borderWidth
			},

			rounded: {
				position:'relative',
				borderWidth: this.getTheme().borderWidth,
				borderRadius: 30
			}
		};
	}

	prepareRootProps() {

		let type = {
			paddingLeft:  (this.props.borderType === 'rounded' && !this.props.children.type === Icon) ? 15 :
			(this.props.children.type === Icon ) ? this.getTheme().inputPaddingLeftIcon : 5
		};

		let defaultStyle = (this.props.borderType === 'regular') ? this.getInitialStyle().bordered : (this.props.borderType === 'rounded') ? this.getInitialStyle().rounded : this.getInitialStyle().underline;

		type = _.merge(type, defaultStyle);

		let addedProps = _.merge(this.getInitialStyle().textInput, type);

		let defaultProps = {
			style: addedProps,
			key: 'inpGroup'
		};

		return computeProps(this.props, defaultProps);
	}

	getIconProps(icon) {

		let defaultStyle = {
			fontSize: (this.props.toolbar || this.props.atoolbar) ? this.getTheme().toolbarIconSize : 27,
			alignSelf: 'center',
			lineHeight: (this.props.toolbar || this.props.atoolbar) ? 24 : undefined,
			paddingRight: 5,
			marginLeft: (this.props.toolbar || this.props.atoolbar) ? 5 : undefined
		};

		let defaultProps = {
			style: defaultStyle,
			key: 'icon'
		};

		return computeProps(icon.props, defaultProps);
	}
	getButtonProps(button) {

		let defaultStyle = {
			alignSelf: 'center',
			paddingRight: 5,
			marginLeft: (this.props.toolbar || this.props.atoolbar) ? 5 : undefined,
			height: 30
		};

		let defaultProps = {
			style: defaultStyle,
			key: 'button',
			inputButton: true
		};

		return computeProps(button.props, defaultProps);
	}


	renderChildren() {

		let inputProps = {};
		let newChildren = [];
		let childrenArray = React.Children.toArray(this.props.children);

		let iconElement = [];
		iconElement = _.remove(childrenArray, function(item) {
				if (item.type === Icon) {
						return true;
				}
		});

		let buttonElement = [];

		buttonElement = _.remove(childrenArray, function(item) {
			if (item.type === Button) {
				return true;
			}
		});

		let inp = _.find(childrenArray, function(item) {
			if (item && item.type === Input) {
				return true;
			}
		});

		if (inp)		{
inputProps = computeProps(this.props, inp.props);
}		else		{
inputProps = this.props;
}

		if (Array.isArray(this.props.children)) {

			if (this.props.iconRight) {
				newChildren.push(<Input key="inp" {...inputProps} style={{height: this.props.toolbar ? 30 : undefined, fontSize: this.props.toolbar ? 15 : undefined}}/>);
				newChildren.push(React.cloneElement(iconElement[0],this.getIconProps(iconElement[0])));
			}			else if (buttonElement.length > 0) {
				newChildren.push(React.cloneElement(
					iconElement[0],
					{
						...this.getIconProps(iconElement[0]),
						key: 'icon0'
					}
				));
				newChildren.push(<Input key="inp" {...inputProps} style={{height: this.props.toolbar ? 30 : undefined, fontSize: this.props.toolbar ? 15 : undefined}}/>);
				newChildren.push(React.cloneElement(
					buttonElement[0],
					{
						...this.getButtonProps(buttonElement[0]),
						key: 'button1'
					}
				));
			}			else {
				if (iconElement.length > 1) {
					newChildren.push(React.cloneElement(
						iconElement[0],
						{
							...this.getIconProps(iconElement[0]),
							key: 'icon0'
						}
					));
					newChildren.push(<Input key="inp" {...inputProps} style={{height: this.props.toolbar ? 30 : undefined, fontSize: this.props.toolbar ? 15 : undefined}}/>);
					newChildren.push(React.cloneElement(
						iconElement[1],
						{
							...this.getIconProps(iconElement[1]),
							key: 'icon1'
						}
					));
				} else {
					newChildren.push(React.cloneElement(iconElement[0], this.getIconProps(iconElement[0])));
					newChildren.push(<Input key="inp" {...inputProps} style={{height: this.props.toolbar ? 30 : undefined, fontSize: this.props.toolbar ? 15 : undefined}}/>);
				}
			}
		}		else {
			newChildren.push(<Input key="inp" {...inputProps} style={{height: this.props.toolbar ? 30 : undefined, fontSize: this.props.toolbar ? 15 : undefined}}/>);
		}

		return newChildren;
	}

	render() {
		return (
			<View {...this.prepareRootProps()} >
				{this.renderChildren()}
			</View>
		);
	}
}
