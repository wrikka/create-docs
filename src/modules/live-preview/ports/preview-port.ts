/**
 * Port for live preview operations.
 */

export type PreviewPort = {
	/**
	 * Start preview server.
	 */
	readonly start: (config: unknown) => Promise<void>;

	/**
	 * Stop preview server.
	 */
	readonly stop: () => Promise<void>;

	/**
	 * Send content update via WebSocket.
	 */
	readonly update: (content: string) => Promise<void>;
};
