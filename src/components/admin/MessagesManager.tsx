import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, X, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMessages, Message } from '@/hooks/useBirthdayData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export default function MessagesManager() {
  const { data: messages, isLoading } = useMessages();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ content: '', author_name: '', message_type: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [newMessage, setNewMessage] = useState({ content: '', author_name: '', message_type: 'wish' });
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mainMessage = messages?.find(m => m.message_type === 'main');
  const wishes = messages?.filter(m => m.message_type === 'wish') || [];

  const handleEdit = (message: Message) => {
    setEditingId(message.id);
    setEditForm({
      content: message.content,
      author_name: message.author_name || '',
      message_type: message.message_type,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          content: editForm.content,
          author_name: editForm.author_name || null,
        })
        .eq('id', editingId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['messages'] });
      await queryClient.invalidateQueries({ queryKey: ['main-message'] });
      await queryClient.invalidateQueries({ queryKey: ['wishes'] });
      setEditingId(null);
      toast({ title: 'Message updated!' });
    } catch (err) {
      console.error('Error updating message:', err);
      toast({ title: 'Error updating message', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!newMessage.content) {
      toast({ title: 'Please enter a message', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const maxOrder = messages?.reduce((max, m) => Math.max(max, m.display_order), 0) || 0;
      
      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.content,
          author_name: newMessage.author_name || null,
          message_type: newMessage.message_type,
          display_order: maxOrder + 1,
        });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['messages'] });
      await queryClient.invalidateQueries({ queryKey: ['wishes'] });
      setIsAdding(false);
      setNewMessage({ content: '', author_name: '', message_type: 'wish' });
      toast({ title: 'Message added!' });
    } catch (err) {
      console.error('Error adding message:', err);
      toast({ title: 'Error adding message', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['messages'] });
      await queryClient.invalidateQueries({ queryKey: ['wishes'] });
      toast({ title: 'Message deleted!' });
    } catch (err) {
      console.error('Error deleting message:', err);
      toast({ title: 'Error deleting message', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Main Message Section */}
      <div className="glass-card rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
          <span className="text-2xl">💌</span>
          Main Birthday Message
        </h2>

        {mainMessage && (
          <div className="space-y-4">
            {editingId === mainMessage.id ? (
              <div className="space-y-4">
                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    rows={10}
                    className="bg-muted/50"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveEdit} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save
                  </Button>
                  <Button onClick={() => setEditingId(null)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">
                    {mainMessage.content}
                  </p>
                </div>
                <Button
                  onClick={() => handleEdit(mainMessage)}
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Birthday Wishes Section */}
      <div className="glass-card rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            Birthday Wishes
          </h2>
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Wish
          </Button>
        </div>

        {/* Add new wish form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-muted/30 rounded-xl"
            >
              <h3 className="font-medium mb-4">Add New Wish</h3>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="new-author">From (name)</Label>
                  <Input
                    id="new-author"
                    value={newMessage.author_name}
                    onChange={(e) => setNewMessage({ ...newMessage, author_name: e.target.value })}
                    placeholder="Best Friend"
                    className="bg-muted/50"
                  />
                </div>
                <div>
                  <Label htmlFor="new-content">Message *</Label>
                  <Textarea
                    id="new-content"
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                    placeholder="Wishing you a wonderful birthday! 🎂"
                    rows={3}
                    className="bg-muted/50"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAdd} disabled={isSaving} size="sm">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                  Save
                </Button>
                <Button onClick={() => setIsAdding(false)} variant="outline" size="sm">
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wishes list */}
        <div className="space-y-3">
          {wishes.map((wish) => (
            <motion.div
              key={wish.id}
              layout
              className="relative group p-4 bg-muted/30 rounded-xl"
            >
              {editingId === wish.id ? (
                <div className="space-y-3">
                  <div>
                    <Label>From</Label>
                    <Input
                      value={editForm.author_name}
                      onChange={(e) => setEditForm({ ...editForm, author_name: e.target.value })}
                      className="bg-muted/50"
                    />
                  </div>
                  <div>
                    <Label>Message</Label>
                    <Textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      rows={3}
                      className="bg-muted/50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit} disabled={isSaving} size="sm">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                    </Button>
                    <Button onClick={() => setEditingId(null)} variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg shrink-0">
                    💜
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary">{wish.author_name || 'Anonymous'}</p>
                    <p className="text-sm text-muted-foreground">{wish.content}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => handleEdit(wish)}
                      size="icon"
                      variant="secondary"
                      className="w-8 h-8"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(wish.id)}
                      size="icon"
                      variant="destructive"
                      className="w-8 h-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {wishes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No wishes yet. Add your first wish!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
