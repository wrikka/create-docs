/**
 * Live Editor Virtual Module
 *
 * Virtual module that provides live editor UI components
 */

export const LIVE_EDITOR_MODULE_ID = "virtual:create-docs-live-editor";

export const liveEditorVirtualModuleCode = `
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

loader.config({ monaco });

export { default } from './live-editor-component';
`;
