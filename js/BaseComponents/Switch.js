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
import { Switch } from 'react-native';
import Base from './Base';
import Theme from '../App/Theme';

type Props = {
	value: number,
	onValueChange: (boolean) => void;
	thumbTintColor?: any,
	onTintColor?: any,
};

type DefaultProps = {
	thumbTintColor: any,
	onTintColor: any,
};

export default class SwitchComponent extends Base {
	props: Props;
	onValueChange: (boolean) => void;

	static defaultProps: DefaultProps = {
		thumbTintColor: Theme.Core.brandSecondary,
		onTintColor: '#e2690150',
	}

	constructor(props: Props) {
		super();
		this.onValueChange = this.onValueChange.bind(this);
	}

	onValueChange(value: boolean) {
		let { onValueChange } = this.props;
		if (onValueChange) {
			onValueChange(value);
		}
	}

	render(): React$Element<any> {
		const { thumbTintColor, onTintColor, value } = this.props;
		return (
			<Switch value={value} onValueChange={this.onValueChange}
				thumbTintColor={thumbTintColor} onTintColor={onTintColor}/>
		);
	}
}
