import Link from "next/link";
import { Job } from "../../types/job";

type Props = {
  job: Job;
  onDelete: (id: string) => void;
};

// Utility function to format ISO date to DD/MM/YYYY
function formatDateDDMMYYYY(isoDate: string) {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function JobRow({ job, onDelete }: Props) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="p-4">
        <div className="font-medium text-gray-900">{job.title}</div>
        <div className="text-sm text-gray-500 mt-1">{job.experience}</div>
      </td>
      <td className="p-4">
        <div className="font-medium text-gray-900">{job.company}</div>
        <div className="text-sm text-gray-500 mt-1">
          {formatDateDDMMYYYY(job.postedDate)}
        </div>
      </td>
      <td className="p-4">
        <div className="text-gray-900">{job.location}</div>
      </td>
      <td className="p-4">
        <div className="flex items-center">
          <svg
            className="w-4 h-4 text-gray-500 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span className="font-medium">{job.views || 0}</span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex space-x-2">
          <Link
            href={`/admin/jobs/${job.id}`}
            className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </Link>
          <button
            onClick={() => onDelete(job.id)}
            className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
