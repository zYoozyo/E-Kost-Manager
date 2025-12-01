import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ComplaintResponse } from '../types';
import { Send, User, Building } from 'lucide-react';
import { complaintService } from '../services/complaintService';
import toast from 'react-hot-toast';

interface ComplaintChatProps {
  complaintId: number;
  complaintTitle: string;
  complaintDescription: string;
  tenantName: string;
  role: 'tenant' | 'owner';
  responses: ComplaintResponse[];
  isLoading: boolean;
  status: 'pending' | 'in_progress' | 'resolved';
  onResponseAdded: (response: ComplaintResponse) => void;
}

export function ComplaintChat({
  complaintId,
  complaintTitle,
  complaintDescription,
  tenantName,
  role,
  responses,
  isLoading,
  status,
  onResponseAdded,
}: ComplaintChatProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sort responses by created_at to ensure correct order (oldest first)
  const sortedResponses = useMemo(() => {
    return [...responses].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [responses]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sortedResponses]);

  // Check if chat is disabled (resolved status)
  const isChatDisabled = status === 'resolved';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isChatDisabled) return;

    try {
      setIsSubmitting(true);
      const response = await complaintService.addComplaintResponse(complaintId, { message }, role);
      setMessage('');
      onResponseAdded(response);
      toast.success('Balasan berhasil dikirim');
    } catch (error: any) {
      console.error('Error sending response:', error);
      toast.error(error?.response?.data?.message || 'Gagal mengirim balasan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
      year: diffDays >= 365 ? 'numeric' : undefined
    });
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Chat Header */}
      <div className={`px-6 py-4 border-b rounded-t-lg ${
        isChatDisabled 
          ? 'bg-gray-100 border-gray-300' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{complaintTitle}</h3>
            <p className="text-sm text-gray-600 mt-1">{complaintDescription}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                status === 'resolved' 
                  ? 'bg-green-100 text-green-800' 
                  : status === 'in_progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {status === 'resolved' ? 'Selesai' : status === 'in_progress' ? 'Sedang Diproses' : 'Pending'}
              </span>
              {isChatDisabled && (
                <span className="text-xs text-gray-500 italic">Chat dinonaktifkan</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {role === 'owner' ? (
              <>
                <User className="w-4 h-4" />
                <span>{tenantName}</span>
              </>
            ) : (
              <>
                <Building className="w-4 h-4" />
                <span>Pemilik</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {/* Initial complaint message */}
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900">{tenantName}</span>
              <span className="text-xs text-gray-500">Penyewa</span>
            </div>
            <div className="bg-white rounded-lg p-3 max-w-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{complaintDescription}</p>
            </div>
          </div>
        </div>

        {/* Date separator */}
        {sortedResponses.length > 0 && (
          <div className="flex items-center justify-center my-2">
            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
              {new Date(sortedResponses[0].created_at).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'short'
              })}
            </div>
          </div>
        )}

        {/* Responses */}
        {sortedResponses.map((response, index) => {
          const showDateSeparator = index === 0 || 
            new Date(response.created_at).toDateString() !== new Date(sortedResponses[index - 1].created_at).toDateString();
          
          return (
            <React.Fragment key={response.id}>
              {showDateSeparator && index > 0 && (
                <div className="flex items-center justify-center my-2">
                  <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {new Date(response.created_at).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                </div>
              )}
              <div className={`flex gap-3 ${response.is_owner_response ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  response.is_owner_response ? 'bg-orange-500' : 'bg-blue-500'
                }`}>
                  {response.is_owner_response ? (
                    <Building className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`flex-1 ${response.is_owner_response ? 'text-right' : ''}`}>
                  <div className={`flex items-center gap-2 mb-1 ${response.is_owner_response ? 'justify-end' : ''}`}>
                    <span className="text-sm font-medium text-gray-900">
                      {response.user?.name || (response.is_owner_response ? 'Pemilik' : 'Penyewa')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {response.is_owner_response ? 'Pemilik' : 'Penyewa'}
                    </span>
                  </div>
                  <div className={`inline-block rounded-lg p-3 max-w-lg ${
                    response.is_owner_response 
                      ? 'bg-orange-500 text-white shadow-md' 
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{response.message}</p>
                  </div>
                  <div className={`text-xs text-gray-400 mt-1 ${response.is_owner_response ? 'text-right' : ''}`}>
                    {formatTime(response.created_at)}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="bg-white rounded-lg p-3 max-w-lg shadow-sm border border-gray-100">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className={`px-4 py-3 border-t rounded-b-lg ${
        isChatDisabled
          ? 'bg-gray-100 border-gray-300'
          : 'bg-white border-gray-200'
      }`}>
        {isChatDisabled ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm text-gray-600 font-medium">Chat ditutup karena aduan sudah selesai</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Aduan dengan status "Selesai" tidak dapat dibalas lagi</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  role === 'owner' 
                    ? 'Tulis balasan Anda untuk penyewa...' 
                    : 'Tulis balasan Anda untuk pemilik...'
                }
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!message.trim() || isSubmitting}
              className="px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center justify-center self-end"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
