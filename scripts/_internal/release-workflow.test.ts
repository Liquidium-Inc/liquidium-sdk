import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";

test.each(["0.12.0-rc.0", "0.12.0"])(
  "should select the correct GitHub release flags for %s",
  (version) => {
    // given
    const tagName = `@liquidium/client@${version}`;
    const releaseNotesPath = "release-notes.md";

    const workflow = readFileSync(
      new URL("../../.github/workflows/release.yml", import.meta.url),
      "utf8"
    );

    const releaseScript = workflow.match(
      /name: Create GitHub release notes[\s\S]*?run: \|\n([\s\S]*)$/
    )?.[1];

    if (!releaseScript) {
      throw new Error("The GitHub release creation script is missing.");
    }

    const recordCommand = 'gh() { printf "%s\\n" "$@"; }';

    // when
    const commandArguments = execFileSync(
      "bash",
      ["-c", `${recordCommand}\n${releaseScript}`],
      {
        encoding: "utf8",
        env: {
          TAG_NAME: tagName,
          RELEASE_NOTES_PATH: releaseNotesPath,
        },
      }
    )
      .trim()
      .split("\n");

    // then
    const EXPECTED_RELEASE_FLAGS = version.includes("-")
      ? ["--prerelease", "--latest=false"]
      : ["--latest"];

    expect(commandArguments).toEqual([
      "release",
      "create",
      tagName,
      "--title",
      tagName,
      "--verify-tag",
      "--notes-file",
      releaseNotesPath,
      ...EXPECTED_RELEASE_FLAGS,
    ]);
  }
);
