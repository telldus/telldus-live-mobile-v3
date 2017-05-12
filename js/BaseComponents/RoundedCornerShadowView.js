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
import { View, StyleSheet } from 'react-native';
import Base from './Base';

export default class RoundedCornerShadowView extends Base {
	render() {
		let style = {
			flex: 1,
			flexDirection: 'row',
			borderRadius: 7,
			overflow: 'hidden',
			justifyContent: 'center',
			alignItems: 'stretch',
		};

		let propsStyle = this.props.style;
		if (Number.isInteger(propsStyle)) {
			propsStyle = StyleSheet.flatten(propsStyle);
		}

		if (propsStyle) {
			style.flexDirection = propsStyle.flexDirection ? propsStyle.flexDirection : 'row';
			style.justifyContent = propsStyle.justifyContent ? propsStyle.justifyContent : 'center';
			style.alignItems = propsStyle.alignItems ? propsStyle.alignItems : 'stretch';
		}

		let shadowRadius = 1;
		if (propsStyle && propsStyle.shadowRadius) {
			shadowRadius = propsStyle.shadowRadius;
		}

		return (
			<View
				onLayout={this.props.onLayout}
				style={[this.props.style, {
					borderRadius: 7,
					shadowColor: '#000000',
					shadowOffset: { width: 0, height: 0 },
					shadowRadius: shadowRadius,
					shadowOpacity: 1.0,
					elevation: 2,
				}]}>
                <View style={style}>
                    {this.props.children}
                </View>
            </View>
		);
	}
}
