// Navigation Domain Schemas - Arktype validation schemas
// Following /follow-arktype workflow for type-safe runtime validation

import { validationError } from "@create-docs/shared/errors";
import { err, ok, type Result } from "@create-docs/shared/types/result";
import { type } from "arktype";
import type {
	NavItem,
	NavSection,
	SidebarGroup,
	SidebarItem,
} from "../../types";

/**
 * Nav Item Schema
 */
export const navItemSchema = type({
	label: "string >= 1",
	"href?": "string >= 1",
});

/**
 * Nav Section Schema
 */
export const navSectionSchema = type({
	title: "string >= 1",
	items: "unknown[]",
});

/**
 * Sidebar Item Schema
 */
export const sidebarItemSchema = type({
	title: "string >= 1",
	slug: "string >= 1",
});

/**
 * Sidebar Group Schema
 */
export const sidebarGroupSchema = type({
	title: "string >= 1",
	items: "unknown[]",
});

export const validateNavItem = (
	i: NavItem,
	path: string,
): Result<NavItem, ReturnType<typeof validationError>> => {
	const result = navItemSchema(i);
	if (result instanceof type.errors) {
		return err(validationError(result.summary, { path }));
	}
	return ok(i);
};

export const validateNavSection = (
	s: NavSection,
	path: string,
): Result<NavSection, ReturnType<typeof validationError>> => {
	const result = navSectionSchema(s);
	if (result instanceof type.errors) {
		return err(validationError(result.summary, { path }));
	}
	return ok(s);
};

export const validateSidebarItem = (
	i: SidebarItem,
	path: string,
): Result<SidebarItem, ReturnType<typeof validationError>> => {
	const result = sidebarItemSchema(i);
	if (result instanceof type.errors) {
		return err(validationError(result.summary, { path }));
	}
	return ok(i);
};

export const validateSidebarGroup = (
	g: SidebarGroup,
	path: string,
): Result<SidebarGroup, ReturnType<typeof validationError>> => {
	const result = sidebarGroupSchema(g);
	if (result instanceof type.errors) {
		return err(validationError(result.summary, { path }));
	}
	return ok(g);
};
