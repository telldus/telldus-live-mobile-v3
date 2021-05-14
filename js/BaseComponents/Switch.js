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

import {
	withTheme,
	PropsThemedComponent,
} from '../App/Components/HOC/withTheme';

type Props = {
	value: boolean,
	onValueChange: (boolean) => void,
	thumbTintColor?: any,
	onTintColor?: any,
	tintColor?: any,
	style?: Array<any> | Object,
	thumbColor: string,
};

type PropsThemedSwitch = Props & PropsThemedComponent;

class SwitchComponent extends Base {
	props: PropsThemedSwitch;
	onValueChange: (boolean) => void;

	constructor(props: PropsThemedSwitch) {
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
		const {
			onTintColor,
			tintColor,
			value,
			style,
			thumbColor,
			colors,
		} = this.props;
		const _thumbColor = thumbColor || (value ? colors.thumbColorActiveSwitch : colors.thumbColorInActiveSwitch);

		return (
			<Switch
				value={value}
				onValueChange={this.onValueChange}
				style={style}
				thumbColor={_thumbColor}
				trackColor={{
					false: tintColor || colors.trackColorInActiveSwitch,
					true: onTintColor || colors.trackColorActiveSwitch,
				}}
				ios_backgroundColor={value ? undefined : tintColor || colors.trackColorInActiveSwitch}/>
		);
	}
}

export default (withTheme(SwitchComponent): Object);
