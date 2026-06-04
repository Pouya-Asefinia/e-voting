// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Vote, Calendar, Clock, Users, CheckCircle, LogIn, UserPlus, LogOut, User } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [annRes, elecRes] = await Promise.all([
        api.get('/announcements/active'),
        api.get('/elections')
      ]);
      setAnnouncements(annRes.data.data || []);
      setElections(elecRes.data.data || []);
    } catch (error) {
      console.error('خطا در دریافت داده‌ها:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // بررسی وضعیت انتخابات
  const getElectionStatus = (election) => {
    const now = new Date();
    const start = new Date(election.start_time);
    const end = new Date(election.end_time);

    if (election.status === 'ended' || now > end) {
      return { text: 'پایان یافته', color: 'bg-gray-500', icon: CheckCircle };
    }
    if (now >= start && now <= end && election.status === 'active') {
      return { text: 'در حال برگزاری', color: 'bg-green-500', icon: Vote };
    }
    if (now < start) {
      return { text: 'آینده', color: 'bg-blue-500', icon: Calendar };
    }
    return { text: 'غیرفعال', color: 'bg-yellow-500', icon: Clock };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-blue-600">
              🗳️ برگزاری انتخابات آنلاین
            </Link>
            
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-gray-600 flex items-center gap-2">
                    <User size={18} />
                    {user.full_name}
                    {user.role === 'admin' && (
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">ادمین</span>
                    )}
                  </span>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                      پنل ادمین
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition"
                  >
                    <LogOut size={18} />
                    خروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
                  >
                    <LogIn size={18} />
                    ورود
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    <UserPlus size={18} />
                    ثبت‌نام
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* هدر */}
      {/* <header className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">سیستم رأی‌گیری الکترونیکی</h1>
          <p className="text-xl opacity-90">مشارکت در انتخابات به صورت آنلاین و امن</p>
        </div>
      </header> */}

      <div className="container mx-auto px-4 py-8">
        {/* اعلانات */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-blue-600 rounded"></span>
            اعلانات
          </h2>
          
          {announcements.length === 0 ? (
            <p className="text-gray-500 text-center py-8">هیچ اعلانی وجود ندارد</p>
          ) : (
            <div className="grid gap-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-white p-6 rounded-lg shadow-md border-r-4 border-blue-500">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{ann.title}</h3>
                  <p className="text-gray-600">{ann.content}</p>
                  {ann.election_title && (
                    <span className="text-sm text-blue-600 mt-2 block">
                      مرتبط با: {ann.election_title}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* انتخابات */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-green-600 rounded"></span>
            انتخابات
          </h2>
          
          {elections.length === 0 ? (
            <p className="text-gray-500 text-center py-8">هیچ انتخاباتی وجود ندارد</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {elections.map((election) => {
                const status = getElectionStatus(election);
                const StatusIcon = status.icon;
                
                return (
                  <div key={election.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg text-gray-800">{election.title}</h3>
                        <span className={`${status.color} text-white text-xs px-2 py-1 rounded-full flex items-center gap-1`}>
                          <StatusIcon size={12} />
                          {status.text}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">
                        {election.description || 'توضیحاتی وجود ندارد'}
                      </p>
                      
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>شروع: {new Date(election.start_time).toLocaleDateString('fa-IR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>پایان: {new Date(election.end_time).toLocaleDateString('fa-IR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          <span>{election.candidates_count || 0} نامزد</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {status.text === 'در حال برگزاری' && (
                          <Link
                            to={`/vote/${election.id}`}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg text-center hover:bg-green-700 transition"
                          >
                            ورود به انتخابات
                          </Link>
                        )}
                        {status.text === 'پایان یافته' && (
                          <Link
                            to={`/results/${election.id}`}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-center hover:bg-blue-700 transition"
                          >
                            مشاهده نتایج
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;