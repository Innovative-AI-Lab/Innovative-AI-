import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserContext } from '../context/user.context';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      alert('Authentication failed. Please try again.');
      navigate('/login');
      return;
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem('token', token);
        setUser(user);
        navigate('/');
      } catch (err) {
        console.error('Error parsing user data:', err);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, setUser]);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
      <div className="bg-white/30 backdrop-blur-2xl rounded-3xl p-8 border border-white/30 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-loader-4-line animate-spin text-white text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Authenticating...</h2>
          <p className="text-gray-600">Please wait while we sign you in.</p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;