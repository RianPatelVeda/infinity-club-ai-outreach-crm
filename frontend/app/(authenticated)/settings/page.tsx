'use client';

import Header from '@/components/layout/Header';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [sendgridKey, setSendgridKey] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [scrapeLimit, setScrapeLimit] = useState('100');

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div>
      <Header title="Settings" subtitle="Configure your CRM preferences" />

      <div className="p-8 max-w-4xl">
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Email Configuration</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SendGrid API Key
              </label>
              <input
                type="password"
                value={sendgridKey}
                onChange={(e) => setSendgridKey(e.target.value)}
                className="input"
                placeholder="SG.*********************"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Email Address
              </label>
              <input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                className="input"
                placeholder="noreply@infinityclub.com"
              />
            </div>
          </div>
        </div>

        <div className="card mt-6">
          <h2 className="text-xl font-bold mb-6">Scraping Configuration</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Leads Per Scrape
              </label>
              <input
                type="number"
                value={scrapeLimit}
                onChange={(e) => setScrapeLimit(e.target.value)}
                className="input"
                min="1"
                max="1000"
              />
              <p className="text-sm text-gray-500 mt-1">
                Recommended: 100 leads per search
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={handleSave} className="btn btn-primary px-8">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
