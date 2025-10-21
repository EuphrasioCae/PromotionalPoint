import React, { useState, useMemo } from 'react';
import { useNPS } from '@/contexts/NPSContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TrendingUp, ThumbsUp, Meh, ThumbsDown } from 'lucide-react';

export default function AnalyticsPage() {
  const { questions, responses } = useNPS();
  const [selectedQuestion, setSelectedQuestion] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');

  const filteredResponses = useMemo(() => {
    return responses.filter(r => {
      const questionMatch = selectedQuestion === 'all' || r.questionId === selectedQuestion;
      const ratingMatch = selectedRating === 'all' || r.rating === selectedRating;
      return questionMatch && ratingMatch;
    });
  }, [responses, selectedQuestion, selectedRating]);

  const stats = useMemo(() => {
    const total = filteredResponses.length;
    const good = filteredResponses.filter(r => r.rating === 'good').length;
    const regular = filteredResponses.filter(r => r.rating === 'regular').length;
    const bad = filteredResponses.filter(r => r.rating === 'bad').length;

    return {
      total,
      good,
      regular,
      bad,
      goodPercent: total > 0 ? Math.round((good / total) * 100) : 0,
      regularPercent: total > 0 ? Math.round((regular / total) * 100) : 0,
      badPercent: total > 0 ? Math.round((bad / total) * 100) : 0,
      npsScore: total > 0 ? Math.round((good / total) * 100) : 0
    };
  }, [filteredResponses]);

  const questionStats = useMemo(() => {
    return questions.map(q => {
      const qResponses = responses.filter(r => r.questionId === q.id);
      const good = qResponses.filter(r => r.rating === 'good').length;
      const total = qResponses.length;
      return {
        question: q,
        total,
        score: total > 0 ? Math.round((good / total) * 100) : 0
      };
    });
  }, [questions, responses]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
        <p className="text-gray-500 mt-1">Visualize and analyze NPS data</p>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Select value={selectedQuestion} onValueChange={setSelectedQuestion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Questions</SelectItem>
                  {questions.map(q => (
                    <SelectItem key={q.id} value={q.id}>{q.questionId} - {q.text.substring(0, 50)}...</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Satisfaction Level</Label>
              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="bad">Bad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Responses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Good</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.good}</p>
                <p className="text-sm text-green-600 font-medium">{stats.goodPercent}%</p>
              </div>
              <ThumbsUp className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Regular</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.regular}</p>
                <p className="text-sm text-yellow-600 font-medium">{stats.regularPercent}%</p>
              </div>
              <Meh className="w-10 h-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Bad</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.bad}</p>
                <p className="text-sm text-red-600 font-medium">{stats.badPercent}%</p>
              </div>
              <ThumbsDown className="w-10 h-10 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Response Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Good</span>
                <span className="text-sm font-medium text-gray-700">{stats.good} ({stats.goodPercent}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-green-500 h-4 rounded-full transition-all duration-500" style={{ width: `${stats.goodPercent}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Regular</span>
                <span className="text-sm font-medium text-gray-700">{stats.regular} ({stats.regularPercent}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-yellow-500 h-4 rounded-full transition-all duration-500" style={{ width: `${stats.regularPercent}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Bad</span>
                <span className="text-sm font-medium text-gray-700">{stats.bad} ({stats.badPercent}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-red-500 h-4 rounded-full transition-all duration-500" style={{ width: `${stats.badPercent}%` }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Performance */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Question Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questionStats.map(({ question, total, score }) => (
              <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {question.questionId}
                    </span>
                    <p className="text-sm font-medium text-gray-900 mt-2">{question.text}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-gray-900">{score}%</p>
                    <p className="text-xs text-gray-500">{total} responses</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
