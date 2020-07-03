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
	useEffect,
} from 'react';
import {
	ScrollView,
	View,
	PanResponder,
	Animated,
} from 'react-native';

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
		extraData,
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
			extraData,
		});
	}, [_move, index, item, moveEnd, renderItem, extraData]);

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
		data = [],
		renderItem,
		extraData,
		onSortOrderUpdate,
	} = props;

	const [ dataInState, setDataInState ] = useState(data);

	useEffect(() => {
		setDataInState(data);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data.length]);

	const _rowInfo = useRef({});
	const _rowRefs = useRef({});
	const _refSelected = useRef({});
	const _dropIndexesQueue = useRef({});
	const _gridIndexToDrop = useRef(-1);
	const _currentGest = useRef({});
	const _containerLayoutInfo = useRef({});
	const _hasMoved = useRef(false);
	const _scrollViewRef = useRef({});
	const _scrollOffset = useRef({});
	const _containerRef = useRef({});

	const _animatedTop = useRef(new Animated.Value(0));
	const _animatedLeft = useRef(new Animated.Value(0));

	const [ selectedIndex, setSelectedIndex ] = useState(-1);

	const normalizeGrid = useCallback((key: number) => {
		if (!_rowRefs.current[key]) {
			return;
		}
		_rowRefs.current[key].setNativeProps({
			style: {
				transform: [{
					scale: 1,
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
			if (onSortOrderUpdate) {
				onSortOrderUpdate(newDataL2);
			}
		}
	}, [dataInState, onSortOrderUpdate, selectedIndex]);

	const onRelease = useCallback((evt: Object, gestureState: Object) => {
		arrageGrids();
		setSelectedIndex(-1);
		_hasMoved.current = false;
		commonActionsOnRelease();
	}, [arrageGrids, commonActionsOnRelease]);

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

	const _panResponder = useMemo((): Object => {
		return PanResponder.create({
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

				const {
					x: nextX = 0,
					y: nextY = 0,
				} = (_scrollOffset && _scrollOffset.current) ? _scrollOffset.current : {};

				const selectedItemInfo = _rowInfo.current[selectedIndex];
				const {
					width: widthSelected,
					height: heightSelected,
				} = selectedItemInfo;
				const {
					height: containerH,
					y: containerY = 0,
					x: containerX = 0,
				} = _containerLayoutInfo.current;

				const left = moveX - (widthSelected / 2) - containerX;
				const top = moveY - (heightSelected / 2) - containerY;
				_animatedTop.current.setValue(top);
				_animatedLeft.current.setValue(left);

				Object.keys(_rowInfo.current).forEach((key: string) => {
					const {
						x,
						y,
						width: _width,
						height: _height,
					} = _rowInfo.current[key];

					const isDroppable = moveX > x && (top + nextY) > y && moveX < (x + _width) && (top + nextY) < (y + _height);
					if (isDroppable) {
						if (!_rowRefs.current[key]) {
							return;
						}
						_dropIndexesQueue.current = {
							..._dropIndexesQueue.current,
							[key]: true,
						};
						_gridIndexToDrop.current = key;
						_rowRefs.current[key].setNativeProps({
							style: {
								transform: [{
									scale: 0.8,
								}],
							},
						});
					} else if (_dropIndexesQueue.current[key]) {
						normalizeGrid(parseInt(key, 10));
					}

					const shouldMoveDown = top > (containerH - heightSelected);
					const shouldMoveUp = top < (containerY + heightSelected);
					if (shouldMoveDown) {
						_scrollViewRef.current.scrollTo({
							x: nextX || 0,
							y: (nextY + heightSelected) || (containerY + containerH + heightSelected),
							animated: false,
						});
					}
					if (shouldMoveUp) {
						_scrollViewRef.current.scrollTo({
							x: nextX || 0,
							y: (nextY - heightSelected) || (containerY + containerH - heightSelected),
							animated: false,
						});
					}
				});
			},
			onPanResponderTerminationRequest: ({ nativeEvent }: Object, gestureState: Object): boolean => {
				return false;
			},
			onPanResponderRelease: onRelease,
		});
	}, [normalizeGrid, onRelease, selectedIndex]);

	const _move = useCallback((index: number) => {
		const selectedItemInfo = _rowInfo.current[index];
		setSelectedIndex(index);
		if (!_refSelected.current) {
			return;
		}

		const {
			x: nextX = 0,
			y: nextY = 0,
		} = (_scrollOffset && _scrollOffset.current) ? _scrollOffset.current : {};

		_animatedTop.current.setValue(selectedItemInfo.y - nextY);
		_animatedLeft.current.setValue(selectedItemInfo.x - nextX);

		_refSelected.current.setNativeProps({
			style: {
				transform: [{
					scale: 1.2,
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
		_containerRef.current.measureInWindow((x: number, y: number, _width: number, _height: number) => {
			_containerLayoutInfo.current = {
				x,
				y,
				width: _width,
				height: _height,
			};
		});
	}, []);

	const _onScroll = useCallback(({nativeEvent}: Object) => {
		_scrollOffset.current = nativeEvent.contentOffset;
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
					moveEnd={_moveEnd}
					extraData={extraData}/>
			);
		});
	}, [dataInState, _setRowRefs, _onLayoutRow, renderItem, _move, _moveEnd, extraData]);

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
					top: _animatedTop.current,
					left: _animatedLeft.current,
				}}
				extraData={extraData}/>
		);
	}, [selectedIndex, renderItem, dataInState, _moveEnd, _setRowRefSelected, extraData]);

	return (
		<View
			style={{
				flex: 1,
			}}
			{..._panResponder.panHandlers}
			onLayout={onLayoutContainer}
			ref={_containerRef}>
			<ScrollView
				{...props}
				ref={_scrollViewRef}
				onScroll={_onScroll}
				scrollEventThrottle={12}>
				{rows}
			</ScrollView>
			{!!selectedItem && selectedItem}
		</View>
	);
});

export default DragDropGriddedScrollView;
