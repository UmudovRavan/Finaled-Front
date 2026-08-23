import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getAuthToken } from '../services/api';
import TopNavbar from '../components/TopNavbar';
import altensorCrmLogo from '../assets/Altensor_CRM_Logo.svg';

const CrmProductPage = () => {
  const auth = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const isUserLoggedIn = Boolean(auth?.token || getAuthToken());
  const startDestination = isUserLoggedIn ? '/desktop' : '/login';

  const mockDeals = [
    { name: 'Caspian Tech Cloud Migration', org: 'Caspian Tech MMC', stage: 'Negotiation', stageAz: 'Danışıqlar', amount: '$42,000', prob: '85%', status: 'Active' },
    { name: 'Baku Logistics ERP Integration', org: 'Baku Steel & Logistics', stage: 'Proposal Sent', stageAz: 'Təklif Göndərildi', amount: '28,500 AZN', prob: '70%', status: 'Active' },
    { name: 'Global Trade Portal License', org: 'Global Trade Group', stage: 'Closed Won', stageAz: 'Uğurla Bağlandı', amount: '$65,000', prob: '100%', status: 'Won' },
    { name: 'Retail Network POS Analytics', org: 'Azeri Retail MMC', stage: 'Discovery', stageAz: 'İlkin Araşdırma', amount: '19,200 AZN', prob: '45%', status: 'Active' }
  ];

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col selection:bg-primary/20">
      <TopNavbar />

      <main className="flex-1 pt-28 md:pt-36 pb-20">
        {/* 1. Hero Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 pt-6 pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/10 border border-secondary/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="text-xs uppercase tracking-widest text-secondary font-bold">
                {t('crmPage.badge', {}, 'ALTENSOR CRM HƏLLİ')}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface leading-[1.15] mb-6">
              {t('crmPage.heroTitle', {}, 'Müştəri Münasibətləri və Satış Boru Kəməri')}
            </h1>

            <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed mb-8">
              {t('crmPage.heroDesc', {}, 'Müştəri namizədlərindən uğurla bağlanmış sövdələşmələrə qədər hər addımı tam nəzarətdə saxlayın. Dəqiq məlumatlar, korporativ təhlükəsizlik və şəffaf analitika.')}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to={startDestination}
                className="btn-primary px-8 py-3.5 rounded-lg text-xs uppercase tracking-widest font-semibold shadow-sm transition-all"
              >
                {t('crmPage.ctaGetStarted', {}, 'CRM-ə Başlayın')}
              </Link>
              <Link
                to="/products"
                className="btn-secondary px-8 py-3.5 rounded-lg text-xs uppercase tracking-widest font-semibold transition-all"
              >
                {t('homePage.ctaProducts', {}, 'Bütün Məhsullar')}
              </Link>
            </div>
          </div>

          {/* Key Metrics Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-14 border-t border-b py-6 border-slate-200 dark:border-white/10">
            <div className="p-4">
              <div className="text-3xl font-bold text-on-surface">$2.4M+</div>
              <div className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">
                {t('crmPage.metricsWon', {}, 'Uğurla Bağlanmış Sövdələşmələr')}
              </div>
            </div>
            <div className="p-4 border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/10">
              <div className="text-3xl font-bold text-on-surface">14 {t('common.days', {}, 'gün')}</div>
              <div className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">
                {t('crmPage.metricsCycle', {}, 'Satış Dövriyyəsi')}
              </div>
            </div>
            <div className="p-4 border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/10">
              <div className="text-3xl font-bold text-on-surface">98.4%</div>
              <div className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">
                {t('crmPage.metricsAccuracy', {}, 'Proqnoz Dəqiqliyi')}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Real Product Interface Showcase (Live CRM Pipeline Table) */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <div className="border rounded-2xl overflow-hidden bg-surface-container shadow-sm border-slate-200 dark:border-white/10">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-surface border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <img src={altensorCrmLogo} alt="CRM" className="w-5 h-5 object-contain" />
                <span className="text-sm font-bold text-on-surface tracking-wide">
                  {t('crmPage.liveTableTitle', {}, 'Aktiv Sövdələşmələr və Mərhələlər')}
                </span>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-secondary/15 text-secondary font-semibold">
                Live Ledger v2.4
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-surface/50 border-slate-200 dark:border-white/10 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    <th className="py-3.5 px-6">{t('crmPage.colDealName', {}, 'Sövdələşmə')}</th>
                    <th className="py-3.5 px-6">{t('crmPage.colOrg', {}, 'Təşkilat')}</th>
                    <th className="py-3.5 px-6">{t('crmPage.colStage', {}, 'Mərhələ')}</th>
                    <th className="py-3.5 px-6">{t('crmPage.colAmount', {}, 'Məbləğ')}</th>
                    <th className="py-3.5 px-6">{t('crmPage.colStatus', {}, 'Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  {mockDeals.map((deal, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-medium text-on-surface">{deal.name}</td>
                      <td className="py-4 px-6 text-on-surface-variant">{deal.org}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-white/5 text-on-surface">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          {deal.stage} ({deal.prob})
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-on-surface">{deal.amount}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded font-semibold ${
                            deal.status === 'Won'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-primary/15 text-primary'
                          }`}
                        >
                          {deal.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 3. Core Feature Pillars (Real Domain Architecture) */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="mb-12">
            <span className="text-xs uppercase tracking-widest text-primary font-bold block mb-2">
              {t('crmPage.featuresTitle', {}, 'Strateji Satış Alətləri')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface">
              {t('crmPage.featuresSubtitle', {}, 'Satış komandalarının sürətli və qüsursuz işləməsi üçün zəruri funksionallıq.')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-xl border bg-surface-container border-slate-200 dark:border-white/10">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary/10 text-secondary mb-5">
                <span className="material-symbols-outlined text-2xl">person_search</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">
                {t('crmPage.leadTitle', {}, 'Müştəri Namizədləri (Leads)')}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {t('crmPage.leadDesc', {}, 'Bütün kanallardan gələn müraciətləri avtomatik qeydiyyata alın və statuslandırın.')}
              </p>
            </div>

            <div className="p-8 rounded-xl border bg-surface-container border-slate-200 dark:border-white/10">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary mb-5">
                <span className="material-symbols-outlined text-2xl">view_kanban</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">
                {t('crmPage.pipelineTitle', {}, 'Vizual Satış Kəməri (Pipeline)')}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {t('crmPage.pipelineDesc', {}, 'Sövdələşmələri mərhələlər üzrə izləyin, ehtimal dərəcələrini və gəlirləri hesablayın.')}
              </p>
            </div>

            <div className="p-8 rounded-xl border bg-surface-container border-slate-200 dark:border-white/10">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-500 mb-5">
                <span className="material-symbols-outlined text-2xl">domain</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">
                {t('crmPage.accountTitle', {}, '360° Müştəri və Təşkilat Profili')}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {t('crmPage.accountDesc', {}, 'Təşkilatların bütün kontaktlarını, sənədlərini və müqavilələrini vahid yerdə toplayın.')}
              </p>
            </div>

            <div className="p-8 rounded-xl border bg-surface-container border-slate-200 dark:border-white/10">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-sky-500/10 text-sky-500 mb-5">
                <span className="material-symbols-outlined text-2xl">call_log</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">
                {t('crmPage.callLogsTitle', {}, 'Zəng Qeydiyyatı və Fəaliyyət Jurnalı')}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {t('crmPage.callLogsDesc', {}, 'Zənglər, qeydlər, görüşlər və təqvim ardıcıllığı heç bir detal itmədən saxlanılır.')}
              </p>
            </div>
          </div>
        </section>

        {/* 4. Bottom Enterprise Call to Action */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <div className="border rounded-2xl p-10 md:p-14 bg-surface text-center border-slate-200 dark:border-white/10">
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-4">
              {t('crmPage.heroTitle', {}, 'Müştəri Münasibətləri və Satış Boru Kəməri')}
            </h2>
            <p className="text-sm md:text-base text-on-surface-variant max-w-2xl mx-auto mb-8">
              {t('crmPage.heroDesc', {}, 'Müştəri namizədlərindən uğurla bağlanmış sövdələşmələrə qədər hər addımı tam nəzarətdə saxlayın.')}
            </p>
            <Link
              to={startDestination}
              className="btn-primary px-8 py-3.5 rounded-lg text-xs uppercase tracking-widest font-semibold inline-block"
            >
              {isUserLoggedIn ? t('nav.workspace', {}, 'Workspace-ə Keçid') : t('nav.getStarted', {}, 'Pulsuz Başlayın')}
            </Link>
          </div>
        </section>
      </main>

      {/* Corporate Clean Footer */}
      <footer className="border-t py-12 px-6 md:px-12 border-slate-200 dark:border-white/10 bg-surface">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-on-surface-variant">
          <div className="flex items-center gap-4">
            <span className="font-bold text-on-surface text-sm">Altensor</span>
            <span>{t('footer.tagline', {}, 'Müasir müəssisələr üçün intellektual korporativ proqram təminatı.')}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-on-surface transition-colors">{t('footer.about', {}, 'Haqqımızda')}</Link>
            <Link to="/products" className="hover:text-on-surface transition-colors">{t('footer.productsTitle', {}, 'Məhsullar')}</Link>
            <Link to="/about#privacy" className="hover:text-on-surface transition-colors">{t('footer.privacy', {}, 'Məxfilik Siyasəti')}</Link>
            <Link to="/about#terms" className="hover:text-on-surface transition-colors">{t('footer.terms', {}, 'İstifadə Şərtləri')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CrmProductPage;
