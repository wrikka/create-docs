/**
 * Vite preview adapter implementation.
 * Provides WebSocket-based live preview integration.
 */

import type { PreviewPort } from "../ports/preview-port";

export const createVitePreviewAdapter = (): PreviewPort => ({
	start: async (_config?: unknown) => {
		// This will integrate with Vite HMR
	},

	stop: async () => {
		// This will stop the preview server
	},

	update: async (_content: string) => {
		// This will send content update via WebSocket
	},
});
