import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/shared/Button';
import { useTranslation } from 'react-i18next';

export const ForbiddenPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 mb-4">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">403 - Access Denied</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
        Your assigned role does not have permission to access this operation or page.
      </p>
      <div className="mt-6">
        <Link to="/dashboard">
          <Button variant="primary" size="md">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('nav.backToHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
};
