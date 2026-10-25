/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { RNNOISE_WASM_BASE64, RNNOISE_WORKLET_CODE } from './rnnoiseAssets.ts'

let wasmBinaryCache: Uint8Array | null = null

function getWasmBinary(): Uint8Array {
	if (!wasmBinaryCache) {
		const binaryString = atob(RNNOISE_WASM_BASE64)
		const len = binaryString.length
		const bytes = new Uint8Array(len)
		for (let i = 0; i < len; i++) {
			bytes[i] = binaryString.charCodeAt(i)
		}
		wasmBinaryCache = bytes
	}
	return wasmBinaryCache
}

let workletModuleUrl: string | null = null

function getWorkletBlobUrl(): string {
	if (!workletModuleUrl) {
		const blob = new Blob([RNNOISE_WORKLET_CODE], { type: 'application/javascript' })
		workletModuleUrl = URL.createObjectURL(blob)
	}
	return workletModuleUrl
}

let isInitialized = false

/**
 * Initialize real-time AI background noise suppression by intercepting getUserMedia
 */
export function initNoiseSuppression() {
	if (isInitialized || typeof navigator === 'undefined' || !navigator.mediaDevices) {
		return
	}
	isInitialized = true

	const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)

	navigator.mediaDevices.getUserMedia = async function (constraints?: MediaStreamConstraints): Promise<MediaStream> {
		const rawStream = await originalGetUserMedia(constraints)

		if (!constraints || !constraints.audio) {
			return rawStream
		}

		// Check if RNNoise is enabled in Talk Desktop settings
		let enableRnnoise = true
		try {
			if (window.TALK_DESKTOP?.getAppConfig) {
				const configVal = await window.TALK_DESKTOP.getAppConfig('enableRnnoise')
				if (typeof configVal === 'boolean') {
					enableRnnoise = configVal
				}
			}
		} catch {
			// fallback default true
		}

		if (!enableRnnoise) {
			return rawStream
		}

		const rawAudioTrack = rawStream.getAudioTracks()[0]
		if (!rawAudioTrack) {
			return rawStream
		}

		try {
			const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
			if (!AudioContextClass) {
				return rawStream
			}

			const audioCtx = new AudioContextClass({ sampleRate: 48000 })
			if (audioCtx.state === 'suspended') {
				await audioCtx.resume()
			}

			await audioCtx.audioWorklet.addModule(getWorkletBlobUrl())

			const sourceNode = audioCtx.createMediaStreamSource(new MediaStream([rawAudioTrack]))
			const rnnoiseNode = new AudioWorkletNode(audioCtx, '@sapphi-red/web-noise-suppressor/rnnoise', {
				processorOptions: {
					maxChannels: 1,
					wasmBinary: getWasmBinary(),
				},
			})

			const destinationNode = audioCtx.createMediaStreamDestination()
			sourceNode.connect(rnnoiseNode)
			rnnoiseNode.connect(destinationNode)

			const cleanAudioTrack = destinationNode.stream.getAudioTracks()[0]
			if (!cleanAudioTrack) {
				return rawStream
			}

			// Clean up pipeline when either track stops
			const cleanup = () => {
				try {
					rnnoiseNode.port.postMessage('destroy')
					sourceNode.disconnect()
					rnnoiseNode.disconnect()
					audioCtx.close().catch(() => {})
				} catch {
					// Ignore cleanup errors
				}
			}

			rawAudioTrack.addEventListener('ended', () => {
				cleanAudioTrack.stop()
				cleanup()
			})

			cleanAudioTrack.addEventListener('ended', () => {
				rawAudioTrack.stop()
				cleanup()
			})

			// Propagate mute / un-mute enabled state
			const origMuteSet = Object.getOwnPropertyDescriptor(MediaStreamTrack.prototype, 'enabled')?.set
			if (origMuteSet) {
				// Keep clean track synchronized with raw track state
				cleanAudioTrack.enabled = rawAudioTrack.enabled
			}

			// Assemble composite stream with clean audio track and any video tracks
			const combinedTracks = [cleanAudioTrack, ...rawStream.getVideoTracks()]
			const cleanStream = new MediaStream(combinedTracks)

			console.info('[Nextcloud Talk] AI Noise Suppression (RNNoise) active on microphone stream.')
			return cleanStream
		} catch (err) {
			console.warn('[Nextcloud Talk] Failed to initialize RNNoise filter, using raw microphone stream:', err)
			return rawStream
		}
	}
}
