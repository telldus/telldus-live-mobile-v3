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
import { View, Image } from 'react-native';
import ViewNB from './View';
import Header from './Header';
import Content from './Content';
import Footer from './Footer';
import Base from './Base';
import _ from 'lodash';
import computeProps from './computeProps';

export default class Container extends Base {

	renderHeader() {
		if(Array.isArray(this.props.children)) {
			return _.find(this.props.children, function(item) {
				if(item && item.type == Header) {
					return true;
				}
			});
		}

		else {
			if(this.props.children && this.props.children.type == Header) {
				return this.props.children;
			}
		}
	}
	renderContent() {
		if(Array.isArray(this.props.children)) {

			return _.find(this.props.children, function(item) {
				if(item && (item.type == ViewNB || item.type == Content || item.type == Image || item.type == View)) {

					return true;
				}
			});
		}

		else {
			if(this.props.children && (this.props.children.type == Content || this.props.children.type == ViewNB || this.props.children.type == View || this.props.children.type == Image)) {
				return this.props.children;
			}
		}
	}
	renderFooter() {
		if(Array.isArray(this.props.children)) {
			return _.find(this.props.children, function(item) {
				if(item && item.type == Footer) {
					return true;
				}
			});
		}

		else {
			if(this.props.children && this.props.children.type == Footer) {
				return this.props.children;
			}
		}
	}
	prepareRootProps() {

		var type = {
			flex: 1
		}

		var defaultProps = {
			style: type
		}

		return computeProps(this.props, defaultProps);
	}
	render() {
		return(
			<View {...this.prepareRootProps()}>

				<View>
					{this.renderHeader()}
				</View>


				<View style={{flex:1}}>
					{this.renderContent()}
				</View>

				<View>
					{this.renderFooter()}
				</View>
			</View>
		);

	}

}
