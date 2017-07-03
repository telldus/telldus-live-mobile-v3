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
import Theme from 'Theme';
import TimeType from './SubViews/TimeType';

const types = [
	{
		name: 'Sunrise',
		icon: 'sunrise',
	},
	{
		name: 'Sunset',
		icon: 'sunset',
	},
	{
		name: 'Time',
		icon: 'time',
	},
];

type Props = {
	navigation: Object,
	actions: Object,
	onDidMount: (string, string, ?Object) => void,
	width: number,
	paddingRight: number,
};

type State = {
	selectedTypeIndex: number | null,
};

class Time extends View {

	props: Props;
	state: State;

	getStyles: () => Object;
	selectType: (string) => void;
	renderTypes: (Array) => Array;

	constructor(props) {
		super(props);

		this.h1 = '3. Time';
		this.h2 = 'Choose a time for the action';
		this.infoButton = {
			tmp: true, // TODO: fill with real fields
		};

		this.state = {
			selectedTypeIndex: null,
		};
	}

	componentDidMount() {
		const { h1, h2, infoButton } = this;
		this.props.onDidMount(h1, h2, infoButton);
	}

	getStyles = () => {
		return {
			type: {
				container: {
					flex: 1,
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'flex-start',
				},
			},
		};
	};

	selectType = typeIndex => {
		this.setState({ selectedTypeIndex: typeIndex });
	};

	renderTypes = types => {
		const { selectedTypeIndex } = this.state;

		return types.map((type, i) => {
			const isSelected = typeof selectedTypeIndex === 'number' && i === selectedTypeIndex;

			return (
				<TimeType
					type={type}
					index={i}
					isSelected={isSelected}
					select={this.selectType}
					key={type.name}
				/>
			);
		});
	};

	render() {
		const { type } = this.getStyles();

		return (
			<View>
				<View style={type.container}>
					{this.renderTypes(types)}
				</View>
			</View>
		);
	}
}

Time.propTypes = {
	navigation: PropTypes.object,
	actions: PropTypes.object,
	onDidMount: PropTypes.func,
	width: PropTypes.number,
	paddingRight: PropTypes.number,
};

module.exports = Time;
