/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
	if (!audioCtx) {
		const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
		audioCtx = new AudioContextClass()
	}
	if (audioCtx.state === 'suspended') {
		audioCtx.resume().catch(() => {})
	}
	return audioCtx
}

/**
 * Play pleasant synthesizer audio chime on mute/unmute
 */
export async function playMuteChime(isMuted: boolean) {
	try {
		// Check config
		if (window.TALK_DESKTOP?.getAppConfig) {
			const enabled = await window.TALK_DESKTOP.getAppConfig('enableAudioCues')
			if (enabled === false) {
				return
			}
		}

		const ctx = getAudioContext()
		const now = ctx.currentTime

		const osc = ctx.createOscillator()
		const gain = ctx.createGain()
		osc.type = 'sine'

		if (isMuted) {
			// Descending chime: G5 (784 Hz) -> E5 (659 Hz) -> C5 (523 Hz)
			osc.frequency.setValueAtTime(783.99, now)
			osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.12)
			gain.gain.setValueAtTime(0.06, now)
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)
			osc.connect(gain)
			gain.connect(ctx.destination)
			osc.start(now)
			osc.stop(now + 0.16)
		} else {
			// Ascending chime: C5 (523 Hz) -> E5 (659 Hz) -> G5 (784 Hz)
			osc.frequency.setValueAtTime(523.25, now)
			osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12)
			gain.gain.setValueAtTime(0.06, now)
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)
			osc.connect(gain)
			gain.connect(ctx.destination)
			osc.start(now)
			osc.stop(now + 0.16)
		}
	} catch (e) {
		// AudioContext error fallback
	}
}

let lastMuteState: boolean | null = null

/**
 * Observe audio button DOM changes to play chimes automatically on mute toggle
 */
export function setupAudioCuesListener() {
	function checkMuteState() {
		const audioBtn = document.querySelector(
			'.local-audio-control-wrapper button, .audio-control-button, [aria-label*="audio" i], [aria-label*="mikrofon" i]'
		) as HTMLButtonElement | null

		if (!audioBtn) {
			lastMuteState = null
			return
		}

		const ariaLabel = (audioBtn.getAttribute('aria-label') || '').toLowerCase()
		const isMuted = ariaLabel.includes('unmute') || ariaLabel.includes('włącz') || ariaLabel.includes('enable')

		if (lastMuteState !== null && lastMuteState !== isMuted) {
			playMuteChime(isMuted)
		}
		lastMuteState = isMuted
	}

	setInterval(checkMuteState, 400)
}
