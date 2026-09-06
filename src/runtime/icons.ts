const categoryIcons: Record<string, string> = {
	Root: "i-mdi:file-tree-outline",
	"CLI Apps": "i-mdi:console",
	"Desktop Apps": "i-mdi:application-outline",
	"TUI Apps": "i-mdi:monitor",
	"WASM Apps": "i-mdi:application-braces-outline",
	"Web Apps": "i-mdi:web",
	Domain: "i-mdi:domain",
	Infra: "i-mdi:server-outline",
	Tools: "i-mdi:tools",
	Foundation: "i-mdi:layers-outline",
	Libraries: "i-mdi:bookshelf",
	"TUI Lib": "i-mdi:console-line",
	"Tauri Plugin": "i-mdi:power-plug-outline",
	"Services Apps": "i-mdi:cloud-outline",
	"Toolkits Apps": "i-mdi:toolbox-outline",
};

export function categoryIcon(category: string): string {
	return categoryIcons[category] ?? "i-mdi:folder-outline";
}

const typeIcons: Record<string, string> = {
	rust: "i-mdi:language-rust",
	npm: "i-mdi:nodejs",
	api: "i-mdi:api",
	md: "i-mdi:language-markdown-outline",
};

export function typeIcon(type: string): string {
	return typeIcons[type] ?? "i-mdi:file-document-outline";
}
