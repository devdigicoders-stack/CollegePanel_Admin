import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/college-admin/login`, { username, password });
      
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin_info', JSON.stringify(res.data));
      
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials or server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col md:flex-row bg-[#F8F9FA] font-['Outfit']">
      
      {/* Left Sidebar Panel */}
      <div className="md:w-[40%] lg:w-[35%] h-full bg-[#022a36] text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
        <div className="z-10 flex flex-col items-center text-center mt-16 lg:mt-20">
          <div className="mb-6">
            {/* Original SVG logo */}
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12l10-6 10 6-10 6-10-6z" />
              <path d="M22 12v6" />
              <path d="M6 14.5V20c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-5.5" />
            </svg>
          </div>
          <h1 className="text-[22px] lg:text-[24px] font-bold tracking-wide mb-3 font-['Inter']">POLYTECHNIC COLLEGE ERP</h1>
          <p className="text-[#2DD4BF] text-base font-medium">College / Admin Login</p>
        </div>

        {/* Building Image */}
        <div className="w-full relative z-10 flex justify-center items-end h-[50%] pb-10">
          <img 
            src="/images/sideImage.png" 
            alt="College Building" 
            className="w-[110%] max-w-none object-contain opacity-90 transform scale-[1.15]"
          />
        </div>
      </div>

      {/* Mobile view top section - hidden on desktop */}
      <div className="md:hidden bg-[#022a36] text-white py-12 px-6 flex flex-col items-center justify-center relative overflow-hidden">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
          <path d="M2 12l10-6 10 6-10 6-10-6z" />
          <path d="M22 12v6" />
          <path d="M6 14.5V20c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-5.5" />
        </svg>
        <h1 className="text-[20px] font-bold tracking-wider mb-2 font-['Inter'] text-center">POLYTECHNIC COLLEGE ERP</h1>
        <p className="text-[#2DD4BF] text-[13px] font-medium">College / Admin Login</p>
      </div>

      {/* Right Login Panel */}
      <div className="flex-1 h-full flex flex-col justify-center items-center p-6 relative bg-[#F9FAFB]">
        <div className="w-full max-w-[480px] bg-white rounded-2xl p-8 lg:p-12 shadow-[0_4px_24px_rgb(0,0,0,0.03)] border border-gray-100 relative z-10">
          
          <h2 className="text-[28px] font-bold text-[#0A6C54] mb-2 font-['Outfit']">Welcome Back!</h2>
          <p className="text-[#6B7280] mb-6 lg:mb-8 font-['Inter'] text-[15px]">Sign in to your college admin account</p>

          <form onSubmit={handleLogin} className="space-y-4 lg:space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-[#4B5563] mb-1.5 font-['Inter']">Username / Email</label>
              <input 
                type="text" 
                placeholder="Enter username or email"
                className="w-full px-4 py-2.5 lg:py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] transition-all font-['Inter'] text-[14px] placeholder:text-[#9CA3AF]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#4B5563] mb-1.5 font-['Inter']">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter password"
                  className="w-full px-4 py-2.5 lg:py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] transition-all font-['Inter'] text-[14px] placeholder:text-[#9CA3AF] pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 pb-1 lg:pt-2 lg:pb-2">
              <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0A6C54] focus:ring-[#0A6C54] accent-[#0A6C54] cursor-pointer" />
                </div>
                <span className="ml-2 text-[13px] text-[#4B5563] font-['Inter'] font-medium group-hover:text-gray-800 transition-colors">Remember Me</span>
              </label>
              <a href="#" className="text-[13px] font-semibold text-[#0A6C54] hover:text-[#075340] transition-colors font-['Inter']">
                Forgot Password?
              </a>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A6C54] hover:bg-[#085a46] disabled:bg-[#0A6C54]/70 text-white font-medium py-3 lg:py-3.5 rounded-lg transition-colors font-['Outfit'] text-[15px] mt-2 tracking-wide flex justify-center items-center"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Login'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 lg:bottom-6 left-0 w-full text-center">
          <p className="text-[#9CA3AF] text-[12px] font-['Inter']">
            © 2024 Polytechnic College ERP. All rights reserved.
          </p>
        </div>
      </div>


    </div>
  );
};

export default Login;
