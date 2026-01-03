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
  FaEnvelope,
  FaTrash,
  FaExclamationCircle
} from "react-icons/fa";
import { useState, useEffect, useRef, KeyboardEvent } from "react";
import FooterUi from "../components/Footer";
import { useRouter } from "next/navigation";

import { 
  collection, 
  doc, 
  addDoc,
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
  getDocs
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
  createdAt: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadOwnerCount: number;
  unreadUserCount: number;
  createdAt: Date;
}

// Helper function to convert Firebase Timestamp to Date
const convertTimestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp || Date.now());
};

// Toast Notification Component
const ToastNotification = ({ 
  message, 
  type = 'info',
  onClose 
}: { 
  message: string; 
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'text-xs bg-gradient-to-r from-blue-500/90 to-indigo-600/90',
    error: 'text-xs bg-gradient-to-r from-red-500/90 to-rose-600/90',
    info: 'text-xs bg-gradient-to-r from-blue-500/90 to-indigo-600/90',
    warning: 'text-xs bg-gradient-to-r from-yellow-500/90 to-amber-600/90'
  }[type];

  const icon = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
    warning: '⚠'
  }[type];

  return (
    // Toast container
    <div className={`fixed top-6 right-6 z-50 ${bgColor} backdrop-blur-sm text-white px-4 py-2 rounded-2xl shadow-2xl animate-slideInRight max-w-md`}>
        <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{icon}</span>
            <p className="flex-1 text-xs">{message}</p>
            <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-1"
            >
            <FaTimes />
            </button>
        </div>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ 
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#0f1425] to-[#0a0e1a] rounded-3xl border border-white/10 shadow-2xl p-8 animate-scaleIn">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500/20 to-rose-600/20 flex items-center justify-center mx-auto mb-4">
            <FaExclamationCircle className="text-2xl text-red-400" />
          </div>
          <h3 className="font-bold mb-2">{title}</h3>
          <p className="text-gray-400 text-xs">{message}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:scale-105 transition-transform"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ChatPageUi() {
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    // User states
    const [activeConversation, setActiveConversation] = useState<string | null>(null);
    const [userMessage, setUserMessage] = useState('');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [isUserFormVisible, setIsUserFormVisible] = useState(true);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Authentication states
    const [isOwner, setIsOwner] = useState(false);
    const [ownerEmail, setOwnerEmail] = useState('');
    const [ownerPassword, setOwnerPassword] = useState('');
    const [showOwnerLogin, setShowOwnerLogin] = useState(false);
    const [authError, setAuthError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthLoading, setIsAuthLoading] = useState(false);
    
    // Messages
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserData, setCurrentUserData] = useState<any>(null);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

    // Toast notifications
    const [toasts, setToasts] = useState<Array<{
        id: string;
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
    }>>([]);

    // Confirmation modal
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        onConfirm: () => void;
    } | null>(null);

    // Add toast notification
    const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setToasts(prev => [...prev, { id, message, type }]);
    };

    // Remove toast notification
    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Show confirmation modal
    const showConfirmation = (config: {
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        onConfirm: () => void;
    }) => {
        setConfirmationModal({
        isOpen: true,
        ...config
        });
    };

    // Close confirmation modal
    const closeConfirmation = () => {
        setConfirmationModal(null);
    };

    // Check authentication state on component mount
    useEffect(() => {
        console.log("Setting up auth listener");
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log("Auth state changed. User:", user?.uid);
        if (user) {
            console.log("CEO logged in with UID:", user.uid);
            setIsOwner(true);
            setIsAuthLoading(false);
            loadAllConversations(); // CEO sees all conversations
        } else {
            console.log("Regular user mode - no authenticated user");
            setIsOwner(false);
            setIsAuthLoading(false);
            loadUserDataFromLocalStorage();
        }
        });

        return () => {
        console.log("Cleaning up auth listener");
        unsubscribe();
        };
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (shouldScrollToBottom && messagesEndRef.current) {
        console.log("Scrolling to bottom");
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        setShouldScrollToBottom(false);
        }
    }, [messages, shouldScrollToBottom]);

    // Load user data from localStorage for regular users
    const loadUserDataFromLocalStorage = () => {
        const savedUserData = localStorage.getItem('abidex_chat_user');
        if (savedUserData) {
        const userData = JSON.parse(savedUserData);
        console.log("Loaded user data from localStorage:", userData);
        setUserName(userData.name || '');
        setUserEmail(userData.email || '');
        setUserPhone(userData.phone || '');
        setCurrentUserId(userData.userId);
        setCurrentUserData(userData);
        setIsUserFormVisible(false);
        
        // Load conversation for this user
        if (userData.conversationId) {
            console.log("Setting active conversation from localStorage:", userData.conversationId);
            setActiveConversation(userData.conversationId);
            loadUserConversation(userData.userId);
        }
        } else {
        console.log("No user data found in localStorage");
        setIsUserFormVisible(true);
        }
        setIsLoading(false);
    };

    // CEO: Load ALL conversations (no filters)
    const loadAllConversations = () => {
        console.log("Loading ALL conversations for CEO");
        try {
        const conversationsRef = collection(db, "conversations");
        // CEO sees all conversations - no where clause
        const q = query(conversationsRef, orderBy("lastMessageTime", "desc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log("CEO conversation snapshot received:", snapshot.size, "conversations");
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
                unreadOwnerCount: data.unreadOwnerCount || 0,
                unreadUserCount: data.unreadUserCount || 0,
                createdAt: convertTimestampToDate(data.createdAt)
            };
            firebaseConversations.push(conversation);
            });
            
            console.log("Setting CEO conversations:", firebaseConversations.length);
            setConversations(firebaseConversations);
            
            // Set first conversation as active if none selected
            if (firebaseConversations.length > 0 && !activeConversation) {
            console.log("Setting first conversation as active:", firebaseConversations[0].id);
            setActiveConversation(firebaseConversations[0].id);
            }
            
            setIsLoading(false);
        }, (error) => {
            console.error("CEO conversation listener error:", error);
            setIsLoading(false);
        });

        return unsubscribe;
        } catch (error) {
        console.error("Error loading CEO conversations:", error);
        setIsLoading(false);
        return () => {};
        }
    };

    // User: Load only their conversation
    const loadUserConversation = (userId: string) => {
        console.log("Loading conversation for user:", userId);
        try {
        const conversationsRef = collection(db, "conversations");
        // User sees only their conversation
        const q = query(conversationsRef, where("userId", "==", userId));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log("User conversation snapshot received:", snapshot.size, "conversations");
            const userConversations: Conversation[] = [];
            
            snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const conversation: Conversation = {
                id: docSnap.id,
                userId: data.userId || '',
                userName: data.userName || '',
                userEmail: data.userEmail || '',
                userPhone: data.userPhone || '',
                lastMessage: data.lastMessage || '',
                lastMessageTime: convertTimestampToDate(data.lastMessageTime),
                unreadOwnerCount: data.unreadOwnerCount || 0,
                unreadUserCount: data.unreadUserCount || 0,
                createdAt: convertTimestampToDate(data.createdAt)
            };
            userConversations.push(conversation);
            
            // Update local storage with conversation ID if not set
            if (!currentUserData?.conversationId) {
                const updatedUserData = {
                ...currentUserData,
                conversationId: docSnap.id
                };
                localStorage.setItem('abidex_chat_user', JSON.stringify(updatedUserData));
                setCurrentUserData(updatedUserData);
            }
            });
            
            console.log("Setting user conversations:", userConversations.length);
            setConversations(userConversations);
            
            // Set active conversation if available
            if (userConversations.length > 0 && !activeConversation) {
            console.log("Setting user conversation as active:", userConversations[0].id);
            setActiveConversation(userConversations[0].id);
            }
            
            setIsLoading(false);
        }, (error) => {
            console.error("User conversation listener error:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
        } catch (error) {
        console.error("Error loading user conversation:", error);
        setIsLoading(false);
        return () => {};
        }
    };

    // Load messages for active conversation
    useEffect(() => {
        if (!activeConversation) {
        console.log("No active conversation, clearing messages");
        setMessages([]);
        return;
        }

        console.log("Loading messages for conversation:", activeConversation);
        const messagesRef = collection(db, "conversations", activeConversation, "messages");
        const q = query(messagesRef, orderBy("createdAt", "asc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log("Messages snapshot received:", snapshot.size, "messages");
        const loadedMessages: Message[] = [];
        
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const message: Message = {
            id: docSnap.id,
            text: data.text || '',
            sender: data.sender || 'user',
            createdAt: convertTimestampToDate(data.createdAt),
            read: data.read || false
            };
            loadedMessages.push(message);
        });
        
        console.log("Setting messages:", loadedMessages.length);
        setMessages(loadedMessages);
        
        // Mark messages as read when viewing
        markMessagesAsRead(activeConversation, loadedMessages);
        
        // Trigger scroll to bottom when new messages arrive
        if (loadedMessages.length > 0) {
            setShouldScrollToBottom(true);
        }
        }, (error) => {
        console.error("Messages listener error:", error);
        });

        return () => unsubscribe();
    }, [activeConversation]);

    // Mark messages as read
    const markMessagesAsRead = async (conversationId: string, messagesList: Message[]) => {
        const unreadMessages = messagesList.filter(msg => 
        ((isOwner && msg.sender === 'user') || (!isOwner && msg.sender === 'owner')) && !msg.read
        );
        
        if (unreadMessages.length === 0) return;
        
        try {
        const convRef = doc(db, "conversations", conversationId);
        const updates: any = {};
        
        if (isOwner) {
            // CEO viewing - mark user messages as read
            updates.unreadOwnerCount = 0;
        } else {
            // User viewing - mark owner messages as read
            updates.unreadUserCount = 0;
        }
        
        await updateDoc(convRef, updates);
        
        // Update individual messages
        const batchPromises = unreadMessages.map(msg => {
            const msgRef = doc(db, "conversations", conversationId, "messages", msg.id);
            return updateDoc(msgRef, { read: true });
        });
        
        await Promise.all(batchPromises);
        console.log("Marked", unreadMessages.length, "messages as read");
        } catch (error) {
        console.error("Error marking messages as read:", error);
        }
    };

    // Start new chat for user
    const startChat = async () => {
        if (!userName.trim() || !userEmail.trim()) {
        addToast('Please enter your name and email', 'warning');
        return;
        }
        
        try {
        setIsLoading(true);
        console.log("Starting new chat...");
        
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const convRef = doc(db, "conversations", conversationId);
        
        const userData = {
            userId,
            name: userName.trim(),
            email: userEmail.trim(),
            phone: userPhone.trim() || "",
            conversationId
        };
        
        console.log("Creating conversation with ID:", conversationId);
        
        // Save to Firebase
        await setDoc(convRef, {
            id: conversationId,
            userId,
            userName: userName.trim(),
            userEmail: userEmail.trim(),
            userPhone: userPhone.trim() || "",
            lastMessage: "",
            lastMessageTime: serverTimestamp(),
            unreadOwnerCount: 0,
            unreadUserCount: 0,
            createdAt: serverTimestamp()
        });
        
        console.log("Conversation created in Firebase");
        
        // Save to localStorage
        localStorage.setItem('abidex_chat_user', JSON.stringify(userData));
        
        // Update state
        setCurrentUserId(userId);
        setCurrentUserData(userData);
        setIsUserFormVisible(false);
        setActiveConversation(conversationId);
        
        // Create initial conversation object for state
        const newConversation: Conversation = {
            id: conversationId,
            userId,
            userName: userName.trim(),
            userEmail: userEmail.trim(),
            userPhone: userPhone.trim() || "",
            lastMessage: "",
            lastMessageTime: new Date(),
            unreadOwnerCount: 0,
            unreadUserCount: 0,
            createdAt: new Date()
        };
        
        setConversations([newConversation]);
        addToast('Chat started successfully! You can now send messages.', 'success');
        
        } catch (error) {
        console.error("Error starting chat:", error);
        addToast('Failed to start chat. Please check your internet connection and try again.', 'error');
        } finally {
        setIsLoading(false);
        }
    };

    // Send message
    const sendMessage = async () => {
        const messageText = userMessage.trim();
        if (!messageText || !activeConversation) {
        console.log("Cannot send: no text or no active conversation");
        return;
        }
        
        try {
        console.log("Sending message:", messageText);
        
        // Add message to subcollection
        const messagesRef = collection(db, "conversations", activeConversation, "messages");
        await addDoc(messagesRef, {
            text: messageText,
            sender: isOwner ? 'owner' : 'user',
            read: false,
            createdAt: serverTimestamp()
        });
        
        console.log("Message added to Firebase");
        
        // Update conversation with last message
        const convRef = doc(db, "conversations", activeConversation);
        const conversation = conversations.find(c => c.id === activeConversation);
        
        const updates: any = {
            lastMessage: messageText,
            lastMessageTime: serverTimestamp()
        };
        
        // Update unread counts
        if (isOwner) {
            // CEO sending to user - increment user's unread count
            updates.unreadUserCount = (conversation?.unreadUserCount || 0) + 1;
            console.log("Incrementing unreadUserCount to:", updates.unreadUserCount);
        } else {
            // User sending to CEO - increment CEO's unread count
            updates.unreadOwnerCount = (conversation?.unreadOwnerCount || 0) + 1;
            console.log("Incrementing unreadOwnerCount to:", updates.unreadOwnerCount);
        }
        
        await updateDoc(convRef, updates);
        console.log("Conversation updated in Firebase");
        
        // Clear input
        setUserMessage('');
        
        // Show success toast for user messages
        if (!isOwner) {
            addToast('Msg sent!', 'success');
        }
        
        } catch (error) {
        console.error("Error sending message:", error);
        addToast('Failed to send message. Please try again.', 'error');
        }
    };

    // Handle CEO login
    const handleOwnerLogin = async () => {
        setAuthError('');
        if (!ownerEmail.trim() || !ownerPassword.trim()) {
        setAuthError('Please enter email and password');
        return;
        }
        
        try {
        setIsAuthLoading(true);
        console.log("Attempting CEO login...");
        await signInWithEmailAndPassword(auth, ownerEmail, ownerPassword);
        console.log("CEO login successful");
        setShowOwnerLogin(false);
        setOwnerEmail('');
        setOwnerPassword('');
        addToast('CEO login successful!', 'success');
        } catch (error: any) {
        console.error("Login error:", error);
        
        if (error.code === 'auth/invalid-credential') {
            setAuthError('Invalid email or password.');
        } else if (error.code === 'auth/user-not-found') {
            setAuthError('No account found with this email.');
        } else if (error.code === 'auth/wrong-password') {
            setAuthError('Incorrect password.');
        } else if (error.code === 'auth/too-many-requests') {
            setAuthError('Too many login attempts. Please try again later.');
        } else {
            setAuthError('Login failed. Please try again.');
        }
        } finally {
        setIsAuthLoading(false);
        }
    };

    // Handle CEO logout - FIXED to properly clear CEO state
    const handleOwnerLogout = async () => {
        try {
        console.log("CEO logging out...");
        await signOut(auth);
        
        // Clear all CEO-related state
        setIsOwner(false);
        setActiveConversation(null);
        setConversations([]);
        setMessages([]);
        setCurrentUserId(null);
        setCurrentUserData(null);
        
        // Clear any local storage that might have CEO data
        localStorage.removeItem('abidex_chat_user');
        
        // Reset user form
        setUserName('');
        setUserEmail('');
        setUserPhone('');
        setIsUserFormVisible(true);
        
        console.log("CEO logged out and state cleared");
        addToast('Logged out successfully', 'info');
        } catch (error) {
        console.error("Logout error:", error);
        addToast('Failed to logout. Please try again.', 'error');
        }
    };

    // Delete conversation with better error handling
    const deleteConversation = async (conversationId: string) => {
        showConfirmation({
        title: "Delete Conversation",
        message: isOwner 
            ? "Are you sure you want to delete this conversation? This action cannot be undone."
            : "Are you sure you want to delete your conversation? This will clear all your chat data.",
        confirmText: isOwner ? "Delete Permanently" : "Delete My Chat",
        cancelText: "Cancel",
        onConfirm: async () => {
            try {
            console.log("Deleting conversation:", conversationId);
            const convRef = doc(db, "conversations", conversationId);
            
            if (isOwner) {
                // CEO deletes conversation completely
                try {
                // First, try to delete all messages in subcollection
                const messagesRef = collection(db, "conversations", conversationId, "messages");
                const messagesQuery = query(messagesRef);
                const messagesSnapshot = await getDocs(messagesQuery);
                
                if (!messagesSnapshot.empty) {
                    const deletePromises = messagesSnapshot.docs.map(async (messageDoc) => {
                    try {
                        await deleteDoc(doc(db, "conversations", conversationId, "messages", messageDoc.id));
                    } catch (messageError) {
                        console.warn(`Could not delete message ${messageDoc.id}:`, messageError);
                    }
                    });
                    
                    await Promise.all(deletePromises);
                    console.log("All messages deleted");
                }
                } catch (messagesError) {
                console.warn("Error deleting messages, continuing with conversation deletion:", messagesError);
                }
                
                // Then delete the conversation
                await deleteDoc(convRef);
                console.log("Conversation deleted by CEO");
                addToast('Conversation deleted successfully', 'success');
            } else {
                // User deletes - we'll just clear their local data
                localStorage.removeItem('abidex_chat_user');
                setCurrentUserData(null);
                setCurrentUserId(null);
                setUserName('');
                setUserEmail('');
                setUserPhone('');
                setIsUserFormVisible(true);
                setConversations([]);
                setActiveConversation(null);
                setMessages([]);
                console.log("User conversation cleared");
                addToast('Your conversation has been cleared', 'info');
            }
            
            // Remove from local state
            setConversations(prev => prev.filter(conv => conv.id !== conversationId));
            
            // If active conversation was deleted, clear it
            if (activeConversation === conversationId) {
                setActiveConversation(null);
                setMessages([]);
            }
            
            } catch (error) {
            console.error("Error deleting conversation:", error);
            addToast('Failed to delete conversation. Please try again.', 'error');
            } finally {
            closeConfirmation();
            }
        }
        });
    };

    // Format time
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Format date
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

    // Handle key press for sending messages
    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
        }
    };

    // Filter conversations based on search term (for CEO)
    const filteredConversations = isOwner 
        ? conversations.filter(conv =>
            conv.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : conversations;

    // Calculate total unread messages for CEO
    const totalUnreadCount = isOwner 
        ? conversations.reduce((sum, conv) => sum + conv.unreadOwnerCount, 0)
        : conversations.reduce((sum, conv) => sum + conv.unreadUserCount, 0);

    const activeConv = conversations.find(conv => conv.id === activeConversation);

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
        {/* Toast Notifications */}
        {toasts.map(toast => (
            <ToastNotification
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            />
        ))}

        {/* Confirmation Modal */}
        {confirmationModal && (
            <ConfirmationModal
            isOpen={confirmationModal.isOpen}
            title={confirmationModal.title}
            message={confirmationModal.message}
            confirmText={confirmationModal.confirmText}
            cancelText={confirmationModal.cancelText}
            onConfirm={confirmationModal.onConfirm}
            onCancel={closeConfirmation}
            />
        )}
        
        {/* Back button */}
        <div
            onClick={() => {
            if (window.history.length > 1) {
                router.back();
            } else {
                router.push("/");
            }
            }}
            className="cursor-pointer px-4 py-2 border text-gray-400 rounded-lg absolute top-24 md:top-2 right-6 z-50 hover:text-white hover:border-white transition"
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
                    ? `Owner Dashboard - ${conversations.length} conversations (${totalUnreadCount} unread)`
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
                    {totalUnreadCount > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-red-500 animate-pulse">
                        {totalUnreadCount} unread
                    </span>
                    )}
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
                    <span>Access Admin Dashboard</span>
                </button>
                </div>
            )}
            </div>
        </section>

        {/* Owner Login Modal */}
        {showOwnerLogin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-0 bg-black/80 backdrop-blur-sm">
                <div className="relative w-full max-w-md bg-gradient-to-br from-[#0f1425] to-[#0a0e1a] rounded-3xl border border-white/10 shadow-2xl p-8 pb-0">
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
                    <p className="text-gray-400">Enter your credentials to access all conversations</p>
                    </div>

                    <div className="space-y-4">
                    <div>
                        <input
                        type="email"
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder="CEO Email"
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
                    </div>
                    
                    <button
                        onClick={handleOwnerLogin}
                        disabled={isAuthLoading}
                        className={`w-full py-3 rounded-lg transition-transform ${isAuthLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} bg-gradient-to-r from-blue-600 to-purple-600`}
                    >
                        {isAuthLoading ? 'Logging in...' : 'Login as Owner'}
                    </button>
                    </div>
                </div>
            </div>
        )}
        
        {/* Scroll anchor - ONLY ONE */}
        <div className="pb-3" ref={messagesEndRef} />

        {/* Main Chat Container */}
        <section className="relative max-w-7xl mx-auto px-4 md:px-6 pb-20 z-10">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl overflow-hidden">
            <div className="flex flex-col lg:flex-row h-full">
                
                {/* Conversations Sidebar */}
                <div className="lg:w-1/3 border-r border-white/10">
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
                            <p className="text-sm mt-2">When users start chats, they will appear here</p>
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
                        onClick={() => setActiveConversation(conversation.id)}
                        className={`p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 ${
                            activeConversation === conversation.id ? 'bg-white/10' : ''
                        }`}
                        >
                        <div className="flex items-start gap-3">
                            <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                <FaUser className="text-lg" />
                            </div>
                            {/* Unread badge */}
                            {((isOwner && conversation.unreadOwnerCount > 0) || 
                                (!isOwner && conversation.unreadUserCount > 0)) && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-xs flex items-center justify-center animate-pulse">
                                {isOwner ? conversation.unreadOwnerCount : conversation.unreadUserCount}
                                </div>
                            )}
                            </div>
                            <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold truncate">{conversation.userName}</h3>
                                <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                    {conversation.lastMessageTime ? formatTime(conversation.lastMessageTime) : ''}
                                </span>
                                <button
                                    onClick={(e) => {
                                    e.stopPropagation();
                                    deleteConversation(conversation.id);
                                    }}
                                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                    title="Delete conversation"
                                >
                                    <FaTrash className="text-xs" />
                                </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 truncate mb-1">
                                {conversation.lastMessage || 'No messages yet'}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <FaCalendarAlt />
                                <span>{conversation.lastMessageTime ? formatDate(conversation.lastMessageTime) : 'New'}</span>
                                {isOwner && conversation.userPhone && (
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
                <div className="lg:w-2/3 flex flex-col" ref={chatContainerRef}>
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
                                {activeConv.unreadOwnerCount > 0 && (
                                <span className="text-xs px-2 py-1 rounded-full bg-red-500 animate-pulse">
                                    {activeConv.unreadOwnerCount} unread
                                </span>
                                )}
                            </div>
                            )}
                        </div>
                        </div>
                        <div className="flex items-center gap-2">
                        {isOwner && activeConv.userPhone && (
                            <button 
                            onClick={() => window.location.href = `tel:${activeConv.userPhone}`}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                            title="Call"
                            >
                            <FaPhone />
                            </button>
                        )}
                        {isOwner && activeConv.userEmail && (
                            <button 
                            onClick={() => window.location.href = `mailto:${activeConv.userEmail}`}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                            title="Email"
                            >
                            <FaEnvelope />
                            </button>
                        )}
                        <button
                            onClick={() => deleteConversation(activeConv.id)}
                            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all text-red-400"
                            title="Delete conversation"
                        >
                            <FaTrash />
                        </button>
                        </div>
                    </div>

                    {/* Messages Area - Scrollable container */}
                    <div 
                        className="flex-1 overflow-y-auto p-4 space-y-4"
                        style={{ 
                        maxHeight: '400px',
                        minHeight: '400px'
                        }}
                    >
                        {messages.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <FaPaperPlane className="text-4xl mx-auto mb-4 opacity-50" />
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                        ) : (
                        messages.map((message) => (
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
                                <span>{formatTime(message.createdAt)}</span>
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
                    </div>

                    {/* Message Input */}
                    <div className="p-4 py-6 border-t border-white/10">
                        <div className="space-y-3">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                            <textarea
                                value={userMessage}
                                onChange={(e) => setUserMessage(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder={isOwner ? "Type your reply..." : "Type your message..."}
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
                        {!isOwner && (
                            <div className="text-xs text-gray-400 flex items-center gap-2">
                            <FaInfoCircle />
                            <span>Your messages are saved and the owner will respond soon.</span>
                            </div>
                        )}
                        </div>
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
                            ? conversations.length === 0 ? 'No conversations yet' : 'Select a Conversation'
                            : 'Start a Conversation'
                        }
                        </h3>
                        <p className="text-gray-400 mb-6 max-w-md">
                        {isOwner 
                            ? conversations.length === 0 
                            ? 'When users start chats, they will appear here' 
                            : 'Select a conversation from the sidebar to view messages and reply to clients.'
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
                    onClick={startChat}
                    disabled={!userName.trim() || !userEmail.trim() || isLoading}
                    className={`w-full py-3 rounded-lg transition-all ${
                        userName.trim() && userEmail.trim() && !isLoading
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105'
                        : 'bg-white/10 opacity-50'
                    }`}
                    >
                    {isLoading ? 'Starting chat...' : 'Start Chatting'}
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