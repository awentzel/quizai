# AWS & AI Quiz CLI

A comprehensive command-line interface for testing knowledge of AWS services and AI/ML concepts. Features interactive quizzes with multiple question types, progress tracking, and detailed result analysis.

## Features

- 🎯 **Multiple Question Types**: Single choice, multiple choice, and free-form questions
- 📊 **Smart Scoring**: Automatic scoring with detailed performance analytics
- ⏱️ **Flexible Timing**: Optional time limits for timed practice sessions
- 🔄 **Retry Options**: Allow retry for incorrect answers during learning mode
- 📈 **Progress Tracking**: Save and view quiz history with performance trends
- 🎨 **Beautiful Interface**: Colorful, intuitive CLI with clear feedback
- 📚 **Comprehensive Coverage**: AWS services and AI/ML concepts with explanations

## Installation

### Local Installation

1. Navigate to the quiz-cli directory:
```bash
cd quiz-cli
```

2. Install dependencies:
```bash
npm install
```

3. Make the CLI executable:
```bash
chmod +x index.js
```

### Global Installation (Optional)

To install globally and use `aws-ai-quiz` command anywhere:

```bash
npm install -g .
```

## Quick Start

### Start a Basic Quiz
```bash
node index.js start
```

### Start Quiz with Options
```bash
# Quiz with time limit (10 minutes)
node index.js start --time 10

# Quiz only AWS questions
node index.js start --category aws

# Quiz with 5 random questions
node index.js start --number 5 --shuffle

# Quiz with retry allowed
node index.js start --retry
```

## Usage

### Available Commands

#### `start` - Begin Quiz Session
Start an interactive quiz with various options:

```bash
node index.js start [options]
```

**Options:**
- `-f, --file <path>`: Path to questions file (default: ./data/questions.json)
- `-c, --category <category>`: Filter questions by category (aws, ai, all) [default: all]
- `-n, --number <count>`: Number of questions to ask (0 = all) [default: 0]
- `-t, --time <minutes>`: Time limit in minutes (0 = no limit) [default: 0]
- `-s, --shuffle`: Randomize question order
- `-r, --retry`: Allow retrying incorrect answers

**Examples:**
```bash
# Basic quiz with all questions
node index.js start

# AWS-only quiz with 10 questions, shuffled, 15-minute time limit
node index.js start -c aws -n 10 -s -t 15

# AI quiz with retry allowed
node index.js start --category ai --retry
```

#### `list` - View Available Questions
Display questions from the database:

```bash
node index.js list [options]
```

**Options:**
- `-f, --file <path>`: Path to questions file
- `-c, --category <category>`: Filter by category
- `--stats`: Show question statistics

**Examples:**
```bash
# List all questions
node index.js list

# Show only AWS questions
node index.js list -c aws

# Show question statistics
node index.js list --stats
```

#### `validate` - Check Questions File
Validate the format and content of questions file:

```bash
node index.js validate [options]
```

**Options:**
- `-f, --file <path>`: Path to questions file to validate

#### `results` - View Quiz History
Display previous quiz results and statistics:

```bash
node index.js results [options]
```

**Options:**
- `-l, --latest`: Show only the latest result with detailed breakdown
- `-c, --clear`: Clear all results history

**Examples:**
```bash
# Show all quiz history
node index.js results

# Show detailed breakdown of latest quiz
node index.js results --latest

# Clear all history
node index.js results --clear
```

## Question Format

The quiz uses JSON files to store questions. Here's the structure:

```json
{
  "metadata": {
    "title": "Quiz Title",
    "description": "Quiz description",
    "version": "1.0.0",
    "categories": ["aws", "ai"]
  },
  "questions": [
    {
      "id": "unique-id",
      "category": "aws",
      "type": "single-choice",
      "question": "Question text here?",
      "options": [
        "Option 1",
        "Option 2", 
        "Option 3",
        "Option 4"
      ],
      "correctAnswers": [1],
      "explanation": "Explanation of the correct answer"
    }
  ]
}
```

### Question Types

#### 1. Single Choice
Select exactly one correct answer from multiple options:

```json
{
  "type": "single-choice",
  "question": "Which AWS service is used for object storage?",
  "options": ["EC2", "S3", "RDS", "Lambda"],
  "correctAnswers": [1]
}
```

#### 2. Multiple Choice
Select one or more correct answers:

```json
{
  "type": "multiple-choice", 
  "question": "Which are AWS compute services?",
  "options": ["EC2", "Lambda", "S3", "ECS"],
  "correctAnswers": [0, 1, 3]
}
```

#### 3. Free Form
Open-ended text answers with optional guidance:

```json
{
  "type": "free-form",
  "question": "Explain the difference between EBS and EFS.",
  "sampleAnswers": [
    "EBS provides block storage for single instances",
    "EFS provides shared file storage for multiple instances"
  ],
  "keywords": ["block", "file", "single", "multiple", "shared"]
}
```

### Required Fields
- `id`: Unique identifier for the question
- `question`: The question text
- `type`: Question type (single-choice, multiple-choice, free-form)
- `correctAnswers`: Array of correct answers (for choice questions)

### Optional Fields
- `category`: Question category (aws, ai, etc.)
- `description`: Additional context for the question
- `explanation`: Explanation shown after answering
- `sampleAnswers`: Sample correct answers (for free-form)
- `keywords`: Keywords to check in free-form answers

## Adding Your Own Questions

1. Open `data/questions.json`
2. Add new question objects to the `questions` array
3. Follow the question format specified above
4. Validate your questions:
```bash
node index.js validate
```

## Results and Analytics

The CLI automatically tracks your performance:

- **Session Results**: Score, percentage, duration for each quiz
- **Performance Trends**: Track improvement over time
- **Question Analysis**: See which types you struggle with
- **Detailed Breakdown**: Review specific incorrect answers

Results are stored in `~/.aws-ai-quiz/results.json` and include:
- Timestamp of each quiz session
- Detailed answer history
- Performance by question type
- Overall statistics

## Examples

### Learning Mode Session
```bash
# Start with retry enabled for learning
node index.js start --retry --category aws

# Review your performance
node index.js results --latest
```

### Timed Practice Session
```bash
# Simulate exam conditions
node index.js start --time 30 --number 20 --shuffle

# Check overall progress
node index.js results
```

### Quick Knowledge Check
```bash
# 5 random questions from all categories
node index.js start -n 5 -s

# View question statistics
node index.js list --stats
```

## File Structure

```
quiz-cli/
├── index.js              # Main CLI entry point
├── package.json           # Project configuration
├── data/
│   └── questions.json     # Question database
└── src/
    ├── quiz.js           # Quiz engine logic
    ├── questionLoader.js  # Question loading and validation
    └── resultsManager.js  # Results tracking and analysis
```

## Dependencies

- **commander**: Command-line interface framework
- **inquirer**: Interactive command line prompts
- **chalk**: Terminal string styling
- **figlet**: ASCII art text generation
- **ora**: Terminal loading spinners

## Contributing

To add new questions or improve the CLI:

1. Fork the repository
2. Add your questions to `data/questions.json`
3. Test with `node index.js validate`
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues or questions:
- Create an issue in the project repository
- Email: aaron@3bytes.com

---

**Happy Learning! 🚀**