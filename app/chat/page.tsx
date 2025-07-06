// app/page.tsx
'use client';
import { useState } from "react";
import ChatLayout from "../components/layout";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ sender: string; content: string; isTyping?: boolean }[]>([]);
  const [loading, setLoading] = useState(false);

  const typeWriter = (text: string, messageIndex: number) => {
    let i = 0;
    const speed = 30;
    
    const type = () => {
      if (i < text.length) {
        setMessages(prev => 
          prev.map((msg, idx) => 
            idx === messageIndex 
              ? { ...msg, content: text.substring(0, i + 1) }
              : msg
          )
        );
        i++;
        setTimeout(type, speed);
      } else {
        setMessages(prev => 
          prev.map((msg, idx) => 
            idx === messageIndex 
              ? { ...msg, isTyping: false }
              : msg
          )
        );
      }
    };
    type();
  };

  const handleSend = async () => {
    if (!prompt.trim()) return;
    const newMessages = [...messages, { sender: "user", content: prompt }];
    setMessages(newMessages);
    setPrompt("");
    setLoading(true);


    try {
      const token = localStorage.getItem('token');
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json",
                   Authorization: `Bearer ${token}`
         },

        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      const botMessage = { sender: "bot", content: "", isTyping: true };
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
      
      typeWriter(data.response, updatedMessages.length - 1);
    } catch (err) {
      setMessages([...newMessages, { sender: "bot", content: "⚠️ Error getting response." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatLayout>
      <div className="flex flex-col h-full">
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            // Welcome Screen
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-2xl">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-black font-bold text-xl">AI</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">How can I help you today?</h2>
                <p className="text-gray-400 mb-8">Start a conversation with your AI assistant</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setPrompt("Help me write a professional email")}
                    className="p-4 text-left border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-900/50 transition-all"
                  >
                    <div className="font-medium mb-2">✍️ Writing</div>
                    <div className="text-sm text-gray-400">Help me write a professional email</div>
                  </button>
                  
                  <button 
                    onClick={() => setPrompt("Explain React hooks with examples")}
                    className="p-4 text-left border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-900/50 transition-all"
                  >
                    <div className="font-medium mb-2">💻 Code</div>
                    <div className="text-sm text-gray-400">Explain React hooks with examples</div>
                  </button>
                  
                  <button 
                    onClick={() => setPrompt("What are the latest trends in AI?")}
                    className="p-4 text-left border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-900/50 transition-all"
                  >
                    <div className="font-medium mb-2">📈 Analysis</div>
                    <div className="text-sm text-gray-400">What are the latest trends in AI?</div>
                  </button>
                  
                  <button 
                    onClick={() => setPrompt("How does machine learning work?")}
                    className="p-4 text-left border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-900/50 transition-all"
                  >
                    <div className="font-medium mb-2">🧠 Learn</div>
                    <div className="text-sm text-gray-400">How does machine learning work?</div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Messages
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex space-x-3 max-w-[80%] ${msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.sender === "user" 
                        ? "bg-gray-800 text-white" 
                        : "bg-white text-black"
                    }`}>
                      <span className="text-sm font-medium">
                        {msg.sender === "user" ? "U" : "AI"}
                      </span>
                    </div>
                    <div className={`p-4 rounded-lg ${
                      msg.sender === "user" 
                        ? "bg-gray-800 border border-gray-700" 
                        : "bg-gray-50 text-black border border-gray-200"
                    }`}>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                        {msg.isTyping && (
                          <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-black text-sm font-medium">AI</span>
                    </div>
                    <div className="bg-gray-50 text-black border border-gray-200 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-300"
                  style={{
                    boxShadow: prompt.length > 0 ? '0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 0.1)' : 'none'
                  }}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
                  placeholder="Message AI..."
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={loading || !prompt.trim()}
                className="bg-white text-black px-6 py-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-black rounded-full animate-spin"></div>
                    <span>Sending</span>
                  </>
                ) : (
                  <>
                    <span>Send</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ChatLayout>
  );
}