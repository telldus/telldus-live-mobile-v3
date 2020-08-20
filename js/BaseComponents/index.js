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

'use strict';

import Header from './Header';
import Footer from './Footer';
import Title from './Title';
import Container from './Container';
import Content from './Content';
import BackgroundImage from './BackgroundImage';
import Button from './Button';
import Text from './Text';
import FormattedMessage from './FormattedMessage';
import FormattedDate from './FormattedDate';
import FormattedNumber from './FormattedNumber';
import FormattedTime from './FormattedTime';
import Switch from './Switch';
import ListItem from './ListItem';
import CardItem from './CardItem';
import H1 from './H1';
import H2 from './H2';
import H3 from './H3';
import View from './View';
import RoundedCornerShadowView from './RoundedCornerShadowView';
import Input from './Input';
import Textarea from './Textarea';
import InputGroup from './InputGroup';
import Icon from './Icon';
import Thumbnail from './Thumbnail';
import CheckBox from './Checkbox';
import Radio from './Radio';
import Card from './Card';
import Badge from './Badge';
import Spinner from './Spinner';
import ProgressBar from './ProgressBar';
import Gravatar from './Gravatar';
import TouchableButton from './TouchableButton';
import Modal from './Modal';
import FloatingButton from './FloatingButton';
import Slider from './Slider';
import CheckboxSolid from './CheckboxSolid';
import IconTelldus from './IconTelldus';
import BlockIcon from './BlockIcon';
import Poster from './Poster';
import Row from './Row';
import ListRow from './ListRow';
import RowWithTriangle from './RowWithTriangle';
import FullPageActivityIndicator from './FullPageActivityIndicator';
import Throbber from './Throbber';
import DialogueBox from './DialogueBox';
import RoundedInfoButton from './RoundedInfoButton';
import HeaderTitle from './HeaderTitle';
import TabBar from './TabBar';
import SafeAreaViewComponent from './SafeAreaView';
import DialogueHeader from './DialogueHeader';
import TitledInfoBlock from './TitledInfoBlock';
import CheckBoxIconText from './CheckBoxIconText';
import NavigationHeader from './NavigationHeader';
import NavigationHeaderPoster from './NavigationHeaderPoster';
import SettingsRow from './SettingsRow';
import LocationDetails from './LocationDetails';
import EditBox from './EditBox';
import FormattedRelative from './FormattedRelative';
import ProgressBarLinear from './ProgressBarLinear';
import DropDown from './DropDown';
import MainTabBarAndroid from './MainTabBarAndroid';
import MainTabsAndroid from './MainTabsAndroid';
import AttentionCatcher from './AttentionCatcher';
import Swatches from './Swatches';
import GeometricHeader from './GeometricHeader';
import PosterWithText from './PosterWithText';
import RippleButton from './RippleButton';
import HeaderLeftButtonsMainTab from './HeaderLeftButtonsMainTab';
import CampaignIcon from './CampaignIcon';
import TwoStepFooter from './TwoStepFooter';
import InfoBlock from './InfoBlock';
import TimezoneFormattedDate from './TimezoneFormattedDate';
import TimezoneFormattedTime from './TimezoneFormattedTime';
import MaterialTextInput from './MaterialTextInput';
import ScrollableNavigationHeaderPoster from './ScrollableNavigationHeaderPoster';
import EmptyView from './EmptyView';
import ActionSheet from './ActionSheet';
import CachedImage from './CachedImage';
import TransparentFullPageLoadingIndicator from './TransparentFullPageLoadingIndicator';
import MainTabBarIOS from './MainTabBarIOS';
import MainTabNavHeader from './MainTabNavHeader';
import TouchableOpacity from './TouchableOpacity';
import ThemedScrollView from './ThemedScrollView';
import ThemedImage from './ThemedImage';
import ThemedTextInput from './ThemedTextInput';
import ThemedMaterialIcon from './ThemedMaterialIcon';
import ThemedSwitch from './ThemedSwitch';
import TabBarWithTabVisibility from './TabBarWithTabVisibility';

import {
	AppState,
	Dimensions,
	PixelRatio,
	StatusBar,
	StyleSheet,
	TabBarIOS,
	Image,
} from 'react-native';

module.exports = {
	Header: Header,
	Footer: Footer,
	Title: Title,
	Container: Container,
	Content: Content,
	BackgroundImage: BackgroundImage,
	Button: Button,
	FormattedMessage: FormattedMessage,
	FormattedNumber: FormattedNumber,
	FormattedDate: FormattedDate,
	FormattedTime: FormattedTime,
	Text: Text,
	Switch: Switch,
	ListItem: ListItem,
	CardItem: CardItem,
	H1: H1,
	H2: H2,
	H3: H3,
	View: View,
	RoundedCornerShadowView: RoundedCornerShadowView,
	InputGroup: InputGroup,
	Input: Input,
	Textarea: Textarea,
	Icon: Icon,
	Thumbnail: Thumbnail,
	Card: Card,
	Badge: Badge,
	Spinner: Spinner,
	CheckBox: CheckBox,
	Radio: Radio,
	ProgressBar: ProgressBar,
	TouchableButton: TouchableButton,
	Modal: Modal,
	FloatingButton,
	Slider,
	CheckboxSolid,
	IconTelldus,
	BlockIcon,
	Poster,
	Row,
	ListRow,
	RowWithTriangle,
	FullPageActivityIndicator,
	Throbber,
	DialogueBox,
	RoundedInfoButton: RoundedInfoButton,
	HeaderTitle: HeaderTitle,
	SafeAreaView: SafeAreaViewComponent,
	TabBar,
	DialogueHeader,
	TitledInfoBlock,
	CheckBoxIconText,
	NavigationHeader,
	NavigationHeaderPoster,
	SettingsRow,
	LocationDetails,
	EditBox,
	FormattedRelative,
	ProgressBarLinear,
	DropDown,
	MainTabBarAndroid,
	MainTabsAndroid,
	AttentionCatcher,
	Swatches,
	GeometricHeader,
	PosterWithText,
	RippleButton,
	HeaderLeftButtonsMainTab,
	CampaignIcon,
	TwoStepFooter,
	InfoBlock,
	TimezoneFormattedTime,
	TimezoneFormattedDate,
	MaterialTextInput,
	ScrollableNavigationHeaderPoster,
	EmptyView,
	ActionSheet,
	CachedImage,
	TransparentFullPageLoadingIndicator,
	MainTabBarIOS,
	MainTabNavHeader,
	TabBarWithTabVisibility,

	AppState,
	Dimensions,
	PixelRatio,
	StatusBar,
	StyleSheet,
	TabBarIOS,
	Gravatar,
	Image,
	TouchableOpacity,

	ThemedScrollView,
	ThemedImage,
	ThemedTextInput,
	ThemedMaterialIcon,
	ThemedSwitch,
};
