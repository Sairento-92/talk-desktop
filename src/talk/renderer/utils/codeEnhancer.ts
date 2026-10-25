/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

/**
 * Injects styling for code copy buttons and code blocks
 */
function injectStyles() {
	if (document.getElementById('talk-desktop-code-enhancer-styles')) {
		return
	}
	const style = document.createElement('style')
	style.id = 'talk-desktop-code-enhancer-styles'
	style.textContent = `
		pre {
			position: relative !important;
			border-radius: 8px !important;
			margin: 8px 0 !important;
			padding: 12px 14px !important;
			background: #1e1e2e !important;
		}
		pre code.hljs {
			font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace !important;
			font-size: 13.5px !important;
			line-height: 1.5 !important;
			padding: 0 !important;
			background: transparent !important;
		}
		.talk-copy-code-btn {
			position: absolute;
			top: 6px;
			right: 6px;
			padding: 3px 8px;
			font-size: 11px;
			font-weight: 600;
			color: #cdd6f4;
			background: rgba(255, 255, 255, 0.12);
			border: 1px solid rgba(255, 255, 255, 0.2);
			border-radius: 4px;
			cursor: pointer;
			opacity: 0.6;
			transition: all 0.15s ease-in-out;
			z-index: 10;
		}
		pre:hover .talk-copy-code-btn {
			opacity: 1;
		}
		.talk-copy-code-btn:hover {
			background: rgba(255, 255, 255, 0.25);
			color: #ffffff;
		}
		.talk-copy-code-btn.copied {
			background: #a6e3a1 !important;
			color: #11111b !important;
			border-color: #a6e3a1 !important;
		}
	`
	document.head.appendChild(style)
}

/**
 * Enhance code blocks in the document
 */
export function enhanceCodeBlocks(root: HTMLElement | Document = document) {
	injectStyles()

	const codeBlocks = root.querySelectorAll('pre code:not(.talk-highlighted)')
	codeBlocks.forEach((codeEl) => {
		const code = codeEl as HTMLElement
		code.classList.add('talk-highlighted')

		// Apply highlight.js
		hljs.highlightElement(code)

		// Add copy button to parent <pre>
		const preEl = code.parentElement
		if (preEl && preEl.tagName === 'PRE' && !preEl.querySelector('.talk-copy-code-btn')) {
			preEl.style.position = 'relative'
			const copyBtn = document.createElement('button')
			copyBtn.className = 'talk-copy-code-btn'
			copyBtn.type = 'button'
			copyBtn.innerText = '📋 Kopiuj'

			copyBtn.addEventListener('click', (e) => {
				e.stopPropagation()
				const text = code.innerText || code.textContent || ''
				navigator.clipboard.writeText(text).then(() => {
					copyBtn.innerText = '✅ Skopiowano!'
					copyBtn.classList.add('copied')
					setTimeout(() => {
						copyBtn.innerText = '📋 Kopiuj'
						copyBtn.classList.remove('copied')
					}, 2000)
				})
			})

			preEl.appendChild(copyBtn)
		}
	})
}

/**
 * Detect whether pasted text looks like multi-line code
 */
function isCodeSnippet(text: string): boolean {
	const lines = text.trim().split('\n')
	if (lines.length < 3) {
		return false
	}

	// Code pattern heuristic
	const codePatterns = [
		/[{}();=>]/,
		/\b(function|const|let|var|def|class|import|export|from|return|if|else|switch|case|break|try|catch)\b/,
		/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN|GROUP BY|ORDER BY)\b/i,
		/\b(powershell|Set-ItemProperty|Get-Item|Start-Process|Write-Host|curl|bash|sudo|apt|git)\b/i,
		/\b(def\s+\w+\(|public\s+class|interface\s+\w+|struct\s+\w+)/,
		/^\s*(<\?php|#!\/bin|<div|<html|<!DOCTYPE)/i,
		/\b(\$env:|\$\w+->|\$\w+\s*=)/,
	]

	let matchCount = 0
	for (const pattern of codePatterns) {
		if (pattern.test(text)) {
			matchCount++
		}
	}

	// Also check indentation
	const hasIndentation = lines.some((line) => line.startsWith('  ') || line.startsWith('\t'))
	return matchCount >= 2 || (matchCount >= 1 && hasIndentation)
}

/**
 * Setup smart paste for code blocks
 */
function setupSmartCodePaste() {
	document.addEventListener('paste', (e: ClipboardEvent) => {
		const target = e.target as HTMLElement | null
		if (!target) return

		const isInputField =
			target.tagName === 'TEXTAREA' ||
			target.tagName === 'INPUT' ||
			target.isContentEditable ||
			target.closest('[contenteditable="true"]')

		if (!isInputField) return

		const pastedText = e.clipboardData?.getData('text')
		if (!pastedText) return

		// If it's code and not already wrapped in markdown triple backticks
		if (isCodeSnippet(pastedText) && !pastedText.trim().startsWith('```')) {
			e.preventDefault()

			// Auto detect language
			const detection = hljs.highlightAuto(pastedText)
			const lang = (detection.language && detection.relevance > 5) ? detection.language : ''

			const formattedSnippet = `\`\`\`${lang}\n${pastedText.trimEnd()}\n\`\`\`\n`

			if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
				const start = target.selectionStart || 0
				const end = target.selectionEnd || 0
				target.setRangeText(formattedSnippet, start, end, 'end')
				target.dispatchEvent(new Event('input', { bubbles: true }))
			} else {
				// ContentEditable
				document.execCommand('insertText', false, formattedSnippet)
			}
		}
	})
}

/**
 * Initialize code enhancer with DOM observer
 */
export function setupCodeEnhancer() {
	injectStyles()
	setupSmartCodePaste()

	// Initial pass
	enhanceCodeBlocks()

	// Observe DOM mutations to highlight incoming messages
	const observer = new MutationObserver(() => {
		enhanceCodeBlocks()
	})

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	})
}
