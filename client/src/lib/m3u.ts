export interface Channel {
  id: string;
  name: string;
  logo?: string;
  group?: string;
  url: string;
  tvgId?: string;
}

export function parseM3U(content: string): Channel[] {
  const lines = content.split('\n');
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      // Parse Metadata
      const info = line.substring(8);
      const params = info.match(/([a-zA-Z0-9-]+)="([^"]*)"/g) || [];
      
      currentChannel = {};
      
      params.forEach(param => {
        const [key, value] = param.split('=');
        const cleanValue = value.replace(/"/g, '');
        if (key === 'tvg-id') currentChannel.tvgId = cleanValue;
        if (key === 'tvg-logo') currentChannel.logo = cleanValue;
        if (key === 'group-title') currentChannel.group = cleanValue;
      });

      // Get name (last part after comma)
      const nameMatch = info.match(/,([^,]*)$/);
      if (nameMatch) {
        currentChannel.name = nameMatch[1].trim();
      } else {
        currentChannel.name = 'Unknown Channel';
      }
    } else if (!line.startsWith('#')) {
      // It's a URL
      if (currentChannel.name) {
        channels.push({
          id: crypto.randomUUID(),
          name: currentChannel.name || 'Unknown',
          logo: currentChannel.logo,
          group: currentChannel.group || 'General',
          url: line,
          tvgId: currentChannel.tvgId
        } as Channel);
        currentChannel = {}; // Reset
      }
    }
  }

  return channels;
}

// Fallback data in case the URL is blocked by CORS or is empty
export const SAMPLE_PLAYLIST = `#EXTM3U
#EXTINF:-1 tvg-id="NASA" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg" group-title="Science",NASA TV Public
https://ntv1.akamaized.net/hls/live/2013530/NASA-NTV1-HLS/master.m3u8
#EXTINF:-1 tvg-id="News" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Al_Jazeera_English_Logo.svg/1200px-Al_Jazeera_English_Logo.svg.png" group-title="News",Al Jazeera English
https://live-hls-web-aje.getaj.net/AJE/03.m3u8
#EXTINF:-1 tvg-id="Tech" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_Buck_Bunny_logo.svg/1200px-Big_Buck_Bunny_logo.svg.png" group-title="Movies",Big Buck Bunny
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
#EXTINF:-1 tvg-id="Sintel" tvg-logo="" group-title="Movies",Sintel
https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8
`;
