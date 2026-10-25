/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

let activePipWindow: any = null
let callTimerInterval: any = null
let callStartTime: number = 0

/**
 * Check whether the user is currently inside an active call
 */
export function isUserInCall(): boolean {
	const hash = window.location.hash || ''
	const hasCallHash = hash.includes('/call/') && !hash.endsWith('/call/')
	const hasCallElements = !!document.querySelector(
		'.incall, .video-container, .hangup, [data-call-active="true"], button[aria-label*="Opuść" i], button[aria-label*="Hang up" i], button[aria-label*="Leave" i]'
	)
	return hasCallHash || hasCallElements
}

/**
 * Get call title / room name
 */
function getCallTitle(): string {
	const titleEl = document.querySelector('.conversation-name, .call-header__title, h1, .app-navigation-entry-header span')
	return titleEl?.textContent?.trim() || 'Nextcloud Talk Call'
}

/**
 * Get current active video element in the call
 */
function getActiveVideoElement(): HTMLVideoElement | null {
	// Look for active speaker or participant video
	const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('video'))
	for (const v of videos) {
		if (v.srcObject && !v.paused && v.readyState >= 2) {
			return v
		}
	}
	return videos[0] || null
}

/**
 * Format duration MM:SS
 */
function formatDuration(seconds: number): string {
	const mins = Math.floor(seconds / 60)
	const secs = seconds % 60
	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Open Floating Picture-in-Picture window
 */
export async function openPipWindow() {
	if (!isUserInCall()) {
		return
	}

	if (activePipWindow && !activePipWindow.closed) {
		activePipWindow.focus()
		return
	}

	// 1. Check Document Picture-in-Picture API
	const dPip = (window as any).documentPictureInPicture
	if (dPip && typeof dPip.requestWindow === 'function') {
		try {
			const pipWin = await dPip.requestWindow({
				width: 340,
				height: 220,
			})
			activePipWindow = pipWin

			callStartTime = Date.now()

			// Style PIP window
			const style = pipWin.document.createElement('style')
			style.textContent = `
				* { margin: 0; padding: 0; box-sizing: border-box; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
				body {
					background-color: #111418;
					color: #f0f0f0;
					width: 100vw;
					height: 100vh;
					overflow: hidden;
					display: flex;
					flex-direction: column;
					user-select: none;
				}
				.pip-header {
					height: 32px;
					background: rgba(0, 0, 0, 0.7);
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 0 10px;
					font-size: 11px;
					font-weight: 600;
					z-index: 10;
				}
				.pip-title {
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					max-width: 190px;
					color: #0082c9;
				}
				.pip-timer {
					color: #aaa;
					font-variant-numeric: tabular-nums;
				}
				.pip-body {
					flex: 1;
					position: relative;
					background: #1a1e24;
					display: flex;
					align-items: center;
					justify-content: center;
					overflow: hidden;
				}
				.pip-video {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}
				.pip-avatar-fallback {
					width: 64px;
					height: 64px;
					border-radius: 50%;
					background: #0082c9;
					color: white;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 24px;
					font-weight: bold;
					box-shadow: 0 0 20px rgba(0, 130, 201, 0.4);
					animation: pulse 2.5s infinite ease-in-out;
				}
				@keyframes pulse {
					0% { transform: scale(0.96); box-shadow: 0 0 10px rgba(0, 130, 201, 0.3); }
					50% { transform: scale(1.04); box-shadow: 0 0 25px rgba(0, 130, 201, 0.6); }
					100% { transform: scale(0.96); box-shadow: 0 0 10px rgba(0, 130, 201, 0.3); }
				}
				.pip-controls {
					height: 48px;
					background: rgba(18, 20, 24, 0.95);
					backdrop-filter: blur(8px);
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 12px;
					padding: 0 10px;
					border-top: 1px solid rgba(255, 255, 255, 0.1);
				}
				.pip-btn {
					background: #2a313d;
					border: 1px solid rgba(255, 255, 255, 0.1);
					color: white;
					width: 34px;
					height: 34px;
					border-radius: 50%;
					cursor: pointer;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 15px;
					transition: all 0.15s ease;
				}
				.pip-btn:hover {
					background: #3a4352;
					transform: scale(1.08);
				}
				.pip-btn.danger {
					background: #e9322d;
				}
				.pip-btn.danger:hover {
					background: #ff4742;
				}
				.pip-btn.muted {
					background: #e9322d;
				}
			`
			pipWin.document.head.appendChild(style)

			// Build DOM
			const mainVideo = getActiveVideoElement()
			const container = pipWin.document.createElement('div')
			container.style.display = 'contents'
			container.innerHTML = `
				<div class="pip-header">
					<span class="pip-title">${getCallTitle()}</span>
					<span class="pip-timer">00:00</span>
				</div>
				<div class="pip-body">
					${mainVideo && mainVideo.srcObject ? '<video class="pip-video" autoplay playsinline></video>' : '<div class="pip-avatar-fallback">📞</div>'}
				</div>
				<div class="pip-controls">
					<button class="pip-btn" id="pip-mute" title="Wycisz/Włącz mikrofon">🎙️</button>
					<button class="pip-btn" id="pip-video" title="Włącz/Wyłącz kamerę">📹</button>
					<button class="pip-btn" id="pip-restore" title="Przywróć okno Nextcloud Talk">🗖</button>
					<button class="pip-btn danger" id="pip-hangup" title="Zakończ rozmowę">❌</button>
				</div>
			`
			pipWin.document.body.appendChild(container)

			const videoEl = pipWin.document.querySelector('.pip-video') as HTMLVideoElement | null
			if (videoEl && mainVideo && mainVideo.srcObject) {
				videoEl.srcObject = mainVideo.srcObject
				videoEl.muted = true
				videoEl.play().catch(() => {})
			}

			// Timer
			const timerEl = pipWin.document.querySelector('.pip-timer')
			callTimerInterval = setInterval(() => {
				if (timerEl) {
					const elapsed = Math.floor((Date.now() - callStartTime) / 1000)
					timerEl.textContent = formatDuration(elapsed)
				}
			}, 1000)

			// Buttons
			pipWin.document.getElementById('pip-mute')?.addEventListener('click', () => {
				const audioBtn = document.querySelector(
					'.local-audio-control-wrapper button, .audio-control-button, [aria-label*="audio" i], [aria-label*="mikrofon" i]'
				) as HTMLButtonElement | null
				if (audioBtn) {
					audioBtn.click()
				} else {
					window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', code: 'KeyM', bubbles: true }))
				}
			})

			pipWin.document.getElementById('pip-video')?.addEventListener('click', () => {
				const videoBtn = document.querySelector(
					'.local-video-control-wrapper button, .video-control-button, [aria-label*="video" i], [aria-label*="kamera" i]'
				) as HTMLButtonElement | null
				if (videoBtn) {
					videoBtn.click()
				} else {
					window.dispatchEvent(new KeyboardEvent('keydown', { key: 'v', code: 'KeyV', bubbles: true }))
				}
			})

			pipWin.document.getElementById('pip-restore')?.addEventListener('click', () => {
				window.focus()
				window.TALK_DESKTOP?.focusTalk?.()
				pipWin.close()
			})

			pipWin.document.getElementById('pip-hangup')?.addEventListener('click', () => {
				const hangupBtn = document.querySelector(
					'.hangup, button[aria-label*="Opuść" i], button[aria-label*="Hang up" i], button[aria-label*="Leave" i]'
				) as HTMLButtonElement | null
				hangupBtn?.click()
				pipWin.close()
			})

			pipWin.addEventListener('unload', () => {
				clearInterval(callTimerInterval)
				activePipWindow = null
			})

			return
		} catch (e) {
			console.warn('[Nextcloud Talk] Document Picture-in-Picture request failed, trying HTML5 video PiP:', e)
		}
	}

	// 2. Fallback to HTML5 video PiP
	const video = getActiveVideoElement()
	if (video && typeof (video as any).requestPictureInPicture === 'function') {
		try {
			await (video as any).requestPictureInPicture()
		} catch (e) {
			console.warn('[Nextcloud Talk] HTML5 Video PiP failed:', e)
		}
	}
}

/**
 * Close Picture-in-Picture if active
 */
export function closePipWindow() {
	if (activePipWindow && !activePipWindow.closed) {
		activePipWindow.close()
		activePipWindow = null
	}
	if (document.pictureInPictureElement) {
		document.exitPictureInPicture().catch(() => {})
	}
}

/**
 * Setup auto-PiP when window minimizes or loses focus during a call
 */
export function setupPipManager() {
	// Auto PiP on window minimization / visibility loss
	document.addEventListener('visibilitychange', async () => {
		if (document.visibilityState === 'hidden') {
			let enablePip = true
			try {
				if (window.TALK_DESKTOP?.getAppConfig) {
					const configVal = await window.TALK_DESKTOP.getAppConfig('enablePip')
					if (typeof configVal === 'boolean') {
						enablePip = configVal
					}
				}
			} catch {}

			if (enablePip && isUserInCall() && !activePipWindow) {
				openPipWindow()
			}
		}
	})

	// Also add a global hotkey or event listener
	window.addEventListener('talk:pip:toggle', () => {
		if (activePipWindow && !activePipWindow.closed) {
			closePipWindow()
		} else {
			openPipWindow()
		}
	})
}
