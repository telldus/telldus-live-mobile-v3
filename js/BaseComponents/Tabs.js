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
import Base from './Base';
import computeProps from './computeProps';
import ScrollableTabView from 'react-native-scrollable-tab-view';

export default class TabComponent extends Base {

	getInitialStyle() {
		return {
			tab: {
				flex: 1,
			},
		};
	}

	prepareRootProps() {

		let defaultProps = {
			style: this.getInitialStyle().tab,
		};

		return computeProps(this.props, defaultProps);

	}

	render() {
		return (
          <ScrollableTabView {...this.prepareRootProps()} >
              {this.props.children}
          </ScrollableTabView>
		);
	}

}
