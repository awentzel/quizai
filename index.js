#!/usr/bin/env node

const { program } = require('commander');
const Quiz = require('./src/quiz');
const QuestionLoader = require('./src/questionLoader');
const chalk = require('chalk');
const figlet = require('figlet');

// Display banner
console.log(
  chalk.cyan(
    figlet.textSync('AWS & AI Quiz', {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    })
  )
);

// Program configuration
program
  .name('aws-ai-quiz')
  .description('Interactive CLI quiz for AWS and AI knowledge testing')
  .version('1.0.0');

// Start quiz command
program
  .command('start')
  .description('Start a new quiz session')
  .option('-f, --file <path>', 'Path to questions file (default: ./data/questions.json)')
  .option('-c, --category <category>', 'Filter questions by category (aws, ai, aifc01, all)', 'all')
  .option('-n, --number <count>', 'Number of questions to ask (0 = all)', '0')
  .option('-t, --time <minutes>', 'Time limit in minutes (0 = no limit)', '0')
  .option('-s, --shuffle', 'Randomize question order', false)
  .option('-r, --retry', 'Allow retrying incorrect answers', false)
  .action(async (options) => {
    try {
      const questionFile = options.file || './data/questions.json';
      const loader = new QuestionLoader();
      const questions = await loader.loadQuestions(questionFile, {
        category: options.category,
        shuffle: options.shuffle,
        limit: parseInt(options.number) || 0
      });

      if (questions.length === 0) {
        console.log(chalk.red('No questions found matching the criteria.'));
        process.exit(1);
      }

      const quiz = new Quiz({
        questions,
        timeLimit: parseInt(options.time) * 60 * 1000, // Convert to milliseconds
        allowRetry: options.retry
      });

      await quiz.start();
    } catch (error) {
      console.error(chalk.red('Error starting quiz:'), error.message);
      process.exit(1);
    }
  });

// List questions command
program
  .command('list')
  .description('List available questions')
  .option('-f, --file <path>', 'Path to questions file (default: ./data/questions.json)')
  .option('-c, --category <category>', 'Filter by category (aws, ai, aifc01, all)', 'all')
  .option('--stats', 'Show question statistics', false)
  .action(async (options) => {
    try {
      const questionFile = options.file || './data/questions.json';
      const loader = new QuestionLoader();
      const questions = await loader.loadQuestions(questionFile, {
        category: options.category
      });

      if (options.stats) {
        loader.showStats(questions);
      } else {
        loader.listQuestions(questions);
      }
    } catch (error) {
      console.error(chalk.red('Error listing questions:'), error.message);
      process.exit(1);
    }
  });

// Validate questions file command
program
  .command('validate')
  .description('Validate questions file format')
  .option('-f, --file <path>', 'Path to questions file (default: ./data/questions.json)')
  .action(async (options) => {
    try {
      const questionFile = options.file || './data/questions.json';
      const loader = new QuestionLoader();
      const isValid = await loader.validateQuestions(questionFile);
      
      if (isValid) {
        console.log(chalk.green('✓ Questions file is valid'));
      } else {
        console.log(chalk.red('✗ Questions file has errors'));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('Error validating questions:'), error.message);
      process.exit(1);
    }
  });

// Results command
program
  .command('results')
  .description('View quiz results history')
  .option('-l, --latest', 'Show only the latest result', false)
  .option('-c, --clear', 'Clear all results history', false)
  .action((options) => {
    const ResultsManager = require('./src/resultsManager');
    const resultsManager = new ResultsManager();

    if (options.clear) {
      resultsManager.clearHistory();
      console.log(chalk.green('Results history cleared.'));
    } else {
      resultsManager.showResults(options.latest);
    }
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}