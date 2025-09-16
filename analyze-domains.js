#!/usr/bin/env node

// Domain Distribution Analysis for AIF-C01 Questions

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Load questions
const questionsFile = path.join(__dirname, 'data', 'questions.json');
const data = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));

// Extract AIF-C01 questions
const aifc01Questions = data.questions.filter(q => q.category === 'aifc01');

console.log(chalk.blue('🎯 AIF-C01 Domain Distribution Analysis'));
console.log(chalk.blue('=====================================\n'));

// Expected percentages based on exam blueprint
const expectedDistribution = {
  '1': { name: 'Fundamentals of AI and ML', percentage: 20 },
  '2': { name: 'Fundamentals of Generative AI', percentage: 24 },
  '3': { name: 'Applications of Foundation Models', percentage: 28 },
  '4': { name: 'Guidelines for Responsible AI', percentage: 14 },
  '5': { name: 'Security, Compliance, and Governance', percentage: 14 }
};

// Count questions by domain
const domainCounts = {};
let questionsWithDomain = 0;

aifc01Questions.forEach(q => {
  if (q.domain) {
    domainCounts[q.domain] = (domainCounts[q.domain] || 0) + 1;
    questionsWithDomain++;
  }
});

console.log(`Total AIF-C01 Questions: ${chalk.yellow(aifc01Questions.length)}`);
console.log(`Questions with Domain Tags: ${chalk.yellow(questionsWithDomain)}`);
console.log(`Questions without Domain Tags: ${chalk.yellow(aifc01Questions.length - questionsWithDomain)}\n`);

console.log(chalk.blue('Domain Distribution:'));
console.log(chalk.blue('==================\n'));

// Calculate and display distribution
Object.keys(expectedDistribution).forEach(domain => {
  const count = domainCounts[domain] || 0;
  const actualPercentage = questionsWithDomain > 0 ? (count / questionsWithDomain * 100).toFixed(1) : 0;
  const expected = expectedDistribution[domain];
  
  const status = Math.abs(actualPercentage - expected.percentage) <= 5 ? 
    chalk.green('✓') : chalk.red('⚠');
  
  console.log(`${status} Domain ${domain}: ${chalk.cyan(expected.name)}`);
  console.log(`   Expected: ${chalk.yellow(expected.percentage + '%')} | Actual: ${chalk.yellow(actualPercentage + '%')} (${chalk.white(count)} questions)`);
  console.log();
});

// Show questions by type within AIF-C01
console.log(chalk.blue('Question Types in AIF-C01:'));
console.log(chalk.blue('==========================\n'));

const typeCounts = {};
aifc01Questions.forEach(q => {
  typeCounts[q.type] = (typeCounts[q.type] || 0) + 1;
});

Object.entries(typeCounts).forEach(([type, count]) => {
  const percentage = (count / aifc01Questions.length * 100).toFixed(1);
  console.log(`${type}: ${chalk.yellow(count)} questions (${chalk.cyan(percentage + '%')})`);
});

console.log('\n' + chalk.green('✅ Analysis Complete!'));

// Recommendations
console.log('\n' + chalk.blue('📝 Recommendations:'));
if (questionsWithDomain < aifc01Questions.length) {
  console.log(chalk.yellow('• Consider adding domain tags to remaining questions'));
}

const totalExpected = Object.values(expectedDistribution).reduce((sum, d) => sum + d.percentage, 0);
if (totalExpected === 100) {
  console.log(chalk.green('• Domain percentages align with exam blueprint'));
} else {
  console.log(chalk.red('• Domain percentages may need adjustment'));
}