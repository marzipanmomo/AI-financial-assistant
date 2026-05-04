Project Analysis Report

FinanceAI: AI-Powered Financial Assistant
An intelligent financial management platform that combines a custom-trained machine learning model with the Groq AI API to deliver smart financial insights, sentiment analysis, and more.

AI Approach:
Custom Trained Sentiment Model
We trained a Financial Sentiment Analysis model from scratch using TF-IDF and Logistic Regression (scikit-learn) on 400+ manually curated financial phrases. The model classifies text as Positive, Negative, or Neutral and returns a confidence score. Once trained, it is saved as a .pkl file and served via Flask, eliminating the need for retraining on startup.

Dataset: 400+ labeled financial phrases N-gram Range: (1, 3) Max Features: 8,000 Accuracy: ~93%+ Train/Test: 85% / 15% stratified split
Groq AI API
Used for contextual AI tips after every calculation and a full conversational AI Chat feature for personal finance questions.

Features:-
Budget Calculator: Income and expense breakdown with savings rate
Expense Tracker: Log and categorize spending
Savings Planner: Goal-based savings plan
Loan and EMI Calculator: Monthly payments and total interest
Investment Returns: Compound interest projections
Net Worth Tracker: Assets versus liabilities
Bill Splitter: Split bills with tip calculation
Currency Converter: Real-time exchange rates (20+ currencies)
Tax Estimator: Pakistan FBR Tax Year 2026 slab-based estimation
Sentiment Analyzer: Classify financial text as Positive, Negative, or Neutral
AI Chat: Conversational finance assistant
History: View all past calculations
Dashboard: Financial overview at a glance 

Tech Stack:-
Frontend:
React.js, Framer Motion, Recharts, jsPDF
Backend:
Python Flask, scikit-learn, Groq API
APIs:
Groq (LLaMA), Open Exchange Rates
 
Setup:-
Backend (Bash):
cd backend
pip install -r requirements.txt
python app.py

Frontend (Bash):
cd frontend/my-app
npm install
npm start

Environment Variables:
REACT_APP_API_URL=http://localhost:5000
GROQ_API_KEY=your_groq_api_key

License:
Developed as a university AI course project.