import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, X, Loader2, Music, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSongs, Song } from '@/hooks/useBirthdayData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export default function SongsManager() {
  const { data: songs, isLoading } = useSongs();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', artist: '', cover_url: '', audio_url: '', embed_url: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [newSong, setNewSong] = useState({ title: '', artist: '', cover_url: '', audio_url: '', embed_url: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editUploading, setEditUploading] = useState(false);
  const newAudioInputRef = useRef<HTMLInputElement>(null);
  const editAudioInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleEdit = (song: Song) => {
    setEditingId(song.id);
    setEditForm({
      title: song.title,
      artist: song.artist,
      cover_url: song.cover_url || '',
      audio_url: song.audio_url || '',
      embed_url: song.embed_url || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('songs')
        .update({
          title: editForm.title,
          artist: editForm.artist,
          cover_url: editForm.cover_url || null,
          audio_url: editForm.audio_url || null,
          embed_url: editForm.embed_url || null,
        })
        .eq('id', editingId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['songs'] });
      setEditingId(null);
      toast({ title: 'Song updated!' });
    } catch (err) {
      console.error('Error updating song:', err);
      toast({ title: 'Error updating song', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!newSong.title || !newSong.artist) {
      toast({ title: 'Please enter title and artist', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const maxOrder = songs?.reduce((max, s) => Math.max(max, s.display_order), 0) || 0;
      
      const { error } = await supabase
        .from('songs')
        .insert({
          title: newSong.title,
          artist: newSong.artist,
          cover_url: newSong.cover_url || null,
          audio_url: newSong.audio_url || null,
          embed_url: newSong.embed_url || null,
          display_order: maxOrder + 1,
        });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['songs'] });
      setIsAdding(false);
      setNewSong({ title: '', artist: '', cover_url: '', audio_url: '', embed_url: '' });
      toast({ title: 'Song added!' });
    } catch (err) {
      console.error('Error adding song:', err);
      toast({ title: 'Error adding song', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return;

    try {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['songs'] });
      toast({ title: 'Song deleted!' });
    } catch (err) {
      console.error('Error deleting song:', err);
      toast({ title: 'Error deleting song', variant: 'destructive' });
    }
  };

  const handleAudioUpload = async (
    file: File,
    target: 'new' | 'edit'
  ) => {
    const setLoading = target === 'new' ? setIsUploading : setEditUploading;
    setLoading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `songs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('birthday-media')
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('birthday-media')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      if (target === 'new') {
        setNewSong((prev) => ({ ...prev, audio_url: publicUrl }));
      } else {
        setEditForm((prev) => ({ ...prev, audio_url: publicUrl }));
      }

      toast({ title: 'Audio uploaded!' });
    } catch (err) {
      console.error('Error uploading audio:', err);
      toast({ title: 'Error uploading audio', variant: 'destructive' });
    } finally {
      setLoading(false);
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
      className="glass-card rounded-2xl p-6 md:p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          Songs
        </h2>
        <Button
          onClick={() => setIsAdding(true)}
          size="sm"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Song
        </Button>
      </div>

      {/* Add new song form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-muted/30 rounded-xl"
          >
            <h3 className="font-medium mb-4">Add New Song</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="new-title">Title *</Label>
                <Input
                  id="new-title"
                  value={newSong.title}
                  onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                  placeholder="Happy Birthday"
                  className="bg-muted/50"
                />
              </div>
              <div>
                <Label htmlFor="new-artist">Artist *</Label>
                <Input
                  id="new-artist"
                  value={newSong.artist}
                  onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                  placeholder="Birthday Classics"
                  className="bg-muted/50"
                />
              </div>
              <div>
                <Label htmlFor="new-cover">Cover (emoji or URL)</Label>
                <Input
                  id="new-cover"
                  value={newSong.cover_url}
                  onChange={(e) => setNewSong({ ...newSong, cover_url: e.target.value })}
                  placeholder="🎂 or https://..."
                  className="bg-muted/50"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="new-audio">Audio File (MP3)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="new-audio"
                    value={newSong.audio_url}
                    onChange={(e) => setNewSong({ ...newSong, audio_url: e.target.value })}
                    placeholder="URL will appear here after upload"
                    className="bg-muted/50 flex-1"
                    readOnly
                  />
                  <input
                    type="file"
                    ref={newAudioInputRef}
                    accept="audio/mpeg,audio/mp3,.mp3"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAudioUpload(file, 'new');
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => newAudioInputRef.current?.click()}
                    disabled={isUploading}
                    className="shrink-0"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                    {isUploading ? 'Uploading...' : 'Upload MP3'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Upload an MP3 file from your device</p>
              </div>
              <div>
                <Label htmlFor="new-embed">Embed URL (optional)</Label>
                <Input
                  id="new-embed"
                  value={newSong.embed_url}
                  onChange={(e) => setNewSong({ ...newSong, embed_url: e.target.value })}
                  placeholder="https://youtube.com/..."
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

      {/* Songs list */}
      <div className="space-y-3">
        {songs?.map((song) => (
          <motion.div
            key={song.id}
            layout
            className="relative group p-4 bg-muted/30 rounded-xl"
          >
            {editingId === song.id ? (
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="bg-muted/50"
                    />
                  </div>
                  <div>
                    <Label>Artist</Label>
                    <Input
                      value={editForm.artist}
                      onChange={(e) => setEditForm({ ...editForm, artist: e.target.value })}
                      className="bg-muted/50"
                    />
                  </div>
                  <div>
                    <Label>Cover</Label>
                    <Input
                      value={editForm.cover_url}
                      onChange={(e) => setEditForm({ ...editForm, cover_url: e.target.value })}
                      className="bg-muted/50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Audio File (MP3)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={editForm.audio_url}
                        onChange={(e) => setEditForm({ ...editForm, audio_url: e.target.value })}
                        placeholder="URL will appear here after upload"
                        className="bg-muted/50 flex-1"
                        readOnly
                      />
                      <input
                        type="file"
                        ref={editAudioInputRef}
                        accept="audio/mpeg,audio/mp3,.mp3"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAudioUpload(file, 'edit');
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => editAudioInputRef.current?.click()}
                        disabled={editUploading}
                        className="shrink-0"
                      >
                        {editUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                        {editUploading ? 'Uploading...' : 'Upload MP3'}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Embed URL (optional)</Label>
                    <Input
                      value={editForm.embed_url}
                      onChange={(e) => setEditForm({ ...editForm, embed_url: e.target.value })}
                      className="bg-muted/50"
                    />
                  </div>
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
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl shrink-0">
                  {song.cover_url?.startsWith('http') ? (
                    <img src={song.cover_url} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    song.cover_url || '🎵'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{song.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => handleEdit(song)}
                    size="icon"
                    variant="secondary"
                    className="w-8 h-8"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(song.id)}
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

      {(!songs || songs.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">
          <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No songs yet. Add your first song!</p>
        </div>
      )}
    </motion.div>
  );
}
