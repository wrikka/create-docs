/**
 * Domain events for image optimization
 */
export interface OptimizationStartedEvent {
	readonly type: "OPTIMIZATION_STARTED";
	readonly timestamp: number;
	readonly imagePath: string;
}

export interface OptimizationCompletedEvent {
	readonly type: "OPTIMIZATION_COMPLETED";
	readonly timestamp: number;
	readonly imagePath: string;
	readonly sizeReduction: number;
}

export type ImageOptimizationDomainEvent =
	| OptimizationStartedEvent
	| OptimizationCompletedEvent;

export const createOptimizationStartedEvent = (
	imagePath: string,
): OptimizationStartedEvent => ({
	type: "OPTIMIZATION_STARTED",
	timestamp: Date.now(),
	imagePath,
});

export const createOptimizationCompletedEvent = (
	imagePath: string,
	sizeReduction: number,
): OptimizationCompletedEvent => ({
	type: "OPTIMIZATION_COMPLETED",
	timestamp: Date.now(),
	imagePath,
	sizeReduction,
});
