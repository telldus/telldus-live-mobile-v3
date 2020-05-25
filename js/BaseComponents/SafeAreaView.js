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
import { SafeAreaView } from 'react-native-safe-area-context';
import Theme from '../App/Theme';
import View from './View';

type Props = {
	children: Object | Array<Object>,
	onLayout: (Object) => void,
	backgroundColor?: string,
};

export default class SafeAreaViewComponent extends React.Component<Props, null> {
	props: Props;

	render(): Object {
		let { children, onLayout, backgroundColor = Theme.Core.appBackground, ...otherProperties } = this.props;

		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: Theme.Core.brandPrimary }}>
				<View style={{ flex: 1, backgroundColor }} onLayout={onLayout}>
					{
						React.Children.map(children, (child: Object): Object | null => {
							if (React.isValidElement(child)) {
								return React.cloneElement(child, {...otherProperties});
							}
							return null;
						})
					}
				</View>
			</SafeAreaView>
		);
	}
}
