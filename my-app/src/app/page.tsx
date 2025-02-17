"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
// Add this with other state declarations
import { openDB } from 'idb';
// Define question types
type MCQQuestion = {
  id: number;
  type: 'mcq';
  question: string;
  options: string[];
  correctAnswer: number;
};

type IntegerQuestion = {
  id: number;
  type: 'integer';
  question: string;
  correctAnswer: number;
};

type QuizAttempt = {
  id?: number;
  playerName: string;
  date: string;
  score: number;
  totalQuestions: number;
};

type Question = MCQQuestion | IntegerQuestion;

const sampleQuestions: Question[] = [
  {
    id: 1,
    type: 'mcq',
    question: 'Which planet is closest to the Sun?',
    options: ['Venus', 'Mercury', 'Earth', 'Mars'],
    correctAnswer: 1 // B. Mercury
  },
  {
    id: 2,
    type: 'mcq',
    question: 'Which data structure organizes items in a First-In, First-Out (FIFO) manner?',
    options: ['Stack', 'Queue', 'Tree', 'Graph'],
    correctAnswer: 1 // B. Queue
  },
  {
    id: 3,
    type: 'mcq',
    question: 'Which of the following is primarily used for structuring web pages?',
    options: ['Python', 'Java', 'HTML', 'C++'],
    correctAnswer: 2 // C. HTML
  },
  {
    id: 4,
    type: 'mcq',
    question: 'Which chemical symbol stands for Gold?',
    options: ['Au', 'Gd', 'Ag', 'Pt'],
    correctAnswer: 0 // A. Au
  },
  {
    id: 5,
    type: 'mcq',
    question: 'Which of these processes is not typically involved in refining petroleum?',
    options: ['Fractional distillation', 'Cracking', 'Polymerization', 'Filtration'],
    correctAnswer: 3 // D. Filtration
  },
  {
    id: 6,
    type: 'integer',
    question: 'What is the value of 12 + 28?',
    correctAnswer: 40
  },
  {
    id: 7,
    type: 'integer',
    question: 'How many states are there in the United States?',
    correctAnswer: 50
  },
  {
    id: 8,
    type: 'integer',
    question: 'In which year was the Declaration of Independence signed?',
    correctAnswer: 1776
  },
  {
    id: 9,
    type: 'integer',
    question: 'What is the value of pi rounded to the nearest integer?',
    correctAnswer: 3
  },
  {
    id: 10,
    type: 'integer',
    question: 'If a car travels at 60 mph for 2 hours, how many miles does it travel?',
    correctAnswer: 120
  }
];

export default function QuizPage() {
  const [playerName, setPlayerName] = React.useState('');
  const [started, setStarted] = React.useState(false);
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(30);
  const [showResults, setShowResults] = React.useState(false);
  const [integerAnswer, setIntegerAnswer] = React.useState('');
  const currentQ = sampleQuestions[currentQuestion];
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (started && !showResults) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleNextQuestion();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [started, currentQuestion, showResults]);

  const handleStartQuiz = () => {
    setStarted(true);
    setTimeLeft(30);
  };

  const handleMCQAnswer = (selectedOption: number) => {
    const question = sampleQuestions[currentQuestion] as MCQQuestion;
    const isLastQuestion = currentQuestion === sampleQuestions.length - 1;
    
    if (question.correctAnswer === selectedOption) {
      if (isLastQuestion) {
        // For last question, update score and show results directly
        setScore(prev => prev + 1);
        saveAttempt({
          date: new Date().toISOString(),
          score: score + 1, // Use the incremented score
          totalQuestions: sampleQuestions.length,
        });
        setShowResults(true);
      } else {
        setScore(prev => prev + 1);
        handleNextQuestion();
      }
    } else if (isLastQuestion) {
      // For wrong answer on last question
      saveAttempt({
        date: new Date().toISOString(),
        score,
        totalQuestions: sampleQuestions.length,
      });
      setShowResults(true);
    } else {
      handleNextQuestion();
    }
  };
  
  const handleIntegerAnswer = () => {
    const question = sampleQuestions[currentQuestion] as IntegerQuestion;
    const isLastQuestion = currentQuestion === sampleQuestions.length - 1;
    
    if (parseInt(integerAnswer) === question.correctAnswer) {
      if (isLastQuestion) {
        // For last question, update score and show results directly
        setScore(prev => prev + 1);
        saveAttempt({
          date: new Date().toISOString(),
          score: score + 1, // Use the incremented score
          totalQuestions: sampleQuestions.length,
        });
        setShowResults(true);
      } else {
        setScore(prev => prev + 1);
        handleNextQuestion();
      }
    } else if (isLastQuestion) {
   
      saveAttempt({
        date: new Date().toISOString(),
        score,
        totalQuestions: sampleQuestions.length,
      });
      setShowResults(true);
    } else {
      handleNextQuestion();
    }
    
    setIntegerAnswer('');
  };
  

  
  const handleNextQuestion = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(30);
    }
  };

  const saveAttempt = async (attemptData: Omit<QuizAttempt, 'id' | 'playerName'>) => {
    try {
      const db = await openDB<QuizAttempt>('quizDB', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('attempts')) {
            const store = db.createObjectStore('attempts', { 
              keyPath: 'id', 
              autoIncrement: true 
            });
            // Create indexes for better querying
            store.createIndex('playerName', 'playerName');
            store.createIndex('date', 'date');
          }
        },
      });
  
      // Add the attempt with player name
      const attempt: Omit<QuizAttempt, 'id'> = {
        ...attemptData,
        playerName,
      };
  
      await db.add('attempts', attempt);
      console.log('Quiz attempt saved successfully');
    } catch (error) {
      console.error('Error saving attempt:', error);
    }
  };
  // Add this at the top with your other imports
const backgroundStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
};

// Replace the start screen return statement
if (!started) {
  return (
    <div className="min-h-screen" style={backgroundStyle}>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto border-none shadow-2xl backdrop-blur-sm bg-white/90">
          <CardContent className="p-8">
            <div className="text-center mb-8 space-y-2">
              <h1 className="text-4xl font-bold text-gray-800 mb-3">🎯 Quiz Challenge</h1>
              <p className="text-gray-600 text-lg">Ready to test your knowledge?</p>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <label htmlFor="name" className="text-sm font-medium text-gray-700 block text-center">
                  Enter your name to begin the challenge
                </label>
                <Input
                  id="name"
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your name"
                  className="w-full p-6 text-lg text-center font-medium rounded-xl border-2 focus:border-blue-500"
                />
              </div>

              <div className="bg-blue-50 rounded-xl p-6 space-y-4 border border-blue-100">
                <div className="flex justify-between items-center p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">📋</span>
                    <span className="text-gray-600">Questions:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-600 text-lg">{sampleQuestions.length}</span>
                    <span className="text-sm text-gray-500">(5 MCQ + 5 Integer)</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">⏱️</span>
                    <span className="text-gray-600">Time per question:</span>
                  </div>
                  <span className="font-semibold text-blue-600 text-lg">30 seconds</span>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Button 
                  onClick={handleStartQuiz} 
                  className="w-full py-8 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl"
                  disabled={!playerName.trim()}
                >
                  Start Quiz
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full py-6 text-lg hover:bg-gray-50 transition-all duration-300 rounded-xl" 
                  asChild
                >
                  <Link href="/history">View Previous Attempts</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Replace the results screen return statement
if (showResults) {
  const percentage = (score / sampleQuestions.length) * 100;
  const getResultMessage = () => {
    if (percentage >= 80) return "🎉 Outstanding!";
    if (percentage >= 60) return "👏 Well Done!";
    return "🎯 Keep Practicing!";
  };

  return (
    <div className="min-h-screen" style={backgroundStyle}>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto border-none shadow-2xl backdrop-blur-sm bg-white/90">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">{getResultMessage()}</h2>
              <p className="text-xl text-gray-600">
                Great effort, {playerName}!
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-8 mb-8 border border-blue-100">
              <div className="text-center mb-6">
                <div className="text-7xl font-bold text-blue-600 mb-3">
                  {score}/{sampleQuestions.length}
                </div>
                <div className="text-gray-600 text-xl">
                  {percentage.toFixed(0)}% Score
                </div>
              </div>
              <Progress 
                value={percentage}
                className="h-4 rounded-full"
              />
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => {
                  setStarted(false);
                  setCurrentQuestion(0);
                  setScore(0);
                  setShowResults(false);
                }}
                className="flex-1 py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 rounded-xl"
              >
                Try Again
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 py-6 text-lg hover:bg-gray-50 transition-all duration-300 rounded-xl" 
                asChild
              >
                <Link href="/history">View History</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Replace the main quiz screen return statement
return (
  <div className="min-h-screen" style={backgroundStyle}>
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Section */}
        <Card className="border-none shadow-lg backdrop-blur-sm bg-white/90">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {playerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Player</div>
                  <div className="font-semibold">{playerName}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Score</div>
                <div className="font-bold text-blue-600">{score}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timer and Progress */}
        <Card className="border-none shadow-lg backdrop-blur-sm bg-white/90">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="text-sm text-gray-500 font-medium">
                  Question {currentQuestion + 1} of {sampleQuestions.length}
                </div>
                <Progress 
                  value={(currentQuestion / sampleQuestions.length) * 100} 
                  className="h-2 w-32"
                />
              </div>
              <div className={`px-6 py-3 rounded-lg ${
                timeLeft <= 10 ? 'bg-red-50 animate-pulse' : 'bg-blue-50'
              }`}>
                <div className="text-sm text-gray-500">Time Left</div>
                <div className={`text-2xl font-bold ${
                  timeLeft <= 10 ? 'text-red-500' : 'text-blue-600'
                }`}>
                  {timeLeft}s
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="border-none shadow-xl backdrop-blur-sm bg-white/90">
          <CardContent className="p-8">
            <div className="mb-8">
              <div className="text-sm text-blue-600 font-medium mb-2">
                {currentQ.type === 'mcq' ? '📝 Multiple Choice' : '🔢 Numerical Answer'}
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {currentQ.question}
              </h2>
            </div>

            {currentQ.type === 'mcq' ? (
              <div className="grid gap-4">
                {currentQ.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-6 px-8 text-lg hover:bg-blue-50 hover:border-blue-300 transition-all hover:scale-102 hover:shadow-md rounded-xl"
                    onClick={() => handleMCQAnswer(index)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{option}</span>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 p-8 rounded-xl border border-blue-100">
                  <Input
                    type="number"
                    value={integerAnswer}
                    onChange={(e) => setIntegerAnswer(e.target.value)}
                    placeholder="Enter your numeric answer"
                    className="text-lg p-6 border-2 focus:border-blue-500 rounded-xl text-center font-semibold"
                  />
                </div>
                <Button 
                  className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 rounded-xl" 
                  onClick={handleIntegerAnswer}
                  disabled={!integerAnswer}
                >
                  Submit Answer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom Progress */}
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-1">
          <Progress 
            value={(currentQuestion / sampleQuestions.length) * 100} 
            className="h-2"
          />
        </div>
      </div>
    </div>
  </div>
)};