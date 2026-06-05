// frontend/src/pages/Admin/AnnouncementEdit.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../services/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const AnnouncementEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    election_id: ''
  });
  
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAnnouncement();
    fetchElections();
  }, [id]);

  const fetchAnnouncement = async () => {
    try {
      const res = await api.get(`/announcements/${id}`);
      const data = res.data.data;
      setFormData({
        title: data.title || '',
        content: data.content || '',
        election_id: data.election_id || ''
      });
    } catch (error) {
      toast.error('خطا در دریافت اطلاعات اعلان');
      navigate('/admin/announcements');
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/announcements/${id}`, {
        ...formData,
        election_id: formData.election_id || null
      });
      toast.success('اعلان با موفقیت ویرایش شد');
      navigate('/admin/announcements');
    } catch (error) {
      toast.error(error.response?.data?.message || 'خطا در ویرایش');
    } finally {
      setSaving(false);
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/announcements')}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4"
          >
            <ArrowLeft size={20} />
            بازگشت به لیست اعلانات
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800">ویرایش اعلان</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
          {/* عنوان */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">عنوان اعلان</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {/* محتوا */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">محتوا</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {/* انتخابات مرتبط */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">انتخابات مرتبط (اختیاری)</label>
            <select
              name="election_id"
              value={formData.election_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">بدون انتخابات خاص</option>
              {elections.map(elec => (
                <option key={elec.id} value={elec.id}>{elec.title}</option>
              ))}
            </select>
          </div>

          {/* دکمه‌ها */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={20} />
                  ذخیره تغییرات
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/admin/announcements')}
              className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AnnouncementEdit;