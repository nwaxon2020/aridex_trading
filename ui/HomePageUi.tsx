"use client"

import { 
  FaTiktok, 
  FaInstagram, 
  FaFacebookF, 
  FaXTwitter, 
  FaWhatsapp, 
  FaPhone, 
  FaEnvelope, 
  FaChevronDown,
  FaStar,
  FaBuilding,
} from "react-icons/fa6";
import { useEffect, useState, useRef } from "react";
import { FaGlobeAmericas, FaHome, FaMapMarker, FaPlay, FaPause, FaTimes, FaInfoCircle } from "react-icons/fa"
import Link from "next/link";

//components
import FooterUi from "../components/Footer";

// Firebase imports
import { db } from '@/lib/firebaseconfig';
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export default function HomePageUi() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [appConfig, setAppConfig] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State for video modal and description
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [showDescription, setShowDescription] = useState<Record<string, boolean>>({});
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Load data from Firebase
    loadData();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadData = async () => {
    try {
      // Load app config
      const configDoc = await getDoc(doc(db, 'config', 'app_config'));
      if (configDoc.exists()) {
        setAppConfig(configDoc.data());
      }
      
      // Load properties
      const propertiesSnapshot = await getDocs(collection(db, 'properties'));
      const propertiesData = propertiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProperties(propertiesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle description visibility
  const toggleDescription = (propertyId: string) => {
    setShowDescription(prev => ({
      ...prev,
      [propertyId]: !prev[propertyId]
    }));
  };

  // Handle video play/pause
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

  // Close video modal
  const closeVideoModal = () => {
    setVideoModalOpen(false);
    setVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Auto-play video when modal opens
  useState(() => {
    if (videoModalOpen && videoRef.current) {
      videoRef.current.play().catch(e => {
        console.log("Auto-play prevented:", e);
      });
    }
  });

  // Get data with fallback to defaults (matches your original hardcoded values)
  const phoneNumber = appConfig?.contactInfo?.phone || "+2347082981639";
  const whatsappNumber = appConfig?.socialLinks?.whatsapp || "+2349136552111";
  const email = appConfig?.contactInfo?.email || "abidextradingnigltd@gmail.com";
  const whatsappMessage = appConfig?.contactInfo?.whatsappMessage || "Hello,%20I%20am%20interested%20in%20your%20property%20listings.";
  const nigeriaAddress = appConfig?.contactInfo?.nigeriaAddress || "Ikenne modern market, block F, shop-8, Ogun State";
  const usAddress = appConfig?.contactInfo?.usAddress || "8145 S Cole St, Illinois, Chicago";
  const companyName = appConfig?.companyName || "Abidex Trading Nig. LTD";
  const tagline = appConfig?.tagline || "Where Luxury meets Comfort in premium global properties";
  const trustText = appConfig?.trustText || "Trusted Since 2010";
  const heroImage = appConfig?.heroImage || "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2070";

  // Social links with fallbacks (matches your original links)
  const socialLinks = {
    tiktok: appConfig?.socialLinks?.tiktok || "https://www.tiktok.com/@abidex.trading",
    instagram: appConfig?.socialLinks?.instagram || "https://www.instagram.com/",
    facebook: appConfig?.socialLinks?.facebook || "https://www.facebook.com/",
    twitter: appConfig?.socialLinks?.twitter || "https://x.com/",
    whatsapp: whatsappNumber,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#0f1425] to-[#0a0e1a] text-white overflow-x-hidden">

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* HERO SECTION - Enhanced */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Parallax Background */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30 z-0"
          style={{
            transform: `translateY(${scrollPosition * 0.5}px)`,
          }}
        >
          <img
            src={heroImage}
            alt="Luxury Home"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        </div>

        {/* Animated Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 z-1"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex min-h-screen md:h-full flex-col items-center justify-center text-center px-6">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4 animate-fadeIn">
              <FaStar className="text-yellow-400 animate-spin-slow" />
              <span className="text-sm">{trustText}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-2 animate-fadeUp">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {companyName}
              </span>
              <br />
              
              <span className="text-3xl md:text-5xl">Begin Here</span>
            </h1>
            <p className="mt-2 max-w-2xl text-xl md:text-2xl text-gray-300 font-light animate-fadeUp delay-200">
              {tagline}
            </p>
          </div>

          {/* About us link */}
          <div className="flex gap-6 justify-center">
            <div className="mt-4 text-center mx-auto mb-0"><Link href={"/about-us"} className="text-blue-300 underline hover:text-blue-500">About Us</Link></div>
            <div className="mt-4 text-center mx-auto mb-0"><Link href={"/chat"} className="text-amber-300 underline hover:text-amber-500">Chat Us Now!</Link></div>
          </div>
        
          <div className="flex flex-col sm:flex-row gap-4 mt-2 animate-fadeUp delay-300">
            <Link href={"/blog"} className="group relative px-10 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-lg font-semibold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30">
              <span className="relative z-10">Explore Properties</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            {/* UPDATED: Schedule Consultation button now opens phone dialer */}
            <a 
              href={`tel:${phoneNumber}`}
              className="group px-10 py-4 rounded-full border-2 border-white/30 text-lg font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <FaPhone className="group-hover:animate-pulse" />
              Schedule Consultation
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <FaChevronDown className="text-2xl text-white/50" />
        </div>
      </section>

      {/* FEATURED PROPERTIES PREVIEW */}
      <section className="relative max-w-7xl mx-auto px-4 md:px-2 py-20 z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-2 animate-fadeUp">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Featured Properties
            </span>
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto animate-fadeUp delay-100">
            Discover our exclusive collection of premium properties worldwide
          </p>
        </div>

        <>
          {/* Video Modal */}
          {videoModalOpen && selectedVideo && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
              <div className="relative w-full max-w-4xl mx-auto">
                {/* Close Button */}
                <button
                  onClick={closeVideoModal}
                  className="absolute -top-10 right-0 md:-right-10 z-10 p-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
                
                {/* Video Player */}
                <div className="relative rounded-2xl overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    src={selectedVideo}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {properties.length > 0 ? 
              properties
                .slice()
                .sort((a, b) => {
                  const timeA = a.updatedAt?.toMillis?.() || 0;
                  const timeB = b.updatedAt?.toMillis?.() || 0;
                  return timeB - timeA;
                })
                .map((property, index) => (
                <div 
                  key={property.id || index}
                  className="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-3  md:p-3 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20 animate-fadeUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <FaHome className="text-xl" />
                  </div>
                  
                  {/* Video Indicator */}
                  {property.videoUrl && (
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-purple-600/80 text-white p-2 rounded-full">
                        <FaPlay className="text-xs" />
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <div className="w-full h-full max-h-100 md:h-70 rounded-2xl bg-gradient-to-br from-blue-900/30 to-purple-900/30 mb-4 overflow-hidden">
                      {property.imageUrl ? (
                        <img 
                          src={property.imageUrl} 
                          alt={property.type}
                          className="w-full h-full object-contain md:object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:scale-110 transition-transform duration-500"></div>
                      )}
                    </div>
                    <h3 className=" font-bold mb-1">{property.type}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-2 mb-3">
                      <FaMapMarker className="text-blue-400" />
                      {property.location}
                    </p>
                    <p className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text mb-2">
                      ₦{property.price}
                    </p>
                    
                    {/* Description Toggle */}
                    {property.description && (
                      <div className="mb-2">
                        <button
                          onClick={() => property.id && toggleDescription(property.id)}
                          className="flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors text-sm"
                        >
                          <FaInfoCircle className="text-xs" />
                          <span>Description</span>
                        </button>
                        
                        {/* Description Content */}
                        {property.id && showDescription[property.id] && (
                          <div className="mt-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                            <p className="text-sm text-gray-300">{property.description}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Property Details */}
                    {(property.bedrooms || property.bathrooms || property.squareFeet) && (
                      <div className="flex gap-4 mb-4 text-sm text-gray-400">
                        {property.bedrooms && (
                          <div className="flex items-center gap-1">
                            <span>🛏️</span>
                            <span>{property.bedrooms} bed</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-1">
                            <span>🚿</span>
                            <span>{property.bathrooms} bath</span>
                          </div>
                        )}
                        {property.squareFeet && (
                          <div className="flex items-center gap-1">
                            <span>📐</span>
                            <span>{property.squareFeet} sq ft</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* View Video Button - Only show if video exists */}
                  {property.videoUrl ? (
                    <button 
                      onClick={() => {
                        setSelectedVideo(property.videoUrl || '');
                        setVideoModalOpen(true);
                        setVideoPlaying(true);
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      <FaPlay />
                      View Video
                    </button>
                  ) : (
                    <div className="w-full py-3 text-center text-gray-500 text-sm">
                      No video available
                    </div>
                  )}
                </div>
              )) : (
              // Fallback to original demo properties if Firebase is empty
              [
                { type: "Luxury Villa", location: "Lagos", price: "$850,000" },
                { type: "Modern Apartment", location: "Abuja", price: "$420,000" },
                { type: "Commercial Space", location: "Chicago", price: "$1.2M" },
                { type: "Land Plot", location: "Ikenne", price: "$150,000" },
              ].map((property, index) => (
                <div 
                  key={index}
                  className="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 py-6 md:p-6 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20 animate-fadeUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <FaHome className="text-xl" />
                  </div>
                  <div className="mb-6">
                    <div className="w-full h-48 rounded-2xl bg-gradient-to-br from-blue-900/30 to-purple-900/30 mb-4 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:scale-110 transition-transform duration-500"></div>
                    </div>
                    <h3 className="md:text-xl font-bold mb-2">{property.type}</h3>
                    <p className="text-sm md:text-base text-gray-400 flex items-center gap-2 mb-3">
                      <FaMapMarker className="text-blue-400" />
                      {property.location}
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-transparent bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text">
                      {property.price}
                    </p>
                  </div>
                  <div className="w-full py-3 text-center text-gray-500 text-sm">
                    Add property to enable video
                  </div>
                </div>
              ))
            )}
          </div>
        </>

        {/* CONTACT INFORMATION SECTION - Enhanced */}
        <div className="relative rounded-3xl overflow-hidden mb-20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
          <div className="relative backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Global Presence
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Nigerian Office clickable to Google Maps */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(nigeriaAddress)}`}
                  target="_blank"
                  className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-2 block cursor-pointer"
                >
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-6">
                    <FaBuilding className="text-3xl text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 flex items-center justify-center gap-2">
                    <FaGlobeAmericas className="text-blue-400" />
                    Nigeria Office
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed group-hover:text-blue-300 transition">
                    {nigeriaAddress}
                    <span className="block text-xs text-blue-400 mt-2">Click for directions →</span>
                  </p>
                </a>
              </div>

              {/* US Office - clickable to Google Maps */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(usAddress)}`}
                  target="_blank"
                  className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-2 block cursor-pointer"
                >
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-6">
                    <FaBuilding className="text-3xl text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 flex items-center justify-center gap-2">
                    <FaGlobeAmericas className="text-purple-400" />
                    US Office
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed group-hover:text-purple-300 transition">
                    {usAddress}
                    <span className="block text-xs text-purple-400 mt-2">Click for directions →</span>
                  </p>
                </a>
              </div>

              {/* Contact Details */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] px-2 py-8 md:p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-2">
                  <div className="flex flex-col gap-6">
                    <a 
                      href={`tel:${phoneNumber}`}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-green-500/10 to-blue-500/10 hover:from-green-500/20 hover:to-blue-500/20 transition-all duration-300 group/call"
                    >
                      <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-blue-500">
                        <FaPhone className="text-xl" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-gray-400">Phone / WhatsApp</p>
                        <p className="font-bold group-hover/call:text-green-300 transition">
                          {phoneNumber.replace('+', '')}
                        </p>
                      </div>
                    </a>
                    
                    <a 
                      href={`mailto:${email}`}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 transition-all duration-300 group/email"
                    >
                      <div className="p-1 rounded-xl bg-gradient-to-br from-red-500 to-pink-500">
                        <FaEnvelope className="text-xl" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="text-sm font-bold group-hover/email:text-red-300 transition">
                          {email}
                        </p>
                      </div>
                    </a>
                  </div>
                  <div className="text-center"><span className="block text-xs text-purple-400 mt-2">Email Us today →</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SOCIAL CONNECTIONS - Enhanced */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 md:mb-4">
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Connect & Follow
            </span>
          </h2>
          <p className="text-sm md:text-xl text-gray-400 mb-12">Join our growing community</p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 mb-8">
            {/* TikTok */}
            <SocialCard
              icon={<FaTiktok className="text-4xl" />}
              name="TikTok"
              link={socialLinks.tiktok}
              color="from-pink-500 to-rose-500"
              followers="10K+"
            />

            {/* Instagram */}
            <SocialCard
              icon={<FaInstagram className="text-4xl" />}
              name="Instagram"
              link={socialLinks.instagram}
              color="from-purple-500 to-pink-500"
              followers="25K+"
            />

            {/* Facebook */}
            <SocialCard
              icon={<FaFacebookF className="text-4xl" />}
              name="Facebook"
              link={socialLinks.facebook}
              color="from-blue-500 to-cyan-500"
              followers="15K+"
            />

            {/* Twitter */}
            <SocialCard
              icon={<FaXTwitter className="text-4xl" />}
              name="Twitter"
              link={socialLinks.twitter}
              color="from-gray-600 to-gray-400"
              followers="8K+"
            />

            {/* WhatsApp desktop view*/}
            <SocialCard
              icon={<FaWhatsapp className="text-4xl" />}
              name="WhatsApp"
              link={`https://wa.me/${whatsappNumber.replace('+', '')}?text=${whatsappMessage}`}
              color="from-green-600 to-green-400"
              followers="Available 24/7"
            />
          </div>

          {/* WhatsApp - Premium Card mobile view*/}
          <div className="md:hidden mx-auto">
            <a
              href={`https://wa.me/${whatsappNumber.replace('+', '')}?text=${whatsappMessage}`}
              target="_blank"
              className="group relative block rounded-3xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-400 opacity-90 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative py-4 md:p-8 text-center">
                <div className="inline-flex p-4 rounded-2xl bg-white/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaWhatsapp className="text-2xl md:text-4xl" />
                </div>
                <h3 className="text-lg md:text-2xl font-bold mb-2">Instant Support</h3>
                <p className="text-xs md:text-lg mb-4">Chat directly with our property experts</p>
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="text-sm opacity-90">Click to WhatsApp</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER - Enhanced */}
      <FooterUi/>
    </div>
  );
}

/* ENHANCED SOCIAL CARD COMPONENT */
function SocialCard({ icon, name, link, color, followers }: any) {
  return (
    <a
      href={link}
      target="_blank"
      className={`${name === "WhatsApp" ? "hidden md:block": "block" } group relative rounded-3xl overflow-hidden transition-all duration-500 hover:scale-105`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
      <div className="relative border border-white/10 bg-white/5 p-4 md:p-8 text-center backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-2">
          <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <h3 className="text-lg font-semibold mb-2">{name}</h3>
          <p className="text-sm text-gray-400 mb-1">Follow Us</p>
          {followers && (
            <p className="text-xs text-gray-500">{followers} {name === "WhatsApp"? "" : "followers"}</p>
          )}
      </div>
    </a>
  );
}