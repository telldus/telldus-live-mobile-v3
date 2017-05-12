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

'use strict';

let LABEL_COLOR = '#ffffff';
let INPUT_COLOR = '#ffffff';
let ERROR_COLOR = '#a94442';
let HELP_COLOR = '#999999';
let BORDER_COLOR = '#cccccc';
let DISABLED_COLOR = '#777777';
let DISABLED_BACKGROUND_COLOR = '#eeeeee';
let FONT_SIZE = 12;
let FONT_WEIGHT = '500';

let stylesheet = Object.freeze({
	fieldset: {},
    // the style applied to the container of all inputs
	formGroup: {
		normal: {
			marginBottom: 10,
		},
		error: {
			marginBottom: 10,
		},
	},
	controlLabel: {
		normal: {
			color: LABEL_COLOR,
			fontSize: FONT_SIZE,
			marginBottom: 7,
			fontWeight: FONT_WEIGHT,
		},
        // the style applied when a validation error occours
		error: {
			color: ERROR_COLOR,
			fontSize: FONT_SIZE,
			marginBottom: 7,
			fontWeight: FONT_WEIGHT,
		},
	},
	helpBlock: {
		normal: {
			color: HELP_COLOR,
			fontSize: FONT_SIZE,
			marginBottom: 2,
		},
        // the style applied when a validation error occours
		error: {
			color: HELP_COLOR,
			fontSize: FONT_SIZE,
			marginBottom: 2,
		},
	},
	errorBlock: {
		fontSize: FONT_SIZE,
		marginBottom: 2,
		color: ERROR_COLOR,
	},
	textboxView: {
		normal: {
		},
		error: {
		},
		notEditable: {
		},
	},
	textbox: {
		normal: {
			color: INPUT_COLOR,
			fontSize: FONT_SIZE,
			height: 36,
			padding: 6,
			minWidth: 150,
			borderRadius: 4,
			borderColor: BORDER_COLOR,
			borderWidth: 1,
			marginBottom: 5,
		},
        // the style applied when a validation error occours
		error: {
			color: INPUT_COLOR,
			fontSize: FONT_SIZE,
			height: 36,
			padding: 6,
			minWidth: 150,
			borderRadius: 4,
			borderColor: ERROR_COLOR,
			borderWidth: 1,
			marginBottom: 5,
		},
        // the style applied when the textbox is not editable
		notEditable: {
			fontSize: FONT_SIZE,
			height: 36,
			padding: 6,
			minWidth: 150,
			borderRadius: 4,
			borderColor: BORDER_COLOR,
			borderWidth: 1,
			marginBottom: 5,
			color: DISABLED_COLOR,
			backgroundColor: DISABLED_BACKGROUND_COLOR,
		},
	},
	checkbox: {
		normal: {
			marginBottom: 4,
		},
        // the style applied when a validation error occours
		error: {
			marginBottom: 4,
		},
	},
	select: {
		normal: {
			marginBottom: 4,
		},
        // the style applied when a validation error occours
		error: {
			marginBottom: 4,
		},
	},
	pickerTouchable: {
		normal: {
			height: 44,
			flexDirection: 'row',
			alignItems: 'center',
		},
		error: {
			height: 44,
			flexDirection: 'row',
			alignItems: 'center',
		},
	},
	pickerValue: {
		normal: {
			fontSize: FONT_SIZE,
			paddingLeft: 7,
		},
		error: {
			fontSize: FONT_SIZE,
			paddingLeft: 7,
		},
	},
	datepicker: {
		normal: {
			marginBottom: 4,
		},
        // the style applied when a validation error occours
		error: {
			marginBottom: 4,
		},
	},
	dateTouchable: {
		normal: {},
		error: {},
	},
	dateValue: {
		normal: {
			color: INPUT_COLOR,
			fontSize: FONT_SIZE,
			padding: 7,
			marginBottom: 5,
		},
		error: {
			color: ERROR_COLOR,
			fontSize: FONT_SIZE,
			padding: 7,
			marginBottom: 5,
		},
	},
	buttonText: {
		fontSize: 18,
		color: 'white',
		alignSelf: 'center',
	},
	button: {
		height: 36,
		backgroundColor: '#48BBEC',
		borderColor: '#48BBEC',
		borderWidth: 1,
		borderRadius: 8,
		marginBottom: 10,
		alignSelf: 'stretch',
		justifyContent: 'center',
	},
});

module.exports = stylesheet;
