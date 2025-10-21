import React, { useState } from 'react';
import { useNPS } from '@/contexts/NPSContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function QuestionsPage() {
  const { questions, addQuestion, updateQuestion, deleteQuestion } = useNPS();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    questionId: '',
    text: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingQuestion) {
      updateQuestion(editingQuestion, formData);
      toast({
        title: 'Question updated',
        description: 'The question has been updated successfully.',
      });
    } else {
      addQuestion({
        ...formData,
        createdBy: user?.name || 'Admin',
        isActive: true
      });
      toast({
        title: 'Question created',
        description: 'The question has been created successfully.',
      });
    }
    
    setIsDialogOpen(false);
    setEditingQuestion(null);
    setFormData({ questionId: '', text: '' });
  };

  const handleEdit = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      setFormData({
        questionId: question.questionId,
        text: question.text
      });
      setEditingQuestion(questionId);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = (questionId: string) => {
    deleteQuestion(questionId);
    toast({
      title: 'Question deleted',
      description: 'The question has been deleted successfully.',
    });
  };

  const toggleActive = (questionId: string, currentStatus: boolean) => {
    updateQuestion(questionId, { isActive: !currentStatus });
    toast({
      title: currentStatus ? 'Question deactivated' : 'Question activated',
      description: `The question has been ${currentStatus ? 'deactivated' : 'activated'}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Question Management</h2>
          <p className="text-gray-500 mt-1">Create and manage NPS evaluation questions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg" onClick={() => {
              setEditingQuestion(null);
              setFormData({ questionId: '', text: '' });
            }}>
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingQuestion ? 'Edit Question' : 'Create New Question'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="questionId">Question ID</Label>
                <Input
                  id="questionId"
                  placeholder="e.g., Q003"
                  value={formData.questionId}
                  onChange={(e) => setFormData({ ...formData, questionId: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="text">Question Text</Label>
                <Textarea
                  id="text"
                  placeholder="Enter your NPS question..."
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingQuestion ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {questions.map((question) => (
          <Card key={question.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      {question.questionId}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      question.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {question.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{question.text}</CardTitle>
                  <p className="text-sm text-gray-500 mt-2">
                    Created by {question.createdBy} on {new Date(question.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActive(question.id, question.isActive)}
                    title={question.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {question.isActive ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(question.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Question</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this question? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(question.id)} className="bg-red-600 hover:bg-red-700">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
