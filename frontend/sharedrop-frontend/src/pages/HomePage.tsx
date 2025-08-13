import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { 
  HardDrive, 
  Upload, 
  Share2, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Zap,
  Cloud
} from 'lucide-react';

export const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Upload,
      title: 'Easy Upload',
      description: 'Drag and drop files or browse to upload. Supports all major file types up to 100MB.'
    },
    {
      icon: Share2,
      title: 'Secure Sharing',
      description: 'Generate secure, shareable links for your files with just one click.'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your files are encrypted and protected. Only you and those you share with can access them.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built with modern technology for blazing fast uploads and downloads.'
    },
    {
      icon: Cloud,
      title: 'Cloud Storage',
      description: 'Access your files from anywhere, anytime. Never lose your important documents.'
    },
    {
      icon: CheckCircle,
      title: 'Simple & Clean',
      description: 'Beautiful, intuitive interface inspired by Apple\'s design principles.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="relative px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <HardDrive size={24} className="text-blue-600" />
            </div>
            <span className="text-xl font-semibold text-gray-900">ShareDrop</span>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button>
                  Go to Dashboard
                  <ArrowRight size={16} />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button>
                    Get Started
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            File sharing
            <span className="text-blue-600"> made easy</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload, organize, and share your files securely with ShareDrop. 
            Beautiful design meets powerful functionality.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated && (
              <>
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start sharing for free
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Sign in to your account
                  </Button>
                </Link>
              </>
            )}
            {isAuthenticated && (
              <Link to="/dashboard">
                <Button size="lg">
                  Go to Dashboard
                  <ArrowRight size={18} />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to share files
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ShareDrop combines security, simplicity, and speed to create the perfect file sharing experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-50 rounded-xl w-fit mb-4">
                  <feature.icon size={24} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to start sharing?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of users who trust ShareDrop for their file sharing needs.
          </p>
          
          {!isAuthenticated && (
            <Link to="/register">
              <Button size="lg">
                Create your free account
                <ArrowRight size={18} />
              </Button>
            </Link>
          )}
          {isAuthenticated && (
            <Link to="/dashboard">
              <Button size="lg">
                Go to Dashboard
                <ArrowRight size={18} />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto text-center text-gray-600">
          <p>&copy; 2025 ShareDrop. Built with modern technology for the modern web.</p>
        </div>
      </footer>
    </div>
  );
};
