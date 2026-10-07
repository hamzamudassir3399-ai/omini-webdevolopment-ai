/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Cpu, Code2, Sparkles, Terminal, Layers, Activity, Search, 
  Copy, Check, Play, RefreshCw, Zap, ShieldCheck, 
  ExternalLink, ChevronRight, BookOpen, Globe, Wrench, Database, ArrowRightLeft, Download, TrendingUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: string;
  contextWindow: string;
  speed: string;
  codeBenchmark: string;
  description: string;
  tier: string;
  featured: boolean;
  supportsThinking: boolean;
  category: string;
  status: 'online' | 'high_load';
  latency: string;
  uptime: string;
}

interface GeneratedCode {
  title: string;
  explanation: string;
  code: string;
  instructions: string;
}

interface DebugResult {
  analysis: string;
  fixedCode: string;
  changesMade: string[];
}

interface ArchitectureResult {
  projectName: string;
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    aiModels: string[];
  };
  databaseSchema: { tableName: string; columns: string[] }[];
  apiEndpoints: { path: string; method: string; description: string }[];
  stepByStepGuide: string[];
}

interface SearchGroundingResult {
  answer: string;
  sources: any[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'hub' | 'search' | 'generator' | 'debugger' | 'architecture' | 'benchmarks'>('hub');
  const [models, setModels] = useState<AIModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [modelFilter, setModelFilter] = useState<'all' | 'chinese' | 'global'>('all');

  // Comparison state for Benchmarks tab
  const [compareModel1Id, setCompareModel1Id] = useState<string>('gemini-3.1-pro-preview');
  const [compareModel2Id, setCompareModel2Id] = useState<string>('deepseek-r1');

  // Search Grounding state
  const [searchQuery, setSearchQuery] = useState('Compare DeepSeek-R1, Qwen 2.5 Max, and Gemini 3.1 Pro for web development performance in 2026');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchGroundingResult | null>(null);

  // Code Generator state
  const [prompt, setPrompt] = useState('Create a responsive SaaS dashboard with analytics charts and user management using React and Tailwind CSS.');
  const [selectedModel, setSelectedModel] = useState('gemini-3.1-pro-preview');
  const [enableThinking, setEnableThinking] = useState(true);
  const [language, setLanguage] = useState('react');
  const [generating, setGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedCode | null>(null);
  const [copied, setCopied] = useState(false);

  // Debugger state
  const [debugCode, setDebugCode] = useState('// Paste buggy code here\nfunction calculateTotal(items) {\n  return items.reduce((sum, item) => sum + item.price, 0);\n}');
  const [errorMessage, setErrorMessage] = useState('TypeError: Cannot read properties of undefined (reading \'price\')');
  const [debugging, setDebugging] = useState(false);
  const [debugResult, setDebugResult] = useState<DebugResult | null>(null);

  // Architecture state
  const [appIdea, setAppIdea] = useState('Real-time collaborative code editor with AI pair programmer and voice chat.');
  const [planning, setPlanning] = useState(false);
  const [architectureResult, setArchitectureResult] = useState<ArchitectureResult | null>(null);

  // Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/models')
      .then(res => res.json())
      .then(data => {
        setModels(data);
        setLoadingModels(false);
        if (data.length >= 2) {
          setCompareModel1Id(data[0].id);
          setCompareModel2Id(data[2]?.id || data[1].id);
        }
      })
      .catch(err => {
        console.error('Failed to load models:', err);
        setLoadingModels(false);
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadCSV = () => {
    if (!model1 || !model2) return;
    const csvRows = [
      ['Metric / Spec', model1.name, model2.name],
      ['Provider', model1.provider, model2.provider],
      ['Category', model1.category, model2.category],
      ['Access Tier', model1.tier, model2.tier],
      ['Context Window', model1.contextWindow, model2.contextWindow],
      ['HumanEval Coding Score', model1.codeBenchmark, model2.codeBenchmark],
      ['Speed / Throughput', model1.speed, model2.speed],
      ['Status', model1.status, model2.status],
      ['Latency', model1.latency, model2.latency],
      ['Uptime', model1.uptime, model2.uptime],
      ['Description', `"${model1.description}"`, `"${model2.description}"`]
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ai_model_comparison_${model1.id}_vs_${model2.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Comparison report downloaded as CSV!');
  };

  const handleSearchGrounding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await fetch('/api/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await res.json();
      if (res.ok) {
        setSearchResult(data);
        showToast('Search grounding results retrieved via Gemini 3.8 Flash!');
      } else {
        showToast(data.error || 'Search failed');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error');
    } finally {
      setSearching(false);
    }
  };

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setGenerating(true);
    try {
      const res = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model: selectedModel, enableThinking, language })
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedResult(data);
        showToast('Code generated successfully with AI!');
      } else {
        showToast(data.error || 'Generation failed');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error');
    } finally {
      setGenerating(false);
    }
  };

  const handleDebugCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setDebugging(true);
    try {
      const res = await fetch('/api/debug-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: debugCode, errorMessage })
      });
      const data = await res.json();
      if (res.ok) {
        setDebugResult(data);
        showToast('Code debugged & refactored successfully!');
      } else {
        showToast(data.error || 'Debugging failed');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error');
    } finally {
      setDebugging(false);
    }
  };

  const handleArchitecturePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanning(true);
    try {
      const res = await fetch('/api/architecture-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appDescription: appIdea })
      });
      const data = await res.json();
      if (res.ok) {
        setArchitectureResult(data);
        showToast('Architecture & schema generated!');
      } else {
        showToast(data.error || 'Planning failed');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error');
    } finally {
      setPlanning(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredModels = models.filter(m => {
    if (modelFilter === 'chinese') return m.category === 'chinese';
    if (modelFilter === 'global') return m.category === 'global';
    return true;
  });

  const model1 = models.find(m => m.id === compareModel1Id) || models[0];
  const model2 = models.find(m => m.id === compareModel2Id) || models[1];

  // Chart data for latency vs model
  const chartData = models.map(m => ({
    name: m.name.split(' ')[0],
    fullName: m.name,
    latencyMs: parseInt(m.latency.replace('ms', '')) || 20,
    evalScore: parseFloat(m.codeBenchmark) || 90
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-indigo-400/30 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Sparkles className="w-5 h-5 text-indigo-200 animate-spin" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-display font-bold tracking-tight text-white">OmniWebDev AI</span>
            <span className="block text-[10px] text-indigo-400 font-mono uppercase tracking-widest">Global & Chinese AI Models Hub</span>
          </div>
        </a>

        <nav className="hidden xl:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800 text-sm font-medium">
          <button 
            onClick={() => setActiveTab('hub')}
            className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${activeTab === 'hub' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Models Directory
          </button>
          <button 
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${activeTab === 'search' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Search Grounding
          </button>
          <button 
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${activeTab === 'generator' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            AI Code Studio
          </button>
          <button 
            onClick={() => setActiveTab('debugger')}
            className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${activeTab === 'debugger' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            AI Code Debugger
          </button>
          <button 
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${activeTab === 'architecture' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Architecture Planner
          </button>
          <button 
            onClick={() => setActiveTab('benchmarks')}
            className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${activeTab === 'benchmarks' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Benchmarks & Compare
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('benchmarks')}
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/25 transition-all whitespace-nowrap flex items-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4 text-indigo-200" />
            <span>Split-Screen Compare</span>
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        
        {/* TAB 1: MODELS DIRECTORY */}
        {activeTab === 'hub' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-950/50 via-slate-900/70 to-slate-900 border border-indigo-500/20 p-8 md:p-12 shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="max-w-3xl space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Real-Time Availability & Live Status Monitoring</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-white leading-tight">
                  Global Free AI & Chinese Model Ecosystem
                </h1>
                <p className="text-slate-300 text-base md:text-lg leading-relaxed">
                  Monitor live operational status, latency, and uptime across frontier global and Chinese AI models in real time.
                </p>
                <div className="pt-2 flex flex-wrap gap-4">
                  <button 
                    onClick={() => setActiveTab('benchmarks')}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Split-Screen Model Comparison</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Tabs & Model Registry */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">AI Model Registry & Live Status</h2>
                  <p className="text-sm text-slate-400">Green indicator = Online & operational. Amber indicator = High load / optimizing.</p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                  <button 
                    onClick={() => setModelFilter('all')}
                    className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${modelFilter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    All Models ({models.length})
                  </button>
                  <button 
                    onClick={() => setModelFilter('chinese')}
                    className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${modelFilter === 'chinese' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    Chinese Models
                  </button>
                  <button 
                    onClick={() => setModelFilter('global')}
                    className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${modelFilter === 'global' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    Global Models
                  </button>
                </div>
              </div>

              {loadingModels ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-64 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse flex flex-col p-6 justify-between">
                      <div className="space-y-3">
                        <div className="w-1/2 h-6 bg-slate-800 rounded" />
                        <div className="w-full h-4 bg-slate-800 rounded" />
                        <div className="w-3/4 h-4 bg-slate-800 rounded" />
                      </div>
                      <div className="w-full h-10 bg-slate-800 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredModels.map(model => (
                    <div 
                      key={model.id}
                      className="group relative bg-slate-900/80 backdrop-blur-sm border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between"
                    >
                      {/* Real-time availability indicator badge */}
                      <div className="absolute -top-3 left-6 flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 text-[10px] font-mono rounded-full shadow-md">
                        {model.status === 'online' ? (
                          <>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-emerald-300 font-semibold">Online ({model.latency})</span>
                          </>
                        ) : (
                          <>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <span className="text-amber-300 font-semibold">High Load ({model.latency})</span>
                          </>
                        )}
                      </div>

                      <div className="space-y-4 pt-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="text-xs font-mono text-indigo-400">{model.provider}</span>
                            <h3 className="text-lg font-display font-bold text-white group-hover:text-indigo-300 transition-colors">
                              {model.name}
                            </h3>
                          </div>
                          <div className="px-2.5 py-1 bg-slate-800 rounded-lg text-xs font-mono text-slate-300">
                            {model.tier}
                          </div>
                        </div>

                        <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                          {model.description}
                        </p>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                          <div className="text-slate-400">Context: <span className="text-slate-200 block font-sans">{model.contextWindow}</span></div>
                          <div className="text-slate-400">Uptime: <span className="text-emerald-400 font-semibold block font-sans">{model.uptime}</span></div>
                          <div className="text-slate-400 text-right">HumanEval: <span className="text-indigo-300 font-semibold block font-sans">{model.codeBenchmark}</span></div>
                        </div>
                      </div>

                      <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs text-slate-500">{model.category === 'chinese' ? '🇨🇳 Chinese AI' : '🌐 Global AI'}</span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setCompareModel1Id(model.id);
                              setActiveTab('benchmarks');
                            }}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
                            title="Compare side by side"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedModel(model.id);
                              setEnableThinking(model.supportsThinking);
                              setActiveTab('generator');
                            }}
                            className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold rounded-xl border border-indigo-500/30 transition-all flex items-center gap-1.5"
                          >
                            <span>Use in Studio</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SEARCH GROUNDING ASSISTANT */}
        {activeTab === 'search' && (
          <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Google Search Grounding (Gemini 3.8 Flash)</span>
                </div>
                <h2 className="text-2xl font-display font-bold text-white">Real-Time AI Web Tech Search</h2>
                <p className="text-sm text-slate-400">Query the live web for the latest benchmarks, documentation updates, and technical comparisons across global and Chinese AI models.</p>
              </div>

              <form onSubmit={handleSearchGrounding} className="space-y-4">
                <div className="flex gap-3">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ask about AI models, DeepSeek updates, Qwen benchmarks..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-5 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    type="submit"
                    disabled={searching}
                    className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                  >
                    {searching ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    <span>Search Web</span>
                  </button>
                </div>
              </form>
            </div>

            {searchResult && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span>Search Grounding Findings</span>
                </h3>
                <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950 p-6 rounded-2xl border border-slate-800">
                  {searchResult.answer}
                </div>

                {searchResult.sources && searchResult.sources.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">Grounded Sources</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {searchResult.sources.map((src, idx) => {
                        const webChunk = src.web;
                        if (!webChunk) return null;
                        return (
                          <a 
                            key={idx}
                            href={webChunk.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-xs text-slate-300 flex items-center justify-between transition-colors group"
                          >
                            <span className="truncate pr-2 group-hover:text-indigo-300">{webChunk.title || webChunk.uri}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AI CODE STUDIO */}
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                <div>
                  <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <span>AI Code Generator Studio</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Prompt any web application or component to generate production code instantly.</p>
                </div>

                <form onSubmit={handleGenerateCode} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Select AI Model</label>
                    <select 
                      value={selectedModel}
                      onChange={(e) => {
                        setSelectedModel(e.target.value);
                        if (e.target.value === 'gemini-3.1-pro-preview') setEnableThinking(true);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      {models.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
                      ))}
                    </select>
                  </div>

                  {selectedModel === 'gemini-3.1-pro-preview' && (
                    <div className="flex items-center justify-between p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl">
                      <div className="space-y-0.5">
                        <span className="text-sm font-semibold text-indigo-200">High Thinking Mode</span>
                        <p className="text-xs text-slate-400">Enables deep reasoning for complex architecture & logic.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={enableThinking} 
                        onChange={(e) => setEnableThinking(e.target.checked)}
                        className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Language / Framework</label>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="react">React / TSX (Tailwind)</option>
                      <option value="html">HTML / Tailwind / JS</option>
                      <option value="node">Node.js / Express API</option>
                      <option value="fullstack">Full-Stack Architecture</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Describe Application or Feature</label>
                    <textarea 
                      rows={5}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe what you want to build in detail..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={generating}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Generating Code with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Generate Code Now</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col space-y-6">
              {generatedResult ? (
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-display font-bold text-white">{generatedResult.title}</h3>
                      <p className="text-xs text-slate-400">{generatedResult.explanation}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => copyToClipboard(generatedResult.code)}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? 'Copied' : 'Copy Code'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative flex-1 bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto max-h-[500px]">
                    <pre className="text-indigo-200">{generatedResult.code}</pre>
                  </div>

                  {generatedResult.instructions && (
                    <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-xl">
                      <span className="text-xs font-semibold text-indigo-300 block mb-1">Integration Instructions:</span>
                      <p className="text-xs text-slate-300">{generatedResult.instructions}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-12 text-center flex flex-col items-center justify-center flex-1 space-y-4 min-h-[450px]">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Code2 className="w-8 h-8" />
                  </div>
                  <div className="max-w-md space-y-2">
                    <h3 className="text-lg font-display font-bold text-white">Your generated code will appear here</h3>
                    <p className="text-xs text-slate-400">Select your preferred free AI model, describe your web app or component, and click generate.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: AI CODE DEBUGGER */}
        {activeTab === 'debugger' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div>
                  <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-indigo-400" />
                    <span>AI Code Debugger & Refactor</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Paste your problematic code or stack trace to get instant AI fixes powered by Gemini 3.1 Pro.</p>
                </div>

                <form onSubmit={handleDebugCode} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Buggy Code Snippet</label>
                    <textarea 
                      rows={6}
                      value={debugCode}
                      onChange={(e) => setDebugCode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-indigo-200 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Error Message / Symptoms</label>
                    <input 
                      type="text"
                      value={errorMessage}
                      onChange={(e) => setErrorMessage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={debugging}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {debugging ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    <span>{debugging ? 'Analyzing & Fixing...' : 'Debug & Fix Code'}</span>
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              {debugResult ? (
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="text-lg font-display font-bold text-white">Debugging Analysis & Fix</h3>
                  <p className="text-xs text-slate-300">{debugResult.analysis}</p>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-indigo-400">Changes Made:</span>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                      {debugResult.changesMade?.map((change, idx) => (
                        <li key={idx}>{change}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-400">Corrected Code:</span>
                      <button 
                        onClick={() => copyToClipboard(debugResult.fixedCode)}
                        className="px-3 py-1 bg-slate-800 text-slate-200 text-xs rounded-lg hover:bg-slate-700"
                      >
                        Copy Fixed Code
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-200 overflow-x-auto max-h-[350px]">
                      {debugResult.fixedCode}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-12 text-center flex flex-col items-center justify-center h-full space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="max-w-sm space-y-2">
                    <h3 className="text-lg font-display font-bold text-white">Ready for Bug Inspection</h3>
                    <p className="text-xs text-slate-400">Submit your code snippet to receive automated refactoring and fixes.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: ARCHITECTURE PLANNER */}
        {activeTab === 'architecture' && (
          <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h2 className="text-2xl font-display font-bold text-white flex items-center justify-center gap-2">
                  <Layers className="w-6 h-6 text-indigo-400" />
                  <span>AI Architecture & Schema Planner</span>
                </h2>
                <p className="text-sm text-slate-400">Generate full-stack system architecture, database schema, and API routes for any app idea.</p>
              </div>

              <form onSubmit={handleArchitecturePlan} className="space-y-4">
                <div className="flex gap-3">
                  <input 
                    type="text"
                    value={appIdea}
                    onChange={(e) => setAppIdea(e.target.value)}
                    placeholder="e.g. AI-powered healthcare telemedicine app with patient records"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-5 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    type="submit"
                    disabled={planning}
                    className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                  >
                    {planning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    <span>Generate Plan</span>
                  </button>
                </div>
              </form>
            </div>

            {architectureResult && (
              <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h3 className="text-xl font-display font-bold text-white">{architectureResult.projectName}</h3>
                    <span className="px-3 py-1 bg-indigo-600/20 text-indigo-300 text-xs font-mono rounded-full border border-indigo-500/30">Architecture Blueprint</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <span className="text-xs font-semibold text-indigo-400 uppercase">Frontend</span>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {architectureResult.techStack?.frontend?.map((tech, i) => <li key={i}>• {tech}</li>)}
                      </ul>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <span className="text-xs font-semibold text-purple-400 uppercase">Backend</span>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {architectureResult.techStack?.backend?.map((tech, i) => <li key={i}>• {tech}</li>)}
                      </ul>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <span className="text-xs font-semibold text-emerald-400 uppercase">Database</span>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {architectureResult.techStack?.database?.map((tech, i) => <li key={i}>• {tech}</li>)}
                      </ul>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <span className="text-xs font-semibold text-pink-400 uppercase">AI Models</span>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {architectureResult.techStack?.aiModels?.map((tech, i) => <li key={i}>• {tech}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Database Schema</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {architectureResult.databaseSchema?.map((table, idx) => (
                        <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                          <span className="text-xs font-mono font-bold text-indigo-300">{table.tableName}</span>
                          <ul className="text-xs font-mono text-slate-400 space-y-1">
                            {table.columns?.map((col, cIdx) => <li key={cIdx}>- {col}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Step-by-Step Implementation Guide</h4>
                    <div className="space-y-2">
                      {architectureResult.stepByStepGuide?.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                          <span className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-mono font-bold shrink-0">{idx + 1}</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: BENCHMARKS & SPLIT-SCREEN COMPARE */}
        {activeTab === 'benchmarks' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Split-Screen Side-by-Side Model Comparison Section */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                    <ArrowRightLeft className="w-6 h-6 text-indigo-400" />
                    <span>Split-Screen Side-by-Side Model Comparison</span>
                  </h2>
                  <p className="text-sm text-slate-400">Select any two models to contrast specs, benchmarks, context windows, and performance metrics.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleDownloadCSV}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Report (CSV)</span>
                  </button>
                  <button 
                    onClick={() => {
                      const temp = compareModel1Id;
                      setCompareModel1Id(compareModel2Id);
                      setCompareModel2Id(temp);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Swap Models</span>
                  </button>
                </div>
              </div>

              {/* Model Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Model A</label>
                  <select 
                    value={compareModel1Id}
                    onChange={(e) => setCompareModel1Id(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                  >
                    {models.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Model B</label>
                  <select 
                    value={compareModel2Id}
                    onChange={(e) => setCompareModel2Id(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                  >
                    {models.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Side-by-Side Comparison Table */}
              {model1 && model2 && (
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-mono text-slate-400 uppercase tracking-wider bg-slate-900/60">
                        <th className="py-4 px-6 w-1/3">Metric / Spec</th>
                        <th className="py-4 px-6 w-1/3 text-indigo-300 font-bold">{model1.name}</th>
                        <th className="py-4 px-6 w-1/3 text-purple-300 font-bold">{model2.name}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-xs font-mono">
                      <tr>
                        <td className="py-4 px-6 text-slate-400 font-semibold">Provider / Origin</td>
                        <td className="py-4 px-6 text-slate-200">{model1.provider}</td>
                        <td className="py-4 px-6 text-slate-200">{model2.provider}</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-slate-400 font-semibold">Category</td>
                        <td className="py-4 px-6 uppercase text-indigo-300">{model1.category}</td>
                        <td className="py-4 px-6 uppercase text-purple-300">{model2.category}</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-slate-400 font-semibold">Access Tier</td>
                        <td className="py-4 px-6 text-slate-200">{model1.tier}</td>
                        <td className="py-4 px-6 text-slate-200">{model2.tier}</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-slate-400 font-semibold">Context Window</td>
                        <td className="py-4 px-6 font-bold text-white">{model1.contextWindow}</td>
                        <td className="py-4 px-6 font-bold text-white">{model2.contextWindow}</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-slate-400 font-semibold">HumanEval Coding Score</td>
                        <td className="py-4 px-6 font-bold text-emerald-400 text-sm">{model1.codeBenchmark}</td>
                        <td className="py-4 px-6 font-bold text-emerald-400 text-sm">{model2.codeBenchmark}</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-slate-400 font-semibold">Throughput & Speed</td>
                        <td className="py-4 px-6 text-slate-200">{model1.speed}</td>
                        <td className="py-4 px-6 text-slate-200">{model2.speed}</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-slate-400 font-semibold">Live Operational Status</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${model1.status === 'online' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-amber-950 text-amber-300 border border-amber-500/30'}`}>
                            {model1.status} ({model1.latency})
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${model2.status === 'online' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-amber-950 text-amber-300 border border-amber-500/30'}`}>
                            {model2.status} ({model2.latency})
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-slate-400 font-semibold">Uptime Guarantee</td>
                        <td className="py-4 px-6 text-slate-200">{model1.uptime}</td>
                        <td className="py-4 px-6 text-slate-200">{model2.uptime}</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-slate-400 font-semibold">Description & Specialization</td>
                        <td className="py-4 px-6 text-slate-400 font-sans leading-relaxed">{model1.description}</td>
                        <td className="py-4 px-6 text-slate-400 font-sans leading-relaxed">{model2.description}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Global Leaderboard Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                  <Activity className="w-6 h-6 text-indigo-400" />
                  <span>Global & Chinese AI Model Benchmarks Leaderboard</span>
                </h2>
                <p className="text-sm text-slate-400">Comparing HumanEval coding pass rates, context windows, and throughput speed across global and Chinese AI models.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-mono text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Model Name</th>
                      <th className="py-3 px-4">Provider / Origin</th>
                      <th className="py-3 px-4">Context Window</th>
                      <th className="py-3 px-4">HumanEval Pass Rate</th>
                      <th className="py-3 px-4">Speed</th>
                      <th className="py-3 px-4 text-right">Access Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                    {[
                      { name: 'Gemini 3.1 Pro (High Thinking)', provider: 'Google (Global)', context: '2M tokens', eval: '98.4%', speed: 'Deep Reasoning', tier: 'Free Tier' },
                      { name: 'DeepSeek-R1', provider: 'DeepSeek (China)', context: '64k tokens', eval: '96.8%', speed: 'Deep Reasoning', tier: 'Open Weights' },
                      { name: 'DeepSeek-V3', provider: 'DeepSeek (China)', context: '64k tokens', eval: '95.2%', speed: 'Ultra-Fast (MoE)', tier: 'Open Weights' },
                      { name: 'Qwen 2.5 Max', provider: 'Alibaba (China)', context: '128k tokens', eval: '94.6%', speed: 'High Throughput', tier: 'Free Tier' },
                      { name: 'Qwen 2.5 Coder 32B', provider: 'Alibaba (China)', context: '128k tokens', eval: '92.6%', speed: '100 tok/s', tier: 'Open Source' },
                      { name: 'Gemini 3.8 Flash', provider: 'Google (Global)', context: '1M tokens', eval: '92.1%', speed: '120 tok/s', tier: 'Free Tier' },
                      { name: 'Yi-Coder 9B', provider: '01.AI (China)', context: '128k tokens', eval: '89.4%', speed: 'Fast', tier: 'Open Source' }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-4 font-semibold text-white">{row.name}</td>
                        <td className="py-4 px-4 text-indigo-300">{row.provider}</td>
                        <td className="py-4 px-4 text-slate-300">{row.context}</td>
                        <td className="py-4 px-4 font-bold text-emerald-400">{row.eval}</td>
                        <td className="py-4 px-4 text-slate-300">{row.speed}</td>
                        <td className="py-4 px-4 text-right">
                          <span className="px-2.5 py-1 bg-slate-800 rounded-lg text-slate-300">{row.tier}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Latency vs Model Line Chart (Recharts) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    <span>Model Latency Trend Analysis (ms)</span>
                  </h2>
                  <p className="text-xs text-slate-400">Visualizing response latency across the currently listed AI models.</p>
                </div>
                <div className="text-xs font-mono text-indigo-400 bg-indigo-950/40 border border-indigo-500/30 px-3 py-1 rounded-full">
                  Lower is faster
                </div>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#94a3b8" 
                      tick={{ fill: '#94a3b8', fontSize: 11 }} 
                      angle={-20} 
                      textAnchor="end" 
                    />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="ms" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                      formatter={(value: any) => [`${value} ms`, 'Latency']}
                      labelStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="latencyMs" 
                      stroke="#6366f1" 
                      strokeWidth={3} 
                      dot={{ fill: '#6366f1', strokeWidth: 2, r: 5 }} 
                      activeDot={{ r: 8, fill: '#818cf8' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500 space-y-2">
        <p>© 2026 OmniWebDev AI Hub. Featuring Global & Chinese AI Models (DeepSeek-R1, Qwen 2.5, Gemini 3.1 Pro with High Thinking).</p>
      </footer>
    </div>
  );
}
