// frontend/src/pages/VotingPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Vote, AlertCircle, CheckCircle, ArrowLeft, User } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const VotingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [elecRes, candRes, voteRes] = await Promise.all([
        api.get(`/elections/${id}`),
        api.get(`/candidates/${id}`),
        api.get(`/votes/check/${id}`)
      ]);

      setElection(elecRes.data.data);
      setCandidates(candRes.data.data || []);
      setHasVoted(voteRes.data.has_voted);
    } catch (error) {
      toast.error('خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateToggle = (candidateId) => {
    if (selectedCandidates.includes(candidateId)) {
      // اگر قبلا انتخاب شده، حذفش کن
      setSelectedCandidates(selectedCandidates.filter(id => id !== candidateId));
    } else {
      // اگر حداکثر انتخاب پر نشده، اضافه کن
      if (selectedCandidates.length < election.max_choices) {
        setSelectedCandidates([...selectedCandidates, candidateId]);
      } else {
        toast.error(`شما فقط می‌توانید ${election.max_choices} گزینه انتخاب کنید`);
      }
    }
  };

  const handleSubmitVote = async () => {
    if (selectedCandidates.length === 0) {
      toast.error('لطفاً حداقل یک نامزد را انتخاب کنید');
      return;
    }

    if (!confirm(`آیا مطمئن هستید که ${selectedCandidates.length} نامزد را انتخاب کرده‌اید؟`)) {
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/votes', {
        election_id: id,
        candidate_ids: selectedCandidates
      });
      toast.success('رای شما با موفقیت ثبت شد!');
      setHasVoted(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'خطا در ثبت رأی');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">انتخابات یافت نشد</h1>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-blue-600 hover:underline"
          >
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{election.title}</h1>
              <p className="text-sm text-gray-500">انتخاب نامزدها</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={16} />
            <span>شما {election.max_choices} انتخاب دارید</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Status Messages */}
        {hasVoted && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle size={24} className="text-green-600" />
            <div>
              <p className="font-medium text-green-800">شما قبلاً در این انتخابات شرکت کرده‌اید</p>
              <p className="text-sm text-green-600">رای شما ثبت شده است</p>
            </div>
          </div>
        )}

        {!hasVoted && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              لطفاً نامزدهای مورد نظر خود را انتخاب کنید. شما می‌توانید حداکثر{' '}
              <strong>{election.max_choices}</strong> گزینه را انتخاب کنید.
            </p>
          </div>
        )}

        {/* Candidates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => {
            const isSelected = selectedCandidates.includes(candidate.id);
            const canSelect = selectedCandidates.length < election.max_choices;

            return (
              <div
                key={candidate.id}
                onClick={() => !hasVoted && handleCandidateToggle(candidate.id)}
                className={`
                  relative p-6 rounded-lg border-2 cursor-pointer transition-all
                  ${hasVoted 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-lg hover:-translate-y-1'
                  }
                  ${isSelected 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 bg-white'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-3 left-3 bg-blue-600 text-white p-1 rounded-full">
                    <CheckCircle size={16} />
                  </div>
                )}

                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User size={32} className="text-gray-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{candidate.name}</h3>
                  <p className="text-sm text-gray-600">{candidate.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        {!hasVoted && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
              <div>
                <span className="text-gray-600">انتخاب شده: </span>
                <span className="font-bold text-blue-600">{selectedCandidates.length} / {election.max_choices}</span>
              </div>
              <button
                onClick={handleSubmitVote}
                disabled={selectedCandidates.length === 0 || submitting}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Vote size={20} />
                    ثبت رأی
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingPage;