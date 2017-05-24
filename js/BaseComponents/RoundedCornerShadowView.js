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

class RoundedCornerShadowView extends Base {
	render() {
		let propsStyle = this.props.style;
		if (Number.isInteger(propsStyle)) {
			propsStyle = StyleSheet.flatten(propsStyle);
		}

		return (
			<View
				onLayout={this.props.onLayout}
				style={[this.props.style, (this.props.hasShadow ? styles.shadow : styles.noShadow)]}>
				<View style={[styles.container, {
					flexDirection: propsStyle.flexDirection ? propsStyle.flexDirection : 'row',
					justifyContent: propsStyle.justifyContent ? propsStyle.justifyContent : 'center',
					alignItems: propsStyle.alignItems ? propsStyle.alignItems : 'stretch',
				}]}>
                    {this.props.children}
                </View>
            </View>
		);
	}
}

const styles = StyleSheet.create({
	shadow: {
		borderRadius: 7,
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: 0 },
		shadowRadius: 1,
		shadowOpacity: 1.0,
		elevation: 2,
	},
	noShadow: {
		borderRadius: 7,
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: 0 },
		shadowRadius: 0,
		shadowOpacity: 1.0,
		elevation: 0,
	},
	container: {
		flex: 1,
		borderRadius: 7,
		overflow: 'hidden',
	},
});

RoundedCornerShadowView.propTypes = {
	hasShadow: React.PropTypes.bool,
};

RoundedCornerShadowView.defaultProps = {
	hasShadow: true,
};

module.exports = RoundedCornerShadowView;

