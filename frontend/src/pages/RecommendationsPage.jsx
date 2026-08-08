import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { aiApi } from '../api/aiApi';
import { Sparkles, Check, X, Edit, ShieldAlert, Cpu, Layers } from 'lucide-react';

export const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState(null);
  const [actionType, setActionType] = useState(''); // 'Approve', 'Reject', 'Override'
  const [overrideReason, setOverrideReason] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await aiApi.getRecommendations();
      setRecommendations(res.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerAnalysis = async () => {
    setLoading(true);
    try {
      await aiApi.triggerAnalysis();
      loadData();
    } catch (err) {
      alert(err.message || 'Analysis failed');
      setLoading(false);
    }
  };

  const openDecisionModal = (rec, action) => {
    setSelectedRec(rec);
    setActionType(action);
    setOverrideReason('');
    setIsModalOpen(true);
  };

  const submitDecision = async (e) => {
    e.preventDefault();
    if ((actionType === 'Override' || actionType === 'Reject') && !overrideReason.trim()) {
      alert('Mandatory override/decision reason must be provided.');
      return;
    }

    try {
      await aiApi.decideRecommendation(selectedRec._id, {
        action: actionType,
        overrideReason: overrideReason || 'Approved by authorised user'
      });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to submit decision');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Decision Support & Recommendations"
        description="Review AI-generated procurement, transfer, and safety stock recommendations. Authorised humans retain final decision control."
        actions={
          <Button variant="primary" size="sm" onClick={handleTriggerAnalysis} isLoading={loading}>
            <Sparkles className="w-4 h-4 mr-1" />
            Run Batch AI Analysis
          </Button>
        }
      />

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Executing AI decision support analysis...</div>
        ) : recommendations.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-500">
            No active AI recommendations. Click "Run Batch AI Analysis" to evaluate current telemetry.
          </div>
        ) : (
          recommendations.map(rec => (
            <div key={rec._id} className="glass-card p-6 flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    {rec.recommendationType}
                  </span>
                  <StatusBadge status={rec.status} />
                  <span className="text-xs text-slate-400 font-semibold">
                    Confidence: {Math.round((rec.confidenceScore || 0.9) * 100)}%
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{rec.title}</h3>
                
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Recommended Action: {rec.recommendedAction}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <span className="font-bold text-slate-900 dark:text-slate-100">AI Explanation: </span>
                  {rec.conciseExplanation}
                </p>

                {rec.evidence && (
                  <div className="flex flex-wrap gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span>On-Hand Stock: <strong>{rec.evidence.currentStock}</strong></span>
                    <span>Forecast Demand: <strong>{rec.evidence.forecastDemand}</strong></span>
                    <span>Lead Time: <strong>{rec.evidence.leadTimeDays} days</strong></span>
                    <span>Financial Impact: <strong>KES {(rec.evidence.cashFlowImpact || 0).toLocaleString()}</strong></span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {rec.status === 'Pending Review' && (
                <div className="flex flex-row md:flex-col gap-2 justify-center shrink-0 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 pt-4 md:pt-0 md:pl-6">
                  <Button variant="primary" size="sm" onClick={() => openDecisionModal(rec, 'Approve')}>
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openDecisionModal(rec, 'Override')}>
                    <Edit className="w-4 h-4 mr-1" />
                    Override
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => openDecisionModal(rec, 'Reject')}>
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Decision / Override Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Confirm ${actionType} Decision`}>
        <form onSubmit={submitDecision} className="space-y-4">
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
            <strong>Target Recommendation:</strong> {selectedRec?.title}
          </div>

          {(actionType === 'Override' || actionType === 'Reject') && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              ⚠️ MANDATORY REQUIREMENT: Provide detailed business justification for overriding/rejecting AI decision support.
            </div>
          )}

          <Input
            label="Decision / Override Reason"
            required={actionType === 'Override' || actionType === 'Reject'}
            placeholder="State business rationale (e.g. Contract re-negotiation in progress, alternative warehouse buffer available)"
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant={actionType === 'Reject' ? 'danger' : 'primary'}>
              Submit {actionType} Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
