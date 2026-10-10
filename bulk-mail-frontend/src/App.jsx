import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, History, CheckCircle2, AlertCircle, Loader2, Mail, Users, FileText } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('compose');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientsInput, setRecipientsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      if (res.data.success) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error('Failed to load history', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const handleSendEmails = async (e) => {
    e.preventDefault();
    setAlert(null);

    const recipients = recipientsInput
      .split(/[\n,]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (!subject || !body || recipients.length === 0) {
      setAlert({ type: 'error', message: 'Please fill in all fields and provide at least one valid recipient.' });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/send-mails`, {
        subject,
        body,
        recipients
      });

      if (res.data.success) {
        setAlert({ type: 'success', message: res.data.message });
        setSubject('');
        setBody('');
        setRecipientsInput('');
      } else {
        setAlert({ type: 'error', message: res.data.message || 'Something went wrong.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Server connection error.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-8">
      {/* Header */}
      <header className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between py-6 mb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              OmniMail Studio
            </h1>
            <p className="text-sm text-slate-400">Full-Stack Bulk Email Dispatcher</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 shadow-inner">
          <button
            onClick={() => setActiveTab('compose')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
              activeTab === 'compose'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Compose</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </button>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="w-full max-w-4xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 transition-all">
        {alert && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center space-x-3 border animate-fadeIn ${
              alert.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/50 border-rose-500/30 text-rose-300'
            }`}
          >
            {alert.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span className="text-sm font-medium">{alert.message}</span>
          </div>
        )}

        {activeTab === 'compose' ? (
          <form onSubmit={handleSendEmails} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Recipient Emails (comma or newline separated)</span>
              </label>
              <textarea
                rows="3"
                value={recipientsInput}
                onChange={(e) => setRecipientsInput(e.target.value)}
                placeholder="client1@example.com, client2@example.com"
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Subject</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Exciting Announcement!"
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center space-x-2">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>Email Body</span>
              </label>
              <textarea
                rows="6"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your email message here..."
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Dispatching Emails...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send Bulk Emails</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">Sent Email History</h2>
            {history.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No email campaigns recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item._id} className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-100">{item.subject}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.body}</p>
                      <div className="flex items-center space-x-3 mt-2 text-xs text-slate-500">
                        <span>Recipients: {item.recipients.length}</span>
                        <span>•</span>
                        <span>{new Date(item.sentAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'Success'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}