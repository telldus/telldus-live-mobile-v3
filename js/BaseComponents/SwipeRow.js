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

import React, {
	Component,
} from 'react';
import {
	Animated,
	StyleSheet,
} from 'react-native';

import View from './View';

type Props = {
	/**
	* Used by the SwipeListView to close rows on scroll events.
	* You shouldn't need to use this prop explicitly.
	*/
	setScrollEnabled: (boolean) => void,
	/**
	* Called when a swipe row is animating open. Used by the SwipeListView
	* to keep references to open rows.
	*/
	onRowOpen: () => void,
	/**
	 * * TranslateX value for opening the row to the left (positive number)
	*/
	leftOpenValue: number,
	/**
	* TranslateX value for opening the row to the right (negative number)
	*/
	rightOpenValue: number,
	/**
	* Friction for the open / close animation
	*/
	friction?: number,
	/**
	* Tension for the open / close animation
	*/
	tension?: number,
	/**
	* Should the row be closed when it is tapped
	*/
	closeOnRowPress: boolean,
	/**
	* Disable ability to swipe the row left
	*/
	disableLeftSwipe: boolean,
	/**
	* Disable ability to swipe the row right
	*/
	disableRightSwipe: boolean,
	/**
	* Enable hidden row onLayout calculations to run always
	*/
	recalculateHiddenLayout: boolean,
	/**
	* Called when a swipe row is animating closed
	*/
	onRowClose: () => void,
	/**
	* Styles for the parent wrapper View of the SwipeRow
	*/
	style: Object,
	/**
	* Should the row do a slide out preview to show that it is swipeable
	*/
	preview: boolean,
	/**
	* Duration of the slide out preview animation
	*/
	previewDuration: number,
	/**
	* TranslateX value for the slide out preview animation
	* Default: 0.5 * props.rightOpenValue
	*/
	previewOpenValue: number,

	editMode: boolean,
	slideDuration: number,
	children?: Object,
	onRowPress: () => void,
};

type DefaultProps = {
		/**
		 * * TranslateX value for opening the row to the left (positive number)
		*/
		leftOpenValue: number,
		/**
		* TranslateX value for opening the row to the right (negative number)
		*/
		rightOpenValue: number,
		/**
		* Should the row be closed when it is tapped
		*/
		closeOnRowPress: boolean,
		/**
		* Disable ability to swipe the row left
		*/
		disableLeftSwipe: boolean,
		/**
		* Disable ability to swipe the row right
		*/
		disableRightSwipe: boolean,
		/**
		* Enable hidden row onLayout calculations to run always
		*/
		recalculateHiddenLayout: boolean,
		/**
		* Should the row do a slide out preview to show that it is swipeable
		*/
		preview: boolean,
		/**
		* Duration of the slide out preview animation
		*/
		previewDuration: number,
		editMode: boolean,
		slideDuration: number,
};

type State = {
	dimensionsSet: boolean,
	hiddenHeight: number,
	hiddenWidth: number,
	translateX: Object,
};

const DIRECTIONAL_DISTANCE_CHANGE_THRESHOLD = 2;

/**
 * Row that is generally used in a SwipeListView.
 * If you are rendering a SwipeRow explicitly you must pass the SwipeRow exactly two children.
 * The first will be rendered behind the second.
 * e.g.
 <SwipeRow>
 <View style={hiddenRowStyle} />
 <View style={visibleRowStyle} />
 </SwipeRow>
 */
class SwipeRow extends Component {
	props: Props;
	static defaultProps: DefaultProps;
	state: State;
	horizontalSwipeGestureBegan: boolean;
	swipeInitialX: ?number;
	parentScrollEnabled: boolean;
	ranPreview: boolean;
	onContentLayout: (Object) => void;
	onRowPress: () => void;

	constructor(props: Props) {
		super(props);
		this.horizontalSwipeGestureBegan = false;
		this.swipeInitialX = null;
		this.parentScrollEnabled = true;
		this.ranPreview = false;
		this.state = {
			dimensionsSet: false,
			hiddenHeight: 0,
			hiddenWidth: 0,
			translateX: new Animated.Value(0),
		};

		this.onContentLayout = this.onContentLayout.bind(this);
		this.onRowPress = this.onRowPress.bind(this);
	}

	getPreviewAnimation(toValue: number, delay: number): Object {
		return Animated.timing(
			this.state.translateX,
			{
				duration: this.props.previewDuration,
				toValue,
				delay,
			}
		);
	}

	getSlideAnimation(toValue: number, delay: number): Object {
		return Animated.timing(
			this.state.translateX,
			{
				duration: this.props.slideDuration,
				toValue,
				delay,
			}
		);
	}

	onContentLayout(e: Object) {

		this.setState({
			dimensionsSet: !this.props.recalculateHiddenLayout,
			hiddenHeight: e.nativeEvent.layout.height,
			hiddenWidth: e.nativeEvent.layout.width,
		});

		// Disable preview animation
		// if (this.props.preview && !this.ranPreview) {
		// 	this.ranPreview = true;
		// 	let previewOpenValue = this.props.previewOpenValue || this.props.rightOpenValue * 0.5;
		// 	this.getPreviewAnimation(previewOpenValue, PREVIEW_OPEN_DELAY)
		// 	.start( _ => {
		// 		this.getPreviewAnimation(0, PREVIEW_CLOSE_DELAY).start();
		// 	});
		// }
	}

	onRowPress() {
		if (this.props.onRowPress) {
			this.props.onRowPress();
		} else if (this.props.closeOnRowPress) {
			this.closeRow();
		}
	}

	handleOnMoveShouldSetPanResponder(e: Object, gs: Object): boolean {
		const { dx } = gs;
		return Math.abs(dx) > DIRECTIONAL_DISTANCE_CHANGE_THRESHOLD;
	}

	handlePanResponderMove(e: Object, gestureState: Object) {
		const { dx, dy } = gestureState;
		const absDx = Math.abs(dx);
		const absDy = Math.abs(dy);

		// this check may not be necessary because we don't capture the move until we pass the threshold
		// just being extra safe here
		if (absDx > DIRECTIONAL_DISTANCE_CHANGE_THRESHOLD || absDy > DIRECTIONAL_DISTANCE_CHANGE_THRESHOLD) {
			// we have enough to determine direction
			if (absDy > absDx && !this.horizontalSwipeGestureBegan) {
				// user is moving vertically, do nothing, listView will handle
				return;
			}

			// user is moving horizontally
			if (this.parentScrollEnabled) {
				// disable scrolling on the listView parent
				this.parentScrollEnabled = false;
				this.props.setScrollEnabled && this.props.setScrollEnabled(false);
			}

			if (this.swipeInitialX === null) {
				// set tranlateX value when user started swiping
				this.swipeInitialX = this.state.translateX._value;
			}
			this.horizontalSwipeGestureBegan = true;

			let newDX = this.swipeInitialX + dx;
			if (this.props.disableLeftSwipe && newDX < 0) {
				newDX = 0;
			}
			if (this.props.disableRightSwipe && newDX > 0) {
				newDX = 0;
			}

			this.setState({
				translateX: new Animated.Value(newDX),
			});

		}
	}

	handlePanResponderEnd(e: Object, gestureState: Object) {
		// re-enable scrolling on listView parent
		if (!this.parentScrollEnabled) {
			this.parentScrollEnabled = true;
			this.props.setScrollEnabled && this.props.setScrollEnabled(true);
		}

		// finish up the animation
		let toValue = 0;
		if (this.state.translateX._value >= 0) {
			// trying to open right
			if (this.state.translateX._value > this.props.leftOpenValue / 2) {
				// we're more than halfway
				toValue = this.props.leftOpenValue;
			}
			// trying to open left
		} else if (this.state.translateX._value < this.props.rightOpenValue / 2) {
			// we're more than halfway
			toValue = this.props.rightOpenValue;
		}

		this.manuallySwipeRow(toValue);
	}

	/*
	 * This method is called by SwipeListView
	 */
	closeRow() {
		this.manuallySwipeRow(0);
	}

	manuallySwipeRow(toValue: number) {
		Animated.spring(
			this.state.translateX,
			{
				toValue,
				friction: this.props.friction,
				tension: this.props.tension,
			}
		).start();

		if (toValue === 0) {
			this.props.onRowClose && this.props.onRowClose();
		} else {
			this.props.onRowOpen && this.props.onRowOpen();
		}

		// reset everything
		this.swipeInitialX = null;
		this.horizontalSwipeGestureBegan = false;
	}

	renderVisibleContent(): React$Element<any> | null {
		// handle touchables
		if (this.props.children === null || this.props.children === undefined || this.props.children.length < 2) {
			return null;
		}

		const onPress = this.props.children[1].props.onPress;

		if (onPress) {
			const newOnPress = (_: null) => {
				this.onRowPress();
				onPress();
			};
			return React.cloneElement(
				this.props.children[1],
				{
					...this.props.children[1].props,
					onPress: newOnPress,
				}
			);
		}

		return (
			<View>
				{this.props.children[1]}
			</View>
		);
	}

	renderRowContent(): React$Element<any> {
		const slideOpenValue = this.props.editMode ? this.props.leftOpenValue : 0;

		return (
			<View
				onLayout={this.onContentLayout}
				style={{
					transform: [
						{ translateX: slideOpenValue },
					],
				}}
			>
				{this.renderVisibleContent()}
			</View>
		);
	}

	render(): React$Element<any> {
		return (
			<View style={this.props.style ? this.props.style : styles.container}>
				<View style={[ styles.hidden, { height: this.state.hiddenHeight, width: this.state.hiddenWidth }]}>
					{this.props.children && this.props.children.length > 0 ? this.props.children[0] : null}
				</View>
				{this.renderRowContent()}
			</View>
		);
	}

}

const styles = StyleSheet.create({
	container: {
		// As of RN 0.29 flex: 1 is causing all rows to be the same height
		// flex: 1
	},
	hidden: {
		bottom: 0,
		left: 0,
		overflow: 'hidden',
		position: 'absolute',
		right: 0,
		top: 0,
	},
});

SwipeRow.defaultProps = {
	leftOpenValue: 0,
	rightOpenValue: 0,
	closeOnRowPress: true,
	disableLeftSwipe: false,
	disableRightSwipe: false,
	recalculateHiddenLayout: false,
	preview: false,
	previewDuration: 300,
	editMode: false,
	slideDuration: 300,
};

export default SwipeRow;
