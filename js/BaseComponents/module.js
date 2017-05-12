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
 * @providesModule BaseComponents
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
import FormattedNumber from './FormattedNumber';
import Switch from './Switch';
import Picker from './Picker';
import List from './List';
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
import { Col, Row, Grid } from 'react-native-easy-grid';
import ScrollableTabView from './Tabs';
import NavigatorIOS from './NavigatorIOS';
import I18n from './I18n';
import Gravatar from './Gravatar';

import {
	AppState,
	Dimensions,
	PixelRatio,
	StatusBar,
	StyleSheet,
	TabBarIOS,
	ListView,
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
	FormattedNumber: FormattedNumber,
	Text: Text,
	Switch: Switch,
	Picker: Picker,
	List: List,
	ListItem: ListItem,
	CardItem: CardItem,
	H1: H1,
	H2: H2,
	H3: H3,
	View: View,
	RoundedCornerShadowView: RoundedCornerShadowView,
	Row: Row,
	Col: Col,
	Grid: Grid,
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
	Tabs: ScrollableTabView,

	AppState: AppState,
	Dimensions: Dimensions,
	NavigatorIOS: NavigatorIOS,
	PixelRatio: PixelRatio,
	StatusBar: StatusBar,
	StyleSheet: StyleSheet,
	TabBarIOS: TabBarIOS,
	Gravatar: Gravatar,
	ListDataSource: ListView.DataSource,
	Image: Image,
	I18n: I18n,
};
