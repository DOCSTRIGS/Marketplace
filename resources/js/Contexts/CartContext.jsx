import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';

const CartContext = createContext();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const LS_KEY = 'lome_shop_cart';

const readLocalCart = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch { return []; }
};
const writeLocalCart = (items) => localStorage.setItem(LS_KEY, JSON.stringify(items));
const clearLocalCart  = ()      => localStorage.removeItem(LS_KEY);

// Convert a DB CartItem row → shape the UI expects
const dbRowToCartItem = (row) => ({
    id:        row.product_id,
    name:      row.product_name,
    price:     parseFloat(row.product_price),
    image:     row.product_image,   // ← singular string from DB
    images:    row.product_image ? [row.product_image] : [], // compat with images[0] usage
    shop_id:   row.shop_id,
    shop_name: row.shop_name,
    quantity:  row.quantity,
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export const CartProvider = ({ children }) => {
    const [cart, setCart]     = useState(readLocalCart); // instant load from LS
    const [syncing, setSyncing] = useState(false);

    // Keep track of auth states
    const isLoggedInRef = useRef(false);
    const currentUserIdRef = useRef(null);

    // Bootstrap function to fetch & sync cart
    const loadAndSyncCart = useCallback((shouldSyncLocal = false) => {
        setSyncing(true);

        axios.get('/api/cart')
            .then(res => {
                // 200 = user is authenticated
                isLoggedInRef.current = true;

                const localItems = readLocalCart();

                if (shouldSyncLocal && localItems.length > 0) {
                    // Merge local guest cart into server
                    const payload = localItems.map(i => ({
                        product_id: i.id,
                        quantity:   i.quantity,
                    }));
                    axios.post('/api/cart/sync', { items: payload })
                        .then(syncRes => {
                            const merged = syncRes.data.map(dbRowToCartItem);
                            setCart(merged);
                            writeLocalCart(merged); // mirror for offline
                            clearLocalCart();        // remove raw local items
                        })
                        .catch(() => {
                            // sync failed, fall back to server cart
                            const serverCart = res.data.map(dbRowToCartItem);
                            setCart(serverCart);
                            writeLocalCart(serverCart);
                        });
                } else {
                    // Already logged in or no guest items to merge, database is the absolute source of truth
                    const serverCart = res.data.map(dbRowToCartItem);
                    setCart(serverCart);
                    writeLocalCart(serverCart);
                }
            })
            .catch(() => {
                // 401 or network error → guest, keep localStorage
                isLoggedInRef.current = false;
            })
            .finally(() => setSyncing(false));
    }, []);

    // ── Bootstrap on mount & listen to Inertia page updates ──────────────────
    useEffect(() => {
        // Set initial user if already loaded in page props
        const initialUser = router.page?.props?.auth?.user;
        currentUserIdRef.current = initialUser ? initialUser.id : null;
        isLoggedInRef.current = !!initialUser;

        // Perform initial boot fetch
        loadAndSyncCart(false);

        // Listen for Inertia navigation success events (login/logout only —
        // the cart itself is already kept in sync locally by addToCart/
        // removeFromCart/updateQuantity/clearCart, each of which calls its own
        // endpoint. Refetching /api/cart on every single page transition added
        // one remote-DB round trip to every navigation site-wide for no benefit.
        const unregister = router.on('success', (event) => {
            const page = event.detail.page;
            const newUser = page.props?.auth?.user;
            const newUserId = newUser ? newUser.id : null;

            // If the logged in user changed (login or logout occurred)
            if (newUserId !== currentUserIdRef.current) {
                currentUserIdRef.current = newUserId;
                isLoggedInRef.current = !!newUserId;

                if (newUserId) {
                    // User just logged in! Load and merge their guest cart
                    loadAndSyncCart(true);
                } else {
                    // User just logged out! Clear current cart and local storage
                    setCart([]);
                    clearLocalCart();
                }
            }
        });

        return () => {
            unregister();
        };
    }, [loadAndSyncCart]);

    // ── Persist to localStorage (always, as a fallback) ────────────────────────
    useEffect(() => {
        writeLocalCart(cart);
    }, [cart]);

    // ── addToCart ──────────────────────────────────────────────────────────────
    const addToCart = useCallback((product, quantity = 1) => {
        let finalQty = quantity;

        setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                finalQty = existing.quantity + quantity;
                return prev.map(i =>
                    i.id === product.id ? { ...i, quantity: finalQty } : i
                );
            }
            finalQty = quantity;
            return [...prev, { ...product, quantity }];
        });

        // Always try the API — if 401, silently ignore (guest)
        setTimeout(() => {
            axios.post('/api/cart', {
                product_id: product.id,
                quantity:   finalQty,
            }).catch(() => {});
        }, 0); // defer so setCart's state is applied first
    }, []);

    // ── removeFromCart ─────────────────────────────────────────────────────────
    const removeFromCart = useCallback((productId) => {
        setCart(prev => prev.filter(i => i.id !== productId));
        axios.delete(`/api/cart/${productId}`).catch(() => {});
    }, []);

    // ── updateQuantity ─────────────────────────────────────────────────────────
    const updateQuantity = useCallback((productId, quantity) => {
        if (quantity < 1) return;
        setCart(prev => prev.map(i =>
            i.id === productId ? { ...i, quantity } : i
        ));
        axios.patch(`/api/cart/${productId}`, { quantity }).catch(() => {});
    }, []);

    // ── clearCart ──────────────────────────────────────────────────────────────
    const clearCart = useCallback(() => {
        setCart([]);
        clearLocalCart();
        axios.delete('/api/cart').catch(() => {});
    }, []);

    // ── Computed ───────────────────────────────────────────────────────────────
    const cartTotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);
    const cartCount = cart.reduce((t, i) => t + i.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount,
            syncing,
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within a CartProvider');
    return ctx;
};
