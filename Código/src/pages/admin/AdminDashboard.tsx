import React from 'react';
import { useNPS } from '@/contexts/NPSContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion, Users, MessageSquare, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { questions, responses, users } = useNPS();

  const activeQuestions = questions.filter(q => q.isActive).length;
  const totalResponses = responses.length;
  const totalUsers = users.filter(u => u.role === 'user').length;
  
  const goodResponses = responses.filter(r => r.rating === 'good').length;
  const npsScore = totalResponses > 0 ? Math.round((goodResponses / totalResponses) * 100) : 0;

  const stats = [
    {
      title: 'Active Questions',
      value: activeQuestions,
      icon: <FileQuestion className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Responses',
      value: totalResponses,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Active Users',
      value: totalUsers,
      icon: <Users className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'NPS Score',
      value: `${npsScore}%`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  const recentResponses = responses.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your NPS platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center ${stat.textColor}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Recent Responses</CardTitle>
        </CardHeader>
        <CardContent>
          {recentResponses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No responses yet</p>
          ) : (
            <div className="space-y-4">
              {recentResponses.map((response) => {
                const question = questions.find(q => q.id === response.questionId);
                return (
                  <div key={response.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                      response.rating === 'good' ? 'bg-green-500' :
                      response.rating === 'regular' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {response.rating === 'good' ? '😊' : response.rating === 'regular' ? '😐' : '😞'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{response.userName}</p>
                      <p className="text-sm text-gray-500 truncate">{question?.text}</p>
                      {response.comment && (
                        <p className="text-sm text-gray-600 mt-1 italic">"{response.comment}"</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(response.createdAt).toLocaleDateString()}
                    </div>
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
