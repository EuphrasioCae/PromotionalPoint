import React from 'react';
import { useNPS } from '@/contexts/NPSContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserDashboard() {
  const { questions, responses } = useNPS();
  const { user } = useAuth();

  const activeQuestions = questions.filter(q => q.isActive).filter(q => q.assignedTo === 'all' || q.assignedUserIds?.includes(user?.id || ''));
  const userResponses = responses.filter(r => r.userId === user?.id);
  const answeredQuestionIds = new Set(userResponses.map(r => r.questionId));
  const pendingQuestions = activeQuestions.filter(q => !answeredQuestionIds.has(q.id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}!</h2>
        <p className="text-gray-500 mt-1">View and respond to NPS evaluations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Available Evaluations</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeQuestions.length}</p>
              </div>
              <ClipboardList className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{userResponses.length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{pendingQuestions.length}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Evaluations */}
      {pendingQuestions.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Pending Evaluations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingQuestions.map((question) => (
                <div key={question.id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      {question.questionId}
                    </span>
                    <p className="text-sm font-medium text-gray-900 mt-2">{question.text}</p>
                  </div>
                  <Link to="/user/evaluations">
                    <Button size="sm" className="ml-4">
                      Answer Now
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Responses */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Recent Responses</CardTitle>
        </CardHeader>
        <CardContent>
          {userResponses.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">You haven't submitted any responses yet</p>
              <Link to="/user/evaluations">
                <Button className="mt-4">Start Evaluation</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userResponses.slice(-5).reverse().map((response) => {
                const question = questions.find(q => q.id === response.questionId);
                return (
                  <div key={response.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${(() => {
                      const t: any = (response as any).rating?.type;
                      const v: any = (response as any).rating?.value;
                      if (t === 'numeric') return v >= 9 ? 'bg-green-500' : v >= 7 ? 'bg-yellow-500' : 'bg-red-500';
                      if (t === 'emoji3') return v === 'good' || v === 'excellent' ? 'bg-green-500' : 'bg-red-500';
                      return v === 'excellent' || v === 'very_good' || v === 'good' ? 'bg-green-500' : v === 'not_good' ? 'bg-yellow-500' : 'bg-red-500';
                    })()}`}>
                      {(() => {
                        const t: any = (response as any).rating?.type;
                        const v: any = (response as any).rating?.value;
                        if (t === 'numeric') return String(v);
                        if (t === 'emoji3') return v === 'good' || v === 'excellent' ? '😊' : '😞';
                        return v === 'excellent' ? '🤩' : v === 'very_good' ? '😊' : v === 'good' ? '🙂' : v === 'not_good' ? '😐' : '😞';
                      })()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{question?.text}</p>
                      {(response as any).comment && (
                        <p className="text-sm text-gray-600 mt-1 italic">"{(response as any).comment}"</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(response.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${(() => {
                      const t: any = (response as any).rating?.type;
                      const v: any = (response as any).rating?.value;
                      if (t === 'numeric') return v >= 9 ? 'bg-green-100 text-green-700' : v >= 7 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
                      if (t === 'emoji3') return v === 'good' || v === 'excellent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
                      return v === 'excellent' || v === 'very_good' || v === 'good' ? 'bg-green-100 text-green-700' : v === 'not_good' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
                    })()}`}>
                      {(() => {
                        const rv: any = (response as any).rating;
                        return rv?.type === 'numeric' ? String(rv.value) : rv?.value;
                      })()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
