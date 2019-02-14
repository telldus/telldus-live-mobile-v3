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
 *
 */

// @flow

'use strict';

import React, { PureComponent } from 'react';

import { View, IconTelldus } from '../../../../BaseComponents';

type Props = {
	icon: string | Object,
	iconSize: number,
	iconColor: string,
	iconStyle: Array<any> | Object | number,
};

export default class WizardOne extends PureComponent<Props, null> {
	props: Props;

	constructor(props: Props) {
		super(props);
	}

	render(): Object {
		const {
			icon,
			iconSize,
			iconColor,
			iconStyle,
		} = this.props;

		return (
			<View>
				{(!!icon && typeof icon === 'string') && <IconTelldus icon={icon} style={iconStyle} size={iconSize} color={iconColor}/>}
				{React.isValidElement(icon) && icon}
			</View>
		);
	}
}

