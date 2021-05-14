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
import { useIntl } from 'react-intl';

import {
	Text,
	View,
	EmptyView,
	RoundedInfoButton,
	TouchableButton,
} from '../../../../BaseComponents';
import GenericConfSetting from './GenericConfSetting';
import BitsetConfSetting from './BitsetConfSetting';
import RangeConfSetting from './RangeConfSetting';
import RangeMappedConfSetting from './RangeMappedConfSetting';
import ManualConfigBlock from './ManualConfigBlock';
import QueuedManualConfigBlock from './QueuedManualConfigBlock';

import Theme from '../../../Theme';

import {
	useDialogueBox,
} from '../../../Hooks/Dialoguebox';
import {
	useAppTheme,
} from '../../../Hooks/Theme';

import i18n from '../../../Translations/common';

type Props = {
	parameters: Object,
	manufacturerAttributes: Object,
	configurationParameters: Array<Object>,
	onChangeValue: (Object) => void,
	onChangeConfigurationAdvManual: (Object) => void,
	onChangeConfigurationAdvManualQueued: (Object) => void,
	isLoadingAdv: boolean,
	configurationsManual: Array<Object>,
	addNewManual: Function,
};

const AdvancedConf = (props: Props): Object => {
	const {
		parameters = {},
		configurationParameters,
		onChangeValue,
		isLoadingAdv,
		onChangeConfigurationAdvManual,
		onChangeConfigurationAdvManualQueued,
		configurationsManual,
		addNewManual,
	} = props;

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

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
		verticalBlockCoverManual,
		padding,
		buttonStyle,
	} = getStyles({
		layout,
		colors,
	});

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();
	const onPressInfo = useCallback(({
		Description,
		title,
		postScript,
	}: Object) => {
		toggleDialogueBoxState({
			show: true,
			header: formatMessage(i18n.confDescription),
			showHeader: true,
			imageHeader: true,
			text: `${title}\n\n${Description}\n\n${postScript}`,
			showPositive: true,
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const getConfSettings = useCallback(({
		type,
		...others
	}: Object): Object => {
		switch (type) {
			case 'bitset': {
				return (
					<BitsetConfSetting
						{...others}
						onChangeValue={onChangeValue}/>
				);
			}
			case 'range': {
				return (
					<RangeConfSetting
						{...others}
						onChangeValue={onChangeValue}/>
				);
			}
			case 'rangemapped': {
				return (
					<RangeMappedConfSetting
						{...others}
						onChangeValue={onChangeValue}/>
				);
			}
			default:
				return (
					<GenericConfSetting
						{...others}
						onChangeValue={onChangeValue}/>
				);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onChangeValue]);

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
				let from = parseInt(From, 10);
				let to = parseInt(To, 10);
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
												title: `${ParameterNumber}. ${Name}`,
												postScript: formatMessage(i18n.pleaseSetValueBetween, {
													min,
													max,
												}),
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
						<View
							style={{
								flex: 1,
							}}>
							<Text
								level={3}
								style={hItemLabelDef}>
								{`${ParameterNumber}. ${Name}`}
							</Text>
						</View>
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
											title: `${ParameterNumber}. ${Name}`,
											Description,
											postScript: formatMessage(i18n.pleaseSetValueBetween, {
												min,
												max,
											}),
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
			manualParams.forEach((mp: Object, index: number) => {
				const {
					pNumber,
					size,
					value,
				} = mp;
				const _size = typeof size === undefined ? '' : size.toString();
				const _value = typeof value === undefined ? '' : value.toString();

				_configurationSettings.push(
					<View
						key={`${index}-${pNumber}`}
						style={verticalBlockCoverManual}>
						<View
							style={leftBlockMultiple}>
							<Text
								level={3}
								style={hItemLabelDef}>
								{`${pNumber}. ${formatMessage(i18n.manualConfOne)}`}
							</Text>
						</View>
						<View
							key={`${index}-${pNumber}`}>
							<QueuedManualConfigBlock
								formatMessage={formatMessage}
								number={pNumber}
								value={_value}
								size={_size}
								onChangeValue={onChangeConfigurationAdvManualQueued}
								resetOnSave/>
						</View>
					</View>
				);
			});
		}
		let manualConfs = [];
		configurationsManual.forEach((mcs: Object, index: number) => {
			const {
				number,
				size,
				value,
			} = mcs;
			manualConfs.push(
				<View
					key={`${index}-manual-two`}
					style={[verticalBlockCoverManual, {
						paddingTop: _configurationSettings.length > 0 ? padding / 2 : 0,
						borderTopWidth: _configurationSettings.length > 0 ? 3 : 0,
						borderTopColor: colors.screenBackground,
					}]}>
					<View
						style={leftBlockMultiple}>
						<Text
							level={3}
							style={hItemLabelDef}>
							{formatMessage(i18n.manualConfTwo)}
						</Text>
					</View>
					<ManualConfigBlock
						label={`${formatMessage(i18n.number)} : `}
						inputValueKey={'number'}
						number={number}
						size={size}
						value={value}
						onChangeValue={onChangeConfigurationAdvManual}
						resetOnSave={false}
						index={index}/>
					<ManualConfigBlock
						label={`${formatMessage(i18n.size)} : `}
						inputValueKey={'size'}
						number={number}
						size={size}
						value={value}
						onChangeValue={onChangeConfigurationAdvManual}
						resetOnSave={false}
						index={index}/>
					<ManualConfigBlock
						label={`${formatMessage(i18n.labelValue)} : `}
						inputValueKey={'value'}
						number={number}
						size={size}
						value={value}
						onChangeValue={onChangeConfigurationAdvManual}
						resetOnSave={false}
						index={index}/>
				</View>
			);
		});
		_configurationSettings.push(
			<View
				key={'manual-two'}>
				{manualConfs}
				<TouchableButton
					style={buttonStyle}
					text={formatMessage(i18n.labelAdd)}
					onPress={addNewManual}
					showThrobber={isLoadingAdv}
					disabled={isLoadingAdv}/>
			</View>
		);
		return _configurationSettings;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		addNewManual,
		cParamsLength,
		paramsLen,
		layout,
		getConfSettings,
		onChangeValue,
		onChangeConfigurationAdvManualQueued,
		onChangeConfigurationAdvManual,
		isLoadingAdv]);

	if (configurationSettings.length <= 0) {
		return <EmptyView/>;
	}

	return (
		<View
			style={verticalCover}>
			<Text
				level={2}
				style={subTitleTextStyle}>
				{formatMessage(i18n.advancedSettings)}
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
		padding,
		coverStyle: {
			justifyContent: 'space-between',
			marginTop: 2,
			borderRadius: 2,
			padding,
			...shadow,
		},
		verticalCover: {
		},
		subTitleTextStyle: {
			fontSize: fontSize * 1.1,
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
		buttonStyle: {
			alignSelf: 'flex-end',
			marginTop: padding,
			width: '30%',
			minWidth: '30%',
			paddingVertical: 7,
		},
	};
};

export default (memo<Object>(AdvancedConf): Object);
