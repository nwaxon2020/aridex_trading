"use client"

import { 
  FaWhatsapp, 
  FaPhone, 
  FaEnvelope,
  FaMapMarkerAlt,
  FaExpand,
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaCheckCircle,
  FaHome,
  FaPlay,
  FaPause,
  FaVideo,
  FaTimes
} from "react-icons/fa";
import { useState, useEffect, useRef, MouseEvent } from "react";
import FooterUi from "../components/Footer";
import Link from "next/link";
import { db } from '@/lib/firebaseconfig';
import { collection, getDocs } from 'firebase/firestore';

// Define TypeScript interfaces
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
  customType?: string;
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
}

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
  isLiked: boolean;
  onLike: (e: MouseEvent) => void;
  likesCount: number;
  onPlayVideo?: () => void;
  hasVideo?: boolean;
}

interface FirebaseProperty {
  id?: string;
  title: string;
  location: string;
  price: string;
  negotiable: boolean;
  type: string;
  customType?: string;
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
  createdAt?: any;
}

export default function BlogPageUi() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [likedProperties, setLikedProperties] = useState<string[]>([]);
  const [propertiesLikes, setPropertiesLikes] = useState<Record<string, number>>({});
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const phoneNumber = "+2349136552111";

 useEffect(() => {
    // Smooth scroll to some pixels from top when component mounts
    window.scrollTo({
      top: 50,
      behavior: 'smooth'
    });
  }, []);

  // Load properties from Firebase
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'blog_properties'));
        const firebaseProperties: FirebaseProperty[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FirebaseProperty[];
        
        // Convert Firebase properties to our Property interface
        const formattedProperties: Property[] = firebaseProperties.map(prop => ({
          ...prop,
          features: prop.features || [],
          images: prop.images || []
        })).sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt.seconds * 1000).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt.seconds * 1000).getTime() : 0;
          return timeB - timeA; // Newest first
        });
        
        setProperties(formattedProperties);
        
        // Initialize likes for Firebase properties
        const initialLikes: Record<string, number> = {};
        formattedProperties.forEach(property => {
          if (property.id) {
            initialLikes[property.id] = Math.floor(Math.random() * 50) + 10; // Random likes between 10-60
          }
        });
        
        setPropertiesLikes(prev => ({
          ...prev,
          ...initialLikes
        }));
      } catch (error) {
        console.error('Error fetching properties:', error);
        // Use static fallback data
        setProperties(getStaticProperties());
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, []);

  // Load liked properties and likes count from localStorage on component mount
  useEffect(() => {
    const savedLikedProperties = localStorage.getItem('abidex_liked_properties');
    const savedPropertiesLikes = localStorage.getItem('abidex_properties_likes');
    
    if (savedLikedProperties) {
      setLikedProperties(JSON.parse(savedLikedProperties));
    }
    
    if (savedPropertiesLikes) {
      setPropertiesLikes(JSON.parse(savedPropertiesLikes));
    }
  }, []);

  // Save liked properties to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('abidex_liked_properties', JSON.stringify(likedProperties));
  }, [likedProperties]);

  // Save properties likes to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('abidex_properties_likes', JSON.stringify(propertiesLikes));
  }, [propertiesLikes]);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setSelectedImage(0);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedProperty(null);
    setVideoModalOpen(false);
    setVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    document.body.style.overflow = 'auto';
  };

  const handleLike = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    
    // Update likes count
    setPropertiesLikes(prev => {
      const newLikes = { ...prev };
      if (likedProperties.includes(id)) {
        // Unlike - decrease count
        newLikes[id] = Math.max(0, (newLikes[id] || 0) - 1);
        setLikedProperties(likedProperties.filter(propId => propId !== id));
      } else {
        // Like - increase count
        newLikes[id] = (newLikes[id] || 0) + 1;
        setLikedProperties([...likedProperties, id]);
      }
      return newLikes;
    });
  };

  const nextImage = () => {
    if (selectedProperty) {
      setSelectedImage((prev) => 
        prev === selectedProperty.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProperty) {
      setSelectedImage((prev) => 
        prev === 0 ? selectedProperty.images.length - 1 : prev - 1
      );
    }
  };

  const handlePlayVideo = (property: Property) => {
    setSelectedProperty(property);
    setVideoModalOpen(true);
    setVideoPlaying(true);
    document.body.style.overflow = 'hidden';
  };

  const handleVideoControl = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (selectedProperty || videoModalOpen)) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedProperty, videoModalOpen]);

  // Auto-play video when modal opens
  useEffect(() => {
    if (videoModalOpen && videoRef.current) {
      videoRef.current.play().catch(e => {
        console.log("Auto-play prevented:", e);
      });
    }
  }, [videoModalOpen]);

  // Static fallback properties
  const getStaticProperties = (): Property[] => [
    {
      id: '1',
      title: "Luxury Villa with Ocean View",
      location: "Lekki, Lagos",
      price: "$850,000",
      negotiable: true,
      type: "Villa",
      bedrooms: 5,
      bathrooms: 4,
      area: "4500 sqft",
      images: [
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop"
      ],
      description: "Stunning modern villa with panoramic ocean views, infinity pool, and smart home features.",
      features: [{id: '1', text: "Ocean View"}, {id: '2', text: "Infinity Pool"}, {id: '3', text: "Smart Home"}],
      contact: {
        phone: "+2349136552111",
        email: "abidextradingnigltd@gmail.com"
      }
    },
    {
      id: '2',
      title: "Modern Penthouse Apartment",
      location: "Abuja Central",
      price: "$420,000",
      negotiable: false,
      type: "Apartment",
      bedrooms: 3,
      bathrooms: 3,
      area: "2800 sqft",
      images: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=600&fit=crop"
      ],
      description: "Luxurious penthouse with floor-to-ceiling windows, private terrace, and premium finishes.",
      features: [{id: '1', text: "Penthouse"}, {id: '2', text: "City View"}, {id: '3', text: "Private Terrace"}],
      contact: {
        phone: "+2349136552111",
        email: "abidextradingnigltd@gmail.com"
      }
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading properties...</p>
        </div>
      </div>
    );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#0f1425] to-[#0a0e1a] text-white overflow-x-hidden">
        
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Video Modal */}
        {videoModalOpen && selectedProperty && selectedProperty.videoUrl && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
            <div className="relative w-full max-w-4xl mx-auto">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute -top-10 right-0 md:-right-10 z-10 p-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
              
              {/* Video Player */}
              <div className="relative rounded-2xl overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  src={selectedProperty.videoUrl}
                  autoPlay
                  controls={false}
                  className="w-full h-auto max-h-[80vh]"
                  onPlay={() => setVideoPlaying(true)}
                  onPause={() => setVideoPlaying(false)}
                />
                
                {/* Custom Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                  <button
                    onClick={handleVideoControl}
                    className="p-3 bg-blue-600/80 hover:bg-blue-700/80 rounded-full backdrop-blur-sm transition-colors"
                  >
                    {videoPlaying ? <FaPause /> : <FaPlay />}
                  </button>
                </div>
              </div>
              
              <p className="text-center text-gray-400 mt-4 text-sm">
                Click the {videoPlaying ? 'pause' : 'play'} button to control video
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <section className="relative pt-24 pb-8 px-6">
            <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-2">
                <FaHeart className="text-pink-400" />
                <span className="text-sm">
                    You've liked <span className="text-pink-400 font-bold">{likedProperties.length}</span> properties
                </span>
                </div>
                
                <h1 className="text-3xl md:text-6xl font-bold tracking-tight mb-2 animate-fadeUp">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Exclusive Properties
                </span>
                <br />
                <span className="text-lg md:text-3xl text-gray-300 font-light">
                    Discover Your Dream Property
                </span>
                </h1>
                
                <p className="text-sm md:text-xl text-gray-400 max-w-3xl mx-auto">
                    Browse through our curated collection of premium properties. Click the heart to like your favorites!
                </p>
            </div>
            </div>

            {/* About us link */}
            <div className="flex justify-center gap-6 mt-4">
                <Link href={"/about-us"} className="text-blue-300 underline hover:text-blue-500">About Us</Link>
                <Link href={"/chat"} className="text-amber-300 underline hover:text-amber-500">Chat Us Now!</Link>
            </div>

            <div className="flex flex-col justify-center md:flex-row gap-4 mt-2 animate-fadeUp delay-300">
                
                <Link href={"/"} className="flex justify-center gap-2 group relative py-4 md:px-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-semibold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30">
                <FaHome className="text-xl z-10" />
                <span className="relative z-10">Home</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                
                {/* UPDATED: Schedule Consultation button now opens phone dialer */}
                <a 
                href={`tel:${phoneNumber}`}
                className="group px-5 py-4 rounded-full border-2 border-white/30 text-sm font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                <FaPhone className="group-hover:animate-pulse" />
                Schedule Consultation
                </a>
            </div>
        </section>

        {/* Properties Grid */}
        <section className="mt-8 relative max-w-7xl mx-auto px-3 md:px-6 pb-20 z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                  <PropertyCard 
                    key={property.id}
                    property={property}
                    onClick={() => handlePropertyClick(property)}
                    isLiked={property.id ? likedProperties.includes(property.id) : false}
                    onLike={(e) => property.id && handleLike(property.id, e)}
                    likesCount={property.id ? propertiesLikes[property.id] || 0 : 0}
                    onPlayVideo={() => handlePlayVideo(property)}
                    hasVideo={!!property.videoUrl}
                  />
              ))}
            </div>
        </section>

        {/* Property Detail Modal */}
        {selectedProperty && !videoModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-2 p-4 bg-black/80 backdrop-blur-sm">
              <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#0f1425] to-[#0a0e1a] rounded-3xl border border-white/10 shadow-2xl">
                
                {/* Close Button */}
                <button
                onClick={closeModal}
                className="absolute top-2 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>

                {/* Main Content */}
                <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 px-1 py-4 md:p-8">
                
                {/* Image Gallery */}
                <div className="relative">
                    <div className="relative h-96 md:h-full max-h-150 rounded-2xl overflow-hidden mb-4">
                      <img
                          src={selectedProperty.images[selectedImage]}
                          alt={selectedProperty.title}
                          className="w-full h-full object-cover"
                      />
                      
                      {/* Navigation Arrows */}
                      <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-all"
                      >
                          <FaChevronLeft className="text-white" />
                      </button>
                      <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-all"
                      >
                          <FaChevronRight className="text-white" />
                      </button>

                      {/* Price Tag */}
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 rounded-full">
                          <span className="font-bold text-lg">₦{selectedProperty.price}</span>
                      </div>

                      {/* Image Counter */}
                      <div className="absolute bottom-4 right-4 bg-black/50 px-3 py-1 rounded-full text-sm">
                          {selectedImage + 1} / {selectedProperty.images.length}
                      </div>
                    </div>

                    {/* Thumbnails - Scrollable */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                      {selectedProperty.images.map((img: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 relative w-20 h-20 rounded-xl overflow-hidden transition-all duration-300 ${
                            selectedImage === index 
                            ? 'ring-2 ring-blue-400 scale-105' 
                            : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`View ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                </div>

                {/* Property Details */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl md:text-3xl font-bold">{selectedProperty.title}</h2>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">
                              {selectedProperty.id ? (propertiesLikes[selectedProperty.id] || 0) : 0} likes
                          </span>
                          <button
                              onClick={(e) => selectedProperty.id && handleLike(selectedProperty.id, e)}
                              className={`p-3 rounded-full transition-all relative group ${
                              selectedProperty.id && likedProperties.includes(selectedProperty.id)
                                  ? 'bg-pink-500/20 text-pink-400'
                                  : 'bg-white/10 hover:bg-white/20'
                              }`}
                          >
                              <FaHeart className={`${selectedProperty.id && likedProperties.includes(selectedProperty.id) ? 'fill-pink-400' : ''}`} />
                              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {selectedProperty.id && likedProperties.includes(selectedProperty.id) ? 'Unlike' : 'Like'}
                              </div>
                          </button>
                        </div>
                    </div>
                    
                    <div className="text-sm md:text-base flex items-center gap-2 text-gray-400 mb-4">
                        <FaMapMarkerAlt className="text-blue-400" />
                        <span>{selectedProperty.location}</span>
                        <span className={`px-3 py-1 rounded-full ${
                        selectedProperty.negotiable 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                        {selectedProperty.negotiable ? 'Negotiable' : 'Fixed Price'}
                        </span>
                    </div>

                    <p className="text-sm md:text-base text-gray-300 mb-6">{selectedProperty.description}</p>
                  </div>

                    {/* Property Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20 mb-2">
                        <FaBed className="text-blue-400" />
                        </div>
                        <p className="text-sm text-gray-400">Bedrooms</p>
                        <p className="md:text-xl font-bold">{selectedProperty.bedrooms}</p>
                    </div>
                    
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/20 mb-2">
                        <FaBath className="text-purple-400" />
                        </div>
                        <p className="text-sm text-gray-400">Bathrooms</p>
                        <p className="md:text-xl font-bold">{selectedProperty.bathrooms}</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/20 mb-2">
                        <FaRulerCombined className="text-green-400" />
                      </div>
                      <p className="text-sm text-gray-400">Area</p>
                      <p className="md:text-xl font-bold">{selectedProperty.area}</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-pink-500/20 mb-2">
                        <FaCheckCircle className="text-pink-400" />
                        </div>
                        <p className="text-sm text-gray-400">Type</p>
                        <p className="md:text-xl font-bold">{selectedProperty.customType || selectedProperty.type}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="relative">
                      <h3 className="text-xl font-bold mb-4">Features</h3>
                      <div className="flex flex-wrap gap-2">
                          {selectedProperty.features.map((feature: PropertyFeature, index: number) => (
                          <span 
                              key={feature.id || index}
                              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm"
                          >
                              {feature.text}
                          </span>
                          ))}
                      </div>

                      {/* Video Button */}
                      {selectedProperty.videoUrl && (
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              setVideoModalOpen(true);
                              setVideoPlaying(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg transition-all duration-300"
                          >
                            <FaPlay />
                            Play Video Tour
                          </button>
                        </div>
                      )}

                      {/* Chat Page Link */}
                      <Link 
                        href={"/chat"} 
                        className="absolute top-22 right-2 flex justify-center items-center text-center bg-blue-800 border-3 border-white w-15 h-15 rounded-full p-2 overflow-hidden"
                        scroll={false}
                        onClick={(e) => {
                          e.stopPropagation();
                          closeModal();
                        }}
                      >
                        <small className="text-xs text-blue-50">Chat Us Now!</small>
                      </Link>
                    </div>

                    {/* Contact Buttons - Border Top */}
                    <div className="pt-6 border-t border-white/10">
                      <div className="grid grid-cols-3 gap-3 md:gap-4">
                          <a
                            href={`https://wa.me/${selectedProperty.contact.phone}?text=Hello,%20I%20am%20interested%20in%20${encodeURIComponent(selectedProperty.title)}%20(${selectedProperty.price})`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 hover:border-green-400 transition-all duration-300"
                          >
                          <div className="p-3 rounded-xl bg-green-600/30 group-hover:scale-110 transition-transform duration-300 mb-2">
                              <FaWhatsapp className="text-2xl text-green-400" />
                          </div>
                          <span className="text-sm font-medium">WhatsApp</span>
                          <span className="text-xs text-gray-400">Quick Reply</span>
                          </a>

                          <a
                          href={`tel:${selectedProperty.contact.phone}`}
                          className="group relative flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 hover:border-blue-400 transition-all duration-300"
                          >
                          <div className="p-3 rounded-xl bg-blue-600/30 group-hover:scale-110 transition-transform duration-300 mb-2">
                              <FaPhone className="text-2xl text-blue-400" />
                          </div>
                          <span className="text-sm font-medium">Call Now</span>
                          <span className="text-xs text-gray-400">Direct Call</span>
                          </a>

                          <a
                          href={`mailto:${selectedProperty.contact.email}?subject=Inquiry about ${encodeURIComponent(selectedProperty.title)}&body=Hello, I am interested in the ${selectedProperty.title} (${selectedProperty.price}) located in ${selectedProperty.location}.`}
                          className="group relative flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-red-600/20 to-pink-600/20 border border-red-500/30 hover:border-red-400 transition-all duration-300"
                          >
                          <div className="p-3 rounded-xl bg-red-600/30 group-hover:scale-110 transition-transform duration-300 mb-2">
                              <FaEnvelope className="text-2xl text-red-400" />
                          </div>
                          <span className="text-sm font-medium">Email</span>
                          <span className="text-xs text-gray-400">Send Details</span>
                          </a>
                      </div>             
                    </div>
                </div>
                </div>
              </div>
            </div>
        )}

        {/* Footer */}
        <FooterUi />
        </div>
    );
}

/* PROPERTY CARD COMPONENT */
function PropertyCard({ property, onClick, isLiked, onLike, likesCount, onPlayVideo, hasVideo }: PropertyCardProps) {
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <div 
      onClick={onClick}
      className="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] overflow-hidden backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer animate-fadeUp"
    >
      {/* Like Button with Counter */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-center gap-1">
        <button
          onClick={onLike}
          className="p-3 rounded-full bg-black/50 hover:bg-black/70 transition-all relative group/like"
        >
          <FaHeart className={`${isLiked ? 'fill-pink-400 animate-pulse' : 'text-white'} transition-all duration-300`} />
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 text-xs rounded opacity-0 group-hover/like:opacity-100 transition-opacity whitespace-nowrap">
            {isLiked ? 'Unlike' : 'Like'}
          </div>
        </button>
        
        {/* Likes Counter */}
        <div className={`px-2 py-1 rounded-full backdrop-blur-sm text-xs ${isLiked ? 'bg-pink-500/20' : 'bg-black/50'}`}>
          <span className={`font-bold ${isLiked ? 'text-pink-400' : 'text-gray-300'}`}>
            {likesCount}
            <span className="ml-1">likes</span>
          </span>
        </div>
      </div>

      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={property.images[currentImage] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop"}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Image Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {property.images.map((_: string, index: number) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImage(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                currentImage === index 
                  ? 'bg-white w-6' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>

        {/* Expand Icon */}
        <div className="absolute top-4 left-4 p-2 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <FaExpand className="text-sm" />
        </div>

        {/* Video Indicator */}
        {hasVideo && (
          <div className="absolute top-4 left-12 bg-purple-600/80 text-white p-2 rounded-full">
            <FaVideo className="text-sm" />
          </div>
        )}

        {/* Price Tag */}
        <div className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-full">
          <span className="font-bold">₦{property.price}</span>
        </div>

        {/* Property Type */}
        <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded-full text-sm">
          {property.customType || property.type}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold mb-2 line-clamp-1">{property.title}</h3>
            <div className="flex items-center gap-2 text-gray-400">
              <FaMapMarkerAlt className="text-blue-400" />
              <span className="text-sm">{property.location}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs ${
            property.negotiable 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {property.negotiable ? 'Negotiable' : 'Fixed'}
          </span>
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{property.description}</p>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {property.features.slice(0, 3).map((feature: PropertyFeature, index: number) => (
            <span 
              key={feature.id || index}
              className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs"
            >
              {feature.text}
            </span>
          ))}
          {property.features.length > 3 && (
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
              +{property.features.length - 3} more
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-400">
              <FaBed className="text-blue-400" />
              <span>{property.bedrooms}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-400">
              <FaBath className="text-purple-400" />
              <span>{property.bathrooms}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-400">
              <FaRulerCombined className="text-green-400" />
              <span>{property.area}</span>
            </div>
          </div>
        </div>

        {/* Video Button (if video exists) */}
        {hasVideo && onPlayVideo ? (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onPlayVideo();
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 mb-2"
          >
            <FaPlay />
            Play Video
          </button>
        ) : (
          <div className="w-full py-3 text-center text-gray-500 text-sm mb-2">
            No video available
          </div>
        )}

        {/* View Button */}
        <button className="w-full py-3 rounded-xl border border-white/20 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 hover:border-transparent transition-all duration-300 flex items-center justify-center gap-2">
          <FaExpand />
          View More!
        </button>
      </div>
    </div>
  );
}
