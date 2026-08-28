/**
 * Simple-git adapter implementation.
 * Provides git history using simple-git library.
 */

import { ioError, pluginError } from "@create-docs/shared/errors";
import { simpleGit } from "simple-git";
import type { GitHistoryPort } from "../ports/git-history-port";
import type { GitCommit } from "../types/git-history";

export const createSimpleGitAdapter = (): GitHistoryPort => {
	const git = simpleGit();

	return {
		getLog: async (filePath: string, config?: unknown) => {
			try {
				const maxCommits =
					config && typeof config === "object" && "maxCommits" in config
						? (config as { maxCommits: number }).maxCommits
						: 10;

				const log = await git.log({ file: filePath, maxCount: maxCommits });

				return log.all.map((commit) => ({
					hash: commit.hash,
					author: commit.author_name,
					date: commit.date,
					message: commit.message,
				})) as GitCommit[];
			} catch (error) {
				throw pluginError("Git log failed", {
					context: { filePath, config, error: String(error) },
				});
			}
		},

		getFileAtCommit: async (filePath: string, commit: string) => {
			try {
				const content = await git.show([`${commit}:${filePath}`]);
				return content;
			} catch (error) {
				throw ioError(filePath, "Git show failed", error);
			}
		},
	};
};
