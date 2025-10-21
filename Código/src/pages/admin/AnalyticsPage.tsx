import React, { useState, useMemo } from 'react';
import { useNPS } from '@/contexts/NPSContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TrendingUp, ThumbsUp, Meh, ThumbsDown } from 'lucide-react';
import type { Rating } from '@/types/nps';

export default function AnalyticsPage() {
  const { questions, responses } = useNPS();
  const [selectedQuestion, setSelectedQuestion] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');

  const filteredResponses = useMemo(() => {
    return responses.filter(r => {
      const questionMatch = selectedQuestion === 'all' || r.questionId === selectedQuestion;
      const ratingMatch = (() => {
        if (selectedRating === 'all') return true;
        if (typeof (r.rating as any).value !== 'undefined') {
          const rv = r.rating as Rating;
          if (rv.type === 'numeric') return selectedRating === 'numeric';
          return rv.value === selectedRating;
        }
        return false;
      })();
      return questionMatch && ratingMatch;
    });
  }, [responses, selectedQuestion, selectedRating]);

  const stats = useMemo(() => {
    const total = filteredResponses.length;
    const emoji5 = filteredResponses.filter(r => (r.rating as any).type === 'emoji5');
    const emoji3 = filteredResponses.filter(r => (r.rating as any).type === 'emoji3');
    const numeric = filteredResponses.filter(r => (r.rating as any).type === 'numeric');

    const countValue = (arr: typeof filteredResponses, val: string) => arr.filter(r => (r.rating as any).value === val).length;

    const good = countValue(emoji3, 'good') + countValue(emoji5, 'good') + countValue(emoji5, 'very_good') + countValue(emoji5, 'excellent');
    const regular = countValue(emoji3, 'bad') + countValue(emoji5, 'not_good');
    const bad = countValue(emoji5, 'bad');

    // For numeric, derive Net Promoter Style: 9-10 promoters as good, 7-8 neutral, 0-6 bad
    const numValues = numeric.map(r => (r.rating as any).value as number);
    const numGood = numValues.filter(v => v >= 9).length;
    const numRegular = numValues.filter(v => v >= 7 && v <= 8).length;
    const numBad = numValues.filter(v => v <= 6).length;

    const totalGood = good + numGood;
    const totalRegular = regular + numRegular;
    const totalBad = bad + numBad;

    const finalTotal = total;

    return {
      total: finalTotal,
      good: totalGood,
      regular: totalRegular,
      bad: totalBad,
      goodPercent: finalTotal > 0 ? Math.round((totalGood / finalTotal) * 100) : 0,
      regularPercent: finalTotal > 0 ? Math.round((totalRegular / finalTotal) * 100) : 0,
      badPercent: finalTotal > 0 ? Math.round((totalBad / finalTotal) * 100) : 0,
      npsScore: finalTotal > 0 ? Math.round((totalGood / finalTotal) * 100) : 0
    };
  }, [filteredResponses]);

  const questionStats = useMemo(() => {
    return questions.map(q => {
      const qResponses = responses.filter(r => r.questionId === q.id);
      const total = qResponses.length;
      const score = (() => {
        if (q.scaleType === 'numeric') {
          const values = qResponses.map(r => (r.rating as any).value as number);
          const promoters = values.filter(v => v >= 9).length;
          return total > 0 ? Math.round((promoters / total) * 100) : 0;
        }
        if (q.scaleType === 'emoji3') {
          const good = qResponses.filter(r => (r.rating as any).value === 'good' || (r.rating as any).value === 'excellent').length;
          return total > 0 ? Math.round((good / total) * 100) : 0;
        }
        // emoji5
        const good = qResponses.filter(r => ['good', 'very_good', 'excellent'].includes((r.rating as any).value)).length;
        return total > 0 ? Math.round((good / total) * 100) : 0;
      })();
      return { question: q, total, score };
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
                  <SelectItem value="bad">Bad</SelectItem>
                  <SelectItem value="not_good">Not Good</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="very_good">Very Good</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="numeric">Numeric (0-10)</SelectItem>
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
      
    </div>
  );
}
