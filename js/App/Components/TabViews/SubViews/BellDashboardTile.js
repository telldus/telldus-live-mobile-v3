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
import { View, Icon } from 'BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';
import DashboardShadowTile from './DashboardShadowTile';

class BellDashboardTile extends View {
  constructor(props) {
    super(props);
  }

  render() {
    const { item, tileWidth } = this.props;

    return (
			<DashboardShadowTile
				item={item}
				isEnabled={true}
				name={item.name}
				tileWidth={tileWidth}
				style={[this.props.style, {
  width: tileWidth,
  height: tileWidth,
}]}>
                <TouchableOpacity
                    onPress={this.props.onBell}
                    style={styles.container}>
                    <View style={styles.body}>
                        <Icon name="bell" size={44} color="orange" />
                    </View>
                </TouchableOpacity>
			</DashboardShadowTile>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 30,
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
});

module.exports = BellDashboardTile;
