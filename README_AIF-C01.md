# AWS Certified AI Practitioner (AIF-C01) Exam Preparation CLI

A comprehensive command-line quiz application specifically designed for AWS Certified AI Practitioner (AIF-C01) exam preparation. Features 40+ questions covering all exam domains with interactive learning and progress tracking.

## 🎯 Exam Coverage

This quiz covers all five domains of the AIF-C01 exam:

- **Domain 1**: Fundamentals of AI and ML (20%)
- **Domain 2**: Fundamentals of Generative AI (24%) 
- **Domain 3**: Applications of Foundation Models (28%)
- **Domain 4**: Guidelines for Responsible AI (14%)
- **Domain 5**: Security, Compliance, and Governance for AI Solutions (14%)

## 🚀 Quick Start for Exam Prep

### AIF-C01 Focused Study Sessions
```bash
# Full AIF-C01 practice exam (25 questions)
node index.js start -c aifc01

# Timed practice exam (simulate exam conditions)
node index.js start -c aifc01 -t 60 -s

# Quick knowledge check (10 random questions)
node index.js start -c aifc01 -n 10 -s

# Learning mode with retry allowed
node index.js start -c aifc01 -r
```

### General AWS & AI Knowledge
```bash
# All questions (40 total)
node index.js start

# AWS services only
node index.js start -c aws

# AI fundamentals only  
node index.js start -c ai
```

## 📊 Question Statistics

- **Total Questions**: 40
- **AIF-C01 Specific**: 25 questions
- **AWS General**: 9 questions  
- **AI Fundamentals**: 6 questions

**Question Types**:
- Single Choice: 19 questions
- Multiple Choice: 11 questions
- Free Form: 10 questions

## 🎯 Exam-Focused Features

### Study Modes
- **Practice Mode**: All questions with explanations
- **Exam Mode**: Timed sessions simulating real exam conditions
- **Learning Mode**: Retry incorrect answers with detailed explanations
- **Quick Review**: Targeted practice on specific topics

### Progress Tracking
- Performance analytics by question type
- Domain-specific scoring
- Historical progress tracking
- Detailed answer review

## 📋 Key Topics Covered

### Amazon Bedrock & Foundation Models
- Pre-trained foundation models access
- Model selection criteria
- Fine-tuning and customization
- Bedrock Agents and Knowledge Bases

### Generative AI Concepts
- Prompt engineering techniques
- Few-shot vs zero-shot learning
- Hallucination and mitigation strategies
- RAG (Retrieval-Augmented Generation)

### Responsible AI
- Bias detection and mitigation
- AI governance and compliance
- Guardrails and safety measures
- Human-in-the-loop systems

### AWS AI Services
- Amazon Comprehend (NLP)
- Amazon Rekognition (Computer Vision)
- Amazon Bedrock (Foundation Models)
- AI service integration patterns

### Technical Implementation
- Vector databases and embeddings
- Model monitoring and drift detection
- Security and compliance considerations
- Production deployment best practices

## 🎓 Exam Preparation Tips

### Recommended Study Approach

1. **Baseline Assessment**: Take full practice quiz to identify weak areas
```bash
node index.js start -c aifc01 -t 60
```

2. **Targeted Study**: Focus on specific domains where you scored poorly

3. **Repeated Practice**: Use learning mode to reinforce concepts
```bash
node index.js start -c aifc01 -r
```

4. **Timed Practice**: Simulate exam conditions regularly
```bash
node index.js start -c aifc01 -t 60 -s
```

5. **Progress Review**: Track improvement over time
```bash
node index.js results
```

### Exam Day Simulation
```bash
# Full 60-minute timed exam with shuffled questions
node index.js start -c aifc01 -t 60 -s -n 25
```

## 📚 Installation & Usage

### Quick Setup
```bash
cd quiz-cli
npm install
chmod +x index.js
```

### Available Commands
```bash
# Start AIF-C01 practice exam
node index.js start -c aifc01

# View question statistics
node index.js list --stats

# Validate questions database
node index.js validate

# View study progress
node index.js results

# Show help
node index.js --help
```

### Command Options
- `-c, --category`: Filter by category (aws, ai, aifc01, all)
- `-n, --number`: Limit number of questions (0 = all)
- `-t, --time`: Set time limit in minutes (0 = no limit)
- `-s, --shuffle`: Randomize question order
- `-r, --retry`: Allow retrying incorrect answers

## 🔍 Question Format Examples

### Single Choice (Amazon Bedrock)
```
Which AWS service provides pre-trained foundation models for generative AI applications?

A) Amazon SageMaker
B) Amazon Bedrock ✓
C) Amazon Comprehend  
D) Amazon Rekognition
```

### Multiple Choice (Responsible AI)
```
Which are key principles of responsible AI? (Select all that apply)

A) Fairness and bias mitigation ✓
B) Transparency and explainability ✓
C) Maximizing model size
D) Privacy and data protection ✓
E) Human oversight and control ✓
```

### Free Form (Technical Concepts)
```
Explain the concept of 'hallucination' in large language models and why it's a concern.

Sample Answer: Hallucination occurs when LLMs generate plausible-sounding but factually incorrect information, which is concerning because the output appears credible while being completely false.
```

## 📈 Study Progress Tracking

The CLI automatically tracks:
- **Session Results**: Score, percentage, time taken
- **Performance Trends**: Improvement over time
- **Domain Analysis**: Strengths and weaknesses by topic
- **Question Review**: Detailed breakdown of incorrect answers

Results are saved locally and include:
- Timestamp and duration of each session
- Detailed answer history
- Performance by question type and category
- Overall statistics and trends

## 🎯 Exam Information

**AWS Certified AI Practitioner (AIF-C01)**
- **Duration**: 90 minutes
- **Question Format**: Multiple choice and multiple response
- **Passing Score**: 700/1000
- **Cost**: $150 USD
- **Validity**: 3 years

## 📁 Project Structure
```
quiz-cli/
├── index.js              # Main CLI application
├── package.json           # Dependencies
├── README.md              # This documentation
├── data/
│   └── questions.json     # AIF-C01 questions database
└── src/
    ├── quiz.js           # Quiz engine
    ├── questionLoader.js  # Question management
    └── resultsManager.js  # Progress tracking
```

## 🤝 Contributing

To add more AIF-C01 questions:
1. Edit `data/questions.json`
2. Follow the established question format
3. Use category "aifc01" for exam-specific questions
4. Validate with `node index.js validate`

## 📞 Support

For questions about the quiz application:
- Email: aaron@3bytes.com
- Create an issue in the repository

For official AWS certification information:
- Visit: https://aws.amazon.com/certification/certified-ai-practitioner/

---

**Good luck with your AIF-C01 exam preparation! 🚀**