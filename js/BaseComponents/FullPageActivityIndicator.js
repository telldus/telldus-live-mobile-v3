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
import PropTypes from 'prop-types';
import { ActivityIndicator } from 'react-native';

import View from './View';

type Props = {
	animating?: boolean,
	color?: string,
	size?: 'small' | 'large' | number,
};

type DefaultProps = {
	size: 'large',
};

export default class FullPageActivityIndicator extends React.Component<DefaultProps, Props, null> {

	static propTypes = {
		animating: PropTypes.bool,
		color: PropTypes.string,
		size: PropTypes.oneOf(['small', 'large', PropTypes.number]),
	};

	static defaultProps = {
		size: 'large',
	};

	render(): React$Element<any> {
		const { animating, color, size } = this.props;

		return (
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<ActivityIndicator animating={animating} color={color} size={size}/>
			</View>
		);
	}

}
