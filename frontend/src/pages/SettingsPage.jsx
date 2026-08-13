import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Select } from '../components/shared/Select';
import { settingsApi } from '../api/settingsApi';
import { useTranslation } from 'react-i18next';
import { Settings, Save, CheckCircle } from 'lucide-react';

export const SettingsPage = () => {
  const { t } = useTranslation();
  const [org, setOrg] = useState({
    name: 'Rift Valley Farmers Cooperative Society (FPO)',
    region: 'Kenya Central Rift',
    currency: 'KES',
    settings: {
      safetyStockFormula: 'SERVICE_LEVEL_VARIANCE',
      defaultTargetServiceLevel: 0.95,
      autoReorderAlerts: true,
      aiModel: 'gemini-2.5-flash'
    }
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    settingsApi.getSettings()
      .then(res => {
        if (res.organisation) setOrg(res.organisation);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await settingsApi.updateSettings({
        name: org.name,
        region: org.region,
        currency: org.currency,
        settings: org.settings
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save settings');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title={t('settings.title')}
        description={t('settings.description')}
      />

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{t('common.success')}!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-card p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider">{t('nav.administration')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Organisation Name" value={org.name} onChange={e => setOrg({...org, name: e.target.value})} />
            <Input label="Agricultural Region" value={org.region} onChange={e => setOrg({...org, region: e.target.value})} />
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider">{t('replenishment.title')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Safety Stock Formula"
              value={org.settings?.safetyStockFormula || 'SERVICE_LEVEL_VARIANCE'}
              onChange={e => setOrg({...org, settings: {...org.settings, safetyStockFormula: e.target.value}})}
              options={[
                { label: 'Service Level Variance Formula', value: 'SERVICE_LEVEL_VARIANCE' },
                { label: 'Static Days-of-Supply Buffer', value: 'STATIC_DAYS' }
              ]}
            />
            <Select
              label={t('replenishment.targetServiceLevel')}
              value={String(org.settings?.defaultTargetServiceLevel || 0.95)}
              onChange={e => setOrg({...org, settings: {...org.settings, defaultTargetServiceLevel: Number(e.target.value)}})}
              options={[
                { label: '99% Service Level (Z=2.33)', value: '0.99' },
                { label: '95% Service Level (Z=1.65)', value: '0.95' },
                { label: '90% Service Level (Z=1.28)', value: '0.90' }
              ]}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="submit" variant="primary">
            <Save className="w-4 h-4 mr-1" />
            {t('settings.saveSettings')}
          </Button>
        </div>
      </form>
    </div>
  );
};
