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
	memo,
	useMemo,
	useCallback,
	useRef,
	useState,
} from 'react';
import {
	ScrollView,
	View,
	PanResponder,
	Animated,
	Platform,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useSelector } from 'react-redux';

import Theme from '../App/Theme';

const RowItem = memo<Object>((props: Object): Object => {
	const {
		renderItem,
		item,
		index,
		moveEnd,
		move,
		onLayout,
		style,
		setRowRefs,
	} = props;

	const _move = useCallback(() => {
		if (move) {
			move(index);
		}
	}, [index, move]);

	const _onLayout = useCallback((event: Object) => {
		if (onLayout) {
			onLayout(event, index);
		}
	}, [index, onLayout]);

	const component = useMemo((): Object => {
		return renderItem({
			isActive: false,
			item,
			index,
			move: _move,
			moveEnd,
		});
	}, [_move, index, item, moveEnd, renderItem]);

	const _setRowRefs = useCallback((ref: any) => {
		if (setRowRefs) {
			setRowRefs(ref, index);
		}
	}, [index, setRowRefs]);

	return (
		<Animated.View
			ref={_setRowRefs}
			onLayout={_onLayout}
			style={style}>
			{component}
		</Animated.View>
	);
});

const DragDropGriddedScrollView = memo<Object>((props: Object): Object => {

	const {
		data,
		renderItem,
	} = props;

	const [ dataInState, setDataInState ] = useState(data);

	const _rowInfo = useRef({});
	const _rowRefs = useRef({});
	const _refSelected = useRef({});
	const _dropIndexesQueue = useRef({});
	const _gridIndexToDrop = useRef(-1);
	const _currentGest = useRef({});
	const _containerLayoutInfo = useRef({});
	const _hasMoved = useRef(false);

	const [ selectedIndex, setSelectedIndex ] = useState(-1);

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		headerHeightFactor,
	} = Theme.Core;
	const { land, port } = headerHeightFactor;
	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceHeight = isPortrait ? height : width;
	const statusBarHeight = getStatusBarHeight();
	const headerHeight = Platform.OS === 'android' ? (isPortrait ? deviceHeight * port : deviceHeight * land) : deviceHeight * land;
	const totalTop = statusBarHeight + headerHeight;

	const normalizeGrid = useCallback((key: number) => {
		_rowRefs.current[key].setNativeProps({
			style: {
				transform: [{
					scaleX: 1,
				}, {
					scaleY: 1,
				}],
			},
		});
		delete _dropIndexesQueue.current[key];
	}, []);

	const commonActionsOnRelease = useCallback(() => {
		Object.keys(_dropIndexesQueue.current).forEach((key: string) => {
			normalizeGrid(parseInt(key, 10));
		});
	}, [normalizeGrid]);

	const arrageGrids = useCallback(() => {
		if (_gridIndexToDrop.current === -1) {
			return;
		}
		if (selectedIndex === -1) {
			return;
		}
		if (parseInt(selectedIndex, 10) === parseInt(_gridIndexToDrop.current, 10)) {
			return;
		}
		if (_dropIndexesQueue.current[_gridIndexToDrop.current]) {
			const dropIndex = _gridIndexToDrop.current;
			let newData = [], droppedIndex;
			dataInState.map((dis: Object, i: number): Object => {
				if (parseInt(selectedIndex, 10) !== parseInt(i, 10)) {
					if (parseInt(dropIndex, 10) === parseInt(i, 10)) {
						newData.push(dataInState[selectedIndex]);
						droppedIndex = newData.length - 1;
					} else {
						newData.push(dis);
					}
				}
			});
			let newDataL2 = [];
			if (parseInt(dropIndex, 10) > parseInt(selectedIndex, 10)) {
				let newDataL1 = newData.slice(0, droppedIndex);
				newDataL1.push(dataInState[parseInt(dropIndex, 10)]);
				newDataL2 = newDataL1.concat(newData.slice(droppedIndex));
			} else {
				let newDataL1 = newData.slice(0, droppedIndex + 1);
				newDataL1.push(dataInState[parseInt(dropIndex, 10)]);
				newDataL2 = newDataL1.concat(newData.slice(droppedIndex + 1));
			}
			setDataInState(newDataL2);
		}
	}, [dataInState, selectedIndex]);

	const onRelease = (evt: Object, gestureState: Object) => {
		arrageGrids();
		setSelectedIndex(-1);
		_hasMoved.current = false;
		commonActionsOnRelease();
	};

	const _setRowRefs = useCallback((ref: any, index: number) => {
		const _rowRefsNew = {
			..._rowRefs.current,
			[index]: ref,
		};
		_rowRefs.current = _rowRefsNew;
	}, []);

	const _setRowRefSelected = useCallback((ref: any, index: number) => {
		_refSelected.current = ref;
	}, []);

	const _panResponder = PanResponder.create({
		onStartShouldSetPanResponderCapture: (evt: Object, gestureState: Object): boolean => {
			_currentGest.current = gestureState;
			return false;
		},
		onMoveShouldSetPanResponder: (evt: Object, gestureState: Object): boolean => {
			const { numberActiveTouches } = gestureState;
			if (numberActiveTouches > 1) {
				onRelease();
				return false;
			}
			const shouldSet = selectedIndex !== -1;
			if (shouldSet) {
				_hasMoved.current = true;
			}
			return shouldSet;
		},
		onPanResponderMove: (evt: Object, gestureState: Object) => {
			if (gestureState.numberActiveTouches > 1) {
				onRelease();
				return;
			}
			if (selectedIndex === -1) {
				return;
			}

			const {
				moveX,
				moveY,
			} = gestureState;

			const selectedItemInfo = _rowInfo.current[selectedIndex];
			const left = moveX - (selectedItemInfo.width / 2);
			const top = moveY - totalTop;
			_refSelected.current.setNativeProps({
				style: {
					left,
					top,
				},
			});


			Object.keys(_rowInfo.current).forEach((key: string) => {
				const {
					x,
					y,
					width: _width,
					height: _height,
				} = _rowInfo.current[key];

				if (moveX > x && top > y && moveX < (x + _width) && top < (y + _height)) {
					_dropIndexesQueue.current = {
						..._dropIndexesQueue.current,
						[key]: true,
					};
					_gridIndexToDrop.current = key;
					_rowRefs.current[key].setNativeProps({
						style: {
							transform: [{
								scaleX: 0.8,
							}, {
								scaleY: 0.8,
							}],
						},
					});
				} else if (_dropIndexesQueue.current[key]) {
					normalizeGrid(parseInt(key, 10));
				}
			});
		},
		onPanResponderTerminationRequest: ({ nativeEvent }: Object, gestureState: Object): boolean => {
			return false;
		},
		onPanResponderRelease: onRelease,
	});

	const _move = useCallback((index: number) => {
		const selectedItemInfo = _rowInfo.current[index];
		setSelectedIndex(index);
		if (!_refSelected.current) {
			return;
		}

		_refSelected.current.setNativeProps({
			style: {
				left: selectedItemInfo.x,
				top: selectedItemInfo.y,
				transform: [{
					scaleX: 1.2,
				}, {
					scaleY: 1.2,
				}],
			},
		});
	}, []);

	const _moveEnd = useCallback(() => {
		if (!_hasMoved.current) {
			setSelectedIndex(-1);
			_hasMoved.current = false;
		}
		commonActionsOnRelease();
	}, [commonActionsOnRelease]);

	const _onLayoutRow = useCallback((event: Object, index: number) => {
		const _rowInfoNext = {
			..._rowInfo.current,
			[index]: event.nativeEvent.layout,
		};
		_rowInfo.current = _rowInfoNext;
	}, [_rowInfo]);

	const onLayoutContainer = useCallback((event: Object) => {
		_containerLayoutInfo.current = event.nativeEvent.layout;
	}, []);

	const rows = useMemo((): Array<Object> => {
		return dataInState.map((item: Object, index: number): Object => {
			return (
				<RowItem
					key={`${index}`}
					setRowRefs={_setRowRefs}
					onLayout={_onLayoutRow}
					renderItem={renderItem}
					item={item}
					index={index}
					move={_move}
					moveEnd={_moveEnd}/>
			);
		});
	}, [dataInState, _setRowRefs, _onLayoutRow, renderItem, _move, _moveEnd]);

	const selectedItem = useMemo((): null | Object => {
		if (selectedIndex === -1) {
			return null;
		}
		return (
			<RowItem
				key={`${selectedIndex}-selected`}
				renderItem={renderItem}
				item={dataInState[selectedIndex]}
				index={`${selectedIndex}-selected`}
				moveEnd={_moveEnd}
				setRowRefs={_setRowRefSelected}
				style={{
					position: 'absolute',
				}}/>
		);
	}, [selectedIndex, renderItem, dataInState, _moveEnd, _setRowRefSelected]);

	return (
		<View
			style={{
				flex: 1,
			}}
			{..._panResponder.panHandlers}
			onLayout={onLayoutContainer}>
			<ScrollView
				{...props}>
				{rows}
			</ScrollView>
			{!!selectedItem && selectedItem}
		</View>
	);
});

export default DragDropGriddedScrollView;
