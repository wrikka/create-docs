export type ValidationError = Readonly<{
	message: string;
	line?: number;
	severity: "error" | "warning";
}>;

export type ValidationOptions = Readonly<{
	checkHeadings?: boolean;
	checkLinks?: boolean;
	checkImages?: boolean;
	checkCodeBlocks?: boolean;
}>;

export type ValidationResult = Readonly<{
	valid: boolean;
	errors: readonly ValidationError[];
}>;
