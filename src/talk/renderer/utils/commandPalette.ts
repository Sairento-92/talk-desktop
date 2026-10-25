/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

let paletteEl: HTMLElement | null = null
let selectedIndex = 0
let filteredItems: Array<{ id: string, title: string, subtitle?: string, icon: string, action: () => void }> = []

function getAvailableConversations() {
	const items: Array<{ id: string, title: string, subtitle?: string, icon: string, action: () => void }> = []

	// Query conversation list items from DOM
	const convEls = document.querySelectorAll('.conversations-list [role="listitem"], .conversation-list-item, .app-navigation-entry')
	convEls.forEach((el, index) => {
		const titleEl = el.querySelector('.conversation-name, .app-navigation-entry__title, .main-title, h2, h3, span')
		const title = titleEl?.textContent?.trim()
		if (!title || title.length < 2) return

		const subEl = el.querySelector('.last-message, .app-navigation-entry__desc, .subtitle')
		const subtitle = subEl?.textContent?.trim()

		items.push({
			id: `conv_${index}`,
			title,
			subtitle: subtitle || 'Rozmowa',
			icon: '💬',
			action: () => {
				const clickTarget = (el.querySelector('a, button') as HTMLElement) || (el as HTMLElement)
				clickTarget.click()
			},
		})
	})

	return items
}

function getQuickActions() {
	return [
		{
			id: 'act_mute',
			title: 'Wycisz / Włącz mikrofon',
			subtitle: 'Skrót: Ctrl + Shift + M',
			icon: '🎙️',
			action: () => {
				const btn = document.querySelector(
					'.local-audio-control-wrapper button, .audio-control-button, [aria-label*="audio" i], [aria-label*="mikrofon" i]'
				) as HTMLButtonElement | null
				btn ? btn.click() : window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', code: 'KeyM', bubbles: true }))
			},
		},
		{
			id: 'act_video',
			title: 'Włącz / Wyłącz kamerę',
			subtitle: 'Skrót: V',
			icon: '📹',
			action: () => {
				const btn = document.querySelector(
					'.local-video-control-wrapper button, .video-control-button, [aria-label*="video" i], [aria-label*="kamera" i]'
				) as HTMLButtonElement | null
				btn ? btn.click() : window.dispatchEvent(new KeyboardEvent('keydown', { key: 'v', code: 'KeyV', bubbles: true }))
			},
		},
		{
			id: 'act_pip',
			title: 'Przełącz okno Picture-in-Picture (PiP)',
			subtitle: 'Pływające okno rozmowy wideo Always-on-Top',
			icon: '🗖',
			action: () => {
				window.dispatchEvent(new CustomEvent('talk:pip:toggle'))
			},
		},
		{
			id: 'act_summary',
			title: 'Podsumowanie rozmowy & Eksport notatek',
			subtitle: 'Generuj raport ze spotkania i listę zadań',
			icon: '📋',
			action: () => {
				window.dispatchEvent(new CustomEvent('talk:summary:open'))
			},
		},
		{
			id: 'act_poll',
			title: 'Stwórz szybką ankietę (/poll)',
			subtitle: 'Głosowanie i zebranie opinii uczestników',
			icon: '📊',
			action: () => {
				window.dispatchEvent(new CustomEvent('talk:poll:create'))
			},
		},
		{
			id: 'act_record',
			title: 'Nagraj wycinek ekranu / rozmowy',
			subtitle: 'Rejestrator wideo z szybkim wysłaniem na czat',
			icon: '🔴',
			action: () => {
				window.dispatchEvent(new CustomEvent('talk:record:toggle'))
			},
		},
		{
			id: 'act_settings',
			title: 'Ustawienia Talk Desktop',
			subtitle: 'Dźwięki, skróty, AI Noise, wygląd',
			icon: '⚙️',
			action: () => {
				const settingsBtn = document.querySelector('[aria-label*="Ustawienia" i], [aria-label*="Settings" i]') as HTMLElement | null
				settingsBtn?.click()
			},
		},
	]
}

export function openCommandPalette() {
	if (paletteEl) {
		closeCommandPalette()
		return
	}

	const allItems = [...getQuickActions(), ...getAvailableConversations()]
	filteredItems = allItems
	selectedIndex = 0

	paletteEl = document.createElement('div')
	paletteEl.id = 'talk-command-palette-backdrop'
	paletteEl.innerHTML = `
		<div class="palette-container">
			<div class="palette-input-wrapper">
				<span class="palette-search-icon">🔍</span>
				<input type="text" class="palette-input" placeholder="Szukaj pokoju, osoby lub polecenia... (Esc aby zamknąć)" autofocus />
			</div>
			<div class="palette-results-list"></div>
			<div class="palette-footer">
				<span>Nawigacja: <b>↑</b> <b>↓</b></span>
				<span>Wybierz: <b>Enter</b></span>
				<span>Zamknij: <b>Esc</b></span>
			</div>
		</div>
	`

	const style = document.createElement('style')
	style.id = 'talk-command-palette-styles'
	style.textContent = `
		#talk-command-palette-backdrop {
			position: fixed;
			top: 0; left: 0; right: 0; bottom: 0;
			background: rgba(0, 0, 0, 0.65);
			backdrop-filter: blur(8px);
			z-index: 999999;
			display: flex;
			align-items: flex-start;
			justify-content: center;
			padding-top: 12vh;
			animation: fadeIn 0.15s ease-out;
		}
		@keyframes fadeIn {
			from { opacity: 0; transform: translateY(-10px); }
			to { opacity: 1; transform: translateY(0); }
		}
		.palette-container {
			width: 600px;
			max-width: 90vw;
			background: var(--color-main-background, #1d232a);
			border: 1px solid var(--color-border, rgba(255, 255, 255, 0.15));
			border-radius: 14px;
			box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.2);
			display: flex;
			flex-direction: column;
			overflow: hidden;
		}
		.palette-input-wrapper {
			display: flex;
			align-items: center;
			padding: 14px 18px;
			border-bottom: 1px solid var(--color-border, rgba(255, 255, 255, 0.1));
			gap: 12px;
		}
		.palette-search-icon { font-size: 18px; opacity: 0.6; }
		.palette-input {
			flex: 1;
			background: transparent;
			border: none;
			outline: none;
			color: var(--color-main-text, #ffffff);
			font-size: 16px;
			font-weight: 500;
		}
		.palette-results-list {
			max-height: 380px;
			overflow-y: auto;
			padding: 8px;
		}
		.palette-item {
			display: flex;
			align-items: center;
			gap: 12px;
			padding: 10px 14px;
			border-radius: 8px;
			cursor: pointer;
			transition: background 0.1s ease;
		}
		.palette-item.active {
			background: var(--color-primary, #0082c9);
			color: #ffffff;
		}
		.palette-item-icon { font-size: 20px; width: 28px; text-align: center; }
		.palette-item-details { display: flex; flex-direction: column; overflow: hidden; }
		.palette-item-title { font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		.palette-item-sub { font-size: 12px; opacity: 0.7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		.palette-item.active .palette-item-sub { opacity: 0.9; }
		.palette-footer {
			display: flex;
			justify-content: flex-end;
			gap: 16px;
			padding: 10px 16px;
			background: rgba(0, 0, 0, 0.2);
			border-top: 1px solid var(--color-border, rgba(255, 255, 255, 0.05));
			font-size: 11px;
			opacity: 0.7;
		}
		.palette-footer b {
			background: rgba(255, 255, 255, 0.15);
			padding: 2px 6px;
			border-radius: 4px;
		}
	`
	document.head.appendChild(style)
	document.body.appendChild(paletteEl)

	const inputEl = paletteEl.querySelector('.palette-input') as HTMLInputElement
	const resultsEl = paletteEl.querySelector('.palette-results-list') as HTMLElement

	function renderResults() {
		if (filteredItems.length === 0) {
			resultsEl.innerHTML = `<div style="padding: 24px; text-align: center; opacity: 0.6; font-size: 14px;">Brak wyników</div>`
			return
		}

		resultsEl.innerHTML = filteredItems
			.map(
				(item, idx) => `
			<div class="palette-item ${idx === selectedIndex ? 'active' : ''}" data-idx="${idx}">
				<span class="palette-item-icon">${item.icon}</span>
				<div class="palette-item-details">
					<span class="palette-item-title">${item.title}</span>
					${item.subtitle ? `<span class="palette-item-sub">${item.subtitle}</span>` : ''}
				</div>
			</div>
		`
			)
			.join('')

		const activeEl = resultsEl.querySelector('.palette-item.active') as HTMLElement | null
		activeEl?.scrollIntoView({ block: 'nearest' })

		// Click handlers
		resultsEl.querySelectorAll('.palette-item').forEach((el) => {
			el.addEventListener('click', () => {
				const idx = parseInt(el.getAttribute('data-idx') || '0', 10)
				executeItem(idx)
			})
		})
	}

	function executeItem(idx: number) {
		const item = filteredItems[idx]
		if (item) {
			closeCommandPalette()
			item.action()
		}
	}

	inputEl.addEventListener('input', () => {
		const q = inputEl.value.trim().toLowerCase()
		if (!q) {
			filteredItems = allItems
		} else {
			filteredItems = allItems.filter(
				(item) => item.title.toLowerCase().includes(q) || (item.subtitle && item.subtitle.toLowerCase().includes(q))
			)
		}
		selectedIndex = 0
		renderResults()
	})

	inputEl.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			selectedIndex = (selectedIndex + 1) % Math.max(1, filteredItems.length)
			renderResults()
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			selectedIndex = (selectedIndex - 1 + filteredItems.length) % Math.max(1, filteredItems.length)
			renderResults()
		} else if (e.key === 'Enter') {
			e.preventDefault()
			executeItem(selectedIndex)
		} else if (e.key === 'Escape') {
			e.preventDefault()
			closeCommandPalette()
		}
	})

	paletteEl.addEventListener('click', (e) => {
		if (e.target === paletteEl) {
			closeCommandPalette()
		}
	})

	renderResults()
	setTimeout(() => inputEl.focus(), 20)
}

export function closeCommandPalette() {
	if (paletteEl) {
		paletteEl.remove()
		paletteEl = null
	}
	const styleEl = document.getElementById('talk-command-palette-styles')
	if (styleEl) {
		styleEl.remove()
	}
}

/**
 * Setup global hotkey Ctrl+K / Cmd+K
 */
export function setupCommandPalette() {
	window.addEventListener('keydown', (e) => {
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault()
			openCommandPalette()
		}
	})
}
