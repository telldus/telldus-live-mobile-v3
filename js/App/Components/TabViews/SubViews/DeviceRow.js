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
import { Container, ListItem, Text, View, Icon } from 'BaseComponents';
import DeviceDetailView from './../../DetailViews/DeviceDetailView';
import SwitchButton from './SwitchButton';

import { deviceSetStatePseudo } from 'Actions';

import Theme from 'Theme';

module.exports = class DeviceRow extends View {
	render() {
        try {
			return (
				<ListItem style = { Theme.Styles.rowFront }>
					<Container style = {{ marginLeft: 2, flexDirection: 'row', alignItems:'stretch'}}>
						<SwitchButton
							item={this.props} style={{flex:7, height:32}} />
						<View style={{flex:20, justifyContent: 'center', }}>
							<Text style = {{
								marginLeft: 8,
								color: 'rgba(0,0,0,0.87)',
								fontSize: 16,
								opacity: this.props.name ? 1 : 0.5,
								textAlignVertical: 'center',
							}}>
								{this.props.name ? this.props.name : '(no name)'}
							</Text>
						</View>
						<View style={{flex:2, justifyContent: 'center', alignItems:'center', marginRight:8}}>
							<Icon
								name="gear"
								size={26}
								color="#bbbbbb"
								onPress={ () => this.props.navigator.push({
									component: DeviceDetailView,
									title: this.props.name,
									passProps: { device: this }
								})}
							/>
						</View>
					</Container>
				</ListItem>
			);
		} catch (e) {
			console.log(e);
			return ( <View /> );
		}
    }

    onToggleSelected(item) {
        this.props.dispatch(deviceSetStatePseudo(item.id, item.state === 1 ? 0 : 1));
    }
};
