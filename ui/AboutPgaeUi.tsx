"use client"

import { 
  FaTrophy,
  FaShieldAlt,
  FaHandshake,
  FaGlobeAmericas,
  FaHome,
  FaChartLine,
  FaUsers,
  FaStar,
  FaHeart,
  FaPhone,
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaTiktok,
  FaWhatsapp
} from "react-icons/fa";
import { useState, useEffect } from "react";
import FooterUi from "../components/Footer";
import { useRouter } from "next/navigation";

export default function AboutPageUi() {
    const [activeTab, setActiveTab] = useState('mission');
    const router = useRouter(); 

    const stats = [
        { value: "13+", label: "Years Experience", icon: <FaTrophy className="text-yellow-400" /> },
        { value: "58+", label: "Properties Sold", icon: <FaHome className="text-blue-400" /> },
        { value: "5+", label: "Cities Covered", icon: <FaGlobeAmericas className="text-green-400" /> },
        { value: "98%", label: "Client Satisfaction", icon: <FaHeart className="text-pink-400" /> }
    ];

    const team = [
        { name: "Adebayo Johnson", role: "CEO & Founder", experience: "13+ years", email: "abidextradingnigltd@gmail.com", phone: "+2349136552111" },
        { name: "Nwachukwu Prince", role: "Head of Sales", experience: "8+ years", email: "princenwachukwu308@yahoo.com", phone: "+2347034632037" },
        { name: "Mrs Felicia .A", role: "Legal Advisor", experience: "5+ years", email: "abidextradingnigltd@gmail.com", phone: "+2347082981639" },
    ];

    const values = [
        { 
        icon: <FaShieldAlt className="text-2xl text-blue-400" />, 
        title: "Integrity", 
        description: "Transparent dealings and honest advice in every transaction" 
        },
        { 
        icon: <FaHandshake className="text-2xl text-green-400" />, 
        title: "Trust", 
        description: "Building lasting relationships based on reliability" 
        },
        { 
        icon: <FaStar className="text-2xl text-yellow-400" />, 
        title: "Excellence", 
        description: "Commitment to superior service and premium properties" 
        },
        { 
        icon: <FaUsers className="text-2xl text-purple-400" />, 
        title: "Client-First", 
        description: "Your dreams and goals are our top priority" 
        }
    ];

    const milestones = [
        { year: "2010", title: "Company Founded", description: "Started with local property listings in Lagos" },
        { year: "2014", title: "Expansion to Ogun", description: "Opened our second office in Ogun State" },
        { year: "2018", title: "International Expansion", description: "Began operations in Chicago, USA" },
        { year: "2021", title: "500+ Properties Milestone", description: "Successfully sold over 500 properties" },
        { year: "2023", title: "Digital Transformation", description: "Launched online property management system" }
    ];

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#0f1425] to-[#0a0e1a] text-white overflow-x-hidden">
       
        {/* Back button */}
        <div
            onClick={() => {
                if (window.history.length > 1) {
                    router.back();
                } else {
                router.push("/");
                }
            }}
            className="cursor-pointer px-4 py-2 border text-gray-400 rounded-lg absolute top-22 md:top-6 right-6 z-50 hover:text-white hover:border-white transition"
            >
            ← Back
        </div>
        
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Hero Section */}
        <section className="relative pt-24 pb-16 px-6">
            <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
                {/* Text Content */}
                <div className="lg:w-2/3">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                    <FaStar className="text-yellow-400 animate-pulse" />
                    <span className="text-sm">Trusted Since 2010</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-fadeUp">
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    About Abidex Trading
                    </span>
                </h1>
                
                <p className="text-xl text-gray-300 mb-8 max-w-3xl">
                    We are more than just a property service company. We are your trusted partners in turning property dreams into reality, 
                    connecting premium buyers with exceptional properties Nationwide.
                </p>

                {/* Owner Image - Floating */}
                <div className="relative mb-12">
                    <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
                        <img
                            src={"/ceo.jpeg"}
                            alt="Owner"
                            className="w-full h-full object-cover"
                        />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Adebayo Johnson</h3>
                        <p className="text-gray-400 text-sm">Founder & CEO</p>
                        <p className="text-sm text-blue-300">"Building dreams, one property at a time"</p>
                    </div>
                    </div>
                </div>
                </div>

                {/* Owner Image Holder - Large */}
                <div className="lg:w-1/3 relative">
                <div className="relative mx-auto lg:mx-0 lg:ml-auto">
                    {/* Animated Rings */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full animate-spin-slow"></div>
                    
                    {/* Main Image Container */}
                    <div className="relative w-64 h-64 lg:w-80 lg:h-80 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 z-10"></div>
                    <img
                        src={"/ceo.jpeg"}
                        alt="Owner"
                        className="w-full h-full object-cover"
                    />
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <FaStar className="text-sm" />
                    </div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 bg-purple-500 rounded-full"></div>
                    </div>

                    {/* Stats Floating Around */}
                    <div className="absolute -top-4 -left-4 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-full shadow-lg">
                    <span className="font-bold">CEO</span>
                    </div>
                    <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full shadow-lg">
                    <span className="font-bold">13+ Years</span>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </section>

        {/* Stats Section */}
        <section className="relative py-12 px-6">
            <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                <div 
                    key={index}
                    className="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20"
                >
                    <div className="flex items-center justify-between mb-4">
                    {stat.icon}
                    <div className="text-right">
                        <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {stat.value}
                        </div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                    </div>
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 group-hover:w-full"
                        style={{ width: '75%' }}
                    ></div>
                    </div>
                </div>
                ))}
            </div>
            </div>
        </section>

        {/* Mission & Values */}
        <section className="relative py-16 px-6">
            <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Our Vision & Values
                </span>
                </h2>
                <p className="md:text-xl text-gray-400 max-w-3xl mx-auto">
                Guiding principles that define who we are and how we serve our clients
                </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
                <button
                onClick={() => setActiveTab('mission')}
                className={`px-6 py-3 rounded-full transition-all duration-300 ${
                    activeTab === 'mission' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                >
                Our Mission
                </button>
                <button
                onClick={() => setActiveTab('vision')}
                className={`px-6 py-3 rounded-full transition-all duration-300 ${
                    activeTab === 'vision' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                >
                Our Vision
                </button>
                <button
                onClick={() => setActiveTab('values')}
                className={`px-6 py-3 rounded-full transition-all duration-300 ${
                    activeTab === 'values' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                >
                Core Values
                </button>
            </div>

            {/* Tab Content */}
            <div className="relative rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
                <div className="relative backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
                {activeTab === 'mission' && (
                    <div className="space-y-6">
                    <div className="flex flex-col md:flex-row items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                        <FaChartLine className="text-2xl text-blue-400" />
                        </div>
                        <div>
                        <h3 className="text-2xl font-bold mb-2">Our Mission</h3>
                        <p className="text-sm md:text-base text-gray-300 text-lg">
                            To provide exceptional services that exceed client expectations, 
                            leveraging our expertise and global network to deliver premium properties 
                            with integrity, transparency, and unmatched value.
                        </p>
                        </div>
                    </div>
                    </div>
                )}

                {activeTab === 'vision' && (
                    <div className="space-y-6">
                    <div className="flex flex-col md:flex-row items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        <FaGlobeAmericas className="text-2xl text-purple-400" />
                        </div>
                        <div>
                        <h3 className="text-2xl font-bold mb-2">Our Vision</h3>
                        <p className="text-sm md:text-base text-gray-300 text-lg">
                            To become Nigeria's most trusted and innovative properties partner, 
                            expanding our global footprint while maintaining our commitment to 
                            excellence and customer satisfaction in every market we serve.
                        </p>
                        </div>
                    </div>
                    </div>
                )}

                {activeTab === 'values' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {values.map((value, index) => (
                        <div 
                        key={index}
                        className="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:border-blue-500/50"
                        >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                            {value.icon}
                            </div>
                            <div>
                            <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                            <p className="text-sm md:text-base text-gray-400">{value.description}</p>
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>
                )}
                </div>
            </div>
            </div>
        </section>

        {/* Team Section */}
        <section className="relative py-10 px-6 md:px-[150px]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Meet Our Leadership
                    </span>
                    </h2>
                    <p className="md:text-xl text-gray-400 max-w-3xl mx-auto">
                    The dedicated professionals behind our success story
                    </p>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                    {team.map((member, index) => (
                    <div 
                        key={index}
                        className="w-full group relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20"
                    >
                        <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-white/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                        <div className="w-full h-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                            <span className="text-2xl font-bold">{member.name.charAt(0)}</span>
                        </div>
                        </div>
                        <h3 className="text-xl font-bold text-center mb-1">{member.name}</h3>
                        <p className="text-blue-400 text-center mb-2">{member.role}</p>
                        <p className="text-gray-400 text-sm text-center mb-4">{member.experience} experience</p>
                        <div className="flex justify-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <a href={`tel:${member.phone}`} ><FaPhone className="text-xs" /></a>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <a href={`mailto:@${member.email}`}><FaEnvelope className="text-xs" /></a>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Journey Timeline */}
        <section className="relative py-16 p-2 md:px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-xl md:text-4xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Our Journey
                    </span>
                    </h2>
                    <p className="md:text-xl text-gray-400 max-w-3xl mx-auto">
                    Milestones in our growth and expansion story
                    </p>
                </div>

                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500"></div>
                    
                    <div className="space-y-12">
                        {milestones.map((milestone, index) => (
                            <div 
                                key={index}
                                className={`m-2 relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                            >
                            {/* Timeline Node */}
                            <div className={`absolute left-2/4 transform -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-4 border-[#0a0e1a] z-10`}></div>
                            
                            {/* Content */}
                            <div className={`w-6/12 ${index % 2 === 0 ? 'pr-4 text-right' : 'pl-4'}`}>
                                <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-3 md:p-6 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:border-blue-500/50">
                                <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                                    {milestone.year}
                                </div>
                                <h3 className="md:text-xl font-bold mb-2">{milestone.title}</h3>
                                <p className="text-sm md:text-base text-gray-400">{milestone.description}</p>
                                </div>
                            </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-16 px-3 md:px-6">
            <div className="max-w-7xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
                <div className="relative backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
                <h2 className="text-2xl md:text-4xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Ready to Find Your Dream Property?
                    </span>
                </h2>
                <p className="md:text-xl text-gray-300 mb-4 md:mb-8 max-w-2xl mx-auto">
                    Join thousands of satisfied clients who have found their perfect property with us
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                    href="tel:+2349136552111"
                    className="text-sm md:text-base group px-1 md:px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-lg font-semibold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 flex items-center justify-center gap-2"
                    >
                    <FaPhone className="group-hover:animate-pulse" />
                    Schedule Consultation
                    </a>
                    <a
                    href="mailto:abidextradingnigltd@gmail.com"
                    className="text-sm md:text-base group px-8 py-4 rounded-full border-2 border-white/30 text-lg font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                    >
                    <FaEnvelope />
                    Email Us
                    </a>
                </div>
                
                {/* Social Links */}
                <div className="flex justify-center gap-4 mt-8">
                    <a href="https://www.facebook.com/" className="p-3 rounded-full bg-white/10 hover:bg-blue-500/20 transition-all duration-300">
                    <FaFacebookF className="text-blue-400" />
                    </a>
                    <a href="https://www.instagram.com/" className="p-3 rounded-full bg-white/10 hover:bg-pink-500/20 transition-all duration-300">
                    <FaInstagram className="text-pink-400" />
                    </a>
                    <a href="https://x.com/" className="p-3 rounded-full bg-white/10 hover:bg-gray-500/20 transition-all duration-300">
                    <FaTwitter className="text-gray-300" />
                    </a>
                    <a href="https://www.tiktok.com/@abidex.trading" className="p-3 rounded-full bg-white/10 hover:bg-blue-600/20 transition-all duration-300">
                    <FaTiktok className="text-blue-300" />
                    </a>
                    <a href="https://wa.me/2349136552111" className="p-3 rounded-full bg-white/10 hover:bg-green-500/20 transition-all duration-300">
                    <FaWhatsapp className="text-green-400" />
                    </a>
                </div>
                </div>
            </div>
            </div>
        </section>

        {/* Footer */}
        <FooterUi />
        </div>
    );
}