
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Product, Discount, Coupon } from '../types';
import { productService } from '../services/productService';
import { discountService } from '../services/discountService';
import { couponService } from '../services/couponService';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import { downloadsService } from '../services/downloadsService';
import { broadcastService } from '../services/broadcastService';
import ScrollReveal from '../components/ScrollReveal';
import ImageWithFallback from '../components/ImageWithFallback';
import { Toaster, toast } from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { calculateDiscountedPrice } from '../context/CartContext';


const DEFAULT_PACK_CONTENT = ['FBX', 'OBJ', 'Blender', 'GLTF (glb)', 'STL', 'MAYA', 'Unity Package', 'Unreal Engine', 'Tuanjie Engine'];
const DEFAULT_COMPATIBILITY = ['Unreal Engine 4.26 - 4.27 and 5.0+', 'Unity 2021.3+', 'Unity 6000+', 'Tuanjie Engine 1.8.1+', 'Blender 3.5+', 'Godot 3.4+', 'Roblox'];

const AdminPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'products' | 'discounts' | 'coupons' | 'purchases' | 'downloads' | 'newsletters'>('products');
    const [allOrders, setAllOrders] = useState<any[]>([]);
    const [downloadLogs, setDownloadLogs] = useState<any[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();

    // Newsletter State
    const [newsletter, setNewsletter] = useState({
        subject: 'Vibrant New Asset Released! 🎨',
        body: `We are super excited to announce our latest addition to the Mnostva Art catalog!\n\nThis high-quality, fully optimized stylized asset pack is designed to help you construct beautiful environments with zero hassle.\n\nTake advantage of our current launch discounts today!`,
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
        featuredProductId: '',
        ctaText: 'Explore Collection',
        ctaLink: 'http://localhost:3002/marketplace',
        templateType: 'new_release' as 'promo' | 'announcement' | 'new_release',
        testEmailOnly: true,
        testRecipient: '',
    });
    const [sendingBroadcast, setSendingBroadcast] = useState(false);

    // Product Editing State
    const [isEditingProduct, setIsEditingProduct] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<Product> & { discountId?: string }>({
        name: '',
        description: '',
        price: 0,
        category: 'Prop',
        imageUrl: '',
        fileKey: '',
        fileName: '',
        features: [],
        packContent: [],
        compatibility: [],
        galleryImages: [],
        previewModelKey: '',
        previewModelName: '',
        isActive: true,
        commercialPrice: undefined,
        externalLinks: { unity: '', fab: '', cgtrader: '', artstation: '', superhive: '', youtube: [], sketchfab: '' }
    });

    // Discount Editing State
    const [isEditingDiscount, setIsEditingDiscount] = useState(false);
    const [currentDiscount, setCurrentDiscount] = useState<Partial<Discount>>({
        name: '',
        percentage: 0,
        isActive: true,
    });

    // Coupon Editing State
    const [isEditingCoupon, setIsEditingCoupon] = useState(false);
    const [currentCoupon, setCurrentCoupon] = useState<Partial<Coupon>>({
        code: '',
        discountPercentage: 0,
        maxUses: null,
        isActive: true,
    });

    const categories = ['Room', 'Level', 'Prop', 'Full Pack', 'Weapons'];

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [purchasesPage, setPurchasesPage] = useState(1);
    const [purchasesTotalPages, setPurchasesTotalPages] = useState(1);
    const [downloadsPage, setDownloadsPage] = useState(1);
    const [downloadsTotalPages, setDownloadsTotalPages] = useState(1);
    const itemsPerPage = 20;
    const reportingItemsPerPage = 30;

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // Reporting Filters
    const [purchaseMonth, setPurchaseMonth] = useState('');
    const [downloadSearch, setDownloadSearch] = useState({ title: '', email: '' });
    const [debouncedDownloadTitle, setDebouncedDownloadTitle] = useState('');
    const [debouncedDownloadEmail, setDebouncedDownloadEmail] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            if (page !== 1) setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedDownloadTitle(downloadSearch.title);
            if (downloadsPage !== 1) setDownloadsPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [downloadSearch.title]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedDownloadEmail(downloadSearch.email);
            if (downloadsPage !== 1) setDownloadsPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [downloadSearch.email]);

    useEffect(() => {
        if (purchasesPage !== 1) setPurchasesPage(1);
    }, [purchaseMonth]);

    const mapBackendProductToFrontend = (p: any): Product => ({
        id: p.id,
        name: p.title,
        price: p.price / 100,
        category: p.category,
        imageUrl: p.previewImageKey ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/storage/public/${p.previewImageKey}` : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
        description: p.description,
        tags: [p.category || 'Asset', '3D Model'],
        features: Array.isArray(p.features) ? p.features : (typeof p.features === 'string' && p.features.startsWith('[') ? JSON.parse(p.features) : []),
        packContent: Array.isArray(p.packContent) ? p.packContent : (typeof p.packContent === 'string' && p.packContent.startsWith('[') ? JSON.parse(p.packContent) : []),
        compatibility: Array.isArray(p.compatibility) ? p.compatibility : (typeof p.compatibility === 'string' && p.compatibility.startsWith('[') ? JSON.parse(p.compatibility) : []),
        technicalSpecs: p.technicalSpecs || {},
        externalLinks: p.externalLinks || {},
        discount: p.discount,
        fileKey: p.fileKey,
        fileName: p.fileName,
        galleryImages: Array.isArray(p.galleryImages) ? p.galleryImages : [],
        previewImageKey: p.previewImageKey,
        isActive: p.isActive,
        previewModelKey: p.previewModelKey,
        previewModelName: p.previewModelName,
        commercialPrice: p.commercialPrice ? p.commercialPrice / 100 : undefined
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = authService.getAccessToken() || '';
            const [backendProductsResponse, backendDiscounts, backendCoupons, backendOrders, backendLogs] = await Promise.all([
                productService.getAllProducts({
                    page,
                    limit: itemsPerPage,
                    search: debouncedSearchQuery,
                    showAll: true
                }),
                discountService.getAllDiscounts(token),
                couponService.getAllCoupons(token),
                orderService.getAllOrders(token, purchasesPage, reportingItemsPerPage, purchaseMonth),
                downloadsService.getDownloadLogs(token, downloadsPage, reportingItemsPerPage, debouncedDownloadTitle, debouncedDownloadEmail)
            ]);

            const mappedProducts: Product[] = (backendProductsResponse.data || []).map(mapBackendProductToFrontend);

            setProducts(mappedProducts);
            setTotalPages(Math.ceil((backendProductsResponse.total || 0) / itemsPerPage));
            setDiscounts(backendDiscounts);
            setCoupons(backendCoupons);
            setAllOrders(backendOrders.data);
            setPurchasesTotalPages(Math.ceil((backendOrders.total || 0) / reportingItemsPerPage));
            setDownloadLogs(backendLogs.data);
            setDownloadsTotalPages(Math.ceil((backendLogs.total || 0) / reportingItemsPerPage));
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, debouncedSearchQuery, purchasesPage, downloadsPage, purchaseMonth, debouncedDownloadTitle, debouncedDownloadEmail]);

    // Handle 'edit' query parameter
    useEffect(() => {
        const editId = searchParams.get('edit');
        if (editId && !isEditingProduct) {
            // First check in loaded products
            const productToEdit = products.find(p => p.id === editId);
            if (productToEdit) {
                handleEditProduct(productToEdit);
            } else if (products.length > 0) {
                // If not found but products are loaded, fetch it specifically
                productService.getProductById(editId).then(p => {
                    if (p) {
                        handleEditProduct(mapBackendProductToFrontend(p));
                    }
                }).catch(err => console.error('Failed to fetch product for editing:', err));
            }
        }
    }, [searchParams, products, isEditingProduct]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activeTab, isEditingProduct]);

    const handleCancelOrder = async (orderId: string) => {
        if (!window.confirm("Are you sure you want to cancel this purchase? This will immediately revoke the user's access to the purchased assets.")) {
            return;
        }

        try {
            const token = authService.getAccessToken() || '';
            await orderService.adminCancelOrder(orderId, token);
            toast.success("Order cancelled successfully!");
            fetchData(); // Refresh order history list
        } catch (error: any) {
            console.error("Failed to cancel order:", error);
            toast.error(error.response?.data?.message || "Failed to cancel order");
        }
    };

    // --- Product Handlers ---

    const handleEditProduct = (product: Product) => {
        setCurrentProduct({
            ...product,
            discountId: product.discount?.id || '', // Set initial selection
            galleryImages: Array.isArray(product.galleryImages) ? product.galleryImages : [],
            commercialPrice: product.commercialPrice
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
    const [selectedModel, setSelectedModel] = useState<File | null>(null);
    const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<FileList | null>(null);

    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [uploadingFileName, setUploadingFileName] = useState<string>('');

    const uploadChunkWithRetry = async (
        chunk: Blob,
        uploadUrl: string,
        contentType: string,
        maxRetries: number,
        onProgress: (loaded: number) => void
    ): Promise<void> => {
        let lastError: any = null;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await new Promise<void>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('PUT', uploadUrl, true);
                    xhr.setRequestHeader('Content-Type', contentType);

                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            onProgress(event.loaded);
                        }
                    };

                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve();
                        } else {
                            reject(new Error(`Server responded with status ${xhr.status}: ${xhr.statusText}`));
                        }
                    };

                    xhr.onerror = () => {
                        reject(new Error('Network error during chunk upload.'));
                    };

                    xhr.onabort = () => {
                        reject(new Error('Upload was aborted.'));
                    };

                    xhr.send(chunk);
                });
            } catch (error) {
                lastError = error;
                console.warn(`Chunk upload attempt ${attempt} failed:`, error);
                if (attempt < maxRetries) {
                    const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
                    await new Promise((res) => setTimeout(res, delay));
                }
            }
        }
        throw lastError || new Error('Failed to upload chunk after maximum retries.');
    };

    const uploadFile = async (file: File, isPublic: boolean): Promise<string> => {
        const token = authService.getAccessToken();
        let contentType = file.type;
        // Browser might not recognize .glb and return an empty string
        if (!contentType) {
            if (file.name.endsWith('.glb')) contentType = 'model/gltf-binary';
            else if (file.name.endsWith('.gltf')) contentType = 'model/gltf+json';
            else contentType = 'application/octet-stream';
        }

        const MULTIPART_MIN_SIZE = 10 * 1024 * 1024; // 10MB
        const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB (S3/R2 requires parts to be at least 5MB)
        const MAX_RETRIES = 5;

        setUploadingFileName(file.name);
        setUploadProgress(0);

        if (file.size < MULTIPART_MIN_SIZE) {
            // Standard Single-part PUT Upload
            try {
                // 1. Get signed upload URL
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/storage/generate-upload`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ contentType, isPublic })
                });

                if (!res.ok) throw new Error('Failed to get upload URL');

                const { uploadUrl, key } = await res.json();

                // 2. Upload file directly to R2 using XMLHttpRequest for high stability and progress tracking
                return await new Promise<string>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('PUT', uploadUrl, true);
                    xhr.setRequestHeader('Content-Type', contentType);

                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const percentComplete = Math.round((event.loaded / event.total) * 100);
                            setUploadProgress(percentComplete);
                            console.log(`Uploading ${file.name}: ${percentComplete}% completed`);
                        }
                    };

                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(key);
                        } else {
                            reject(new Error(`Failed to upload file to storage: ${xhr.statusText} (${xhr.status})`));
                        }
                    };

                    xhr.onerror = () => {
                        reject(new Error('Network connection error or block during file upload. Check your firewall/VPN/antivirus settings.'));
                    };

                    xhr.onabort = () => {
                        reject(new Error('Upload was aborted mid-transit by network/browser policy.'));
                    };

                    xhr.send(file);
                });
            } finally {
                setUploadProgress(null);
                setUploadingFileName('');
            }
        } else {
            // Multipart chunked upload for large files
            let uploadId = '';
            let key = '';

            try {
                // 1. Initiate Multipart
                const initRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/storage/initiate-multipart`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ contentType, isPublic })
                });

                if (!initRes.ok) throw new Error('Failed to initiate multipart upload');
                const initData = await initRes.json();
                uploadId = initData.uploadId;
                key = initData.key;

                const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
                let uploadedBytes = 0;

                for (let partNumber = 1; partNumber <= totalChunks; partNumber++) {
                    const start = (partNumber - 1) * CHUNK_SIZE;
                    const end = Math.min(start + CHUNK_SIZE, file.size);
                    const chunk = file.slice(start, end);

                    // Get signed URL for this part
                    const urlRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/storage/generate-multipart-url`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ key, uploadId, partNumber })
                    });

                    if (!urlRes.ok) throw new Error(`Failed to get signed URL for part ${partNumber}`);
                    const { uploadUrl } = await urlRes.json();

                    // Upload chunk
                    await uploadChunkWithRetry(
                        chunk,
                        uploadUrl,
                        contentType,
                        MAX_RETRIES,
                        (chunkLoaded) => {
                            const totalUploaded = uploadedBytes + chunkLoaded;
                            const percentComplete = Math.round((totalUploaded / file.size) * 100);
                            setUploadProgress(percentComplete);
                            console.log(`Uploading ${file.name}: ${percentComplete}% completed`);
                        }
                    );

                    uploadedBytes += chunk.size;
                }

                // 2. Complete Multipart
                const completeRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/storage/complete-multipart`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ key, uploadId })
                });

                if (!completeRes.ok) {
                    const errData = await completeRes.json().catch(() => ({}));
                    throw new Error(errData.message || 'Failed to complete multipart upload');
                }

                return key;

            } catch (error: any) {
                console.error('Multipart upload failed:', error);
                // Attempt to abort multipart upload to clean up storage
                if (uploadId && key) {
                    try {
                        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/storage/abort-multipart`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ key, uploadId })
                        });
                    } catch (abortErr) {
                        console.error('Failed to abort multipart upload:', abortErr);
                    }
                }
                throw new Error(`Multipart upload failed: ${error.message || error}`);
            } finally {
                setUploadProgress(null);
                setUploadingFileName('');
            }
        }
    };

    const handleSubmitProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        const saveOperation = async () => {
            const token = authService.getAccessToken();
            if (!token) throw new Error("No token");

            let fileKey = currentProduct.fileKey;
            let fileName = currentProduct.fileName;
            if (selectedFile) {
                fileKey = await uploadFile(selectedFile, false);
                fileName = selectedFile.name;
            }

            let previewImageKey = currentProduct.previewImageKey;

            if (selectedPreview) {
                previewImageKey = await uploadFile(selectedPreview, true);
            } else if (!previewImageKey && currentProduct.imageUrl?.includes('/files/')) {
                previewImageKey = currentProduct.imageUrl.split('/files/')[1];
            }

            let previewModelKey = currentProduct.previewModelKey;
            let previewModelName = currentProduct.previewModelName;
            if (selectedModel) {
                previewModelKey = await uploadFile(selectedModel, true);
                previewModelName = selectedModel.name;
            }

            let galleryImages = Array.isArray(currentProduct.galleryImages) ? [...currentProduct.galleryImages] : [];
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
                fileName: fileName,
                previewImageKey: previewImageKey,
                previewModelKey: previewModelKey,
                previewModelName: previewModelName,
                galleryImages: galleryImages,
                features: (currentProduct.features || []).filter(s => s.trim() !== ''),
                packContent: (currentProduct.packContent || []).filter(s => s.trim() !== ''),
                compatibility: (currentProduct.compatibility || []).filter(s => s.trim() !== ''),
                technicalSpecs: currentProduct.technicalSpecs || {},
                externalLinks: {
                    ...currentProduct.externalLinks,
                    youtube: Array.isArray(currentProduct.externalLinks?.youtube)
                        ? currentProduct.externalLinks.youtube.filter(s => s.trim() !== '')
                        : (currentProduct.externalLinks?.youtube ? [currentProduct.externalLinks.youtube] : [])
                },
                discountId: currentProduct.discountId || null,
                isActive: currentProduct.isActive !== undefined ? currentProduct.isActive : true,
                commercialPrice: currentProduct.commercialPrice ? Math.round(currentProduct.commercialPrice * 100) : null
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
            setSelectedModel(null);
            setSelectedGalleryFiles(null);
            setCurrentProduct({ 
                name: '', 
                description: '', 
                price: 0, 
                commercialPrice: undefined, 
                category: 'Prop', 
                imageUrl: '', 
                fileKey: '', 
                fileName: '', 
                features: [], 
                packContent: DEFAULT_PACK_CONTENT, 
                compatibility: DEFAULT_COMPATIBILITY, 
                discountId: '', 
                technicalSpecs: { polyCount: '', textures: '', rigged: false, animated: false }, 
                externalLinks: { unity: '', fab: '', cgtrader: '', artstation: '', superhive: '', youtube: [], sketchfab: '' }, 
                galleryImages: [], 
                previewModelKey: '', 
                previewModelName: '', 
                isActive: true 
            });
            fetchData();
        } catch (error) {
            console.error('Failed to save product:', error);
        }
    };

    const openNewProductForm = () => {
        setIsEditingProduct(true);
        setCurrentProduct({
            name: '',
            description: '',
            price: 0,
            commercialPrice: undefined,
            category: 'Prop',
            imageUrl: '',
            fileKey: '',
            fileName: '',
            features: [],
            packContent: DEFAULT_PACK_CONTENT,
            compatibility: DEFAULT_COMPATIBILITY,
            discountId: '',
            technicalSpecs: {
                polyCount: '',
                textures: '',
                rigged: false,
                animated: false
            },
            externalLinks: {
                unity: '',
                fab: '',
                cgtrader: '',
                artstation: '',
                superhive: '',
                youtube: [],
                sketchfab: ''
            },
            galleryImages: [],
            previewModelKey: '',
            previewModelName: '',
            isActive: true
        });
        setSelectedFile(null);
        setSelectedGalleryFiles(null);
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

    const handleYoutubeChange = (index: number, value: string) => {
        const youtube = currentProduct.externalLinks?.youtube;
        const array = Array.isArray(youtube) ? youtube : (youtube ? [youtube] : []);
        const newArray = [...array];
        newArray[index] = value;
        setCurrentProduct({
            ...currentProduct,
            externalLinks: {
                ...currentProduct.externalLinks,
                youtube: newArray
            }
        });
    };

    const addYoutubeItem = () => {
        const youtube = currentProduct.externalLinks?.youtube;
        const array = Array.isArray(youtube) ? youtube : (youtube ? [youtube] : []);
        setCurrentProduct({
            ...currentProduct,
            externalLinks: {
                ...currentProduct.externalLinks,
                youtube: [...array, '']
            }
        });
    };

    const removeYoutubeItem = (index: number) => {
        const youtube = currentProduct.externalLinks?.youtube;
        const array = Array.isArray(youtube) ? youtube : (youtube ? [youtube] : []);
        setCurrentProduct({
            ...currentProduct,
            externalLinks: {
                ...currentProduct.externalLinks,
                youtube: array.filter((_, i) => i !== index)
            }
        });
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

    // --- Coupon Handlers ---
    const handleToggleCoupon = async (id: string, currentStatus: boolean) => {
        try {
            const token = authService.getAccessToken();
            if (!token) return;
            await toast.promise(
                couponService.toggleCouponActive(id, token),
                {
                    loading: 'Toggling...',
                    success: `Coupon is now ${!currentStatus ? 'Active' : 'Inactive'}.`,
                    error: 'Failed to toggle.'
                }
            );
            fetchData();
        } catch (error) {
            console.error('Failed to toggle coupon:', error);
        }
    };

    const handleSubmitCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = authService.getAccessToken();
            if (!token) return;

            const payload = {
                code: currentCoupon.code || '',
                discountPercentage: Number(currentCoupon.discountPercentage),
                maxUses: currentCoupon.maxUses ? Number(currentCoupon.maxUses) : undefined,
            };

            await toast.promise(
                couponService.createCoupon(payload, token),
                {
                    loading: 'Saving coupon...',
                    success: 'Coupon created! 🎟️',
                    error: (err: any) => `Failed to save: ${err.response?.data?.message || err.message}`
                }
            );

            setIsEditingCoupon(false);
            setCurrentCoupon({ code: '', discountPercentage: 0, maxUses: null, isActive: true });
            fetchData();
        } catch (error) {
            console.error('Failed to save coupon:', error);
        }
    };

    const openNewCouponForm = () => {
        setCurrentCoupon({ code: '', discountPercentage: 0, maxUses: null, isActive: true });
        setIsEditingCoupon(true);
    };

    const handleSendNewsletter = async (testEmailOnly: boolean) => {
        try {
            const token = authService.getAccessToken();
            if (!token) {
                toast.error("Authentication token not found");
                return;
            }

            if (!newsletter.subject) {
                toast.error("Subject is required");
                return;
            }

            if (!newsletter.body) {
                toast.error("Message body is required");
                return;
            }

            if (testEmailOnly && !newsletter.testRecipient) {
                toast.error("Please enter a test recipient email");
                return;
            }

            setSendingBroadcast(true);

            const payload = {
                subject: newsletter.subject,
                body: newsletter.body,
                imageUrl: newsletter.imageUrl || undefined,
                featuredProductId: newsletter.featuredProductId || undefined,
                ctaText: newsletter.ctaText || undefined,
                ctaLink: newsletter.ctaLink || undefined,
                templateType: newsletter.templateType,
                testEmailOnly,
                testRecipient: testEmailOnly ? newsletter.testRecipient : undefined
            };

            const result = await broadcastService.sendBroadcast(token, payload);

            if (result.success) {
                if (testEmailOnly) {
                    toast.success(`Test email sent successfully! 🚀`);
                } else if (result.simulatedCount > 0) {
                    toast.success(`Newsletter processed for ${result.totalRecipients} customers! 📧 (${result.realSentCount} sent via Resend, ${result.simulatedCount} simulated locally)`);
                } else {
                    toast.success(`Newsletter blasted to ${result.sentCount} customers! 📧`);
                }
            } else {
                toast.error(result.message || "Failed to send newsletter");
            }
        } catch (error: any) {
            console.error("Failed to broadcast newsletter:", error);
            toast.error(`Broadcast failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setSendingBroadcast(false);
        }
    };

    useEffect(() => {
        const decoded = authService.getUserFromToken();
        if (decoded && decoded.email) {
            setNewsletter(prev => ({ ...prev, testRecipient: decoded.email }));
        }
    }, []);


    const isEditingAny = isEditingProduct || isEditingDiscount || isEditingCoupon;

    return (
        <div className="min-h-screen pt-10 pb-20 px-4 bg-gray-50">
            <Toaster position="top-right" reverseOrder={false} />
            <div className="max-w-6xl mx-auto">
                {!isEditingAny && (
                    <>
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
                    <button
                        onClick={() => setActiveTab('coupons')}
                        className={`px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'coupons' ? 'bg-[#8a7db3] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Coupons
                    </button>
                    <button
                        onClick={() => setActiveTab('purchases')}
                        className={`px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'purchases' ? 'bg-[#8a7db3] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Purchases
                    </button>
                    <button
                        onClick={() => setActiveTab('downloads')}
                        className={`px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'downloads' ? 'bg-[#8a7db3] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Downloads
                    </button>
                    <button
                        onClick={() => setActiveTab('newsletters')}
                        className={`px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'newsletters' ? 'bg-[#8a7db3] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Newsletters
                    </button>
                </div>

                {/* Products View */}
                {activeTab === 'products' && (
                    <>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                            <div className="flex-1 max-w-md relative">
                                <input
                                    type="text"
                                    placeholder="Search assets by name or description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border-2 border-gray-100 focus:border-[#8a7db3] rounded-2xl px-6 py-4 pr-12 font-bold outline-none transition-all shadow-sm"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                                        aria-label="Clear search"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={openNewProductForm}
                                className="bg-[#8a7db3] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:translate-y-[-4px] transition-all whitespace-nowrap"
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
                                            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Price</th>
                                            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Discount</th>
                                            <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {products.map(product => (
                                            <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <Link to={`/product/${product.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group/item">
                                                        <div className="w-12 h-12 rounded-xl border-2 border-white shadow-sm overflow-hidden shrink-0 group-hover/item:scale-105 transition-transform">
                                                            <ImageWithFallback src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-900 group-hover/item:text-[#8a7db3] transition-colors flex items-center gap-2">
                                                                {product.name}
                                                                <svg className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                </svg>
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 font-bold truncate max-w-[200px]">{product.description}</p>
                                                        </div>
                                                    </Link>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${product.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                                        {product.isActive ? 'Active' : 'Draft / Off'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {product.discount && product.discount.isActive ? (
                                                        <>
                                                            <p className="font-bold text-gray-400 line-through text-xs">${product.price.toFixed(2)}</p>
                                                            <p className="font-black text-[#8a7db3]">${calculateDiscountedPrice(product.price, product.discount.percentage).toFixed(2)}</p>
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
                                                        <Link
                                                            to={`/admin?edit=${product.id}`}
                                                            onClick={(e) => {
                                                                if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
                                                                    e.preventDefault();
                                                                    handleEditProduct(product);
                                                                }
                                                            }}
                                                            className="p-2 border-2 border-gray-100 rounded-xl text-gray-400 hover:text-[#8a7db3] hover:border-[#8a7db3]/30 transition-all flex items-center justify-center"
                                                            aria-label={`Edit ${product.name}`}
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteProduct(product.id)}
                                                            className="p-2 border-2 border-gray-100 rounded-xl text-gray-400 hover:text-pink-500 hover:border-pink-100 transition-all"
                                                            aria-label={`Delete ${product.name}`}
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

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="py-6 flex items-center justify-center gap-4 border-t-2 border-gray-100 bg-white">
                                        <button 
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-6 py-2 font-black text-xs uppercase tracking-widest bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 transition-all border-2 border-transparent"
                                        >
                                            Prev
                                        </button>
                                        <div className="font-bold text-gray-500 text-xs uppercase tracking-widest">
                                            Page {page} of {totalPages}
                                        </div>
                                        <button 
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="px-6 py-2 font-black text-xs uppercase tracking-widest bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 transition-all border-2 border-transparent"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
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

                {/* Coupons View */}
                {activeTab === 'coupons' && (
                    <>
                        <div className="flex justify-end mb-8">
                            <button
                                onClick={openNewCouponForm}
                                className="bg-[#8a7db3] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:translate-y-[-4px] transition-all"
                            >
                                Add New Coupon +
                            </button>
                        </div>

                        <div className="bg-white rounded-[3rem] shadow-xl border-4 border-white overflow-hidden">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b-2 border-gray-100">
                                        <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Code</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Discount</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Uses / Max</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                        <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {coupons.map(coupon => (
                                        <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-8 py-6 font-bold text-gray-800 uppercase">{coupon.code}</td>
                                            <td className="px-8 py-6 font-black text-[#8a7db3]">{coupon.discountPercentage}%</td>
                                            <td className="px-8 py-6 font-bold text-gray-500">{coupon.currentUses} / {coupon.maxUses === null ? '∞' : coupon.maxUses}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${coupon.isActive ? 'bg-[#a2c367]/20 text-[#a2c367]' : 'bg-gray-200 text-gray-500'}`}>
                                                    {coupon.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleToggleCoupon(coupon.id, coupon.isActive)} className="p-2 border-2 border-gray-100 rounded-xl text-gray-400 hover:text-[#8a7db3] transition-colors">
                                                        {coupon.isActive ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {coupons.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-bold">No coupons found. Create one!</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                </>
            )}

            {/* Purchases View */}
            {activeTab === 'purchases' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Purchase History</h2>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Track all sales and transactions</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Filter by Month:</label>
                            <input 
                                type="month" 
                                value={purchaseMonth}
                                onChange={(e) => setPurchaseMonth(e.target.value)}
                                className="bg-white border-2 border-gray-100 focus:border-[#8a7db3] rounded-xl px-4 py-2 font-bold outline-none transition-all shadow-sm"
                            />
                            {purchaseMonth && (
                                <button onClick={() => setPurchaseMonth('')} className="text-[#8a7db3] font-black text-[10px] uppercase tracking-widest hover:underline">Clear</button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] shadow-xl border-4 border-white overflow-hidden">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b-2 border-gray-100">
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Order ID</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Items</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Total</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {allOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-8 py-6 font-mono text-[10px] text-gray-400">{order.id.split('-')[0]}...</td>
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-gray-800">{order.user?.name || 'Guest'}</p>
                                            <p className="text-[10px] text-gray-400 font-bold">{order.user?.email}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                {order.items.map((item: any, idx: number) => {
                                                    const hasDiscount = !!(item.originalPrice && item.originalPrice > item.price);
                                                    return (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                                                                {item.name}
                                                                {item.licenseType === 'commercial' && (
                                                                    <span className="text-[8px] text-purple-600 font-extrabold ml-1.5 uppercase tracking-tighter">Commercial</span>
                                                                )}
                                                            </span>
                                                            <span className="text-[9px] font-black text-gray-900 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
                                                                {hasDiscount && (
                                                                    <span className="text-gray-400 line-through mr-1 font-bold">${item.originalPrice.toFixed(2)}</span>
                                                                )}
                                                                ${item.price.toFixed(2)}
                                                                {hasDiscount && (
                                                                    <span className="text-pink-500 font-extrabold ml-1">(-{item.discountPercentage}%)</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-black text-[#8a7db3] text-sm">${order.total.toFixed(2)}</p>
                                            {order.couponCode && (
                                                <div className="mt-1">
                                                    <span className="bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                                                        Coupon: {order.couponCode}
                                                    </span>
                                                    {order.couponDiscount && order.couponDiscount > 0 && (
                                                        <span className="block text-[8px] font-bold text-pink-500 mt-0.5">
                                                            -${(order.couponDiscount / 100).toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-[10px] font-bold text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    order.status === 'paid' || order.status === 'fulfilled'
                                                        ? 'bg-emerald-100 text-emerald-600'
                                                        : order.status === 'cancelled' || order.status === 'failed'
                                                            ? 'bg-gray-100 text-gray-400'
                                                            : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                    {order.status}
                                                </span>
                                                {order.status !== 'cancelled' && order.status !== 'failed' && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        className="text-[9px] font-black uppercase tracking-widest bg-pink-50 hover:bg-pink-100 text-pink-500 px-3 py-1 rounded-full border border-pink-100 active:scale-95 transition-all shadow-sm"
                                                        title="Cancel Order"
                                                    >
                                                        Cancel ✕
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {allOrders.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-12 text-center text-gray-400 font-bold">No orders found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination for Purchases */}
                        {purchasesTotalPages > 1 && (
                            <div className="py-6 flex items-center justify-center gap-4 border-t-2 border-gray-100 bg-white">
                                <button 
                                    onClick={() => setPurchasesPage(p => Math.max(1, p - 1))}
                                    disabled={purchasesPage === 1}
                                    className="px-6 py-2 font-black text-xs uppercase tracking-widest bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 transition-all"
                                >
                                    Prev
                                </button>
                                <div className="font-bold text-gray-500 text-xs uppercase tracking-widest">
                                    Page {purchasesPage} of {purchasesTotalPages}
                                </div>
                                <button 
                                    onClick={() => setPurchasesPage(p => Math.min(purchasesTotalPages, p + 1))}
                                    disabled={purchasesPage === purchasesTotalPages}
                                    className="px-6 py-2 font-black text-xs uppercase tracking-widest bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Downloads View */}
            {activeTab === 'downloads' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Download Logs</h2>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Monitor asset distribution</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Filter by Product Title..." 
                                    value={downloadSearch.title}
                                    onChange={(e) => setDownloadSearch({ ...downloadSearch, title: e.target.value })}
                                    className="bg-white border-2 border-gray-100 focus:border-[#8a7db3] rounded-xl px-4 py-2 text-xs font-bold outline-none transition-all shadow-sm w-48"
                                />
                            </div>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Filter by User Email..." 
                                    value={downloadSearch.email}
                                    onChange={(e) => setDownloadSearch({ ...downloadSearch, email: e.target.value })}
                                    className="bg-white border-2 border-gray-100 focus:border-[#8a7db3] rounded-xl px-4 py-2 text-xs font-bold outline-none transition-all shadow-sm w-48"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] shadow-xl border-4 border-white overflow-hidden">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b-2 border-gray-100">
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Product</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">User</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">IP Address</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Date & Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {downloadLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-gray-800">{log.product?.title || 'Unknown Product'}</p>
                                            <p className="text-[9px] text-[#8a7db3] font-black uppercase tracking-widest">{log.product?.category}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-gray-800">{log.user?.name || 'Guest'}</p>
                                            <p className="text-[10px] text-gray-400 font-bold">{log.user?.email}</p>
                                        </td>
                                        <td className="px-8 py-6 font-mono text-[10px] text-gray-500">{log.ipAddress || 'Unknown'}</td>
                                        <td className="px-8 py-6 text-[10px] font-bold text-gray-500">
                                            {new Date(log.downloadedAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {downloadLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-12 text-center text-gray-400 font-bold">No download logs found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination for Downloads */}
                        {downloadsTotalPages > 1 && (
                            <div className="py-6 flex items-center justify-center gap-4 border-t-2 border-gray-100 bg-white">
                                <button 
                                    onClick={() => setDownloadsPage(p => Math.max(1, p - 1))}
                                    disabled={downloadsPage === 1}
                                    className="px-6 py-2 font-black text-xs uppercase tracking-widest bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 transition-all"
                                >
                                    Prev
                                </button>
                                <div className="font-bold text-gray-500 text-xs uppercase tracking-widest">
                                    Page {downloadsPage} of {downloadsTotalPages}
                                </div>
                                <button 
                                    onClick={() => setDownloadsPage(p => Math.min(downloadsTotalPages, p + 1))}
                                    disabled={downloadsPage === downloadsTotalPages}
                                    className="px-6 py-2 font-black text-xs uppercase tracking-widest bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Newsletters View */}
            {activeTab === 'newsletters' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col lg:flex-row gap-8 items-stretch w-full">
                        {/* Column A: Controls Form (w-full lg:w-1/2) */}
                        <div className="w-full lg:w-1/2 flex flex-col justify-between bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-gray-100/50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-1">Mailing Campaigns</h2>
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-8">Design and broadcast premium newsletters</p>

                                {/* Template type selectors */}
                                <div className="mb-6">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Mailing Theme Template</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setNewsletter({ ...newsletter, templateType: 'announcement' })}
                                            className={`py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${newsletter.templateType === 'announcement' ? 'border-[#8a7db3] bg-[#8a7db3]/5 text-[#8a7db3]' : 'border-gray-100 hover:border-gray-200 text-gray-400'}`}
                                        >
                                            📢 News
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewsletter({ ...newsletter, templateType: 'new_release' })}
                                            className={`py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${newsletter.templateType === 'new_release' ? 'border-[#7c3aed] bg-[#7c3aed]/5 text-[#7c3aed]' : 'border-gray-100 hover:border-gray-200 text-gray-400'}`}
                                        >
                                            🚀 Release
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewsletter({ ...newsletter, templateType: 'promo' })}
                                            className={`py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${newsletter.templateType === 'promo' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-gray-100 hover:border-gray-200 text-gray-400'}`}
                                        >
                                            🏷️ Sale
                                        </button>
                                    </div>
                                </div>

                                {/* Subject / Title */}
                                <div className="mb-5">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Email Subject / Campaign Title</label>
                                    <input
                                        type="text"
                                        value={newsletter.subject}
                                        onChange={(e) => setNewsletter({ ...newsletter, subject: e.target.value })}
                                        className="w-full bg-gray-50/50 border-2 border-gray-100 focus:border-[#8a7db3] rounded-2xl px-5 py-3.5 text-xs font-bold outline-none transition-all shadow-sm"
                                        placeholder="Enter high-impact email subject..."
                                    />
                                </div>

                                {/* Image URL */}
                                <div className="mb-5">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Campaign Hero Image Banner (URL)</label>
                                    <input
                                        type="text"
                                        value={newsletter.imageUrl}
                                        onChange={(e) => setNewsletter({ ...newsletter, imageUrl: e.target.value })}
                                        className="w-full bg-gray-50/50 border-2 border-gray-100 focus:border-[#8a7db3] rounded-2xl px-5 py-3.5 text-xs font-bold outline-none transition-all shadow-sm"
                                        placeholder="Paste high-res image URL (e.g. Unsplash)..."
                                    />
                                </div>

                                {/* Featured Asset selector */}
                                <div className="mb-5">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Featured Catalogs Asset (Optional)</label>
                                    <select
                                        value={newsletter.featuredProductId}
                                        onChange={(e) => setNewsletter({ ...newsletter, featuredProductId: e.target.value })}
                                        className="w-full bg-gray-50/50 border-2 border-gray-100 focus:border-[#8a7db3] rounded-2xl px-5 py-3.5 text-xs font-bold outline-none transition-all shadow-sm"
                                    >
                                        <option value="">-- Select Asset Pack --</option>
                                        {products.map((prod) => (
                                            <option key={prod.id} value={prod.id}>
                                                {prod.name} (${prod.price.toFixed(2)})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* CTA details */}
                                <div className="grid grid-cols-2 gap-4 mb-5">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">CTA Button Text</label>
                                        <input
                                            type="text"
                                            value={newsletter.ctaText}
                                            onChange={(e) => setNewsletter({ ...newsletter, ctaText: e.target.value })}
                                            className="w-full bg-gray-50/50 border-2 border-gray-100 focus:border-[#8a7db3] rounded-2xl px-5 py-3.5 text-xs font-bold outline-none transition-all shadow-sm"
                                            placeholder="Explore Collection"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">CTA Link Destination</label>
                                        <input
                                            type="text"
                                            value={newsletter.ctaLink}
                                            onChange={(e) => setNewsletter({ ...newsletter, ctaLink: e.target.value })}
                                            className="w-full bg-gray-50/50 border-2 border-gray-100 focus:border-[#8a7db3] rounded-2xl px-5 py-3.5 text-xs font-bold outline-none transition-all shadow-sm"
                                            placeholder="http://localhost:3002/marketplace"
                                        />
                                    </div>
                                </div>

                                {/* Message Body */}
                                <div className="mb-6">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Mailing Message Body</label>
                                    <textarea
                                        rows={6}
                                        value={newsletter.body}
                                        onChange={(e) => setNewsletter({ ...newsletter, body: e.target.value })}
                                        className="w-full bg-gray-50/50 border-2 border-gray-100 focus:border-[#8a7db3] rounded-2xl px-5 py-3.5 text-xs font-medium outline-none transition-all shadow-sm resize-none"
                                        placeholder="Describe the campaign, coupon codes, and updates..."
                                    />
                                </div>
                            </div>

                            {/* Safe Double-Check Operations */}
                            <div className="border-t border-gray-100 pt-6 mt-6 space-y-4">
                                <div className="bg-gray-50/50 rounded-2xl p-4 border border-dashed border-gray-200">
                                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Test Campaign Recipient</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            placeholder="admin@mnostva.art"
                                            value={newsletter.testRecipient}
                                            onChange={(e) => setNewsletter({ ...newsletter, testRecipient: e.target.value })}
                                            className="flex-grow bg-white border-2 border-gray-100 focus:border-[#8a7db3] rounded-xl px-4 py-2 text-xs font-bold outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            disabled={sendingBroadcast}
                                            onClick={() => handleSendNewsletter(true)}
                                            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-black text-2xs uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-all shrink-0"
                                        >
                                            Send Test 🚀
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    disabled={sendingBroadcast}
                                    onClick={() => {
                                        if (window.confirm("ARE YOU ABSOLUTELY SURE?\n\nThis will instantly broadcast this email campaign to all registered Mnostva users in the database! This action is permanent and cannot be undone.")) {
                                            handleSendNewsletter(false);
                                        }
                                    }}
                                    className={`w-full py-4 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all ${
                                        newsletter.templateType === 'promo' 
                                            ? 'bg-gradient-to-r from-pink-500 to-rose-600 hover:shadow-pink-500/20' 
                                            : newsletter.templateType === 'new_release'
                                            ? 'bg-gradient-to-r from-purple-600 to-violet-700 hover:shadow-violet-600/20'
                                            : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:shadow-indigo-500/20'
                                    }`}
                                >
                                    {sendingBroadcast ? 'Blasting Campaign... 🔥' : 'Blast Newsletter to Customers 📧'}
                                </button>
                            </div>
                        </div>

                        {/* Column B: Interactive Live Preview (w-full lg:w-1/2) */}
                        <div className="w-full lg:w-1/2 flex flex-col bg-gray-950 rounded-[3rem] p-6 shadow-2xl relative border-4 border-gray-800 h-fit min-h-[700px] overflow-hidden justify-between">
                            {/* Browser Mock Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-6 shrink-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                                    <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
                                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                                </div>
                                <span className="text-[10px] text-gray-500 font-mono font-bold tracking-tight">live_preview_server.html</span>
                                <span className="w-6 inline-block"></span>
                            </div>

                            {/* Email Container Frame */}
                            <div className="flex-grow bg-[#f9fafb] rounded-[2rem] p-6 overflow-y-auto text-gray-800 shadow-inner flex flex-col justify-between max-h-[750px] min-h-[500px]">
                                <div>
                                    {/* Email Header */}
                                    <div className="text-center py-6 border-b border-gray-100 bg-[#fdfdfd] rounded-t-2xl mb-6">
                                        <div className="font-black text-lg text-gray-900 uppercase tracking-widest">
                                            Mnostva<span className="text-[#8a7db3]">.art</span>
                                        </div>
                                    </div>

                                    {/* Campaign Badge and Headline */}
                                    <div className="text-left mb-6">
                                        <span className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${
                                            newsletter.templateType === 'promo'
                                                ? 'bg-pink-100 text-pink-600'
                                                : newsletter.templateType === 'new_release'
                                                ? 'bg-purple-100 text-purple-600'
                                                : 'bg-indigo-100 text-indigo-600'
                                        }`}>
                                            {newsletter.templateType === 'promo' && 'SALE / SPECIAL OFFERS 🏷️'}
                                            {newsletter.templateType === 'new_release' && 'NEW RELEASE 🚀'}
                                            {newsletter.templateType === 'announcement' && 'ANNOUNCEMENT 📢'}
                                        </span>
                                        <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-tight uppercase tracking-tight mt-2">
                                            {newsletter.subject || 'Campaign Subject line'}
                                        </h1>
                                    </div>

                                    {/* Hero Banner */}
                                    {newsletter.imageUrl && (
                                        <div className="mb-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                                            <img src={newsletter.imageUrl} alt="Hero Banner" className="w-full max-h-56 object-cover" />
                                        </div>
                                    )}

                                    {/* Email Content Body */}
                                    <div className="text-xs text-gray-600 font-medium leading-relaxed mb-6 whitespace-pre-line">
                                        {newsletter.body || 'Email content body goes here...'}
                                    </div>

                                    {/* Featured product live card rendering */}
                                    {(() => {
                                        if (!newsletter.featuredProductId) return null;
                                        const prod = products.find(p => p.id === newsletter.featuredProductId);
                                        if (!prod) return null;

                                        const hasDiscount = prod.discount && prod.discount.isActive;
                                        const originalPrice = hasDiscount ? prod.price : null;
                                        const finalPrice = hasDiscount 
                                            ? prod.price * (1 - prod.discount.percentage / 100) 
                                            : prod.price;

                                        const themeColor = newsletter.templateType === 'promo' 
                                            ? '#db2777' 
                                            : newsletter.templateType === 'new_release' 
                                            ? '#7c3aed' 
                                            : '#8a7db3';

                                        return (
                                            <div className="bg-white border-2 border-gray-100 rounded-3xl p-5 shadow-sm my-6 text-left">
                                                <div className="text-[8px] font-black uppercase tracking-widest mb-2" style={{ color: themeColor }}>Featured Stylized Asset Pack</div>
                                                <div className="flex flex-col gap-4">
                                                    <div className="w-full rounded-2xl overflow-hidden relative shadow-inner aspect-[16/9] border border-gray-50">
                                                        <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                                                        {hasDiscount && (
                                                            <span className="absolute top-3 right-3 bg-pink-500 text-white font-black text-[8px] uppercase tracking-tighter px-2 py-0.5 rounded-md shadow-md">
                                                                -{prod.discount.percentage}% OFF
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="bg-gray-100 text-gray-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">{prod.category}</span>
                                                        <h3 className="font-black text-gray-900 text-sm md:text-base uppercase tracking-tight mt-2 leading-tight">{prod.name}</h3>
                                                        <div className="font-black text-gray-900 text-base mt-2 flex items-center gap-1.5">
                                                            {hasDiscount && (
                                                                <span className="text-gray-400 line-through text-xs font-bold">${originalPrice.toFixed(2)}</span>
                                                            )}
                                                            <span>${finalPrice.toFixed(2)}</span>
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            className="w-full text-center py-2.5 mt-4 text-white font-black text-2xs uppercase tracking-widest rounded-full shadow-md"
                                                            style={{ backgroundColor: themeColor }}
                                                        >
                                                            View on Marketplace 🎨
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Action button */}
                                    {newsletter.ctaText && newsletter.ctaLink && (
                                        <div className="text-center my-6">
                                            <a 
                                                href={newsletter.ctaLink} 
                                                onClick={(e) => e.preventDefault()} 
                                                className={`inline-block px-8 py-3.5 text-white font-black text-2xs uppercase tracking-widest rounded-full shadow-lg ${
                                                    newsletter.templateType === 'promo'
                                                        ? 'bg-pink-500 hover:shadow-pink-500/20'
                                                        : newsletter.templateType === 'new_release'
                                                        ? 'bg-purple-600 hover:shadow-purple-600/20'
                                                        : 'bg-indigo-500 hover:shadow-indigo-500/20'
                                                }`}
                                            >
                                                {newsletter.ctaText}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Email Footer */}
                                <div className="text-center py-6 border-t border-gray-100 bg-[#fafafa] rounded-b-2xl mt-8 text-[9px] text-gray-400 font-bold shrink-0">
                                    <p className="mb-1">© 2021 Mnostva Art Marketplace. All rights reserved.</p>
                                    <p>You are receiving this because you registered at mnostva.art.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}

                {/* Product Form */}
                {isEditingProduct && (
                    <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-xl relative flex flex-col h-fit animate-in fade-in slide-in-from-bottom-4 duration-500 mb-10">
                        {uploadProgress !== null && (
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-[3rem] z-50 flex flex-col items-center justify-center p-10 animate-in fade-in duration-200">
                                <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-gray-100 shadow-xl flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-2xl bg-[#8a7db3]/10 flex items-center justify-center text-[#8a7db3] mb-6 animate-pulse">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tighter text-center">Uploading Asset</h3>
                                    <p className="text-xs font-bold text-gray-500 mb-6 truncate max-w-xs text-center">{uploadingFileName}</p>
                                    
                                    <div className="w-full bg-gray-100 rounded-full h-3 mb-3 overflow-hidden">
                                        <div 
                                            className="bg-[#8a7db3] h-full rounded-full transition-all duration-300 ease-out" 
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between w-full text-xs font-black text-gray-700">
                                        <span>Progress</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-10 border-b-2 border-gray-100 pb-8">
                            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter shrink-0">
                                {currentProduct.id ? 'Edit Asset' : 'New Asset'}
                            </h2>
                            <button
                                onClick={() => setIsEditingProduct(false)}
                                className="bg-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-all w-14 h-14 rounded-full flex items-center justify-center shadow-sm"
                                aria-label="Close form"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitProduct} className="space-y-10 pb-10">
                                {/* Title & Price */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Title</label>
                                        <input required type="text" value={currentProduct.name} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Standard Price ($)</label>
                                        <input required type="number" step="0.01" value={currentProduct.price} onChange={e => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) })} className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Commercial Price ($)</label>
                                        <input type="number" step="0.01" value={currentProduct.commercialPrice || ''} onChange={e => setCurrentProduct({ ...currentProduct, commercialPrice: parseFloat(e.target.value) || undefined })} placeholder="Optional" className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none transition-all" />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Description</label>
                                    <div id="description-quill-bounds" className="bg-white rounded-2xl overflow-hidden border-4 border-transparent focus-within:border-[#8a7db3] transition-all">
                                        <ReactQuill
                                            theme="snow"
                                            value={currentProduct.description}
                                            onChange={content => setCurrentProduct({ ...currentProduct, description: content })}
                                            modules={{
                                                toolbar: [
                                                    ['bold', 'italic', 'underline'],
                                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                    ['link'],
                                                    ['clean']
                                                ],
                                            }}
                                            className="min-h-[200px] [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:max-h-[300px] [&_.ql-editor]:overflow-y-auto"
                                            bounds="#description-quill-bounds"
                                        />
                                    </div>
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
                                    <div className="md:col-span-2">
                                        <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4 text-emerald-500">Preview 3D Model (.glb / .gltf)</label>
                                        <input
                                            type="file"
                                            accept=".glb,.gltf"
                                            onChange={e => setSelectedModel(e.target.files ? e.target.files[0] : null)}
                                            className="w-full bg-emerald-50 border-4 border-transparent focus:border-emerald-300 rounded-2xl px-6 py-4 font-bold outline-none transition-all text-emerald-700"
                                        />
                                        {currentProduct.previewModelName ? (
                                            <p className="text-xs text-emerald-500 mt-2 ml-4 font-bold">Current: {currentProduct.previewModelName}</p>
                                        ) : currentProduct.previewModelKey && (
                                            <p className="text-xs text-emerald-400 mt-2 ml-4">Current Key: {currentProduct.previewModelKey.split('/').pop()}</p>
                                        )}
                                    </div>
                                    <div className="md:col-span-2">
                                        <div className="flex justify-between items-center mb-3 px-4">
                                            <label className="block text-[11px] font-black text-red-500 uppercase tracking-widest">YouTube Video URLs (For Gallery)</label>
                                            <button type="button" onClick={addYoutubeItem} className="text-red-500 font-black text-xs uppercase tracking-widest hover:underline">+ Add Link</button>
                                        </div>
                                        <div className="space-y-3 pl-2">
                                            {(Array.isArray(currentProduct.externalLinks?.youtube) 
                                                ? currentProduct.externalLinks.youtube 
                                                : (currentProduct.externalLinks?.youtube ? [currentProduct.externalLinks.youtube] : [])
                                            ).map((item, index) => (
                                                <div key={index} className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <input 
                                                        type="text" 
                                                        placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..." 
                                                        value={item} 
                                                        onChange={(e) => handleYoutubeChange(index, e.target.value)} 
                                                        className="w-full bg-red-50 border-2 border-transparent focus:border-red-300 rounded-xl px-4 py-3 font-bold outline-none text-sm text-red-700" 
                                                    />
                                                    <button type="button" onClick={() => removeYoutubeItem(index)} className="p-2 text-red-300 hover:text-red-500 font-bold">×</button>
                                                </div>
                                            ))}
                                            {(!currentProduct.externalLinks?.youtube || 
                                              (Array.isArray(currentProduct.externalLinks.youtube) && currentProduct.externalLinks.youtube.length === 0)) && (
                                                <p className="text-center text-gray-300 text-[10px] font-bold py-2">No YouTube videos added yet. Click "+ Add Link" to add one!</p>
                                            )}
                                        </div>
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
                                        {currentProduct.fileName ? (
                                            <p className="text-xs text-[#8a7db3] mt-2 ml-4 font-bold">Current: {currentProduct.fileName}</p>
                                        ) : currentProduct.fileKey && (
                                            <p className="text-xs text-gray-400 mt-2 ml-4">Current Key: {currentProduct.fileKey}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Status & Discount Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Poly Count</label>
                                            <input type="text" placeholder="e.g. 15k Triangles" value={currentProduct.technicalSpecs?.polyCount || ''} onChange={e => setCurrentProduct({ ...currentProduct, technicalSpecs: { ...currentProduct.technicalSpecs, polyCount: e.target.value } })} className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:bg-white border-2 border-transparent focus:border-[#8a7db3] transition-all" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Textures</label>
                                            <input type="text" placeholder="e.g. 4K, PBR" value={currentProduct.technicalSpecs?.textures || ''} onChange={e => setCurrentProduct({ ...currentProduct, technicalSpecs: { ...currentProduct.technicalSpecs, textures: e.target.value } })} className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:bg-white border-2 border-transparent focus:border-[#8a7db3] transition-all" />
                                        </div>
                                    </div>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 text-sm font-bold text-gray-600"><input type="checkbox" checked={currentProduct.technicalSpecs?.rigged || false} onChange={e => setCurrentProduct({ ...currentProduct, technicalSpecs: { ...currentProduct.technicalSpecs, rigged: e.target.checked } })} /> Rigged</label>
                                        <label className="flex items-center gap-2 text-sm font-bold text-gray-600"><input type="checkbox" checked={currentProduct.technicalSpecs?.animated || false} onChange={e => setCurrentProduct({ ...currentProduct, technicalSpecs: { ...currentProduct.technicalSpecs, animated: e.target.checked } })} /> Animated</label>
                                    </div>
                                </div>
                                <div className="space-y-6 pt-4 border-t-2 border-gray-100">
                                    <h3 className="font-black text-gray-400 uppercase tracking-widest text-xs">External Store Links & Previews</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black text-sky-500 uppercase tracking-widest mb-2 ml-4">Sketchfab Model ID / URL (For 3D Preview)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 1234567890abcdef1234567890abcdef or full URL"
                                                value={currentProduct.externalLinks?.sketchfab || ''}
                                                onChange={e => setCurrentProduct({ ...currentProduct, externalLinks: { ...currentProduct.externalLinks, sketchfab: e.target.value } })}
                                                className="w-full bg-sky-50 border-2 border-transparent focus:border-sky-300 rounded-xl px-4 py-3 font-bold outline-none text-sky-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-4">Unity Asset Store</label>
                                            <input
                                                type="text"
                                                value={currentProduct.externalLinks?.unity || ''}
                                                onChange={e => setCurrentProduct({ ...currentProduct, externalLinks: { ...currentProduct.externalLinks, unity: e.target.value } })}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#8a7db3] rounded-xl px-4 py-3 font-bold outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-4">Fab Store</label>
                                            <input
                                                type="text"
                                                value={currentProduct.externalLinks?.fab || ''}
                                                onChange={e => setCurrentProduct({ ...currentProduct, externalLinks: { ...currentProduct.externalLinks, fab: e.target.value } })}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#8a7db3] rounded-xl px-4 py-3 font-bold outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-4">CGTrader</label>
                                            <input
                                                type="text"
                                                value={currentProduct.externalLinks?.cgtrader || ''}
                                                onChange={e => setCurrentProduct({ ...currentProduct, externalLinks: { ...currentProduct.externalLinks, cgtrader: e.target.value } })}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#8a7db3] rounded-xl px-4 py-3 font-bold outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-4">ArtStation</label>
                                            <input
                                                type="text"
                                                value={currentProduct.externalLinks?.artstation || ''}
                                                onChange={e => setCurrentProduct({ ...currentProduct, externalLinks: { ...currentProduct.externalLinks, artstation: e.target.value } })}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#8a7db3] rounded-xl px-4 py-3 font-bold outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-4">Superhive</label>
                                            <input
                                                type="text"
                                                value={currentProduct.externalLinks?.superhive || ''}
                                                onChange={e => setCurrentProduct({ ...currentProduct, externalLinks: { ...currentProduct.externalLinks, superhive: e.target.value } })}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#8a7db3] rounded-xl px-4 py-3 font-bold outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 border-t-2 border-gray-100">
                                    <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Product Status</label>
                                    <div className="flex items-center gap-4 ml-4">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentProduct({ ...currentProduct, isActive: true })}
                                            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${currentProduct.isActive ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                        >
                                            Active (On)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentProduct({ ...currentProduct, isActive: false })}
                                            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${!currentProduct.isActive ? 'bg-gray-800 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                        >
                                            Inactive (Off)
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-gray-400 font-bold mt-2 ml-4">Inactive products are hidden from the marketplace and downloads are blocked.</p>
                                </div>

                                <button type="submit" className="w-full bg-[#8a7db3] text-white py-6 rounded-[1.5rem] font-black text-xl shadow-xl hover:translate-y-[-4px] transition-all uppercase tracking-widest mt-8">Save Asset Magic 🪄</button>
                            </form>
                    </div>
                )}

                {/* Discount Form */}
                {isEditingDiscount && (
                    <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-xl relative flex flex-col h-fit animate-in fade-in slide-in-from-bottom-4 duration-500 mb-10">
                        <div className="flex justify-between items-start mb-10 border-b-2 border-gray-100 pb-8">
                            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter shrink-0">
                                {currentDiscount.id ? 'Edit Discount' : 'New Discount'}
                            </h2>
                            <button 
                                onClick={() => setIsEditingDiscount(false)} 
                                className="bg-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-all w-14 h-14 rounded-full flex items-center justify-center shadow-sm"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmitDiscount} className="space-y-8 pb-10">
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
                )}

                {/* Coupon Form */}
                {isEditingCoupon && (
                    <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-xl relative flex flex-col h-fit animate-in fade-in slide-in-from-bottom-4 duration-500 mb-10">
                        <div className="flex justify-between items-start mb-10 border-b-2 border-gray-100 pb-8">
                            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter shrink-0">
                                New Coupon
                            </h2>
                            <button 
                                onClick={() => setIsEditingCoupon(false)} 
                                className="bg-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-all w-14 h-14 rounded-full flex items-center justify-center shadow-sm"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmitCoupon} className="space-y-8 pb-10">
                            <div>
                                <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Coupon Code</label>
                                <input required type="text" value={currentCoupon.code} onChange={e => setCurrentCoupon({ ...currentCoupon, code: e.target.value.toUpperCase() })} className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none uppercase" placeholder="e.g. SUMMER20" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Discount (%)</label>
                                <input required type="number" min="1" max="100" value={currentCoupon.discountPercentage} onChange={e => setCurrentCoupon({ ...currentCoupon, discountPercentage: parseFloat(e.target.value) })} className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Max Uses (Leave empty for unlimited)</label>
                                <input type="number" min="1" value={currentCoupon.maxUses || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, maxUses: e.target.value ? parseInt(e.target.value) : null })} className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none" placeholder="∞" />
                            </div>
                            <button type="submit" className="w-full bg-[#8a7db3] text-white py-6 rounded-[1.5rem] font-black text-xl shadow-xl hover:translate-y-[-4px] transition-all uppercase tracking-widest mt-4">Create Coupon 🎫</button>
                        </form>
                    </div>
                )}

            </div>
        </div >
    );
};

export default AdminPage;
