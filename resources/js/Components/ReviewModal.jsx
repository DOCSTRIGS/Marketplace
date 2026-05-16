import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Truck, Package, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/Contexts/ToastContext';

export default function ReviewModal({ order, isOpen, onClose }) {
    const { addToast } = useToast();
    const [processing, setProcessing] = useState(false);
    
    // Initialize state for reviews
    const [reviews, setReviews] = useState(() => {
        const initial = [];
        // Add products
        order.order_items.forEach(item => {
            initial.push({
                type: 'product',
                id: item.product_id,
                name: item.product.name,
                rating: 0,
                comment: ''
            });
        });
        // Add driver if assigned
        if (order.driver) {
            initial.push({
                type: 'driver',
                id: order.driver_id,
                name: order.driver.name,
                rating: 0,
                comment: ''
            });
        }
        return initial;
    });

    const updateReview = (index, field, value) => {
        const newReviews = [...reviews];
        newReviews[index][field] = value;
        setReviews(newReviews);
    };

    const handleSubmit = async () => {
        if (reviews.some(r => r.rating === 0)) {
            addToast("Veuillez donner une note pour chaque élément.", "info");
            return;
        }

        setProcessing(true);
        try {
            await axios.post(route('orders.review.store', order.id), { reviews });
            addToast("✅ Merci pour votre avis !", "success");
            onClose();
            // Optional: trigger reload or update local state
            window.location.reload();
        } catch (error) {
            addToast("Une erreur est survenue lors de l'envoi.", "error");
        } finally {
            setProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-[32px] shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-gray-50 dark:border-white/5 flex justify-between items-center bg-[#FAF9F8] dark:bg-white/5">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Laisser un avis</h2>
                            <p className="text-xs font-bold text-[#8B4513] uppercase tracking-widest mt-1">Commande #{order.order_number}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="max-h-[60vh] overflow-y-auto p-8 space-y-10 custom-scrollbar">
                        {reviews.map((review, idx) => (
                            <div key={`${review.type}-${review.id}`} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[#8B4513]">
                                        {review.type === 'product' ? <Package size={16} /> : <Truck size={16} />}
                                    </div>
                                    <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tight">
                                        {review.type === 'product' ? `Produit : ${review.name}` : `Livreur : ${review.name}`}
                                    </h3>
                                </div>

                                {/* Star Rating */}
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => updateReview(idx, 'rating', star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star 
                                                size={32} 
                                                fill={star <= review.rating ? '#FFD700' : 'none'} 
                                                className={star <= review.rating ? 'text-[#FFD700]' : 'text-gray-300 dark:text-gray-700'} 
                                                strokeWidth={2}
                                            />
                                        </button>
                                    ))}
                                </div>

                                {/* Comment Area */}
                                <div className="relative">
                                    <textarea
                                        placeholder={review.type === 'product' ? "Qu'avez-vous pensé du produit ?" : "Comment s'est passée la livraison ?"}
                                        value={review.comment}
                                        onChange={(e) => updateReview(idx, 'comment', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#8B4513]/20 focus:ring-0 rounded-2xl p-4 text-sm font-medium transition-all min-h-[100px] resize-none"
                                    />
                                    <div className="absolute right-4 bottom-4 text-gray-300 dark:text-gray-600">
                                        <MessageSquare size={16} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5">
                        <button 
                            disabled={processing}
                            onClick={handleSubmit}
                            className="w-full py-4 bg-[#8B4513] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#8B4513]/20 hover:bg-[#70360f] transition-all disabled:opacity-50"
                        >
                            {processing ? 'Envoi en cours...' : 'Publier mes avis'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
