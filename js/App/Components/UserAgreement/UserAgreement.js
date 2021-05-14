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
import {
	TouchableOpacity,
	Modal,
	ScrollView,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { intlShape, injectIntl } from 'react-intl';
import Markdown from 'react-native-markdown-renderer';

import {
	View,
	Text,
	StyleSheet,
	PosterWithText,
	NavigationHeader,
	FullPageActivityIndicator,
	SafeAreaView,
} from '../../../BaseComponents';

import i18n from '../../Translations/common';
import {
	getEULA,
	acceptEULA,
	toggleVisibilityEula,
} from '../../Actions';
import {
	withTheme,
	PropsThemedComponent,
} from '../HOC/withTheme';
import shouldUpdate from '../../Lib/shouldUpdate';
import capitalize from '../../Lib/capitalize';
import Theme from '../../Theme';

type Props = PropsThemedComponent & {
	showModal: boolean,
	intl: intlShape,
	onLayout: (Object) => void,
	appLayout: Object,
	getEULA: any,
	acceptEULA: any,
	visibilityEula: boolean,
	toggleVisibilityEula: Function,
};

type State = {
	eulaContent: string | null,
	eulaVersion: number | null,
	isLoading: boolean,
};

class UserAgreement extends View<Props, State> {
	props: Props;
	onAgree: () => void;

	state: State = {
		eulaContent: null,
		eulaVersion: null,
		isLoading: true,
	};

	constructor(props: Props) {
		super(props);
		let { formatMessage } = this.props.intl;
		this.eula = formatMessage(i18n.eula);
		this.header = capitalize(formatMessage(i18n.userAgreementHeaderPhrase, {eula: this.eula}));
		this.footer = formatMessage(i18n.iAgree);

		this.onAgree = this.onAgree.bind(this);
	}

	componentDidMount() {
		const { showModal } = this.props;
		if (showModal) {
			this.getEULA();
		}
	}

	componentDidUpdate(prevProps: Object) {
		const { showModal } = this.props;
		const { eulaContent } = this.state;
		if (showModal && !eulaContent) {
			this.getEULA();
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { eulaVersion } = this.state;
		const { eulaVersion: eulaVersionN } = nextState;
		if (eulaVersion !== eulaVersionN) {
			return true;
		}

		const propsChange = shouldUpdate(this.props, nextProps, [
			'showModal',
			'appLayout',
			'visibilityEula',
		]);
		if (propsChange) {
			return true;
		}

		return false;
	}

	getEULA() {
		this.props.getEULA().then((res: Object) => {
			const { text: eulaContent, version: eulaVersion } = res;
			if (eulaContent && eulaVersion) {
				this.setState({
					eulaContent,
					eulaVersion,
					isLoading: false,
				});
			} else {
				this.setState({
					eulaContent: null,
					eulaVersion: null,
					isLoading: false,
				});
			}
		}).catch(() => {
			this.setState({
				eulaContent: null,
				eulaVersion: null,
				isLoading: false,
			});
		});
	}

	onAgree() {
		let { eulaVersion } = this.state;
		this.props.acceptEULA(eulaVersion);
		if (this.props.visibilityEula) {
			this.props.toggleVisibilityEula(false);
		}
	}

	closeEula = () => {
		this.props.toggleVisibilityEula(false);
	}

	render(): Object | null {
		const {
			showModal,
			appLayout,
			visibilityEula,
		} = this.props;
		const {
			eulaContent,
			isLoading,
		} = this.state;

		const styles = this.getStyles(appLayout);

		return (
			<Modal
				visible={showModal}
				transparent={false}
				animationType={'slide'}
				presentationStyle={'fullScreen'}
				onRequestClose={this.noOP}
				supportedOrientations={['portrait', 'landscape']}>
				<SafeAreaView onLayout={this.props.onLayout}>
					<NavigationHeader
						showLeftIcon={visibilityEula}
						leftIcon={visibilityEula ? 'close' : undefined}
						topMargin={false}
						forceHideStatus
						goBack={visibilityEula ? this.closeEula : undefined}/>
					<ScrollView
						style={styles.scrollView}
						contentContainerStyle={styles.SVContentContainerStyle}
						nestedScrollEnabled={true}>
						{!visibilityEula && <PosterWithText
							appLayout={appLayout}
							align={'center'}
							h1={this.header}
							showBackButton={false}
							showLeftIcon={false}
							h1Style={styles.headerText}
							posterCoverStyle={styles.posterCover}
							scrollableH1={false}/>
						}
						{isLoading && !eulaContent ?
							<FullPageActivityIndicator/>
							:
							<View style={styles.contentContainerStyle}>
								<Text/>
								{!!eulaContent && <Markdown style={styles.markupStyle}>
									{eulaContent}
								</Markdown>
								}
							</View>
						}
					</ScrollView>
					{!visibilityEula && <View
						level={2}
						style={styles.footer}>
						<TouchableOpacity style={styles.footerItem} onPress={this.onAgree}>
							<Text style={styles.footerText}>
								{this.footer}
							</Text>
						</TouchableOpacity>
					</View>
					}
				</SafeAreaView>
			</Modal>
		);
	}

	getStyles(appLayout: Object): Object {
		const {
			visibilityEula,
			colors,
		} = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const footerHeight = Math.floor(deviceWidth * 0.13);

		const {
			fontSizeFactorFour,
			fontSizeFactorOne,
		} = Theme.Core;
		const {
			textFive,
			inAppBrandSecondary,
		} = colors;

		return {
			posterCover: {
				paddingHorizontal: 20,
			},
			scrollView: {
				flex: 1,
				marginBottom: visibilityEula ? 0 : footerHeight,
			},
			SVContentContainerStyle: {
				flexGrow: 1,
			},
			contentContainerStyle: {
				paddingHorizontal: 15,
				paddingVertical: 20,
			},
			headerText: {
				fontSize: Math.floor(deviceWidth * fontSizeFactorOne),
				textAlign: 'center',
			},
			footer: {
				position: 'absolute',
				alignItems: 'flex-end',
				justifyContent: 'center',
				width: '100%',
				borderTopWidth: StyleSheet.hairlineWidth,
				borderTopColor: '#00000040',
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
				fontSize: Math.floor(deviceWidth * fontSizeFactorFour),
				color: inAppBrandSecondary,
				fontWeight: 'bold',
			},
			markupStyle: {
				heading: {
					color: textFive,
				},
				text: {
					color: textFive,
				},
				heading1: {
					fontSize: 28,
				},
			},
		};
	}

	noOP = () => {
		if (this.props.visibilityEula) {
			this.closeEula();
		}
	}
}

function mapDispatchToProps(dispatch: Function, ownProps: Object): Object {
	return {
		...bindActionCreators({
			getEULA,
			acceptEULA,
			toggleVisibilityEula,
		}, dispatch),
	};
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	return {
		appLayout: store.app.layout,
		visibilityEula: store.user.visibilityEula,
	};
}

export default (connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(UserAgreement))): Object);
