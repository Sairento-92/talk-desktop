/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * @module
 * Stateful service
 */

import axios from '@nextcloud/axios'
import { generateOcsUrl } from '@nextcloud/router'

/**
 * Get Nextcloud server capabilities
 *
 * @see https://docs.nextcloud.com/server/latest/developer_manual/client_apis/OCS/ocs-api-overview.html#capabilities-api
 * @param {string} serverUrl - Nextcloud server URL
 * @return {Promise<import('axios').AxiosResponse>}
 */
export async function getCapabilities(serverUrl) {
	const response = await axios.get(generateOcsUrl('cloud/capabilities', {}, { baseURL: serverUrl }), {
		headers: {
			'OCS-APIRequest': 'true',
		},
	})
	if (!response?.data?.ocs?.data?.capabilities) {
		throw new Error(`Invalid capabilities response from ${serverUrl}: server returned empty or non-OCS payload`)
	}
	return response.data.ocs.data
}

/**
 * Get current user metadata
 *
 * @see TODO: ADD LINKS
 * @param {string} serverUrl - Nextcloud server URL
 * @return {Promise<import('axios').AxiosResponse>}
 */
export async function getCurrentUserData(serverUrl) {
	const response = await axios.get(generateOcsUrl('cloud/user', {}, { baseURL: serverUrl }), {
		headers: {
			'OCS-APIRequest': 'true',
		},
	})
	if (!response?.data?.ocs?.data) {
		throw new Error(`Invalid user response from ${serverUrl}: server returned empty or non-OCS payload`)
	}
	return response.data.ocs.data
}
