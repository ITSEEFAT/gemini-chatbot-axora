import React, { useState } from 'react';

const App = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const updatedMessages = [...messages, { role: 'user', content: input }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey || apiKey === 'your-api-key-here') {
        throw new Error('Please set up your Gemini API key in the .env file');
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: updatedMessages.map((msg) => ({
              role: msg.role === 'bot' ? 'model' : 'user',
              parts: [{ text: msg.content }],
            })),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to get response from Gemini API');
      }

      const data = await response.json();

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }

      const aiResponse = {
        role: 'bot',
        content: data.candidates[0].content.parts[0].text,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: `Error: ${error.message || 'Unexpected error occurred. Check console.'}`,
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="bg-[#0e0e10] min-h-screen text-white font-sans flex flex-col items-center px-4 py-6">
      <h1 className="text-4xl md:text-5xl font-bold mb-2 text-purple-500">AXORA</h1>
      <p className="text-gray-400 mb-6 text-center">
        Your advanced AI companion powered by Gemini
      </p>

      <div className="w-full max-w-3xl bg-[#1e1e22] rounded-2xl shadow-xl p-6 space-y-4 mb-6">
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                msg.role === 'user' ? 'bg-blue-800 text-right' : 'bg-gray-800 text-left'
              }`}
            >
              <p>
                <strong>{msg.role === 'user' ? 'You' : 'AXORA'}:</strong> {msg.content}
              </p>
            </div>
          ))}
          {loading && <div className="text-purple-400 animate-pulse">AXORA is typing...</div>}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-grow p-3 rounded-lg bg-[#2a2a2e] text-white outline-none"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl font-semibold"
          >
            Send
          </button>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#1e1e22] p-4 rounded-xl shadow-md hover:shadow-lg border border-purple-700">
          <h3 className="text-xl font-bold text-purple-400 mb-2">Examples</h3>
          <p>“What is recursion?”</p>
          <p>“Explain binary search”</p>
          <p>“Write a poem about rain”</p>
        </div>
        <div className="bg-[#1e1e22] p-4 rounded-xl shadow-md hover:shadow-lg border border-purple-700">
          <h3 className="text-xl font-bold text-purple-400 mb-2">Capabilities</h3>
          <p>Answer technical questions</p>
          <p>Generate creative content</p>
          <p>Summarize long texts</p>
        </div>
        <div className="bg-[#1e1e22] p-4 rounded-xl shadow-md hover:shadow-lg border border-purple-700">
          <h3 className="text-xl font-bold text-purple-400 mb-2">Tips</h3>
          <p>Use clear instructions</p>
          <p>Ask follow-up questions</p>
          <p>Refine your queries</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto text-center text-sm text-gray-400">
        <p>
          <span className="text-purple-500 font-bold text-md">Developed by Seefat</span>, student of
          GLBITM 🚀
        </p>
      </footer>
    </div>
  );
};

export default App;
