import { Outlet } from 'react-router-dom';
import WorkerSidebar from './WorkerSidebar';

const WorkerLayout = () => {
  return (
    <div className="flex min-h-screen relative font-lato">
      <WorkerSidebar />
      <main className="flex-1 ml-72 p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default WorkerLayout;
