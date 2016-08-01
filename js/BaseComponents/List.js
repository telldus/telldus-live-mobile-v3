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
import { View, ListView } from 'react-native';
import Base from './Base';
import computeProps from './computeProps';
import _ from 'lodash';

export default class ListComponent extends Base {

	getInitialStyle() {
		return {
			list: {

			},
			insetList: {
				borderWidth: 1,
				borderColor: this.getTheme().listBorderColor,
				margin: 15,
				borderBottomWidth: 0
			}
		}
	}


	prepareRootProps() {

		var defaultProps = {
			style: this.props.inset ? this.getInitialStyle().insetList : this.getInitialStyle().list
		};

		return computeProps(this.props, defaultProps);
	}

	renderChildren() {

		var childrenArray = React.Children.toArray(this.props.children);

		var keyIndex = 0;

		childrenArray = childrenArray.map((child) => {
			keyIndex++;
			return React.cloneElement(child, {...child.props, key: keyIndex});
		});

		var lastElement = _.last(childrenArray);

		// var modLastElement = React.cloneElement(lastElement, computeProps(lastElement.props, {last: true}));

		return _.concat(_.slice(childrenArray, 0, childrenArray.length - 1), lastElement);
	}

	render() {
		if(this.props.dataArray && this.props.renderRow) {
			const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
			var dataSource = ds.cloneWithRows(this.props.dataArray);
			return (
				<ListView {...this.prepareRootProps()}
					enableEmptySections={true}
					dataSource={dataSource}
					renderRow={this.props.renderRow} />
			);
		}
		else
			return(
				<View {...this.prepareRootProps()} >
					{this.renderChildren()}
				</View>
			);
	}
}
