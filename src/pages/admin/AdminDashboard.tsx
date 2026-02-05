import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Settings, Image, Music, MessageSquare, LogOut, 
  Cake, ChevronRight, Home
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Admin panels
import GeneralSettings from '@/components/admin/GeneralSettings';
import PhotosManager from '@/components/admin/PhotosManager';
import SongsManager from '@/components/admin/SongsManager';
import MessagesManager from '@/components/admin/MessagesManager';

const tabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'photos', label: 'Photos', icon: Image },
  { id: 'songs', label: 'Songs', icon: Music },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('general');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <Cake className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display gradient-text">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">View Site</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-card p-1 w-full flex flex-wrap justify-start gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg transition-all"
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="general" className="mt-0">
              <GeneralSettings />
            </TabsContent>

            <TabsContent value="photos" className="mt-0">
              <PhotosManager />
            </TabsContent>

            <TabsContent value="songs" className="mt-0">
              <SongsManager />
            </TabsContent>

            <TabsContent value="messages" className="mt-0">
              <MessagesManager />
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>
    </div>
  );
}
