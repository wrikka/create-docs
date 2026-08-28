import type {
	BadgeVariant,
	NavItem,
	NavSection,
	SidebarGroup,
	SidebarItem,
} from "@create-docs/modules/navigation";

export type { BadgeVariant, NavItem, NavSection, SidebarGroup, SidebarItem };

export type AuthType = "bearer" | "apiKey" | "oauth2";
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiEndpoint {
	readonly method: HttpMethod;
	readonly path: string;
	readonly description: string;
	readonly group: string;
	readonly requiresAuth?: boolean;
	readonly requestBody?: {
		readonly description: string;
		readonly example?: string;
		readonly schema?: Record<string, unknown>;
	};
	readonly response?: {
		readonly description: string;
		readonly example?: string;
		readonly schema?: Record<string, unknown>;
	};
	readonly queryParams?: readonly {
		readonly name: string;
		readonly type: string;
		readonly description: string;
		readonly required?: boolean;
		readonly default?: string;
	}[];
	readonly pathParams?: readonly {
		readonly name: string;
		readonly type: string;
		readonly description: string;
	}[];
	readonly headers?: readonly {
		readonly name: string;
		readonly type: string;
		readonly description: string;
		readonly required?: boolean;
	}[];
}

export interface ThemeConfig {
	readonly primaryColor?: string;
	readonly darkMode?: boolean;
	readonly accentColor?: string;
	readonly codeTheme?: string;
}

export interface SiteConfig {
	readonly title: string;
	readonly description: string;
	readonly logo?: string;
	readonly logoDark?: string;
	readonly github?: string;
	readonly twitter?: string;
	readonly version?: string;
}

export interface ApiConfig {
	readonly baseUrl: string;
	readonly authType: AuthType;
	readonly authHeader?: string;
	readonly defaultHeaders?: Record<string, string>;
	readonly testerEnabled?: boolean;
	readonly endpoints?: readonly ApiEndpoint[];
}

export interface SearchConfig {
	readonly enabled?: boolean;
	readonly placeholder?: string;
	readonly shortcuts?: readonly string[];
}

export interface EditLinkConfig {
	readonly enabled?: boolean;
	readonly baseUrl?: string;
	readonly branch?: string;
}

export interface LastUpdatedConfig {
	readonly enabled?: boolean;
	readonly format?: string;
}

export interface DocsConfig {
	readonly site: SiteConfig;
	readonly nav: readonly NavSection[];
	readonly sidebar: readonly SidebarGroup[];
	readonly theme?: ThemeConfig;
	readonly api?: ApiConfig;
	readonly search?: SearchConfig;
	readonly editLink?: EditLinkConfig;
	readonly lastUpdated?: LastUpdatedConfig;
}

/** Plugin-specific options layered on top of DocsConfig. */
export interface DocsPluginOptions {
	readonly docsDir?: string;
	readonly baseRoute?: string;
}

export type ResolvedDocsConfig = DocsConfig & {
	readonly docsDir: string;
	readonly baseRoute: string;
};
