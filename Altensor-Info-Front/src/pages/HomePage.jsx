import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getAuthToken } from '../services/api';
import TopNavbar from '../components/TopNavbar';
import altensorLogo from '../assets/Altensor-Logo.png';
import taskManagementLogo from '../assets/Task-Management-Logo.svg';
import altensorCrmLogo from '../assets/Altensor_CRM_Logo.svg';

const HomePage = () => {
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
        <section className="max-w-7xl mx-auto px-6 md:px-12 pt-6 pb-16 flex flex-col lg:grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 mb-6 w-fit">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-xs uppercase tracking-widest text-primary font-bold">
                {t('homePage.badge', {}, 'NÖVBƏTİ NƏSİL KORPORATİV HƏLLƏR')}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface leading-[1.15] mb-6">
              {t('homePage.heroTitle1', {}, 'Süni İntellekt Dəstəkli')} <br className="hidden sm:block" />
              <span className="gradient-text">{t('homePage.heroTitle2', {}, 'Texnoloji Biznes Həlləri')}</span>
            </h1>

            <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed mb-8 max-w-2xl">
              {t('homePage.heroDesc', {}, 'İş axınınızı və müştəri münasibətlərinizi müasir müəssisələr üçün hazırlanmış ağıllı, estetik alətlərlə idarə edin. Dəqiq məntiq və orqanik dizaynın mükəmməl vəhdətini kəşf edin.')}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to={startDestination}
                className="btn-primary px-8 py-3.5 rounded-lg text-xs uppercase tracking-widest font-semibold shadow-sm transition-all"
              >
                {isUserLoggedIn ? t('nav.workspace', {}, 'Workspace-ə Keçid') : t('homePage.ctaFree', {}, 'Pulsuz Başlayın')}
              </Link>
              <Link
                to="/products"
                className="btn-secondary px-8 py-3.5 rounded-lg text-xs uppercase tracking-widest font-semibold transition-all"
              >
                {t('homePage.ctaProducts', {}, 'Məhsulları Kəşf Edin')}
              </Link>
            </div>
          </div>

          {/* Right Column: Restored Hero UI Dashboard Preview Image */}
          <div className="lg:col-span-5 w-full max-w-xl mx-auto relative group">
            <div className="border rounded-2xl p-3 bg-surface-container border-slate-200 dark:border-white/10 shadow-lg overflow-hidden">
              <div className="relative rounded-xl overflow-hidden border border-slate-200/50 dark:border-white/10 bg-surface">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgJ_BLLOEYvsejUAs8Iz1lOeVghrhSSth9lX_JRaRX-05aHVukmqWHixj7ynXIdLiEWg9mh8o3YjDJ4aTCqqQL8syrjLB2xTfvie8er6Q05h-5rCqL7IWewF3cBmM1zh0dNKnMk2HmQlpvndZSKQaBkBnid0UxUzQ-vaRFWrpAxjkxRYqz3NhbAlLKKxDMgtQiPdx6Mc9Bl2_D9sUPUOXzcz7Zqd1TX6dopTt_S7MOjZw8P3pHL9Pd2A"
                  alt="Altensor UI Dashboard Preview"
                  className="w-full h-auto object-cover rounded-xl opacity-95 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="px-3 py-1 bg-surface-container/90 backdrop-blur-md rounded-md border border-primary/20 text-[11px] text-primary uppercase font-bold shadow-sm">
                    {t('homePage.livePreview', {}, 'Canlı UI Baxışı')}
                  </span>
                  <span className="text-[11px] text-on-surface-variant bg-surface-container/90 backdrop-blur-md px-3 py-1 rounded-md border border-slate-200/30 shadow-sm font-mono">
                    Altensor Workspace v2.4
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Core Products Showcase (Altensor CRM & Task Management) */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <div className="mb-10">
            <span className="text-xs uppercase tracking-widest text-primary font-bold block mb-2">
              {t('homePage.coreProductsTitle', {}, 'Əsas Məhsullarımız')}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface">
              {t('homePage.coreProductsDesc', {}, 'Həm satış, həm də layihə icrası üçün hazırlanmış ixtisaslaşdırılmış sistemlər.')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CRM Product Card */}
            <div className="border rounded-2xl p-8 bg-surface-container border-slate-200 dark:border-white/10 flex flex-col justify-between shadow-sm">
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
                  {t('homePage.crmCardTitle', {}, 'Altensor CRM')}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  {t('homePage.crmCardDesc', {}, 'Müştəri namizədləri, sövdələşmə kəməri, 360 dərəcə kontakt bazası və satış analitikası.')}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <Link
                  to="/crm"
                  className="btn-primary px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider font-semibold"
                >
                  {t('homePage.viewDetails', {}, 'Ətraflı Bax')}
                </Link>
                <Link
                  to={startDestination}
                  className="btn-secondary px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider font-semibold"
                >
                  {t('nav.workspace', {}, 'Workspace')}
                </Link>
              </div>
            </div>

            {/* Task Management Product Card */}
            <div className="border rounded-2xl p-8 bg-surface-container border-slate-200 dark:border-white/10 flex flex-col justify-between shadow-sm">
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
                  {t('homePage.taskCardTitle', {}, 'Altensor Task Management')}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  {t('homePage.taskCardDesc', {}, 'Kanban lövhələri, sprint planlaşdırması, komanda iş yükü və tapşırıq statusları.')}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <Link
                  to="/tasks"
                  className="btn-primary px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider font-semibold"
                >
                  {t('homePage.viewDetails', {}, 'Ətraflı Bax')}
                </Link>
                <Link
                  to={startDestination}
                  className="btn-secondary px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider font-semibold"
                >
                  {t('nav.workspace', {}, 'Workspace')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Operational Synergy Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="border rounded-2xl p-8 md:p-12 bg-surface border-slate-200 dark:border-white/10">
            <div className="max-w-2xl mb-8">
              <span className="text-xs uppercase tracking-widest text-primary font-bold block mb-2">
                {t('productsPage.badge', {}, 'ALTENSOR EKOSİSTEMİ')}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-3">
                {t('homePage.workspacePreview', {}, 'Altensor İş Sahəsi')}
              </h2>
              <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
                {t('homePage.workspaceSubtitle', {}, 'Bir-biri ilə tam inteqrasiya olunmuş korporativ modullar')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200 dark:border-white/10 text-xs">
              <div className="p-4 rounded-lg bg-surface-container border border-slate-200 dark:border-white/10">
                <div className="font-bold text-on-surface text-sm mb-1">
                  {t('aboutPage.principle1Title', {}, 'Arxitektur Dəqiqlik')}
                </div>
                <p className="text-on-surface-variant">
                  {t('aboutPage.principle1Desc', {}, 'Lazımsız vizual elementlər olmadan, sürətli və deterministik icra.')}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-surface-container border border-slate-200 dark:border-white/10">
                <div className="font-bold text-on-surface text-sm mb-1">
                  {t('aboutPage.principle2Title', {}, 'Korporativ Təhlükəsizlik')}
                </div>
                <p className="text-on-surface-variant">
                  {t('aboutPage.principle2Desc', {}, 'Məlumatların uçdan-uca qorunması, rol əsaslı icazələr və audit nəzarəti.')}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-surface-container border border-slate-200 dark:border-white/10">
                <div className="font-bold text-on-surface text-sm mb-1">
                  {t('aboutPage.principle3Title', {}, 'Vahid İş Sahəsi')}
                </div>
                <p className="text-on-surface-variant">
                  {t('aboutPage.principle3Desc', {}, 'Bütün modulların vahid mərkəzdən problemsiz idarə edilməsi.')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Bottom CTA */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <div className="border rounded-2xl p-10 md:p-14 bg-surface-container text-center border-slate-200 dark:border-white/10 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-4">
              {t('homePage.heroTitle1', {}, 'Süni İntellekt Dəstəkli')} {t('homePage.heroTitle2', {}, 'Texnoloji Biznes Həlləri')}
            </h2>
            <p className="text-sm md:text-base text-on-surface-variant max-w-2xl mx-auto mb-8 leading-relaxed">
              {t('homePage.heroDesc', {}, 'İş axınınızı və müştəri münasibətlərinizi müasir müəssisələr üçün hazırlanmış ağıllı, estetik alətlərlə idarə edin.')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to={startDestination}
                className="btn-primary px-8 py-3.5 rounded-lg text-xs uppercase tracking-widest font-semibold"
              >
                {isUserLoggedIn ? t('nav.workspace', {}, 'Workspace-ə Keçid') : t('homePage.ctaFree', {}, 'Pulsuz Başlayın')}
              </Link>
              <Link
                to="/products"
                className="btn-secondary px-8 py-3.5 rounded-lg text-xs uppercase tracking-widest font-semibold"
              >
                {t('homePage.ctaProducts', {}, 'Məhsulları Kəşf Edin')}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 px-6 md:px-12 border-slate-200 dark:border-white/10 bg-surface">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-on-surface-variant">
          <div className="flex items-center gap-4">
            <img src={altensorLogo} alt="Altensor Logo" className="h-6 w-auto object-contain" />
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

export default HomePage;
