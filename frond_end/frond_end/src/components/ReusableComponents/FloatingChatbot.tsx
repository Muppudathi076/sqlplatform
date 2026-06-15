import { useState } from "react";
import { MessageSquare, X, Send, Sparkles, Loader2 } from "lucide-react";
import axiosInstance from "../../auth/axiosInstance";

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    { role: "ai", content: "Hi! I'm your AI SQL Tutor. Ask me anything about SQL or databases!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("access_token") || "";
      const res = await axiosInstance.post(
        "/ai/chat/",
        { message: userMsg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, { role: "ai", content: res.data.reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Oops, something went wrong. Please try again!" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes typingDot {
            0%, 100% { transform: translateY(0); opacity: 0.4; }
            50% { transform: translateY(-4px); opacity: 1; }
          }
          .typing-dot {
            animation: typingDot 1s infinite;
          }
        `}
      </style>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl shadow-indigo-500/40 transition-transform ${
          isOpen ? "scale-0" : "scale-100 hover:scale-110"
        } z-50`}
      >
        <MessageSquare size={28} />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 w-[350px] h-[500px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right z-50 ${
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-yellow-300" size={20} />
            <h3 className="text-white font-bold">SQL AI Tutor</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none whitespace-pre-line"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '200ms' }}></div>
                <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '400ms' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about SQL..."
            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-indigo-600 text-white rounded-xl disabled:opacity-50 hover:bg-indigo-500 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
