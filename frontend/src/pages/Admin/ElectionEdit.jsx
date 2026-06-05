// frontend/src/pages/Admin/ElectionEdit.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Play, Square } from 'lucide-react';
import api from '../../services/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const ElectionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    max_choices: 1,
    status: 'draft'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchElection();
  }, [id]);

  const fetchElection = async () => {
    try {
      const res = await api.get(`/elections/${id}`);
      const data = res.data.data;
      
      // فرمت کردن تاریخ برای input type="datetime-local"
      const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        title: data.title || '',
        description: data.description || '',
        start_time: formatDateTime(data.start_time),
        end_time: formatDateTime(data.end_time),
        max_choices: data.max_choices || 1,
        status: data.status || 'draft'
      });
    } catch (error) {
      toast.error('خطا در دریافت اطلاعات انتخابات');
      navigate('/admin/elections');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'max_choices' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/elections/${id}`, formData);
      toast.success('انتخابات با موفقیت ویرایش شد');
      navigate(`/admin/elections/${id}`);
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
            onClick={() => navigate(`/admin/elections/${id}`)}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4"
          >
            <ArrowLeft size={20} />
            بازگشت به جزئیات
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800">ویرایش انتخابات</h1>
          <p className="text-gray-600 mt-2">اطلاعات انتخابات را ویرایش کنید</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
          {/* عنوان */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">عنوان انتخابات</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* توضیحات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* زمان‌ها */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">زمان شروع</label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">زمان پایان</label>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* حداکثر انتخاب */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">حداکثر انتخاب (چند رأیی)</label>
            <input
              type="number"
              name="max_choices"
              min="1"
              value={formData.max_choices}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">تعداد گزینه‌هایی که کاربر می‌تواند انتخاب کند</p>
          </div>

          {/* وضعیت */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 mb-3">وضعیت انتخابات</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={formData.status === 'draft'}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <span>پیش‌نویس (غیرفعال)</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-green-700 font-medium">فعال (شروع رأی‌گیری)</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="ended"
                  checked={formData.status === 'ended'}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-red-700 font-medium">پایان یافته</span>
              </label>
            </div>
          </div>

          {/* دکمه‌ها */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
              onClick={() => navigate(`/admin/elections/${id}`)}
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

export default ElectionEdit;