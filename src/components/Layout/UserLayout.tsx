import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '@/components/Header/Header';
import Sidebar from '@/components/Layout/SidebarUser';
import { useAppDispatch, useAppSelector } from '@/services/store/store';
import { getCheckInStatus } from '@/services/features/checkin/checkInSlice';
import CheckInModal from '@/components/Modal/CheckInModal';
import SurveyButton from '@/components/Survey/SurveyButton';

const UserLayout = () => {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const hideSidebar = location.pathname.startsWith('/lesson/');
    const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const { checkInStatus } = useAppSelector((state) => state.checkIn);

    // Check if the user has already checked in today when they log in
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(getCheckInStatus());
        }
    }, [isAuthenticated, dispatch]);

    // Show check-in modal when user logs in and hasn't checked in yet
    useEffect(() => {
        if (isAuthenticated && checkInStatus && !checkInStatus.hasCheckedInToday) {
            // Don't show modal on lesson pages
            if (!hideSidebar) {
                // Wait a moment before showing the modal to avoid immediate popup
                const timer = setTimeout(() => {
                    setIsCheckInModalOpen(true);
                }, 1500);

                return () => clearTimeout(timer);
            }
        }
    }, [isAuthenticated, checkInStatus, hideSidebar]);

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-red-50 to-amber-50">
            <Header />
            <div className="flex flex-1">
                {!hideSidebar && <Sidebar />}
                <main className={hideSidebar ? "flex-1 ml-0" : "flex-1 ml-0 lg:ml-[224px]"}>
                    <Outlet />
                </main>
            </div>

            {/* Check-in Modal */}
            <CheckInModal
                isOpen={isCheckInModalOpen}
                onClose={() => setIsCheckInModalOpen(false)}
            />

            {/* Survey Button */}
            <SurveyButton />
        </div>
    );
};

export default UserLayout; 