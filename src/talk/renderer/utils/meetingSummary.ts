/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

let summaryModalEl: HTMLElement | null = null

function getRoomName(): string {
	const el = document.querySelector('.conversation-name, .call-header__title, h1, .app-navigation-entry-header span')
	return el?.textContent?.trim() || 'Spotkanie Nextcloud Talk'
}

function getParticipants(): string[] {
	const names: Set<string> = new Set()

	// From video tiles
	document.querySelectorAll('.video-item, .participant-item, .participant-name').forEach((el) => {
		const text = el.textContent?.trim()
		if (text && text.length > 1 && !text.includes('\n')) {
			names.add(text)
		}
	})

	// From chat messages
	document.querySelectorAll('.message__author, .comment__author').forEach((el) => {
		const text = el.textContent?.trim()
		if (text && text.length > 1) {
			names.add(text)
		}
	})

	return names.size > 0 ? Array.from(names) : ['Uczestnicy spotkania']
}

function getTranscriptsAndMessages(): Array<{ author: string, text: string, time?: string }> {
	const records: Array<{ author: string, text: string, time?: string }> = []

	// Look for transcript elements (PR #19868 / LiveTranscriptionRenderer)
	document.querySelectorAll('.transcript-block, .live-transcription__chunk, .message').forEach((el) => {
		const authorEl = el.querySelector('.transcript-block__author, .message__author, .author')
		const textEl = el.querySelector('.transcript-block__text, .message__text, .text, [data-rich-text="true"]')
		const timeEl = el.querySelector('.transcript-block__time, .message__time, time')

		const text = textEl?.textContent?.trim()
		if (text && text.length > 0) {
			records.push({
				author: authorEl?.textContent?.trim() || 'Rozmówca',
				text,
				time: timeEl?.textContent?.trim() || '',
			})
		}
	})

	return records
}

export function generateMeetingSummaryMarkdown(): string {
	const room = getRoomName()
	const now = new Date()
	const dateStr = now.toLocaleDateString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
	const attendees = getParticipants()
	const records = getTranscriptsAndMessages()

	let md = `# 📋 Raport ze Spotkania: ${room}\n\n`
	md += `**📅 Data:** ${dateStr}  \n`
	md += `**👥 Uczestnicy:** ${attendees.join(', ')}  \n\n`
	md += `---\n\n`
	md += `## 💡 Kluczowe Ustalenia i Notatki\n\n`

	if (records.length > 0) {
		const uniquePoints = records.filter(r => r.text.length > 15).slice(0, 5)
		if (uniquePoints.length > 0) {
			uniquePoints.forEach(p => {
				md += `- **${p.author}:** ${p.text}\n`
			})
		} else {
			md += `- Omówiono bieżące postępy prac i cele zespołu.\n`
		}
	} else {
		md += `- Podsumowanie dyskusji i ustaleń z trwającej sesji połączenia.\n`
	}

	md += `\n## ✅ Lista Zadań (Action Items)\n\n`
	md += `- [ ] Przygotować podsumowanie i rozesłać notatki do uczestników\n`
	md += `- [ ] Zrealizować ustalone punkty działania\n\n`

	md += `---\n\n`
	md += `## 📝 Zapis Transkrypcji / Wiadomości ze Spotkania\n\n`

	if (records.length > 0) {
		records.forEach(r => {
			md += `> **${r.author}** ${r.time ? `*(${r.time})*` : ''}: ${r.text}\n>\n`
		})
	} else {
		md += `*Brak zarejestrowanych transkrypcji w tej sesji rozmowy.*\n`
	}

	return md
}

export function openMeetingSummaryModal() {
	if (summaryModalEl) {
		closeMeetingSummaryModal()
		return
	}

	const markdownReport = generateMeetingSummaryMarkdown()

	summaryModalEl = document.createElement('div')
	summaryModalEl.id = 'talk-summary-modal-backdrop'
	summaryModalEl.innerHTML = `
		<div class="summary-container">
			<div class="summary-header">
				<h3>📋 Notatki i Podsumowanie Spotkania</h3>
				<button class="summary-close-btn" title="Zamknij (Esc)">✕</button>
			</div>
			<div class="summary-body">
				<textarea class="summary-textarea" readonly>${markdownReport}</textarea>
			</div>
			<div class="summary-footer">
				<button class="summary-btn" id="summary-copy-btn">📋 Kopiuj do schowka</button>
				<button class="summary-btn" id="summary-download-btn">💾 Pobierz Markdown (.md)</button>
				<button class="summary-btn" id="summary-print-btn">🖨️ Zapisz jako PDF / Drukuj</button>
				<button class="summary-btn primary" id="summary-chat-btn">💬 Wyślij na czat</button>
			</div>
		</div>
	`

	const style = document.createElement('style')
	style.id = 'talk-summary-modal-styles'
	style.textContent = `
		#talk-summary-modal-backdrop {
			position: fixed;
			top: 0; left: 0; right: 0; bottom: 0;
			background: rgba(0, 0, 0, 0.7);
			backdrop-filter: blur(8px);
			z-index: 999999;
			display: flex;
			align-items: center;
			justify-content: center;
			animation: fadeIn 0.15s ease-out;
		}
		.summary-container {
			width: 720px;
			max-width: 92vw;
			height: 80vh;
			background: var(--color-main-background, #1d232a);
			border: 1px solid var(--color-border, rgba(255, 255, 255, 0.15));
			border-radius: 14px;
			display: flex;
			flex-direction: column;
			box-shadow: 0 25px 50px rgba(0,0,0,0.6);
			overflow: hidden;
		}
		.summary-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 16px 20px;
			border-bottom: 1px solid var(--color-border, rgba(255, 255, 255, 0.1));
		}
		.summary-header h3 { margin: 0; font-size: 17px; font-weight: 600; color: #0082c9; }
		.summary-close-btn {
			background: none; border: none; font-size: 20px; color: #888; cursor: pointer;
		}
		.summary-close-btn:hover { color: white; }
		.summary-body { flex: 1; padding: 16px; display: flex; }
		.summary-textarea {
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.25);
			border: 1px solid var(--color-border, rgba(255, 255, 255, 0.1));
			border-radius: 8px;
			color: #e5e5e5;
			font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
			font-size: 13px;
			line-height: 1.5;
			padding: 14px;
			resize: none;
			outline: none;
		}
		.summary-footer {
			display: flex;
			flex-wrap: wrap;
			gap: 10px;
			justify-content: flex-end;
			padding: 14px 20px;
			background: rgba(0, 0, 0, 0.15);
			border-top: 1px solid var(--color-border, rgba(255, 255, 255, 0.1));
		}
		.summary-btn {
			background: #2a313d;
			border: 1px solid rgba(255, 255, 255, 0.15);
			color: white;
			padding: 8px 14px;
			border-radius: 8px;
			font-size: 13px;
			font-weight: 500;
			cursor: pointer;
			transition: all 0.12s ease;
		}
		.summary-btn:hover { background: #3a4352; }
		.summary-btn.primary { background: #0082c9; border-color: #0082c9; }
		.summary-btn.primary:hover { background: #0099ec; }
	`
	document.head.appendChild(style)
	document.body.appendChild(summaryModalEl)

	summaryModalEl.querySelector('.summary-close-btn')?.addEventListener('click', closeMeetingSummaryModal)
	summaryModalEl.addEventListener('click', (e) => {
		if (e.target === summaryModalEl) closeMeetingSummaryModal()
	})

	// Copy button
	summaryModalEl.querySelector('#summary-copy-btn')?.addEventListener('click', () => {
		navigator.clipboard.writeText(markdownReport).then(() => {
			const btn = summaryModalEl?.querySelector('#summary-copy-btn') as HTMLButtonElement | null
			if (btn) btn.textContent = '✅ Skopiowano!'
			setTimeout(() => { if (btn) btn.textContent = '📋 Kopiuj do schowka' }, 2000)
		})
	})

	// Download button
	summaryModalEl.querySelector('#summary-download-btn')?.addEventListener('click', () => {
		const blob = new Blob([markdownReport], { type: 'text/markdown;charset=utf-8' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `Spotkanie-${getRoomName().replace(/[^a-zA-Z0-9_-]/g, '_')}.md`
		a.click()
		URL.revokeObjectURL(url)
	})

	// Print / PDF button
	summaryModalEl.querySelector('#summary-print-btn')?.addEventListener('click', () => {
		const printWin = window.open('', '_blank')
		if (printWin) {
			printWin.document.write(`
				<html>
				<head>
					<title>Raport: ${getRoomName()}</title>
					<style>
						body { font-family: system-ui, sans-serif; line-height: 1.6; padding: 40px; color: #222; }
						h1 { color: #0082c9; border-bottom: 2px solid #0082c9; padding-bottom: 8px; }
						blockquote { border-left: 3px solid #0082c9; margin: 10px 0; padding-left: 12px; color: #555; }
						hr { border: none; border-top: 1px solid #ccc; margin: 20px 0; }
					</style>
				</head>
				<body>
					<pre style="font-family: inherit; white-space: pre-wrap;">${markdownReport}</pre>
					<script>window.onload = function() { window.print(); }<\/script>
				</body>
				</html>
			`)
			printWin.document.close()
		}
	})

	// Send to chat
	summaryModalEl.querySelector('#summary-chat-btn')?.addEventListener('click', () => {
		const inputEl = document.querySelector('.new-message-form__advanced-input, textarea, [contenteditable="true"]') as HTMLElement | null
		if (inputEl) {
			if (inputEl instanceof HTMLInputElement || inputEl instanceof HTMLTextAreaElement) {
				inputEl.value = markdownReport
			} else {
				inputEl.textContent = markdownReport
			}
			inputEl.dispatchEvent(new Event('input', { bubbles: true }))
			closeMeetingSummaryModal()
		}
	})
}

export function closeMeetingSummaryModal() {
	if (summaryModalEl) {
		summaryModalEl.remove()
		summaryModalEl = null
	}
	const styleEl = document.getElementById('talk-summary-modal-styles')
	if (styleEl) {
		styleEl.remove()
	}
}

/**
 * Setup meeting summary event listener
 */
export function setupMeetingSummary() {
	window.addEventListener('talk:summary:open', openMeetingSummaryModal)

	// Slash command listener (/summary in chat)
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			const target = e.target as HTMLInputElement | HTMLTextAreaElement
			if (target && typeof target.value === 'string' && target.value.trim() === '/summary') {
				e.preventDefault()
				target.value = ''
				openMeetingSummaryModal()
			}
		}
	})
}
