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
 *
 */

// @flow

'use strict';

import React, {
	memo,
	useCallback,
	useMemo,
} from 'react';
import {
	useSelector,
} from 'react-redux';
import {
	Platform,
} from 'react-native';

import {
	Text,
	View,
	EmptyView,
	RoundedInfoButton,
	ThemedTextInput,
} from '../../../../BaseComponents';
import GenericConfSetting from './GenericConfSetting';
import BitsetConfSetting from './BitsetConfSetting';
import RangeConfSetting from './RangeConfSetting';
import RangeMappedConfSetting from './RangeMappedConfSetting';

import Theme from '../../../Theme';

import {
	useDialogueBox,
} from '../../../Hooks/Dialoguebox';
import {
	useAppTheme,
} from '../../../Hooks/Theme';

type Props = {
	parameters: Object,
	manufacturerAttributes: Object,
	configurationParameters: Array<Object>,
	onChangeValue: (Object) => void,
};

const AdvancedConf = (props: Props): Object => {
	const {
		parameters = {},
		configurationParameters,
		onChangeValue,
	} = props;

	const {
		colors,
	} = useAppTheme();

	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		verticalCover,
		coverStyle,
		subTitleTextStyle,
		hItemLabelDef,
		horizontalCover,
		leftBlock,
		rightBlock,
		leftBlockMultiple,
		verticalBlockCoverMultiple,
		horizontalBlockCoverMultiple,
		horizontalCoverMultiple,
		rightBlockMultiple,
		textFieldStyle,
		verticalBlockCoverManual,
	} = getStyles({
		layout,
		colors,
	});

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();
	const onPressInfo = useCallback(({Description}: Object) => {
		toggleDialogueBoxState({
			show: true,
			header: ' ',
			showHeader: true,
			imageHeader: true,
			text: Description,
			showPositive: true,
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const _onChangeValue = useCallback((data: Object) => {
		onChangeValue(data);
	}, [onChangeValue]);

	const getConfSettings = useCallback(({
		type,
		...others
	}: Object): Object => {
		switch (type) {
			case 'bitset': {
				return (
					<BitsetConfSetting
						{...others}
						onChangeValue={_onChangeValue}/>
				);
			}
			case 'range': {
				return (
					<RangeConfSetting
						{...others}
						onChangeValue={_onChangeValue}/>
				);
			}
			case 'rangemapped': {
				return (
					<RangeMappedConfSetting
						{...others}
						onChangeValue={_onChangeValue}/>
				);
			}
			default:
				return (
					<GenericConfSetting
						{...others}
						onChangeValue={_onChangeValue}/>
				);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [_onChangeValue]);

	// const onChangeTextNumber = useCallback(() => {
	// }, []);

	// const onSubmitEditingNumber = useCallback(() => {
	// }, []);

	const onChangeTextSize = useCallback(() => {
	}, []);

	const onSubmitEditingSize = useCallback(() => {
	}, []);

	const onChangeTextValue = useCallback(() => {
	}, []);

	const onSubmitEditingValue = useCallback(() => {
	}, []);

	const cParamsLength = configurationParameters.length;
	const paramsLen = Object.keys(parameters);
	const configurationSettings = useMemo((): Array<Object> => {
		let deviceDescriptorParamIds = [];
		let _configurationSettings = configurationParameters.map((cp: Object, index: number): Object => {
			// TODO: Move to shared data
			const {
				Name,
				ParameterNumber,
				Description,
				ConfigurationParameterValues: values = [],
				Size,
				DefaultValue,
			} = cp;

			deviceDescriptorParamIds.push(ParameterNumber);

			let min = null;
			let max = null;
			let steps = 0;
			let _values = [];
			// TODO: Unlike xml used at web, JSON response in app do not
			// have a type attribute, so confirm the type inference logic.
			let type;

			for (let i = 0; i < values.length; ++i) {
				const {
					From,
					To,
				} = values[i];
				let from = parseInt(From, 16);
				let to = parseInt(To, 16);
				let signed = false;
				if (from > to) {
					// eslint-disable-next-line no-bitwise
					from = from - (1 << (8 * Size));
					signed = true;
				}
				steps += (to - from) + 1;
				_values.push({
					'from': from,
					'to': to,
					'signed': signed,
					'steps': (to - from) + 1,
					'unit': values[i].unit,
					'description': values[i].Description,
					'rangeFrom': undefined,
					'rangeTo': undefined,
				});
				if (min === null || from < min) {
					min = from;
				}
				if (max === null || to > max) {
					max = to;
				}
			}
			_values.sort((a: Object, b: Object): 0 | 1 | -1 => {
				if (a.from < b.from) {
					return -1;
				} else if (a.from === b.from) {
					return 0;
				}
				return 1;
			});
			let offset = 1;
			for (let i = 0; i < _values.length; ++i) {
				_values[i].rangeFrom = offset;
				_values[i].rangeTo = offset + (_values[i].to - _values[i].from);
				offset += (_values[i].to - _values[i].from) + 1;
			}

			let defaultValue = DefaultValue;
			if (ParameterNumber in parameters) {
				defaultValue = typeof parameters[ParameterNumber].queue === 'number' ? parameters[ParameterNumber].queue : parameters[ParameterNumber].value;
			}

			const hasMultiple = Size > 1 && values.length > 1 && values.length === Size;
			if (hasMultiple) {
				let row = [];
				const setting = getConfSettings({
					values: _values,
					type,
					stepsTot: steps,
					defaultValue: defaultValue.toString(),
					min,
					max,
					Size,
					ConfigurationParameterValues: values,
					ParameterNumber,
				});
				values.forEach((v: Object, i: number) => {
					const {
						Description: d,
						From,
					} = v;
					row.push(
						<View
							key={`${i}`}
							style={horizontalBlockCoverMultiple}>
							<Text
								level={3}
								style={hItemLabelDef}>
								{`${From}. ${d}`}
							</Text>
						</View>
					);
				});
				return (
					<View
						key={`${index}-${ParameterNumber}`}
						style={horizontalCoverMultiple}>
						<View
							style={leftBlockMultiple}>
							<Text
								level={3}
								style={hItemLabelDef}>
								{`${ParameterNumber}`}
							</Text>
							{!!Description && (
								<>
									<Text style={Theme.Styles.hiddenText}>
										{' '}
									</Text>
									<RoundedInfoButton
										iconLevel={6}
										buttonProps={{
											infoButtonContainerStyle: {
												position: 'relative',
												right: undefined,
												bottom: undefined,
												marginLeft: 5,
											},
											onPress: onPressInfo,
											onPressData: {
												Description,
											},
										}}/>
								</>
							)}
						</View>
						<View
							style={verticalBlockCoverMultiple}>
							{row}
						</View>
						<View
							style={rightBlockMultiple}>
							{setting}
						</View>
					</View>
				);
			}
			const setting = getConfSettings({
				values: _values,
				type,
				stepsTot: steps,
				defaultValue: defaultValue.toString(),
				min,
				max,
				Size,
				ConfigurationParameterValues: values,
				ParameterNumber,
			});
			return (
				<View
					key={`${index}-${ParameterNumber}`}
					style={horizontalCover}>
					<View
						style={leftBlock}>
						<Text
							level={3}
							style={hItemLabelDef}>
							{`${ParameterNumber}. ${Name}`}
						</Text>
						{!!Description && (
							<>
								<Text style={Theme.Styles.hiddenText}>
									{' '}
								</Text>
								<RoundedInfoButton
									iconLevel={6}
									buttonProps={{
										infoButtonContainerStyle: {
											position: 'relative',
											right: undefined,
											bottom: undefined,
											marginLeft: 5,
										},
										onPress: onPressInfo,
										onPressData: {
											Description,
										},
									}}/>
							</>
						)}
					</View>
					<View
						style={rightBlock}>
						{setting}
					</View>
				</View>
			);
		});
		let manualParams = [];
		for (let index in parameters) {
			if (parameters[index] && deviceDescriptorParamIds.indexOf(parseInt(index, 10)) < 0) {
				manualParams.push({
					...parameters[index],
					pNumber: index,
				});
			}
		}
		if (manualParams.length > 0) {
			let rows = [];
			manualParams.forEach((mp: Object, index: number) => {
				const {
					pNumber,
					size,
					value = '0',
				} = mp;
				rows.push(
					<View
						key={`${index}-${pNumber}`}>
						<View>
							<Text
								level={3}
								style={hItemLabelDef}>
								Size
							</Text>
							<ThemedTextInput
								level={23}
								value={size}
								style={textFieldStyle}
								onChangeText={onChangeTextSize}
								onSubmitEditing={onSubmitEditingSize}
								autoCorrect={false}
								autoFocus={false}
								returnKeyType={'done'}
								keyboardType={Platform.OS === 'ios' ? 'phone-pad' : 'decimal-pad'}
							/>
						</View>
						<View>
							<Text
								level={3}
								style={hItemLabelDef}>
								Value
							</Text>
							<ThemedTextInput
								level={23}
								value={value}
								style={textFieldStyle}
								onChangeText={onChangeTextValue}
								onSubmitEditing={onSubmitEditingValue}
								autoCorrect={false}
								autoFocus={false}
								returnKeyType={'done'}
								keyboardType={Platform.OS === 'ios' ? 'phone-pad' : 'decimal-pad'}
							/>
						</View>
					</View>
				);

				_configurationSettings.push(
					<View
						key={`${index}-${pNumber}`}
						style={verticalBlockCoverManual}>
						<View
							style={leftBlockMultiple}>
							<Text
								level={3}
								style={hItemLabelDef}>
								{`${pNumber}. This is a manually added configuration`}
							</Text>
						</View>
						{rows}
					</View>
				);
			});
		}
		return _configurationSettings;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cParamsLength, paramsLen, layout, getConfSettings]);

	if (configurationSettings.length <= 0) {
		return <EmptyView/>;
	}

	return (
		<View
			style={verticalCover}>
			<Text // TODO: Translate
				level={2}
				style={subTitleTextStyle}>
                 Advanced settings
			</Text>
			<View
				level={2}
				style={coverStyle}>
				{configurationSettings}
			</View>
		</View>
	);
};

const getStyles = ({
	layout,
	colors,
}: Object): Object => {
	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		fontSizeFactorEight,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);

	return {
		coverStyle: {
			justifyContent: 'space-between',
			marginTop: 2,
			marginHorizontal: padding,
			borderRadius: 2,
			padding,
			...shadow,
		},
		verticalCover: {
		},
		subTitleTextStyle: {
			fontSize: fontSize * 1.1,
			marginLeft: padding,
			marginTop: 8,
			marginBottom: 5,
		},
		hItemLabelDef: {
			fontSize,
		},
		horizontalCover: {
			flexDirection: 'row',
			marginTop: padding,
			justifyContent: 'space-between',
		},
		horizontalCoverMultiple: {
			flex: 1,
			flexDirection: 'row',
			marginTop: padding,
			justifyContent: 'space-between',
		},
		leftBlock: {
			flexDirection: 'row',
			width: '60%',
			alignItems: 'center',
		},
		verticalBlockCoverMultiple: {
			flex: 1,
			flexDirection: 'column',
			paddingLeft: 8,
		},
		verticalBlockCoverManual: {
			flex: 1,
			flexDirection: 'column',
			marginTop: padding,
		},
		horizontalBlockCoverMultiple: {
			flex: 1,
			flexDirection: 'row',
			marginTop: 2,
			justifyContent: 'space-between',
		},
		leftBlockMultiple: {
			flexDirection: 'row',
			alignItems: 'center',
		},
		rightBlockMultiple: {
			flexDirection: 'row',
			width: '30%',
			alignItems: 'center',
			justifyContent: 'flex-end',
		},
		rightBlock: {
			flexDirection: 'row',
			width: '30%',
			alignItems: 'center',
			justifyContent: 'flex-end',
		},
		textFieldStyle: {
			width: '100%',
			paddingBottom: 0,
			paddingTop: 0,
			fontSize,
			textAlign: 'right',
			borderBottomWidth: 1,
			borderBottomColor: colors.inAppBrandSecondary,
		},
	};
};

export default memo<Object>(AdvancedConf);
