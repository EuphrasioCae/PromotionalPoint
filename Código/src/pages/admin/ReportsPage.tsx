import React, { useMemo } from 'react';
import { useNPS } from '@/contexts/NPSContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { FileDown, FileText } from 'lucide-react';

export default function ReportsPage() {
  const { questions, responses, users } = useNPS();
  const { toast } = useToast();
  const responsesWithDetails = useMemo(() => {
    return responses.map(r => {
      const question = questions.find(q => q.id === r.questionId);
      const scale = (r.rating as any).type === 'numeric' ? 'numeric' : (r.rating as any).type;
      const ratingValue = (r.rating as any).value;
      return { r, question, scale, ratingValue };
    });
  }, [responses, questions]);

  const generateCSV = () => {
    const headers = ['Response ID', 'Company', 'Question ID', 'Scale', 'Question Text', 'User Name', 'Rating', 'Comment', 'Date'];
    const rows = responsesWithDetails.map(({ r, question, scale, ratingValue }) => {
      return [
        r.id,
        r.company,
        question?.questionId || '',
        scale,
        question?.text || '',
        r.userName,
        String(ratingValue),
        r.comment || '',
        new Date(r.createdAt).toLocaleDateString()
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nps-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({
      title: 'CSV Report Generated',
      description: 'Your report has been downloaded successfully.',
    });
  };

  const generatePDF = () => {
    // In a real application, you would use a library like jsPDF
    toast({
      title: 'PDF Generation',
      description: 'PDF generation would be implemented with a library like jsPDF.',
    });
  };

  const stats = {
    totalQuestions: questions.length,
    activeQuestions: questions.filter(q => q.isActive).length,
    totalResponses: responses.length,
    totalUsers: users.filter(u => u.role === 'user').length,
    goodResponses: responses.filter((r: any) => {
      const t = r.rating?.type; const v = r.rating?.value;
      if (t === 'numeric') return v >= 9; if (t === 'emoji3') return v === 'good' || v === 'excellent';
      return ['good','very_good','excellent'].includes(v);
    }).length,
    regularResponses: responses.filter((r: any) => {
      const t = r.rating?.type; const v = r.rating?.value;
      if (t === 'numeric') return v >= 7 && v <= 8; if (t === 'emoji5') return v === 'not_good';
      return false;
    }).length,
    badResponses: responses.filter((r: any) => {
      const t = r.rating?.type; const v = r.rating?.value;
      if (t === 'numeric') return v <= 6; if (t === 'emoji3') return v === 'bad'; if (t === 'emoji5') return v === 'bad';
      return false;
    }).length
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Export Reports</h2>
        <p className="text-gray-500 mt-1">Generate and download NPS reports</p>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={generateCSV}>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle>CSV Export</CardTitle>
                <p className="text-sm text-gray-500">Download data in CSV format</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button className="w-full gap-2" onClick={generateCSV}>
              <FileDown className="w-4 h-4" />
              Download CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={generatePDF}>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <CardTitle>PDF Export</CardTitle>
                <p className="text-sm text-gray-500">Download formatted PDF report</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button className="w-full gap-2" variant="outline" onClick={generatePDF}>
              <FileDown className="w-4 h-4" />
              Download PDF
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Report Summary */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Report Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalQuestions}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Active Questions</p>
              <p className="text-2xl font-bold text-purple-600">{stats.activeQuestions}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Responses</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalResponses}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalUsers}</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Response Breakdown</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{stats.goodResponses}</p>
                <p className="text-sm text-gray-600">Good</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{stats.regularResponses}</p>
                <p className="text-sm text-gray-600">Regular</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{stats.badResponses}</p>
                <p className="text-sm text-gray-600">Bad</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Responses Preview */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Recent Responses Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Question</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rating</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {responses.slice(-10).reverse().map((response: any) => {
                  const question = questions.find(q => q.id === response.questionId);
                  return (
                    <tr key={response.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{question?.questionId}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{response.userName}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${(() => {
                          const t = response.rating?.type; const v = response.rating?.value;
                          if (t === 'numeric') return v >= 9 ? 'bg-green-100 text-green-700' : v >=7 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
                          if (t === 'emoji3') return v === 'good' || v === 'excellent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
                          return v === 'excellent' || v === 'very_good' || v === 'good' ? 'bg-green-100 text-green-700' : v === 'not_good' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
                        })()}`}>
                          {(() => {
                            const t = response.rating?.type; const v = response.rating?.value;
                            return t === 'numeric' ? String(v) : v;
                          })()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(response.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
