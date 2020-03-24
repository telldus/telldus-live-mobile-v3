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
	useCallback,
	memo,
	useMemo,
	forwardRef,
	useRef,
} from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import {
	DropDown,
	View,
	Text,
	RippleButton,
} from '../../../../../BaseComponents';

import {
	getAllModels,
	prepare433ModelName,
} from '../../../../Lib/DeviceUtils';
import {
	setWidgetParamsValue,
} from '../../../../Actions/AddDevice';

import Theme from '../../../../Theme';
import i18n from '../../../../Translations/common';

const Device433EditModel = (props: Object, ref: Object): Object => {

	const {
		device,
	} = props;

	const dispatch = useDispatch();
	const intl = useIntl();
	const ddRef = useRef(null);

	const {
		formatMessage,
	} = intl;

	const { layout, defaultSettings = {} } = useSelector((state: Object): Object => state.app);
	const { language = {} } = defaultSettings;
	const locale = language.code;

	const { addDevice433 = {} } = useSelector((state: Object): Object => state.addDevice);
	const { widgetParams433Device = {} } = addDevice433;
	const { model: modelC } = widgetParams433Device;

	const {
		dropDownContainerStyleDef,
		fontSize,
		pickerContainerStyle,
		coverStyle,
		labelStyle,
		pickerBaseTextStyle,
		rowTextColor,
		sectionHeaderStyle,
		sectionRowStyle,
		pickerBaseCoverStyle,
		brandSecondary,
		itemSize,
	} = getStyles(layout);

	const onValueChange = useCallback((item: Object, itemIndex: number) => {
		if (ddRef.current && ddRef.current.blur) {
			ddRef.current.blur();
			const {
				value,
			} = item;
			const {
				model: _model,
				protocol,
			} = value;
			if (protocol || _model) {
				dispatch(setWidgetParamsValue({
					...widgetParams433Device,
					model: _model,
					protocol,
				}));
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		widgetParams433Device,
	]);

	const {
		model,
	} = device;

	const _renderItem = useCallback((rowProps: Object): Object => {
		const {
			style,
			item,
			index,
		} = rowProps;

		const {
			key,
			value,
		} = item;

		if (key === 'section_header') {
			return (
				<View style={style}>
					<Text style={sectionHeaderStyle}>
						{value}
					</Text>
				</View>
			);
		}

		function onPress() {
			onValueChange(item, index);
		}

		const {
			modelName,
			lang,
			model: _model,
		} = value;

		return (
			<RippleButton style={style} onPress={onPress}>
				<Text style={[sectionRowStyle, {
					color: model === _model ? brandSecondary : '#000',
				}]}>
					{prepare433ModelName(locale, lang, modelName)}
				</Text>
			</RippleButton>
		);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		locale,
		model,
		widgetParams433Device,
	]);

	const valueExtractor = useCallback((data: Object, index: number): string => {
		const {
			value,
		} = data;
		const {
			model: _model,
		} = value;
		return _model;
	}, []);

	const labelExtractor = useCallback((data: Object, index: number): string => {
		const {
			value,
		} = data;
		const {
			lang,
			modelName,
		} = value;
		return prepare433ModelName(locale, lang, modelName);
	}, [locale]);

	const models = useMemo((): Array<Object> => {
		function prepareModels(m: Array<Object>): Array<Object> {
			let data = [];
			m.forEach((i: Object) => {
				const { key, value } = i;
				data.push({
					key: 'section_header',
					value: key,
					vendor: key,
				});
				value.forEach((j: Object) => {
					data.push({
						key: 'section_row',
						value: {
							...j,
							vendor: key,
						},
					});
				});
			});
			return data;
		}
		return prepareModels(getAllModels());
	}, []);

	return (
		<View style={coverStyle}>
			<Text style={labelStyle} numberOfLine={1}>
				{formatMessage(i18n.brandModel)}
			</Text>
			<DropDown
				ref={ddRef}
				items={models}
				value={modelC}
				appLayout={layout}
				intl={intl}
				dropDownContainerStyle={dropDownContainerStyleDef}
				baseColor={rowTextColor}
				fontSize={fontSize}
				pickerContainerStyle={pickerContainerStyle}
				pickerBaseTextStyle={pickerBaseTextStyle}
				renderItem={_renderItem}
				valueExtractor={valueExtractor}
				labelExtractor={labelExtractor}
				pickerBaseCoverStyle={pickerBaseCoverStyle}
				itemCount={6}
				itemSize={itemSize}
			/>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const fontSize = Math.floor(deviceWidth * 0.04);

	const {
		paddingFactor,
		shadow,
		rowTextColor,
		eulaContentColor,
		brandSecondary,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const itemSize = Math.ceil(fontSize * 1.61 + 8 * 2);

	return {
		brandSecondary,
		rowTextColor,
		itemSize,
		dropDownContainerStyleDef: {
			flex: 1,
			flexDirection: 'row',
			alignItems: 'center',
		},
		fontSize: fontSize * 0.9,
		pickerContainerStyle: {
			elevation: 0,
			shadowColor: 'transparent',
			shadowRadius: 0,
			shadowOpacity: 0,
			shadowOffset: {
				width: 0,
				height: 0,
			},
			marginBottom: 0,
		},
		pickerBaseTextStyle: {
			textAlign: 'right',
		},
		coverStyle: {
			flex: 0,
			flexDirection: 'row',
			alignItems: 'center',
			width: width - (padding * 2),
			justifyContent: 'space-between',
			...shadow,
			backgroundColor: '#fff',
			marginBottom: padding / 2,
			paddingRight: padding,
			paddingVertical: padding + (deviceWidth * 0.02),
		},
		labelStyle: {
			flex: 0,
			color: '#000',
			fontSize,
			flexWrap: 'wrap',
			marginLeft: padding,
			textAlignVertical: 'center',
			marginRight: 5,
		},
		eulaContentColor,
		sectionRowStyle: {
			color: '#000',
			fontSize: fontSize * 0.9,
			textAlignVertical: 'center',
		},
		sectionHeaderStyle: {
			color: rowTextColor,
			fontSize,
			textAlignVertical: 'center',
		},
		pickerBaseCoverStyle: {
			flex: 1,
			padding: undefined,
			alignSelf: 'center',
		},
	};
};

export default memo<Object>(forwardRef<Object, Object>(Device433EditModel));
