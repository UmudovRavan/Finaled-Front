import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getAuthToken } from '../services/api';
import TopNavbar from '../components/TopNavbar';
import taskManagementLogo from '../assets/Task-Management-Logo.svg';
import altensorCrmLogo from '../assets/Altensor_CRM_Logo.svg';

const ProductsOverviewPage = () => {
  const auth = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const isUserLoggedIn = Boolean(auth?.token || getAuthToken());
  const startDestination = isUserLoggedIn ? '/desktop' : '/login';

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col selection:bg-primary/20">
      <TopNavbar />

      <main className="flex-1 pt-28 md:pt-36 pb-20">
        {/* 1. Hero Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 pt-6 pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-xs uppercase tracking-widest text-primary font-bold">
                {t('productsPage.badge', {}, 'ALTENSOR EKOSİSTEMİ')}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface leading-[1.15] mb-6">
              {t('productsPage.heroTitle', {}, 'Bir-birini Tamamlayan Korporativ Məhsullar')}
            </h1>

            <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed mb-8">
              {t('productsPage.heroDesc', {}, 'CRM və Task Management modulları birgə işləyərək satışdan layihənin icrasına qədər qüsursuz məlumat körpüsü yaradır.')}
            </p>
          </div>
        </section>

        {/* 2. Flagship Products Showcase Grid */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Altensor CRM Product Card */}
            <div className="border rounded-2xl p-8 md:p-10 bg-surface-container border-slate-200 dark:border-white/10 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center p-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <img src={altensorCrmLogo} alt="CRM" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-secondary/15 text-secondary font-bold">
                    v2.4 Live
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-on-surface mb-3">
                  {t('productsPage.crmSectionTitle', {}, 'Altensor CRM')}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  {t('crmPage.heroDesc', {}, 'Müştəri namizədlərindən uğurla bağlanmış sövdələşmələrə qədər hər addımı tam nəzarətdə saxlayın.')}
                </p>

                <ul className="space-y-3 text-xs text-on-surface-variant border-t border-slate-200 dark:border-white/10 pt-6 mb-8">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span>{t('crmPage.leadTitle', {}, 'Müştəri Namizədləri & İxtisaslaşdırma')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span>{t('crmPage.pipelineTitle', {}, 'Vizual Satış Kəməri')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span>{t('crmPage.accountTitle', {}, '360° Müştəri və Təşkilat Profili')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span>{t('crmPage.callLogsTitle', {}, 'Zəng Qeydiyyatı və Fəaliyyət Jurnalı')}</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/crm"
                  className="btn-primary px-6 py-3 rounded-lg text-xs uppercase tracking-wider font-semibold"
                >
                  {t('productsPage.openCrm', {}, 'CRM Səhifəsinə Keç')}
                </Link>
                <Link
                  to={startDestination}
                  className="btn-secondary px-5 py-3 rounded-lg text-xs uppercase tracking-wider font-semibold"
                >
                  {t('nav.workspace', {}, 'Workspace')}
                </Link>
              </div>
            </div>

            {/* Task Management Product Card */}
            <div className="border rounded-2xl p-8 md:p-10 bg-surface-container border-slate-200 dark:border-white/10 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center p-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <img src={taskManagementLogo} alt="Tasks" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-primary/15 text-primary font-bold">
                    v2.4 Live
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-on-surface mb-3">
                  {t('productsPage.taskSectionTitle', {}, 'Altensor Task Management')}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  {t('taskPage.heroDesc', {}, 'Mürəkkəb layihələri aydın mərhələlərə bölün, tapşırıqları dəqiq vaxt çərçivəsində icra edin.')}
                </p>

                <ul className="space-y-3 text-xs text-on-surface-variant border-t border-slate-200 dark:border-white/10 pt-6 mb-8">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span>{t('taskPage.kanbanTitle', {}, 'Kanban və Çevik Statuslar')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span>{t('taskPage.sprintTitle', {}, 'Sprint və Backlog İdarəetməsi')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span>{t('taskPage.workloadTitle', {}, 'Komanda Resurs Bölgüsü')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span>{t('taskPage.discussionTitle', {}, 'Daxili Qeydlər və Əməkdaşlıq')}</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/tasks"
                  className="btn-primary px-6 py-3 rounded-lg text-xs uppercase tracking-wider font-semibold"
                >
                  {t('productsPage.openTasks', {}, 'Task Management Səhifəsinə Keç')}
                </Link>
                <Link
                  to={startDestination}
                  className="btn-secondary px-5 py-3 rounded-lg text-xs uppercase tracking-wider font-semibold"
                >
                  {t('nav.workspace', {}, 'Workspace')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Synergy Section (Deal-to-Project Bridge) */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="border rounded-2xl p-8 md:p-12 bg-surface border-slate-200 dark:border-white/10">
            <div className="max-w-2xl mb-8">
              <span className="text-xs uppercase tracking-widest text-primary font-bold block mb-2">
                {t('productsPage.badge', {}, 'ALTENSOR EKOSİSTEMİ')}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-3">
                {t('productsPage.synergyTitle', {}, 'Vahid Ekosistem Gücü')}
              </h2>
              <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
                {t('productsPage.synergyDesc', {}, 'Sövdələşmə uğurla bağlandığı an avtomatik layihə tapşırığına çevrilir və icraçı komandaya ötürülür.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200 dark:border-white/10 text-xs">
              <div className="p-4 rounded-lg bg-surface-container border border-slate-200 dark:border-white/10">
                <div className="font-bold text-on-surface text-sm mb-1">
                  {t('productsPage.synergyStep1Title', {}, '1. CRM Sövdələşməsi')}
                </div>
                <p className="text-on-surface-variant">
                  {t('productsPage.synergyStep1Desc', {}, 'Satış komandası müqaviləni "Uğurla Bağlandı" olaraq qeyd edir.')}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-surface-container border border-slate-200 dark:border-white/10">
                <div className="font-bold text-on-surface text-sm mb-1">
                  {t('productsPage.synergyStep2Title', {}, '2. Avtomatlaşdırılmış Körpü')}
                </div>
                <p className="text-on-surface-variant">
                  {t('productsPage.synergyStep2Desc', {}, 'Bütün müqavilə şərtləri və icra müddətləri Task Management-ə sinxronizasiya olunur.')}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-surface-container border border-slate-200 dark:border-white/10">
                <div className="font-bold text-on-surface text-sm mb-1">
                  {t('productsPage.synergyStep3Title', {}, '3. Sprint & İcra')}
                </div>
                <p className="text-on-surface-variant">
                  {t('productsPage.synergyStep3Desc', {}, 'Mühəndislik və icra komandası Kanban lövhəsində dərhal işə başlayır.')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
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

export default ProductsOverviewPage;
