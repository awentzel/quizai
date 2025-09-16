#!/bin/bash

# AWS Certified AI Practitioner (AIF-C01) Exam Preparation Demo
# This script demonstrates exam-focused features

echo "🎯 AWS Certified AI Practitioner (AIF-C01) Exam Prep"
echo "================================================="
echo ""

# Navigate to quiz directory
cd "$(dirname "$0")"

echo "📊 Current Question Database:"
node index.js list --stats
echo ""

echo "📋 AIF-C01 Specific Questions:"
echo "node index.js list -c aifc01 | head -10"
node index.js list -c aifc01 | head -10
echo "... and 15 more questions"
echo ""

echo "🎓 Recommended Study Commands:"
echo ""

echo "1. 📖 LEARNING MODE (with retry allowed):"
echo "   node index.js start -c aifc01 -r"
echo ""

echo "2. ⏱️  EXAM SIMULATION (60 minutes, shuffled):"
echo "   node index.js start -c aifc01 -t 60 -s"
echo ""

echo "3. 🎯 QUICK PRACTICE (10 random questions):"
echo "   node index.js start -c aifc01 -n 10 -s"
echo ""

echo "4. 📊 FULL PRACTICE EXAM (all 25 AIF-C01 questions):"
echo "   node index.js start -c aifc01"
echo ""

echo "5. 📈 VIEW STUDY PROGRESS:"
echo "   node index.js results"
echo ""

echo "🔍 Sample Question Preview:"
echo "========================="
echo ""
echo "Question Type: Single Choice"
echo "Category: AIF-C01"
echo ""
echo "Which AWS service provides pre-trained foundation models for generative AI applications?"
echo ""
echo "A) Amazon SageMaker"
echo "B) Amazon Bedrock ✓"
echo "C) Amazon Comprehend"
echo "D) Amazon Rekognition"
echo ""
echo "Explanation: Amazon Bedrock is AWS's fully managed service that provides"
echo "access to foundation models from leading AI companies through a unified API."
echo ""

echo "✅ Quiz is ready for AIF-C01 exam preparation!"
echo ""
echo "📚 Study Tips:"
echo "- Start with learning mode (-r flag) to understand concepts"
echo "- Practice with timed sessions to simulate exam conditions"
echo "- Review results regularly to track improvement"
echo "- Focus on areas where you score lower"
echo ""
echo "🎯 Exam Info: 90 minutes, 65 questions, 700/1000 to pass"
echo "💡 This quiz has 25 focused questions covering all exam domains"