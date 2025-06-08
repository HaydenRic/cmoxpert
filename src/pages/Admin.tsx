import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Upload, 
  Play, 
  Eye, 
  Users, 
  FileText, 
  BarChart3,
  Star,
  Trash2,
  Edit2,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Video,
  Image,
  Settings,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';

interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnail_url?: string;
  duration?: number;
  views_count: number;
  is_featured: boolean;
  status: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

interface UsageStats {
  totalUsers: number;
  totalClients: number;
  totalReports: number;
  totalVideoViews: number;
  recentActivity: any[];
}

interface BrandSettings {
  logoUrl: string;
  faviconUrl: string;
}

export function Admin() {
  const { user, profile, isAdmin } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats>({
    totalUsers: 0,
    totalClients: 0,
    totalReports: 0,
    totalVideoViews: 0,
    recentActivity: []
  });
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    logoUrl: '',
    faviconUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingBrand, setUploadingBrand] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'analytics' | 'branding'>('videos');
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    is_featured: false
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [selectedFavicon, setSelectedFavicon] = useState<File | null>(null);

  useEffect(() => {
    if (user && isAdmin) {
      loadAdminData();
      loadBrandSettings();
    }
  }, [user, isAdmin]);

  const loadAdminData = async () => {
    try {
      // Load videos
      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      setVideos(videosData || []);

      // Load usage statistics
      const [
        { count: userCount },
        { count: clientCount },
        { count: reportCount },
        { count: videoViewCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }),
        supabase.from('video_views').select('*', { count: 'exact', head: true })
      ]);

      // Load recent activity
      const { data: recentReports } = await supabase
        .from('reports')
        .select(`
          *,
          clients!inner(name, user_id)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setUsageStats({
        totalUsers: userCount || 0,
        totalClients: clientCount || 0,
        totalReports: reportCount || 0,
        totalVideoViews: videoViewCount || 0,
        recentActivity: recentReports || []
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBrandSettings = async () => {
    try {
      // Try to get stored brand settings from storage
      const { data: logoData } = supabase.storage
        .from('branding')
        .getPublicUrl('logo.png');
      
      const { data: faviconData } = supabase.storage
        .from('branding')
        .getPublicUrl('favicon.ico');

      setBrandSettings({
        logoUrl: logoData.publicUrl,
        faviconUrl: faviconData.publicUrl
      });
    } catch (error) {
      console.error('Error loading brand settings:', error);
    }
  };

  const handleVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !newVideo.title) {
      alert('Please select a file and provide a title');
      return;
    }

    setUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      // Insert video metadata
      const { error: insertError } = await supabase
        .from('videos')
        .insert([{
          title: newVideo.title,
          description: newVideo.description,
          url: data.publicUrl,
          is_featured: newVideo.is_featured,
          uploaded_by: user!.id
        }]);

      if (insertError) throw insertError;

      // Reset form
      setNewVideo({ title: '', description: '', is_featured: false });
      setSelectedFile(null);
      setShowUploadForm(false);
      
      // Reload data
      loadAdminData();

    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Error uploading video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleBrandUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLogo && !selectedFavicon) {
      alert('Please select at least one file to upload');
      return;
    }

    setUploadingBrand(true);

    try {
      const uploadPromises = [];

      if (selectedLogo) {
        const logoPath = 'logo.png';
        uploadPromises.push(
          supabase.storage
            .from('branding')
            .upload(logoPath, selectedLogo, { upsert: true })
        );
      }

      if (selectedFavicon) {
        const faviconPath = 'favicon.ico';
        uploadPromises.push(
          supabase.storage
            .from('branding')
            .upload(faviconPath, selectedFavicon, { upsert: true })
        );
      }

      await Promise.all(uploadPromises);

      // Update favicon in the document head if uploaded
      if (selectedFavicon) {
        const { data } = supabase.storage
          .from('branding')
          .getPublicUrl('favicon.ico');
        
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
          link.href = data.publicUrl;
        }
      }

      // Reset form and reload settings
      setSelectedLogo(null);
      setSelectedFavicon(null);
      setShowBrandForm(false);
      await loadBrandSettings();

      alert('Brand assets uploaded successfully!');

    } catch (error) {
      console.error('Error uploading brand assets:', error);
      alert('Error uploading brand assets. Please try again.');
    } finally {
      setUploadingBrand(false);
    }
  };

  const toggleFeatured = async (videoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({ is_featured: !currentStatus })
        .eq('id', videoId);

      if (error) throw error;
      loadAdminData();
    } catch (error) {
      console.error('Error updating video:', error);
    }
  };

  const deleteVideo = async (videoId: string, videoUrl: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      // Extract file path from URL
      const urlParts = videoUrl.split('/');
      const filePath = `videos/${urlParts[urlParts.length - 1]}`;

      // Delete from storage
      await supabase.storage.from('videos').remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;
      loadAdminData();
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Access Denied</h3>
          <p className="text-slate-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-cornsilk-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-cornsilk-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: usageStats.totalUsers,
      icon: Users,
      color: 'bg-dark_moss_green-500'
    },
    {
      title: 'Total Clients',
      value: usageStats.totalClients,
      icon: Users,
      color: 'bg-pakistan_green-500'
    },
    {
      title: 'Total Reports',
      value: usageStats.totalReports,
      icon: FileText,
      color: 'bg-pakistan_green-500'
    },
    {
      title: 'Video Views',
      value: usageStats.totalVideoViews,
      icon: Eye,
      color: 'bg-tiger_s_eye-500'
    }
  ];

  const tabs = [
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'branding', label: 'Branding', icon: Settings }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Panel</h1>
          <p className="text-slate-600">Manage videos, monitor usage, and customize branding</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.title}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-dark_moss_green-500 text-dark_moss_green-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Video Management</h2>
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="bg-dark_moss_green-600 hover:bg-dark_moss_green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Video</span>
                </button>
              </div>

              <div className="space-y-4">
                {videos.length > 0 ? (
                  videos.map((video) => (
                    <div key={video.id} className="flex items-center justify-between p-4 bg-cornsilk-100 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                          <Play className="w-6 h-6 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 flex items-center">
                            {video.title}
                            {video.is_featured && (
                              <Star className="w-4 h-4 text-earth_yellow-500 ml-2 fill-current" />
                            )}
                          </p>
                          <p className="text-sm text-slate-500">
                            {video.views_count} views • {format(new Date(video.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleFeatured(video.id, video.is_featured)}
                          className={`p-2 rounded-lg transition-colors ${
                            video.is_featured 
                              ? 'bg-earth_yellow-100 text-earth_yellow-600 hover:bg-earth_yellow-200' 
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title={video.is_featured ? 'Remove from featured' : 'Add to featured'}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteVideo(video.id, video.url)}
                          className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                          title="Delete video"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Video className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No videos uploaded yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {usageStats.recentActivity.length > 0 ? (
                  usageStats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 bg-cornsilk-100 rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.status === 'completed' ? 'bg-pakistan_green-100' : 'bg-earth_yellow-100'
                      }`}>
                        {activity.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-pakistan_green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-earth_yellow-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          Report generated for {activity.clients.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(activity.created_at), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'completed' 
                          ? 'bg-pakistan_green-100 text-pakistan_green-800' 
                          : 'bg-earth_yellow-100 text-earth_yellow-800'
                      }`}>
                        {activity.status === 'completed' ? 'Complete' : 'Processing'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Brand Assets</h2>
                <button
                  onClick={() => setShowBrandForm(true)}
                  className="bg-tiger_s_eye-600 hover:bg-tiger_s_eye-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Assets</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-cornsilk-100 rounded-lg p-6">
                  <h3 className="font-medium text-slate-900 mb-4 flex items-center">
                    <Image className="w-5 h-5 mr-2" />
                    Logo
                  </h3>
                  {brandSettings.logoUrl ? (
                    <div className="text-center">
                      <img 
                        src={brandSettings.logoUrl} 
                        alt="Logo" 
                        className="max-w-full h-16 mx-auto object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden">
                        <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center mx-auto">
                          <Image className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500 mt-2">No logo uploaded</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center mx-auto">
                        <Image className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500 mt-2">No logo uploaded</p>
                    </div>
                  )}
                </div>

                <div className="bg-cornsilk-100 rounded-lg p-6">
                  <h3 className="font-medium text-slate-900 mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Favicon
                  </h3>
                  {brandSettings.faviconUrl ? (
                    <div className="text-center">
                      <img 
                        src={brandSettings.faviconUrl} 
                        alt="Favicon" 
                        className="w-8 h-8 mx-auto"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden">
                        <div className="w-8 h-8 bg-slate-200 rounded flex items-center justify-center mx-auto">
                          <Globe className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500 mt-2">No favicon uploaded</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-8 h-8 bg-slate-200 rounded flex items-center justify-center mx-auto">
                        <Globe className="w-4 h-4 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500 mt-2">No favicon uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Video Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Upload New Video</h2>
            <form onSubmit={handleVideoUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Video File
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-earth_yellow-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-earth_yellow-500 focus:border-transparent"
                  placeholder="Video title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-earth_yellow-500 focus:border-transparent"
                  placeholder="Video description"
                  rows={3}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={newVideo.is_featured}
                  onChange={(e) => setNewVideo({ ...newVideo, is_featured: e.target.checked })}
                  className="w-4 h-4 text-dark_moss_green-600 border-slate-300 rounded focus:ring-dark_moss_green-500"
                />
                <label htmlFor="featured" className="ml-2 text-sm text-slate-700">
                  Feature this video on landing page
                </label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-dark_moss_green-600 hover:bg-dark_moss_green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload Video'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Brand Assets Modal */}
      {showBrandForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Upload Brand Assets</h2>
            <form onSubmit={handleBrandUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Logo (PNG/SVG recommended)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedLogo(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-tiger_s_eye-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">Will replace the current logo in headers and navigation</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Favicon (ICO/PNG, 32x32px recommended)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFavicon(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-tiger_s_eye-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">Will update the browser tab icon</p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={uploadingBrand || (!selectedLogo && !selectedFavicon)}
                  className="flex-1 bg-tiger_s_eye-600 hover:bg-tiger_s_eye-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {uploadingBrand ? 'Uploading...' : 'Upload Assets'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBrandForm(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}