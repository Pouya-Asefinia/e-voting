// frontend/src/pages/Admin/ElectionsList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Users, 
  Eye, 
  Vote,
  Calendar,
  Clock
} from 'lucide-react';
import api from '../../services/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const ElectionsList = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    max_choices: 1
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const res = await api.get('/elections');
      setElections(res.data.data || []);
    } catch (error) {
      toast.error('خطا در دریافت لیست انتخابات');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا مطمئن هستید؟ این عملیات غیرقابل بازگشت است.')) return;
    
    try {
      await api.delete(`/elections/${id}`);
      toast.success('انتخابات حذف شد');
      fetchElections();
    } catch (error) {
      toast.error('خطا در حذف');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    try {
      await api.post('/elections', formData);
      toast.success('انتخابات ایجاد شد');
      setShowCreateModal(false);
      setFormData({ title: '', description: '', start_time: '', end_time: '', max_choices: 1 });
      fetchElections();
    } catch (error) {
      toast.error(error.response?.data?.message || 'خطا در ایجاد');
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">مدیریت انتخابات</h1>
          <p className="text-gray-600 mt-2">لیست تمام انتخابات‌های سیستم</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={20} />
          انتخابات جدید
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">ایجاد انتخابات جدید</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">زمان شروع</label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">زمان پایان</label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">حداکثر انتخاب</label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_choices}
                  onChange={(e) => setFormData({...formData, max_choices: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  ایجاد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Elections Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عنوان</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">وضعیت</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">زمان شروع</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نامزدها</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {elections.map((election) => (
              <tr key={election.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{election.title}</div>
                  <div className="text-sm text-gray-500">{election.description?.substring(0, 50)}...</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    election.status === 'active' ? 'bg-green-100 text-green-800' :
                    election.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {election.status === 'active' ? 'فعال' :
                     election.status === 'ended' ? 'پایان یافته' :
                     'پیش‌نویس'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(election.start_time).toLocaleDateString('fa-IR')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {election.candidates_count || 0}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/elections/${election.id}`}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="مشاهده جزئیات"
                    >
                      <Eye size={18} />
                    </Link>
                    <Link
                      to={`/admin/elections/${election.id}/participants`}
                      className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                      title="تعیین شرکت‌کنندگان"
                    >
                      <Users size={18} />
                    </Link>
                    <Link
                      to={`/admin/elections/${election.id}/edit`}
                      className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                      title="ویرایش"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(election.id)}
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
        
        {elections.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            هیچ انتخاباتی وجود ندارد
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ElectionsList;