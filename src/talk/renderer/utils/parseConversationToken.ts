/*!
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { t } from '@nextcloud/l10n'
import { appData } from '../../../app/AppData.js'
import { createUrl } from '../../../shared/utils.ts'

/**
 * Parse URL string to get current server conversation token or error message if invalid
 *
 * @param maybeConversationUrl - URL
 */
export function parseConversationToken(maybeConversationUrl: string): { token: string, error: string } {
	const serverUrl = appData.serverUrl as string | null
	if (!maybeConversationUrl || !serverUrl) {
		return { error: '', token: '' }
	}

	const url = createUrl(maybeConversationUrl)
	if (!url) {
		return { error: t('talk_desktop', 'Invalid URL'), token: '' }
	}

	if (!maybeConversationUrl.startsWith(serverUrl)) {
		return { error: t('talk_desktop', 'Opening conversations from other servers is not currently supported'), token: '' }
	}

	let pathname = maybeConversationUrl.slice(serverUrl.length)
	const indexPhp = pathname.indexOf('/index.php')
	if (indexPhp === 0) {
		pathname = pathname.slice('/index.php'.length)
	}

	const [isMatched, token] = pathname.match(/^\/call\/([a-z0-9]+)\/?$/i) ?? [false, '']
	if (!isMatched) {
		return { error: t('talk_desktop', 'Invalid URL'), token: '' }
	}

	return { token, error: '' }
}
