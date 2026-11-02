import React, { useRef, useState } from 'react';
import { Database, Download, Loader2, Upload } from 'lucide-react';
import { apiClient } from '../backend/api-client';

const AdminDatabaseBackup: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleExport = async () => {
    setIsExporting(true);
    setMessage('');
    setError('');
    try {
      await apiClient.exportDatabaseBackup();
      setMessage('Backup downloaded. Store it somewhere secure because it contains customer and order data.');
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : 'Could not download the database backup.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRestoreFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError('Backup files must be smaller than 50 MB.');
      return;
    }
    if (!window.confirm('Restore this backup and replace the current database records? Existing records will be deleted. This cannot be undone.')) {
      return;
    }

    setIsRestoring(true);
    setMessage('');
    setError('');
    try {
      const backup: unknown = JSON.parse(await file.text());
      const { importedCounts } = await apiClient.restoreDatabaseBackup(backup);
      const total = Object.values(importedCounts).reduce((sum, count) => sum + count, 0);
      setMessage(`Restore complete: ${total} records imported. You must sign in again. The page will reload shortly.`);
      window.setTimeout(() => window.location.reload(), 2500);
    } catch (restoreError) {
      setError(restoreError instanceof Error ? restoreError.message : 'Could not restore this backup.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white">
          <Database className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black text-[#1A1A1A]">Database backup &amp; restore</h3>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Download a copy of your products, users, orders, requests, carts, subscribers, and other application records.
            Restore replaces those records in this database.
          </p>
          <p className="mt-2 text-xs leading-5 text-amber-800">
            Backups contain sensitive customer information and password hashes. Keep the downloaded file private and secure.
            Login sessions are not backed up; restore clears all sessions. Files are limited to 50 MB.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || isRestoring}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download backup
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isExporting || isRestoring}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-[#2563EB] transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRestoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Restore backup
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleRestoreFile}
            />
          </div>

          {message && <p role="status" className="mt-4 text-sm font-medium text-emerald-700">{message}</p>}
          {error && <p role="alert" className="mt-4 text-sm font-medium text-red-700">{error}</p>}
        </div>
      </div>
    </section>
  );
};

export default AdminDatabaseBackup;
