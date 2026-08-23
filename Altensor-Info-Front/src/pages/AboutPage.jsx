import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getAuthToken } from '../services/api';
import TopNavbar from '../components/TopNavbar';
import altensorLogo from '../assets/Altensor-Logo.png';

const AboutPage = () => {
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
                {t('aboutPage.badge', {}, 'ALTENSOR HAQQINDA')}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface leading-[1.15] mb-6">
              {t('aboutPage.heroTitle', {}, 'Dəqiq Məntiq və İntellektual Sistemlər')}
            </h1>

            <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed mb-8">
              {t('aboutPage.heroDesc', {}, 'Biz müasir müəssisələr üçün yüksək məhsuldarlıq, təhlükəsizlik və arxitektur təmizlik prinsipləri üzərində qurulmuş proqram təminatı yaradırıq.')}
            </p>
          </div>
        </section>

        {/* 2. Mission & Strategic Values */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-10">
          <div className="border rounded-2xl p-8 md:p-12 bg-surface-container border-slate-200 dark:border-white/10 mb-12 shadow-sm">
            <span className="text-xs uppercase tracking-widest text-secondary font-bold block mb-2">
              {t('aboutPage.missionBadge', {}, 'MİSSİYAMIZ')}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-4">
              {t('aboutPage.missionTitle', {}, 'Əməliyyat Sürtünməsini Aradan Qaldırmaq')}
            </h2>
            <p className="text-base text-on-surface-variant leading-relaxed max-w-3xl">
              {t('aboutPage.missionDesc', {}, 'Mürəkkəb korporativ prosesləri sadələşdirmək, komandaların vaxt itkisini azaltmaq və hər bir qərarı analitik məlumatlarla gücləndirmək.')}
            </p>
          </div>

          <div className="mb-8">
            <span className="text-xs uppercase tracking-widest text-primary font-bold block mb-2">
              {t('aboutPage.principlesBadge', {}, 'PRİNSİPLƏRİMİZ')}
            </span>
            <h2 className="text-3xl font-bold text-on-surface">
              {t('aboutPage.principlesTitle', {}, 'Mühəndislik Fəlsəfəmiz')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-xl border bg-surface border-slate-200 dark:border-white/10">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary mb-5 font-mono font-bold text-sm">
                01
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">
                {t('aboutPage.principle1Title', {}, 'Arxitektur Dəqiqlik')}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {t('aboutPage.principle1Desc', {}, 'Lazımsız vizual elementlər olmadan, sürətli və deterministik icra.')}
              </p>
            </div>

            <div className="p-8 rounded-xl border bg-surface border-slate-200 dark:border-white/10">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary/10 text-secondary mb-5 font-mono font-bold text-sm">
                02
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">
                {t('aboutPage.principle2Title', {}, 'Korporativ Təhlükəsizlik')}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {t('aboutPage.principle2Desc', {}, 'Məlumatların uçdan-uca qorunması, rol əsaslı icazələr və audit nəzarəti.')}
              </p>
            </div>

            <div className="p-8 rounded-xl border bg-surface border-slate-200 dark:border-white/10">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-500 mb-5 font-mono font-bold text-sm">
                03
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">
                {t('aboutPage.principle3Title', {}, 'Vahid İş Sahəsi')}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {t('aboutPage.principle3Desc', {}, 'Bütün modulların vahid mərkəzdən problemsiz idarə edilməsi.')}
              </p>
            </div>
          </div>
        </section>

        {/* 3. Security, Privacy & Terms Anchor Section */}
        <section id="privacy" className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <div id="terms" className="border rounded-2xl p-8 md:p-12 bg-surface-container border-slate-200 dark:border-white/10">
            <div className="max-w-3xl">
              <span className="text-xs uppercase tracking-widest text-primary font-bold block mb-2">
                {t('footer.legalTitle', {}, 'Hüquqi')}
              </span>
              <h2 className="text-2xl font-bold text-on-surface mb-4">
                {t('aboutPage.legalTitle', {}, 'Hüquqi və Təhlükəsizlik Standartları')}
              </h2>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                {t('aboutPage.legalDesc', {}, 'Məlumatların məxfiliyi və korporativ standartlara tam uyğunluq təmin edilir.')}
              </p>

              <div className="space-y-4 text-xs text-on-surface-variant border-t border-slate-200 dark:border-white/10 pt-6">
                <div>
                  <h4 className="font-bold text-on-surface mb-1">
                    {t('footer.privacy', {}, 'Məxfilik Siyasəti')} (Privacy Policy)
                  </h4>
                  <p>
                    Altensor sistemində toplanan bütün müştəri və layihə məlumatları 256-bit SSL şifrələnmə ilə qorunur və üçüncü tərəflərə ötürülmür.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">
                    {t('footer.terms', {}, 'İstifadə Şərtləri')} (Terms of Service)
                  </h4>
                  <p>
                    Platforma xidmətlərindən istifadə zamanı korporativ hesab sahibləri öz daxili icazələrini və istifadəçi hüquqlarını müstəqil şəkildə idarə edir.
                  </p>
                </div>
              </div>
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
            <a href="#privacy" className="hover:text-on-surface transition-colors">{t('footer.privacy', {}, 'Məxfilik Siyasəti')}</a>
            <a href="#terms" className="hover:text-on-surface transition-colors">{t('footer.terms', {}, 'İstifadə Şərtləri')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
