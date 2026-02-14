
import React, { useState, useEffect } from 'react';
import { Product, Discount } from '../types';
import { productService } from '../services/productService';
import { discountService } from '../services/discountService';
import { authService } from '../services/authService';
import ScrollReveal from '../components/ScrollReveal';
import ImageWithFallback from '../components/ImageWithFallback';
import { Toaster, toast } from 'react-hot-toast';

const AdminPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'products' | 'discounts'>('products');

    // Product Editing State
    const [isEditingProduct, setIsEditingProduct] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<Product> & { discountId?: string }>({
        name: '',
        description: '',
        price: 0,
        category: 'Prop',
        imageUrl: '',
        features: [],
        packContent: [],
        compatibility: [],
        galleryImages: [],
    });

    // Discount Editing State
    const [isEditingDiscount, setIsEditingDiscount] = useState(false);
    const [currentDiscount, setCurrentDiscount] = useState<Partial<Discount>>({
        name: '',
        percentage: 0,
        isActive: true,
    });

    const categories = ['Room', 'Level', 'Prop', 'Full Pack', 'Weapons'];

    const fetchData = async () => {
        try {
            setLoading(true);
            const [backendProducts, backendDiscounts] = await Promise.all([
                productService.getAllProducts(),
                discountService.getAllDiscounts(authService.getAccessToken() || '')
            ]);

            const mappedProducts: Product[] = backendProducts.map((p: any) => ({
                id: p.id,
                name: p.title,
                price: p.price / 100,
                category: p.category,
                imageUrl: p.previewImageKey ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/storage/public/${p.previewImageKey}` : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
                description: p.description,
                tags: [p.category || 'Asset', '3D Model'],
                features: Array.isArray(p.features) ? p.features : (typeof p.features === 'string' ? (p.features as string).split(',').filter(Boolean) : []),
                packContent: Array.isArray(p.packContent) ? p.packContent : (typeof p.packContent === 'string' ? (p.packContent as string).split(',').filter(Boolean) : []),
                compatibility: Array.isArray(p.compatibility) ? p.compatibility : (typeof p.compatibility === 'string' ? (p.compatibility as string).split(',').filter(Boolean) : []),
                technicalSpecs: p.technicalSpecs || {},
                externalLinks: p.externalLinks || {},
                discount: p.discount, // discount object from relation
                fileKey: p.fileKey, // Add fileKey mapping
                galleryImages: p.galleryImages || [],
                previewImageKey: p.previewImageKey
            }));

            setProducts(mappedProducts);
            setDiscounts(backendDiscounts);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Product Handlers ---

    const handleEditProduct = (product: Product) => {
        setCurrentProduct({
            ...product,
            discountId: product.discount?.id || '', // Set initial selection
            galleryImages: product.galleryImages || []
        });
        setIsEditingProduct(true);
    };

    const handleDeleteProduct = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            const token = authService.getAccessToken();
            if (!token) return;
            await toast.promise(
                productService.deleteProduct(id, token),
                {
                    loading: 'Deleting asset...',
                    success: 'Asset deleted permanently.',
                    error: 'Could not delete asset.'
                }
            );
            fetchData();
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    };

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedPreview, setSelectedPreview] = useState<File | null>(null);
    const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<FileList | null>(null);

    const uploadFile = async (file: File, isPublic: boolean): Promise<string> => {
        const token = authService.getAccessToken();
        // 1. Get signed upload URL
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/storage/generate-upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ contentType: file.type, isPublic })
        });

        if (!res.ok) throw new Error('Failed to get upload URL');

        const { uploadUrl, key } = await res.json();

        // 2. Upload file directly to R2
        const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file
        });

        if (!uploadRes.ok) throw new Error('Failed to upload file to storage');

        return key;
    };

    const handleSubmitProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        const saveOperation = async () => {
            const token = authService.getAccessToken();
            if (!token) throw new Error("No token");

            let fileKey = currentProduct.fileKey;
            if (selectedFile) {
                fileKey = await uploadFile(selectedFile, false);
            }

            let previewImageKey = currentProduct.previewImageKey;

            if (selectedPreview) {
                previewImageKey = await uploadFile(selectedPreview, true);
            } else if (!previewImageKey && currentProduct.imageUrl?.includes('/files/')) {
                previewImageKey = currentProduct.imageUrl.split('/files/')[1];
            }

            let galleryImages = [...(currentProduct.galleryImages || [])];
            if (selectedGalleryFiles) {
                for (let i = 0; i < selectedGalleryFiles.length; i++) {
                    const key = await uploadFile(selectedGalleryFiles[i], true);
                    galleryImages.push(key);
                }
            }

            const payload = {
                title: currentProduct.name,
                description: currentProduct.description,
                price: Math.round((currentProduct.price || 0) * 100),
                category: currentProduct.category,
                fileKey: fileKey || 'products/placeholder.zip',
                previewImageKey: previewImageKey,
                galleryImages: galleryImages,
                features: (currentProduct.features || []).filter(s => s.trim() !== ''),
                packContent: (currentProduct.packContent || []).filter(s => s.trim() !== ''),
                compatibility: (currentProduct.compatibility || []).filter(s => s.trim() !== ''),
                technicalSpecs: currentProduct.technicalSpecs || {},
                externalLinks: currentProduct.externalLinks || {},
                discountId: currentProduct.discountId || null
            };

            if (currentProduct.id) {
                await productService.updateProduct(currentProduct.id, payload as any, token);
            } else {
                await productService.createProduct(payload as any, token);
            }
        };

        try {
            await toast.promise(saveOperation(), {
                loading: 'Uploading files & Saving...',
                success: 'Asset saved successfully! 🎨',
                error: (err) => `Failed to save: ${err.message}`
            });

            setIsEditingProduct(false);
            setSelectedFile(null);
            setSelectedPreview(null);
            setSelectedGalleryFiles(null);
            setCurrentProduct({ name: '', description: '', price: 0, category: 'Prop', imageUrl: '', fileKey: '', features: [], packContent: [], compatibility: [], discountId: '', technicalSpecs: { polyCount: '', textures: '', rigged: false, animated: false }, externalLinks: { unity: '', fab: '', cgtrader: '', artstation: '' }, galleryImages: [] });
            fetchData();
        } catch (error) {
            console.error('Failed to save product:', error);
        }
    };

    const openNewProductForm = () => {
        setCurrentProduct({ name: '', description: '', price: 0, category: 'Prop', imageUrl: '', fileKey: '', features: [], packContent: [], compatibility: [], discountId: '', technicalSpecs: { polyCount: '', textures: '', rigged: false, animated: false }, externalLinks: { unity: '', fab: '', cgtrader: '', artstation: '' }, galleryImages: [] });
        setIsEditingProduct(true);
    };

    // Helper for Arrays
    const handleArrayChange = (field: keyof Product, index: number, value: string) => {
        const array = (currentProduct[field] as string[]) || [];
        const newArray = [...array];
        newArray[index] = value;
        setCurrentProduct({ ...currentProduct, [field]: newArray });
    };

    const addArrayItem = (field: keyof Product) => {
        const array = (currentProduct[field] as string[]) || [];
        setCurrentProduct({ ...currentProduct, [field]: [...array, ''] });
    };

    const removeArrayItem = (field: keyof Product, index: number) => {
        const array = (currentProduct[field] as string[]) || [];
        setCurrentProduct({ ...currentProduct, [field]: array.filter((_, i) => i !== index) });
    };


    // --- Discount Handlers ---

    const handleEditDiscount = (discount: Discount) => {
        setCurrentDiscount(discount);
        setIsEditingDiscount(true);
    };

    const handleDeleteDiscount = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this discount?')) return;
        try {
            const token = authService.getAccessToken();
            if (!token) return;
            await toast.promise(
                discountService.deleteDiscount(id, token),
                {
                    loading: 'Deleting discount...',
                    success: 'Discount deleted.',
                    error: 'Failed to delete.'
                }
            );
            fetchData();
        } catch (error) {
            console.error('Failed to delete discount:', error);
        }
    };

    const handleSubmitDiscount = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = authService.getAccessToken();
            if (!token) return;

            const payload = {
                name: currentDiscount.name,
                percentage: Number(currentDiscount.percentage),
                isActive: currentDiscount.isActive,
            };

            const action = currentDiscount.id
                ? discountService.updateDiscount(currentDiscount.id, payload, token)
                : discountService.createDiscount(payload, token);

            await toast.promise(action, {
                loading: 'Saving discount...',
                success: 'Discount saved! 💸',
                error: 'Failed to save discount.'
            });

            setIsEditingDiscount(false);
            setCurrentDiscount({ name: '', percentage: 0, isActive: true });
            fetchData();
        } catch (error) {
            console.error('Failed to save discount:', error);
        }
    };

    const openNewDiscountForm = () => {
        setCurrentDiscount({ name: '', percentage: 0, isActive: true });
        setIsEditingDiscount(true);
    };


    return (
        <div className="min-h-screen pt-10 pb-20 px-4 bg-gray-50">
            <Toaster position="top-right" reverseOrder={false} />
            <ScrollReveal className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Admin Panel</h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Manage assets & discounts</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white rounded-2xl p-2 mb-8 w-fit shadow-sm border border-gray-100">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-[#8a7db3] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Assets
                    </button>
                    <button
                        onClick={() => setActiveTab('discounts')}
                        className={`px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'discounts' ? 'bg-[#8a7db3] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Discounts
                    </button>
                </div>

                {/* Products View */}
                {activeTab === 'products' && (
                    <>
                        <div className="flex justify-end mb-8">
                            <button
                                onClick={openNewProductForm}
                                className="bg-[#8a7db3] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:translate-y-[-4px] transition-all"
                            >
                                Add New Asset +
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="w-16 h-16 border-8 border-gray-100 border-t-[#8a7db3] rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[3rem] shadow-xl border-4 border-white overflow-hidden">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b-2 border-gray-100">
                                            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Asset</th>
                                            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Category</th>
                                            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Price</th>
                                            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Discount</th>
                                            <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {products.map(product => (
                                            <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl border-2 border-white shadow-sm overflow-hidden shrink-0">
                                                            <ImageWithFallback src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-900 group-hover:text-[#8a7db3] transition-colors">{product.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold truncate max-w-[200px]">{product.description}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {product.discount && product.discount.isActive ? (
                                                        <>
                                                            <p className="font-bold text-gray-400 line-through text-xs">${product.price.toFixed(2)}</p>
                                                            <p className="font-black text-[#8a7db3]">${(product.price * (1 - product.discount.percentage / 100)).toFixed(2)}</p>
                                                        </>
                                                    ) : (
                                                        <p className="font-black text-[#8a7db3]">${product.price.toFixed(2)}</p>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6">
                                                    {product.discount ? (
                                                        <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                            -{product.discount.percentage}% OFF
                                                        </span>
                                                    ) : <span className="text-gray-300 text-[10px] font-bold">-</span>}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditProduct(product)}
                                                            className="p-2 border-2 border-gray-100 rounded-xl text-gray-400 hover:text-[#8a7db3] hover:border-[#8a7db3]/30 transition-all"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(product.id)}
                                                            className="p-2 border-2 border-gray-100 rounded-xl text-gray-400 hover:text-pink-500 hover:border-pink-100 transition-all"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* Discounts View */}
                {activeTab === 'discounts' && (
                    <>
                        <div className="flex justify-end mb-8">
                            <button
                                onClick={openNewDiscountForm}
                                className="bg-[#8a7db3] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:translate-y-[-4px] transition-all"
                            >
                                Add New Discount +
                            </button>
                        </div>

                        <div className="bg-white rounded-[3rem] shadow-xl border-4 border-white overflow-hidden">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b-2 border-gray-100">
                                        <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Name</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Percentage</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                        <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {discounts.map(discount => (
                                        <tr key={discount.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-8 py-6 font-bold text-gray-800">{discount.name}</td>
                                            <td className="px-8 py-6 font-black text-[#8a7db3]">{discount.percentage}%</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${discount.isActive ? 'bg-[#a2c367]/20 text-[#a2c367]' : 'bg-gray-200 text-gray-500'}`}>
                                                    {discount.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleEditDiscount(discount)} className="p-2 border-2 border-gray-100 rounded-xl text-gray-400 hover:text-[#8a7db3]">
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteDiscount(discount.id)} className="p-2 border-2 border-gray-100 rounded-xl text-gray-400 hover:text-pink-500">
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {discounts.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-12 text-center text-gray-400 font-bold">No discounts found. Create one!</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}


                {/* Modals */}

                {/* Product Modal */}
                {isEditingProduct && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[3rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-hidden flex flex-col">
                            <button
                                onClick={() => setIsEditingProduct(false)}
                                className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors z-[110]"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <h2 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tighter shrink-0">
                                {currentProduct.id ? 'Edit Asset' : 'New Asset'}
                            </h2>

                            <form onSubmit={handleSubmitProduct} className="space-y-6 overflow-y-auto px-2 pb-4">
                                {/* Title & Price */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Title</label>
                                        <input required type="text" value={currentProduct.name} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Price ($)</label>
                                        <input required type="number" step="0.01" value={currentProduct.price} onChange={e => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) })} className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none transition-all" />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Description</label>
                                    <textarea required rows={2} value={currentProduct.description} onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })} className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none transition-all" />
                                </div>

                                {/* Category & Image */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Category</label>
                                        <select value={currentProduct.category} onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value as any })} className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none transition-all">
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Preview Image (JPG/PNG)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setSelectedPreview(e.target.files ? e.target.files[0] : null)}
                                            className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none transition-all"
                                        />
                                        {currentProduct.imageUrl && <p className="text-xs text-gray-400 mt-2 ml-4">Current: {currentProduct.imageUrl}</p>}
                                    </div>

                                    {/* Gallery Images */}
                                    <div className="md:col-span-2">
                                        <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Gallery Images (Multiple)</label>
                                        <div className="bg-gray-50 border-4 border-dashed border-gray-100 hover:border-[#8a7db3]/30 rounded-2xl p-6 transition-colors text-center group cursor-pointer relative">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={e => setSelectedGalleryFiles(e.target.files)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="pointer-events-none">
                                                <span className="text-[#8a7db3] font-black text-sm uppercase tracking-widest group-hover:scale-105 inline-block transition-transform">+ Add Images</span>
                                                <p className="text-gray-400 text-[10px] font-bold mt-2">{selectedGalleryFiles ? `${selectedGalleryFiles.length} new files ready` : 'Drag & Drop or Click'}</p>
                                            </div>
                                        </div>

                                        {currentProduct.galleryImages && currentProduct.galleryImages.length > 0 && (
                                            <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-4 animate-in fade-in slide-in-from-top-2">
                                                {currentProduct.galleryImages.map((imgKey, idx) => (
                                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-100 group shadow-sm bg-gray-100">
                                                        <img
                                                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/storage/public/${imgKey}`}
                                                            alt=""
                                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newGallery = [...(currentProduct.galleryImages || [])];
                                                                newGallery.splice(idx, 1);
                                                                setCurrentProduct({ ...currentProduct, galleryImages: newGallery });
                                                            }}
                                                            className="absolute top-1 right-1 bg-white/90 text-red-500 w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-red-50 z-20"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Product File (ZIP/RAR)</label>
                                        <input
                                            type="file"
                                            accept=".zip,.rar,.7z"
                                            onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                                            className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none transition-all"
                                        />
                                        {currentProduct.fileKey && <p className="text-xs text-gray-400 mt-2 ml-4">Current Key: {currentProduct.fileKey}</p>}
                                    </div>
                                </div>

                                {/* Discount Selection */}
                                <div>
                                    <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4 text-pink-500">Apply Discount</label>
                                    <select
                                        value={currentProduct.discountId || ''}
                                        onChange={e => setCurrentProduct({ ...currentProduct, discountId: e.target.value })}
                                        className="w-full bg-pink-50 border-4 border-transparent focus:border-pink-300 rounded-2xl px-6 py-4 font-bold outline-none transition-all text-pink-600"
                                    >
                                        <option value="">No Discount</option>
                                        {discounts.filter(d => d.isActive).map(d => (
                                            <option key={d.id} value={d.id}>{d.name} (-{d.percentage}%)</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Dynamic Arrays */}
                                <div className="space-y-8 pt-6 border-t-2 border-gray-100">
                                    {/* Features */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4 px-4">
                                            <h3 className="font-black text-gray-400 uppercase tracking-widest text-xs">Features</h3>
                                            <button type="button" onClick={() => addArrayItem('features')} className="text-[#8a7db3] font-black text-xs uppercase tracking-widest hover:underline">+ Add</button>
                                        </div>
                                        <div className="space-y-2 pl-2">
                                            {(currentProduct.features || []).map((item, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input type="text" value={item} onChange={(e) => handleArrayChange('features', index, e.target.value)} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#8a7db3] rounded-xl px-4 py-2 font-bold outline-none text-sm" />
                                                    <button type="button" onClick={() => removeArrayItem('features', index)} className="p-2 text-red-300 hover:text-red-500 font-bold">×</button>
                                                </div>
                                            ))}
                                            {(!currentProduct.features || currentProduct.features.length === 0) && <p className="text-center text-gray-300 text-[10px] font-bold">No features</p>}
                                        </div>
                                    </div>
                                    {/* Pack Content */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4 px-4">
                                            <h3 className="font-black text-gray-400 uppercase tracking-widest text-xs">Pack Content</h3>
                                            <button type="button" onClick={() => addArrayItem('packContent')} className="text-[#8a7db3] font-black text-xs uppercase tracking-widest hover:underline">+ Add</button>
                                        </div>
                                        <div className="space-y-2 pl-2">
                                            {(currentProduct.packContent || []).map((item, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input type="text" value={item} onChange={(e) => handleArrayChange('packContent', index, e.target.value)} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#8a7db3] rounded-xl px-4 py-2 font-bold outline-none text-sm" />
                                                    <button type="button" onClick={() => removeArrayItem('packContent', index)} className="p-2 text-red-300 hover:text-red-500 font-bold">×</button>
                                                </div>
                                            ))}
                                            {(!currentProduct.packContent || currentProduct.packContent.length === 0) && <p className="text-center text-gray-300 text-[10px] font-bold">No content</p>}
                                        </div>
                                    </div>
                                    {/* Compatibility */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4 px-4">
                                            <h3 className="font-black text-gray-400 uppercase tracking-widest text-xs">Compatibility</h3>
                                            <button type="button" onClick={() => addArrayItem('compatibility')} className="text-[#8a7db3] font-black text-xs uppercase tracking-widest hover:underline">+ Add</button>
                                        </div>
                                        <div className="space-y-2 pl-2">
                                            {(currentProduct.compatibility || []).map((item, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input type="text" value={item} onChange={(e) => handleArrayChange('compatibility', index, e.target.value)} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#8a7db3] rounded-xl px-4 py-2 font-bold outline-none text-sm" />
                                                    <button type="button" onClick={() => removeArrayItem('compatibility', index)} className="p-2 text-red-300 hover:text-red-500 font-bold">×</button>
                                                </div>
                                            ))}
                                            {(!currentProduct.compatibility || currentProduct.compatibility.length === 0) && <p className="text-center text-gray-300 text-[10px] font-bold">No compatibility</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Tech Specs */}
                                <div className="space-y-6 pt-4 border-t-2 border-gray-100">
                                    <h3 className="font-black text-gray-400 uppercase tracking-widest text-xs">Technical Specs</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" placeholder="Poly Count" value={currentProduct.technicalSpecs?.polyCount || ''} onChange={e => setCurrentProduct({ ...currentProduct, technicalSpecs: { ...currentProduct.technicalSpecs, polyCount: e.target.value } })} className="bg-gray-50 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:bg-white border-2 border-transparent focus:border-[#8a7db3]" />
                                        <input type="text" placeholder="Textures" value={currentProduct.technicalSpecs?.textures || ''} onChange={e => setCurrentProduct({ ...currentProduct, technicalSpecs: { ...currentProduct.technicalSpecs, textures: e.target.value } })} className="bg-gray-50 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:bg-white border-2 border-transparent focus:border-[#8a7db3]" />
                                    </div>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 text-sm font-bold text-gray-600"><input type="checkbox" checked={currentProduct.technicalSpecs?.rigged || false} onChange={e => setCurrentProduct({ ...currentProduct, technicalSpecs: { ...currentProduct.technicalSpecs, rigged: e.target.checked } })} /> Rigged</label>
                                        <label className="flex items-center gap-2 text-sm font-bold text-gray-600"><input type="checkbox" checked={currentProduct.technicalSpecs?.animated || false} onChange={e => setCurrentProduct({ ...currentProduct, technicalSpecs: { ...currentProduct.technicalSpecs, animated: e.target.checked } })} /> Animated</label>
                                    </div>
                                </div>
                                <div className="space-y-6 pt-4 border-t-2 border-gray-100">
                                    <h3 className="font-black text-gray-400 uppercase tracking-widest text-xs">External Store Links</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-4">Unity Asset Store</label>
                                            <input
                                                type="text"
                                                value={currentProduct.externalLinks?.unity}
                                                onChange={e => setCurrentProduct({ ...currentProduct, externalLinks: { ...currentProduct.externalLinks, unity: e.target.value } })}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#8a7db3] rounded-xl px-4 py-3 font-bold outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-4">Fab / Sketchfab</label>
                                            <input
                                                type="text"
                                                value={currentProduct.externalLinks?.fab}
                                                onChange={e => setCurrentProduct({ ...currentProduct, externalLinks: { ...currentProduct.externalLinks, fab: e.target.value } })}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#8a7db3] rounded-xl px-4 py-3 font-bold outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-4">CGTrader</label>
                                            <input
                                                type="text"
                                                value={currentProduct.externalLinks?.cgtrader}
                                                onChange={e => setCurrentProduct({ ...currentProduct, externalLinks: { ...currentProduct.externalLinks, cgtrader: e.target.value } })}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#8a7db3] rounded-xl px-4 py-3 font-bold outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-4">ArtStation</label>
                                            <input
                                                type="text"
                                                value={currentProduct.externalLinks?.artstation}
                                                onChange={e => setCurrentProduct({ ...currentProduct, externalLinks: { ...currentProduct.externalLinks, artstation: e.target.value } })}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#8a7db3] rounded-xl px-4 py-3 font-bold outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-[#8a7db3] text-white py-6 rounded-[1.5rem] font-black text-xl shadow-xl hover:translate-y-[-4px] transition-all uppercase tracking-widest mt-8">Save Asset Magic 🪄</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Discount Modal */}
                {isEditingDiscount && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[3rem] p-8 md:p-12 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
                            <button onClick={() => setIsEditingDiscount(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors">✕</button>
                            <h2 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tighter">{currentDiscount.id ? 'Edit Discount' : 'New Discount'}</h2>

                            <form onSubmit={handleSubmitDiscount} className="space-y-6">
                                <div>
                                    <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Discount Name</label>
                                    <input required type="text" value={currentDiscount.name} onChange={e => setCurrentDiscount({ ...currentDiscount, name: e.target.value })} className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none" placeholder="e.g. Summer Sale" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Percentage (%)</label>
                                    <input required type="number" min="0" max="100" value={currentDiscount.percentage} onChange={e => setCurrentDiscount({ ...currentDiscount, percentage: parseFloat(e.target.value) })} className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none" />
                                </div>
                                <div className="flex items-center gap-4 ml-4">
                                    <input type="checkbox" checked={currentDiscount.isActive} onChange={e => setCurrentDiscount({ ...currentDiscount, isActive: e.target.checked })} className="w-6 h-6 rounded border-gray-300 text-[#8a7db3]" />
                                    <label className="font-bold text-gray-700">Active</label>
                                </div>
                                <button type="submit" className="w-full bg-[#8a7db3] text-white py-6 rounded-[1.5rem] font-black text-xl shadow-xl hover:translate-y-[-4px] transition-all uppercase tracking-widest mt-4">Save Discount</button>
                            </form>
                        </div>
                    </div>
                )}

            </ScrollReveal>
        </div >
    );
};

export default AdminPage;
