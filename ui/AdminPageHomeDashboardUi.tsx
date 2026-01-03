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
  FaTiktok, 
  FaInstagram, 
  FaFacebookF, 
  FaTwitter, 
  FaWhatsapp,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaMapMarker,
  FaHome,
  FaCity,
  FaImage,
  FaUpload,
  FaTimes
} from 'react-icons/fa';
import { FaNairaSign } from "react-icons/fa6"
import { useRouter } from 'next/navigation';

// Firebase Constants
const CONFIG_DOC_ID = 'app_config';
const PROPERTIES_COLLECTION = 'properties';

// Types
interface SocialLinks {
  tiktok?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
}

interface ContactInfo {
  nigeriaAddress?: string;
  usAddress?: string;
  phone?: string;
  email?: string;
  whatsappMessage?: string;
}

interface Property {
  id?: string;
  type: string;
  location: string;
  price: string;
  description?: string;
  imageUrl?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  createdAt?: Date;
}

interface AppConfig {
    companyName: string;
    tagline?: string;
    trustText?: string;
    heroImage?: string;
    socialLinks: SocialLinks;
    contactInfo: ContactInfo;
    featuredProperties: Property[];
    updatedAt: Date;
}

export default function AdminPageHomePageDashboardUi() {
    // State for app configuration
    const [appConfig, setAppConfig] = useState<Partial<AppConfig>>({
        companyName: 'Abidex Trading Nig. LTD',
        socialLinks: {},
        contactInfo: {},
        featuredProperties: []
    });

    // State for properties
    const [properties, setProperties] = useState<Property[]>([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Load data on component mount
    useEffect(() => {
        loadData();
    }, []);

    // Direct Firebase Functions
    const getAppConfig = async (): Promise<AppConfig | null> => {
        try {
        const docRef = doc(db, 'config', CONFIG_DOC_ID);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() as AppConfig : null;
        } catch (error) {
        console.error('Error getting config:', error);
        return null;
        }
    };

    const saveAppConfig = async (config: Partial<AppConfig>): Promise<boolean> => {
        try {
        const docRef = doc(db, 'config', CONFIG_DOC_ID);
        const existingConfig = await getAppConfig();
        
        const updatedConfig = {
            ...existingConfig,
            ...config,
            updatedAt: Timestamp.now(),
        };
        
        await setDoc(docRef, updatedConfig);
        return true;
        } catch (error) {
        console.error('Error saving config:', error);
        return false;
        }
    };

    const getPropertiesFromFirebase = async (): Promise<Property[]> => {
        try {
        const querySnapshot = await getDocs(collection(db, PROPERTIES_COLLECTION));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Property[];
        } catch (error) {
        console.error('Error getting properties:', error);
        return [];
        }
    };

    const uploadImageToFirebase = async (file: File): Promise<string | null> => {
        try {
            // Create a unique filename
            const fileName = `property_${Date.now()}_${file.name}`;
            const storageRef = ref(storage, `properties/${fileName}`);
            
            // Upload file
            const snapshot = await uploadBytes(storageRef, file);
            
            // Get download URL
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    const savePropertyToFirebase = async (property: Property, imageFile?: File): Promise<string | null> => {
        try {
            let propertyId = property.id;
            let imageUrl = property.imageUrl;
            
            // Upload image if provided
            if (imageFile) {
                const uploadedUrl = await uploadImageToFirebase(imageFile);
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                }
            }
            
            if (propertyId) {
                const docRef = doc(db, PROPERTIES_COLLECTION, propertyId);
                await updateDoc(docRef, {
                    ...property,
                    imageUrl: imageUrl,
                    updatedAt: Timestamp.now(),
                });
            } else {
                const newDocRef = doc(collection(db, PROPERTIES_COLLECTION));
                propertyId = newDocRef.id;
                await setDoc(newDocRef, {
                    ...property,
                    imageUrl: imageUrl,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                });
            }
            
            return propertyId;
        } catch (error) {
            console.error('Error saving property:', error);
            return null;
        }
    };

    const deletePropertyFromFirebase = async (propertyId: string): Promise<boolean> => {
        try {
        await deleteDoc(doc(db, PROPERTIES_COLLECTION, propertyId));
        return true;
        } catch (error) {
        console.error('Error deleting property:', error);
        return false;
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
        const [config, propertiesData] = await Promise.all([
            getAppConfig(),
            getPropertiesFromFirebase()
        ]);
        
        if (config) setAppConfig(config);
        setProperties(propertiesData);
        } catch (error) {
        setErrorMessage('Failed to load data');
        } finally {
        setLoading(false);
        }
    };

    // Save all configuration
    const handleSaveConfig = async () => {
        setSaving(true);
        setSuccessMessage('');
        setErrorMessage('');
        
        try {
        const success = await saveAppConfig(appConfig);
        if (success) {
            setSuccessMessage('Configuration saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } else {
            setErrorMessage('Failed to save configuration');
        }
        } catch (error) {
        setErrorMessage('Error saving configuration');
        } finally {
        setSaving(false);
        }
    };

    // Handle image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Save a single property
    const handleSaveProperty = async (property: Property) => {
        setUploading(true);
        try {
            const propertyId = await savePropertyToFirebase(property, selectedImage || undefined);
            if (propertyId) {
                // Reset image states
                setSelectedImage(null);
                setImagePreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                
                await loadData();
                setEditingProperty(null);
                setSuccessMessage('Property saved successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            setErrorMessage('Failed to save property');
        } finally {
            setUploading(false);
        }
    };

    // Delete a property
    const handleDeleteProperty = async (propertyId: string) => {
        if (confirm('Are you sure you want to delete this property?')) {
        const success = await deletePropertyFromFirebase(propertyId);
        if (success) {
            await loadData();
            setSuccessMessage('Property deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } else {
            setErrorMessage('Failed to delete property');
        }
        }
    };

    // Helper functions to update config
    const updateSocialLink = (platform: keyof SocialLinks, value: string) => {
        setAppConfig(prev => ({
        ...prev,
        socialLinks: {
            ...prev.socialLinks,
            [platform]: value
        }
        }));
    };

    const updateContactInfo = (field: keyof ContactInfo, value: string) => {
        setAppConfig(prev => ({
        ...prev,
        contactInfo: {
            ...prev.contactInfo,
            [field]: value
        }
        }));
    };

    const updateAppConfig = (field: keyof AppConfig, value: any) => {
        setAppConfig(prev => ({
        ...prev,
        [field]: value
        }));
    };

    // Add new property
    const addNewProperty = () => {
        setEditingProperty({
        type: '',
        location: '',
        price: '',
        description: '',
        bedrooms: 0,
        bathrooms: 0,
        squareFeet: 0
        });
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Remove selected image
    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (editingProperty) {
            setEditingProperty({
                ...editingProperty,
                imageUrl: ''
            });
        }
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
                {/* Back button */}
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
                <h1 className="mt-8 text-xl md:text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-sm md:text-base text-gray-400">Manage your website content and settings</p>
            </div>

            {/* Messages */}
            {successMessage && (
                <div className="text-sm p-4 bg-green-500/20 border border-green-500 rounded-lg">
                {successMessage}
                </div>
            )}
            
            {errorMessage && (
                <div className="text-sm p-4 bg-red-500/20 border border-red-500 rounded-lg">
                {errorMessage}
                </div>
            )}

            {/* BASIC INFO SECTION */}
            <div className="bg-gray-800/30 rounded-2xl px-3 py-6 md:p-6 border border-gray-700">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <FaBuilding className="text-blue-400" />
                Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Company Name</label>
                    <input
                    type="text"
                    value={appConfig.companyName || ''}
                    onChange={(e) => updateAppConfig('companyName', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                    placeholder="Abidex Trading Nig. LTD"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Tagline</label>
                    <input
                    type="text"
                    value={appConfig.tagline || ''}
                    onChange={(e) => updateAppConfig('tagline', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                    placeholder="Where Luxury meets Comfort..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Trust Text</label>
                    <input
                    type="text"
                    value={appConfig.trustText || ''}
                    onChange={(e) => updateAppConfig('trustText', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                    placeholder="Trusted Since 2010"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Hero Image URL</label>
                    <input
                    type="text"
                    value={appConfig.heroImage || ''}
                    onChange={(e) => updateAppConfig('heroImage', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                    placeholder="https://images.unsplash.com/..."
                    />
                    <p className="text-xs text-gray-400 mt-2">Enter URL or use image upload below for properties</p>
                </div>
                </div>
            </div>

            {/* SOCIAL LINKS SECTION */}
            <div className="bg-gray-800/30 rounded-2xl px-3 py-6 md:p-6 border border-gray-700">
                <h2 className="md:text-xl font-bold mb-6 flex items-center gap-3">
                <FaTiktok className="text-pink-500" />
                Social Media Links
                <span className="text-sm text-gray-400 font-normal">(Optional)</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { key: 'tiktok', label: 'TikTok URL', icon: FaTiktok, placeholder: 'https://tiktok.com/@username' },
                    { key: 'instagram', label: 'Instagram URL', icon: FaInstagram, placeholder: 'https://instagram.com/username' },
                    { key: 'facebook', label: 'Facebook URL', icon: FaFacebookF, placeholder: 'https://facebook.com/username' },
                    { key: 'twitter', label: 'Twitter URL', icon: FaTwitter, placeholder: 'https://x.com/username' },
                    { key: 'whatsapp', label: 'WhatsApp Number', icon: FaWhatsapp, placeholder: '+2349136552111' },
                    { key: 'phone', label: 'Phone Number', icon: FaPhone, placeholder: '+2349136552111' },
                    { key: 'email', label: 'Email Address', icon: FaEnvelope, placeholder: 'abidextradingnigltd@gmail.com' },
                ].map(({ key, label, icon: Icon, placeholder }) => (
                    <div key={key} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                        <Icon className="text-blue-400" />
                        {label}
                    </label>
                    <input
                        type="text"
                        value={appConfig.socialLinks?.[key as keyof SocialLinks] || ''}
                        onChange={(e) => updateSocialLink(key as keyof SocialLinks, e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                    />
                    </div>
                ))}
                </div>
            </div>

            {/* CONTACT INFO SECTION */}
            <div className="bg-gray-800/30 rounded-2xl px-3 py-6 md:p-6 border border-gray-700">
                <h2 className="md:text-xl font-bold mb-6 flex items-center gap-3">
                <FaMapMarker className="text-green-500" />
                Contact Information
                <span className="text-sm text-gray-400 font-normal">(Optional)</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { key: 'nigeriaAddress', label: 'Nigeria Address', icon: FaMapMarker, placeholder: 'Ikenne modern market, block F, shop-8, Ogun State' },
                    { key: 'usAddress', label: 'US Address', icon: FaMapMarker, placeholder: '8145 S Cole St, Illinois, Chicago' },
                    { key: 'phone', label: 'Phone Number', icon: FaPhone, placeholder: '+2349136552111' },
                    { key: 'email', label: 'Email Address', icon: FaEnvelope, placeholder: 'abidextradingnigltd@gmail.com' },
                    { key: 'whatsappMessage', label: 'WhatsApp Message', icon: FaWhatsapp, placeholder: 'Hello, I am interested in your property listings.' },
                ].map(({ key, label, icon: Icon, placeholder }) => (
                    <div key={key} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                        <Icon className="text-green-400" />
                        {label}
                    </label>
                    {key === 'whatsappMessage' ? (
                        <textarea
                        value={appConfig.contactInfo?.[key as keyof ContactInfo] || ''}
                        onChange={(e) => updateContactInfo(key as keyof ContactInfo, e.target.value)}
                        placeholder={placeholder}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg resize-none"
                        />
                    ) : (
                        <input
                        type="text"
                        value={appConfig.contactInfo?.[key as keyof ContactInfo] || ''}
                        onChange={(e) => updateContactInfo(key as keyof ContactInfo, e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                        />
                    )}
                    </div>
                ))}
                </div>
            </div>

            {/* PROPERTIES SECTION */}
            <div className="bg-gray-800/30 rounded-2xl px-3 py-6 md:p-6 border border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="md:text-xl font-bold flex justify-center items-center gap-3">
                        <FaHome className="text-yellow-500" />
                        Featured Properties
                    </h2>
                    
                    <div className="flex justify-center gap-3">
                        <button
                        onClick={addNewProperty}
                        className="text-sm md:text-base px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition"
                        >
                        <FaPlus />
                        Add Property
                        </button>
                        
                        <button
                        onClick={handleSaveConfig}
                        disabled={saving}
                        className="text-sm md:text-base px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                        >
                        <FaSave />
                        {saving ? 'Saving...' : 'Save All'}
                        </button>
                    </div>
                </div>

                {/* Property Form Modal */}
                {editingProperty && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2">
                    <div className="bg-gray-800 rounded-2xl px-3 py-6 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold mb-6">
                        {editingProperty.id ? 'Edit Property' : 'Add New Property'}
                    </h3>
                    
                    <div className="space-y-4">
                        {/* Image Upload Section */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium mb-2">Property Image</label>
                            
                            {/* Image Preview */}
                            {imagePreview || editingProperty.imageUrl ? (
                                <div className="relative mb-4">
                                    <img 
                                        src={imagePreview || editingProperty.imageUrl} 
                                        alt="Property preview" 
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ) : null}
                            
                            {/* Upload Button */}
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-700/70">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <FaUpload className="w-8 h-8 mb-2 text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-400">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-400">PNG, JPG, WEBP (MAX. 5MB)</p>
                                    </div>
                                    <input 
                                        ref={fileInputRef}
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                    />
                                </label>
                            </div>
                            
                            {/* Or URL Input */}
                            <div className="mt-4">
                                <p className="text-sm text-gray-400 mb-2 text-center">Or enter image URL:</p>
                                <input
                                    type="text"
                                    value={editingProperty.imageUrl || ''}
                                    onChange={(e) => setEditingProperty({...editingProperty, imageUrl: e.target.value})}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Property Type</label>
                            <input
                            type="text"
                            value={editingProperty.type}
                            onChange={(e) => setEditingProperty({...editingProperty, type: e.target.value})}
                            placeholder="Luxury Villa"
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Location</label>
                            <input
                            type="text"
                            value={editingProperty.location}
                            onChange={(e) => setEditingProperty({...editingProperty, location: e.target.value})}
                            placeholder="Lagos"
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Price</label>
                            <input
                            type="text"
                            value={editingProperty.price}
                            onChange={(e) => setEditingProperty({...editingProperty, price: e.target.value})}
                            placeholder="₦850,000"
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Image URL (optional if uploading)</label>
                            <input
                            type="text"
                            value={editingProperty.imageUrl || ''}
                            onChange={(e) => setEditingProperty({...editingProperty, imageUrl: e.target.value})}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                            />
                        </div>
                        </div>
                        
                        <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            value={editingProperty.description || ''}
                            onChange={(e) => setEditingProperty({...editingProperty, description: e.target.value})}
                            placeholder="Property description..."
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg resize-none"
                        />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Bedrooms</label>
                            <input
                            type="number"
                            value={editingProperty.bedrooms || 0}
                            onChange={(e) => setEditingProperty({...editingProperty, bedrooms: parseInt(e.target.value)})}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Bathrooms</label>
                            <input
                            type="number"
                            value={editingProperty.bathrooms || 0}
                            onChange={(e) => setEditingProperty({...editingProperty, bathrooms: parseInt(e.target.value)})}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Square Feet</label>
                            <input
                            type="number"
                            value={editingProperty.squareFeet || 0}
                            onChange={(e) => setEditingProperty({...editingProperty, squareFeet: parseInt(e.target.value)})}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                            />
                        </div>
                        </div>
                        
                        <div className="flex gap-4 justify-end pt-4">
                        <button
                            onClick={() => {
                                setEditingProperty(null);
                                setSelectedImage(null);
                                setImagePreview(null);
                            }}
                            className="text-sm md:text-base w-full px-2 md:px-6 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleSaveProperty(editingProperty)}
                            disabled={uploading || saving}
                            className="text-sm md:text-base w-full px-2 md:px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg flex justify-center items-center gap-2 transition disabled:opacity-50"
                        >
                            <FaSave />
                            {uploading ? 'Uploading...' : 'Save Property'}
                        </button>
                        </div>
                    </div>
                    </div>
                </div>
                )}

                {/* Properties Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.map((property) => (
                    <div key={property.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 transition">
                    {property.imageUrl ? (
                        <div className="mb-4 h-48 rounded-lg overflow-hidden">
                        <img 
                            src={property.imageUrl} 
                            alt={property.type}
                            className="w-full h-full object-cover" 
                        />
                        </div>
                    ) : (
                        <div className="mb-4 h-48 rounded-lg bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center">
                        <FaImage className="text-4xl text-gray-500" />
                        </div>
                    )}
                    
                    <h3 className="font-bold text-lg mb-2">{property.type}</h3>
                    <div className="flex items-center gap-2 text-gray-300 mb-2">
                        <FaCity />
                        <span>{property.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xl font-bold text-blue-300 mb-4">
                        <FaNairaSign />
                        <span>{property.price}</span>
                    </div>
                    
                    <div className="flex gap-2">
                        <button
                        onClick={() => {
                            setEditingProperty(property);
                            if (property.imageUrl) {
                                setImagePreview(property.imageUrl);
                            }
                        }}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 text-sm"
                        >
                        <FaEdit />
                        Edit
                        </button>
                        <button
                        onClick={() => property.id && handleDeleteProperty(property.id)}
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
                        className="text-sm md:text-base mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg inline-flex items-center gap-2"
                    >
                        <FaPlus />
                        Add Your First Property
                    </button>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}