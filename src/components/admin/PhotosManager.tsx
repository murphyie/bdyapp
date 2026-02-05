import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, X, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePhotos, Photo } from '@/hooks/useBirthdayData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export default function PhotosManager() {
  const { data: photos, isLoading } = usePhotos();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ url: '', caption: '', year: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ url: '', caption: '', year: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadPhoto = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!fileExt || !allowedExts.includes(fileExt)) {
      toast({ 
        title: 'Invalid file type', 
        description: 'Please upload JPG, PNG, GIF, or WebP images.',
        variant: 'destructive' 
      });
      return null;
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('birthday-media')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast({ 
        title: 'Upload failed', 
        description: uploadError.message,
        variant: 'destructive' 
      });
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('birthday-media')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const url = await uploadPhoto(file);
    if (url) {
      setNewPhoto({ ...newPhoto, url });
      toast({ title: 'Photo uploaded!', description: 'You can now add caption and year.' });
    }
    setIsUploading(false);
    
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEditFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const url = await uploadPhoto(file);
    if (url) {
      setEditForm({ ...editForm, url });
      toast({ title: 'New photo uploaded!' });
    }
    setIsUploading(false);
    
    // Reset file input
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const handleEdit = (photo: Photo) => {
    setEditingId(photo.id);
    setEditForm({
      url: photo.url,
      caption: photo.caption || '',
      year: photo.year?.toString() || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('photos')
        .update({
          url: editForm.url,
          caption: editForm.caption || null,
          year: editForm.year ? parseInt(editForm.year) : null,
        })
        .eq('id', editingId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['photos'] });
      setEditingId(null);
      toast({ title: 'Photo updated!' });
    } catch (err) {
      console.error('Error updating photo:', err);
      toast({ title: 'Error updating photo', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!newPhoto.url) {
      toast({ title: 'Please enter a URL', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const maxOrder = photos?.reduce((max, p) => Math.max(max, p.display_order), 0) || 0;
      
      const { error } = await supabase
        .from('photos')
        .insert({
          url: newPhoto.url,
          caption: newPhoto.caption || null,
          year: newPhoto.year ? parseInt(newPhoto.year) : null,
          display_order: maxOrder + 1,
        });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['photos'] });
      setIsAdding(false);
      setNewPhoto({ url: '', caption: '', year: '' });
      toast({ title: 'Photo added!' });
    } catch (err) {
      console.error('Error adding photo:', err);
      toast({ title: 'Error adding photo', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['photos'] });
      toast({ title: 'Photo deleted!' });
    } catch (err) {
      console.error('Error deleting photo:', err);
      toast({ title: 'Error deleting photo', variant: 'destructive' });
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
          <span className="text-2xl">📸</span>
          Photos
        </h2>
        <Button
          onClick={() => setIsAdding(true)}
          size="sm"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Photo
        </Button>
      </div>

      {/* Add new photo form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-muted/30 rounded-xl"
          >
            <h3 className="font-medium mb-4">Add New Photo</h3>
            <div className="grid gap-4">
              {/* File Upload */}
              <div className="space-y-2">
                <Label>Upload Photo</Label>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Image
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports JPG, PNG, GIF, WebP
                </p>
              </div>

              {/* URL Preview */}
              {newPhoto.url && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="aspect-video max-w-xs rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={newPhoto.url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Or use URL */}
              <div className="space-y-2">
                <Label htmlFor="new-url">Or paste Image URL</Label>
                <Input
                  id="new-url"
                  value={newPhoto.url}
                  onChange={(e) => setNewPhoto({ ...newPhoto, url: e.target.value })}
                  placeholder="https://..."
                  className="bg-muted/50"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="new-caption">Caption</Label>
                  <Input
                    id="new-caption"
                    value={newPhoto.caption}
                    onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
                    placeholder="A lovely memory..."
                    className="bg-muted/50"
                  />
                </div>
                <div>
                  <Label htmlFor="new-year">Year</Label>
                  <Input
                    id="new-year"
                    type="number"
                    value={newPhoto.year}
                    onChange={(e) => setNewPhoto({ ...newPhoto, year: e.target.value })}
                    placeholder="2024"
                    className="bg-muted/50"
                  />
                </div>
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

      {/* Photos grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos?.map((photo) => (
          <motion.div
            key={photo.id}
            layout
            className="relative group rounded-xl overflow-hidden bg-muted/30"
          >
            {editingId === photo.id ? (
              <div className="p-4 space-y-3">
                {/* Upload new image for edit */}
                <div className="space-y-2">
                  <Label>Replace Image</Label>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleEditFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => editFileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload New Image
                      </>
                    )}
                  </Button>
                </div>
                <div>
                  <Label>URL</Label>
                  <Input
                    value={editForm.url}
                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>
                <div>
                  <Label>Caption</Label>
                  <Input
                    value={editForm.caption}
                    onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>
                <div>
                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={editForm.year}
                    onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
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
              <>
                <div className="aspect-square">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Photo'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{photo.caption || 'No caption'}</p>
                  <p className="text-xs text-muted-foreground">{photo.year || 'No year'}</p>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => handleEdit(photo)}
                    size="icon"
                    variant="secondary"
                    className="w-8 h-8"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(photo.id)}
                    size="icon"
                    variant="destructive"
                    className="w-8 h-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {(!photos || photos.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No photos yet. Add your first photo!</p>
        </div>
      )}
    </motion.div>
  );
}
