/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { BrowserWindow } from 'electron'
import { app, globalShortcut } from 'electron'
import { getAppConfig, onAppConfigChange } from './AppConfig.ts'

let activeTalkWindow: BrowserWindow | null = null
let uIOhookInstance: any = null
let isPushActive = false

/**
 * Set the target talk window for media shortcuts
 */
export function setShortcutsTargetWindow(win: BrowserWindow | null) {
	activeTalkWindow = win
}

/**
 * Send media action to talk window
 */
function sendAction(action: 'toggle' | 'mute' | 'unmute') {
	if (!activeTalkWindow || activeTalkWindow.isDestroyed()) {
		return
	}
	activeTalkWindow.webContents.send('talk:media:action', action)
}

/**
 * Setup global media shortcuts (Push-To-Talk and Toggle Mute)
 */
export function setupGlobalShortcuts(talkWindow: BrowserWindow) {
	setShortcutsTargetWindow(talkWindow)

	// Try loading uIOhook for advanced Push-To-Talk (keydown + keyup)
	try {
		const { uIOhook, UiohookKey } = require('uiohook-napi')
		uIOhookInstance = uIOhook
	} catch (e) {
		console.warn('uiohook-napi could not be loaded, falling back to electron globalShortcut:', e)
	}

	registerShortcuts()

	// Re-register shortcuts when config changes
	onAppConfigChange('pttEnabled', () => registerShortcuts())
	onAppConfigChange('pttMode', () => registerShortcuts())
	onAppConfigChange('pttShortcut', () => registerShortcuts())

	talkWindow.on('closed', () => {
		cleanupShortcuts()
		activeTalkWindow = null
	})

	app.on('will-quit', () => {
		cleanupShortcuts()
	})
}

/**
 * Unregister all active shortcuts and listeners
 */
function cleanupShortcuts() {
	globalShortcut.unregisterAll()

	if (uIOhookInstance) {
		try {
			uIOhookInstance.removeAllListeners()
			uIOhookInstance.stop()
		} catch {
			// ignore if already stopped
		}
	}
	isPushActive = false
}

/**
 * Register configured shortcut according to mode
 */
function registerShortcuts() {
	cleanupShortcuts()

	const enabled = getAppConfig('pttEnabled') ?? true
	if (!enabled) {
		return
	}

	const mode = getAppConfig('pttMode') ?? 'toggle'
	const shortcut = getAppConfig('pttShortcut') || 'Control+Shift+M'

	if (mode === 'push' && uIOhookInstance) {
		// Use uIOhook for true push-to-talk (hold to talk, release to mute)
		try {
			// Map common shortcut strings to uiohook keycodes
			const targetKeyCode = mapShortcutToUiohookKey(shortcut)

			uIOhookInstance.on('keydown', (e: { keycode: number }) => {
				if (e.keycode === targetKeyCode && !isPushActive) {
					isPushActive = true
					sendAction('unmute')
				}
			})

			uIOhookInstance.on('keyup', (e: { keycode: number }) => {
				if (e.keycode === targetKeyCode && isPushActive) {
					isPushActive = false
					sendAction('mute')
				}
			})

			uIOhookInstance.start()
			console.log(`Push-To-Talk registered with keycode ${targetKeyCode}`)
			return
		} catch (err) {
			console.error('Failed to initialize uIOhook for Push-to-Talk:', err)
		}
	}

	// Default / Fallback: Global Toggle Mute using Electron globalShortcut
	try {
		const registered = globalShortcut.register(shortcut, () => {
			sendAction('toggle')
		})

		if (!registered) {
			console.warn(`Failed to register global shortcut: ${shortcut}`)
		} else {
			console.log(`Global Toggle Mute registered with shortcut: ${shortcut}`)
		}
	} catch (err) {
		console.error(`Error registering global shortcut ${shortcut}:`, err)
	}
}

/**
 * Maps common key names to uiohook keycodes
 */
function mapShortcutToUiohookKey(keyName: string): number {
	const keyLower = keyName.toLowerCase()
	// Common uiohook keycodes:
	// Space = 57, CapsLock = 58, F8 = 66, F13 = 100, Mouse4 = mouse events
	if (keyLower.includes('caps') || keyLower.includes('capslock')) return 58
	if (keyLower.includes('f8')) return 66
	if (keyLower.includes('f9')) return 67
	if (keyLower.includes('f10')) return 68
	if (keyLower.includes('f11')) return 87
	if (keyLower.includes('f12')) return 88
	if (keyLower.includes('space')) return 57
	if (keyLower.includes('alt')) return 56
	if (keyLower.includes('ctrl') || keyLower.includes('control')) return 29
	// Default to CapsLock (keycode 58) for PTT
	return 58
}
