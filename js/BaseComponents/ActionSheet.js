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
import {
	Dimensions,
	Modal,
	TouchableHighlight,
	Animated,
	ScrollView,
	Easing,
} from 'react-native';

import View from './View';
import Text from './Text';

const WARN_COLOR = '#FF3B30';
const MAX_HEIGHT = Dimensions.get('window').height * 0.7;

const utils = {
	isset(prop: any): boolean {
		return typeof prop !== 'undefined';
	},
};

const prepareStyles = (stylesFromProps: Object): Object => {
	const styles2 = getStyles();
	const obj = {};
	Object.keys(styles2).forEach((key: string) => {
		const arr = [styles2[key]];
		if (stylesFromProps[key]) {
			arr.push(stylesFromProps[key]);
		}
		obj[key] = arr;
	});
	return obj;
};

const calculateHeight = (props: Object): Object => {
	const styles = prepareStyles(props.styles);

	const getHeight = (name: string): number => {
		const style = styles[name][styles[name].length - 1];
		let h = 0;
		['height', 'marginTop', 'marginBottom'].forEach((attrName: string) => {
			if (typeof style[attrName] !== 'undefined') {
				h += style[attrName];
			}
		});
		return h;
	};

	let height = 0;
	if (props.title) {
		height += getHeight('titleBox');
	}
	if (props.message) {
		height += getHeight('messageBox');
	}
	if (utils.isset(props.cancelButtonIndex)) {
		height += getHeight('cancelButtonBox');
		height += (props.options.length - 1) * getHeight('buttonBox');
	} else {
		height += props.options.length * getHeight('buttonBox');
	}

	let scrollEnabled = false;
	if (height > MAX_HEIGHT) {
		scrollEnabled = true;
		height = MAX_HEIGHT;
	} else {
		scrollEnabled = false;
	}

	return {
		height,
		scrollEnabled,
	};
};


type Props = {
    tintColor?: string,
	buttonUnderlayColor?: string,
	onPress: Function,
    styles: Object,
    title: Object | string,
	options: Array<Object | string>,
	cancelButtonIndex: number,
	destructiveButtonIndex: number,
	message: any,
};

type State = {
    visible: boolean,
	sheetAnim: Object,
	translateY: number,
	scrollEnabled: boolean,
};

class ActionSheet extends React.Component<Props, State> {
static defaultProps = {
	tintColor: '#007AFF',
	buttonUnderlayColor: '#F4F4F4',
	onPress: () => {},
	styles: {},
}

state: State;
props: Props;

static getDerivedStateFromProps(nextProps: Object, prevState: Object): ?Object {
	if (nextProps.changeMoiToUpdateHeight !== prevState.changeMoiToUpdateHeight) {
		const { height, scrollEnabled } = calculateHeight(nextProps);
		return {
			changeMoiToUpdateHeight: nextProps.changeMoiToUpdateHeight,
			translateY: height,
			scrollEnabled,
		};
	}
	return null; // Triggers no change in the state
}

constructor(props: Props) {
	super(props);
	const { height } = calculateHeight(props);
	this.state = {
		visible: false,
		sheetAnim: new Animated.Value(height),
		translateY: height,
		scrollEnabled: false,
	};
}

show = () => {
	this.setState({visible: true}, () => {
		this._showSheet();
	});
}

hide = (index: number) => {
	this._hideSheet(() => {
		this.setState({visible: false}, () => {
			this.props.onPress(index);
		});
	});
}

_cancel = () => {
	this._hideSheet(() => {
		this.setState({visible: false}, () => {
			this.props.onPress(-1);
		});
	});
}

_showSheet = () => {
	Animated.timing(this.state.sheetAnim, {
		toValue: 0,
		duration: 250,
		easing: Easing.out(Easing.ease),
	}).start();
}

_hideSheet(callback?: Function) {
	Animated.timing(this.state.sheetAnim, {
		toValue: this.state.translateY,
		duration: 200,
	}).start(callback);
}

_renderTitle(): Object | null {
	const { title } = this.props;
	const styles = prepareStyles(this.props.styles);
	if (!title) {
		return null;
	}
	return (
		<View style={styles.titleBox}>
			{React.isValidElement(title) ? title : (
				<Text style={styles.titleText}>{title}</Text>
			)}
		</View>
	);
}

_renderMessage(): Object | null {
	const { message } = this.props;
	const styles = prepareStyles(this.props.styles);
	if (!message) {
		return null;
	}
	return (
		<View style={styles.messageBox}>
			{React.isValidElement(message) ? message : (
				<Text style={styles.messageText}>{message}</Text>
			)}
		</View>
	);
}

_renderCancelButton(): Object | null {
	const { options, cancelButtonIndex } = this.props;
	if (!utils.isset(cancelButtonIndex)) {
		return null;
	}
	return this._createButton(options[cancelButtonIndex], cancelButtonIndex);
}

_createButton(title: any, index: number): Object {
	const styles = prepareStyles(this.props.styles);
	const { buttonUnderlayColor, cancelButtonIndex, destructiveButtonIndex, tintColor } = this.props;
	const fontColor = destructiveButtonIndex === index ? WARN_COLOR : tintColor;
	const buttonBoxStyle = cancelButtonIndex === index ? styles.cancelButtonBox : styles.buttonBox;

	return (
		<TouchableHighlight
			key={index}
			activeOpacity={1}
			underlayColor={buttonUnderlayColor}
			style={buttonBoxStyle}
			// eslint-disable-next-line react/jsx-no-bind
			onPress={(): Function => this.hide(index)}
		>
			{React.isValidElement(title) ? title : (
				<Text style={[styles.buttonText, {color: fontColor}]}>{title}</Text>
			)}
		</TouchableHighlight>
	);
}

_renderOptions(): Array<Object> {
	const { cancelButtonIndex } = this.props;
	return this.props.options.map((title: any, index: number): Object => {
		return cancelButtonIndex === index ? null : this._createButton(title, index);
	});
}

render(): Object {
	const styles = prepareStyles(this.props.styles);
	const {
		visible,
		sheetAnim,
		scrollEnabled,
		translateY,
	} = this.state;

	return (
		<Modal visible={visible}
			animationType="none"
			transparent
			onRequestClose={this._cancel}
		>
			<View style={[styles.wrapper]}>
				<Text
					style={[styles.overlay]}
					onPress={this._cancel}
				/>
				<Animated.View
					style={[
						styles.body,
						{ height: translateY, transform: [{ translateY: sheetAnim }] },
					]}
				>
					{this._renderTitle()}
					{this._renderMessage()}
					<ScrollView scrollEnabled={scrollEnabled}>{this._renderOptions()}</ScrollView>
					{this._renderCancelButton()}
				</Animated.View>
			</View>
		</Modal>
	);
}
}

const getStyles = (): Object => {
	return {
		overlay: {
			position: 'absolute',
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			opacity: 0.4,
			backgroundColor: '#000',
		},
		wrapper: {
			flex: 1,
			flexDirection: 'row',
		},
		body: {
			flex: 1,
			alignSelf: 'flex-end',
			backgroundColor: '#e5e5e5',
		},
		titleBox: {
			height: 40,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: '#fff',
		},
		titleText: {
			color: '#757575',
			fontSize: 14,
		},
		messageBox: {
			height: 30,
			paddingLeft: 10,
			paddingRight: 10,
			paddingBottom: 10,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: '#fff',
		},
		messageText: {
			color: '#9a9a9a',
			fontSize: 12,
		},
		buttonBox: {
			height: 50,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: '#fff',
		},
		buttonText: {
			fontSize: 18,
		},
		cancelButtonBox: {
			height: 50,
			marginTop: 6,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: '#fff',
		},
	};
};

export default ActionSheet;
