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

import React, { PropTypes } from 'react';
import { View } from 'BaseComponents';
import { Button } from 'react-native';

type Props = {
	navigation: Object,
	actions: Object,
	onDidMount: (string, string, ?Object) => void,
	width: number,
	paddingRight: number,
};

class Days extends View {

	props: Props;

	constructor(props) {
		super(props);

		this.h1 = '4. Days';
		this.h2 = 'Choose days for event repeating';
		this.infoButton = {
			tmp: true, // TODO: fill with real fields
		};
	}

	componentDidMount() {
		const { h1, h2, infoButton } = this;
		this.props.onDidMount(h1, h2, infoButton);
	}

	goNext = () => {
		this.props.navigation.navigate('Summary');
	};

	render() {
		return (
			<Button title="Summary" onPress={this.goNext}/>
		);
	}
}

Days.propTypes = {
	navigation: PropTypes.object,
	actions: PropTypes.object,
	onDidMount: PropTypes.func,
	width: PropTypes.number,
	paddingRight: PropTypes.number,
};

module.exports = Days;
