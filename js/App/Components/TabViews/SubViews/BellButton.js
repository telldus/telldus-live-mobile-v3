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
import { View, RoundedCornerShadowView, Icon } from 'BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';

class BellButton extends View {
	render() {
		return (
            <RoundedCornerShadowView
				style={styles.container}
			>
				<TouchableOpacity
					onPress={this.props.onBell}
				>
					<Icon
						name="bell"
						size={22}
						color="orange"
					/>
				</TouchableOpacity>
            </RoundedCornerShadowView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 7,
		height: 32,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

module.exports = BellButton;
