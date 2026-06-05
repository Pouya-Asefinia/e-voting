// frontend/src/pages/Admin/ParticipantManager.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Trash2, Plus, Search } from 'lucide-react';
import api from '../../services/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const ParticipantManager = () => {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchElectionData();
  }, [id]);

  const fetchElectionData = async () => {
    try {
      const [elecRes, partRes] = await Promise.all([
        api.get(`/elections/${id}`),
        api.get(`/participants/election/${id}`)
      ]);
      
      setElection(elecRes.data.data);
      setParticipants(partRes.data.data || []);
    } catch (error) {
      toast.error('خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get(`/participants/users?election_id=${id}`);
      setAllUsers(res.data.data || []);
    } catch (error) {
      toast.error('خطا در دریافت کاربران');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddParticipants = async () => {
    if (selectedUsers.length === 0) {
      toast.error('حداقل یک کاربر انتخاب کنید');
      return;
    }
    
    try {
      await api.post('/participants/bulk', {
        election_id: id,
        user_ids: selectedUsers
      });
      toast.success(`${selectedUsers.length} کاربر اضافه شد`);
      setShowAddModal(false);
      setSelectedUsers([]);
      fetchElectionData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'خطا در اضافه کردن');
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await api.delete(`/participants/${id}/${userId}`);
      toast.success('کاربر حذف شد');
      fetchElectionData();
    } catch (error) {
      toast.error('خطا در حذف');
    }
  };

  const filteredUsers = allUsers.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!election) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">انتخابات یافت نشد</p>
          <Link to="/admin/elections" className="text-blue-600 hover:underline mt-4 inline-block">
            بازگشت
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/admin/elections" 
          className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={20} />
          بازگشت به لیست انتخابات
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">مدیریت شرکت‌کنندگان</h1>
            <p className="text-gray-600 mt-2">انتخابات: {election.title}</p>
          </div>
          <button
            onClick={() => {
              setShowAddModal(true);
              fetchAvailableUsers();
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            افزودن شرکت‌کننده
          </button>
        </div>
      </div>

      {/* Participants List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users size={24} className="text-purple-600" />
          لیست شرکت‌کنندگان ({participants.length})
        </h2>

        {participants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            هنوز شرکت‌کننده‌ای اضافه نشده است
          </div>
        ) : (
          <div className="grid gap-2">
            {participants.map((p) => (
              <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-800">{p.full_name}</span>
                    <span className="text-sm text-gray-500 mr-2">({p.username})</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(p.user_id)}
                  className="text-red-600 hover:bg-red-50 p-2 rounded transition"
                  title="حذف"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Participants Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">افزودن شرکت‌کنندگان</h2>
              <p className="text-sm text-gray-500 mt-1">کاربرانی که قبلاً اضافه شده‌اند غیرفعال هستند</p>
            </div>

            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute right-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="جستجوی نام یا نام کاربری..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingUsers ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-500 mt-2">در حال بارگذاری...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  کاربری یافت نشد
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <label 
                      key={user.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer ${
                        user.is_added 
                          ? 'bg-gray-100 border-gray-200 opacity-60' 
                          : 'bg-white border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        disabled={user.is_added}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">{user.full_name}</span>
                        <span className="text-sm text-gray-500 mr-2">({user.username})</span>
                      </div>
                      {user.is_added && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          اضافه شده
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 rounded-b-lg flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {selectedUsers.length} کاربر انتخاب شده
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedUsers([]);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"
                >
                  انصراف
                </button>
                <button
                  onClick={handleAddParticipants}
                  disabled={selectedUsers.length === 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                  افزودن انتخاب‌شده‌ها
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ParticipantManager;