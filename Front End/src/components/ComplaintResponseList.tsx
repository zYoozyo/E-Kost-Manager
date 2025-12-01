import { ComplaintResponse } from '../types';

interface ComplaintResponseListProps {
  responses: ComplaintResponse[];
  isLoading?: boolean;
}

export function ComplaintResponseList({ responses, isLoading = false }: ComplaintResponseListProps) {
  if (isLoading) {
    return <p className="text-sm text-gray-500">Memuat balasan...</p>;
  }

  if (!responses.length) {
    return <p className="text-sm text-gray-500">Belum ada balasan</p>;
  }

  return (
    <div className="space-y-4">
      {responses.map((response) => (
        <div
          key={response.id}
          className={`rounded-lg border p-4 ${response.is_owner_response ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {response.user?.name || (response.is_owner_response ? 'Pemilik' : 'Penyewa')}
              </p>
              <p className="text-xs text-gray-500">
                {response.is_owner_response ? 'Balasan pemilik' : 'Balasan penyewa'}
              </p>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(response.created_at).toLocaleString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{response.message}</p>
        </div>
      ))}
    </div>
  );
}
