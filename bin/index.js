/** WORK IN PROGRESS. MUCH TO IMPROVE */
import { Command } from "commander";
import { get, post } from "./analytics.js";

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
import { google, fourdigit, batman } from "./logo.js";

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
  .option("-c, --company <type>", "company to print on card", "4Digit")
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
      <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <style>
          .profile-card { /* Your styles here */ }
          .profile-text { /* Your styles here */ }
        </style>
        <rect width="400" height="300" fill="white" stroke="black" stroke-width="5" />
        <svg x="25" y="100" xmlns="http://www.w3.org/2000/svg" width="202" height="33.031" viewBox="0 0 202 33.031" role="img" aria-label="FOUR DIGIT">
          <path id="logo" class="cls-1" d="M80.679,22.984H59.557L40,45.381l0.006,1.6h19.71a0.652,0.652,0,0,1,.662.632l-0.006,6.444v0a0.653,0.653,0,0,1-.669.635H55.154v1.311H80.679c10.517,0,18.149-6.943,18.149-16.51S91.2,22.984,80.679,22.984ZM68.161,54.06a0.653,0.653,0,0,1-.669.635h-4.5a0.653,0.653,0,0,1-.668-0.625l0.006-6.449h0a0.652,0.652,0,0,1,.666-0.634H67.5a0.652,0.652,0,0,1,.666.632l-0.006,6.444v0Zm-5.838-9.014V24.929a0.655,0.655,0,0,1,.669-0.633h4.5a0.652,0.652,0,0,1,.669.633h0V45.043h0a0.653,0.653,0,0,1-.669.634h-4.5A0.652,0.652,0,0,1,62.323,45.046ZM59.7,24.883l0,0A0.382,0.382,0,0,1,60,24.749a0.369,0.369,0,0,1,.379.359V45.043h0a0.653,0.653,0,0,1-.669.634H42.511a0.369,0.369,0,0,1-.379-0.359A0.344,0.344,0,0,1,42.22,45.1l0,0ZM80.679,54.694h-9.9a0.653,0.653,0,0,1-.669-0.635h0V24.929h0a0.652,0.652,0,0,1,.665-0.633h9.906c9.358,0,16.151,6.392,16.151,15.2S90.037,54.694,80.679,54.694ZM115.6,35.622h0.312a0.378,0.378,0,0,1,.387.366h0v7a0.377,0.377,0,0,1-.387.365H115.6v1.44h3.032v-1.44h-0.312a0.378,0.378,0,0,1-.387-0.366v-2.3a0.378,0.378,0,0,1,.387-0.366h3.424V38.88h-3.424a0.378,0.378,0,0,1-.387-0.366h0V35.988h0a0.378,0.378,0,0,1,.387-0.366h3.038a0.377,0.377,0,0,1,.386.365v0.47h1.541V34.183H115.6v1.44Zm18.936-1.44a5.5,5.5,0,0,0-5.668,5.291,5.756,5.756,0,0,0,11.479,0A5.518,5.518,0,0,0,134.539,34.183Zm0,9.149a3.85,3.85,0,1,1,4.167-3.859A3.917,3.917,0,0,1,134.539,43.332Zm18.662-7.71h0.311a0.377,0.377,0,0,1,.387.366h0V40.97a2.635,2.635,0,0,1-5.24.056V35.987h0a0.378,0.378,0,0,1,.387-0.366h0.312v-1.44h-3.049v1.44h0.312a0.378,0.378,0,0,1,.387.366h0v5.094a4.31,4.31,0,0,0,8.543,0V35.988h0a0.378,0.378,0,0,1,.387-0.366h0.312v-1.44H153.2v1.44ZM170.445,40.7a3.452,3.452,0,0,0,1.8-2.964,3.809,3.809,0,0,0-3.907-3.555h-4.405v1.44h0.312a0.378,0.378,0,0,1,.387.366h0v7h0a0.378,0.378,0,0,1-.387.366h-0.312v1.44h3.018v-1.44h-0.311a0.377,0.377,0,0,1-.387-0.366h0V41.674h0a0.376,0.376,0,0,1,.386-0.365h1.66a3.619,3.619,0,0,0,.534-0.047l1.956,3.532h1.73v-1.44h-0.62Zm-2.207-.833h-1.6a0.378,0.378,0,0,1-.387-0.367h0V35.988a0.377,0.377,0,0,1,.386-0.366h1.6A2.139,2.139,0,1,1,168.238,39.868Zm16.1-5.7h-3.908v1.51h0.313a0.377,0.377,0,0,1,.387.366h0V42.93h0a0.377,0.377,0,0,1-.387.366h-0.313v1.5h3.908c3.271-.028,5.908-2.384,5.908-5.3S187.61,34.211,184.339,34.169Zm-0.08,9.127h-1.042a0.377,0.377,0,0,1-.387-0.366h0V36.044h0a0.377,0.377,0,0,1,.387-0.366h1.042a4.072,4.072,0,0,1,4.289,3.809A4.072,4.072,0,0,1,184.259,43.3ZM196.7,35.622h0.312a0.378,0.378,0,0,1,.387.366h0v7h0a0.378,0.378,0,0,1-.387.366H196.7v1.44h2.984v-1.44h-0.311a0.377,0.377,0,0,1-.387-0.366v-7h0a0.378,0.378,0,0,1,.387-0.366h0.311v-1.44H196.7v1.44Zm17.049,4.7h0.741a0.377,0.377,0,0,1,.387.366h0V40.32h0v2.068a4.393,4.393,0,0,1-2.547.933,4.067,4.067,0,0,1-4.252-3.9,4.039,4.039,0,0,1,4.252-3.749,4.437,4.437,0,0,1,2.707.821l0.589-1.33a5.141,5.141,0,0,0-3.3-.962c-3.345,0-6.05,2.277-6.05,5.22,0,2.971,2.7,5.375,6.05,5.375a7.174,7.174,0,0,0,2.243-.414,0.277,0.277,0,0,1,.082-0.012,0.218,0.218,0,0,1,.222.211v0.215H216.5V38.88h-2.757v1.44Zm9.783-4.7h0.312a0.377,0.377,0,0,1,.387.366v7h0a0.377,0.377,0,0,1-.386.366h-0.313v1.44h2.985v-1.44H226.2a0.378,0.378,0,0,1-.387-0.366v-7h0a0.379,0.379,0,0,1,.387-0.366h0.312v-1.44h-2.985v1.44Zm8.96-1.44v2.274h1.619V35.987a0.378,0.378,0,0,1,.387-0.365h1.513a0.377,0.377,0,0,1,.386.366h0v7h0a0.377,0.377,0,0,1-.386.366h-0.312v1.44h3.033v-1.44h-0.312a0.377,0.377,0,0,1-.386-0.365v-7a0.377,0.377,0,0,1,.387-0.365h1.577a0.378,0.378,0,0,1,.387.365v0.469H242V34.183h-9.512Z" transform="translate(-40 -22.969)" fill="#303030" fill-rule="evenodd"></path>
        </svg>
        <text x="25" y="200" class="profile-card" text-anchor="left">Name: ${
          options.name
        }</text>
        <text x="25" y="225" class="profile-text" text-anchor="left">Email: ${
          options.email
        }</text>
        ${
          options.company &&
          `<text x="25" y="250" class="profile-text" text-anchor="left">
              Company: ${options.company}
            </text>`
        }
      </svg>`;

    //Print out data in console
    console.log(data);

    //Create output file if specified
    if (options.output === "txt") {
      writeFileSync(
        resolvePath("./templates/card.txt"),
        stripAnsiColorCodes(data)
      );
    } else if (options.output === "svg") {
      writeFileSync(resolvePath("./templates/card.svg"), svgData);
    }
  });

//Generate stats
program
  .command("stats")
  .description("Generate stats")
  .action(async () => {
    const { executions, totalCount } = await get();
    console.log(
      `pcg has been executed for ${totalCount} times, by ${executions.length} users. Here's one of them: `
    );
    const length = 50;
    const logo = readFileSync(resolvePath("./templates/bat.txt"), "utf-8");
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

    //Print a card from of a random item
    const randomId = Math.floor((Math.random() + 0.001) * executions.length);
    const card =
      `${printDashedLine(length)}\n` +
      logoLines.map((line) => printLine(line, length, true)).join("") +
      `${printLine(" Name: " + executions[randomId].name, length)}` +
      `${printLine(" Email: " + executions[randomId].email, length)}` +
      `${printDashedLine(length, false)}`;

    console.log(card);
  });

//Add a new user to the database
program
  .command("post")
  .description("Add new users")
  .requiredOption("-e, --email <email>")
  .requiredOption("-n, --name <name>")
  .action(async (options) => {
    const validateEmailRegex = /^\S+@\S+\.\S+$/;
    const validateNameRegex = /^[A-Za-z]+ [A-Za-z]+$/;

    //validate email
    if (!validateEmailRegex.test(options.email)) {
      console.log("Please enter a valid email address");
      return;
    }

    //Validate name
    if (!validateNameRegex.test(options.name)) {
      console.log(
        `Please enter a valid name following the format "First_Name Last_Name"`
      );
      return;
    }

    await post(options.email, options.name);
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
    let logo, logoLines, svgLogo;

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

    //Strip ansi color codes
    const stripAnsiColorCodes = (text) => {
      return text.replace(/\x1B\[\d+m/g, "");
    };

    //Main flow
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

      if (isCancel(name)) {
        cancel("You cancelled the wizard");
        return process.exit(0);
      }

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
      if (isCancel(email)) {
        cancel("You cancelled the wizard");
        return process.exit(0);
      }

      //Ask for company
      const selectCompany = await select({
        message: "Which is your company?",
        options: [
          { value: "4D", label: "4Digit" },
          { value: "Google", label: "Google" },
          {
            value: "Bat Organization",
            label: `I don't work. I'm fucking Batman`,
          },
        ],
      });

      if (isCancel(selectCompany)) {
        cancel("You cancelled the wizard");
        return process.exit(0);
      }

      switch (selectCompany) {
        case "4D":
          logo = readFileSync(resolvePath("./templates/4d.txt"), "utf-8");
          logoLines = logo.split("\n");
          svgLogo = fourdigit;
          break;
        case "Google":
          logo = readFileSync(resolvePath("./templates/google.txt"), "utf-8");
          logoLines = logo.split("\n");
          svgLogo = google;
          break;
        case "Bat Organization":
          logo = readFileSync(resolvePath("./templates/bat.txt"), "utf-8");
          logoLines = logo.split("\n");
          svgLogo = batman;
          break;
      }

      //Ask for confirmation
      const confirmation = await confirm({
        message: `\nYour name is ${name}.\n Your email is ${email}.\n Your company is ${selectCompany}.\n Is your information correct?\n`,
      });

      if (isCancel(confirmation)) {
        cancel("You cancelled the wizard");
        return process.exit(0);
      }

      //Ask for save confirmation
      const saveConfirmation = await confirm({
        message: `Do you want to save your profile card?`,
      });

      if (isCancel(saveConfirmation)) {
        cancel("You cancelled the wizard");
        return process.exit(0);
      }

      //Ask for save format
      const saveFormat = await select({
        message: `In what format do you want to save your profile card?`,
        options: [
          { value: "txt", label: "txt" },
          { value: "svg", label: "svg" },
        ],
      });

      if (confirmation) {
        //Create spinner
        const s = spinner();
        try {
          s.start("Generating card");
          await sleep(1000);
          s.stop("Card generated");

          const data =
            `${printDashedLine(length)}\n` +
            logoLines.map((line) => printLine(line, length, true)).join("") +
            `${printLine(" Name: " + name, length)}` +
            `${printLine(" Email: " + email, length)}` +
            `${printLine(" Company: " + (selectCompany || "N/A"), length)}` +
            `${printDashedLine(length, false)}`;

          const svgData = `
            <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
              <style>
                .profile-card { /* Your styles here */ }
                .profile-text { /* Your styles here */ }
              </style>
              <rect width="400" height="300" fill="white" stroke="black" stroke-width="5" />
              ${svgLogo}
              <text x="25" y="200" class="profile-card" text-anchor="left">Name: ${name}</text>
              <text x="25" y="225" class="profile-text" text-anchor="left">Email: ${email}</text>
              <text x="25" y="250" class="profile-text" text-anchor="left">
                Company: ${selectCompany}
              </text>
            </svg>`;

          //print out data in console
          console.log(`\nHere is your card:\n` + `${data}`);

          if (saveConfirmation) {
            //Create output file if specified
            if (saveFormat === "txt") {
              writeFileSync(
                resolvePath("./templates/card.txt"),
                stripAnsiColorCodes(data)
              );
            } else if (saveFormat === "svg") {
              writeFileSync(resolvePath("./templates/card.svg"), svgData);
            }
          }

          outro("Thanks for using our card generator");
          isConfirmed = true;
        } catch (err) {
          console.log(err.message);
        }
      }
    }
  });

program.parse(process.argv);
