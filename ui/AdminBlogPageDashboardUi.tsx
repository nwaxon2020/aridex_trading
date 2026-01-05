"use client";

import { useState, useEffect, useRef } from 'react';
import { db, storage } from '@/lib/firebaseconfig';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  FaSave, 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaPhone,
  FaEnvelope,
  FaTimes,
  FaUpload,
  FaImage,
  FaVideo,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHome,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaCheck,
  FaPlay
} from "react-icons/fa";
import { useRouter } from 'next/navigation';

// Firebase Constants
const BLOG_COLLECTION = 'blog_properties';

// Types
interface PropertyFeature {
  id: string;
  text: string;
}

interface Property {
  id?: string;
  title: string;
  location: string;
  price: string;
  negotiable: boolean;
  type: string;
  customType?: string; // For "Others" option
  bedrooms: number;
  bathrooms: number;
  area: string;
  images: string[];
  videoUrl?: string;
  description: string;
  features: PropertyFeature[];
  contact: {
    phone: string;
    email: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export default function AdminBlogPageDashboard() {
    // State for properties
    const [properties, setProperties] = useState<Property[]>([]);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [newFeature, setNewFeature] = useState('');
    const [newImage, setNewImage] = useState('');
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    
    // NEW STATE for individual image uploads
    const [individualImageUploading, setIndividualImageUploading] = useState(false);

    // UI States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    // Delete Confirmation Modal States
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
    const [deleting, setDeleting] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Property types
    const propertyTypes = [
        'Villa',
        'Apartment',
        'Commercial',
        'Land',
        'Estate',
        'House',
        'Office',
        'Shop',
        'Warehouse',
        'Farm',
        'Others' // New option
    ];

    // Load data on component mount
    useEffect(() => {
        loadProperties();
    }, []);

    // Firebase Functions
    const getProperties = async (): Promise<Property[]> => {
        try {
        const querySnapshot = await getDocs(collection(db, BLOG_COLLECTION));
        const propertiesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Property[];
        
        // Sort by creation date (newest first)
        return propertiesData.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
        });
        } catch (error) {
        console.error('Error getting properties:', error);
        return [];
        }
    };

    const uploadFileToFirebase = async (file: File, folder: string): Promise<string | null> => {
        try {
        const fileName = `${folder}_${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `${folder}/${fileName}`);
        
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
        } catch (error) {
        console.error(`Error uploading ${folder}:`, error);
        return null;
        }
    };

    const saveProperty = async (property: Property, imageFiles?: File[], videoFile?: File): Promise<string | null> => {
        try {
        let propertyId = property.id;
        let images = [...property.images];
        let videoUrl = property.videoUrl;
        
        // Upload new images if provided (only for bulk uploads on save)
        if (imageFiles && imageFiles.length > 0) {
            setUploading(true);
            const uploadedImages = await Promise.all(
            imageFiles.map(file => uploadFileToFirebase(file, 'blog-images'))
            );
            images = [...images, ...uploadedImages.filter(url => url !== null) as string[]];
        }
        
        // Upload video if provided
        if (videoFile) {
            const uploadedUrl = await uploadFileToFirebase(videoFile, 'blog-videos');
            if (uploadedUrl) {
            videoUrl = uploadedUrl;
            }
        }
        
        const propertyData: any = {
            ...property,
            images: images,
            videoUrl: videoUrl || null,
            updatedAt: Timestamp.now(),
        };
        
        if (propertyId) {
            const docRef = doc(db, BLOG_COLLECTION, propertyId);
            await updateDoc(docRef, propertyData);
        } else {
            const newDocRef = doc(collection(db, BLOG_COLLECTION));
            propertyId = newDocRef.id;
            propertyData.createdAt = Timestamp.now();
            await setDoc(newDocRef, propertyData);
        }
        
        return propertyId;
        } catch (error) {
        console.error('Error saving property:', error);
        return null;
        } finally {
        setUploading(false);
        }
    };

    const deleteProperty = async (propertyId: string): Promise<boolean> => {
        try {
        await deleteDoc(doc(db, BLOG_COLLECTION, propertyId));
        return true;
        } catch (error) {
        console.error('Error deleting property:', error);
        return false;
        }
    };

    const loadProperties = async () => {
        setLoading(true);
        try {
        const propertiesData = await getProperties();
        setProperties(propertiesData);
        } catch (error) {
        setErrorMessage('Failed to load properties');
        } finally {
        setLoading(false);
        }
    };

    // NEW FUNCTION: Handle individual image upload
    const handleAddImage = async (file: File) => {
        if (!editingProperty) return;
        
        setIndividualImageUploading(true);
        try {
            const imageUrl = await uploadFileToFirebase(file, 'blog-images');
            if (imageUrl) {
                // Add image to editing property immediately
                setEditingProperty({
                    ...editingProperty,
                    images: [...editingProperty.images, imageUrl]
                });
                
                // Show success message
                setSuccessMessage('Image uploaded successfully!');
                setTimeout(() => setSuccessMessage(''), 2000);
                
                // Clear previews
                setImagePreviews([]);
                setSelectedImageFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            setErrorMessage('Failed to upload image');
            setTimeout(() => setErrorMessage(''), 3000);
        } finally {
            setIndividualImageUploading(false);
        }
    };

    // Handle image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
        // Create previews for all selected files
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
            setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
        
        // Store files for batch upload
        setSelectedImageFile(files[0]);
        }
    };

    // Handle video selection
    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        setSelectedVideoFile(file);
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setVideoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        }
    };

    // Save property (main save)
    const handleSaveProperty = async () => {
        if (!editingProperty) return;
        
        setSaving(true);
        setSuccessMessage('');
        setErrorMessage('');
        
        try {
        const imageFiles = selectedImageFile ? [selectedImageFile] : undefined;
        const propertyId = await saveProperty(editingProperty, imageFiles, selectedVideoFile || undefined);
        
        if (propertyId) {
            // Reset states
            setSelectedImageFile(null);
            setSelectedVideoFile(null);
            setImagePreviews([]);
            setVideoPreview(null);
            setNewFeature('');
            setNewImage('');
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (videoInputRef.current) videoInputRef.current.value = '';
            
            await loadProperties();
            setEditingProperty(null);
            setSuccessMessage('Property saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
        } catch (error) {
        setErrorMessage('Failed to save property');
        } finally {
        setSaving(false);
        }
    };

    // Open delete confirmation modal
    const openDeleteModal = (property: Property) => {
        setPropertyToDelete(property);
        setDeleteModalOpen(true);
    };

    // Close delete confirmation modal
    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setPropertyToDelete(null);
    };

    // Confirm and delete property
    const confirmDelete = async () => {
        if (!propertyToDelete?.id) return;
        
        setDeleting(true);
        try {
        const success = await deleteProperty(propertyToDelete.id);
        if (success) {
            await loadProperties();
            setSuccessMessage('Property deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
            closeDeleteModal();
        } else {
            setErrorMessage('Failed to delete property');
            closeDeleteModal();
        }
        } catch (error) {
        setErrorMessage('Error deleting property');
        closeDeleteModal();
        } finally {
        setDeleting(false);
        }
    };

    // Add new feature
    const addFeature = () => {
        if (!editingProperty || !newFeature.trim()) return;
        
        const feature: PropertyFeature = {
        id: Date.now().toString(),
        text: newFeature.trim()
        };
        
        setEditingProperty({
        ...editingProperty,
        features: [...editingProperty.features, feature]
        });
        setNewFeature('');
    };

    // Remove feature
    const removeFeature = (id: string) => {
        if (!editingProperty) return;
        
        setEditingProperty({
        ...editingProperty,
        features: editingProperty.features.filter(f => f.id !== id)
        });
    };

    // Add image URL
    const addImageUrl = () => {
        if (!editingProperty || !newImage.trim()) return;
        
        setEditingProperty({
        ...editingProperty,
        images: [...editingProperty.images, newImage.trim()]
        });
        setNewImage('');
    };

    // Remove image
    const removeImage = (index: number) => {
        if (!editingProperty) return;
        
        const newImages = [...editingProperty.images];
        newImages.splice(index, 1);
        setEditingProperty({
        ...editingProperty,
        images: newImages
        });
    };

    // Remove video
    const removeVideo = () => {
        if (!editingProperty) return;
        
        setEditingProperty({
        ...editingProperty,
        videoUrl: ''
        });
        setSelectedVideoFile(null);
        setVideoPreview(null);
        if (videoInputRef.current) {
        videoInputRef.current.value = '';
        }
    };

    // Add new property
    const addNewProperty = () => {
        setEditingProperty({
        title: '',
        location: '',
        price: '',
        negotiable: true,
        type: 'Villa',
        customType: '',
        bedrooms: 0,
        bathrooms: 0,
        area: '',
        images: [],
        description: '',
        features: [],
        contact: {
            phone: '+2349136552111',
            email: 'abidextradingnigltd@gmail.com'
        }
        });
        setSelectedImageFile(null);
        setSelectedVideoFile(null);
        setImagePreviews([]);
        setVideoPreview(null);
        setNewFeature('');
        setNewImage('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (videoInputRef.current) videoInputRef.current.value = '';
    };

    // Handle property type change
    const handleTypeChange = (value: string) => {
        if (!editingProperty) return;
        
        setEditingProperty({
        ...editingProperty,
        type: value,
        customType: value === 'Others' ? editingProperty.customType || '' : ''
        });
    };

    // Loading state
    if (loading) {
        return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
            </div>
        </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div
                onClick={() => {
                    if (window.history.length > 1) {
                    router.back();
                    } else {
                    router.push("/");
                    }
                }}
                className="inline cursor-pointer px-4 py-2 border text-gray-400 rounded-lg hover:text-white hover:border-white transition"
                >
                ← Back
                </div>
                <h1 className="mt-8 text-xl md:text-3xl font-bold mb-2">Blog Properties Dashboard</h1>
                <p className="text-sm md:text-base text-gray-400">Manage properties for the blog/properties page</p>
            </div>

            {/* Messages */}
            {successMessage && (
                <div className="text-sm p-4 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                {successMessage}
                </div>
            )}
            
            {errorMessage && (
                <div className="text-sm p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2">
                <FaExclamationTriangle className="text-red-500" />
                {errorMessage}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && propertyToDelete && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-2">
                <div className="bg-gray-800 rounded-2xl px-3 py-6 md:p-6 max-w-md w-full">
                    <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                        <FaExclamationTriangle className="text-2xl text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Delete Property</h3>
                    <p className="text-gray-400">
                        Are you sure you want to delete "{propertyToDelete.title}"? This action cannot be undone.
                    </p>
                    </div>
                    
                    <div className="flex gap-4">
                    <button
                        onClick={closeDeleteModal}
                        className="flex-1 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition"
                        disabled={deleting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmDelete}
                        disabled={deleting}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                        <FaTrash />
                        {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                    </div>
                </div>
                </div>
            )}

            {/* ADD/EDIT PROPERTY SECTION */}
            <div className="bg-gray-800/30 rounded-2xl px-3 py-6 md:p-6 border border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-3">
                    <FaHome className="text-blue-400" />
                    {editingProperty?.id ? 'Edit Property' : 'Add New Property'}
                </h2>
                
                <div className="flex gap-3">
                    {!editingProperty && (
                    <button
                        onClick={addNewProperty}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition"
                    >
                        <FaPlus />
                        Add Property
                    </button>
                    )}
                </div>
                </div>

                {/* Property Form */}
                {editingProperty && (
                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                    <h3 className="text-lg font-bold mb-2">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-2">Property Title</label>
                        <input
                            type="text"
                            value={editingProperty.title}
                            onChange={(e) => setEditingProperty({...editingProperty, title: e.target.value})}
                            placeholder="Luxury Villa with Ocean View"
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                        />
                        </div>
                        
                        <div>
                        <label className="block text-sm font-medium mb-2">Location</label>
                        <input
                            type="text"
                            value={editingProperty.location}
                            onChange={(e) => setEditingProperty({...editingProperty, location: e.target.value})}
                            placeholder="Lekki, Lagos"
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                        />
                        </div>
                        
                        <div>
                        <label className="block text-sm font-medium mb-2">Price</label>
                        <input
                            type="text"
                            value={editingProperty.price}
                            onChange={(e) => setEditingProperty({...editingProperty, price: e.target.value})}
                            placeholder="$850,000"
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                        />
                        </div>
                        
                        <div>
                        <label className="block text-sm font-medium mb-2">Property Type</label>
                        <select
                            value={editingProperty.type}
                            onChange={(e) => handleTypeChange(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                        >
                            {propertyTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        
                        {/* Show custom type input when "Others" is selected */}
                        {editingProperty.type === 'Others' && (
                            <div className="mt-2">
                            <label className="block text-sm font-medium mb-2">Custom Property Type</label>
                            <input
                                type="text"
                                value={editingProperty.customType || ''}
                                onChange={(e) => setEditingProperty({...editingProperty, customType: e.target.value})}
                                placeholder="Enter custom type (e.g., Car, Boat, Yacht, etc.)"
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                            />
                            </div>
                        )}
                        </div>
                        
                        <div>
                        <label className="block text-sm font-medium mb-2">Bedrooms</label>
                        <input
                            type="number"
                            value={editingProperty.bedrooms}
                            onChange={(e) => setEditingProperty({...editingProperty, bedrooms: parseInt(e.target.value)})}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                        />
                        </div>
                        
                        <div>
                        <label className="block text-sm font-medium mb-2">Bathrooms</label>
                        <input
                            type="number"
                            value={editingProperty.bathrooms}
                            onChange={(e) => setEditingProperty({...editingProperty, bathrooms: parseInt(e.target.value)})}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                        />
                        </div>
                        
                        <div>
                        <label className="block text-sm font-medium mb-2">Area</label>
                        <input
                            type="text"
                            value={editingProperty.area}
                            onChange={(e) => setEditingProperty({...editingProperty, area: e.target.value})}
                            placeholder="4500 sqft"
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                        />
                        </div>
                        
                        <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input
                            type="checkbox"
                            checked={editingProperty.negotiable}
                            onChange={(e) => setEditingProperty({...editingProperty, negotiable: e.target.checked})}
                            className="w-4 h-4 rounded"
                            />
                            <span className="text-sm">Price is negotiable</span>
                        </label>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                        value={editingProperty.description}
                        onChange={(e) => setEditingProperty({...editingProperty, description: e.target.value})}
                        placeholder="Stunning modern villa with panoramic ocean views..."
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg resize-none"
                        />
                    </div>
                    </div>

                    {/* Images Section */}
                    <div className="space-y-4">
                    <h3 className="text-lg font-bold mb-2">Property Images</h3>
                    
                    {/* Current Images */}
                    {editingProperty.images.length > 0 && (
                        <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-2">Current Images:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {editingProperty.images.map((img, index) => (
                            <div key={index} className="relative">
                                <img
                                src={img}
                                alt={`Image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 rounded-full"
                                >
                                <FaTimes className="text-xs" />
                                </button>
                            </div>
                            ))}
                        </div>
                        </div>
                    )}
                    
                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                        <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-2">New Images to Upload:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {imagePreviews.map((preview, index) => (
                            <img
                                key={index}
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                            />
                            ))}
                        </div>
                        
                        {/* ADD IMAGE BUTTON - Uploads immediately */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                                <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-24 h-24 object-cover rounded-lg"
                                />
                                <button
                                onClick={() => {
                                    const files = fileInputRef.current?.files;
                                    if (files && files[index]) {
                                    handleAddImage(files[index]);
                                    }
                                }}
                                disabled={individualImageUploading}
                                className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg hover:bg-black/70 transition disabled:opacity-50"
                                >
                                {individualImageUploading ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                ) : (
                                    <span className="text-white text-sm font-medium">Add Image</span>
                                )}
                                </button>
                            </div>
                            ))}
                        </div>
                        </div>
                    )}
                    
                    {/* Upload Image Area */}
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-700/70">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FaUpload className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold">Click to upload images</span>
                            </p>
                            <p className="text-xs text-gray-400">PNG, JPG, WEBP (MAX. 5MB each)</p>
                        </div>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                        />
                        </label>
                    </div>
                    
                    {/* Or Add Image URL */}
                    <div className="flex flex-col md:flex-row gap-2">
                        <input
                        type="text"
                        value={newImage}
                        onChange={(e) => setNewImage(e.target.value)}
                        placeholder="Or enter image URL"
                        className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                        />
                        <button
                        onClick={addImageUrl}
                        className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
                        >
                        Add URL
                        </button>
                    </div>
                    </div>

                    {/* Video Section */}
                    <div className="space-y-4">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                        <FaVideo className="text-purple-400" />
                        Property Video (Optional)
                    </h3>
                    
                    {/* Current Video */}
                    {(editingProperty.videoUrl || videoPreview) && (
                        <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-2">Video Preview:</p>
                        <div className="relative">
                            {videoPreview ? (
                            <div className="relative w-full h-48">
                                <video
                                src={videoPreview}
                                className="w-full h-full object-cover rounded-lg"
                                controls
                                />
                            </div>
                            ) : editingProperty.videoUrl ? (
                            <div className="relative w-full h-48 bg-gray-700/30 rounded-lg flex items-center justify-center">
                                <FaVideo className="text-4xl text-gray-500" />
                                <button
                                type="button"
                                onClick={removeVideo}
                                className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full"
                                >
                                <FaTimes />
                                </button>
                            </div>
                            ) : null}
                        </div>
                        </div>
                    )}
                    
                    {/* Upload Video */}
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/30 hover:bg-gray-700/50">
                        <div className="flex flex-col items-center justify-center pt-4 pb-4">
                            <FaVideo className="w-6 h-6 mb-2 text-gray-400" />
                            <p className="text-sm text-gray-400">
                            <span className="font-semibold">Upload video file</span>
                            </p>
                            <p className="text-xs text-gray-400">MP4, WebM (MAX. 50MB)</p>
                        </div>
                        <input 
                            ref={videoInputRef}
                            type="file" 
                            className="hidden" 
                            accept="video/*"
                            onChange={handleVideoSelect}
                        />
                        </label>
                    </div>
                    
                    {/* Or Add Video URL */}
                    <div>
                        <p className="text-sm text-gray-400 mb-2">Or enter video URL:</p>
                        <input
                        type="text"
                        value={editingProperty.videoUrl || ''}
                        onChange={(e) => setEditingProperty({...editingProperty, videoUrl: e.target.value})}
                        placeholder="https://example.com/video.mp4"
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                        />
                    </div>
                    </div>

                    {/* Features Section */}
                    <div className="space-y-4">
                    <h3 className="text-lg font-bold mb-2">Property Features</h3>
                    
                    {/* Current Features */}
                    {editingProperty.features.length > 0 && (
                        <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-2">Current Features:</p>
                        <div className="flex flex-wrap gap-2">
                            {editingProperty.features.map((feature) => (
                            <div
                                key={feature.id}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 rounded-lg"
                            >
                                <FaCheck className="text-green-400" />
                                <span>{feature.text}</span>
                                <button
                                type="button"
                                onClick={() => removeFeature(feature.id)}
                                className="ml-2 text-red-400 hover:text-red-300"
                                >
                                <FaTimes />
                                </button>
                            </div>
                            ))}
                        </div>
                        </div>
                    )}
                    
                    {/* Add New Feature */}
                    <div className="flex flex-col md:flex-row gap-2">
                        <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Enter a feature (e.g., Ocean View, Infinity Pool)"
                        className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                        />
                        <button
                        onClick={addFeature}
                        className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg"
                        >
                        Add Feature
                        </button>
                    </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                    <h3 className="text-lg font-bold mb-2">Contact Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                        <input
                            type="text"
                            value={editingProperty.contact.phone}
                            onChange={(e) => setEditingProperty({
                            ...editingProperty,
                            contact: { ...editingProperty.contact, phone: e.target.value }
                            })}
                            placeholder="+2349136552111"
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                        />
                        </div>
                        
                        <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <input
                            type="email"
                            value={editingProperty.contact.email}
                            onChange={(e) => setEditingProperty({
                            ...editingProperty,
                            contact: { ...editingProperty.contact, email: e.target.value }
                            })}
                            placeholder="abidextradingnigltd@gmail.com"
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                        />
                        </div>
                    </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center md:justify-end pt-4">
                    <button
                        onClick={() => {
                        setEditingProperty(null);
                        setSelectedImageFile(null);
                        setSelectedVideoFile(null);
                        setImagePreviews([]);
                        setVideoPreview(null);
                        setNewFeature('');
                        setNewImage('');
                        }}
                        className="px-6 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveProperty}
                        disabled={saving || uploading}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                    >
                        <FaSave />
                        {saving || uploading ? 'Saving...' : 'Save All'}
                    </button>
                    </div>
                </div>
                )}

                {/* Properties List */}
                {!editingProperty && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                    <div key={property.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 transition">
                        {property.images[0] ? (
                        <div className="mb-4 h-48 rounded-lg overflow-hidden relative">
                            <img 
                            src={property.images[0]} 
                            alt={property.title}
                            className="w-full h-full object-cover" 
                            />
                            {property.videoUrl && (
                            <div className="absolute top-2 right-2 bg-purple-600/80 text-white p-2 rounded-full">
                                <FaVideo className="text-sm" />
                            </div>
                            )}
                        </div>
                        ) : (
                        <div className="mb-4 h-48 rounded-lg bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center relative">
                            <FaImage className="text-4xl text-gray-500" />
                            {property.videoUrl && (
                            <div className="absolute top-2 right-2 bg-purple-600/80 text-white p-2 rounded-full">
                                <FaVideo className="text-sm" />
                            </div>
                            )}
                        </div>
                        )}
                        
                        <h3 className="font-bold text-lg mb-2">{property.title}</h3>
                        <div className="flex items-center gap-2 text-gray-300 mb-2">
                        <span>{property.location}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xl font-bold text-blue-300 mb-2">
                        <span>{property.price}</span>
                        <span className={`text-sm ${property.negotiable ? 'text-green-400' : 'text-yellow-400'}`}>
                            {property.negotiable ? '(Negotiable)' : '(Fixed)'}
                        </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-blue-400 mb-2">
                        <FaHome />
                        <span>{property.customType || property.type}</span>
                        </div>
                        
                        {property.videoUrl && (
                        <div className="flex items-center gap-2 text-sm text-purple-300 mb-2">
                            <FaVideo />
                            <span>Video Available</span>
                        </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                        {property.bedrooms > 0 && (
                            <>
                            <FaBed className="text-blue-400" />
                            <span>{property.bedrooms} bed</span>
                            </>
                        )}
                        {property.bathrooms > 0 && (
                            <>
                            <FaBath className="text-purple-400 ml-2" />
                            <span>{property.bathrooms} bath</span>
                            </>
                        )}
                        {property.area && (
                            <>
                            <FaRulerCombined className="text-green-400 ml-2" />
                            <span>{property.area}</span>
                            </>
                        )}
                        </div>
                        
                        <div className="flex gap-2">
                        <button
                            onClick={() => {
                            setEditingProperty(property);
                            if (property.videoUrl) {
                                setVideoPreview(property.videoUrl);
                            }
                            }}
                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 text-sm"
                        >
                            <FaEdit />
                            Edit
                        </button>
                        <button
                            onClick={() => openDeleteModal(property)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                        >
                            <FaTrash />
                        </button>
                        </div>
                    </div>
                    ))}
                    
                    {properties.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <FaHome className="text-4xl text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">No properties added yet</p>
                        <button
                        onClick={addNewProperty}
                        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg inline-flex items-center gap-2"
                        >
                        <FaPlus />
                        Add Your First Property
                        </button>
                    </div>
                    )}
                </div>
                )}
            </div>
        </div>
    );
}