/** WORK IN PROGRESS. MUCH TO IMPROVE */
import { Command } from "commander";

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
import {
  intro,
  outro,
  text,
  confirm,
  select,
  spinner,
  isCancel,
  cancel,
} from "@clack/prompts";
import { setTimeout as sleep } from "timers/promises";
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

program
  .command("buddha")
  .description("Give you peace of mind")
  .action(() => {
    const txt = readFileSync(resolvePath("./templates/budda.txt"), "utf-8");
    console.log("             " + underline("Buddha bless you and your code"));
    console.log(blue(txt));
  });

//Generating profile card.
program
  .command("gen")
  .description("Generate a profile card ")
  .option("-o, --output <type>", "write output to file if specified", "txt")
  .requiredOption("-n, --name <type>", "name to print on card")
  .requiredOption("-e, --email <type>", "email to print on card")
  .option("-c, --company <type>", "company to print on card")
  .action((options) => {
    const validateEmailRegex = /^\S+@\S+\.\S+$/;
    const length = 50;
    const logo = readFileSync(resolvePath("./templates/4d.txt"), "utf-8");
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

    //Strip ansi color codes
    const stripAnsiColorCodes = (text) => {
      return text.replace(/\x1B\[\d+m/g, "");
    };

    const data =
      `${printDashedLine(length)}\n` +
      logoLines.map((line) => printLine(line, length, true)).join("") +
      `${printLine(" Name: " + options.name, length)}` +
      `${printLine(" Email: " + options.email, length)}` +
      `${printLine(" Company: " + (options.company || "N/A"), length)}` +
      `${printDashedLine(length, false)}`;

    const svgData = `
      <svg width="500" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="500" height="400" x="50" y="50" fill="none" stroke="black" stroke-width="5" />
        <text x="250" y="200" text-anchor="middle">${options.name}</text>
      </svg>
     `;

    //Print out data in console
    console.log(data);

    //Create output file if specified
    if (options.output === "txt") {
      writeFileSync(
        resolvePath("./templates/card.txt"),
        stripAnsiColorCodes(data)
      );
    } else {
      writeFileSync(resolvePath("./templates/card.svg"), svgData);
    }
  });

//Create a wizard for generating profile card.
program
  .command("wizard")
  .description("Step by step walk through to create a profile card.")
  .action(async () => {
    intro(
      "Wizard for creating a profile card. Just follow instructions and you will be golden"
    );

    const validateEmailRegex = /^\S+@\S+\.\S+$/;
    const length = 50;
    let logo, logoLines;

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

    let isConfirmed;
    while (isConfirmed === false || isConfirmed === undefined) {
      //Ask for name
      const name = await text({
        message: "What is your name?",
        placeholder: "Enter your name",
        validate(input) {
          if (input.length === 0) return `Your name is required`;
        },
      });

      //Ask for email
      const email = await text({
        message: "What is your email?",
        placeholder: "Enter your email",
        validate(input) {
          if (input.length === 0) return `Your email is required`;
          if (!validateEmailRegex.test(input))
            return `Please enter a valid email address`;
        },
      });

      //Ask for company
      const selectCompany = await select({
        message: "Which is your company?",
        options: [
          { value: "4D", label: "4Digit" },
          { value: "Google", label: "Google" },
          { value: "None", label: `I'm Batman` },
        ],
      });

      switch (selectCompany) {
        case "4D":
          logo = readFileSync(resolvePath("./templates/4d.txt"), "utf-8");
          logoLines = logo.split("\n");
          break;
        case "Google":
          logo = readFileSync(resolvePath("./templates/google.txt"), "utf-8");
          logoLines = logo.split("\n");
          break;
        case "None":
          logo = readFileSync(resolvePath("./templates/bat.txt"), "utf-8");
          logoLines = logo.split("\n");
          break;
      }

      //Ask for confirmation
      const confirmation = await confirm({
        message: `\nYour name is ${name}.\n Your email is ${email}.\n Your company is ${selectCompany}.\n Do you want to continue?\n`,
      });

      if (confirmation) {
        //Create spinner
        const s = spinner();
        try {
          s.start("Generating card");
          await sleep(1000);
          s.stop("Card generated");
          console.log(
            `\nHere is your card:\n` +
              `${printDashedLine(length)}\n` +
              logoLines.map((line) => printLine(line, length, true)).join("") +
              `${printLine(" Name: " + name, length)}` +
              `${printLine(" Email: " + email, length)}` +
              `${printLine(" Company: " + (selectCompany || "N/A"), length)}` +
              `${printDashedLine(length, false)}`
          );
          outro("Thanks for using our card generator");
          isConfirmed = true;
        } catch (err) {
          console.log(err);
        }
      } else {
        // console.log("Card cancelled");
        // outro("Thanks for using our card generator");
      }
    }
  });

program.parse(process.argv);
