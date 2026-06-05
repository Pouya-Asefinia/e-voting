// frontend/src/pages/Admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Vote, Users, Megaphone, TrendingUp, Calendar } from 'lucide-react';
import api from '../../services/api';
import AdminLayout from './AdminLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalElections: 0,
    activeElections: 0,
    totalCandidates: 0,
    totalParticipants: 0,
    totalAnnouncements: 0
  });
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. دریافت لیست انتخابات‌ها
      const electionsRes = await api.get('/elections');
      const electionsData = electionsRes.data.data || [];
      setElections(electionsData);

      // 2. دریافت اعلانات
      const announcementsRes = await api.get('/announcements');
      const announcementsData = announcementsRes.data.data || [];

      // 3. محاسبه آمار
      let totalCandidates = 0;
      let totalParticipants = 0;
      let activeElections = 0;

      // برای هر انتخابات، تعداد نامزدها و شرکت‌کنندگان را بگیر
      const promises = electionsData.map(async (election) => {
        // بررسی وضعیت فعال بودن
        const now = new Date();
        const start = new Date(election.start_time);
        const end = new Date(election.end_time);
        
        if (election.status === 'active' || (now >= start && now <= end)) {
          activeElections++;
        }

        // گرفتن تعداد نامزدها
        try {
          const candRes = await api.get(`/candidates/${election.id}`);
          totalCandidates += (candRes.data.data || []).length;
        } catch (e) {
          // اگر خطا داد، نادیده بگیر
        }

        // گرفتن تعداد شرکت‌کنندگان
        try {
          const partRes = await api.get(`/participants/election/${election.id}`);
          totalParticipants += (partRes.data.data || []).length;
        } catch (e) {
          // اگر خطا داد، نادیده بگیر
        }
      });

      await Promise.all(promises);

      setStats({
        totalElections: electionsData.length,
        activeElections,
        totalCandidates,
        totalParticipants,
        totalAnnouncements: announcementsData.length
      });

    } catch (error) {
      console.error('خطا در دریافت آمار:', error);
      toast.error('خطا در بارگذاری داشبورد');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">داشبورد</h1>
        <p className="text-gray-600 mt-2">خوش آمدید، {stats.totalElections} انتخابات ثبت شده است.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">کل انتخابات</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalElections}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Vote size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">فعال</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeElections}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">نامزدها</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalCandidates}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">شرکت‌کنندگان</p>
              <p className="text-3xl font-bold text-orange-600">{stats.totalParticipants}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Calendar size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">دسترسی سریع</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            to="/admin/elections"
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-center"
          >
            <Vote size={32} className="mx-auto text-blue-600 mb-2" />
            <p className="font-medium text-gray-800">مدیریت انتخابات</p>
          </Link>
          <Link
            to="/admin/announcements"
            className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition text-center"
          >
            <Megaphone size={32} className="mx-auto text-orange-600 mb-2" />
            <p className="font-medium text-gray-800">مدیریت اعلانات</p>
          </Link>
          <Link
            to="/admin/elections"
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition text-center"
          >
            <Users size={32} className="mx-auto text-green-600 mb-2" />
            <p className="font-medium text-gray-800">افزودن انتخابات جدید</p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;