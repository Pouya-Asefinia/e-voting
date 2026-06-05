// frontend/src/pages/Admin/AnnouncementsList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Megaphone,
  Calendar
} from 'lucide-react';
import api from '../../services/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const AnnouncementsList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    election_id: ''
  });
  const [elections, setElections] = useState([]);

  useEffect(() => {
    fetchAnnouncements();
    fetchElections();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data.data || []);
    } catch (error) {
      toast.error('خطا در دریافت لیست اعلانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchElections = async () => {
    try {
      const res = await api.get('/elections');
      setElections(res.data.data || []);
    } catch (error) {
      console.error('خطا در دریافت انتخابات');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    
    try {
      await api.delete(`/announcements/${id}`);
      toast.success('اعلان حذف شد');
      fetchAnnouncements();
    } catch (error) {
      toast.error('خطا در حذف');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    try {
      await api.post('/announcements', {
        ...formData,
        election_id: formData.election_id || null
      });
      toast.success('اعلان ایجاد شد');
      setShowCreateModal(false);
      setFormData({ title: '', content: '', election_id: '' });
      fetchAnnouncements();
    } catch (error) {
      toast.error(error.response?.data?.message || 'خطا در ایجاد');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">مدیریت اعلانات</h1>
          <p className="text-gray-600 mt-2">لیست تمام اعلانات سیستم</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
        >
          <Plus size={20} />
          اعلان جدید
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">ایجاد اعلان جدید</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">محتوا</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">انتخابات مرتبط (اختیاری)</label>
                <select
                  value={formData.election_id}
                  onChange={(e) => setFormData({...formData, election_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">بدون انتخابات خاص</option>
                  {elections.map(elec => (
                    <option key={elec.id} value={elec.id}>{elec.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  ایجاد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcements Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عنوان</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">محتوا</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">انتخابات مرتبط</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاریخ ایجاد</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {announcements.map((ann) => (
              <tr key={ann.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{ann.title}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-xs truncate">
                    {ann.content}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {ann.election_title || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(ann.created_at).toLocaleDateString('fa-IR')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/announcements/${ann.id}/edit`}
                      className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                      title="ویرایش"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(ann.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="حذف"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {announcements.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            هیچ اعلانی وجود ندارد
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AnnouncementsList;