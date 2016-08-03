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

import { Container, Content, Button, Text, View } from 'BaseComponents';
import Gravatar from 'react-native-avatar-gravatar';
import { logoutFromTelldus } from 'Actions';

import type { Tab } from '../reducers/navigation';

class UserDetailView extends View {

	render() {
		return (
			<Container style={{ padding: 10 }}>
				<Content>
					<Text>
						Name: {this.props.user.firstname} {this.props.user.lastname}
					</Text>
					<View style = {{ paddingBottom: 10 }} />
					<Text>Email: { this.props.user.email}</Text>
					<View style = {{ paddingBottom: 10 }} />
					<Gravatar
						emailAddress = {this.props.user.email}
						size = { 100 }
						mask = "circle"
					/>
					<View style = {{ paddingBottom: 10 }} />
					<Button
						name = "sign-out"
						backgroundColor = { this.getTheme().btnPrimaryBg }
						style = {{ padding: 6, minWidth: 100 }}
						onPress = { () => this.props.dispatch(logoutFromTelldus()) }
					>Logout</Button>
				</Content>
			</Container>
		);
	}

}

module.exports = connect()(UserDetailView);
