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
import ProgressBar from 'ProgressBarAndroid';
import Base from './Base';
import computeProps from './computeProps';

export default class SpinnerComponent extends Base {

	prepareRootProps() {

		let type = {
			height: 40
		};

		let defaultProps = {
			style: type
		};

		return computeProps(this.props, defaultProps);

	}


	render() {
		return (
           <ProgressBar {...this.prepareRootProps()} styleAttr = "Horizontal"
                indeterminate = {false} progress={this.props.progress ? this.props.progress / 100 : 0.5}
                color={this.props.color ? this.props.color : this.props.inverse ? this.getTheme().inverseProgressColor : this.getTheme().defaultProgressColor} />
		);
	}

}
