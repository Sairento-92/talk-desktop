/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

let mediaRecorder: MediaRecorder | null = null
let recordedChunks: Blob[] = []
let recordingIndicatorEl: HTMLElement | null = null
let recordingStartTime = 0
let recordingTimerInterval: any = null
let previewModalEl: HTMLElement | null = null

export async function startRecordingClip() {
	if (mediaRecorder && mediaRecorder.state === 'recording') {
		stopRecordingClip()
		return
	}

	let streamToRecord: MediaStream | null = null

	// 1. Try to record active call video if in a call
	const mainVideo = document.querySelector('video') as HTMLVideoElement | null
	if (mainVideo && mainVideo.srcObject instanceof MediaStream) {
		streamToRecord = mainVideo.srcObject
	}

	// 2. Fallback to getDisplayMedia (screen/window capture)
	if (!streamToRecord) {
		try {
			streamToRecord = await navigator.mediaDevices.getDisplayMedia({
				video: true,
				audio: true,
			})
		} catch (e) {
			console.warn('[ClipRecorder] User cancelled or display media failed:', e)
			return
		}
	}

	try {
		recordedChunks = []
		const options = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
			? { mimeType: 'video/webm;codecs=vp9,opus' }
			: { mimeType: 'video/webm' }

		mediaRecorder = new MediaRecorder(streamToRecord, options)

		mediaRecorder.ondataavailable = (e) => {
			if (e.data && e.data.size > 0) {
				recordedChunks.push(e.data)
			}
		}

		mediaRecorder.onstop = () => {
			showRecordingPreview(new Blob(recordedChunks, { type: 'video/webm' }))
			removeRecordingIndicator()
		}

		mediaRecorder.start(250) // collect 250ms chunks
		recordingStartTime = Date.now()
		showRecordingIndicator()
	} catch (e) {
		console.error('[ClipRecorder] Failed to start MediaRecorder:', e)
	}
}

export function stopRecordingClip() {
	if (mediaRecorder && mediaRecorder.state === 'recording') {
		mediaRecorder.stop()
		mediaRecorder = null
	}
	removeRecordingIndicator()
}

function showRecordingIndicator() {
	if (recordingIndicatorEl) return

	recordingIndicatorEl = document.createElement('div')
	recordingIndicatorEl.id = 'talk-clip-recording-pill'
	recordingIndicatorEl.innerHTML = `
		<span class="rec-dot"></span>
		<span class="rec-time">REC 00:00</span>
		<button class="rec-stop-btn">⏹️ Zakończ</button>
	`

	const style = document.createElement('style')
	style.id = 'talk-clip-recording-styles'
	style.textContent = `
		#talk-clip-recording-pill {
			position: fixed;
			top: 50px;
			left: 50%;
			transform: translateX(-50%);
			background: rgba(20, 24, 30, 0.95);
			border: 1px solid #ff4742;
			border-radius: 30px;
			padding: 6px 16px;
			display: flex;
			align-items: center;
			gap: 12px;
			z-index: 9999999;
			box-shadow: 0 8px 24px rgba(255, 71, 66, 0.35);
			color: white;
			font-size: 13px;
			font-weight: 600;
		}
		.rec-dot {
			width: 10px; height: 10px; border-radius: 50%;
			background: #ff4742;
			animation: blink 1s infinite alternate;
		}
		@keyframes blink { from { opacity: 1; } to { opacity: 0.2; } }
		.rec-stop-btn {
			background: #ff4742; border: none; color: white;
			padding: 4px 10px; border-radius: 14px; cursor: pointer;
			font-size: 12px; font-weight: 600;
		}
		.rec-stop-btn:hover { background: #e0322d; }
	`
	document.head.appendChild(style)
	document.body.appendChild(recordingIndicatorEl)

	recordingIndicatorEl.querySelector('.rec-stop-btn')?.addEventListener('click', stopRecordingClip)

	recordingTimerInterval = setInterval(() => {
		if (recordingIndicatorEl) {
			const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000)
			const mins = Math.floor(elapsed / 60).toString().padStart(2, '0')
			const secs = (elapsed % 60).toString().padStart(2, '0')
			const timeEl = recordingIndicatorEl.querySelector('.rec-time')
			if (timeEl) timeEl.textContent = `REC ${mins}:${secs}`
		}
	}, 1000)
}

function removeRecordingIndicator() {
	if (recordingTimerInterval) {
		clearInterval(recordingTimerInterval)
		recordingTimerInterval = null
	}
	if (recordingIndicatorEl) {
		recordingIndicatorEl.remove()
		recordingIndicatorEl = null
	}
	const style = document.getElementById('talk-clip-recording-styles')
	style?.remove()
}

function showRecordingPreview(blob: Blob) {
	if (previewModalEl) {
		previewModalEl.remove()
	}

	const videoUrl = URL.createObjectURL(blob)

	previewModalEl = document.createElement('div')
	previewModalEl.id = 'talk-clip-preview-backdrop'
	previewModalEl.innerHTML = `
		<div class="clip-modal-container">
			<div class="clip-modal-header">
				<h3>🎥 Nagrany Wycinek Wideo (${(blob.size / (1024 * 1024)).toFixed(1)} MB)</h3>
				<button class="clip-close-btn" title="Zamknij (Esc)">✕</button>
			</div>
			<div class="clip-modal-body">
				<video class="clip-video-preview" src="${videoUrl}" controls autoplay></video>
			</div>
			<div class="clip-modal-footer">
				<button class="clip-btn" id="clip-discard-btn">Odrzuć</button>
				<button class="clip-btn" id="clip-download-btn">💾 Pobierz plik (.webm)</button>
				<button class="clip-btn primary" id="clip-chat-btn">📤 Wyślij na czat</button>
			</div>
		</div>
	`

	const style = document.createElement('style')
	style.id = 'talk-clip-modal-styles'
	style.textContent = `
		#talk-clip-preview-backdrop {
			position: fixed;
			top: 0; left: 0; right: 0; bottom: 0;
			background: rgba(0, 0, 0, 0.75);
			backdrop-filter: blur(8px);
			z-index: 999999;
			display: flex;
			align-items: center;
			justify-content: center;
			animation: fadeIn 0.15s ease-out;
		}
		.clip-modal-container {
			width: 680px;
			max-width: 92vw;
			background: var(--color-main-background, #1d232a);
			border: 1px solid var(--color-border, rgba(255, 255, 255, 0.15));
			border-radius: 14px;
			display: flex;
			flex-direction: column;
			box-shadow: 0 25px 50px rgba(0,0,0,0.6);
			overflow: hidden;
		}
		.clip-modal-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 16px 20px;
			border-bottom: 1px solid var(--color-border, rgba(255, 255, 255, 0.1));
		}
		.clip-modal-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: #0082c9; }
		.clip-close-btn { background: none; border: none; font-size: 18px; color: #888; cursor: pointer; }
		.clip-close-btn:hover { color: white; }
		.clip-modal-body { padding: 16px; background: #0c0e12; display: flex; justify-content: center; }
		.clip-video-preview { max-width: 100%; max-height: 55vh; border-radius: 8px; }
		.clip-modal-footer {
			display: flex;
			justify-content: flex-end;
			gap: 10px;
			padding: 14px 20px;
			background: rgba(0, 0, 0, 0.15);
			border-top: 1px solid var(--color-border, rgba(255, 255, 255, 0.1));
		}
		.clip-btn {
			background: #2a313d; border: 1px solid rgba(255,255,255,0.15); color: white;
			padding: 8px 16px; border-radius: 8px; font-size: 13px; cursor: pointer;
		}
		.clip-btn.primary { background: #0082c9; border-color: #0082c9; }
		.clip-btn.primary:hover { background: #0099ec; }
	`
	document.head.appendChild(style)
	document.body.appendChild(previewModalEl)

	const close = () => {
		URL.revokeObjectURL(videoUrl)
		previewModalEl?.remove()
		previewModalEl = null
		document.getElementById('talk-clip-modal-styles')?.remove()
	}

	previewModalEl.querySelector('.clip-close-btn')?.addEventListener('click', close)
	previewModalEl.querySelector('#clip-discard-btn')?.addEventListener('click', close)

	// Download button
	previewModalEl.querySelector('#clip-download-btn')?.addEventListener('click', () => {
		const a = document.createElement('a')
		a.href = videoUrl
		a.download = `Wycinek-Talk-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`
		a.click()
	})

	// Send to chat
	previewModalEl.querySelector('#clip-chat-btn')?.addEventListener('click', () => {
		const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement | null
		if (fileInput) {
			const file = new File([blob], `Wycinek-Talk-${Date.now()}.webm`, { type: 'video/webm' })
			const dataTransfer = new DataTransfer()
			dataTransfer.items.add(file)
			fileInput.files = dataTransfer.files
			fileInput.dispatchEvent(new Event('change', { bubbles: true }))
			close()
		}
	})
}

/**
 * Setup clip recorder listeners
 */
export function setupClipRecorder() {
	window.addEventListener('talk:record:toggle', () => {
		if (mediaRecorder && mediaRecorder.state === 'recording') {
			stopRecordingClip()
		} else {
			startRecordingClip()
		}
	})
}
