import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import { HardDrive } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleRegisterSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <HardDrive size={32} className="text-blue-600" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-semibold text-gray-900 mb-2">
          ShareDrop
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Secure file sharing made easy
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <RegisterForm onSuccess={handleRegisterSuccess} />
      </div>
    </div>
  );
};
