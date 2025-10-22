import React, { useMemo, useState } from 'react';
import { useNPS } from '@/contexts/NPSContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ThumbsUp, Meh, ThumbsDown, CheckCircle } from 'lucide-react';
import type { Emoji3Rating, Emoji5Rating, Rating } from '@/types/nps';
// Tabs removed as per requirement to show only questions directly

export default function EvaluationsPage() {
  const { questions, responses, addResponse } = useNPS();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRatings, setSelectedRatings] = useState<Record<string, Rating>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [numericScores, setNumericScores] = useState<Record<string, number>>({});

  const assignedQuestions = useMemo(() => {
    return questions.filter(q => q.isActive).filter(q => {
      if (q.assignedTo === 'all') return true;
      return q.assignedUserIds?.includes(user?.id || '');
    });
  }, [questions, user?.id]);

  const userResponses = responses.filter(r => r.userId === user?.id);
  const pendingQuestions = assignedQuestions; // show all assigned questions directly

  const handleRatingSelectEmoji5 = (questionId: string, value: Emoji5Rating) => {
    setSelectedRatings({ ...selectedRatings, [questionId]: { type: 'emoji5', value } });
  };

  const handleRatingSelectEmoji3 = (questionId: string, value: Emoji3Rating) => {
    setSelectedRatings({ ...selectedRatings, [questionId]: { type: 'emoji3', value } });
  };

  const handleSubmit = (questionId: string) => {
    const rating = selectedRatings[questionId] || (numericScores[questionId] !== undefined ? { type: 'numeric', value: numericScores[questionId] } : undefined);
    if (!rating) {
      toast({
        title: 'Please select a rating',
        description: 'You must select a rating before submitting.',
        variant: 'destructive',
      });
      return;
    }

    addResponse({
      questionId,
      userId: user?.id || '',
      userName: user?.name || '',
      rating,
      comment: comments[questionId] || undefined
    });

    toast({
      title: 'Response submitted',
      description: 'Thank you for your feedback!',
    });

    // Clear form
    const newRatings = { ...selectedRatings };
    delete newRatings[questionId];
    setSelectedRatings(newRatings);

    const newComments = { ...comments };
    delete newComments[questionId];
    setComments(newComments);

    const newNumeric = { ...numericScores };
    delete newNumeric[questionId];
    setNumericScores(newNumeric);
  };

  const EmojiRatingButton = ({ 
    current, 
    onClick,
    icon: Icon, 
    label, 
    color 
  }: { 
    current: boolean;
    onClick: () => void;
    icon: any; 
    label: string; 
    color: string;
  }) => {
    return (
      <button
        onClick={onClick}
        className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
          current
            ? `${color} border-transparent shadow-lg scale-105`
            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
      >
        <Icon className={`w-8 h-8 mx-auto mb-2 ${current ? 'text-white' : 'text-gray-400'}`} />
        <p className={`text-sm font-semibold ${current ? 'text-white' : 'text-gray-700'}`}>
          {label}
        </p>
      </button>
    );
  };

  const NumericScale = ({ questionId }: { questionId: string }) => {
    const value = numericScores[questionId] ?? 0;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(e) => setNumericScores({ ...numericScores, [questionId]: Number(e.target.value) })}
          className="w-full"
        />
        <div className="text-center text-sm font-semibold">Score: {value}</div>
      </div>
    );
  };

  // Mandatory all-questions form
  const allAnswered = useMemo(() => {
    return pendingQuestions.every((q) => {
      const sel = selectedRatings[q.id];
      if (!sel && q.scaleType !== 'numeric') return false;
      if (q.scaleType === 'numeric') {
        return typeof numericScores[q.id] === 'number';
      }
      return !!sel;
    });
  }, [pendingQuestions, selectedRatings, numericScores]);

  const submitAll = () => {
    if (!allAnswered) return;
    pendingQuestions.forEach((q) => {
      const rating = selectedRatings[q.id] || { type: 'numeric', value: numericScores[q.id] } as any;
      addResponse({
        questionId: q.id,
        userId: user?.id || '',
        userName: user?.name || '',
        rating,
        comment: comments[q.id] || undefined,
      });
    });
    setSelectedRatings({});
    setComments({});
    setNumericScores({});
    toast({ title: 'Responses submitted', description: 'Thank you for your feedback!' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Evaluations</h2>
        <p className="text-gray-500 mt-1">Please answer all questions below</p>
      </div>

      <div className="space-y-6">
        {pendingQuestions.map((question) => (
          <Card key={question.id} className="shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  {question.questionId}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  {question.scaleType === 'emoji5' ? '5 Emojis' : question.scaleType === 'emoji3' ? '3 Emojis' : '0-10'}
                </span>
              </div>
              <CardTitle className="text-xl mt-3">{question.text}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">How would you rate this?</p>
                {question.scaleType === 'emoji3' && (
                  <div className="grid grid-cols-3 gap-4">
                    <EmojiRatingButton
                      current={(selectedRatings[question.id] as any)?.type === 'emoji3' && (selectedRatings[question.id] as any)?.value === 'good'}
                      onClick={() => handleRatingSelectEmoji3(question.id, 'good')}
                      icon={ThumbsUp}
                      label="Good"
                      color="bg-green-500"
                    />
                    <EmojiRatingButton
                      current={(selectedRatings[question.id] as any)?.type === 'emoji3' && (selectedRatings[question.id] as any)?.value === 'bad'}
                      onClick={() => handleRatingSelectEmoji3(question.id, 'bad')}
                      icon={ThumbsDown}
                      label="Bad"
                      color="bg-red-500"
                    />
                    <EmojiRatingButton
                      current={(selectedRatings[question.id] as any)?.type === 'emoji3' && (selectedRatings[question.id] as any)?.value === 'excellent'}
                      onClick={() => handleRatingSelectEmoji3(question.id, 'excellent')}
                      icon={ThumbsUp}
                      label="Excellent"
                      color="bg-green-700"
                    />
                  </div>
                )}
                {question.scaleType === 'emoji5' && (
                  <div className="grid grid-cols-5 gap-3">
                    <EmojiRatingButton
                      current={(selectedRatings[question.id] as any)?.type === 'emoji5' && (selectedRatings[question.id] as any)?.value === 'bad'}
                      onClick={() => handleRatingSelectEmoji5(question.id, 'bad')}
                      icon={ThumbsDown}
                      label="Bad"
                      color="bg-red-500"
                    />
                    <EmojiRatingButton
                      current={(selectedRatings[question.id] as any)?.type === 'emoji5' && (selectedRatings[question.id] as any)?.value === 'not_good'}
                      onClick={() => handleRatingSelectEmoji5(question.id, 'not_good')}
                      icon={Meh}
                      label="Not Good"
                      color="bg-orange-500"
                    />
                    <EmojiRatingButton
                      current={(selectedRatings[question.id] as any)?.type === 'emoji5' && (selectedRatings[question.id] as any)?.value === 'good'}
                      onClick={() => handleRatingSelectEmoji5(question.id, 'good')}
                      icon={ThumbsUp}
                      label="Good"
                      color="bg-yellow-500"
                    />
                    <EmojiRatingButton
                      current={(selectedRatings[question.id] as any)?.type === 'emoji5' && (selectedRatings[question.id] as any)?.value === 'very_good'}
                      onClick={() => handleRatingSelectEmoji5(question.id, 'very_good')}
                      icon={ThumbsUp}
                      label="Very Good"
                      color="bg-green-500"
                    />
                    <EmojiRatingButton
                      current={(selectedRatings[question.id] as any)?.type === 'emoji5' && (selectedRatings[question.id] as any)?.value === 'excellent'}
                      onClick={() => handleRatingSelectEmoji5(question.id, 'excellent')}
                      icon={ThumbsUp}
                      label="Excellent"
                      color="bg-green-700"
                    />
                  </div>
                )}
                {question.scaleType === 'numeric' && (
                  <NumericScale questionId={question.id} />
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Additional Comments (Optional)
                </label>
                <Textarea
                  placeholder="Share your thoughts..."
                  value={comments[question.id] || ''}
                  onChange={(e) => setComments({ ...comments, [question.id]: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-2">
        <Button className="w-full h-12 text-base" onClick={submitAll} disabled={!allAnswered}>
          {allAnswered ? 'Submit All Responses' : 'Answer all questions to submit'}
        </Button>
      </div>
    </div>
  );
}
