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

import { View, TouchableButton } from '../../../../BaseComponents';
import { deviceSetState } from '../../../Actions/Devices';
import i18n from '../../../Translations/common';

class LearnButton extends View {
	render() {
		return (
			<TouchableButton
				style={this.props.style}
				onPress={this.props.onLearn(this.props.id, this.props.command)}
				text={i18n.learn}
			/>
		);
	}
}

LearnButton.defaultProps = {
	command: 32,
};

function mapDispatchToProps(dispatch) {
	return {
		onLearn: (id, command) => () => dispatch(deviceSetState(id, command)),
	};
}

module.exports = connect(null, mapDispatchToProps)(LearnButton);
