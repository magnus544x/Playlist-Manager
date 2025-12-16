import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Channel, parseM3U } from '@/lib/m3u';
import { DEFAULT_PLAYLIST } from '@/lib/defaultPlaylist';
import { PLAYLIST_TWO } from '@/lib/playlistTwo';
import { PLAYLIST_ALL } from '@/lib/playlistAll';
import { ChannelList } from '@/components/ChannelList';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Menu, LogOut, Settings, HelpCircle, Monitor, Laptop, ListMusic, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TVApp() {
  const [, setLocation] = useLocation();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Test Playlist State
  const [testPlaylistEnabled, setTestPlaylistEnabled] = useState<boolean>(false);

  useEffect(() => {
    // Check auth
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      setLocation('/');
      return;
    }
    
    // Check if test playlist is enabled
    checkTestPlaylist();
  }, [setLocation]);

  const checkTestPlaylist = async () => {
    try {
      const response = await fetch("/playlists/test.txt");
      if (response.ok) {
        const text = await response.text();
        const firstLine = text.split('\n')[0].trim();
        if (firstLine === '1') {
          setTestPlaylistEnabled(true);
        } else {
          setTestPlaylistEnabled(false);
        }
      }
    } catch (e) {
      console.log("Could not check test playlist");
    }
  };

  // Load Playlist
  const loadPlaylist = async (playlistId: string) => {
    try {
      setLoading(true);
      setActivePlaylistId(playlistId);
      
      let content = '';
      if (playlistId === 'default') {
        content = DEFAULT_PLAYLIST;
      } else if (playlistId === 'two') {
        content = PLAYLIST_TWO;
      } else if (playlistId === 'all') {
        content = PLAYLIST_ALL;
      } else if (playlistId === 'raszei') {
        content = `
#EXTINF:-1 tvg-id="Raszei" tvg-logo="",RASZEI.EU STREAM
https://ok.ru/videoembed/10085678063210
`;
      } else if (playlistId === 'test') {
        const response = await fetch("/playlists/test.txt");
        if (!response.ok) throw new Error("Could not load test.txt");
        const text = await response.text();
        // Remove the first line (status line) before parsing
        const lines = text.split('\n');
        content = lines.slice(1).join('\n');
      }

      const parsed = parseM3U(content);
      setChannels(parsed);
      if (parsed.length > 0) {
        setCurrentChannel(parsed[0]);
        toast({ title: "Playlist Loaded", description: `Loaded ${parsed.length} channels.` });
      } else {
         toast({ title: "Warning", description: "No channels found in playlist.", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to parse playlist.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setLocation('/');
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="font-display tracking-widest animate-pulse">LOADING PLAYLIST...</p>
        </div>
      </div>
    );
  }

  const PlaylistSelector = () => (
    <div className="flex flex-col h-full bg-sidebar/50 backdrop-blur-sm border-r border-white/5 p-4 space-y-4">
      <div className="flex items-center gap-2 text-primary mb-2">
        <ListMusic className="w-5 h-5" />
        <h2 className="font-display font-bold text-lg tracking-wider">PLAYLISTS</h2>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={() => loadPlaylist('default')}
          className="w-full flex items-center gap-3 p-4 rounded-lg text-left bg-white/5 hover:bg-white/10 border border-transparent hover:border-primary/30 transition-all group"
        >
          <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <span className="font-bold">1</span>
          </div>
          <div>
            <h3 className="font-bold text-white group-hover:text-primary transition-colors">POLSKA TV</h3>
            <p className="text-xs text-muted-foreground">Main Channel List</p>
          </div>
        </button>

        <button
          onClick={() => loadPlaylist('two')}
          className="w-full flex items-center gap-3 p-4 rounded-lg text-left bg-white/5 hover:bg-white/10 border border-transparent hover:border-red-500/30 transition-all group"
        >
          <div className="w-10 h-10 rounded bg-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
            <span className="font-bold">2</span>
          </div>
          <div>
            <h3 className="font-bold text-white group-hover:text-red-500 transition-colors">XXX</h3>
            <p className="text-xs text-muted-foreground">Adult Channels</p>
          </div>
        </button>

        <button
          onClick={() => loadPlaylist('raszei')}
          className="w-full flex items-center gap-3 p-4 rounded-lg text-left bg-white/5 hover:bg-white/10 border border-transparent hover:border-yellow-500/30 transition-all group"
        >
          <div className="w-10 h-10 rounded bg-yellow-500/20 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
            <span className="font-bold">3</span>
          </div>
          <div>
            <h3 className="font-bold text-white group-hover:text-yellow-500 transition-colors">RASZEI.EU</h3>
            <p className="text-xs text-muted-foreground">Live Stream</p>
          </div>
        </button>

        <button
          onClick={() => loadPlaylist('all')}
          className="w-full flex items-center gap-3 p-4 rounded-lg text-left bg-white/5 hover:bg-white/10 border border-transparent hover:border-blue-500/30 transition-all group"
        >
          <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
            <span className="font-bold">4</span>
          </div>
          <div>
            <h3 className="font-bold text-white group-hover:text-blue-500 transition-colors">ALL TV</h3>
            <p className="text-xs text-muted-foreground">International Channels</p>
          </div>
        </button>

        {/* 5th Playlist - Test Playlist */}
        {testPlaylistEnabled && (
          <button
            onClick={() => loadPlaylist('test')}
            className="w-full flex items-center gap-3 p-4 rounded-lg text-left bg-white/5 hover:bg-white/10 border border-transparent hover:border-green-500/30 transition-all group"
          >
            <div className="w-10 h-10 rounded bg-green-500/20 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
              <span className="font-bold">5</span>
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-green-500 transition-colors">TEST PLAYLIST</h3>
              <p className="text-xs text-muted-foreground">Custom test.txt</p>
            </div>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-primary">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-sidebar border-r border-white/10 w-80">
              {activePlaylistId ? (
                <ChannelList 
                  channels={channels} 
                  currentChannel={currentChannel} 
                  onSelectChannel={(ch) => setCurrentChannel(ch)}
                  onBack={() => {
                    setActivePlaylistId(null);
                    setCurrentChannel(null); // Stop playback on back
                  }}
                  title={activePlaylistId === 'default' ? "POLSKA TV" : activePlaylistId === 'two' ? "XXX" : activePlaylistId === 'all' ? "ALL TV" : activePlaylistId === 'test' ? "TEST PLAYLIST" : "RASZEI.EU"}
                />
              ) : (
                <PlaylistSelector />
              )}
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-display font-bold text-black text-sm shadow-[0_0_15px_theme('colors.primary')]">
              Z
            </div>
            <h1 className="hidden md:block font-display font-bold text-xl tracking-wider text-white">
              POLSKA <span className="text-primary">TV</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex border-primary/50 text-primary hover:bg-primary/10 hover:text-primary shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                <HelpCircle className="w-4 h-4 mr-2" />
                INSTALLATION
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-white/10 text-foreground">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-primary">System Installation Guide</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="linux" className="mt-4">
                <TabsList className="bg-black/40 border border-white/10">
                  <TabsTrigger value="linux" className="data-[state=active]:bg-primary data-[state=active]:text-black font-bold">
                    <Monitor className="w-4 h-4 mr-2" />
                    Linux (Zorin OS)
                  </TabsTrigger>
                  <TabsTrigger value="windows" className="data-[state=active]:bg-primary data-[state=active]:text-black font-bold">
                    <Laptop className="w-4 h-4 mr-2" />
                    Windows 11
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="linux" className="space-y-4 pt-4">
                  <div className="p-4 rounded-lg bg-black/40 border border-white/10 font-mono text-sm space-y-2">
                    <h3 className="font-bold text-primary mb-2">Option 1: Web App (Recommended)</h3>
                    <p>1. Open this URL in Chromium or Firefox.</p>
                    <p>2. Click the browser menu (⋮) {'>'} "Install Zorin TV" or "Create Shortcut".</p>
                    <p>3. It will appear in your Zorin Start Menu like a native app.</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-black/40 border border-white/10 font-mono text-sm space-y-2">
                    <h3 className="font-bold text-primary mb-2">Option 2: Native App (Electron)</h3>
                    <p className="text-muted-foreground">// Create a standalone Linux app using Nativefier</p>
                    <div className="bg-black p-3 rounded border border-white/5 select-all">
                      sudo apt install npm<br/>
                      sudo npm install -g nativefier<br/>
                      nativefier "https://your-app-url.com" --name "Zorin TV" --platform linux --arch x64
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="windows" className="space-y-4 pt-4">
                  <div className="p-4 rounded-lg bg-black/40 border border-white/10 font-mono text-sm space-y-2">
                    <h3 className="font-bold text-primary mb-2">Option 1: PWA Installation</h3>
                    <p>1. Open Edge or Chrome.</p>
                    <p>2. Click the "App Available" icon in the address bar.</p>
                    <p>3. Click "Install". It will integrate with Windows 11 Start Menu.</p>
                  </div>
                   <div className="p-4 rounded-lg bg-black/40 border border-white/10 font-mono text-sm space-y-2">
                    <h3 className="font-bold text-primary mb-2">Option 2: Create .EXE</h3>
                    <p className="text-muted-foreground">// Run this in terminal to generate an .exe</p>
                    <div className="bg-black p-3 rounded border border-white/5 select-all">
                      npm install -g nativefier<br/>
                      nativefier "https://your-app-url.com" --name "Zorin TV" --platform windows
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:block w-80 shrink-0 h-full">
          {activePlaylistId ? (
            <ChannelList 
              channels={channels} 
              currentChannel={currentChannel} 
              onSelectChannel={(ch) => setCurrentChannel(ch)}
              onBack={() => {
                setActivePlaylistId(null);
                setCurrentChannel(null); // Stop playback on back
              }}
              title={activePlaylistId === 'default' ? "DEFAULT LIST" : activePlaylistId === 'two' ? "PLAYLIST TWO" : activePlaylistId === 'test' ? "TEST PLAYLIST" : "CHANNELS"}
            />
          ) : (
            <PlaylistSelector />
          )}
        </aside>

        {/* Player Area */}
        <main className="flex-1 bg-black relative flex flex-col">
          <div className="flex-1 flex bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 to-black">
            {currentChannel ? (
              <div className="w-full h-full relative">
                 <VideoPlayer 
                    url={currentChannel.url} 
                    autoPlay={true} 
                    muted={activePlaylistId === 'two'} 
                 />
                 
                 <div className="absolute top-4 left-4 z-10 flex items-start justify-between bg-black/50 p-4 rounded-lg backdrop-blur-md opacity-0 hover:opacity-100 transition-opacity duration-300 w-[calc(100%-2rem)]">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-white mb-1">{currentChannel.name}</h2>
                      <div className="flex items-center gap-2">
                         <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-bold border border-primary/20">LIVE</span>
                         <span className="text-muted-foreground text-sm font-ui">{currentChannel.group}</span>
                      </div>
                    </div>
                    {currentChannel.logo && (
                      <img src={currentChannel.logo} alt="Logo" className="h-12 w-auto object-contain opacity-80" />
                    )}
                 </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-center text-muted-foreground">
                <div>
                    <Settings className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>Select a channel to start watching</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
