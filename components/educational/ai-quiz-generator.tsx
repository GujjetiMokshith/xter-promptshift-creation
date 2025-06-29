"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain, 
  Play, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Download,
  Trophy,
  Target,
  Clock,
  Zap,
  BookOpen,
  Loader2
} from "lucide-react"
import { generateQuiz } from "@/lib/groq-service"

interface QuizQuestion {
  id: string
  type: "multiple-choice" | "true-false" | "short-answer"
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
  difficulty: "easy" | "medium" | "hard"
}

interface QuizResult {
  questionId: string
  userAnswer: string
  isCorrect: boolean
  timeSpent: number
}

interface AIQuizGeneratorProps {
  onBackToMain?: () => void
}

export function AIQuizGenerator({ onBackToMain }: AIQuizGeneratorProps) {
  const [activeTab, setActiveTab] = useState("create")
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [questionCount, setQuestionCount] = useState(5)
  const [questionTypes, setQuestionTypes] = useState<string[]>(["multiple-choice"])
  const [customContent, setCustomContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Quiz state
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null)

  const handleGenerateQuiz = async () => {
    if (!topic.trim() && !customContent.trim()) return

    setIsGenerating(true)
    try {
      const result = await generateQuiz({
        topic: topic || "Custom Content",
        difficulty,
        questionCount,
        questionTypes,
        customContent: customContent || undefined
      })

      if (result.questions) {
        setQuiz(result.questions)
        setActiveTab("quiz")
        setCurrentQuestionIndex(0)
        setUserAnswers({})
        setQuizResults([])
        setShowResults(false)
        setQuizStartTime(new Date())
        setQuestionStartTime(new Date())
      }
    } catch (error) {
      console.error("Error generating quiz:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [quiz[currentQuestionIndex].id]: answer
    }))
  }

  const handleNextQuestion = () => {
    const currentQuestion = quiz[currentQuestionIndex]
    const userAnswer = userAnswers[currentQuestion.id] || ""
    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()
    const timeSpent = questionStartTime ? Date.now() - questionStartTime.getTime() : 0

    const result: QuizResult = {
      questionId: currentQuestion.id,
      userAnswer,
      isCorrect,
      timeSpent
    }

    setQuizResults(prev => [...prev, result])

    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setQuestionStartTime(new Date())
    } else {
      setShowResults(true)
    }
  }

  const calculateScore = () => {
    const correct = quizResults.filter(r => r.isCorrect).length
    return Math.round((correct / quiz.length) * 100)
  }

  const getTotalTime = () => {
    return quizResults.reduce((total, result) => total + result.timeSpent, 0)
  }

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setUserAnswers({})
    setQuizResults([])
    setShowResults(false)
    setQuizStartTime(new Date())
    setQuestionStartTime(new Date())
  }

  const downloadResults = () => {
    const score = calculateScore()
    const totalTime = Math.round(getTotalTime() / 1000)
    
    let content = `Quiz Results - ${topic}\n`
    content += `Score: ${score}% (${quizResults.filter(r => r.isCorrect).length}/${quiz.length})\n`
    content += `Total Time: ${totalTime} seconds\n\n`
    
    quiz.forEach((question, index) => {
      const result = quizResults[index]
      content += `Question ${index + 1}: ${question.question}\n`
      content += `Your Answer: ${result?.userAnswer || "Not answered"}\n`
      content += `Correct Answer: ${question.correctAnswer}\n`
      content += `Result: ${result?.isCorrect ? "✓ Correct" : "✗ Incorrect"}\n`
      if (question.explanation) {
        content += `Explanation: ${question.explanation}\n`
      }
      content += `\n`
    })

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quiz-results-${topic.replace(/\s+/g, '-').toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const currentQuestion = quiz[currentQuestionIndex]
  const score = showResults ? calculateScore() : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-purple-200 shadow-lg">
        <CardHeader className="bg-purple-50 border-b border-purple-100">
          <CardTitle className="text-xl flex items-center gap-2 text-purple-900">
            <Brain className="h-5 w-5" />
            AI Quiz Generator
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardTitle>
          <CardDescription className="text-purple-700">
            Create custom quizzes on any topic and test your knowledge with AI-generated questions
          </CardDescription>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">
                <BookOpen className="h-4 w-4 mr-2" />
                Create Quiz
              </TabsTrigger>
              <TabsTrigger value="quiz" disabled={quiz.length === 0}>
                <Play className="h-4 w-4 mr-2" />
                Take Quiz {quiz.length > 0 && `(${quiz.length})`}
              </TabsTrigger>
              <TabsTrigger value="results" disabled={!showResults}>
                <Trophy className="h-4 w-4 mr-2" />
                Results {showResults && `(${score}%)`}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="create" className="m-0">
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Topic Input */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Quiz Topic</Label>
                  <Input
                    placeholder="Enter any topic (e.g., 'World War II', 'JavaScript Basics', 'Human Biology')"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>

                {/* Custom Content */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Custom Content (Optional)
                  </Label>
                  <Textarea
                    placeholder="Paste your study material, notes, or specific content you want to be quizzed on..."
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    className="min-h-[120px] border-purple-200 focus:border-purple-400"
                  />
                  <p className="text-xs text-gray-500">
                    💡 Add your own content to create highly specific quizzes based on your study materials
                  </p>
                </div>

                {/* Quiz Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Difficulty Level</Label>
                    <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                      <SelectTrigger className="border-purple-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">🟢 Easy</SelectItem>
                        <SelectItem value="medium">🟡 Medium</SelectItem>
                        <SelectItem value="hard">🔴 Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Number of Questions</Label>
                    <Select value={questionCount.toString()} onValueChange={(value) => setQuestionCount(parseInt(value))}>
                      <SelectTrigger className="border-purple-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Questions</SelectItem>
                        <SelectItem value="5">5 Questions</SelectItem>
                        <SelectItem value="10">10 Questions</SelectItem>
                        <SelectItem value="15">15 Questions</SelectItem>
                        <SelectItem value="20">20 Questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Question Types</Label>
                    <div className="space-y-2">
                      {[
                        { id: "multiple-choice", label: "Multiple Choice", emoji: "🔤" },
                        { id: "true-false", label: "True/False", emoji: "✅" },
                        { id: "short-answer", label: "Short Answer", emoji: "✍️" }
                      ].map((type) => (
                        <div key={type.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={type.id}
                            checked={questionTypes.includes(type.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setQuestionTypes(prev => [...prev, type.id])
                              } else {
                                setQuestionTypes(prev => prev.filter(t => t !== type.id))
                              }
                            }}
                            className="rounded border-purple-300"
                          />
                          <Label htmlFor={type.id} className="text-sm flex items-center gap-1">
                            <span>{type.emoji}</span>
                            {type.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleGenerateQuiz}
                    disabled={(!topic.trim() && !customContent.trim()) || isGenerating || questionTypes.length === 0}
                    className="bg-purple-600 hover:bg-purple-700 px-8 py-3 text-lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Generating Quiz...
                      </>
                    ) : (
                      <>
                        <Brain className="h-5 w-5 mr-2" />
                        Generate Quiz ✨
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="quiz" className="m-0">
            <CardContent className="pt-6">
              {quiz.length > 0 && !showResults && (
                <div className="space-y-6">
                  {/* Progress */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-purple-100 text-purple-800">
                        Question {currentQuestionIndex + 1} of {quiz.length}
                      </Badge>
                      <Badge variant="outline" className={`
                        ${currentQuestion.difficulty === 'easy' ? 'border-green-300 text-green-700' : 
                          currentQuestion.difficulty === 'medium' ? 'border-yellow-300 text-yellow-700' : 
                          'border-red-300 text-red-700'}
                      `}>
                        {currentQuestion.difficulty === 'easy' ? '🟢' : 
                         currentQuestion.difficulty === 'medium' ? '🟡' : '🔴'} 
                        {currentQuestion.difficulty}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetQuiz}
                      className="border-purple-200"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restart
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex) / quiz.length) * 100}%` }}
                    ></div>
                  </div>

                  {/* Question */}
                  <Card className="border-purple-100">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-6 leading-relaxed">
                        {currentQuestion.question}
                      </h3>

                      {/* Answer Options */}
                      {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
                        <RadioGroup
                          value={userAnswers[currentQuestion.id] || ""}
                          onValueChange={handleAnswerSelect}
                          className="space-y-3"
                        >
                          {currentQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                              <RadioGroupItem value={option} id={`option-${index}`} />
                              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}

                      {currentQuestion.type === "true-false" && (
                        <RadioGroup
                          value={userAnswers[currentQuestion.id] || ""}
                          onValueChange={handleAnswerSelect}
                          className="space-y-3"
                        >
                          {["True", "False"].map((option) => (
                            <div key={option} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                              <RadioGroupItem value={option} id={option} />
                              <Label htmlFor={option} className="flex-1 cursor-pointer flex items-center gap-2">
                                <span>{option === "True" ? "✅" : "❌"}</span>
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}

                      {currentQuestion.type === "short-answer" && (
                        <div className="space-y-3">
                          <Input
                            placeholder="Type your answer here..."
                            value={userAnswers[currentQuestion.id] || ""}
                            onChange={(e) => handleAnswerSelect(e.target.value)}
                            className="border-purple-200 focus:border-purple-400"
                          />
                          <p className="text-xs text-gray-500">
                            💡 Be concise and specific in your answer
                          </p>
                        </div>
                      )}

                      {/* Next Button */}
                      <div className="flex justify-end mt-6">
                        <Button
                          onClick={handleNextQuestion}
                          disabled={!userAnswers[currentQuestion.id]}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {currentQuestionIndex === quiz.length - 1 ? (
                            <>
                              <Trophy className="h-4 w-4 mr-2" />
                              Finish Quiz
                            </>
                          ) : (
                            <>
                              Next Question
                              <Target className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </TabsContent>

          <TabsContent value="results" className="m-0">
            <CardContent className="pt-6">
              {showResults && (
                <div className="space-y-6">
                  {/* Score Summary */}
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2">
                          <Trophy className="h-8 w-8 text-yellow-500" />
                          <h2 className="text-2xl font-bold text-green-800">Quiz Complete!</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">{score}%</div>
                            <div className="text-sm text-green-700">Final Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">
                              {quizResults.filter(r => r.isCorrect).length}/{quiz.length}
                            </div>
                            <div className="text-sm text-blue-700">Correct Answers</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">
                              {Math.round(getTotalTime() / 1000)}s
                            </div>
                            <div className="text-sm text-purple-700">Total Time</div>
                          </div>
                        </div>

                        <div className="flex justify-center gap-3">
                          <Button
                            onClick={resetQuiz}
                            variant="outline"
                            className="border-green-300 text-green-700 hover:bg-green-100"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Retake Quiz
                          </Button>
                          <Button
                            onClick={downloadResults}
                            variant="outline"
                            className="border-blue-300 text-blue-700 hover:bg-blue-100"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Results
                          </Button>
                          <Button
                            onClick={() => setActiveTab("create")}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Brain className="h-4 w-4 mr-2" />
                            Create New Quiz
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Results */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Detailed Review
                    </h3>
                    
                    {quiz.map((question, index) => {
                      const result = quizResults[index]
                      const isCorrect = result?.isCorrect
                      
                      return (
                        <Card key={question.id} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <h4 className="font-medium flex items-center gap-2">
                                  <span className="text-gray-500">Q{index + 1}.</span>
                                  {question.question}
                                </h4>
                                {isCorrect ? (
                                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-600">Your Answer: </span>
                                  <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                    {result?.userAnswer || "Not answered"}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Correct Answer: </span>
                                  <span className="text-green-600">{question.correctAnswer}</span>
                                </div>
                              </div>
                              
                              {question.explanation && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <p className="text-sm text-blue-800">
                                    <strong>💡 Explanation:</strong> {question.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}