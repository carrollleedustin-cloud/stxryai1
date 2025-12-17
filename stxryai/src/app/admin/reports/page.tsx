'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { moderationService } from '@/services/moderationService';
import { Report, ReportStatus } from '@/types/moderation';

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReportStatus | undefined>('pending');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await moderationService.getReports(filter);
      setReports(data);
    } catch (err) {
      setError('Failed to fetch reports.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpdateStatus = async (id: string, status: ReportStatus) => {
    try {
      await moderationService.updateReportStatus(id, status);
      fetchReports(); // Refresh the list
    } catch (err) {
      alert('Failed to update report status.');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Content Reports</h1>
      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('addressed')}
          className={`px-4 py-2 rounded ${filter === 'addressed' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
        >
          Addressed
        </button>
        <button
          onClick={() => setFilter('dismissed')}
          className={`px-4 py-2 rounded ${filter === 'dismissed' ? 'bg-gray-500 text-white' : 'bg-gray-200'}`}
        >
          Dismissed
        </button>
        <button
          onClick={() => setFilter(undefined)}
          className={`px-4 py-2 rounded ${filter === undefined ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
        >
          All
        </button>
      </div>

      {loading && <p>Loading reports...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Reporter</th>
                <th className="py-2 px-4 border-b">Content Type</th>
                <th className="py-2 px-4 border-b">Reason</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="py-2 px-4 border-b">{report.reporter.display_name}</td>
                  <td className="py-2 px-4 border-b">{report.content_type}</td>
                  <td className="py-2 px-4 border-b">{report.reason}</td>
                  <td className="py-2 px-4 border-b">{report.status}</td>
                  <td className="py-2 px-4 border-b">
                    {/* Actions will be implemented later */}
                    <button className="text-blue-500 hover:underline mr-2">View Content</button>
                    {report.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(report.id, 'addressed')}
                          className="text-green-500 hover:underline mr-2"
                        >
                          Address
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                          className="text-red-500 hover:underline"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
