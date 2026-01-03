// Create this temporary page: app/setup-initial-data/page.tsx
"use client";

import { useState } from 'react';
import { doc, setDoc, Timestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseconfig';
import { useRouter } from 'next/navigation';

export default function SetupInitialData() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const setupData = async () => {
    setLoading(true);
    
    try {
      // 1. Save your current config to Firebase
      const initialConfig = {
        companyName: 'Abidex Trading Nig. LTD',
        tagline: 'Where Luxury meets Comfort in premium global properties',
        trustText: 'Trusted Since 2010',
        heroImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2070',
        socialLinks: {
          tiktok: 'https://www.tiktok.com/@abidex.trading',
          instagram: 'https://www.instagram.com/',
          facebook: 'https://www.facebook.com/',
          twitter: 'https://x.com/',
          whatsapp: '+2349136552111',
          phone: '+2349136552111',
          email: 'abidextradingnigltd@gmail.com'
        },
        contactInfo: {
          nigeriaAddress: 'Ikenne modern market, block F, shop-8, Ogun State',
          usAddress: '8145 S Cole St, Illinois, Chicago',
          phone: '+2349136552111',
          email: 'abidextradingnigltd@gmail.com',
          whatsappMessage: 'Hello, I am interested in your property listings.'
        },
        featuredProperties: [],
        updatedAt: Timestamp.now()
      };
      
      await setDoc(doc(db, 'config', 'app_config'), initialConfig);
      setMessage('✅ Config saved to Firebase!');
      
      // 2. Save your current properties to Firebase
      const yourProperties = [
        { 
          type: "Luxury Villa", 
          location: "Lagos", 
          price: "$850,000",
          description: "Premium villa with modern amenities",
          bedrooms: 4,
          bathrooms: 3,
          squareFeet: 3500,
          imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2070",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        { 
          type: "Modern Apartment", 
          location: "Abuja", 
          price: "$420,000",
          description: "Contemporary apartment in city center",
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 1800,
          imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        { 
          type: "Commercial Space", 
          location: "Chicago", 
          price: "$1.2M",
          description: "Prime commercial real estate",
          squareFeet: 5000,
          imageUrl: "https://images.unsplash.com/photo-1487956382158-bb926046304a?q=80&w=2072",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        { 
          type: "Land Plot", 
          location: "Ikenne", 
          price: "$150,000",
          description: "Developable land in prime location",
          imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ];
      
      // Add each property
      for (const property of yourProperties) {
        await addDoc(collection(db, 'properties'), property);
      }
      
      setMessage('✅ All data saved! Your homepage will now show Firebase data.');
      
      // Redirect to homepage after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
      
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-6">Initialize Firebase Data</h1>
        <button
          onClick={setupData}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 rounded-lg mb-4 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save My Current Data to Firebase'}
        </button>
        {message && <p className="mt-4">{message}</p>}
        <p className="text-sm text-gray-400 mt-8">
          This will copy your current homepage data to Firebase.<br/>
          Delete this page after use!
        </p>
      </div>
    </div>
  );
}