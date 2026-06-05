// frontend/src/pages/Admin/ElectionDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Vote, 
  Megaphone, 
  Edit,
  Calendar,
  Clock,
  Settings,
  Trash2 // اضافه کردن Trash2
} from 'lucide-react';
import api from '../../services/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const ElectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('candidates');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. دریافت اطلاعات اصلی انتخابات
      const elecRes = await api.get(`/elections/${id}`);
      setElection(elecRes.data.data);

      // 2. دریافت نامزدها
      try {
        const candRes = await api.get(`/candidates/${id}`);
        setCandidates(candRes.data.data || []);
      } catch (err) {
        console.error('Error fetching candidates:', err);
        setCandidates([]);
      }

      // 3. دریافت شرکت‌کنندگان
      try {
        const partRes = await api.get(`/participants/election/${id}`);
        setParticipants(partRes.data.data || []);
      } catch (err) {
        console.error('Error fetching participants:', err);
        setParticipants([]);
      }

    } catch (error) {
      console.error('Main error:', error);
      toast.error('خطا در دریافت اطلاعات انتخابات');
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

  if (!election) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">انتخابات یافت نشد</p>
          <Link to="/admin/elections" className="text-blue-600 hover:underline mt-4 inline-block">
            بازگشت به لیست
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const tabs = [
    { id: 'candidates', label: 'نامزدها', icon: Vote },
    { id: 'participants', label: 'شرکت‌کنندگان', icon: Users },
    { id: 'announcements', label: 'اعلانات', icon: Megaphone },
    { id: 'results', label: 'نتایج', icon: Settings },
  ];

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
            <h1 className="text-3xl font-bold text-gray-800">{election.title}</h1>
            <p className="text-gray-600 mt-2">{election.description || 'بدون توضیحات'}</p>
          </div>
          <Link
            to={`/admin/elections/${id}/edit`}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
          >
            <Edit size={20} />
            ویرایش
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Calendar size={18} />
              <span className="text-sm">زمان شروع</span>
            </div>
            <p className="font-medium">
              {new Date(election.start_time).toLocaleString('fa-IR')}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Clock size={18} />
              <span className="text-sm">زمان پایان</span>
            </div>
            <p className="font-medium">
              {new Date(election.end_time).toLocaleString('fa-IR')}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Vote size={18} />
              <span className="text-sm">حداکثر انتخاب</span>
            </div>
            <p className="font-medium">{election.max_choices} گزینه</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 flex items-center gap-2 border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'candidates' && (
            <CandidatesTab 
              candidates={candidates} 
              electionId={id} 
              onRefresh={fetchData} 
            />
          )}
          {activeTab === 'participants' && (
            <ParticipantsTab 
              participants={participants} 
              electionId={id} 
              onRefresh={fetchData} 
            />
          )}
          {activeTab === 'announcements' && (
            <div className="text-center py-8 text-gray-500">
              مدیریت اعلانات مرتبط با این انتخابات
            </div>
          )}
          {activeTab === 'results' && (
            <div className="text-center py-8 text-gray-500">
              مشاهده نتایج انتخابات
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

// Sub-component: Candidates Tab
const CandidatesTab = ({ candidates, electionId, onRefresh }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: '', description: '' });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/candidates', {
        election_id: electionId,
        ...newCandidate
      });
      toast.success('نامزد اضافه شد');
      setShowCreate(false);
      setNewCandidate({ name: '', description: '' });
      onRefresh();
    } catch (error) {
      toast.error('خطا در اضافه کردن');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await api.delete(`/candidates/${id}`);
      toast.success('نامزد حذف شد');
      onRefresh();
    } catch (error) {
      toast.error('خطا در حذف');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">لیست نامزدها</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          افزودن نامزد
        </button>
      </div>

      {showCreate && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              placeholder="نام نامزد"
              value={newCandidate.name}
              onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <textarea
              placeholder="توضیحات"
              value={newCandidate.description}
              onChange={(e) => setNewCandidate({...newCandidate, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              rows="2"
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg">
                ذخیره
              </button>
              <button 
                type="button" 
                onClick={() => setShowCreate(false)}
                className="bg-gray-300 px-4 py-2 rounded-lg"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {candidates.length === 0 ? (
          <p className="text-gray-500 text-center py-4">هیچ نامزدی اضافه نشده است</p>
        ) : (
          candidates.map((candidate) => (
            <div key={candidate.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-bold">{candidate.name}</h3>
                <p className="text-sm text-gray-500">{candidate.description}</p>
              </div>
              <button
                onClick={() => handleDelete(candidate.id)}
                className="text-red-600 hover:bg-red-50 p-2 rounded"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Sub-component: Participants Tab
const ParticipantsTab = ({ participants, electionId, onRefresh }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get(`/participants/users?election_id=${electionId}`);
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
        election_id: electionId,
        user_ids: selectedUsers
      });
      toast.success(`${selectedUsers.length} کاربر اضافه شد`);
      setShowAdd(false);
      setSelectedUsers([]);
      onRefresh();
    } catch (error) {
      toast.error('خطا در اضافه کردن');
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await api.delete(`/participants/${electionId}/${userId}`);
      toast.success('کاربر حذف شد');
      onRefresh();
    } catch (error) {
      toast.error('خطا در حذف');
    }
  };

  if (showAdd && !loadingUsers) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">افزودن شرکت‌کنندگان</h2>
          <button
            onClick={() => setShowAdd(false)}
            className="text-gray-600 hover:text-gray-800"
          >
            بستن
          </button>
        </div>

        <div className="mb-4">
          <button
            onClick={fetchUsers}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            بارگذاری کاربران
          </button>
        </div>

        {allUsers.length > 0 ? (
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {allUsers.map((user) => (
              <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
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
                />
                <span>{user.full_name} ({user.username})</span>
                {user.is_added && <span className="text-xs text-green-600">(اضافه شده)</span>}
              </label>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">برای دیدن لیست کاربران دکمه "بارگذاری" را بزنید</p>
        )}

        <button
          onClick={handleAddParticipants}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          افزودن انتخاب‌شده‌ها
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">لیست شرکت‌کنندگان ({participants.length})</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          افزودن شرکت‌کننده
        </button>
      </div>

      {participants.length === 0 ? (
        <p className="text-gray-500 text-center py-4">هنوز شرکت‌کننده‌ای اضافه نشده است</p>
      ) : (
        <div className="grid gap-2">
          {participants.map((p) => (
            <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium">{p.full_name}</span>
                <span className="text-sm text-gray-500 mr-2">({p.username})</span>
              </div>
              <button
                onClick={() => handleRemove(p.user_id)}
                className="text-red-600 hover:bg-red-50 p-2 rounded"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ElectionDetail;