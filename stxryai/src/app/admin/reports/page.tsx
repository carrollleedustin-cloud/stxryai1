'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { moderationService, UserReport, ReportStatus } from '@/services/moderationService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flag, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  FileText,
  Eye,
  Shield
} from 'lucide-react';

const statusColors: Record<ReportStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  reviewing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
  dismissed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  escalated: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-500/20 text-gray-400',
  normal: 'bg-blue-500/20 text-blue-400',
  high: 'bg-orange-500/20 text-orange-400',
  urgent: 'bg-red-500/20 text-red-400',
};

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReportStatus | 'all'>('pending');
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Note: getReports requires a moderatorId - using empty string for now
      // In production, get this from auth context
      const data = await moderationService.getReports('', { 
        status: filter === 'all' ? undefined : filter 
      });
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
      fetchReports();
    } catch (err) {
      alert('Failed to update report status.');
    }
  };

  const filterButtons: { label: string; value: ReportStatus | 'all'; icon: React.ReactNode }[] = [
    { label: 'Pending', value: 'pending', icon: <Clock className="w-4 h-4" /> },
    { label: 'Reviewing', value: 'reviewing', icon: <Eye className="w-4 h-4" /> },
    { label: 'Resolved', value: 'resolved', icon: <CheckCircle className="w-4 h-4" /> },
    { label: 'Dismissed', value: 'dismissed', icon: <XCircle className="w-4 h-4" /> },
    { label: 'Escalated', value: 'escalated', icon: <AlertTriangle className="w-4 h-4" /> },
    { label: 'All', value: 'all', icon: <Flag className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Content Reports</h1>
              <p className="text-gray-400">Review and moderate user reports</p>
            </div>
          </div>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                filter === btn.value
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                  : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center"
          >
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchReports}
              className="mt-4 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Reports Grid */}
        {!loading && !error && (
          <AnimatePresence mode="popLayout">
            {reports.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No reports to review</p>
              </motion.div>
            ) : (
              <div className="grid gap-4">
                {reports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 hover:border-gray-600/50 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Report Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[report.status]}`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[report.priority]}`}>
                            {report.priority.toUpperCase()}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-300 mb-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{report.reporterName || 'Anonymous'}</span>
                          <span className="text-gray-500">reported</span>
                          {report.reportedUserName && (
                            <span className="text-orange-400 font-medium">{report.reportedUserName}</span>
                          )}
                        </div>

                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-gray-500 mt-1" />
                          <div>
                            <span className="text-sm text-purple-400 font-medium">{report.reportType}</span>
                            {report.description && (
                              <p className="text-gray-400 text-sm mt-1">{report.description}</p>
                            )}
                          </div>
                        </div>

                        {report.assignedToName && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <Shield className="w-4 h-4" />
                            Assigned to: <span className="text-blue-400">{report.assignedToName}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        
                        {report.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(report.id, 'reviewing')}
                              className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(report.id, 'resolved')}
                              className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                              className="px-4 py-2 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors"
                            >
                              Dismiss
                            </button>
                          </>
                        )}

                        {report.status === 'reviewing' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(report.id, 'resolved')}
                              className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(report.id, 'escalated')}
                              className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                            >
                              Escalate
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}

        {/* Report Detail Modal */}
        <AnimatePresence>
          {selectedReport && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedReport(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Report Details</h2>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Reporter</p>
                      <p className="text-white font-medium">{selectedReport.reporterName || 'Anonymous'}</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Reported User</p>
                      <p className="text-white font-medium">{selectedReport.reportedUserName || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Report Type</p>
                      <p className="text-purple-400 font-medium">{selectedReport.reportType}</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Priority</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[selectedReport.priority]}`}>
                        {selectedReport.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {selectedReport.description && (
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-2">Description</p>
                      <p className="text-white">{selectedReport.description}</p>
                    </div>
                  )}

                  {selectedReport.evidenceUrls && selectedReport.evidenceUrls.length > 0 && (
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-2">Evidence</p>
                      <div className="space-y-2">
                        {selectedReport.evidenceUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-blue-400 hover:underline truncate"
                          >
                            {url}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedReport.resolutionNotes && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <p className="text-green-400 text-sm mb-2">Resolution Notes</p>
                      <p className="text-white">{selectedReport.resolutionNotes}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReportsPage;
