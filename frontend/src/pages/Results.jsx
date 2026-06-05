// frontend/src/pages/Results.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, Users, Award, Trophy } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Results = () => {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [results, setResults] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      const res = await api.get(`/votes/results/${id}`);
      const data = res.data.data;
      
      setElection(data.election);
      setResults(data.candidates || []);
      setTotalVotes(data.total_votes || 0);
    } catch (error) {
      toast.error('خطا در دریافت نتایج');
    } finally {
      setLoading(false);
    }
  };

  // پیدا کردن بیشترین رأی برای هایلایت کردن برنده
  const maxVotes = results.length > 0 ? Math.max(...results.map(r => parseInt(r.votes_count))) : 0;

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
          <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">نتایجی موجود نیست</h1>
          <Link to="/" className="mt-4 text-blue-600 hover:underline inline-block">
            بازگشت به صفحه اصلی
          </Link>
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
            <Link
              to="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{election.title}</h1>
              <p className="text-sm text-gray-500">نتایج نهایی</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            <Users size={16} />
            <span>{totalVotes} رأی</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Winner Announcement */}
        {results.length > 0 && maxVotes > 0 && (
          <div className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Trophy size={32} className="text-yellow-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">برنده انتخابات</h2>
            <p className="text-xl text-yellow-800 font-bold">
              {results.find(r => parseInt(r.votes_count) === maxVotes)?.name || '-'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              با {maxVotes} رأی ({((maxVotes / totalVotes) * 100).toFixed(1)}%)
            </p>
          </div>
        )}

        {/* Results List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={24} className="text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">جزئیات نتایج</h2>
          </div>

          <div className="space-y-4">
            {results.map((candidate, index) => {
              const votes = parseInt(candidate.votes_count);
              const percentage = parseFloat(candidate.percentage);
              const isWinner = votes === maxVotes && maxVotes > 0;
              const rank = index + 1;

              return (
                <div 
                  key={candidate.id} 
                  className={`p-4 rounded-lg border transition ${
                    isWinner ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                        rank === 2 ? 'bg-gray-200 text-gray-700' :
                        rank === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {rank}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                          {candidate.name}
                          {isWinner && <Award size={16} className="text-yellow-600" />}
                        </h3>
                        <p className="text-sm text-gray-500">{candidate.description}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-gray-800">{votes}</p>
                      <p className="text-sm text-gray-500">رأی</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isWinner ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>{percentage}%</span>
                    <span>{totalVotes} رأی کل</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>این نتایج بر اساس آرای ثبت شده تا زمان پایان انتخابات محاسبه شده است.</p>
        </div>
      </div>
    </div>
  );
};

export default Results;