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
import Modal from 'react-native-modal';

import { View, Text, StyleSheet } from '../../../../../BaseComponents';

type Props = {
    showModal: boolean,
    buttons: Array<Object>,
};

export default class MultiActionModal extends View<Props, null> {
props: Props;

constructor(props: Props) {
	super();
}

render(): Object {
	let { showModal, buttons } = this.props;
	console.log('TEST buttons', buttons);
	return (
		<Modal
			isVisible={showModal}
			backdropOpacity={0.60}>
			<View style={styles.modalCover}>
				<Text style={styles.headerText}>
                    dummy
				</Text>
				<View style={styles.body}>
					{React.Children.map(buttons, (child: Object): Object | null => {
						if (React.isValidElement(child)) {
							return React.cloneElement(child);
						}
						return null;
					})
					}
				</View>
			</View>
		</Modal>
	);
}
}


const styles = StyleSheet.create({
	modalCover: {
		flex: 0,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#fff',
	},
	body: {
	},
	headerText: {
		color: '#000',
	},
});
