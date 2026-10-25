/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import hljs from 'highlight.js'

const COMMON_LANGUAGES = [
	'python', 'javascript', 'typescript', 'bash', 'powershell',
	'json', 'html', 'xml', 'css', 'scss', 'sql', 'php', 'c', 'cpp',
	'csharp', 'java', 'kotlin', 'go', 'rust', 'yaml', 'dockerfile',
	'diff', 'markdown', 'ini', 'lua',
]

/**
 * Robustly detect language from element classes, tag hints, or source text heuristics
 */
export function detectLanguage(codeText: string, classNames = ''): string {
	// 1. Check if class specifies language
	const classMatch = classNames.match(/(?:language-|lang-)([a-zA-Z0-9_-]+)/i) ||
	                   classNames.match(/\b(python|py|python3|javascript|js|typescript|ts|html|css|json|bash|sh|powershell|ps1|sql|php|rust|go|c|cpp|csharp|cs|yaml|yml)\b/i)

	if (classMatch) {
		let lang = classMatch[1].toLowerCase()
		if (lang === 'py' || lang === 'python3') lang = 'python'
		if (lang === 'js') lang = 'javascript'
		if (lang === 'ts') lang = 'typescript'
		if (lang === 'sh') lang = 'bash'
		if (lang === 'ps1') lang = 'powershell'
		if (lang === 'yml') lang = 'yaml'
		if (lang === 'cs') lang = 'csharp'
		if (hljs.getLanguage(lang)) {
			return lang
		}
	}

	// 2. Python specific heuristics
	if (
		/\bdef\s+[a-zA-Z_]\w*\s*\(/.test(codeText) ||
		/^\s*(import\s+[\w.]+|from\s+[\w.]+\s+import)/m.test(codeText) ||
		/\bprint\s*\([^)]*\)/.test(codeText) ||
		/\b(if|elif|while)\s+.*:\s*$/m.test(codeText) ||
		/\bclass\s+[a-zA-Z_]\w*(\s*\(.*?\))?\s*:/.test(codeText) ||
		/\b(self\.|__init__|__name__\s*==\s*['"]__main__['"])/.test(codeText) ||
		(/\b(True|False|None)\b/.test(codeText) && /\b(def|import|in|for|if|return)\b/.test(codeText))
	) {
		return 'python'
	}

	// 3. PowerShell heuristics
	if (/\b(Get-\w+|Set-\w+|New-\w+|Invoke-\w+|Write-Host|\$PSScriptRoot|\$env:|\$PSVersionTable)\b/i.test(codeText)) {
		return 'powershell'
	}

	// 4. SQL heuristics
	if (/^\s*(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE)\b/im.test(codeText)) {
		return 'sql'
	}

	// 5. JavaScript / TypeScript heuristics
	if (/\b(const|let|var)\s+\w+\s*=|console\.(log|error|warn)\(|\bfunction\s+\w+\s*\(|=>\s*\{/.test(codeText)) {
		if (/\b(interface|type\s+\w+\s*=|:\s*(string|number|boolean|any)\b)/.test(codeText)) {
			return 'typescript'
		}
		return 'javascript'
	}

	// 6. JSON heuristics
	if (/^\s*[\{\[][\s\S]*[\}\]]\s*$/.test(codeText.trim()) && /"[\w-]+"\s*:\s*/.test(codeText)) {
		return 'json'
	}

	// 7. Auto-detect from COMMON_LANGUAGES
	const auto = hljs.highlightAuto(codeText, COMMON_LANGUAGES)
	if (auto.language && auto.relevance > 3) {
		return auto.language
	}

	return 'plaintext'
}

/**
 * Highlight a given snippet and return { lang, html }
 */
export function highlightCode(codeText: string, classNames = ''): { lang: string, html: string } {
	const lang = detectLanguage(codeText, classNames)
	if (lang !== 'plaintext' && hljs.getLanguage(lang)) {
		try {
			const res = hljs.highlight(codeText, { language: lang, ignoreIllegals: true })
			return { lang, html: res.value }
		} catch (err) {
			console.warn('[CodeEnhancer] Error highlighting code:', err)
		}
	}
	// Fallback plaintext
	const escaped = codeText
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
	return { lang: 'plaintext', html: escaped }
}

/**
 * Injects styling for code copy buttons, language badges, and Atom One Dark syntax theme
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
			margin: 10px 0 !important;
			padding: 28px 14px 14px 14px !important;
			background: #282c34 !important;
			color: #abb2bf !important;
			overflow-x: auto !important;
		}
		pre code, pre code.hljs {
			font-family: 'Cascadia Code', 'Fira Code', 'Consolas', 'Courier New', monospace !important;
			font-size: 13.5px !important;
			line-height: 1.55 !important;
			padding: 0 !important;
			background: transparent !important;
			color: #abb2bf !important;
		}
		
		/* Language Badge & Copy Button Header */
		.talk-code-header-bar {
			position: absolute;
			top: 6px;
			right: 8px;
			display: flex;
			align-items: center;
			gap: 6px;
			z-index: 10;
			user-select: none;
		}
		.talk-code-lang-badge {
			font-size: 10.5px;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			color: #828997;
			background: rgba(255, 255, 255, 0.08);
			padding: 2px 7px;
			border-radius: 4px;
		}
		.talk-copy-code-btn {
			padding: 3px 8px;
			font-size: 11px;
			font-weight: 600;
			color: #abb2bf;
			background: rgba(255, 255, 255, 0.12);
			border: 1px solid rgba(255, 255, 255, 0.18);
			border-radius: 4px;
			cursor: pointer;
			opacity: 0.7;
			transition: all 0.15s ease-in-out;
		}
		pre:hover .talk-copy-code-btn {
			opacity: 1;
		}
		.talk-copy-code-btn:hover {
			background: rgba(255, 255, 255, 0.25);
			color: #ffffff;
		}
		.talk-copy-code-btn.copied {
			background: #98c379 !important;
			color: #1e1e2e !important;
			border-color: #98c379 !important;
		}

		/* Atom One Dark Syntax Highlighting */
		.hljs-keyword,
		.hljs-selector-tag,
		.hljs-subst {
			color: #c678dd !important; /* purple */
			font-weight: 600 !important;
		}
		.hljs-title,
		.hljs-title.function_,
		.hljs-section {
			color: #61afef !important; /* blue */
		}
		.hljs-title.class_,
		.hljs-type,
		.hljs-built_in {
			color: #e5c07b !important; /* yellow */
		}
		.hljs-string,
		.hljs-attr,
		.hljs-template-tag,
		.hljs-template-variable,
		.hljs-addition {
			color: #98c379 !important; /* green */
		}
		.hljs-number,
		.hljs-literal,
		.hljs-symbol,
		.hljs-bullet {
			color: #d19a66 !important; /* orange */
		}
		.hljs-comment,
		.hljs-quote,
		.hljs-meta {
			color: #5c6370 !important; /* gray */
			font-style: italic !important;
		}
		.hljs-variable,
		.hljs-template-variable,
		.hljs-tag,
		.hljs-name,
		.hljs-selector-id,
		.hljs-selector-class,
		.hljs-regexp,
		.hljs-deletion {
			color: #e06c75 !important; /* coral/red */
		}
		.hljs-params {
			color: #abb2bf !important;
		}
		.hljs-operator,
		.hljs-punctuation {
			color: #56b6c2 !important; /* cyan */
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
		const preEl = code.parentElement
		if (code.dataset.talkHighlighted || (preEl && (preEl.querySelector('.talk-code-header-bar') || preEl.dataset.talkCodeEnhanced))) {
			return
		}
		code.dataset.talkHighlighted = 'true'
		code.classList.add('talk-highlighted')
		if (preEl) preEl.dataset.talkCodeEnhanced = 'true'

		const rawText = code.textContent || code.innerText || ''
		if (!rawText.trim()) return

		const combinedClasses = `${code.className} ${code.parentElement?.className || ''}`
		const highlighted = highlightCode(rawText, combinedClasses)

		// Set formatted HTML and proper hljs classes
		code.innerHTML = highlighted.html
		code.className = `hljs language-${highlighted.lang} talk-highlighted`

		// Add header bar with language badge and copy button to parent <pre>
		if (preEl && preEl.tagName === 'PRE' && !preEl.querySelector('.talk-code-header-bar')) {
			preEl.style.position = 'relative'

			const headerBar = document.createElement('div')
			headerBar.className = 'talk-code-header-bar'

			if (highlighted.lang && highlighted.lang !== 'plaintext') {
				const badge = document.createElement('span')
				badge.className = 'talk-code-lang-badge'
				badge.innerText = highlighted.lang
				headerBar.appendChild(badge)
			}

			const copyBtn = document.createElement('button')
			copyBtn.className = 'talk-copy-code-btn'
			copyBtn.type = 'button'
			copyBtn.innerText = '📋 Kopiuj'

			copyBtn.addEventListener('click', (e) => {
				e.stopPropagation()
				navigator.clipboard.writeText(rawText).then(() => {
					copyBtn.innerText = '✅ Skopiowano!'
					copyBtn.classList.add('copied')
					setTimeout(() => {
						copyBtn.innerText = '📋 Kopiuj'
						copyBtn.classList.remove('copied')
					}, 2000)
				})
			})

			headerBar.appendChild(copyBtn)
			preEl.insertBefore(headerBar, preEl.firstChild)
		}
	})
}

/**
 * Detect whether pasted text looks like multi-line code
 */
function isCodeSnippet(text: string): boolean {
	const lines = text.trim().split('\n')
	if (lines.length < 2) {
		return false
	}

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

	const hasIndentation = lines.some((line) => line.startsWith('  ') || line.startsWith('\t'))
	return matchCount >= 2 || (matchCount >= 1 && hasIndentation)
}

/**
 * Setup smart paste for code blocks
 */
function setupSmartCodePaste() {
	if ((window as any).__talk_smart_paste_initialized) return
	(window as any).__talk_smart_paste_initialized = true
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

			// Auto detect language with our robust detector
			const lang = detectLanguage(pastedText)
			const langTag = lang !== 'plaintext' ? lang : ''

			const formattedSnippet = `\`\`\`${langTag}\n${pastedText.trimEnd()}\n\`\`\`\n`

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
