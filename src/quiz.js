const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const ResultsManager = require('./resultsManager');

class Quiz {
  constructor(options = {}) {
    this.questions = options.questions || [];
    this.timeLimit = options.timeLimit || 0; // 0 means no time limit
    this.allowRetry = options.allowRetry || false;
    this.currentQuestionIndex = 0;
    this.answers = [];
    this.score = 0;
    this.startTime = null;
    this.endTime = null;
    this.resultsManager = new ResultsManager();
  }

  /**
   * Start the quiz session
   */
  async start() {
    console.log(chalk.blue('\n🎯 Starting Quiz Session\n'));
    console.log(`Questions: ${chalk.yellow(this.questions.length)}`);
    if (this.timeLimit > 0) {
      console.log(`Time Limit: ${chalk.yellow(Math.round(this.timeLimit / 60000))} minutes`);
    }
    console.log(`Retry Allowed: ${chalk.yellow(this.allowRetry ? 'Yes' : 'No')}\n`);

    // Confirm start
    const { confirmStart } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmStart',
        message: 'Ready to start the quiz?',
        default: true
      }
    ]);

    if (!confirmStart) {
      console.log(chalk.yellow('Quiz cancelled.'));
      return;
    }

    this.startTime = Date.now();

    // Set up timer if time limit is specified
    let timeoutId;
    if (this.timeLimit > 0) {
      timeoutId = setTimeout(() => {
        console.log(chalk.red('\n⏰ Time limit reached! Quiz automatically submitted.'));
        this.finishQuiz();
      }, this.timeLimit);
    }

    try {
      // Process each question
      for (let i = 0; i < this.questions.length; i++) {
        this.currentQuestionIndex = i;
        const question = this.questions[i];
        
        console.log(chalk.blue(`\n${'='.repeat(60)}`));
        console.log(chalk.blue(`Question ${i + 1} of ${this.questions.length}`));
        
        if (this.timeLimit > 0) {
          const elapsed = Date.now() - this.startTime;
          const remaining = Math.max(0, this.timeLimit - elapsed);
          const remainingMinutes = Math.ceil(remaining / 60000);
          console.log(chalk.gray(`Time remaining: ${remainingMinutes} minutes`));
        }
        
        console.log(chalk.blue(`${'='.repeat(60)}\n`));

        await this.askQuestion(question);
      }

      // Clear timeout if quiz completed normally
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      this.finishQuiz();
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      console.error(chalk.red('Quiz error:'), error.message);
    }
  }

  /**
   * Ask a single question
   * @param {Object} question - Question object
   */
  async askQuestion(question) {
    // Display question
    console.log(chalk.green('📝 ' + question.question));
    
    if (question.description) {
      console.log(chalk.gray('\n' + question.description));
    }
    
    console.log(); // Empty line for spacing

    let userAnswer;
    let isCorrect = false;

    do {
      switch (question.type) {
        case 'multiple-choice':
          userAnswer = await this.askMultipleChoice(question);
          isCorrect = this.validateMultipleChoice(question, userAnswer);
          break;
        case 'single-choice':
          userAnswer = await this.askSingleChoice(question);
          isCorrect = this.validateSingleChoice(question, userAnswer);
          break;
        case 'free-form':
          userAnswer = await this.askFreeForm(question);
          isCorrect = await this.validateFreeForm(question, userAnswer);
          break;
        default:
          throw new Error(`Unsupported question type: ${question.type}`);
      }

      // Store answer
      this.answers.push({
        questionId: question.id,
        question: question.question,
        type: question.type,
        userAnswer,
        isCorrect,
        correctAnswers: question.correctAnswers || question.sampleAnswers,
        timestamp: Date.now()
      });

      // Provide feedback
      if (isCorrect) {
        console.log(chalk.green('\n✅ Correct!'));
        this.score++;
        
        if (question.explanation) {
          console.log(chalk.blue('\n💡 Explanation:'), question.explanation);
        }
        break; // Move to next question
      } else {
        console.log(chalk.red('\n❌ Incorrect.'));
        
        // Show correct answers
        this.showCorrectAnswers(question);
        
        if (question.explanation) {
          console.log(chalk.blue('\n💡 Explanation:'), question.explanation);
        }

        if (this.allowRetry) {
          const { retry } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'retry',
              message: 'Would you like to try again?',
              default: false
            }
          ]);

          if (!retry) {
            break; // Move to next question
          }
          
          console.log(chalk.yellow('\n🔄 Try again:\n'));
          // Remove the incorrect answer from the answers array
          this.answers.pop();
        } else {
          break; // Move to next question
        }
      }
    } while (this.allowRetry);
  }

  /**
   * Ask multiple choice question
   * @param {Object} question - Question object
   * @returns {Array} Selected answers
   */
  async askMultipleChoice(question) {
    const choices = question.options.map((option, index) => ({
      name: typeof option === 'string' ? option : option.text,
      value: index,
      checked: false
    }));

    const { selectedAnswers } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedAnswers',
        message: 'Select all correct answers (use spacebar to select):',
        choices: choices,
        validate: (input) => {
          if (input.length === 0) {
            return 'Please select at least one answer.';
          }
          return true;
        }
      }
    ]);

    return selectedAnswers.sort((a, b) => a - b); // Sort for consistent comparison
  }

  /**
   * Ask single choice question
   * @param {Object} question - Question object
   * @returns {number} Selected answer index
   */
  async askSingleChoice(question) {
    const choices = question.options.map((option, index) => ({
      name: typeof option === 'string' ? option : option.text,
      value: index
    }));

    const { selectedAnswer } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedAnswer',
        message: 'Select the correct answer:',
        choices: choices
      }
    ]);

    return selectedAnswer;
  }

  /**
   * Ask free form question
   * @param {Object} question - Question object
   * @returns {string} User's answer
   */
  async askFreeForm(question) {
    if (question.sampleAnswers && question.sampleAnswers.length > 0) {
      console.log(chalk.gray('Sample answers for reference:'));
      question.sampleAnswers.forEach((sample, index) => {
        console.log(chalk.gray(`  ${index + 1}. ${sample}`));
      });
      console.log();
    }

    const { answer } = await inquirer.prompt([
      {
        type: 'input',
        name: 'answer',
        message: 'Your answer:',
        validate: (input) => {
          if (!input.trim()) {
            return 'Please provide an answer.';
          }
          return true;
        }
      }
    ]);

    return answer.trim();
  }

  /**
   * Validate multiple choice answer
   * @param {Object} question - Question object
   * @param {Array} userAnswer - User's selected answers
   * @returns {boolean} Whether the answer is correct
   */
  validateMultipleChoice(question, userAnswer) {
    const correctAnswers = question.correctAnswers.map(answer => {
      if (typeof answer === 'number') return answer;
      return question.options.findIndex(opt => 
        (typeof opt === 'string' && opt === answer) ||
        (typeof opt === 'object' && (opt.text === answer || opt.value === answer))
      );
    }).sort((a, b) => a - b);

    return JSON.stringify(userAnswer) === JSON.stringify(correctAnswers);
  }

  /**
   * Validate single choice answer
   * @param {Object} question - Question object
   * @param {number} userAnswer - User's selected answer index
   * @returns {boolean} Whether the answer is correct
   */
  validateSingleChoice(question, userAnswer) {
    const correctAnswer = question.correctAnswers[0];
    
    if (typeof correctAnswer === 'number') {
      return userAnswer === correctAnswer;
    }
    
    const correctIndex = question.options.findIndex(opt => 
      (typeof opt === 'string' && opt === correctAnswer) ||
      (typeof opt === 'object' && (opt.text === correctAnswer || opt.value === correctAnswer))
    );
    
    return userAnswer === correctIndex;
  }

  /**
   * Validate free form answer
   * @param {Object} question - Question object
   * @param {string} userAnswer - User's answer
   * @returns {boolean} Whether the answer is acceptable
   */
  async validateFreeForm(question, userAnswer) {
    // For free-form questions, we can't automatically validate
    // But we can check against keywords or allow manual review
    
    if (question.keywords && question.keywords.length > 0) {
      const answerLower = userAnswer.toLowerCase();
      const hasKeywords = question.keywords.some(keyword => 
        answerLower.includes(keyword.toLowerCase())
      );
      
      if (hasKeywords) {
        console.log(chalk.blue('\n🔍 Your answer contains expected keywords.'));
      }
    }

    // Allow self-assessment for free-form questions
    const { selfAssessment } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selfAssessment',
        message: 'How would you rate your answer?',
        choices: [
          { name: 'Correct - I\'m confident in my answer', value: true },
          { name: 'Incorrect - I think I got it wrong', value: false },
          { name: 'Partially correct - Some parts right', value: 'partial' }
        ]
      }
    ]);

    // For now, accept self-assessment
    // In a real system, this might be reviewed by an instructor
    return selfAssessment === true || selfAssessment === 'partial';
  }

  /**
   * Show correct answers for a question
   * @param {Object} question - Question object
   */
  showCorrectAnswers(question) {
    switch (question.type) {
      case 'multiple-choice':
      case 'single-choice':
        console.log(chalk.blue('\n📋 Correct answer(s):'));
        question.correctAnswers.forEach(answer => {
          let answerText;
          if (typeof answer === 'number') {
            const option = question.options[answer];
            answerText = typeof option === 'string' ? option : option.text;
          } else {
            answerText = answer;
          }
          console.log(chalk.green(`  • ${answerText}`));
        });
        break;
      
      case 'free-form':
        if (question.sampleAnswers && question.sampleAnswers.length > 0) {
          console.log(chalk.blue('\n📋 Sample correct answers:'));
          question.sampleAnswers.forEach(sample => {
            console.log(chalk.green(`  • ${sample}`));
          });
        }
        break;
    }
  }

  /**
   * Finish the quiz and show results
   */
  finishQuiz() {
    this.endTime = Date.now();
    const duration = this.endTime - this.startTime;
    const percentage = Math.round((this.score / this.questions.length) * 100);

    console.log(chalk.blue('\n' + '='.repeat(60)));
    console.log(chalk.blue('🎉 Quiz Completed!'));
    console.log(chalk.blue('='.repeat(60)));

    console.log(`\n📊 Results:`);
    console.log(`Score: ${chalk.yellow(this.score)}/${chalk.yellow(this.questions.length)} (${chalk.yellow(percentage)}%)`);
    console.log(`Time taken: ${chalk.cyan(this.formatDuration(duration))}`);

    // Grade assessment
    let grade, gradeColor;
    if (percentage >= 90) {
      grade = 'Excellent! 🌟';
      gradeColor = chalk.green;
    } else if (percentage >= 80) {
      grade = 'Great job! 👍';
      gradeColor = chalk.green;
    } else if (percentage >= 70) {
      grade = 'Good work! 👌';
      gradeColor = chalk.yellow;
    } else if (percentage >= 60) {
      grade = 'Not bad! 🤔';
      gradeColor = chalk.yellow;
    } else {
      grade = 'Keep studying! 📚';
      gradeColor = chalk.red;
    }

    console.log(`Grade: ${gradeColor(grade)}`);

    // Save results
    const results = {
      timestamp: this.endTime,
      totalQuestions: this.questions.length,
      correctAnswers: this.score,
      percentage: percentage,
      duration: duration,
      answers: this.answers
    };

    this.resultsManager.saveResult(results);
    console.log(chalk.gray('\n💾 Results saved to history.'));
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

module.exports = Quiz;