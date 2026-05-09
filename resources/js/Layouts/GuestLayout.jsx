import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-50 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <h1 className="text-5xl font-black text-[#8B4513] font-sans tracking-tighter">LoméShop</h1>
                </Link>
            </div>

            <div className="mt-8 w-full overflow-hidden bg-white px-8 py-10 shadow-xl shadow-[#8B4513]/5 sm:max-w-md sm:rounded-[32px] border border-[#8B4513]/10">
                {children}
            </div>
        </div>
    );
}
