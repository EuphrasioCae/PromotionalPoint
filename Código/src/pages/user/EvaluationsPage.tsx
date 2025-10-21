import React, { useMemo, useState } from 'react';
import { useNPS } from '@/contexts/NPSContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ThumbsUp, Meh, ThumbsDown, CheckCircle } from 'lucide-react';
import type { Emoji3Rating, Emoji5Rating, Rating } from '@/types/nps';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const pendingQuestions = assignedQuestions; // kiosk-style: always available
  const completedQuestions = userResponses
    .map(r => r.questionId)
    .filter((id, idx, arr) => arr.indexOf(id) === idx)
    .map(id => assignedQuestions.find(q => q.id === id))
    .filter(Boolean) as typeof assignedQuestions;

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Evaluations</h2>
        <p className="text-gray-500 mt-1">Share your feedback on our services</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending">
            Pending ({pendingQuestions.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedQuestions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6 mt-6">
          {pendingQuestions.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-500">You've completed all available evaluations.</p>
              </CardContent>
            </Card>
          ) : (
            pendingQuestions.map((question) => (
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

                  <Button
                    onClick={() => handleSubmit(question.id)}
                    className="w-full"
                    size="lg"
                  >
                    Submit Response
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedQuestions.map((question) => {
            const response = userResponses.find(r => r.questionId === question.id);
            return (
              <Card key={question.id} className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${(() => {
                      const t: any = (response as any)?.rating?.type;
                      const v: any = (response as any)?.rating?.value;
                      if (t === 'numeric') return v >= 9 ? 'bg-green-500' : v >= 7 ? 'bg-yellow-500' : 'bg-red-500';
                      if (t === 'emoji3') return v === 'good' || v === 'excellent' ? 'bg-green-500' : 'bg-red-500';
                      return v === 'excellent' || v === 'very_good' || v === 'good' ? 'bg-green-500' : v === 'not_good' ? 'bg-yellow-500' : 'bg-red-500';
                    })()}`}>
                      {(() => {
                        const t: any = (response as any)?.rating?.type;
                        const v: any = (response as any)?.rating?.value;
                        if (t === 'numeric') return String(v);
                        if (t === 'emoji3') return v === 'good' || v === 'excellent' ? '😊' : '😞';
                        return v === 'excellent' ? '🤩' : v === 'very_good' ? '😊' : v === 'good' ? '🙂' : v === 'not_good' ? '😐' : '😞';
                      })()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                          {question.questionId}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${(() => {
                          const t: any = (response as any)?.rating?.type;
                          const v: any = (response as any)?.rating?.value;
                          if (t === 'numeric') return v >= 9 ? 'bg-green-100 text-green-700' : v >= 7 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
                          if (t === 'emoji3') return v === 'good' || v === 'excellent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
                          return v === 'excellent' || v === 'very_good' || v === 'good' ? 'bg-green-100 text-green-700' : v === 'not_good' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
                        })()}`}>
                          {(() => {
                            const rv: any = (response as any)?.rating;
                            return rv?.type === 'numeric' ? String(rv.value) : rv?.value;
                          })()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-2">{question.text}</p>
                      {response && (response as any).comment && (
                        <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">
                          "{(response as any).comment}"
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Submitted on {new Date((response as any)?.createdAt || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
