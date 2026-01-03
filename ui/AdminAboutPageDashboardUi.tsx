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
  FaCheckCircle,
  FaExclamationTriangle,
  FaUser,
  FaCrown
} from "react-icons/fa";
import { useRouter } from 'next/navigation';

// Firebase Constants
const ABOUT_CONFIG_DOC_ID = 'about_config';
const TEAM_COLLECTION = 'team_members';

// Types
interface TeamMember {
  id?: string;
  name: string;
  role: string;
  experience: string;
  email: string;
  phone: string;
  imageUrl?: string;
  order: number;
}

interface AboutConfig {
  ownerName: string;
  ownerTitle: string;
  ownerQuote: string;
  ownerImageUrl: string;
  updatedAt: Date;
}

export default function AdminAboutPageDashboardUi() {
    // State for about configuration
    const [aboutConfig, setAboutConfig] = useState<Partial<AboutConfig>>({
        ownerName: 'Adebayo Johnson',
        ownerTitle: 'Founder & CEO',
        ownerQuote: 'Building dreams, one property at a time',
        ownerImageUrl: '/ceo.jpeg'
    });

    // State for team members
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [ownerImagePreview, setOwnerImagePreview] = useState<string | null>(null);
    
    // Delete Confirmation Modal States
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'team', id?: string, name?: string } | null>(null);
    const [deleting, setDeleting] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const ownerFileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Load data on component mount
    useEffect(() => {
        loadData();
    }, []);

    // Firebase Functions
    const getAboutConfig = async (): Promise<AboutConfig | null> => {
        try {
        const docRef = doc(db, 'config', ABOUT_CONFIG_DOC_ID);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() as AboutConfig : null;
        } catch (error) {
        console.error('Error getting about config:', error);
        return null;
        }
    };

    const saveAboutConfig = async (config: Partial<AboutConfig>): Promise<boolean> => {
        try {
        const docRef = doc(db, 'config', ABOUT_CONFIG_DOC_ID);
        const existingConfig = await getAboutConfig();
        
        const updatedConfig = {
            ...existingConfig,
            ...config,
            updatedAt: Timestamp.now(),
        };
        
        await setDoc(docRef, updatedConfig);
        return true;
        } catch (error) {
        console.error('Error saving about config:', error);
        return false;
        }
    };

    const getTeamMembers = async (): Promise<TeamMember[]> => {
        try {
        const querySnapshot = await getDocs(collection(db, TEAM_COLLECTION));
        const members = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as TeamMember[];
        
        // Sort by order
        return members.sort((a, b) => a.order - b.order);
        } catch (error) {
        console.error('Error getting team members:', error);
        return [];
        }
    };

    const uploadImageToFirebase = async (file: File): Promise<string | null> => {
        try {
        const fileName = `about_${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `about/${fileName}`);
        
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
        } catch (error) {
        console.error('Error uploading image:', error);
        return null;
        }
    };

    const saveTeamMember = async (member: TeamMember, imageFile?: File): Promise<string | null> => {
        try {
        let memberId = member.id;
        let imageUrl = member.imageUrl;
        
        // Upload image if provided
        if (imageFile) {
            const uploadedUrl = await uploadImageToFirebase(imageFile);
            if (uploadedUrl) {
            imageUrl = uploadedUrl;
            }
        }
        
        const memberData: any = {
            ...member,
            imageUrl: imageUrl,
            updatedAt: Timestamp.now(),
        };
        
        if (memberId) {
            const docRef = doc(db, TEAM_COLLECTION, memberId);
            await updateDoc(docRef, memberData);
        } else {
            // For new member, set order to last
            const allMembers = await getTeamMembers();
            memberData.order = allMembers.length;
            memberData.createdAt = Timestamp.now();
            
            const newDocRef = doc(collection(db, TEAM_COLLECTION));
            memberId = newDocRef.id;
            await setDoc(newDocRef, memberData);
        }
        
        return memberId;
        } catch (error) {
        console.error('Error saving team member:', error);
        return null;
        }
    };

    const deleteTeamMember = async (memberId: string): Promise<boolean> => {
        try {
        await deleteDoc(doc(db, TEAM_COLLECTION, memberId));
        return true;
        } catch (error) {
        console.error('Error deleting team member:', error);
        return false;
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
        const [config, teamData] = await Promise.all([
            getAboutConfig(),
            getTeamMembers()
        ]);
        
        if (config) {
            setAboutConfig(config);
            if (config.ownerImageUrl) {
            setOwnerImagePreview(config.ownerImageUrl);
            }
        }
        setTeamMembers(teamData);
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
        const success = await saveAboutConfig(aboutConfig);
        if (success) {
            setSuccessMessage('About page configuration saved successfully!');
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

    // Handle image selection for team member
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        setSelectedImage(file);
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        }
    };

    // Handle owner image selection
    const handleOwnerImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        // Preview the selected image
        const reader = new FileReader();
        reader.onloadend = () => {
            setOwnerImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        
        // Upload to Firebase
        uploadOwnerImage(file);
        }
    };

    const uploadOwnerImage = async (file: File) => {
        setUploading(true);
        try {
        const uploadedUrl = await uploadImageToFirebase(file);
        if (uploadedUrl) {
            setAboutConfig(prev => ({
            ...prev,
            ownerImageUrl: uploadedUrl
            }));
            setSuccessMessage('Owner image uploaded successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
        } catch (error) {
        setErrorMessage('Failed to upload owner image');
        } finally {
        setUploading(false);
        }
    };

    // Save a single team member
    const handleSaveTeamMember = async (member: TeamMember) => {
        setUploading(true);
        try {
        const memberId = await saveTeamMember(member, selectedImage || undefined);
        
        if (memberId) {
            // Reset states
            setSelectedImage(null);
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            
            await loadData();
            setEditingTeamMember(null);
            setSuccessMessage('Team member saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
        } catch (error) {
        setErrorMessage('Failed to save team member');
        } finally {
        setUploading(false);
        }
    };

    // Open delete confirmation modal
    const openDeleteModal = (member: TeamMember) => {
        setItemToDelete({ type: 'team', id: member.id, name: member.name });
        setDeleteModalOpen(true);
    };

    // Close delete confirmation modal
    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setItemToDelete(null);
    };

    // Confirm and delete team member
    const confirmDelete = async () => {
        if (!itemToDelete?.id) return;
        
        setDeleting(true);
        try {
        const success = await deleteTeamMember(itemToDelete.id);
        if (success) {
            await loadData();
            setSuccessMessage('Team member deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } else {
            setErrorMessage('Failed to delete team member');
        }
        closeDeleteModal();
        } catch (error) {
        setErrorMessage('Error deleting team member');
        closeDeleteModal();
        } finally {
        setDeleting(false);
        }
    };

    // Helper functions
    const updateAboutConfig = (field: keyof AboutConfig, value: string) => {
        setAboutConfig(prev => ({
        ...prev,
        [field]: value
        }));
    };

    // Add new team member
    const addNewTeamMember = () => {
        setEditingTeamMember({
        name: '',
        role: '',
        experience: '',
        email: '',
        phone: '',
        order: teamMembers.length
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
        if (editingTeamMember) {
        setEditingTeamMember({
            ...editingTeamMember,
            imageUrl: ''
        });
        }
    };

    // Remove owner image
    const removeOwnerImage = () => {
        setOwnerImagePreview(null);
        setAboutConfig(prev => ({
        ...prev,
        ownerImageUrl: ''
        }));
        if (ownerFileInputRef.current) {
        ownerFileInputRef.current.value = '';
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
            <h1 className="mt-8 text-xl md:text-3xl font-bold mb-2">About Page Dashboard</h1>
            <p className="text-sm md:text-base text-gray-400">Manage owner information and team members</p>
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
        {deleteModalOpen && itemToDelete && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-2">
            <div className="bg-gray-800 rounded-2xl px-3 py-6 md:p-6 max-w-md w-full">
                <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                    <FaExclamationTriangle className="text-2xl text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Delete Team Member</h3>
                <p className="text-gray-400">
                    Are you sure you want to delete "{itemToDelete.name}"? This action cannot be undone.
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

        {/* OWNER INFORMATION SECTION */}
        <div className="bg-gray-800/30 rounded-2xl px-3 py-6 md:p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <FaCrown className="text-yellow-400" />
            Owner Information
            </h2>

            <div className="space-y-6">
            {/* Owner Image Upload */}
            <div className="space-y-4">
                <label className="block text-sm font-medium mb-2">Owner Photo</label>
                
                {/* Image Preview */}
                {ownerImagePreview ? (
                <div className="relative mb-4 w-48 h-48">
                    <img 
                    src={ownerImagePreview} 
                    alt="Owner preview" 
                    className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                    type="button"
                    onClick={removeOwnerImage}
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
                    ref={ownerFileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleOwnerImageSelect}
                    />
                </label>
                </div>
                
                {/* Or URL Input */}
                <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2 text-center">Or enter image URL:</p>
                <input
                    type="text"
                    value={aboutConfig.ownerImageUrl || ''}
                    onChange={(e) => updateAboutConfig('ownerImageUrl', e.target.value)}
                    placeholder="https://example.com/owner-image.jpg"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label className="block text-sm font-medium mb-2">Owner Name</label>
                <input
                    type="text"
                    value={aboutConfig.ownerName || ''}
                    onChange={(e) => updateAboutConfig('ownerName', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                    placeholder="Adebayo Johnson"
                />
                </div>

                <div>
                <label className="block text-sm font-medium mb-2">Owner Title</label>
                <input
                    type="text"
                    value={aboutConfig.ownerTitle || ''}
                    onChange={(e) => updateAboutConfig('ownerTitle', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                    placeholder="Founder & CEO"
                />
                </div>

                <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Owner Quote</label>
                <input
                    type="text"
                    value={aboutConfig.ownerQuote || ''}
                    onChange={(e) => updateAboutConfig('ownerQuote', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                    placeholder="Building dreams, one property at a time"
                />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                onClick={handleSaveConfig}
                disabled={saving || uploading}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                >
                <FaSave />
                {saving || uploading ? 'Saving...' : 'Save Owner Info'}
                </button>
            </div>
            </div>
        </div>

        {/* TEAM MEMBERS SECTION */}
        <div className="bg-gray-800/30 rounded-2xl px-3 py-6 md:p-6 border border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold flex items-center gap-3">
                <FaUser className="text-blue-400" />
                Meet Our Leaders
            </h2>
            
            <div className="flex gap-3">
                <button
                onClick={addNewTeamMember}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition"
                >
                <FaPlus />
                Add Team Member
                </button>
            </div>
            </div>

            {/* Team Member Form Modal */}
            {editingTeamMember && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2">
                <div className="bg-gray-800 rounded-2xl px-3 py-6 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-6">
                    {editingTeamMember.id ? 'Edit Team Member' : 'Add Team Member'}
                </h3>
                
                <div className="space-y-6">
                    {/* Image Upload Section */}
                    <div className="space-y-4">
                    <label className="block text-sm font-medium mb-2">Member Photo</label>
                    
                    {/* Image Preview */}
                    {imagePreview || editingTeamMember.imageUrl ? (
                        <div className="relative mb-4">
                        <img 
                            src={imagePreview || editingTeamMember.imageUrl} 
                            alt="Team member preview" 
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
                        value={editingTeamMember.imageUrl || ''}
                        onChange={(e) => setEditingTeamMember({...editingTeamMember, imageUrl: e.target.value})}
                        placeholder="https://example.com/team-member.jpg"
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                        />
                    </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <input
                        type="text"
                        value={editingTeamMember.name}
                        onChange={(e) => setEditingTeamMember({...editingTeamMember, name: e.target.value})}
                        placeholder="Adebayo Johnson"
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2">Role/Position</label>
                        <input
                        type="text"
                        value={editingTeamMember.role}
                        onChange={(e) => setEditingTeamMember({...editingTeamMember, role: e.target.value})}
                        placeholder="CEO & Founder"
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2">Experience</label>
                        <input
                        type="text"
                        value={editingTeamMember.experience}
                        onChange={(e) => setEditingTeamMember({...editingTeamMember, experience: e.target.value})}
                        placeholder="13+ years"
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <input
                        type="email"
                        value={editingTeamMember.email}
                        onChange={(e) => setEditingTeamMember({...editingTeamMember, email: e.target.value})}
                        placeholder="abidextradingnigltd@gmail.com"
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                        />
                    </div>
                    
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                        <input
                        type="text"
                        value={editingTeamMember.phone}
                        onChange={(e) => setEditingTeamMember({...editingTeamMember, phone: e.target.value})}
                        placeholder="+2349136552111"
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                        />
                    </div>
                    </div>
                    
                    <div className="flex gap-4 justify-end pt-4">
                    <button
                        onClick={() => {
                        setEditingTeamMember(null);
                        setSelectedImage(null);
                        setImagePreview(null);
                        }}
                        className="w-full px-6 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => handleSaveTeamMember(editingTeamMember)}
                        disabled={uploading}
                        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg flex justify-center items-center gap-2 transition disabled:opacity-50"
                    >
                        <FaSave />
                        {uploading ? 'Saving...' : 'Save Team Member'}
                    </button>
                    </div>
                </div>
                </div>
            </div>
            )}

            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
                <div key={member.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 transition">
                <div className="flex items-start gap-4 mb-4">
                    {member.imageUrl ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        <img 
                        src={member.imageUrl} 
                        alt={member.name}
                        className="w-full h-full object-cover" 
                        />
                    </div>
                    ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center flex-shrink-0">
                        <FaUser className="text-2xl text-gray-500" />
                    </div>
                    )}
                    
                    <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                    <p className="text-blue-400 text-sm mb-1">{member.role}</p>
                    <p className="text-gray-400 text-sm">{member.experience} experience</p>
                    </div>
                </div>
                
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                    <FaEnvelope className="text-blue-400" />
                    <span>{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                    <FaPhone className="text-green-400" />
                    <span>{member.phone}</span>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <button
                    onClick={() => {
                        setEditingTeamMember(member);
                        if (member.imageUrl) {
                        setImagePreview(member.imageUrl);
                        }
                    }}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 text-sm"
                    >
                    <FaEdit />
                    Edit
                    </button>
                    <button
                    onClick={() => openDeleteModal(member)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                    >
                    <FaTrash />
                    </button>
                </div>
                </div>
            ))}
            
            {teamMembers.length === 0 && (
                <div className="col-span-full text-center py-12">
                <FaUser className="text-4xl text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No team members added yet</p>
                <button
                    onClick={addNewTeamMember}
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg inline-flex items-center gap-2"
                >
                    <FaPlus />
                    Add Your First Team Member
                </button>
                </div>
            )}
            </div>
        </div>
        </div>
    );
}