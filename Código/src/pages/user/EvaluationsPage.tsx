import React, { useState } from 'react';
import { useNPS } from '@/contexts/NPSContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ThumbsUp, Meh, ThumbsDown, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EvaluationsPage() {
  const { questions, responses, addResponse } = useNPS();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRatings, setSelectedRatings] = useState<Record<string, 'good' | 'regular' | 'bad'>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  const activeQuestions = questions.filter(q => q.isActive);
  const userResponses = responses.filter(r => r.userId === user?.id);
  const answeredQuestionIds = new Set(userResponses.map(r => r.questionId));
  const pendingQuestions = activeQuestions.filter(q => !answeredQuestionIds.has(q.id));
  const completedQuestions = activeQuestions.filter(q => answeredQuestionIds.has(q.id));

  const handleRatingSelect = (questionId: string, rating: 'good' | 'regular' | 'bad') => {
    setSelectedRatings({ ...selectedRatings, [questionId]: rating });
  };

  const handleSubmit = (questionId: string) => {
    const rating = selectedRatings[questionId];
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
  };

  const RatingButton = ({ 
    rating, 
    questionId, 
    icon: Icon, 
    label, 
    color 
  }: { 
    rating: 'good' | 'regular' | 'bad'; 
    questionId: string; 
    icon: any; 
    label: string; 
    color: string;
  }) => {
    const isSelected = selectedRatings[questionId] === rating;
    return (
      <button
        onClick={() => handleRatingSelect(questionId, rating)}
        className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
          isSelected
            ? `${color} border-transparent shadow-lg scale-105`
            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
      >
        <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
        <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
          {label}
        </p>
      </button>
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
                  </div>
                  <CardTitle className="text-xl mt-3">{question.text}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">How would you rate this?</p>
                    <div className="grid grid-cols-3 gap-4">
                      <RatingButton
                        rating="good"
                        questionId={question.id}
                        icon={ThumbsUp}
                        label="Good"
                        color="bg-green-500"
                      />
                      <RatingButton
                        rating="regular"
                        questionId={question.id}
                        icon={Meh}
                        label="Regular"
                        color="bg-yellow-500"
                      />
                      <RatingButton
                        rating="bad"
                        questionId={question.id}
                        icon={ThumbsDown}
                        label="Bad"
                        color="bg-red-500"
                      />
                    </div>
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
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                      response?.rating === 'good' ? 'bg-green-500' :
                      response?.rating === 'regular' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {response?.rating === 'good' ? '😊' : response?.rating === 'regular' ? '😐' : '😞'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                          {question.questionId}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          response?.rating === 'good' ? 'bg-green-100 text-green-700' :
                          response?.rating === 'regular' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {response?.rating}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-2">{question.text}</p>
                      {response?.comment && (
                        <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">
                          "{response.comment}"
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Submitted on {new Date(response?.createdAt || '').toLocaleDateString()}
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
