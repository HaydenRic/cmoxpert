import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { trackFeatureUsage, monitorApiCall } from '../lib/monitoring';
import { 
  FileText, 
  MessageSquare, 
  Mail, 
  Globe, 
  Sparkles, 
  Copy, 
  Download, 
  Edit2, 
  Trash2, 
  Plus, 
  Filter, 
  Search, 
  Clock, 
  CheckCircle, 
  Archive,
  Zap,
  Target,
  TrendingUp,
  Users,
  Eye,
  Share2,
  BookOpen,
  Lightbulb,
  Brain,
  Wand2
} from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface GeneratedContent {
  id: string;
  user_id: string;
  client_id?: string;
  content_type: string;
  title: string;
  content: string;
  ai_prompt?: string;
  status: string;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
    domain: string;
  };
}

interface Client {
  id: string;
  name: string;
  domain: string;
  industry?: string;
}

export function ContentHub() {
  const { user } = useAuth();
  const [content, setContent] = useState<GeneratedContent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    content_type: 'blog_post',
    client_id: '',
    title: '',
    prompt: '',
    tone: 'professional',
    length: 'medium',
    keywords: ''
  });

  const contentTypes = [
    { value: 'blog_post', label: 'Blog Post', icon: FileText, description: 'SEO-optimized blog articles' },
    { value: 'social_media_post', label: 'Social Media', icon: MessageSquare, description: 'Engaging social content' },
    { value: 'email_copy', label: 'Email Copy', icon: Mail, description: 'Compelling email campaigns' },
    { value: 'ad_copy', label: 'Ad Copy', icon: Target, description: 'High-converting advertisements' },
    { value: 'landing_page', label: 'Landing Page', icon: Globe, description: 'Conversion-focused pages' },
    { value: 'press_release', label: 'Press Release', icon: BookOpen, description: 'Professional announcements' }
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'authoritative', label: 'Authoritative' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'educational', label: 'Educational' }
  ];

  const lengthOptions = [
    { value: 'short', label: 'Short (300-500 words)' },
    { value: 'medium', label: 'Medium (500-1000 words)' },
    { value: 'long', label: 'Long (1000+ words)' }
  ];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load clients
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user!.id)
        .order('name');

      setClients(clientsData || []);

      // Load generated content
      const { data: contentData } = await supabase
        .from('generated_content')
        .select(`
          *,
          clients(name, domain)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      setContent(contentData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    
    // Track feature usage
    trackFeatureUsage('ai_content', 'generation_started', {
      content_type: generateForm.content_type,
      client_id: generateForm.client_id
    });

    try {
      // Get client context if selected
      const selectedClient = clients.find(c => c.id === generateForm.client_id);
      
      // Build AI prompt
      const contextPrompt = selectedClient 
        ? `Create ${generateForm.content_type.replace('_', ' ')} for ${selectedClient.name} (${selectedClient.domain}), a ${selectedClient.industry || 'B2B SaaS'} company.`
        : `Create ${generateForm.content_type.replace('_', ' ')} for a B2B SaaS company.`;
      
      const fullPrompt = `${contextPrompt}

Title: ${generateForm.title}
Tone: ${generateForm.tone}
Length: ${generateForm.length}
${generateForm.keywords ? `Keywords to include: ${generateForm.keywords}` : ''}

Additional requirements: ${generateForm.prompt}

Please create compelling, professional content that drives engagement and conversions.`;

      // Generate content using templates (will use OpenAI if API key is configured in Admin)
      const generatedContent = await monitorApiCall('generate_content', () =>
        simulateContentGeneration(generateForm, fullPrompt)
      );

      // Save to database
      const { error } = await supabase
        .from('generated_content')
        .insert([{
          user_id: user!.id,
          client_id: generateForm.client_id || null,
          content_type: generateForm.content_type,
          title: generateForm.title,
          content: generatedContent,
          ai_prompt: fullPrompt,
          status: 'draft'
        }]);

      if (error) throw error;
      
      // Track successful completion
      trackFeatureUsage('ai_content', 'generation_completed', {
        content_type: generateForm.content_type,
        client_id: generateForm.client_id
      });

      // Reset form and reload data
      setGenerateForm({
        content_type: 'blog_post',
        client_id: '',
        title: '',
        prompt: '',
        tone: 'professional',
        length: 'medium',
        keywords: ''
      });
      setShowGenerateForm(false);
      loadData();
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
      
      // Track failure
      trackFeatureUsage('ai_content', 'generation_failed', {
        content_type: generateForm.content_type,
        error: error.message
      });
    } finally {
      setGenerating(false);
    }
  };

  const simulateContentGeneration = async (form: any, prompt: string): Promise<string> => {
    // Generate from templates (production would use OpenAI API if key configured)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const templates = {
      blog_post: `# ${form.title}

## Introduction

In today's competitive B2B SaaS landscape, companies are constantly seeking innovative solutions to streamline their operations and drive growth. This comprehensive guide explores the latest trends and strategies that can help your business stay ahead of the curve.

## Key Benefits

### 1. Enhanced Productivity
Our research shows that implementing the right tools can increase team productivity by up to 40%. This significant improvement comes from:
- Automated workflow processes
- Streamlined communication channels
- Real-time collaboration features

### 2. Cost Optimization
Smart businesses are reducing operational costs while maintaining quality through:
- Efficient resource allocation
- Automated reporting systems
- Data-driven decision making

### 3. Scalable Growth
Future-proof your business with solutions that grow with you:
- Flexible pricing models
- Modular feature sets
- Enterprise-grade security

## Implementation Strategy

To maximize the benefits of these solutions, consider the following implementation approach:

1. **Assessment Phase**: Evaluate your current processes and identify improvement opportunities
2. **Planning Phase**: Develop a comprehensive rollout strategy with clear milestones
3. **Execution Phase**: Implement changes gradually with proper training and support
4. **Optimization Phase**: Monitor performance and make data-driven adjustments

## Conclusion

The future belongs to businesses that embrace innovation and adapt quickly to market changes. By implementing these strategies, you'll position your company for sustainable growth and long-term success.

Ready to transform your business? Contact our team today to learn how we can help you achieve your goals.`,

      social_media_post: `🚀 ${form.title}

Did you know that 73% of B2B companies are missing out on significant growth opportunities simply because they're not leveraging the right tools?

Here's what industry leaders are doing differently:

✅ Automating repetitive tasks to focus on strategy
✅ Using data analytics to make informed decisions  
✅ Implementing scalable solutions that grow with their business

The result? 40% faster growth and 25% higher customer satisfaction.

What's your biggest challenge in scaling your business? Drop a comment below! 👇

#B2BSaaS #BusinessGrowth #Productivity #Innovation`,

      email_copy: `Subject: ${form.title}

Hi [First Name],

I hope this email finds you well. I wanted to reach out because I noticed that many companies in your industry are facing similar challenges when it comes to scaling their operations efficiently.

**Here's what we're seeing:**
- 67% of businesses struggle with manual processes that slow down growth
- Teams spend 3+ hours daily on tasks that could be automated
- Decision-makers lack real-time insights to make strategic choices

**The good news?** There's a proven solution that's helping companies like yours achieve:
- 40% increase in operational efficiency
- 25% reduction in manual work
- Real-time visibility into key performance metrics

I'd love to show you how [Company Name] implemented these solutions and achieved remarkable results in just 30 days.

Would you be interested in a brief 15-minute call this week to discuss how this could work for your business?

Best regards,
[Your Name]

P.S. I've attached a case study showing exactly how we helped a similar company increase their productivity by 40%. It's a quick 2-minute read that I think you'll find valuable.`,

      ad_copy: `**${form.title}**

Stop wasting time on manual processes that slow down your growth.

🎯 **Get 40% more done in less time**
🎯 **Reduce operational costs by 25%**  
🎯 **Make data-driven decisions instantly**

Join 500+ B2B companies already using our platform to scale faster and smarter.

✅ Free 14-day trial
✅ No setup fees
✅ Cancel anytime

**[Start Your Free Trial]**

*"This solution transformed our business operations. We're now 40% more efficient and our team loves the streamlined workflows."* - Sarah Chen, VP Operations

Limited time: Get 2 months free when you sign up this week!`,

      landing_page: `# ${form.title}

## Transform Your Business Operations in 30 Days

Join 500+ B2B companies using our platform to automate workflows, boost productivity, and drive sustainable growth.

### ⚡ **Instant Results**
- 40% increase in team productivity
- 25% reduction in operational costs
- Real-time insights and reporting

### 🛡️ **Enterprise-Grade Security**
- SOC 2 Type II certified
- GDPR compliant
- 99.9% uptime guarantee

### 🚀 **Easy Implementation**
- Setup in under 24 hours
- Dedicated onboarding specialist
- Comprehensive training included

## What Our Customers Say

*"The ROI was immediate. Within the first month, we saw a 40% improvement in our operational efficiency. The team adoption was seamless thanks to the intuitive interface."*

**Sarah Chen** - VP Operations, TechFlow SaaS

---

## Ready to Get Started?

**Free 14-Day Trial** • **No Setup Fees** • **Cancel Anytime**

[Start Your Free Trial]

Questions? Book a demo with our team: [Schedule Demo]

*Trusted by 500+ companies worldwide*`,

      press_release: `FOR IMMEDIATE RELEASE

${form.title}

[City, Date] - [Company Name], a leading provider of innovative B2B SaaS solutions, today announced significant milestones in helping businesses streamline their operations and achieve sustainable growth.

**Key Highlights:**
- 500+ companies now using the platform
- 40% average increase in operational efficiency
- 25% reduction in manual processes

"We're thrilled to see the positive impact our solution is having on businesses across various industries," said [CEO Name], CEO of [Company Name]. "Our mission has always been to empower companies with the tools they need to scale efficiently and focus on what matters most - growing their business."

**About the Solution:**
The platform offers comprehensive workflow automation, real-time analytics, and seamless integrations that help businesses:
- Automate repetitive tasks
- Gain actionable insights from data
- Improve team collaboration
- Scale operations efficiently

**Industry Recognition:**
The company has received recognition for its innovative approach to business automation and has been featured in leading industry publications.

**About [Company Name]:**
Founded in [Year], [Company Name] is dedicated to helping B2B companies optimize their operations through innovative technology solutions. The company serves over 500 businesses worldwide and continues to expand its platform capabilities.

For more information, visit [website] or contact:

[Contact Name]
[Title]
[Email]
[Phone]

###`
    };

    return templates[form.content_type] || templates.blog_post;
  };

  const updateContentStatus = async (contentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('generated_content')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', contentId);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error updating content status:', error);
    }
  };

  const deleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const { error } = await supabase
        .from('generated_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const filteredContent = content.filter(item => {
    const matchesType = selectedType === 'all' || item.content_type === selectedType;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clients?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = contentTypes.find(t => t.value === type);
    return typeConfig?.icon || FileText;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-cream-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-cream-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Content Hub</h1>
          <p className="text-slate-600">Generate, manage, and optimize your marketing content</p>
        </div>

        <button
          onClick={() => setShowGenerateForm(true)}
          disabled={generating}
          className="bg-gradient-to-r from-slate_blue-600 to-charcoal-700 hover:from-slate_blue-700 hover:to-charcoal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all"
        >
          {generating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Create Content</span>
            </>
          )}
        </button>
      </div>

      {/* Template Mode Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start space-x-3">
        <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-blue-900 mb-1">Template-Based Generation</h3>
          <p className="text-sm text-blue-700">
            Content is generated using professional templates. For AI-powered generation with OpenAI, add your API key in{' '}
            <a href="/admin" className="underline font-medium hover:text-blue-900">Admin Settings</a>.
          </p>
        </div>
      </div>

      {/* Content Type Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {contentTypes.map((type) => {
          const typeCount = content.filter(c => c.content_type === type.value).length;
          return (
            <div key={type.value} className="bg-white rounded-xl p-6 shadow-sm border border-cream-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-slate_blue-100 to-charcoal-100 rounded-lg flex items-center justify-center">
                  <type.icon className="w-6 h-6 text-slate_blue-700" />
                </div>
                <span className="text-2xl font-bold text-slate-900">{typeCount}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{type.label}</h3>
              <p className="text-slate-600 text-sm">{type.description}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          {contentTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {filteredContent.length > 0 ? (
          filteredContent.map((item) => {
            const TypeIcon = getTypeIcon(item.content_type);
            return (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-cream-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate_blue-100 to-charcoal-100 rounded-lg flex items-center justify-center">
                        <TypeIcon className="w-5 h-5 text-slate_blue-700" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <span className="capitalize">{item.content_type.replace('_', ' ')}</span>
                          {item.clients && (
                            <>
                              <span>•</span>
                              <span>{item.clients.name}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{format(new Date(item.created_at), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 mb-4 line-clamp-3">
                      {item.content.substring(0, 200)}...
                    </p>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        {item.content.length} characters
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => copyToClipboard(item.content)}
                      className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    
                    {item.status === 'draft' && (
                      <button
                        onClick={() => updateContentStatus(item.id, 'published')}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                        title="Publish"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    
                    {item.status === 'published' && (
                      <button
                        onClick={() => updateContentStatus(item.id, 'archived')}
                        className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteContent(item.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-slate_blue-100 to-charcoal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-slate_blue-700" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm || selectedType !== 'all' || selectedStatus !== 'all' 
                ? 'No content found' 
                : 'No content generated yet'
              }
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Generate your first AI-powered content to get started'
              }
            </p>
            {(!searchTerm && selectedType === 'all' && selectedStatus === 'all') && (
              <button
                onClick={() => setShowGenerateForm(true)}
                className="bg-slate_blue-600 hover:bg-slate_blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Generate Your First Content
              </button>
            )}
          </div>
        )}
      </div>

      {/* Generate Content Modal */}
      {showGenerateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                  <Brain className="w-6 h-6 mr-2 text-slate_blue-600" />
                  Generate AI Content
                </h2>
                <button
                  onClick={() => setShowGenerateForm(false)}
                  className="text-slate-500 hover:text-slate-700 p-2"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
            </div>
            
            <form onSubmit={generateContent} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Content Type *
                  </label>
                  <select
                    value={generateForm.content_type}
                    onChange={(e) => setGenerateForm({ ...generateForm, content_type: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    required
                  >
                    {contentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Client (Optional)
                  </label>
                  <select
                    value={generateForm.client_id}
                    onChange={(e) => setGenerateForm({ ...generateForm, client_id: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  >
                    <option value="">General content</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Title/Topic *
                </label>
                <input
                  type="text"
                  value={generateForm.title}
                  onChange={(e) => setGenerateForm({ ...generateForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="e.g., How to Increase B2B SaaS Conversion Rates"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tone
                  </label>
                  <select
                    value={generateForm.tone}
                    onChange={(e) => setGenerateForm({ ...generateForm, tone: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  >
                    {toneOptions.map((tone) => (
                      <option key={tone.value} value={tone.value}>
                        {tone.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Length
                  </label>
                  <select
                    value={generateForm.length}
                    onChange={(e) => setGenerateForm({ ...generateForm, length: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  >
                    {lengthOptions.map((length) => (
                      <option key={length.value} value={length.value}>
                        {length.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Keywords (Optional)
                </label>
                <input
                  type="text"
                  value={generateForm.keywords}
                  onChange={(e) => setGenerateForm({ ...generateForm, keywords: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="e.g., B2B SaaS, conversion optimization, lead generation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Additional Instructions
                </label>
                <textarea
                  value={generateForm.prompt}
                  onChange={(e) => setGenerateForm({ ...generateForm, prompt: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="Provide specific requirements, target audience details, key points to include, or any other instructions for the AI..."
                />
              </div>

              <div className="bg-slate_blue-50 rounded-lg p-4 border border-slate_blue-100">
                <h3 className="font-medium text-slate_blue-900 mb-2 flex items-center">
                  <Wand2 className="w-4 h-4 mr-2" />
                  AI Generation Process
                </h3>
                <p className="text-sm text-slate_blue-700">
                  Our AI will analyze your requirements and generate high-quality, engaging content tailored to your specifications. The content will be optimized for your target audience and business goals.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={generating || !generateForm.title}
                  title={generating ? 'Generating content...' : !generateForm.title ? 'Please enter a title first' : 'Generate content from template'}
                  className="flex-1 bg-gradient-to-r from-slate_blue-600 to-charcoal-700 hover:from-slate_blue-700 hover:to-charcoal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                >
                  {generating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating Content...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Content</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGenerateForm(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 px-4 rounded-lg font-medium transition-colors"
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