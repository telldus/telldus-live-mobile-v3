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
import { shouldUpdate } from '../../../../Lib';
import Theme from '../../../../Theme';

type Props = {
	showModal: boolean,
	item: Object,
	name: string,
	closeModal: () => void,
	buttons: Array<Object>,
};

type State = {
	width: number,
};

export default class MultiActionModal extends View<Props, State> {
props: Props;

closeModal: () => void;
onLayoutBody: (Object) => void;

state: State = {
	width: 0,
};

constructor(props: Props) {
	super();

	this.closeModal = this.closeModal.bind(this);
	this.onLayoutBody = this.onLayoutBody.bind(this);
}

closeModal() {
	let { closeModal } = this.props;
	if (closeModal) {
		closeModal();
	}
}

onLayoutBody(ev: Object) {
	let { width } = ev.nativeEvent.layout;
	if (width !== this.state.width) {
		this.setState({
			width,
		});
	}
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	const { showModal } = this.props;
	const { width } = this.state;
	if (showModal !== nextProps.showModal) {
		return true;
	}
	if (nextProps.showModal) {
		if (!showModal) {
			return true;
		}

		if (width !== nextState.width) {
			return true;
		}

		const propsChange = shouldUpdate(this.props, nextProps, ['item']);
		if (propsChange) {
			return true;
		}
		return false;
	}
	return false;
}

render(): Object {
	let { showModal, buttons, name } = this.props;
	let { width } = this.state;

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
					headerStyle={{
						paddingHorizontal: 10,
					}}
					headerWidth={width}
					headerHeight={20 + (width * 0.08)}
					onPressIcon={this.closeModal}
					onPressHeader={this.closeModal}/>
				<View style={styles.body} onLayout={this.onLayoutBody}>
					{React.Children.map(buttons, (child: Object): Object | null => {
						if (React.isValidElement(child)) {
							let newStyle = {}, newProps = {}, { newButtonStyle, containerStyle } = styles;
							if (child.key === '7') {
								newStyle = {
									onButtonStyle: newButtonStyle,
									offButtonStyle: newButtonStyle,
									sliderStyle: newButtonStyle,
									containerStyle,
								};
								newProps = {
									showSlider: true,
								};
							}
							if (child.key === '4') {
								newStyle = {
									bellButtonStyle: [newButtonStyle, {width: Theme.Core.buttonWidth * 2}],
									containerStyle,
								};
							}
							if (child.key === '3' || child.key === '5') {
								newStyle = {
									onButtonStyle: newButtonStyle,
									offButtonStyle: newButtonStyle,
									containerStyle,
								};
							}
							if (child.key === '2') {
								newStyle = {
									onButtonStyle: newButtonStyle,
									offButtonStyle: newButtonStyle,
									sliderStyle: newButtonStyle,
									containerStyle,
								};
								newProps = {
									showSlider: true,
								};
							}
							if (child.key === '1') {
								newStyle = {
									upButtonStyle: newButtonStyle,
									downButtonStyle: newButtonStyle,
									stopButtonStyle: newButtonStyle,
									containerStyle,
								};
								newProps = {
									showStopButton: true,
								};
							}
							return (
								<View style={{ marginTop: 10 }}>
									{React.cloneElement(child, {...newStyle, ...newProps})}
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

const buttonPadding = 10;
const bodyPadding = buttonPadding * 1.5;
const styles = StyleSheet.create({
	modal: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalCover: {
		flex: 0,
		alignItems: 'flex-start',
		justifyContent: 'center',
		backgroundColor: '#fff',
		borderRadius: 5,
		overflow: 'hidden',
	},
	body: {
		flexDirection: 'column-reverse',
		alignItems: 'flex-start',
		justifyContent: 'center',
		paddingTop: bodyPadding - 10,
		paddingBottom: bodyPadding,
		paddingLeft: bodyPadding - 10,
		paddingRight: bodyPadding,
	},
	headerText: {
		color: '#000',
	},
	newButtonStyle: {
		flex: 0,
		marginLeft: buttonPadding,
		borderRadius: 2,
		...Theme.Core.shadow,
		width: Theme.Core.buttonWidth,
		height: Theme.Core.rowHeight,
	},
	containerStyle: {
		flex: 0,
		flexDirection: 'row',
		justifyContent: 'center',
	},
});
