import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getAuthToken } from '../services/api';
import TopNavbar from '../components/TopNavbar';
import taskManagementLogo from '../assets/Task-Management-Logo.svg';

const TaskProductPage = () => {
  const auth = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const isUserLoggedIn = Boolean(auth?.token || getAuthToken());
  const startDestination = isUserLoggedIn ? '/desktop' : '/login';

  const sampleColumns = [
    {
      id: 'todo',
      title: t('taskPage.colTodo', {}, 'Görüləcək'),
      color: 'border-slate-300 dark:border-white/20',
      tasks: [
        { id: 'TSK-104', title: 'API Gateway v2.4 Architecture Review', priority: 'High', priorityAz: 'Yüksək', assignee: 'R.U.', date: 'Today' },
        { id: 'TSK-108', title: 'Telemetry Metrics Ingestion Buffer', priority: 'Medium', priorityAz: 'Orta', assignee: 'E.A.', date: '+2 Days' }
      ]
    },
    {
      id: 'inProgress',
      title: t('taskPage.colInProgress', {}, 'İcrada'),
      color: 'border-primary',
      tasks: [
        { id: 'TSK-092', title: 'RBAC Enterprise Permission Sync Engine', priority: 'Urgent', priorityAz: 'Təcili', assignee: 'M.K.', date: 'In Review' },
        { id: 'TSK-099', title: 'Kanban Column Realtime SignalR Bridge', priority: 'High', priorityAz: 'Yüksək', assignee: 'R.U.', date: 'Today' }
      ]
    },
    {
      id: 'done',
      title: t('taskPage.colDone', {}, 'Tamamlandı'),
      color: 'border-emerald-500',
      tasks: [
        { id: 'TSK-084', title: 'PostgreSQL Connection Pooling Optimization', priority: 'High', priorityAz: 'Yüksək', assignee: 'A.N.', date: 'Yesterday' },
        { id: 'TSK-087', title: 'Multi-Language i18n Dictionary Expansion', priority: 'Medium', priorityAz: 'Orta', assignee: 'T.M.', date: 'Completed' }
      ]
    }
  ];

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
                {t('taskPage.badge', {}, 'ALTENSOR TASK MANAGEMENT')}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface leading-[1.15] mb-6">
              {t('taskPage.heroTitle', {}, 'Komanda Məhsuldarlığı və Çevik Layihə İdarəetməsi')}
            </h1>

            <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed mb-8">
              {t('taskPage.heroDesc', {}, 'Mürəkkəb layihələri aydın mərhələlərə bölün, tapşırıqları dəqiq vaxt çərçivəsində icra edin və komandanın iş yükünü balanslaşdırın.')}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to={startDestination}
                className="btn-primary px-8 py-3.5 rounded-lg text-xs uppercase tracking-widest font-semibold shadow-sm transition-all"
              >
                {t('taskPage.ctaGetStarted', {}, 'Tapşırıqlara Başlayın')}
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
              <div className="text-3xl font-bold text-on-surface">1,840+</div>
              <div className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">
                {t('taskPage.metricsTasks', {}, 'Aktiv Tapşırıqlar')}
              </div>
            </div>
            <div className="p-4 border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/10">
              <div className="text-3xl font-bold text-on-surface">99.2%</div>
              <div className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">
                {t('taskPage.metricsOnTime', {}, 'Vaxtında İcra Göstəricisi')}
              </div>
            </div>
            <div className="p-4 border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/10">
              <div className="text-3xl font-bold text-on-surface">+34%</div>
              <div className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">
                {t('taskPage.metricsEfficiency', {}, 'Komanda Məhsuldarlığı')}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Interactive Kanban Board Preview */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <div className="border rounded-2xl overflow-hidden bg-surface-container shadow-sm border-slate-200 dark:border-white/10">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-surface border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <img src={taskManagementLogo} alt="Tasks" className="w-5 h-5 object-contain" />
                <span className="text-sm font-bold text-on-surface tracking-wide">
                  {t('taskPage.liveBoardTitle', {}, 'Canlı Kanban Lövhəsi Baxışı')}
                </span>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-primary/15 text-primary font-semibold">
                Sprint 14 Engine
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {sampleColumns.map((col) => (
                <div key={col.id} className="border rounded-xl p-4 bg-surface border-slate-200 dark:border-white/10">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-4">
                    <span className="font-semibold text-xs text-on-surface uppercase tracking-wider">
                      {col.title}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-on-surface-variant">
                      {col.tasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {col.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-lg border bg-surface-container border-slate-200 dark:border-white/10 shadow-sm"
                      >
                        <div className="flex items-center justify-between text-[11px] text-on-surface-variant mb-2">
                          <span className="font-mono font-bold text-primary">{task.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              task.priority === 'Urgent'
                                ? 'bg-red-500/15 text-red-500'
                                : task.priority === 'High'
                                ? 'bg-amber-500/15 text-amber-500'
                                : 'bg-slate-200 dark:bg-white/10 text-on-surface-variant'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-on-surface leading-snug mb-3">
                          {task.title}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-slate-100 dark:border-white/5">
                          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/15 flex items-center justify-center font-bold text-[10px] text-on-surface">
                            {task.assignee}
                          </span>
                          <span>{task.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Core Feature Pillars */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="mb-12">
            <span className="text-xs uppercase tracking-widest text-primary font-bold block mb-2">
              {t('taskPage.featuresTitle', {}, 'İcra Mühərriki')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface">
              {t('taskPage.featuresSubtitle', {}, 'Tapşırıqların gecikmədən və şəffaf şəkildə tamamlanması üçün alətlər.')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-xl border bg-surface-container border-slate-200 dark:border-white/10">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary mb-5">
                <span className="material-symbols-outlined text-2xl">view_column</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">
                {t('taskPage.kanbanTitle', {}, 'Kanban və Çevik Statuslar')}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {t('taskPage.kanbanDesc', {}, 'Görüləcək, İcrada, Baxışda və Tamamlandı mərhələləri üzrə dinamik idarəetmə.')}
              </p>
            </div>

            <div className="p-8 rounded-xl border bg-surface-container border-slate-200 dark:border-white/10">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary/10 text-secondary mb-5">
                <span className="material-symbols-outlined text-2xl">update</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">
                {t('taskPage.sprintTitle', {}, 'Sprint və Backlog İdarəetməsi')}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {t('taskPage.sprintDesc', {}, 'Mərhələli planlaşdırma, son tarixlər və sprint hədəflərinin dəqiq icmalı.')}
              </p>
            </div>

            <div className="p-8 rounded-xl border bg-surface-container border-slate-200 dark:border-white/10">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-500 mb-5">
                <span className="material-symbols-outlined text-2xl">group_work</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">
                {t('taskPage.workloadTitle', {}, 'Komanda Resurs Bölgüsü')}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {t('taskPage.workloadDesc', {}, 'İcraçıların iş yükünün balanslaşdırılması və məsuliyyət zonaları.')}
              </p>
            </div>

            <div className="p-8 rounded-xl border bg-surface-container border-slate-200 dark:border-white/10">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-sky-500/10 text-sky-500 mb-5">
                <span className="material-symbols-outlined text-2xl">chat_bubble</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">
                {t('taskPage.discussionTitle', {}, 'Daxili Qeydlər və Əməkdaşlıq')}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {t('taskPage.discussionDesc', {}, 'Tapşırıq daxilində müzakirələr, sənədlər və ani bildirişlər.')}
              </p>
            </div>
          </div>
        </section>

        {/* 4. Bottom Enterprise CTA */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <div className="border rounded-2xl p-10 md:p-14 bg-surface text-center border-slate-200 dark:border-white/10">
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-4">
              {t('taskPage.heroTitle', {}, 'Komanda Məhsuldarlığı və Çevik Layihə İdarəetməsi')}
            </h2>
            <p className="text-sm md:text-base text-on-surface-variant max-w-2xl mx-auto mb-8">
              {t('taskPage.heroDesc', {}, 'Mürəkkəb layihələri aydın mərhələlərə bölün, tapşırıqları dəqiq vaxt çərçivəsində icra edin.')}
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

export default TaskProductPage;
