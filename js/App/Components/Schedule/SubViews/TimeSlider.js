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

import {
	IconTelldus,
	View,
	ThemedMaterialIcon,
} from '../../../../BaseComponents';
import Theme from '../../../Theme';
import Description from './Description';
import TimeField from './TimeField';
import { TouchableOpacity } from 'react-native';

import {
	withTheme,
	PropsThemedComponent,
} from '../../HOC/withTheme';

type Props = PropsThemedComponent & {
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
	autoFocus?: boolean,
};

type State = {
	value: number,
	isEditing: boolean,
};

class TimeSlider extends View<null, Props, State> {

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
	onFocus: () => void;

	input: any;

	setRef: (any) => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			value: typeof props.value === 'number' ? props.value : props.minimumValue,
			isEditing: false,
		};

		this.onEdit = this.onEdit.bind(this);
		this.onEndEdit = this.onEndEdit.bind(this);
		this.onFocus = this.onFocus.bind(this);

		this.input = null;

		this.setRef = this.setRef.bind(this);
	}

	onEdit() {
		const { toggleEdit, type } = this.props;
		this.setState({
			isEditing: true,
		});
		if (toggleEdit && type) {
			toggleEdit(type);
		}
		if (this.input) {
			this.input.focus();
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
		if (this.input) {
			this.input.blur();
		}
	}

	onValueChange = (value: number) => {
		this.setState({ value });
		this.props.onValueChange(value);
	};

	onFocus = () => {
		this.setState({
			isEditing: true,
		});
	}

	setRef = (ref: any) => {
		this.input = ref;
	}

	onSubmitEditing = () => {
		this.setState({
			isEditing: false,
		});
	}

	render(): React$Element<any> {
		const { description, icon, appLayout, intl, minimumValue, maximumValue, autoFocus } = this.props;
		const { value, isEditing } = this.state;
		const {
			container,
			row,
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
						},
					]}
				>
					<IconTelldus icon={icon} style={iconStyle}/>
					<Description style={descriptionStyle} appLayout={appLayout}>{description}</Description>
					{isEditing ?
						<TouchableOpacity onPress={this.onEndEdit} style={iconEditStyle}>
							<IconTelldus icon={'checkmark'} size={iconEditSize} level={23}/>
						</TouchableOpacity>
						:
						<TouchableOpacity onPress={this.onEdit} style={iconEditStyle}>
							<ThemedMaterialIcon name={'edit'} size={iconEditSize} level={23}/>
						</TouchableOpacity>
					}
				</View>
				<View style={[row, { justifyContent: 'center' }]}>
					<TimeField
						appLayout={appLayout}
						value={value.toString()}
						intl={intl}
						icon={icon}
						min={minimumValue}
						max={maximumValue}
						onValueChange={this.onValueChange}
						onFocus={this.onFocus}
						autoFocus={autoFocus}
						setRef={this.setRef}
						onSubmitEditing={this.onSubmitEditing}/>
				</View>
			</View>
		);
	}

	_getStyle = (appLayout: Object): Object => {
		const {
			colors,
		} = this.props;
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
				padding: padding,
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
				color: colors.textFive,
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

export default (withTheme(TimeSlider): Object);
