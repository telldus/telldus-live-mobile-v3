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

import { Text, View } from 'BaseComponents';
import { StyleSheet } from 'react-native';

type Props = {
};

type State = {
};

class HistoryTab extends View {
	props: Props;
	state: State;

	constructor(props: Props) {
		super(props);
	}

	render() {
		return (
			<View style={styles.container}>
				<Text>
					Coming Soon..
				</Text>
			</View>
		);
	}

}

HistoryTab.propTypes = {
};

const styles = StyleSheet.create({
	container: {
		flex: 0,
	},
});

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

function mapStateToProps(state, ownProps) {
	return {
		state,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(HistoryTab);
