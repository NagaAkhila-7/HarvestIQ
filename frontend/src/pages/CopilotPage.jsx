import React, { useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { aiApi } from '../api/aiApi';
import { Cpu, Send, Sparkles, User, Bot, RefreshCw } from 'lucide-react';

export const CopilotPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am **HarvestIQ AI Copilot** powered by Google Gemini API. I have full context on your FPO inventory balances, active field acreage, demand forecasts, and open procurement purchase orders. How can I assist your operations today?'
    }
  ]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMessage = { sender: 'user', text: prompt };
    setMessages(prev => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt('');
    setLoading(true);

    try {
      const res = await aiApi.askCopilot(currentPrompt);
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: res.response, metadata: { model: res.model, time: res.executionTimeMs } }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Sorry, an error occurred while connecting to the AI Copilot engine.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const setPresetPrompt = (text) => {
    setPrompt(text);
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col space-y-4">
      <PageHeader
        title="HarvestIQ AI Copilot"
        description="Conversational intelligence powered by Google Gemini API with direct MongoDB operational context."
      />

      {/* Preset Query Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setPresetPrompt('Analyze active stockout risks and recommend purchase actions')}
          className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-200 transition-colors"
        >
          🔍 Stockout Risk Analysis
        </button>
        <button
          onClick={() => setPresetPrompt('What seed and fertilizer quantities are needed based on member field acreage?')}
          className="px-3 py-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 text-xs font-semibold hover:bg-cyan-200 transition-colors"
        >
          🌾 Acreage Demand Projection
        </button>
        <button
          onClick={() => setPresetPrompt('Summarize open Purchase Orders and vendor lead times')}
          className="px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-xs font-semibold hover:bg-purple-200 transition-colors"
        >
          🚚 Vendor Lead-Time Audit
        </button>
      </div>

      {/* Chat Window */}
      <div className="flex-1 glass-card p-4 overflow-y-auto space-y-4 flex flex-col">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`p-2 rounded-xl text-white font-bold shrink-0 ${
                msg.sender === 'user' ? 'bg-slate-700' : 'bg-emerald-600'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              {msg.metadata && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 flex items-center gap-3">
                  <span>Model: {msg.metadata.model}</span>
                  <span>Latency: {msg.metadata.time}ms</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold p-2">
            <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
            <span>Gemini AI is analyzing operational telemetry...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          placeholder="Ask AI Copilot about inventory, suppliers, forecasts..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 px-4 py-3 text-xs rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        />
        <Button type="submit" variant="primary" isLoading={loading} className="px-5">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
