import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';

function Stars({ rating }) {
    return (
        <div className="flex text-amber-500 text-xs">
            {[...Array(5)].map((_, i) => (
                <span key={i} className={i < rating ? 'text-amber-500' : 'text-gray-250 dark:text-gray-700'}>★</span>
            ))}
        </div>
    );
}

function ReplyForm({ review }) {
    const { data, setData, post, processing, reset } = useForm({ reply: '' });
    const [open, setOpen] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('seller.reviews.reply', review.id), {
            preserveScroll: true,
            onSuccess: () => { reset(); setOpen(false); },
        });
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="text-xs font-bold text-[#8B4513] hover:underline"
            >
                Répondre à cet avis
            </button>
        );
    }

    return (
        <form onSubmit={submit} className="mt-2 space-y-2">
            <textarea
                value={data.reply}
                onChange={(e) => setData('reply', e.target.value)}
                rows={2}
                maxLength={1000}
                placeholder="Votre réponse publique à ce client..."
                className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212] p-3 focus:ring-2 focus:ring-[#8B4513]/20 focus:outline-none"
                required
            />
            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 rounded-lg bg-[#8B4513] text-white text-xs font-bold hover:bg-[#70360f] disabled:opacity-50"
                >
                    {processing ? 'Envoi...' : 'Publier la réponse'}
                </button>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                    Annuler
                </button>
            </div>
        </form>
    );
}

export default function SellerReviews({ auth, reviews, avgRating, reviewsCount }) {
    return (
        <SellerLayout>
            <Head title="Avis clients" />

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Avis clients</h2>
                <p className="text-gray-600 dark:text-gray-400">Les avis laissés par vos clients sur vos produits.</p>
            </div>

            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-8 flex items-center gap-6">
                <div className="text-4xl font-black text-gray-900 dark:text-white">{avgRating || '—'}<span className="text-lg text-gray-400 font-bold"> /5</span></div>
                <div>
                    <Stars rating={Math.round(avgRating)} />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{reviewsCount} avis au total</p>
                </div>
            </div>

            <div className="space-y-4">
                {reviews.data.length > 0 ? reviews.data.map((review) => (
                    <div key={review.id} className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{review.user?.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">sur « {review.product?.name || 'Produit supprimé'} »</p>
                            </div>
                            <div className="text-right">
                                <Stars rating={review.rating} />
                                <p className="text-[10px] text-gray-400 mt-1">{new Date(review.created_at).toLocaleDateString('fr-FR')}</p>
                            </div>
                        </div>
                        {review.comment && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-3">{review.comment}</p>
                        )}

                        {review.seller_reply ? (
                            <div className="mt-4 ml-4 pl-4 border-l-2 border-[#8B4513]/30">
                                <p className="text-[10px] font-black uppercase text-[#8B4513] dark:text-[#E67E22] mb-1">Votre réponse</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{review.seller_reply}</p>
                            </div>
                        ) : (
                            <div className="mt-4">
                                <ReplyForm review={review} />
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-gray-400 font-medium">Aucun avis pour le moment.</p>
                    </div>
                )}
            </div>

            {reviews.links && reviews.links.length > 3 && (
                <div className="mt-8 flex justify-center gap-2 flex-wrap">
                    {reviews.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url}
                            prefetch
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${link.active ? 'bg-[#8B4513] text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </SellerLayout>
    );
}
