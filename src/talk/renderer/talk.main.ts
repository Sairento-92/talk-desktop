/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { setupWebPage } from '../../shared/setupWebPage.js'
import { setupScreenCaptureProtection } from './screensharing/screenCaptureProtection.ts'
import { createTalkDesktopApp } from './TalkDesktop.app.ts'
import { setupCodeEnhancer } from './utils/codeEnhancer.ts'
import { initNoiseSuppression } from './utils/noiseSuppression.ts'
import { setupPipManager } from './utils/pipManager.ts'
import { setupAudioCuesListener } from './utils/audioCues.ts'
import { setupCommandPalette } from './utils/commandPalette.ts'
import { setupMeetingSummary } from './utils/meetingSummary.ts'
import { setupChatPolls } from './utils/chatPolls.ts'
import { setupClipRecorder } from './utils/clipRecorder.ts'
import { setupOfflineGuard } from './utils/offlineGuard.ts'

import '../../shared/assets/styles.css'
import '@talk/src/icons.css'
import './talk.styles.css'

await setupWebPage()

setupScreenCaptureProtection()
setupCodeEnhancer()
initNoiseSuppression()
setupPipManager()
setupAudioCuesListener()
setupCommandPalette()
setupMeetingSummary()
setupChatPolls()
setupClipRecorder()
setupOfflineGuard()

await createTalkDesktopApp()

// HOTFIX: prevent invalid links <a href="#"> used in NcListItem as a button from breaking routing in Vue Router 4 with Hash History
// TODO: fix on NcListItem side and use real buttons instead of <a href="#">
document.addEventListener('click', (event) => {
	const emptyAnchorLink = (event.target as HTMLElement).closest('a[href="#"]')
	if (emptyAnchorLink) {
		event.preventDefault()
	}
})
