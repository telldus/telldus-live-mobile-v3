// translationRunner.js
const manageTranslations = require('react-intl-translations-manager').default;

// es2015 import
// import manageTranslations from 'react-intl-translations-manager';

manageTranslations({
	messagesDirectory: 'build/messages',
	translationsDirectory: 'js/App/Translations/',
	languages: ['en'],
});
