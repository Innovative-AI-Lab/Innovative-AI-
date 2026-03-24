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
      navigate('/login?error=' + error);
      return;
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem('token', token);
        setUser(user);
        navigate('/');
      } catch (err) {
        console.error('OAuth parse error:', err);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-black">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 flex flex-col items-center gap-4 border border-gray-100 dark:border-gray-700">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
          <i className="ri-loader-4-line animate-spin text-white text-2xl"></i>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Authenticating...</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please wait while we sign you in.</p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
