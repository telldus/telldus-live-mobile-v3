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
import { connect } from 'react-redux';

import { Container, Content, Text, View } from 'BaseComponents';

class GatewayDetailView extends View {

	render() {
		return (
			<Container style={{ padding: 10 }}>
				<Content>
					<Text>Type: { this.props.gateway.type}</Text>
					<Text>Version: { this.props.gateway.version}</Text>
					<Text>IP: { this.props.gateway.ip}</Text>
					<Text>Online: { this.props.gateway.online ? 'Yes' : 'No' }</Text>
				</Content>
			</Container>
		);
	}

}

module.exports = connect()(GatewayDetailView);
