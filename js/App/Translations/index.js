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
import { translations } from 'live-shared-data';

// Activate languages when they have been translated.

import {addLocaleData} from 'react-intl';
// import cs from 'react-intl/locale-data/cs';
import de from 'react-intl/locale-data/de';
import en from 'react-intl/locale-data/en';
import fi from 'react-intl/locale-data/fi';
import fr from 'react-intl/locale-data/fr';
import nb from 'react-intl/locale-data/nb';
// import nl from 'react-intl/locale-data/nl';
// import pl from 'react-intl/locale-data/pl';
// import ru from 'react-intl/locale-data/ru';
import sv from 'react-intl/locale-data/sv';
// import th from 'react-intl/locale-data/th';

addLocaleData([...de, ...en, ...fi, ...fr, ...nb, ...sv]);

module.exports = {
	...translations,
};
