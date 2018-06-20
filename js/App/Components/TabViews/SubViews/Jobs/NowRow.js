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

import { ListRow, View, Text, StyleSheet } from '../../../../../BaseComponents';
import Theme from '../../../../Theme';

type Props = {
	text: string,
    roundIconContainerStyle?: number | Object | Array<any>,
    rowWithTriangleContainerStyle?: number | Object | Array<any>,
    textStyle?: number | Object | Array<any>,
    lineStyle?: number | Object | Array<any>,
};

export default class NowRow extends View<Props, null> {
	render(): Object {
		const {
			text,
			roundIconContainerStyle,
			rowWithTriangleContainerStyle,
			textStyle,
			lineStyle,
		} = this.props;

		return (
			<ListRow
				roundIcon={''}
				roundIconContainerStyle={[roundIconContainerStyle, {
					backgroundColor: Theme.Core.brandPrimary,
				}]}
				time={null}
				rowStyle={{
					backgroundColor: 'transparent',
				}}
				rowContainerStyle={styles.rowContainerStyle}
				rowWithTriangleContainerStyle={[rowWithTriangleContainerStyle, {
					backgroundColor: 'transparent',
				}]}
				triangleStyle={styles.triangleStyle}
				triangleContainerStyle={styles.triangleContainerStyle}
			>
				<View style={styles.cover}>
					<Text style={textStyle}>
						{text}
					</Text>
					<View style={lineStyle}/>
				</View>
			</ListRow>
		);
	}
}

const styles = StyleSheet.create({
	rowContainerStyle: {
		flex: 1,
		alignItems: 'flex-start',
		justifyContent: 'flex-start',
		backgroundColor: 'transparent',
		elevation: 0,
		shadowColor: '#fff',
		shadowOpacity: 0,
		shadowOffset: {
			height: 0,
			width: 0,
		},
	},
	triangleStyle: {
		height: 0,
		width: 0,
	},
	triangleContainerStyle: {
		height: 0,
		width: 0,
		zIndex: 0,
		elevation: 0,
	},
	cover: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
});
