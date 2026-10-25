/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { onBeforeUnmount } from 'vue'

/**
 * Handle media actions (toggle, mute, unmute)
 */
export function handleMediaAction(action: 'toggle' | 'mute' | 'unmute') {
	// Query local audio control button inside Talk's call interface
	const audioBtn = document.querySelector(
		'.local-audio-control-wrapper button, .audio-control-button, [aria-label*="audio" i], [aria-label*="mikrofon" i]'
	) as HTMLButtonElement | null

	if (audioBtn) {
		const ariaLabel = (audioBtn.getAttribute('aria-label') || '').toLowerCase()
		// When muted, button typically says "Unmute audio" / "Włącz dźwięk" / "Włącz mikrofon"
		const isMuted = ariaLabel.includes('unmute') || ariaLabel.includes('włącz') || ariaLabel.includes('enable')
		const isUnmuted = !isMuted

		if (action === 'toggle') {
			audioBtn.click()
			return
		}

		if (action === 'unmute' && isMuted) {
			audioBtn.click()
			return
		}

		if (action === 'mute' && isUnmuted) {
			audioBtn.click()
			return
		}
	} else {
		// Fallback to dispatching Talk's default shortcut 'm'
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', code: 'KeyM', bubbles: true }))
		window.dispatchEvent(new KeyboardEvent('keyup', { key: 'm', code: 'KeyM', bubbles: true }))
	}
}

/**
 * Setup media shortcuts listener from Electron main process
 */
export function useMediaShortcutsIntegration() {
	if (!window.TALK_DESKTOP?.onMediaAction) {
		return
	}

	const unsubscribe = window.TALK_DESKTOP.onMediaAction((action: 'toggle' | 'mute' | 'unmute') => {
		handleMediaAction(action)
	})

	onBeforeUnmount(() => {
		unsubscribe?.()
	})
}
