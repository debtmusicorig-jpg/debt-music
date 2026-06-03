const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Settings, Home, BookUser, Disc3, Guitar, HandCoins, Download, TreePine } from 'lucide-react';
import { base44 } from '@/api/base44Client'; // Changed from User to base44
import { SiteSettings } from '@/entities/SiteSettings';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    logo_url: '',
    site_name: 'D.E.B.T-MUSIC HUB'
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Changed from User.me() to db.auth.me()
        const user = await db.auth.me(); 
        if (user && user.role === 'admin') {
          setIsAdmin(true);
        } else {
          // Explicitly set to false if user is not admin
          setIsAdmin(false);
        }
      } catch (error) {
        // User is not logged in or authentication failed
        setIsAdmin(false); // Ensure isAdmin is false in case of error
      }
    };
    checkAdminStatus();
  }, []);

  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const settingsList = await SiteSettings.list();
        if (settingsList && settingsList.length > 0) {
          const settings = settingsList[0];
          setSiteSettings({
            logo_url: settings.logo_url || '',
            site_name: settings.site_name || 'D.E.B.T-MUSIC HUB'
          });
        }
      } catch (error) {
        console.error('Failed to load site settings:', error);
      }
    };
    loadSiteSettings();
  }, []);
  
  return (
    <div className="bg-black min-h-screen text-gray-200 font-sans flex flex-col">
      <style>
        {`
          /* Slow down scroll speed for all dropdown menus - reduced by half */
          [role="listbox"] {
            scroll-behavior: smooth;
            scroll-snap-type: y mandatory;
          }
          
          [role="listbox"]::-webkit-scrollbar {
            width: 8px;
          }
          
          [role="listbox"]::-webkit-scrollbar-track {
            background: #404040;
          }
          
          [role="listbox"]::-webkit-scrollbar-thumb {
            background: #666;
            border-radius: 4px;
          }
          
          [role="listbox"]::-webkit-scrollbar-thumb:hover {
            background: #888;
          }
          
          /* Apply to all scrollable content within dropdowns - slower scrolling */
          .scroll-smooth {
            scroll-behavior: smooth;
          }
          
          /* Custom scroll behavior for select components - significantly slower */
          [data-radix-select-content] {
            scroll-behavior: smooth;
            scroll-snap-type: y mandatory;
            overflow-y: auto;
          }
          
          [data-radix-select-content]::-webkit-scrollbar {
            width: 8px;
          }
          
          [data-radix-select-content]::-webkit-scrollbar-track {
            background: #262626;
            border-radius: 4px;
          }
          
          [data-radix-select-content]::-webkit-scrollbar-thumb {
            background: #525252;
            border-radius: 4px;
          }
          
          [data-radix-select-content]::-webkit-scrollbar-thumb:hover {
            background: #737373;
          }
          
          /* Additional CSS to slow scroll speed using CSS scroll behavior */
          [data-radix-select-content] > div {
            scroll-behavior: smooth;
          }
          
          /* Force slower scrolling on all dropdown elements */
          select, [role="combobox"], [role="listbox"], [data-radix-select-content] {
            scroll-behavior: smooth !important;
            scroll-snap-type: y mandatory !important;
          }
        `}
      </style>
      
      <header className="fixed top-0 left-0 w-full z-50 bg-black bg-opacity-90 backdrop-blur-sm">
        {/* Logo and Site Name Row */}
        <div className="container mx-auto px-6 py-4 flex justify-center items-center">
          <Link to={createPageUrl("Home")} className="flex items-center gap-3">
            {siteSettings.logo_url && (
              <img 
                src={siteSettings.logo_url} 
                alt="Site Logo"
                className="h-32 w-32 object-contain"
              />
            )}
            <h1 className="text-3xl font-bold tracking-wider text-red-500">
              {siteSettings.site_name}
            </h1>
          </Link>
        </div>
        
        {/* Navigation Tabs Row */}
        <nav className="border-t border-gray-800 bg-black bg-opacity-95">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Link 
                to={createPageUrl("Home")} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === createPageUrl("Home") 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-gray-300 hover:text-yellow-400'
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:block">Home</span>
              </Link>
              <Link 
                to={createPageUrl("Bio")} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === createPageUrl("Bio") 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-gray-300 hover:text-yellow-400'
                }`}
              >
                <BookUser className="w-4 h-4" />
                <span className="hidden sm:block">Bio</span>
              </Link>
              <Link 
                to={createPageUrl("VinylAndCD")} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === createPageUrl("VinylAndCD") 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-gray-300 hover:text-yellow-400'
                }`}
              >
                <Disc3 className="w-4 h-4" />
                <span className="hidden sm:block">Vinyl & CD</span>
              </Link>
              <Link 
                to={createPageUrl("DigitalDownloads")} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === createPageUrl("DigitalDownloads") 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-gray-300 hover:text-yellow-400'
                }`}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:block">Downloads</span>
              </Link>
              <Link 
                to={createPageUrl("Covers")} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === createPageUrl("Covers") 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-gray-300 hover:text-yellow-400'
                }`}
              >
                <Guitar className="w-4 h-4" />
                <span className="hidden sm:block">Covers</span>
              </Link>
              <Link 
                                    to={createPageUrl("Tip")} 
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                      location.pathname === createPageUrl("Tip") 
                                        ? 'bg-yellow-400 text-black' 
                                        : 'text-gray-300 hover:text-yellow-400'
                                    }`}
                                  >
                                    <HandCoins className="w-4 h-4" />
                                    <span className="hidden sm:block">Tip Jar</span>
                                  </Link>
                                  <Link 
                                    to={createPageUrl("XmasSongs")} 
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                      location.pathname === createPageUrl("XmasSongs") 
                                        ? 'bg-yellow-400 text-black' 
                                        : 'text-gray-300 hover:text-yellow-400'
                                    }`}
                                  >
                                    <TreePine className="w-4 h-4" />
                                    <span className="hidden sm:block">Xmas Songs</span>
                                  </Link>
              <Link 
                to={createPageUrl("Contact")} 
                className={`px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === createPageUrl("Contact") 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-gray-300 hover:text-yellow-400'
                }`}
              >
                <span className="hidden sm:block">Contact</span>
                <span className="sm:hidden">📧</span>
              </Link>
              {isAdmin && (
                <Link 
                  to={createPageUrl("Admin")} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === createPageUrl("Admin") 
                      ? 'bg-yellow-400 text-black' 
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:block">Admin</span>
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>
      <main className="pt-44 flex-grow">
        {children}
      </main>
      <footer className="bg-black text-center p-6 border-t border-gray-800">
         <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <p className="text-gray-500 text-sm">&copy;GRB 2025</p>
            <Link to={createPageUrl("PrivacyPolicy")} className="text-gray-500 text-sm hover:text-yellow-400 transition-colors">
                Privacy Policy
            </Link>
            <Link to={createPageUrl("TermsAndConditions")} className="text-gray-500 text-sm hover:text-yellow-400 transition-colors">
                Terms &amp; Conditions
            </Link>
            <Link to={createPageUrl("Contact")} className="text-gray-500 text-sm hover:text-yellow-400 transition-colors">
                Contact
            </Link>
         </div>
      </footer>
    </div>
  );
}