/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { app, clipboard, Menu } = require('electron')
const { isExternalUrl } = require('./utils.ts')

const translations = {
	pl: {
		addToDictionary: 'Dodaj do słownika',
		copyImage: 'Kopiuj obraz',
		saveImage: 'Zapisz obraz jako...',
		copyLinkAddress: 'Kopiuj adres linku',
		copyLinkText: 'Kopiuj tekst linku',
		copyEmailAddress: 'Kopiuj adres e-mail',
		copy: 'Kopiuj',
		cut: 'Wytnij',
		paste: 'Wklej',
		selectAll: 'Zaznacz wszystko',
		inspectElement: 'Zbadaj element',
	},
	de: {
		addToDictionary: 'Zum Wörterbuch hinzufügen',
		copyImage: 'Bild kopieren',
		saveImage: 'Bild speichern als...',
		copyLinkAddress: 'Link-Adresse kopieren',
		copyLinkText: 'Link-Text kopieren',
		copyEmailAddress: 'E-Mail-Adresse kopieren',
		copy: 'Kopieren',
		cut: 'Ausschneiden',
		paste: 'Einfügen',
		selectAll: 'Alles auswählen',
		inspectElement: 'Element untersuchen',
	},
	fr: {
		addToDictionary: 'Ajouter au dictionnaire',
		copyImage: 'Copier l\'image',
		saveImage: 'Enregistrer l\'image sous...',
		copyLinkAddress: 'Copier l\'adresse du lien',
		copyLinkText: 'Copier le texte du lien',
		copyEmailAddress: 'Copier l\'adresse e-mail',
		copy: 'Copier',
		cut: 'Couper',
		paste: 'Coller',
		selectAll: 'Tout sélectionner',
		inspectElement: 'Inspecter l\'élément',
	},
	es: {
		addToDictionary: 'Añadir al diccionario',
		copyImage: 'Copiar imagen',
		saveImage: 'Guardar imagen como...',
		copyLinkAddress: 'Copiar dirección del enlace',
		copyLinkText: 'Copiar texto del enlace',
		copyEmailAddress: 'Copiar dirección de correo electrónico',
		copy: 'Copiar',
		cut: 'Cortar',
		paste: 'Pegar',
		selectAll: 'Seleccionar todo',
		inspectElement: 'Inspeccionar elemento',
	},
	en: {
		addToDictionary: 'Add to dictionary',
		copyImage: 'Copy image',
		saveImage: 'Save image as...',
		copyLinkAddress: 'Copy link address',
		copyLinkText: 'Copy link text',
		copyEmailAddress: 'Copy email address',
		copy: 'Copy',
		cut: 'Cut',
		paste: 'Paste',
		selectAll: 'Select all',
		inspectElement: 'Inspect element',
	},
}

function getI18n() {
	const lang = (app.getLocale() || 'en').split('-')[0].toLowerCase()
	return translations[lang] || translations.en
}

/**
 * Enable context menu by right click (Fix Issue #1887: localized context menu)
 *
 * @param {import('electron').BrowserWindow} browserWindow - Browser window
 */
export function applyContextMenu(browserWindow) {
	browserWindow.webContents.on('context-menu', (event, params) => {
		const t = getI18n()
		const menuItems = []

		// Add context actions for misspelling words and typos
		const menuMisspellingItems = [
			...params.dictionarySuggestions.map((suggestion) => ({
				label: suggestion,
				click: () => browserWindow.webContents.replaceMisspelling(suggestion),
			})),
			{ type: 'separator' },
			{
				label: t.addToDictionary,
				click: () => browserWindow.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord),
			},
			{ type: 'separator' },
		]
		if (params.misspelledWord) {
			menuItems.push(...menuMisspellingItems)
		}

		// Add context actions for handling images
		const menuImageItems = [
			{
				label: t.copyImage,
				click: () => browserWindow.webContents.copyImageAt(params.x, params.y),
			},
			{
				label: t.saveImage,
				click: () => browserWindow.webContents.downloadURL(params.srcURL),
			},
			{ type: 'separator' },
		]
		if (params.hasImageContents) {
			menuItems.push(...menuImageItems)
		}

		// Add context actions for handling links
		if (params.linkURL && isExternalUrl(params.linkURL)) {
			const url = params.linkURL
			const text = params.linkText.trim()
			menuItems.push({
				label: t.copyLinkAddress,
				click: () => clipboard.writeText(url),
			})
			if (text) {
				menuItems.push({
					label: t.copyLinkText,
					click: () => clipboard.writeText(text),
				})
			}
			if (url.startsWith('mailto:')) {
				menuItems.push({
					label: t.copyEmailAddress,
					click: () => clipboard.writeText(url.slice('mailto:'.length)),
				})
			}
			menuItems.push({ type: 'separator' })
		}

		// Add context actions for clipboard events and text editing
		const menuClipboardItems = [
			{
				label: t.copy,
				role: 'copy',
				enabled: params.selectionText && params.editFlags.canCopy,
			},
			{
				label: t.cut,
				role: 'cut',
				enabled: params.selectionText && params.isEditable && params.editFlags.canCut,
				visible: params.isEditable,
			},
			{
				label: t.selectAll,
				role: 'selectAll',
				enabled: params.editFlags.canSelectAll,
			},
			{
				label: t.paste,
				role: 'paste',
				enabled: params.isEditable && params.editFlags.canPaste,
				visible: params.isEditable,
			},
			{ type: 'separator' },
		]
		if (params.isEditable || params.selectionText.length) {
			menuItems.push(...menuClipboardItems)
		}

		// DevTools toggle
		menuItems.push({
			label: t.inspectElement,
			role: 'toggleDevTools',
		})

		Menu.buildFromTemplate(menuItems).popup()
	})
}
