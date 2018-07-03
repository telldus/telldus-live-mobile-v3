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

import React from 'react';
import { TouchableOpacity, Modal, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { intlShape, injectIntl } from 'react-intl';
import { SafeAreaView } from 'react-navigation'; // Using SafeAreaView from react-navigation, this fix issue https://github.com/facebook/react-native/issues/18177.
import { ifIphoneX, isIphoneX } from 'react-native-iphone-x-helper';
import Markdown from 'react-native-markdown-renderer';

import { View, Text, StyleSheet, Poster, NavigationHeader } from '../../../BaseComponents';
import Theme from '../../Theme';
import i18n from '../../Translations/common';
import {
	getEULA,
	acceptEULA,
} from '../../Actions';

const ViewX = isIphoneX() ? SafeAreaView : View;

type Props = {
	showModal: boolean,
	intl: intlShape,
	onLayout: (Object) => void,
	appLayout: Object,
	getEULA: any,
	acceptEULA: any,
};

type State = {
	eulaContent: string | null,
	eulaVersion: number | null,
};

class UserAgreement extends View<Props, State> {
	props: Props;
	onAgree: () => void;

	state: State = {
		eulaContent: null,
		eulaVersion: null,
	};

	constructor(props: Props) {
		super(props);
		let { formatMessage } = this.props.intl;
		this.eula = formatMessage(i18n.eula);
		this.header = formatMessage(i18n.userAgreementHeaderPhrase, {eula: this.eula});
		this.footer = formatMessage(i18n.iAgree).toUpperCase();

		this.onAgree = this.onAgree.bind(this);
	}

	componentDidMount() {
		this.props.getEULA().then((res: Object) => {
			const { text: eulaContent, version: eulaVersion } = res;
			if (eulaContent && eulaVersion) {
				this.setState({
					eulaContent,
					eulaVersion,
				});
			} else {
				this.setState({
					eulaContent: null,
					eulaVersion: null,
				});
			}
		}).catch(() => {
			this.setState({
				eulaContent: null,
				eulaVersion: null,
			});
		});
	}

	onAgree() {
		let { eulaVersion } = this.state;
		this.props.acceptEULA(eulaVersion);
	}

	render(): Object | null {
		const { showModal, appLayout } = this.props;
		const { eulaContent } = this.state;

		if (!eulaContent) {
			return null;
		}

		const styles = this.getStyles(appLayout);

		return (
			<Modal
				visible={showModal}
				transparent={false}
				animationType={'slide'}
				presentationStyle={'fullScreen'}
				onRequestClose={this.noOP}
				supportedOrientations={['portrait', 'landscape']}>
				<ViewX style={{ ...ifIphoneX({ flex: 1, backgroundColor: Theme.Core.brandPrimary }, { flex: 1 }) }}>
					<View style={styles.modalContainer} onLayout={this.props.onLayout}>
						<NavigationHeader showLeftIcon={false} topMargin={false}/>
						<ScrollView
							style={styles.scrollView}
							contentContainerStyle={styles.SVContentContainerStyle}>
							<Poster>
								<View style={styles.posterItems}>
									<Text style={styles.headerText}>
										{this.header}
									</Text>
								</View>
							</Poster>
							<View style={styles.contentContainerStyle}>
								<Text/>
								<Markdown style={styles.markupStyle}>
									{eulaContent}
								</Markdown>
							</View>
						</ScrollView>
						<View style={styles.footer}>
							<TouchableOpacity style={styles.footerItem} onPress={this.onAgree}>
								<Text style={styles.footerText}>
									{this.footer}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ViewX>
			</Modal>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const footerHeight = Math.floor(deviceWidth * 0.13);

		return {
			modalContainer: {
				flex: 1,
				backgroundColor: '#fff',
			},
			posterItems: {
				position: 'absolute',
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				alignItems: 'center',
				justifyContent: 'center',
				paddingHorizontal: 20,
			},
			scrollView: {
				flex: 1,
				marginBottom: footerHeight,
			},
			SVContentContainerStyle: {
				flexGrow: 1,
			},
			contentContainerStyle: {
				paddingHorizontal: 15,
				paddingVertical: 20,
			},
			headerText: {
				fontSize: Math.floor(deviceWidth * 0.047),
				color: '#fff',
				textAlign: 'center',
			},
			footer: {
				position: 'absolute',
				alignItems: 'flex-end',
				justifyContent: 'center',
				width: '100%',
				borderTopWidth: StyleSheet.hairlineWidth,
				borderTopColor: '#00000040',
				backgroundColor: '#FAFAFA',
				height: footerHeight,
				maxHeight: 100,
				bottom: 0,
			},
			footerItem: {
				padding: 10,
				alignItems: 'center',
				justifyContent: 'center',
			},
			footerText: {
				fontSize: Math.floor(deviceWidth * 0.04),
				color: Theme.Core.brandSecondary,
				fontWeight: 'bold',
			},
			markupStyle: {
				heading: {
					color: Theme.Core.eulaContentColor,
				},
				text: {
					color: Theme.Core.eulaContentColor,
				},
				heading1: {
					fontSize: 28,
				},
			},
		};
	}

	noOP() {
	}
}

function mapDispatchToProps(dispatch: Function, ownProps: Object): Object {
	return {
		...bindActionCreators({ getEULA, acceptEULA }, dispatch),
	};
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	return {
		appLayout: store.App.layout,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(UserAgreement));
