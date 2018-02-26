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

import React from 'react';

import { View, StyleSheet } from '../../../BaseComponents';
import Theme from '../../Theme';

type Props = {
	children: Object,
	screenProps: Object,
	navigation: Object,
};


class ChangeLogContainer extends View {
	props: Props;

	constructor(props: Props) {
		super(props);
	}

	componentWillReceiveProps(nextProps: Object) {
		let { navigation, screenProps } = this.props;
		if (screenProps.nextScreen !== nextProps.screenProps.nextScreen) {
			navigation.navigate(nextProps.screenProps.nextScreen);
		}
	}

	render(): Object {
		const { children, screenProps } = this.props;

		return (
			<View style={{flex: 1, paddingHorizontal: 10, paddingTop: 10, backgroundColor: '#EFEFF4'}}>
				{React.cloneElement(
					children,
					{
						...screenProps,
						styles: styles,
					},
				)}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		...Theme.Core.shadow,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 15,
		paddingVertical: 15,
	},
	icon: {
		fontSize: 100,
		color: Theme.Core.brandSecondary,
	},
	title: {
		fontSize: 20,
		color: '#00000090',
		textAlign: 'center',
		paddingHorizontal: 10,
		marginVertical: 10,
	},
	description: {
		fontSize: 14,
		color: '#00000080',
		textAlign: 'left',
	},
	buttonIconStyle: {
		transform: [{rotateZ: '180deg'}],
	},
});

export default ChangeLogContainer;
