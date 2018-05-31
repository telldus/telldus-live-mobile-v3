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
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { IconTelldus, Slider, View } from '../../../../BaseComponents';
import { getHoursAndMinutes } from '../../../Lib';
import Theme from '../../../Theme';
import Description from './Description';
import TimeField from './TimeField';
import { TouchableOpacity } from 'react-native';

type Props = {
	description: string,
	icon: string,
	minimumValue: number,
	maximumValue: number,
	onValueChange: Function,
	value: number,
	appLayout: Object,
	intl: Object,
	toggleEdit?: (string) => void,
	type?: string,
};

type State = {
	value: number,
	isEditing: boolean,
};

export default class TimeSlider extends View<null, Props, State> {

	static propTypes = {
		description: PropTypes.string.isRequired,
		icon: PropTypes.string.isRequired,
		minimumValue: PropTypes.number.isRequired,
		maximumValue: PropTypes.number.isRequired,
		onValueChange: PropTypes.func.isRequired,
		value: PropTypes.number,
	};

	onEdit: () => void;
	onEndEdit: () => void;

	constructor(props: Props) {
		super(props);

		const sliderColor = Theme.Core.brandSecondary;

		this.sliderConfig = {
			minimumValue: props.minimumValue,
			maximumValue: props.maximumValue,
			minDisplayValue: '00h 00min',
			maxDisplayValue: '24h 00min',
			minimumTrackTintColor: sliderColor,
			maximumTrackTintColor: sliderColor,
			onValueChange: this.onValueChange,
			showValue: true,
			step: 1,
		};

		this.state = {
			value: typeof props.value === 'number' ? props.value : props.minimumValue,
			isEditing: false,
		};

		this.onEdit = this.onEdit.bind(this);
		this.onEndEdit = this.onEndEdit.bind(this);
	}

	onEdit() {
		const { toggleEdit, type } = this.props;
		this.setState({
			isEditing: true,
		});
		if (toggleEdit && type) {
			toggleEdit(type);
		}
	}

	onEndEdit() {
		const { toggleEdit, type } = this.props;
		this.setState({
			isEditing: false,
		});
		if (toggleEdit && type) {
			toggleEdit(type);
		}
	}

	onValueChange = (value: number) => {
		this.setState({ value });
		this.props.onValueChange(value);
	};

	render(): React$Element<any> {
		const { description, icon, appLayout, intl, minimumValue, maximumValue } = this.props;
		const { value, isEditing } = this.state;
		const {
			container,
			row,
			slider,
			icon: iconStyle,
			description: descriptionStyle,
			marginBottom,
			iconEditStyle,
			iconEditSize,
		} = this._getStyle(appLayout);

		return (
			<View style={container}>
				<View
					style={[
						row,
						{
							justifyContent: 'flex-start',
							marginBottom,
							flex: 1,
						},
					]}
				>
					<IconTelldus icon={icon} style={iconStyle}/>
					<Description style={descriptionStyle} appLayout={appLayout}>{description}</Description>
					{isEditing ?
						<TouchableOpacity onPress={this.onEndEdit} style={iconEditStyle}>
							<IconTelldus icon={'checkmark'} size={iconEditSize} color={Theme.Core.brandSecondary}/>
						</TouchableOpacity>
						:
						<TouchableOpacity onPress={this.onEdit} style={iconEditStyle}>
							<Icon name={'edit'} size={iconEditSize} color={Theme.Core.brandSecondary}/>
						</TouchableOpacity>
					}
				</View>
				<View style={[row, { justifyContent: 'center' }]}>
					{isEditing ?
						<TimeField
							appLayout={appLayout}
							value={value.toString()}
							intl={intl}
							icon={icon}
							min={minimumValue}
							max={maximumValue}
							onValueChange={this.onValueChange}/>
						:
						<Slider
							{...this.sliderConfig}
							value={value}
							valueStyle={{width: undefined}}
							methodFormatDisplayValue={getHoursAndMinutes}
							trackStyle={slider.track}
							thumbStyle={slider.thumb}
						/>
					}
				</View>
			</View>
		);
	}

	_getStyle = (appLayout: Object): Object => {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const padding = deviceWidth * 0.026666667;
		const thumbSize = deviceWidth * 0.085333333;
		const marginBottom = deviceWidth * 0.034666667;

		const shadow = Object.assign({}, Theme.Core.shadow, { shadowOpacity: 0.4 });

		const iconRight = deviceWidth * 0.022666667;

		return {
			container: {
				paddingHorizontal: padding,
				paddingTop: padding,
				paddingBottom: padding * 1.65,
				width: '100%',
			},
			row: {
				flexDirection: 'row',
				alignItems: 'center',
			},
			icon: {
				marginRight: iconRight,
			},
			description: {
				fontSize: deviceWidth * 0.032,
			},
			slider: {
				track: {
					borderRadius: 13,
					height: deviceWidth * 0.034666667,
					width: width * 0.709333333,
				},
				thumb: {
					height: thumbSize,
					width: thumbSize,
					backgroundColor: '#f6f6f6',
					borderRadius: thumbSize / 2,
					...shadow,
				},
			},
			marginBottom,
			iconEditSize: deviceWidth * 0.044,
			iconEditStyle: {
				flex: 0,
				position: 'absolute',
				right: iconRight,
				padding: 5,
			},
		};
	};

}
