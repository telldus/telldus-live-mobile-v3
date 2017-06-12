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
import { connect } from 'react-redux';

import { Container, Content, Text, View } from 'BaseComponents';

type Device = {
	clientName: string,
	state: string,
	statevalue: string,
	methods: Object,
	ignored: boolean,
	type: string,
};

type Props = {
	device: Device,
};

class DeviceDetailView extends View {
  props: Props;

  render() {
    return (
			<Container style={{ padding: 10 }}>
				<Content>
					<Text>Gateway: { this.props.device.clientName}</Text>
					<Text>State: { this.props.device.state}</Text>
					<Text>Statevalue: { this.props.device.statevalue}</Text>
					<Text>Methods: { this.props.device.methods}</Text>
					<Text>Ignored: { this.props.device.ignored}</Text>
					<Text>Type: { this.props.device.type}</Text>
				</Content>
			</Container>
    );
  }

}

module.exports = connect()(DeviceDetailView);
