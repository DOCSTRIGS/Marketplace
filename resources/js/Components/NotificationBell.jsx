import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function NotificationBell({ user }) {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(route('notifications.index'));
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.read_at).length);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Listen for real-time notifications
        if (window.Echo && user) {
            window.Echo.private(`App.Models.User.${user.id}`)
                .notification((notification) => {
                    setNotifications(prev => [notification, ...prev]);
                    setUnreadCount(prev => prev + 1);

                    // Simple sound or vibration could go here
                    if (Notification.permission === "granted") {
                        new Notification("LoméShop", {
                            body: notification.message || "Nouvelle notification",
                        });
                    }
                });
        }

        return () => {
            if (window.Echo && user) {
                window.Echo.leave(`App.Models.User.${user.id}`);
            }
        };
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await axios.post(route('notifications.read', id));
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read_at: new Date() } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post(route('notifications.read-all'));
            setNotifications(notifications.map(n => ({ ...n, read_at: new Date() })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors focus:outline-none"
            >
                <Bell size={20} strokeWidth={2.5} />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-[#1a1a1a]"
                    >
                        {unreadCount}
                    </motion.span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        ></div>
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-80 bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden"
                        >
                            <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-[9px] font-black text-[#8B4513] uppercase hover:underline"
                                    >
                                        Tout lire
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                onClick={() => !n.read_at && markAsRead(n.id)}
                                                className={`p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer relative ${!n.read_at ? 'bg-orange-50/30 dark:bg-orange-900/10' : ''}`}
                                            >
                                                {!n.read_at && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8B4513]"></div>
                                                )}
                                                <p className={`text-[11px] leading-relaxed ${!n.read_at ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                                    {n.data.message || 'Nouvelle mise à jour'}
                                                </p>
                                                <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1 font-medium">
                                                    {new Date(n.created_at).toLocaleDateString()} à {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-10 text-center">
                                        <p className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest">Aucune notification</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-gray-800 text-center">
                                <button className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors">
                                    Voir tout l'historique
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
