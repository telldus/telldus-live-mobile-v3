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
	useEffect,
	useCallback,
	useState,
} from 'react';
import {
	useDispatch,
} from 'react-redux';
import { useIntl } from 'react-intl';
import {
	useSelector,
} from 'react-redux';

import {
	ThemedScrollView,
	TouchableButton,
} from '../../../BaseComponents';
import {
	EditEventNameBlock,
	EventActiveSwichBlock,
	EventAdvancedSettingsBlock,
	EventConditionsBlock,
	EventTriggersBlock,
	EventActionsBlock,
} from './SubViews';

import {
	useDialogueBox,
} from '../../Hooks/Dialoguebox';
import {
	useAppTheme,
} from '../../Hooks/Theme';
import {
	setEvent,
	getEvents,
	setEventDeviceTrigger,
} from '../../Actions/Events';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

type Props = {
	navigation: Object,
	appLayout: Object,
	onDidMount: (string, string, ?string) => void,
};

const EditEvent = React.memo<Object>((props: Props): Object => {
	const {
		navigation,
		appLayout,
		onDidMount,
	} = props;

	const {
		colors,
	} = useAppTheme();
	const {
		description,
		id,
		group = '',
		minRepeatInterval,
		active,
		trigger,
	} = useSelector((state: Object): Object => state.event) || {};

	const [isDeleting, setIsDeleting] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	useEffect(() => {
		onDidMount('Event settings', description); // TODO: Translate
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const dispatch = useDispatch();

	const closeDialogue = useCallback(() => {
		toggleDialogueBoxState({
			show: false,
		});
	}, [toggleDialogueBoxState]);

	const onSaveEvent = useCallback(() => {
		(async () => {
			setIsSaving(true);
			const promises = [
				dispatch(setEvent(id, {
					description,
					group,
					minRepeatInterval,
					active: active ? 1 : 0,
				})),
			];
			trigger.forEach((t: Object) => {
				const {
					id: _id,
					eventId,
					deviceId,
					method,
					local,
				} = t;
				if (local) {
					promises.push(dispatch(setEventDeviceTrigger({
						id: _id,
						eventId,
						deviceId,
						method,
					})));
				}
			});

			try {
				await Promise.all(promises.map((promise: Promise<any>): Promise<any> => {
					return promise.then((res: Object): Object => {
						return res;
					}).catch((err: Object): Object => {
						return err;
					});
				}));
				setIsSaving(false);
				navigation.popToTop();
			} catch {
				toggleDialogueBoxState({
					show: true,
					showHeader: true,
					showPositive: true,
					onPressPositive: () => {
						closeDialogue();
						setIsSaving(false);
					},
					showBackground: true,
					text: 'Some settings could not be saved. Please try again.',
				});
			} finally {
				dispatch(getEvents());
			}
		})();
	}, [active, closeDialogue, description, dispatch, group, id, minRepeatInterval, navigation, toggleDialogueBoxState, trigger]);

	const onDeleteEvent = useCallback(() => {
		toggleDialogueBoxState({
			show: true,
			showHeader: true,
			header: `${formatMessage(i18n.delete)}?`,
			showPositive: true,
			showNegative: true,
			positiveText: formatMessage(i18n.delete),
			onPressPositive: () => {
				closeDialogue();
				setIsDeleting(true);
			},
			onPressNegative: () => {
				closeDialogue();
				setIsDeleting(false);
			},
			showBackground: true,
			text: 'You sure that you want to delete this event?',
		});
	}, [closeDialogue, formatMessage, toggleDialogueBoxState]);

	const {
		container,
		contentContainerStyle,
		buttonStyle,
		save,
		labelStyle,
	} = getStyles({
		appLayout,
		colors,
	});

	const disable = false;

	return (
		<ThemedScrollView
			level={3}
			style={container}
			contentContainerStyle={contentContainerStyle}>
			<EditEventNameBlock
				description={description}
				toggleDialogueBox={toggleDialogueBoxState}/>
			<EventActiveSwichBlock
				value={active}/>
			<EventAdvancedSettingsBlock
				minRepeatInterval={minRepeatInterval}
				toggleDialogueBox={toggleDialogueBoxState}/>
			<EventTriggersBlock
				navigation={navigation}/>
			<EventConditionsBlock
				navigation={navigation}/>
			<EventActionsBlock
				navigation={navigation}/>
			<TouchableButton
				text={i18n.confirmAndSave}
				style={[buttonStyle, save]}
				labelStyle={labelStyle}
				onPress={onSaveEvent}
				accessible={true}
				disabled={disable}
				showThrobber={isSaving}
			/>
			<TouchableButton
				text={i18n.delete}
				style={buttonStyle}
				buttonLevel={isDeleting ? undefined : 10}
				labelStyle={labelStyle}
				onPress={onDeleteEvent}
				accessible={true}
				disabled={disable}
				showThrobber={isDeleting}
			/>
		</ThemedScrollView>
	);
});

const getStyles = ({
	appLayout,
	colors,
}: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const fontSizeButtonLabel = deviceWidth * 0.033;

	return {
		container: {
			flex: 1,
		},
		contentContainerStyle: {
			flexGrow: 1,
			paddingVertical: padding,
			justifyContent: 'center',
		},
		buttonStyle: {
			maxWidth: undefined,
			marginTop: padding,
			...shadow,
		},
		save: {
			marginTop: padding,
		},
		labelStyle: {
			fontSize: fontSizeButtonLabel,
		},
	};
};

export default EditEvent;
