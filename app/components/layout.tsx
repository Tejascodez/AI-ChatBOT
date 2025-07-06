'use client';
import { useEffect, useState } from "react";

interface ChatLayoutProps {
  children: React.ReactNode;
}

type Conversation = {
  id: string;
  title: string;
  messages: { content: string }[];
  createdAt: string;
  active?: boolean;
  timestamp: string;
};

export default function ChatLayout({ children }: ChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get token from localStorage or other secure storage
        const token = localStorage.getItem('token') || '';
        
        const res = await fetch("/api/chat/list", {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        const chats = data.chats || [];
        
        // Format conversations with proper typing and recent timestamp logic
        const formattedChats = chats.map((chat: any) => ({
          ...chat,
          id: String(chat.id),
          timestamp: formatTimestamp(chat.createdAt),
          active: false,
        }));

        setConversations(formattedChats);
      } catch (err) {
        console.error('Failed to fetch chats:', err);
        setError('Failed to load conversations');
        // Set some mock data for development
        setConversations([
          {
            id: '1',
            title: 'Previous Chat 1',
            messages: [{ content: 'Hello' }],
            createdAt: new Date().toISOString(),
            timestamp: 'Today',
            active: false,
          },
          {
            id: '2',
            title: 'Previous Chat 2',
            messages: [{ content: 'Hi there' }],
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            timestamp: 'Yesterday',
            active: false,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const selectConversation = (id: string) => {
    setConversations(prev => 
      prev.map(conv => ({ ...conv, active: conv.id === id }))
    );
  };

  const startNewChat = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: "New conversation",
      messages: [],
      createdAt: new Date().toISOString(),
      active: true,
      timestamp: "now"
    };
    setConversations(prev => [newConv, ...prev.map(conv => ({ ...conv, active: false }))]);
  };

  const deleteConversation = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setConversations(prev => prev.filter(conv => conv.id !== id));
  };

  // Group conversations by time period
  const groupedConversations = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const weekAgo = new Date(today.getTime() - 7 * 86400000);

    const groups = {
      today: [] as Conversation[],
      yesterday: [] as Conversation[],
      thisWeek: [] as Conversation[],
      older: [] as Conversation[],
    };

    conversations.forEach(conv => {
      const convDate = new Date(conv.createdAt);
      if (convDate >= today) {
        groups.today.push(conv);
      } else if (convDate >= yesterday) {
        groups.yesterday.push(conv);
      } else if (convDate >= weekAgo) {
        groups.thisWeek.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  };

  const ConversationGroup = ({ title, conversations }: { title: string; conversations: Conversation[] }) => {
    if (conversations.length === 0) return null;

    return (
      <div className="mb-4">
        <h3 className="text-xs font-medium text-gray-400 px-3 mb-2 uppercase tracking-wider">
          {title}
        </h3>
        <div className="space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={`group relative flex items-center space-x-3 px-3 py-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                conv.active 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {conv.title}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {conv.timestamp}
                </div>
              </div>
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const groups = groupedConversations();

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-gray-900 border-r border-gray-800 flex flex-col overflow-hidden`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium">New Chat</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
            </div>
          )}
          
          {error && (
            <div className="px-3 py-2 text-sm text-red-400 bg-red-900/20 rounded-lg mb-4">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <ConversationGroup title="Today" conversations={groups.today} />
              <ConversationGroup title="Yesterday" conversations={groups.yesterday} />
              <ConversationGroup title="This Week" conversations={groups.thisWeek} />
              <ConversationGroup title="Older" conversations={groups.older} />
            </>
          )}

          {!loading && !error && conversations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat to begin</p>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-black text-sm font-medium">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">User</div>
              <div className="text-xs text-gray-500">Free Plan</div>
            </div>
            <div className="flex-shrink-0">
              <button className="p-1 hover:bg-gray-700 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-black border-b border-gray-800 flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold">Chat with Ollama</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}