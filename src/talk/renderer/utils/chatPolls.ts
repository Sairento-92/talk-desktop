/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

let pollCreatorModalEl: HTMLElement | null = null

export function openPollCreator() {
	if (pollCreatorModalEl) {
		closePollCreator()
		return
	}

	pollCreatorModalEl = document.createElement('div')
	pollCreatorModalEl.id = 'talk-poll-creator-backdrop'
	pollCreatorModalEl.innerHTML = `
		<div class="poll-creator-container">
			<div class="poll-creator-header">
				<h3>📊 Utwórz Nową Ankietę</h3>
				<button class="poll-close-btn" title="Zamknij (Esc)">✕</button>
			</div>
			<div class="poll-creator-body">
				<label>Pytanie ankiety:</label>
				<input type="text" id="poll-q-input" class="poll-input" placeholder="np. Kiedy organizujemy spotkanie zespołu?" />

				<label style="margin-top: 14px;">Opcje odpowiedzi (oddzielone nową linią):</label>
				<textarea id="poll-options-input" class="poll-textarea" placeholder="Dziś o 15:00&#10;Jutro o 10:00&#10;W piątek po południu"></textarea>
			</div>
			<div class="poll-creator-footer">
				<button class="poll-btn" id="poll-cancel-btn">Anuluj</button>
				<button class="poll-btn primary" id="poll-send-btn">Wyślij ankietę do czatu</button>
			</div>
		</div>
	`

	const style = document.createElement('style')
	style.id = 'talk-poll-creator-styles'
	style.textContent = `
		#talk-poll-creator-backdrop {
			position: fixed;
			top: 0; left: 0; right: 0; bottom: 0;
			background: rgba(0, 0, 0, 0.65);
			backdrop-filter: blur(8px);
			z-index: 999999;
			display: flex;
			align-items: center;
			justify-content: center;
			animation: fadeIn 0.15s ease-out;
		}
		.poll-creator-container {
			width: 480px;
			max-width: 90vw;
			background: var(--color-main-background, #1d232a);
			border: 1px solid var(--color-border, rgba(255, 255, 255, 0.15));
			border-radius: 14px;
			display: flex;
			flex-direction: column;
			box-shadow: 0 20px 50px rgba(0,0,0,0.5);
			overflow: hidden;
		}
		.poll-creator-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 16px 20px;
			border-bottom: 1px solid var(--color-border, rgba(255, 255, 255, 0.1));
		}
		.poll-creator-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: #0082c9; }
		.poll-close-btn { background: none; border: none; font-size: 18px; color: #888; cursor: pointer; }
		.poll-close-btn:hover { color: white; }
		.poll-creator-body { padding: 20px; display: flex; flex-direction: column; }
		.poll-creator-body label { font-size: 13px; font-weight: 600; margin-bottom: 6px; opacity: 0.9; }
		.poll-input, .poll-textarea {
			background: rgba(0, 0, 0, 0.25);
			border: 1px solid var(--color-border, rgba(255, 255, 255, 0.15));
			border-radius: 8px;
			color: #fff;
			padding: 10px 12px;
			font-size: 14px;
			outline: none;
		}
		.poll-textarea { height: 100px; resize: none; font-family: inherit; }
		.poll-creator-footer {
			display: flex;
			justify-content: flex-end;
			gap: 10px;
			padding: 14px 20px;
			background: rgba(0, 0, 0, 0.15);
			border-top: 1px solid var(--color-border, rgba(255, 255, 255, 0.1));
		}
		.poll-btn {
			background: #2a313d; border: 1px solid rgba(255,255,255,0.15); color: white;
			padding: 8px 16px; border-radius: 8px; font-size: 13px; cursor: pointer;
		}
		.poll-btn.primary { background: #0082c9; border-color: #0082c9; }
		.poll-btn.primary:hover { background: #0099ec; }
	`
	document.head.appendChild(style)
	document.body.appendChild(pollCreatorModalEl)

	pollCreatorModalEl.querySelector('.poll-close-btn')?.addEventListener('click', closePollCreator)
	pollCreatorModalEl.querySelector('#poll-cancel-btn')?.addEventListener('click', closePollCreator)

	pollCreatorModalEl.querySelector('#poll-send-btn')?.addEventListener('click', () => {
		const q = (pollCreatorModalEl?.querySelector('#poll-q-input') as HTMLInputElement)?.value.trim()
		const optText = (pollCreatorModalEl?.querySelector('#poll-options-input') as HTMLTextAreaElement)?.value.trim()
		if (!q || !optText) return

		const options = optText.split('\n').map(o => o.trim()).filter(Boolean)
		if (options.length < 2) return

		const formattedPoll = `📊 **ANKIETA: ${q}**\n` + options.map((opt, i) => `${i + 1}. [ ] ${opt}`).join('\n')

		const inputEl = document.querySelector('.new-message-form__advanced-input, textarea, [contenteditable="true"]') as HTMLElement | null
		if (inputEl) {
			if (inputEl instanceof HTMLInputElement || inputEl instanceof HTMLTextAreaElement) {
				inputEl.value = formattedPoll
			} else {
				inputEl.textContent = formattedPoll
			}
			inputEl.dispatchEvent(new Event('input', { bubbles: true }))

			// Submit message
			const sendBtn = document.querySelector('.new-message-form__submit-button, button[aria-label*="Wyślij" i], button[aria-label*="Send" i]') as HTMLButtonElement | null
			if (sendBtn) {
				setTimeout(() => sendBtn.click(), 100)
			}
		}
		closePollCreator()
	})
}

export function closePollCreator() {
	if (pollCreatorModalEl) {
		pollCreatorModalEl.remove()
		pollCreatorModalEl = null
	}
	const style = document.getElementById('talk-poll-creator-styles')
	style?.remove()
}

/**
 * Scan chat messages and render interactive polls
 */
export function enhancePollsInChat() {
	const messageEls = document.querySelectorAll('.message__text, .comment__text, [data-rich-text="true"]')

	messageEls.forEach((el) => {
		if (el.getAttribute('data-poll-rendered') === 'true') return

		const text = el.textContent || ''
		if (!text.includes('📊') || !text.includes('ANKIETA:')) return

		el.setAttribute('data-poll-rendered', 'true')

		// Extract poll question and options
		const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
		const qLine = lines.find(l => l.includes('ANKIETA:')) || ''
		const question = qLine.replace(/.*ANKIETA:\s*/i, '').replace(/\*+/g, '').trim()

		const optionLines = lines.filter(l => /^\d+\.\s*(\[.*?\])?/.test(l))
		const options = optionLines.map(l => l.replace(/^\d+\.\s*(\[.*?\])?\s*/, '').trim())

		if (options.length >= 2) {
			const pollId = `poll_${Math.abs(question.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))}`
			const savedVote = localStorage.getItem(`talk_vote_${pollId}`)

			const widget = document.createElement('div')
			widget.className = 'talk-interactive-poll-widget'
			widget.innerHTML = `
				<div class="poll-widget-title">📊 ${question}</div>
				<div class="poll-widget-options">
					${options.map((opt, i) => {
						const isSelected = savedVote === String(i)
						return `
							<button class="poll-option-btn ${isSelected ? 'voted' : ''}" data-idx="${i}">
								<span class="poll-opt-name">${opt}</span>
								<div class="poll-bar-wrapper">
									<div class="poll-bar-fill" style="width: ${isSelected ? '100%' : '20%'};"></div>
								</div>
							</button>
						`
					}).join('')}
				</div>
				<div class="poll-widget-footer">Kliknij opcję, aby zagłosować</div>
			`

			// Inject styling if not present
			if (!document.getElementById('talk-poll-widget-styles')) {
				const style = document.createElement('style')
				style.id = 'talk-poll-widget-styles'
				style.textContent = `
					.talk-interactive-poll-widget {
						background: rgba(0, 0, 0, 0.25);
						border: 1px solid var(--color-border, rgba(255, 255, 255, 0.15));
						border-radius: 10px;
						padding: 14px;
						margin: 8px 0;
						max-width: 440px;
					}
					.poll-widget-title { font-weight: 700; font-size: 15px; margin-bottom: 12px; color: #0082c9; }
					.poll-widget-options { display: flex; flex-direction: column; gap: 8px; }
					.poll-option-btn {
						background: #232a34;
						border: 1px solid rgba(255, 255, 255, 0.1);
						border-radius: 8px;
						padding: 10px 12px;
						color: white;
						text-align: left;
						cursor: pointer;
						position: relative;
						overflow: hidden;
						transition: all 0.15s ease;
					}
					.poll-option-btn:hover { background: #2f3846; }
					.poll-option-btn.voted { border-color: #0082c9; background: #1c364d; }
					.poll-opt-name { position: relative; z-index: 2; font-size: 13px; font-weight: 500; }
					.poll-bar-wrapper {
						position: absolute; top: 0; left: 0; bottom: 0; right: 0;
						background: transparent; z-index: 1; opacity: 0.35;
					}
					.poll-bar-fill {
						height: 100%; background: #0082c9; border-radius: 8px;
						transition: width 0.3s ease;
					}
					.poll-widget-footer { font-size: 11px; opacity: 0.6; margin-top: 8px; text-align: right; }
				`
				document.head.appendChild(style)
			}

			// Add click votes
			widget.querySelectorAll('.poll-option-btn').forEach((btn) => {
				btn.addEventListener('click', (e) => {
					e.stopPropagation()
					const idx = btn.getAttribute('data-idx') || '0'
					localStorage.setItem(`talk_vote_${pollId}`, idx)

					widget.querySelectorAll('.poll-option-btn').forEach((b) => b.classList.remove('voted'))
					btn.classList.add('voted')
					const footer = widget.querySelector('.poll-widget-footer')
					if (footer) footer.textContent = '✅ Twój głos został zarejestrowany!'
				})
			})

			el.innerHTML = ''
			el.appendChild(widget)
		}
	})
}

/**
 * Setup chat polls listener
 */
export function setupChatPolls() {
	window.addEventListener('talk:poll:create', openPollCreator)

	// Intercept /poll command in chat input
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			const target = e.target as HTMLInputElement | HTMLTextAreaElement
			if (target && typeof target.value === 'string' && target.value.trim().startsWith('/poll')) {
				const raw = target.value.trim()
				e.preventDefault()
				target.value = ''

				const parts = raw.replace(/^\/poll\s*/, '').split('|').map(p => p.trim()).filter(Boolean)
				if (parts.length >= 3) {
					// /poll Question | Option 1 | Option 2
					const q = parts[0]
					const options = parts.slice(1)
					const formattedPoll = `📊 **ANKIETA: ${q}**\n` + options.map((opt, i) => `${i + 1}. [ ] ${opt}`).join('\n')

					target.value = formattedPoll
					target.dispatchEvent(new Event('input', { bubbles: true }))
					const sendBtn = document.querySelector('.new-message-form__submit-button, button[aria-label*="Wyślij" i], button[aria-label*="Send" i]') as HTMLButtonElement | null
					setTimeout(() => sendBtn?.click(), 100)
				} else {
					openPollCreator()
				}
			}
		}
	})

	setInterval(enhancePollsInChat, 1000)
}
