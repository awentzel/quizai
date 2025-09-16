const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const os = require('os');

class ResultsManager {
  constructor() {
    this.resultsDir = path.join(os.homedir(), '.aws-ai-quiz');
    this.resultsFile = path.join(this.resultsDir, 'results.json');
  }

  /**
   * Ensure results directory exists
   */
  async ensureResultsDir() {
    try {
      await fs.access(this.resultsDir);
    } catch {
      await fs.mkdir(this.resultsDir, { recursive: true });
    }
  }

  /**
   * Load existing results from file
   * @returns {Array} Array of previous results
   */
  async loadResults() {
    try {
      await this.ensureResultsDir();
      const data = await fs.readFile(this.resultsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return []; // No results file exists yet
      }
      console.warn(chalk.yellow('Warning: Could not load results history'), error.message);
      return [];
    }
  }

  /**
   * Save a quiz result
   * @param {Object} result - Quiz result object
   */
  async saveResult(result) {
    try {
      const results = await this.loadResults();
      results.push(result);
      
      // Keep only the last 50 results to prevent file from growing too large
      if (results.length > 50) {
        results.splice(0, results.length - 50);
      }

      await this.ensureResultsDir();
      await fs.writeFile(this.resultsFile, JSON.stringify(results, null, 2));
    } catch (error) {
      console.warn(chalk.yellow('Warning: Could not save results'), error.message);
    }
  }

  /**
   * Display quiz results
   * @param {boolean} latestOnly - Show only the latest result
   */
  async showResults(latestOnly = false) {
    try {
      const results = await this.loadResults();
      
      if (results.length === 0) {
        console.log(chalk.yellow('No quiz results found.'));
        return;
      }

      const resultsToShow = latestOnly ? [results[results.length - 1]] : results;

      console.log(chalk.blue('\n📈 Quiz Results History\n'));

      resultsToShow.reverse().forEach((result, index) => {
        const date = new Date(result.timestamp).toLocaleString();
        const percentage = result.percentage || Math.round((result.correctAnswers / result.totalQuestions) * 100);
        
        console.log(chalk.cyan(`Session ${latestOnly ? '(Latest)' : results.length - index}:`));
        console.log(`  Date: ${chalk.gray(date)}`);
        console.log(`  Score: ${chalk.yellow(result.correctAnswers)}/${chalk.yellow(result.totalQuestions)} (${this.getGradeColor(percentage)(percentage + '%')})`);
        console.log(`  Duration: ${chalk.cyan(this.formatDuration(result.duration))}`);
        
        if (result.answers && !latestOnly) {
          const incorrectCount = result.answers.filter(a => !a.isCorrect).length;
          if (incorrectCount > 0) {
            console.log(`  Incorrect: ${chalk.red(incorrectCount)} questions`);
          }
        }
        console.log();
      });

      // Show statistics for multiple results
      if (!latestOnly && results.length > 1) {
        this.showStatistics(results);
      }

      // Show detailed breakdown for latest result if requested
      if (latestOnly && results[results.length - 1].answers) {
        this.showDetailedBreakdown(results[results.length - 1]);
      }

    } catch (error) {
      console.error(chalk.red('Error loading results:'), error.message);
    }
  }

  /**
   * Show statistics across all quiz sessions
   * @param {Array} results - Array of quiz results
   */
  showStatistics(results) {
    console.log(chalk.blue('📊 Overall Statistics:\n'));
    
    const totalSessions = results.length;
    const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);
    const totalCorrect = results.reduce((sum, r) => sum + r.correctAnswers, 0);
    const averagePercentage = Math.round((totalCorrect / totalQuestions) * 100);
    const averageDuration = Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length);

    console.log(`Total Sessions: ${chalk.yellow(totalSessions)}`);
    console.log(`Total Questions Answered: ${chalk.yellow(totalQuestions)}`);
    console.log(`Overall Accuracy: ${this.getGradeColor(averagePercentage)(averagePercentage + '%')}`);
    console.log(`Average Session Duration: ${chalk.cyan(this.formatDuration(averageDuration))}`);

    // Best and worst sessions
    const bestSession = results.reduce((best, current) => 
      (current.percentage || Math.round((current.correctAnswers / current.totalQuestions) * 100)) > 
      (best.percentage || Math.round((best.correctAnswers / best.totalQuestions) * 100)) ? current : best
    );
    
    const worstSession = results.reduce((worst, current) => 
      (current.percentage || Math.round((current.correctAnswers / current.totalQuestions) * 100)) < 
      (worst.percentage || Math.round((worst.correctAnswers / worst.totalQuestions) * 100)) ? current : worst
    );

    const bestPercentage = bestSession.percentage || Math.round((bestSession.correctAnswers / bestSession.totalQuestions) * 100);
    const worstPercentage = worstSession.percentage || Math.round((worstSession.correctAnswers / worstSession.totalQuestions) * 100);

    console.log(`Best Session: ${this.getGradeColor(bestPercentage)(bestPercentage + '%')} on ${new Date(bestSession.timestamp).toLocaleDateString()}`);
    console.log(`Worst Session: ${this.getGradeColor(worstPercentage)(worstPercentage + '%')} on ${new Date(worstSession.timestamp).toLocaleDateString()}`);
    console.log();
  }

  /**
   * Show detailed breakdown of a quiz session
   * @param {Object} result - Quiz result object
   */
  showDetailedBreakdown(result) {
    console.log(chalk.blue('📋 Detailed Breakdown:\n'));

    if (!result.answers || result.answers.length === 0) {
      console.log(chalk.gray('No detailed answer data available.'));
      return;
    }

    const incorrectAnswers = result.answers.filter(a => !a.isCorrect);
    const correctAnswers = result.answers.filter(a => a.isCorrect);

    if (correctAnswers.length > 0) {
      console.log(chalk.green(`✅ Correct Answers (${correctAnswers.length}):`));
      correctAnswers.forEach((answer, index) => {
        console.log(chalk.gray(`  ${index + 1}. ${answer.question.substring(0, 60)}...`));
      });
      console.log();
    }

    if (incorrectAnswers.length > 0) {
      console.log(chalk.red(`❌ Incorrect Answers (${incorrectAnswers.length}):`));
      incorrectAnswers.forEach((answer, index) => {
        console.log(chalk.gray(`  ${index + 1}. ${answer.question.substring(0, 60)}...`));
        if (answer.type === 'free-form') {
          console.log(chalk.gray(`     Your answer: "${answer.userAnswer}"`));
        }
      });
      console.log();
    }

    // Question type breakdown
    const typeStats = {};
    result.answers.forEach(answer => {
      if (!typeStats[answer.type]) {
        typeStats[answer.type] = { correct: 0, total: 0 };
      }
      typeStats[answer.type].total++;
      if (answer.isCorrect) {
        typeStats[answer.type].correct++;
      }
    });

    console.log(chalk.blue('📈 Performance by Question Type:'));
    Object.entries(typeStats).forEach(([type, stats]) => {
      const percentage = Math.round((stats.correct / stats.total) * 100);
      console.log(`  ${type}: ${this.getGradeColor(percentage)(stats.correct + '/' + stats.total + ' (' + percentage + '%)')}`);
    });
  }

  /**
   * Clear all results history
   */
  async clearHistory() {
    try {
      await fs.unlink(this.resultsFile);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn(chalk.yellow('Warning: Could not clear results history'), error.message);
      }
    }
  }

  /**
   * Export results to CSV format
   * @param {string} outputPath - Path to save CSV file
   */
  async exportToCSV(outputPath) {
    try {
      const results = await this.loadResults();
      
      if (results.length === 0) {
        console.log(chalk.yellow('No results to export.'));
        return;
      }

      let csv = 'Date,Total Questions,Correct Answers,Percentage,Duration (seconds)\n';
      
      results.forEach(result => {
        const date = new Date(result.timestamp).toISOString().split('T')[0];
        const percentage = result.percentage || Math.round((result.correctAnswers / result.totalQuestions) * 100);
        const durationSeconds = Math.round(result.duration / 1000);
        
        csv += `${date},${result.totalQuestions},${result.correctAnswers},${percentage},${durationSeconds}\n`;
      });

      await fs.writeFile(outputPath, csv);
      console.log(chalk.green(`Results exported to: ${outputPath}`));
      
    } catch (error) {
      console.error(chalk.red('Error exporting results:'), error.message);
    }
  }

  /**
   * Get appropriate color for grade percentage
   * @param {number} percentage - Grade percentage
   * @returns {Function} Chalk color function
   */
  getGradeColor(percentage) {
    if (percentage >= 90) return chalk.green;
    if (percentage >= 80) return chalk.yellow;
    if (percentage >= 70) return chalk.blue;
    return chalk.red;
  }

  /**
   * Format duration in milliseconds to human readable format
   * @param {number} duration - Duration in milliseconds
   * @returns {string} Formatted duration
   */
  formatDuration(duration) {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }
}

module.exports = ResultsManager;