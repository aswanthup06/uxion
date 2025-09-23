import { Job } from "../../types/job";
import JobRow from "../comp/JobRow"; 
import JobEmptyState from "../comp/JobEmptyState";

type Props = {
  jobs: Job[];
  onDelete: (id: string) => void;
};

export default function JobTable({ jobs, onDelete }: Props) {
  if (jobs.length === 0) return <JobEmptyState />;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Title
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Views
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {jobs.map((job) => (
              <JobRow key={job.id} job={job} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
