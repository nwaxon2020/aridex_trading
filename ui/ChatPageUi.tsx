"use client"

import { 
  FaPaperPlane,
  FaUser,
  FaUserTie,
  FaClock,
  FaCalendarAlt,
  FaSearch,
  FaCheck,
  FaCheckDouble,
  FaTimes,
  FaPhone,
  FaInfoCircle,
  FaWhatsapp,
  FaKey,
  FaShieldAlt,
  FaLock,
  FaEnvelope
} from "react-icons/fa";
import { useState, useEffect, useRef, KeyboardEvent } from "react";
import FooterUi from "../components/Footer";
import { useRouter } from "next/navigation";

import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import {  
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut 
} from "firebase/auth";
import { db, auth } from "@/lib/firebaseconfig";

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'owner';
    timestamp: Date;
    read: boolean;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
}

interface Conversation {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
    messages: Message[];
    isActive: boolean;
    createdAt: Date;
}

// Helper function to convert Firebase Timestamp to Date
const convertTimestampToDate = (timestamp: any): Date => {
    if (timestamp?.toDate) {
        return timestamp.toDate();
    }
    return new Date(timestamp || Date.now());
};

export default function ChatPageUi() {
    const [activeConversation, setActiveConversation] = useState<string | null>(null);
    const [userMessage, setUserMessage] = useState('');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [isUserFormVisible, setIsUserFormVisible] = useState(true);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Authentication states - Using Firebase Auth
    const [isOwner, setIsOwner] = useState(false);
    const [ownerEmail, setOwnerEmail] = useState('');
    const [ownerPassword, setOwnerPassword] = useState('');
    const [showOwnerLogin, setShowOwnerLogin] = useState(false);
    const [authError, setAuthError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Current user's ID
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const router = useRouter();

    // Check authentication state on component mount
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            // CEO is logged in via Firebase
            setIsOwner(true);
            loadConversationsFromFirebase();
        } else {
            // Regular user mode
            setIsOwner(false);
            loadUserDataFromLocalStorage();
        }
        setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Load user data from localStorage for regular users
    const loadUserDataFromLocalStorage = () => {
        const savedUserData = localStorage.getItem('abidex_chat_user');
        if (savedUserData) {
        const userData = JSON.parse(savedUserData);
        setUserName(userData.name || '');
        setUserEmail(userData.email || '');
        setUserPhone(userData.phone || '');
        setCurrentUserId(userData.userId);
        
        // Load user's conversation from localStorage
        const userConversation = localStorage.getItem(`abidex_user_conversation_${userData.userId}`);
        if (userConversation) {
            const parsedConv = JSON.parse(userConversation);
            const conversationWithDates = {
            ...parsedConv,
            lastMessageTime: new Date(parsedConv.lastMessageTime),
            createdAt: new Date(parsedConv.createdAt),
            messages: parsedConv.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            }))
            };
            setConversations([conversationWithDates]);
            setActiveConversation(parsedConv.id);
        }
        setIsUserFormVisible(false);
        }
    };

    // Load conversations from Firebase for CEO
    const loadConversationsFromFirebase = () => {
        try {
        const conversationsRef = collection(db, "conversations");
        const q = query(conversationsRef, orderBy("lastMessageTime", "desc"));
        
        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const firebaseConversations: Conversation[] = [];
            
            snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const conversation: Conversation = {
                id: docSnap.id,
                userId: data.userId || '',
                userName: data.userName || 'Unknown User',
                userEmail: data.userEmail || '',
                userPhone: data.userPhone || '',
                lastMessage: data.lastMessage || '',
                lastMessageTime: convertTimestampToDate(data.lastMessageTime),
                unreadCount: data.unreadCount || 0,
                messages: (data.messages || []).map((msg: any) => ({
                id: msg.id || `msg_${Date.now()}`,
                text: msg.text || '',
                sender: msg.sender || 'user',
                timestamp: convertTimestampToDate(msg.timestamp),
                read: msg.read || false,
                userName: msg.userName,
                userEmail: msg.userEmail,
                userPhone: msg.userPhone
                })),
                isActive: data.isActive !== false,
                createdAt: convertTimestampToDate(data.createdAt)
            };
            firebaseConversations.push(conversation);
            });
            
            setConversations(firebaseConversations);
            
            // Set first conversation as active if none selected
            if (firebaseConversations.length > 0 && !activeConversation) {
            setActiveConversation(firebaseConversations[0].id);
            }
        });

        // Store unsubscribe function for cleanup
        return unsubscribe;
        } catch (error) {
        console.error("Error loading conversations from Firebase:", error);
        return () => {}; // Return empty cleanup function
        }
    };

    // Create a new user conversation
    const createUserConversation = (userData: any): Conversation => {
        const userId = `user_${Date.now()}`;
        return {
        id: `conv_${Date.now()}`,
        userId: userId,
        userName: userData.name,
        userEmail: userData.email,
        userPhone: userData.phone || '',
        lastMessage: '',
        lastMessageTime: new Date(),
        unreadCount: 0,
        messages: [],
        isActive: true,
        createdAt: new Date()
        };
    };

    // Save user data and create conversation
    const saveUserData = async () => {
        if (userName && userEmail) {
        const userId = `user_${Date.now()}`;
        const userData = { 
            name: userName, 
            email: userEmail, 
            phone: userPhone,
            userId: userId 
        };
        
        // Save user data to localStorage
        localStorage.setItem('abidex_chat_user', JSON.stringify(userData));
        setIsUserFormVisible(false);
        setCurrentUserId(userId);
        
        // Create new conversation
        const newConversation = createUserConversation(userData);
        
        // Save to localStorage for user
        localStorage.setItem(`abidex_user_conversation_${userId}`, JSON.stringify(newConversation));
        
        // Also save to Firebase for CEO to see
        await syncConversationToFirebase(newConversation);
        
        setConversations([newConversation]);
        setActiveConversation(newConversation.id);
        }
    };

    // Sync conversation to Firebase
    const syncConversationToFirebase = async (conversation: Conversation) => {
        try {
        const convRef = doc(db, "conversations", conversation.id);
        
        const firebaseConversation = {
            ...conversation,
            lastMessageTime: Timestamp.fromDate(conversation.lastMessageTime),
            createdAt: Timestamp.fromDate(conversation.createdAt),
            messages: conversation.messages.map(msg => ({
            ...msg,
            timestamp: Timestamp.fromDate(msg.timestamp)
            })),
            updatedAt: serverTimestamp()
        };
        
        await setDoc(convRef, firebaseConversation, { merge: true });
        } catch (error) {
        console.error("Error syncing conversation to Firebase:", error);
        }
    };

    // Update conversation in Firebase
    const updateConversationInFirebase = async (conversation: Conversation) => {
        try {
        const convRef = doc(db, "conversations", conversation.id);
        
        const updateData = {
            lastMessage: conversation.lastMessage,
            lastMessageTime: Timestamp.fromDate(conversation.lastMessageTime),
            messages: conversation.messages.map(msg => ({
            ...msg,
            timestamp: Timestamp.fromDate(msg.timestamp)
            })),
            unreadCount: conversation.unreadCount,
            updatedAt: serverTimestamp()
        };
        
        await updateDoc(convRef, updateData);
        } catch (error) {
        console.error("Error updating conversation in Firebase:", error);
        }
    };

    // Handle CEO login with Firebase Auth
    const handleOwnerLogin = async () => {
        setAuthError('');
        try {
        setIsLoading(true);
        await signInWithEmailAndPassword(auth, ownerEmail, ownerPassword);
        // onAuthStateChanged listener will handle the rest
        setShowOwnerLogin(false);
        setOwnerEmail('');
        setOwnerPassword('');
        } catch (error: any) {
        console.error("Login error:", error);
        setAuthError(error.message || 'Login failed. Please check your credentials.');
        } finally {
        setIsLoading(false);
        }
    };

    // Handle CEO logout
    const handleOwnerLogout = async () => {
        try {
        await signOut(auth);
        // onAuthStateChanged will reset the state
        setActiveConversation(null);
        setConversations([]);
        
        // Load user data if exists
        loadUserDataFromLocalStorage();
        } catch (error) {
        console.error("Logout error:", error);
        }
    };

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversations, activeConversation]);

    const sendMessage = async () => {
        if (!userMessage.trim() || !activeConversation) return;

        const newMessage: Message = {
        id: `msg_${Date.now()}`,
        text: userMessage,
        sender: 'user',
        timestamp: new Date(),
        read: false,
        userName,
        userEmail,
        userPhone
        };

        // Update conversation in state
        const updatedConversations = conversations.map(conv => {
        if (conv.id === activeConversation) {
            const updatedConv = {
            ...conv,
            lastMessage: userMessage,
            lastMessageTime: new Date(),
            messages: [...conv.messages, newMessage],
            unreadCount: conv.unreadCount + 1
            };
            
            // Save to localStorage for user
            if (!isOwner) {
            localStorage.setItem(`abidex_user_conversation_${conv.userId}`, JSON.stringify(updatedConv));
            }
            
            // Sync to Firebase for CEO (only if user is sending message)
            if (!isOwner) {
            syncConversationToFirebase(updatedConv);
            }
            
            return updatedConv;
        }
        return conv;
        });

        setConversations(updatedConversations);
        setUserMessage('');
    };

    const sendOwnerMessage = async (messageText: string) => {
        if (!messageText.trim() || !activeConversation) return;

        const newMessage: Message = {
        id: `owner_msg_${Date.now()}`,
        text: messageText,
        sender: 'owner',
        timestamp: new Date(),
        read: false
        };

        const updatedConversations = conversations.map(conv => {
        if (conv.id === activeConversation) {
            const updatedConv = {
            ...conv,
            lastMessage: messageText,
            lastMessageTime: new Date(),
            messages: [...conv.messages, newMessage],
            unreadCount: 0
            };
            
            // Update in Firebase
            updateConversationInFirebase(updatedConv);
            
            return updatedConv;
        }
        return conv;
        });

        setConversations(updatedConversations);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date: Date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
        return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
        } else {
        return date.toLocaleDateString();
        }
    };

    // Filter conversations based on user type
    const filteredConversations = conversations.filter(conv => {
        if (isOwner) {
        // CEO sees all conversations
        return conv.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                conv.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
        // Regular users only see their own conversation
        return conv.userId === currentUserId;
        }
    });

    const activeConv = conversations.find(conv => conv.id === activeConversation);

    // Function to check if user can view a conversation
    const canViewConversation = (conversation: Conversation) => {
        if (isOwner) return true;
        return conversation.userId === currentUserId;
    };

    // Show loading state
    if (isLoading) {
        return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#0f1425] to-[#0a0e1a] text-white flex items-center justify-center">
            <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mb-4"></div>
            <p className="text-gray-400">Loading chat...</p>
            </div>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#0f1425] to-[#0a0e1a] text-white overflow-x-hidden">
            
            {/* Back button */}
            <div
                onClick={() => {
                if (window.history.length > 1) {
                    router.back();
                } else {
                    router.push("/");
                }
                }}
                className="cursor-pointer px-4 py-2 border text-gray-400 rounded-lg absolute top-6 right-6 z-50 hover:text-white hover:border-white transition"
            >
                ← Back
            </div>

            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Header */}
            <section className="relative pt-20 pb-8 px-4 md:px-6">
                <div className="max-w-7xl mx-auto">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-2">
                    <FaWhatsapp className="text-green-400" />
                    <a 
                        href="https://wa.me/2349136552111?text=Hello,%20Can%20we%20Talk."
                        className="text-sm" target="blank"
                    >
                        Instant Property Consultation
                    </a>
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-2 animate-fadeUp">
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Chat Us Today
                    </span>
                    </h1>
                    
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                    {isOwner 
                        ? 'Owner Dashboard - Manage all customer conversations'
                        : 'Chat directly with our property experts. No sign-in required!'
                    }
                    </p>
                </div>

                {/* Owner Status */}
                {isOwner ? (
                    <div className="flex justify-center items-center gap-4 mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-600/20 to-emerald-600/20">
                        <FaShieldAlt className="text-green-400" />
                        <span>Owner Mode</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20">
                        {conversations.length} conversations
                        </span>
                    </div>
                    <button
                        onClick={handleOwnerLogout}
                        className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                    >
                        Logout as Owner
                    </button>
                    </div>
                ) : (
                    <div className="flex justify-center mb-8">
                    <button
                        onClick={() => setShowOwnerLogin(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 transition-all"
                    >
                        <FaLock className="text-blue-400" />
                        <span>Access Owner Dashboard</span>
                    </button>
                    </div>
                )}
                </div>
            </section>

            {/* Owner Login Modal */}
            {showOwnerLogin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="relative w-full max-w-md bg-gradient-to-br from-[#0f1425] to-[#0a0e1a] rounded-3xl border border-white/10 shadow-2xl p-8">
                    <button
                    onClick={() => setShowOwnerLogin(false)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                    >
                    <FaTimes />
                    </button>
                    
                    <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                        <FaKey className="text-2xl text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">CEO Access</h3>
                    <p className="text-gray-400">Enter your Gmail credentials to access all conversations</p>
                    </div>

                    <div className="space-y-4">
                    <div>
                        <input
                        type="email"
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder="CEO Email (Gmail)"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-blue-500/50 mb-3"
                        onKeyDown={(e) => e.key === 'Enter' && handleOwnerLogin()}
                        />
                        <input
                        type="password"
                        value={ownerPassword}
                        onChange={(e) => setOwnerPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-blue-500/50"
                        onKeyDown={(e) => e.key === 'Enter' && handleOwnerLogin()}
                        />
                        {authError && (
                        <p className="text-red-400 text-xs mt-2">{authError}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                        Use your registered Gmail and password
                        </p>
                    </div>
                    
                    <button
                        onClick={handleOwnerLogin}
                        disabled={isLoading}
                        className={`w-full py-3 rounded-lg transition-transform ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} bg-gradient-to-r from-blue-600 to-purple-600`}
                    >
                        {isLoading ? 'Logging in...' : 'Login as Owner'}
                    </button>
                    </div>
                </div>
                </div>
            )}

            {/* Main Chat Container */}
            <section className="relative max-w-7xl mx-auto px-4 md:px-6 pb-20 z-10">
                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl overflow-hidden">
                <div className="flex flex-col lg:flex-row h-full">
                    
                    {/* Conversations Sidebar - Always visible */}
                    <div className="lg:w-1/3 border-r border-white/10">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10">
                        <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">
                            {isOwner ? 'All Conversations' : 'Your Chat'}
                        </h2>
                        {isOwner && (
                            <span className="text-sm text-gray-400">
                            {filteredConversations.length} active
                            </span>
                        )}
                        </div>
                        
                        {/* Search - Only for owner */}
                        {isOwner && (
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                        )}
                    </div>

                    {/* Conversations List */}
                    <div className="overflow-y-auto h-[calc(70vh-80px)]">
                        {filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            {isOwner ? (
                            <>
                                <FaUser className="text-4xl mx-auto mb-4 opacity-50" />
                                <p>No conversations yet</p>
                            </>
                            ) : (
                            <>
                                <FaUser className="text-4xl mx-auto mb-4 opacity-50" />
                                <p>Start a conversation</p>
                                <button
                                onClick={() => setIsUserFormVisible(true)}
                                className="text-white mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transition-transform"
                                >
                                Start Chatting
                                </button>
                            </>
                            )}
                        </div>
                        ) : (
                        filteredConversations.map((conversation) => (
                            <div
                            key={conversation.id}
                            onClick={() => {
                                if (canViewConversation(conversation)) {
                                setActiveConversation(conversation.id);
                                } else if (!isOwner) {
                                // Show login prompt for non-owners trying to access other conversations
                                setShowOwnerLogin(true);
                                }
                            }}
                            className={`p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 ${
                                activeConversation === conversation.id ? 'bg-white/10' : ''
                            } ${
                                !canViewConversation(conversation) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            >
                            <div className="flex items-start gap-3">
                                <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                    <FaUser className="text-lg" />
                                </div>
                                {conversation.unreadCount > 0 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-xs flex items-center justify-center">
                                    {conversation.unreadCount}
                                    </div>
                                )}
                                {!canViewConversation(conversation) && (
                                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                                    <FaLock className="text-xs" />
                                    </div>
                                )}
                                </div>
                                <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold truncate">
                                    {conversation.userName}
                                    {!canViewConversation(conversation) && (
                                        <span className="text-xs text-gray-400 ml-2">(Locked)</span>
                                    )}
                                    </h3>
                                    <span className="text-xs text-gray-400">
                                    {formatTime(conversation.lastMessageTime)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 truncate mb-1">
                                    {conversation.lastMessage || 'No messages yet'}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <FaCalendarAlt />
                                    <span>{formatDate(conversation.lastMessageTime)}</span>
                                    {isOwner && (
                                    <>
                                        <span>•</span>
                                        <span>{conversation.userPhone}</span>
                                    </>
                                    )}
                                </div>
                                </div>
                            </div>
                            </div>
                        ))
                        )}
                    </div>
                    </div>

                    {/* Chat Area */}
                    <div className="lg:w-2/3 flex flex-col">
                    {activeConversation && activeConv ? (
                        <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                <FaUser />
                            </div>
                            <div>
                                <h3 className="font-bold">{activeConv.userName}</h3>
                                {isOwner && (
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <FaPhone className="text-xs" />
                                    <span>{activeConv.userPhone}</span>
                                    <span>•</span>
                                    <FaEnvelope className="text-xs" />
                                    <span>{activeConv.userEmail}</span>
                                </div>
                                )}
                            </div>
                            </div>
                            <div className="flex items-center gap-2">
                            {isOwner && (
                                <>
                                <button 
                                    onClick={() => window.location.href = `tel:${activeConv.userPhone}`}
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                                >
                                    <FaPhone />
                                </button>
                                <button 
                                    onClick={() => window.location.href = `mailto:${activeConv.userEmail}`}
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                                >
                                    <FaEnvelope />
                                </button>
                                </>
                            )}
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {activeConv.messages.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <FaPaperPlane className="text-4xl mx-auto mb-4 opacity-50" />
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                            ) : (
                            activeConv.messages.map((message) => (
                                <div
                                key={message.id}
                                className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                                >
                                <div
                                    className={`max-w-[70%] rounded-2xl p-4 ${
                                    message.sender === 'user'
                                        ? 'bg-white/10 rounded-bl-none'
                                        : 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-br-none'
                                    }`}
                                >
                                    <p className="mb-1">{message.text}</p>
                                    <div className="flex items-center justify-end gap-2 text-xs text-gray-400">
                                    <span>{formatTime(message.timestamp)}</span>
                                    {message.sender === 'owner' && (
                                        message.read ? (
                                        <FaCheckDouble className="text-blue-400" />
                                        ) : (
                                        <FaCheck />
                                        )
                                    )}
                                    </div>
                                </div>
                                </div>
                            ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 py-6 border-t border-white/10">
                            {isOwner ? (
                            <div className="flex gap-2">
                                <input
                                type="text"
                                placeholder="Type your reply..."
                                className="flex-1 px-4 py-4 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-blue-500/50"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                    const input = e.target as HTMLInputElement;
                                    if (input.value.trim()) {
                                        sendOwnerMessage(input.value);
                                        input.value = '';
                                    }
                                    }
                                }}
                                />
                                <button 
                                onClick={() => {
                                    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                                    if (input?.value.trim()) {
                                    sendOwnerMessage(input.value);
                                    input.value = '';
                                    }
                                }}
                                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transition-transform"
                                >
                                <FaPaperPlane />
                                </button>
                            </div>
                            ) : (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <textarea
                                    value={userMessage}
                                    onChange={(e) => setUserMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                    className="w-full px-4 py-3 pr-12 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-blue-500/50 resize-none"
                                    rows={2}
                                    />
                                    <button
                                    onClick={sendMessage}
                                    disabled={!userMessage.trim()}
                                    className={`absolute right-2 top-6 p-2 rounded-lg transition-all ${
                                        userMessage.trim()
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105'
                                        : 'bg-white/10 opacity-50'
                                    }`}
                                    >
                                    <FaPaperPlane />
                                    </button>
                                </div>
                                </div>
                                <div className="text-xs text-gray-400 flex items-center gap-2">
                                <FaInfoCircle />
                                <span>Your messages are saved locally. The owner will see them when they check.</span>
                                </div>
                            </div>
                            )}
                        </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-8">
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
                            {isOwner ? (
                                <FaUserTie className="text-2xl" />
                            ) : (
                                <FaUser className="text-2xl" />
                            )}
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                            {isOwner 
                                ? 'Select a Conversation' 
                                : 'Start a Conversation'
                            }
                            </h3>
                            <p className="text-gray-400 mb-6 max-w-md">
                            {isOwner 
                                ? 'Select a conversation from the sidebar to view messages and reply to clients.'
                                : 'Enter your details to start chatting with our property experts.'
                            }
                            </p>
                            {!isOwner && (
                            <button
                                onClick={() => setIsUserFormVisible(true)}
                                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transition-transform"
                            >
                                Start Chatting
                            </button>
                            )}
                        </div>
                        </div>
                    )}
                    </div>
                </div>
                </div>

                {/* User Information Form (Modal) */}
                {isUserFormVisible && !isOwner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="relative w-full max-w-md bg-gradient-to-br from-[#0f1425] to-[#0a0e1a] rounded-3xl border border-white/10 shadow-2xl p-8">
                    <button
                        onClick={() => setIsUserFormVisible(false)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                    >
                        <FaTimes />
                    </button>
                    
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                        <FaUser className="text-2xl" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Let's Get Started</h3>
                        <p className="text-gray-400">Enter your details to start chatting</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                        <label className="block text-sm text-gray-400 mb-2">Name *</label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-blue-500/50"
                            placeholder="Enter your full name"
                        />
                        </div>
                        <div>
                        <label className="block text-sm text-gray-400 mb-2">Email Address *</label>
                        <input
                            type="email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-blue-500/50"
                            placeholder="Enter your email"
                        />
                        </div>
                        <div>
                        <label className="block text-sm text-gray-400 mb-2">Phone Number (Optional)</label>
                        <input
                            type="tel"
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-blue-500/50"
                            placeholder="+234 XXX XXX XXXX"
                        />
                        </div>

                        <button
                        onClick={saveUserData}
                        disabled={!userName.trim() || !userEmail.trim()}
                        className={`w-full py-3 rounded-lg transition-all ${
                            userName.trim() && userEmail.trim()
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105'
                            : 'bg-white/10 opacity-50'
                        }`}
                        >
                        Start Chatting
                        </button>

                        <p className="text-xs text-gray-400 text-center">
                        Your information is saved locally on your device. No account required!
                        </p>
                    </div>
                    </div>
                </div>
                )}
            </section>

            {/* Features Section */}
            <section className="relative py-12 px-4 md:px-16">
                <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:border-blue-500/50">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                        <FaUser className="text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Sign-up Required</h3>
                    <p className="text-gray-400">Start chatting instantly without creating an account</p>
                    </div>
                    <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:border-blue-500/50">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                        <FaClock className="text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">24/7 Access</h3>
                    <p className="text-gray-400">Your conversations are saved and available anytime</p>
                    </div>
                    <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:border-blue-500/50">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                        <FaWhatsapp className="text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Direct Owner Access</h3>
                    <p className="text-gray-400">Chat directly with the property experts</p>
                    </div>
                </div>
                </div>
            </section>

            {/* Footer */}
            <FooterUi />
        </div>
    );
}