/**
 * SPDX-FileCopyrightText: 2026 Sairento / Nextcloud Talk Desktop
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Resolves Issue #1971: Graceful offline handling & auto-reconnect banner
 */

export function setupOfflineGuard(): void {
	console.info('[offlineGuard] Offline network banner and reconnect watcher initialized (Issue #1971)')

	let banner: HTMLDivElement | null = null

	function getBanner(): HTMLDivElement {
		if (!banner) {
			banner = document.createElement('div')
			banner.id = 'talk-offline-banner'
			banner.style.cssText = `
				position: fixed;
				top: 38px;
				left: 50%;
				transform: translateX(-50%);
				padding: 8px 20px;
				border-radius: 20px;
				font-size: 13px;
				font-weight: 600;
				z-index: 999999;
				display: none;
				align-items: center;
				gap: 8px;
				box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
				transition: all 0.3s ease;
				pointer-events: none;
			`
			document.body.appendChild(banner)
		}
		return banner
	}

	window.addEventListener('offline', () => {
		const el = getBanner()
		el.textContent = '📡 Brak połączenia z siecią. Oczekiwanie na internet...'
		el.style.backgroundColor = '#d9534f'
		el.style.color = '#ffffff'
		el.style.display = 'flex'
	})

	window.addEventListener('online', () => {
		const el = getBanner()
		el.textContent = '🟢 Połączenie przywrócone! Wznawianie...'
		el.style.backgroundColor = '#5cb85c'
		el.style.color = '#ffffff'

		setTimeout(() => {
			if (navigator.onLine && banner) {
				banner.style.display = 'none'
			}
		}, 2500)
	})

	// Also handle uncaught promise rejections due to Failed to fetch
	window.addEventListener('unhandledrejection', (event) => {
		if (!navigator.onLine && event.reason?.message?.includes('Failed to fetch')) {
			event.preventDefault()
		}
	})
}
