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

import { View, StyleSheet, DialogueHeader } from '../../../../../BaseComponents';
import Theme from '../../../../Theme';

type Props = {
    showModal: boolean,
	buttons: Array<Object>,
	name: string,
	closeModal: () => void;
};

export default class MultiActionModal extends View<Props, null> {
props: Props;

closeModal: () => void;

constructor(props: Props) {
	super();

	this.closeModal = this.closeModal.bind(this);
}

closeModal() {
	let { closeModal } = this.props;
	if (closeModal) {
		closeModal();
	}
}

render(): Object {
	let { showModal, buttons, name } = this.props;

	return (
		<Modal
			isVisible={showModal}
			style={styles.modal}
			backdropOpacity={0.60}
			hideModalContentWhileAnimating={true}
			onBackdropPress={this.closeModal}
			onBackButtonPress={this.closeModal}
			supportedOrientations={['portrait', 'landscape']}>
			<View style={styles.modalCover}>
				<DialogueHeader
					headerText={name}
					showIcon={true}
					headerStyle={styles.headerStyle}
					onPressIcon={this.closeModal}
					onPressHeader={this.closeModal}/>
				<View style={styles.body}>
					{React.Children.map(buttons, (child: Object): Object | null => {
						if (React.isValidElement(child)) {
							let newStyle = {}, { newButtonStyle, newButtonStyleDim, newButtonStyleDimOn } = styles;
							if (child.key === '4') {
								newStyle = {
									bellButtonStyle: newButtonStyle,
								};
							}
							if (child.key === '3') {
								newStyle = {
									onButtonStyle: newButtonStyle,
									offButtonStyle: newButtonStyle,
								};
							}
							if (child.key === '2') {
								newStyle = {
									onButtonStyle: newButtonStyleDimOn,
									offButtonStyle: newButtonStyle,
									sliderStyle: newButtonStyleDim,
								};
							}
							if (child.key === '1') {
								newStyle = {
									upButtonStyle: newButtonStyle,
									downButtonStyle: newButtonStyle,
									stopButtonStyle: newButtonStyle,
								};
							}
							return (
								<View style={{ paddingTop: 10 }}>
									{React.cloneElement(child, {...newStyle})}
								</View>
							);
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


const padding = 10;
const buttonPadding = 5;
const styles = StyleSheet.create({
	modal: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalCover: {
		flex: 0,
		alignItems: 'flex-start',
		justifyContent: 'center',
		backgroundColor: '#fff',
		width: (Theme.Core.buttonWidth * 3) + (padding * 2) + (buttonPadding * 6),
		borderRadius: 2,
		overflow: 'hidden',
	},
	body: {
		flexDirection: 'column-reverse',
		alignItems: 'flex-start',
		justifyContent: 'center',
		paddingVertical: padding,
		paddingHorizontal: padding,
	},
	headerStyle: {
		paddingVertical: padding,
		paddingHorizontal: padding,
		width: '100%',
	},
	headerText: {
		color: '#000',
	},
	newButtonStyle: {
		marginHorizontal: buttonPadding,
		borderRadius: 2,
		...Theme.Core.shadow,
	},
	newButtonStyleDim: {
		marginLeft: buttonPadding * 3,
		borderRadius: 2,
		...Theme.Core.shadow,
	},
	newButtonStyleDimOn: {
		marginLeft: Theme.Core.buttonWidth + (buttonPadding * 3),
		borderRadius: 2,
		...Theme.Core.shadow,
	},
});
