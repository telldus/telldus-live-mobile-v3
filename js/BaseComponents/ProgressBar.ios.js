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
import { ProgressViewIOS } from 'react-native';
import Base from './Base';

type Props = {
	progress: number,
	color: string,
	inverse: boolean,
};

export default class ProgressBarComponent extends Base {
	props: Props;

	render(): React$Element<any> {
		return (
			<ProgressViewIOS progress={this.props.progress ? this.props.progress / 100 : 0.5}
			                 progressTintColor={this.props.color ? this.props.color : this.props.inverse
				                 ? this.getTheme().inverseProgressColor : this.getTheme().defaultProgressColor}/>
		);
	}

}
