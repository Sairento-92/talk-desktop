/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { app, Tray, Menu, nativeTheme, dialog } = require('electron')
const { getTrayIconPath } = require('../shared/icons.utils.js')
const { createTrayIconWithBadge, clearTrayIconCache } = require('./trayBadge.utils.ts')

let isAppQuitting = false

/** @type {import('electron').Tray | null} */
let trayInstance = null

/** @type {number} */
let currentBadgeCount = 0

/**
 * Allow quitting the app if requested. It minimizes to a tray otherwise.
 */
app.on('before-quit', () => {
	isAppQuitting = true
})

/**
 * Update the tray icon with the current badge count
 */
async function refreshTrayIcon() {
	if (!trayInstance) {
		return
	}

	try {
		const iconPath = getTrayIconPath()
		if (currentBadgeCount <= 0) {
			trayInstance.setImage(iconPath)
		} else {
			const icon = await createTrayIconWithBadge(iconPath, currentBadgeCount)
			trayInstance.setImage(icon)
		}
	} catch (error) {
		console.error('Failed to update tray icon with badge:', error)
	}
}

/**
 * Update the tray badge count
 *
 * @param {number} count - Number of unread messages (0 to hide badge)
 */
async function updateTrayBadge(count) {
	currentBadgeCount = count
	await refreshTrayIcon()
}

/**
 * Setup tray with an icon that provides a context menu.
 *
 * @param {import('electron').BrowserWindow} browserWindow Browser window, associated with the tray
 * @return {import('electron').Tray} Tray instance
 */
function setupTray(browserWindow) {
	const iconPath = getTrayIconPath()
	trayInstance = new Tray(iconPath)
	trayInstance.setToolTip(app.name)
	trayInstance.setContextMenu(Menu.buildFromTemplate([
		{
			label: 'Open',
			click: () => browserWindow.show(),
		},
		{
			role: 'quit',
		},
	]))
	trayInstance.on('click', () => browserWindow.show())

	// Refresh icon when theme changes (for monochrome icon support)
	nativeTheme.on('updated', () => {
		clearTrayIconCache()
		refreshTrayIcon()
	})

	browserWindow.on('close', async (event) => {
		if (isAppQuitting) {
			return
		}

		event.preventDefault()

		// Fix Issue #2003: Check if user is in an active call before hiding to tray
		try {
			const isInCall = await browserWindow.webContents.executeJavaScript(
				'!!(document.querySelector(".incall, .video-container, .hangup, [data-call-active=\'true\']") || (window.location.hash.includes("/call/") && !window.location.hash.endsWith("/call/")))',
				true
			)

			if (isInCall) {
				const choice = dialog.showMessageBoxSync(browserWindow, {
					type: 'warning',
					buttons: ['Opuść rozmowę', 'Kontynuuj w tle', 'Anuluj'],
					defaultId: 0,
					cancelId: 2,
					title: 'Aktywne połączenie',
					message: 'Nadal uczestniczysz w aktywnej rozmowie głosowej/wideo w Nextcloud Talk.',
					detail: 'Czy chcesz opuścić rozmowę przed zminimalizowaniem aplikacji do paska zadań?'
				})

				if (choice === 0) {
					// Leave call
					await browserWindow.webContents.executeJavaScript(
						'document.querySelector(".leave-call-button, [data-leave-call], .hangup, button[aria-label*=\'Leave\'], button[aria-label*=\'Opuść\']")?.click()',
						true
					).catch(() => {})
					browserWindow.hide()
				} else if (choice === 1) {
					// Continue in background
					browserWindow.hide()
				}
				// If choice === 2 (Cancel), do nothing, keep window open
				return
			}
		} catch (err) {
			console.warn('[TrayClose] Could not check in-call status:', err)
		}

		browserWindow.hide()
	})

	browserWindow.on('closed', () => {
		if (trayInstance) {
			trayInstance.destroy()
			trayInstance = null
		}
	})

	return trayInstance
}

module.exports = {
	setupTray,
	updateTrayBadge,
}
