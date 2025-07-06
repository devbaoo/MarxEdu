import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/Header/Header';
import Sidebar from '@/components/Layout/SidebarUser';

const UserLayout = () => {
    const location = useLocation();
    const hideSidebar = location.pathname.startsWith('/lesson/');

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-red-50 to-amber-50">
            <Header />
            <div className="flex flex-1">
                {!hideSidebar && <Sidebar />}
                <main className={hideSidebar ? "flex-1 ml-0" : "flex-1 ml-0 lg:ml-[224px]"}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default UserLayout; 