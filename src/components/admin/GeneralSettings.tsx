import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Calendar, User, Type, Palette, FlaskConical, Sparkles, Music, Send, Layers, ImageIcon, Upload, X, Gamepad2, Heart, Monitor, Camera, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useBirthdayData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export default function GeneralSettings() {
  const { data: settings, isLoading } = useSettings();
  const [birthdayName, setBirthdayName] = useState('');
  const [birthdayDate, setBirthdayDate] = useState('');
  const [heroMessage, setHeroMessage] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#FF69B4');
  const [testingMode, setTestingMode] = useState(false);
  const [showScrollAnimations, setShowScrollAnimations] = useState(true);
  const [showAudioVisualizer, setShowAudioVisualizer] = useState(true);
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [backgroundWord, setBackgroundWord] = useState('LOVE');
  const [landingPageWord, setLandingPageWord] = useState('ZUHA');
  const [showFloatingImage, setShowFloatingImage] = useState(true);
  const [floatingImageUrl, setFloatingImageUrl] = useState<string | null>(null);
  const [themeType, setThemeType] = useState<'sisterly' | 'brotherly' | 'brotherly-simple'>('brotherly');
  const [showPhotos, setShowPhotos] = useState(true);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (settings) {
      setBirthdayName(settings.birthday_name);
      setBirthdayDate(settings.birthday_date);
      setHeroMessage(settings.hero_message);
      setPrimaryColor(settings.primary_color);
      setTestingMode(settings.testing_mode);
      setShowScrollAnimations(settings.show_scroll_animations);
      setShowAudioVisualizer(settings.show_audio_visualizer);
      setTelegramBotToken(settings.telegram_bot_token || '');
      setTelegramChatId(settings.telegram_chat_id || '');
      setBackgroundWord((settings as any).background_word || 'LOVE');
      setLandingPageWord((settings as any).landing_page_word || 'ZUHA');
      setShowFloatingImage((settings as any).show_floating_image ?? true);
      setFloatingImageUrl((settings as any).floating_image_url || null);
      setThemeType((settings as any).theme_type || 'brotherly');
      setShowPhotos((settings as any).show_photos ?? true);
      setFaviconUrl((settings as any).favicon_url || null);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!settings?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          birthday_name: birthdayName,
          birthday_date: birthdayDate,
          hero_message: heroMessage,
          primary_color: primaryColor,
          testing_mode: testingMode,
          show_scroll_animations: showScrollAnimations,
          show_audio_visualizer: showAudioVisualizer,
          telegram_bot_token: telegramBotToken || null,
          telegram_chat_id: telegramChatId || null,
          background_word: backgroundWord || 'LOVE',
          landing_page_word: landingPageWord || 'ZUHA',
          show_floating_image: showFloatingImage,
          floating_image_url: floatingImageUrl,
          theme_type: themeType,
          show_photos: showPhotos,
          favicon_url: faviconUrl,
        } as any)
        .eq('id', settings.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['settings'] });
      
      toast({
        title: 'Settings saved!',
        description: 'Your changes have been applied.',
      });
    } catch (err) {
      console.error('Error saving settings:', err);
      toast({
        title: 'Error saving settings',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle floating image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `floating-image-${Date.now()}.${fileExt}`;
      const filePath = `floating/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('birthday-media')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('birthday-media')
        .getPublicUrl(filePath);

      setFloatingImageUrl(urlData.publicUrl);
      toast({
        title: 'Image uploaded!',
        description: 'Remember to save your settings.',
      });
    } catch (err) {
      console.error('Error uploading image:', err);
      toast({
        title: 'Upload failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setFloatingImageUrl(null);
    toast({
      title: 'Image removed',
      description: 'Remember to save your settings to apply.',
    });
  };

  // Handle favicon upload
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (PNG, ICO, or JPG recommended).',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingFavicon(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `favicon-${Date.now()}.${fileExt}`;
      const filePath = `favicon/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('birthday-media')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('birthday-media')
        .getPublicUrl(filePath);

      setFaviconUrl(urlData.publicUrl);
      toast({
        title: 'Favicon uploaded!',
        description: 'Remember to save your settings.',
      });
    } catch (err) {
      console.error('Error uploading favicon:', err);
      toast({
        title: 'Upload failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingFavicon(false);
      if (faviconInputRef.current) faviconInputRef.current.value = '';
    }
  };

  const handleRemoveFavicon = () => {
    setFaviconUrl(null);
    toast({
      title: 'Favicon removed',
      description: 'Remember to save your settings to apply.',
    });
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
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <span className="text-2xl">⚙️</span>
        General Settings
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Birthday Name */}
        <div className="space-y-2">
          <Label htmlFor="birthdayName" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Birthday Person's Name
          </Label>
          <Input
            id="birthdayName"
            value={birthdayName}
            onChange={(e) => setBirthdayName(e.target.value)}
            placeholder="Someone Special"
            className="bg-muted/50"
          />
        </div>

        {/* Birthday Date */}
        <div className="space-y-2">
          <Label htmlFor="birthdayDate" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Birthday Date
          </Label>
          <Input
            id="birthdayDate"
            type="date"
            value={birthdayDate}
            onChange={(e) => setBirthdayDate(e.target.value)}
            className="bg-muted/50"
          />
        </div>

        {/* Primary Color */}
        <div className="space-y-2">
          <Label htmlFor="primaryColor" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Primary Color
          </Label>
          <div className="flex gap-2">
            <Input
              id="primaryColor"
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-16 h-10 p-1 cursor-pointer"
            />
            <Input
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#FF69B4"
              className="bg-muted/50 flex-1"
            />
          </div>
        </div>

        {/* Hero Message */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="heroMessage" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Hero Message
          </Label>
          <Textarea
            id="heroMessage"
            value={heroMessage}
            onChange={(e) => setHeroMessage(e.target.value)}
            placeholder="A magical celebration awaits you ✨"
            rows={3}
            className="bg-muted/50 resize-none"
          />
        </div>

        {/* Background Word */}
        <div className="space-y-2">
          <Label htmlFor="backgroundWord" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Celebration Background Word
          </Label>
          <Input
            id="backgroundWord"
            value={backgroundWord}
            onChange={(e) => setBackgroundWord(e.target.value.toUpperCase())}
            placeholder="LOVE"
            maxLength={10}
            className="bg-muted/50 uppercase"
          />
          <p className="text-xs text-muted-foreground">
            3D text on celebration page (max 10 chars)
          </p>
        </div>

        {/* Landing Page Word */}
        <div className="space-y-2">
          <Label htmlFor="landingPageWord" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Landing Page 3D Text
          </Label>
          <Input
            id="landingPageWord"
            value={landingPageWord}
            onChange={(e) => setLandingPageWord(e.target.value.toUpperCase())}
            placeholder="ZUHA"
            maxLength={10}
            className="bg-muted/50 uppercase"
          />
          <p className="text-xs text-muted-foreground">
            3D text on landing page (max 10 chars)
          </p>
        </div>

        {/* Favicon Upload Section */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Site Favicon
          </h3>
          <p className="text-sm text-muted-foreground">
            Upload a custom favicon (browser tab icon). PNG, ICO, or JPG recommended.
          </p>

          <input
            ref={faviconInputRef}
            type="file"
            accept="image/*"
            onChange={handleFaviconUpload}
            className="hidden"
          />

          <div className="glass-card rounded-xl p-4">
            {faviconUrl ? (
              <div className="flex items-start gap-4">
                <div className="relative group">
                  <img
                    src={faviconUrl}
                    alt="Current favicon"
                    className="w-16 h-16 object-contain rounded-lg bg-muted/50 p-2"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFavicon}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Custom favicon uploaded</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => faviconInputRef.current?.click()}
                    disabled={isUploadingFavicon}
                  >
                    {isUploadingFavicon ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Replace Favicon
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => faviconInputRef.current?.click()}
                disabled={isUploadingFavicon}
                className="w-full"
              >
                {isUploadingFavicon ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Favicon
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Theme Toggle Section */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Theme Style
          </h3>

          <div className="grid gap-3 md:grid-cols-3">
            {/* Sisterly Theme */}
            <button
              type="button"
              onClick={() => setThemeType('sisterly')}
              className={`glass-card rounded-xl p-4 text-left transition-all ${
                themeType === 'sisterly' 
                  ? 'ring-2 ring-pink-400 bg-pink-500/10' 
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-pink-400" />
                <span className="font-semibold">Sisterly</span>
              </div>
              <p className="text-xs text-muted-foreground">
                💖 Warm coral, lavender & sweet magical vibes
              </p>
            </button>

            {/* Brotherly Theme */}
            <button
              type="button"
              onClick={() => setThemeType('brotherly')}
              className={`glass-card rounded-xl p-4 text-left transition-all ${
                themeType === 'brotherly' 
                  ? 'ring-2 ring-green-400 bg-green-500/10' 
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Gamepad2 className="w-5 h-5 text-green-400" />
                <span className="font-semibold">Brotherly</span>
              </div>
              <p className="text-xs text-muted-foreground">
                🎮 Neon green, electric blue & sarcastic gaming
              </p>
            </button>

            {/* Brotherly Simple Theme */}
            <button
              type="button"
              onClick={() => setThemeType('brotherly-simple')}
              className={`glass-card rounded-xl p-4 text-left transition-all ${
                themeType === 'brotherly-simple' 
                  ? 'ring-2 ring-blue-400 bg-blue-500/10' 
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-5 h-5 text-blue-400" />
                <span className="font-semibold">Simple</span>
              </div>
              <p className="text-xs text-muted-foreground">
                🎯 Clean steel blue, amber & minimal design
              </p>
            </button>
          </div>
        </div>

        {/* Visual Effects Section */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Visual Effects
          </h3>

          {/* Scroll Animations Toggle */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="scrollAnimations" className="text-base font-semibold cursor-pointer">
                    Scroll Animations
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Elements fade in from bottom as you scroll
                  </p>
                </div>
              </div>
              <Switch
                id="scrollAnimations"
                checked={showScrollAnimations}
                onCheckedChange={setShowScrollAnimations}
              />
            </div>
          </div>

          {/* Audio Visualizer Toggle */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="audioVisualizer" className="text-base font-semibold cursor-pointer">
                    Audio Visualizer
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show animated bars that react to the music
                  </p>
                </div>
              </div>
              <Switch
                id="audioVisualizer"
                checked={showAudioVisualizer}
                onCheckedChange={setShowAudioVisualizer}
              />
            </div>
          </div>

          {/* Show Photos Toggle */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="showPhotos" className="text-base font-semibold cursor-pointer">
                    Show Photos
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Display the polaroid photo gallery on celebration page
                  </p>
                </div>
              </div>
              <Switch
                id="showPhotos"
                checked={showPhotos}
                onCheckedChange={setShowPhotos}
              />
            </div>
          </div>

          {/* Floating Image Toggle */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <ImageIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="floatingImage" className="text-base font-semibold cursor-pointer">
                    Floating Image
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show decorative floating image on celebration page
                  </p>
                </div>
              </div>
              <Switch
                id="floatingImage"
                checked={showFloatingImage}
                onCheckedChange={setShowFloatingImage}
              />
            </div>
          </div>

          {/* Custom Floating Image Upload */}
          {showFloatingImage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-xl p-4"
            >
              <Label className="flex items-center gap-2 mb-3">
                <Upload className="w-4 h-4" />
                Custom Floating Image
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a custom image or use the default one. Works best with transparent PNG.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {floatingImageUrl ? (
                <div className="flex items-start gap-4">
                  <div className="relative group">
                    <img
                      src={floatingImageUrl}
                      alt="Custom floating image"
                      className="w-24 h-24 object-contain rounded-lg bg-muted/50"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">Custom image uploaded</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                    >
                      {isUploadingImage ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Replace Image
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="w-full"
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Custom Image
                    </>
                  )}
                </Button>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Leave empty to use the default image
              </p>
            </motion.div>
          )}
        </div>

        {/* Telegram Integration */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Telegram Notifications
          </h3>
          <p className="text-sm text-muted-foreground">
            Receive messages from the birthday girl directly on Telegram
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telegramBotToken">Bot Token</Label>
              <Input
                id="telegramBotToken"
                type="password"
                value={telegramBotToken}
                onChange={(e) => setTelegramBotToken(e.target.value)}
                placeholder="123456789:ABCdefGHI..."
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">
                Get this from @BotFather on Telegram
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegramChatId">Chat ID</Label>
              <Input
                id="telegramChatId"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="Your chat ID"
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">
                Get this from @userinfobot on Telegram
              </p>
            </div>
          </div>
        </div>

        {/* Testing Mode Toggle */}
        <div className="md:col-span-2">
          <div className="glass-card rounded-xl p-4 border-2 border-dashed border-birthday-gold/30 bg-birthday-gold/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-birthday-gold/20">
                  <FlaskConical className="w-5 h-5 text-birthday-gold" />
                </div>
                <div>
                  <Label htmlFor="testingMode" className="text-base font-semibold cursor-pointer">
                    Testing Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Bypass birthday date check to test the celebration flow
                  </p>
                </div>
              </div>
              <Switch
                id="testingMode"
                checked={testingMode}
                onCheckedChange={setTestingMode}
                className="data-[state=checked]:bg-birthday-gold"
              />
            </div>
            {testingMode && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 text-xs text-birthday-gold flex items-center gap-1"
              >
                ⚠️ Testing mode is ON — "Begin the Magic" button is unlocked for everyone
              </motion.p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="magic-button"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
