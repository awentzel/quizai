#!/bin/bash

# AWS & AI Quiz CLI Demo Script
# This script demonstrates the various features of the quiz CLI

echo "🎯 AWS & AI Quiz CLI Demo"
echo "========================="
echo ""

# Navigate to quiz directory
cd "$(dirname "$0")"

echo "📝 1. Validating questions file..."
node index.js validate
echo ""

echo "📊 2. Showing question statistics..."
node index.js list --stats
echo ""

echo "📋 3. Listing AWS questions only..."
node index.js list -c aws
echo ""

echo "🎮 4. To start a quiz, run one of these commands:"
echo ""
echo "Basic quiz (all questions):"
echo "  node index.js start"
echo ""
echo "AWS-only quiz with 5 questions:"
echo "  node index.js start -c aws -n 5"
echo ""
echo "Timed quiz (10 minutes) with retry enabled:"
echo "  node index.js start -t 10 -r"
echo ""
echo "AI quiz with shuffled questions:"
echo "  node index.js start -c ai -s"
echo ""
echo "💾 To view results after taking quizzes:"
echo "  node index.js results"
echo "  node index.js results --latest"
echo ""

echo "✅ Demo complete! The quiz CLI is ready to use."
echo "📖 See README.md for full documentation."