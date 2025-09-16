const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

class QuestionLoader {
  constructor() {
    this.supportedTypes = ['multiple-choice', 'single-choice', 'free-form'];
    this.supportedCategories = ['aws', 'ai', 'aifc01', 'certification'];
  }

  /**
   * Load and parse questions from a JSON file
   * @param {string} filePath - Path to the questions file
   * @param {Object} options - Filtering and processing options
   * @returns {Array} Array of question objects
   */
  async loadQuestions(filePath, options = {}) {
    try {
      const absolutePath = path.resolve(filePath);
      const fileContent = await fs.readFile(absolutePath, 'utf8');
      let data;

      try {
        data = JSON.parse(fileContent);
      } catch (parseError) {
        throw new Error(`Invalid JSON format: ${parseError.message}`);
      }

      // Validate the basic structure
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Questions file must contain a "questions" array');
      }

      let questions = data.questions;

      // Apply filters
      if (options.category && options.category !== 'all') {
        questions = questions.filter(q => 
          q.category && q.category.toLowerCase() === options.category.toLowerCase()
        );
      }

      // Shuffle if requested
      if (options.shuffle) {
        questions = this.shuffleArray([...questions]);
      }

      // Limit number of questions
      if (options.limit && options.limit > 0) {
        questions = questions.slice(0, options.limit);
      }

      // Validate each question
      questions.forEach((question, index) => {
        this.validateQuestion(question, index);
      });

      return questions;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Questions file not found: ${filePath}`);
      }
      throw error;
    }
  }

  /**
   * Validate a single question object
   * @param {Object} question - Question object to validate
   * @param {number} index - Question index for error reporting
   */
  validateQuestion(question, index) {
    const questionNum = index + 1;

    // Required fields
    if (!question.id) {
      throw new Error(`Question ${questionNum}: Missing required field 'id'`);
    }
    if (!question.question) {
      throw new Error(`Question ${questionNum}: Missing required field 'question'`);
    }
    if (!question.type) {
      throw new Error(`Question ${questionNum}: Missing required field 'type'`);
    }

    // Validate type
    if (!this.supportedTypes.includes(question.type)) {
      throw new Error(`Question ${questionNum}: Unsupported type '${question.type}'. Supported types: ${this.supportedTypes.join(', ')}`);
    }

    // Validate category
    if (question.category && !this.supportedCategories.includes(question.category.toLowerCase())) {
      console.warn(chalk.yellow(`Warning: Question ${questionNum} has unknown category '${question.category}'`));
    }

    // Type-specific validation
    switch (question.type) {
      case 'multiple-choice':
      case 'single-choice':
        this.validateChoiceQuestion(question, questionNum);
        break;
      case 'free-form':
        this.validateFreeFormQuestion(question, questionNum);
        break;
    }
  }

  /**
   * Validate multiple-choice or single-choice question
   * @param {Object} question - Question object
   * @param {number} questionNum - Question number for error reporting
   */
  validateChoiceQuestion(question, questionNum) {
    if (!question.options || !Array.isArray(question.options)) {
      throw new Error(`Question ${questionNum}: Choice questions must have an 'options' array`);
    }

    if (question.options.length < 2) {
      throw new Error(`Question ${questionNum}: Choice questions must have at least 2 options`);
    }

    // Validate options format
    question.options.forEach((option, optIndex) => {
      if (typeof option === 'string') {
        // Simple string option - this is fine
        return;
      }
      if (typeof option === 'object' && option.text) {
        // Object with text property - this is also fine
        return;
      }
      throw new Error(`Question ${questionNum}, Option ${optIndex + 1}: Invalid format. Use string or {text: "...", value: "..."}`);
    });

    // Validate correct answers
    if (!question.correctAnswers) {
      throw new Error(`Question ${questionNum}: Missing 'correctAnswers' field`);
    }

    if (!Array.isArray(question.correctAnswers)) {
      throw new Error(`Question ${questionNum}: 'correctAnswers' must be an array`);
    }

    if (question.type === 'single-choice' && question.correctAnswers.length !== 1) {
      throw new Error(`Question ${questionNum}: Single-choice questions must have exactly one correct answer`);
    }

    if (question.type === 'multiple-choice' && question.correctAnswers.length === 0) {
      throw new Error(`Question ${questionNum}: Multiple-choice questions must have at least one correct answer`);
    }

    // Validate that correct answers reference valid options
    question.correctAnswers.forEach(answer => {
      const answerIndex = typeof answer === 'number' ? answer : 
        question.options.findIndex(opt => 
          (typeof opt === 'string' && opt === answer) ||
          (typeof opt === 'object' && (opt.text === answer || opt.value === answer))
        );
      
      if (answerIndex === -1 || answerIndex >= question.options.length) {
        throw new Error(`Question ${questionNum}: Correct answer '${answer}' doesn't match any option`);
      }
    });
  }

  /**
   * Validate free-form question
   * @param {Object} question - Question object
   * @param {number} questionNum - Question number for error reporting
   */
  validateFreeFormQuestion(question, questionNum) {
    // Free-form questions can have sample answers or keywords for guidance
    if (question.sampleAnswers && !Array.isArray(question.sampleAnswers)) {
      throw new Error(`Question ${questionNum}: 'sampleAnswers' must be an array if provided`);
    }

    if (question.keywords && !Array.isArray(question.keywords)) {
      throw new Error(`Question ${questionNum}: 'keywords' must be an array if provided`);
    }
  }

  /**
   * Validate entire questions file
   * @param {string} filePath - Path to questions file
   * @returns {boolean} True if valid
   */
  async validateQuestions(filePath) {
    try {
      await this.loadQuestions(filePath);
      console.log(chalk.green('✓ All questions are valid'));
      return true;
    } catch (error) {
      console.error(chalk.red('✗ Validation failed:'), error.message);
      return false;
    }
  }

  /**
   * Display questions list
   * @param {Array} questions - Array of questions
   */
  listQuestions(questions) {
    console.log(chalk.blue(`\n📝 Found ${questions.length} questions:\n`));

    questions.forEach((question, index) => {
      const category = question.category ? chalk.cyan(`[${question.category.toUpperCase()}]`) : '';
      const type = chalk.yellow(`(${question.type})`);
      
      console.log(`${index + 1}. ${category} ${type} ${question.question.substring(0, 80)}${question.question.length > 80 ? '...' : ''}`);
    });
  }

  /**
   * Display question statistics
   * @param {Array} questions - Array of questions
   */
  showStats(questions) {
    const stats = {
      total: questions.length,
      byType: {},
      byCategory: {}
    };

    questions.forEach(question => {
      // Count by type
      stats.byType[question.type] = (stats.byType[question.type] || 0) + 1;
      
      // Count by category
      const category = question.category || 'uncategorized';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    });

    console.log(chalk.blue('\n📊 Question Statistics:\n'));
    console.log(`Total Questions: ${chalk.green(stats.total)}`);
    
    console.log('\n📋 By Type:');
    Object.entries(stats.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${chalk.yellow(count)}`);
    });

    console.log('\n📂 By Category:');
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      console.log(`  ${category}: ${chalk.cyan(count)}`);
    });
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

module.exports = QuestionLoader;