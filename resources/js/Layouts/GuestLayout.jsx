import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function GuestLayout({ children, maxWidth = 'sm:max-w-md' }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-50 pt-6 sm:justify-center sm:pt-0 px-4 sm:px-0">
            <div>
                <Link href="/" prefetch>
                    <h1 className="text-5xl font-black text-[#8B4513] font-sans tracking-tighter">LoméShop</h1>
                </Link>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`mt-8 w-full overflow-hidden bg-white px-6 py-8 sm:px-8 sm:py-10 shadow-xl shadow-[#8B4513]/5 sm:rounded-[32px] border border-[#8B4513]/10 ${maxWidth}`}
            >
                {children}
            </motion.div>
        </div>
    );
}
