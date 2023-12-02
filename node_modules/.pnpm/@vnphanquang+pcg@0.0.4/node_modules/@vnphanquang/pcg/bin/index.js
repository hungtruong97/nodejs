/** WORK IN PROGRESS. MUCH TO IMPROVE */
import { Command } from 'commander';

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';
import { intro, outro, text, confirm } from '@clack/prompts';
import { underline, blue, red } from 'kleur/colors';

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
	const pkgPath = resolvePath('../package.json');
	const pkgJSON = readFileSync(pkgPath, 'utf-8');
	return JSON.parse(pkgJSON);
}

// declare the CLI program
const pkg = loadPackageJSON();
const program = new Command();
program
	.name('pcg')
	.description('Profile card generator')
	.version(pkg.version)

program
	.command('buddha')
	.action(() => {
		const txt = readFileSync(resolvePath('./templates/budda.txt'), 'utf-8');
		console.log('             ' + underline('Buddha bless you and your code'));
		console.log(blue(txt));
	});

/**
 * @param {number} lineLength 
 */
function printEmptyLine(lineLength) {
	console.log('│' + ' '.repeat(lineLength - 2) + '│');
}
/**
 * @param {number} lineLength 
 */
function printTopLine(lineLength) {
	console.log('╭' + '─'.repeat(lineLength - 2) + '╮');
}
/**
 * @param {number} lineLength 
 */
function printBottomLine(lineLength) {
	console.log('╰' + '─'.repeat(lineLength - 2) + '╯');
}

/**
 * @param {number} lineLength
 * @param {string} text
 * @param {number} textLength
 */
function printLine(lineLength, text, textLength) {
	console.log('│ ' + text + ' '.repeat(lineLength - textLength - 4) + ' │');
}

/**
 * @param {string} name
 * @param {string} email
 */
function printCard(name, email) {
		const lineLength = 60;

		printTopLine(lineLength);
		printEmptyLine(lineLength);
		printLine(lineLength, 'Name : ' + blue(name), name.length + 7);
		printEmptyLine(lineLength);
		printLine(lineLength, 'Email: ' + blue(email), email.length + 7);
		printEmptyLine(lineLength);
		printBottomLine(lineLength);
}

program
	.command('gen')
	.description('Generate a profile card ')
	.option('-t, --template <type>', 'output template to use for output, one of {"svg", "txt"}; defaults to "txt"') // we will just do txt for now
	.requiredOption('-n, --name <type>', 'name to print on card')
	.requiredOption('-e, --email <type>', 'email to print on card')
	.action((options) => {
		const { name = '', email = '' } = options;
		printCard(name, email);
	});

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

async function prompt() {
	const name = await text({
		message: 'Enter your name',
		placeholder: 'John Doe',
		validate(value) {
			if (value.length === 0) return red('Value is required!');
		},
	});
	const email = await text({
		message: 'Enter your email',
		placeholder: 'john_doe@example.com',
		validate(value) {
			if (value.length === 0) return red('Value is required!');
			if (!validateEmail(value)) return red('Invalid email!');
		},
	});
	const shouldContinue = await confirm({
		message: `Generating card with name ${blue(name)} and email ${blue(email)}. Confirm?`,
	});
	if (!shouldContinue) return prompt();
	return { name, email };
}

program
	.command('wizard')
	.description('User-friendly wizard for creating a profile card')
	.action(async () => {
		intro('Wizard for creating a profile card. Just follow instructions and you will be golden');
		const { name, email } = await prompt();
		printCard(name, email);
		outro('Enjoy');
	});

program.parse(process.argv);