/** WORK IN PROGRESS. MUCH TO IMPROVE */
import { Command } from "commander";

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
import { intro, outro } from "@clack/prompts";
import { underline, blue } from "kleur/colors";

/**
 * A helper that helps resolve file path relative to this file.
 * Because a binary can be run from anywhere, we need this to reliably
 * load the correct path
 * @param {string} path
 */
function resolvePath(path) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  return resolve(__dirname, path);
}

/**
 * Load the package.json by reading it raw from the file and parsing with the global JSON api object
 * @returns {import('../package.json')}
 */
function loadPackageJSON() {
  const pkgPath = resolvePath("../package.json");
  const pkgJSON = readFileSync(pkgPath, "utf-8");
  return JSON.parse(pkgJSON);
}

// declare the CLI program
const pkg = loadPackageJSON();
const program = new Command();
program.name("pcg").description("Profile card generator").version(pkg.version);

program.name("buddha").action(() => {
  const txt = readFileSync(resolvePath("./templates/budda.txt"), "utf-8");
  console.log("             " + underline("Buddha bless you and your code"));
  console.log(blue(txt));
});

program
  .command("gen")
  .description("Generate a profile card ")
  .option(
    "-t, --template <type>",
    'output template to use for output, one of {"svg", "txt"}; defaults to "txt"',
    "txt"
  ) // we will just do txt for now
  .requiredOption("-n, --name <type>", "name to print on card")
  .requiredOption("-e, --email <type>", "email to print on card")
  .option("-c, --company <type>", "company to print on card")
  .action((options) => {
    const validateEmailRegex = /^\S+@\S+\.\S+$/;
    const length = 50;
    const logo = readFileSync(resolvePath("./templates/logo.txt"), "utf-8");
    const logoLines = logo.split("\n");

    const printDashedLine = (length, top = true) => {
      const dash = "\u2500";
      const cornerTopLeft = "\u250C";
      const cornerTopRight = "\u2510";
      const cornerBottomLeft = "\u2514";
      const cornerBottomRight = "\u2518";
      if (!top)
        return `${cornerBottomLeft}${dash.repeat(length)}${cornerBottomRight}`;
      return `${cornerTopLeft}${dash.repeat(length)}${cornerTopRight}`;
    };

    const printLine = (text, length, isColor = false) => {
      const vertical = "\u2502";
      const space = "\u0020";
      return `${vertical}${isColor ? blue(text) : text}${space.repeat(
        length - text.length
      )}${vertical}\n`;
    };

    if (!validateEmailRegex.test(options.email)) {
      console.log("Please enter a valid email address");
      return;
    }

    console.log(logoLines);

    console.log(
      `${printDashedLine(length)}\n` +
        logoLines.map((line) => printLine(line, length, true)).join("") +
        `${printLine(" Name: " + options.name, length)}` +
        `${printLine(" Email: " + options.email, length)}` +
        `${printLine(" Company: " + (options.company || "N/A"), length)}` +
        `${printDashedLine(length, false)}`
    );
  });

program.command("wizard").action(async () => {
  intro(
    "Wizard for creating a profile card. Just follow instructions and you will be golden"
  );
  // TODO: essentially do the same thing as in the `gen` command, but with step-by-step prompts
  // instead of let user provide the options via command line.
  // Read the clack docs
  // Must:
  // 1. Ask for name. User must provide nonempty string otherwise error
  // 2. Ask for email. User must provide a nonempty and valid email otherwise error
  // /   // 3. Confirm name and email. If user is not happy start over from 1
  console.log("Hello world");

  outro("Enjoy");
});

program.parse(process.argv);
