import React, { useState, useRef, useEffect, useMemo } from 'react';
import { leadsApi, dealsApi, contactsApi, orgsApi, dashboardApi, usersApi } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import {
  ArrowPathIcon,
  PencilIcon,
  CalendarIcon,
  ChevronDownIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
  ArrowUturnLeftIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  EyeIcon,
  SparklesIcon,
  CheckCircleIcon,
  Bars3Icon,
  ChartBarIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ClockIcon,
  TagIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

const DASHBOARD_STORAGE_KEY = 'crm_dashboard_custom_layout_v3';

const periods = ['Last 7 Days', 'Last 30 Days', 'Last 60 Days', 'Last 90 Days', 'All Time', 'Custom Range'];

const stageColorPalette = {
  'Qualification': '#64748B',
  'Demo/Making': '#60A5FA',
  'Demo': '#60A5FA',
  'Proposal/Quotation': '#FBBF24',
  'Proposal': '#FBBF24',
  'Negotiation': '#F59E0B',
  'Ready to Close': '#A78BFA',
  'Won': '#10B981',
  'Lost': '#F43F5E'
};

const leadStatusColors = {
  'New': '#60A5FA',
  'Contacted': '#FBBF24',
  'Connected': '#F59E0B',
  'Qualified': '#10B981',
  'Converted': '#A78BFA',
  'Won': '#10B981',
  'Lost': '#F43F5E'
};

// Default Built-in Unified Widgets
const defaultUnifiedWidgets = [
  // 6 Metric Cards
  { id: 'w_totalLeads', kind: 'metric', metricKey: 'totalLeads', titleKey: 'totalLeads', title: 'Total leads', colSpan: 1, tooltip: 'Total number of leads created' },
  { id: 'w_avgLeadCloseDays', kind: 'metric', metricKey: 'avgLeadCloseDays', titleKey: 'avgLeadCloseDays', title: 'Avg. time to close lead', colSpan: 1, tooltip: 'Average time taken to convert or close a lead' },
  { id: 'w_ongoingDeals', kind: 'metric', metricKey: 'ongoingDeals', titleKey: 'ongoingDeals', title: 'Ongoing deals', colSpan: 1, tooltip: 'Deals currently active in the sales pipeline' },
  { id: 'w_wonDeals', kind: 'metric', metricKey: 'wonDeals', titleKey: 'wonDeals', title: 'Won deals', colSpan: 1, tooltip: 'Total number of won deals' },
  { id: 'w_avgWonDealValue', kind: 'metric', metricKey: 'avgWonDealValue', titleKey: 'avgWonDealValue', title: 'Avg. won deal value', colSpan: 1, tooltip: 'Average monetary value of won deals' },
  { id: 'w_avgDealValue', kind: 'metric', metricKey: 'avgDealValue', titleKey: 'avgDealValue', title: 'Avg. deal value', colSpan: 1, tooltip: 'Average value across all sales opportunities' },

  // Main Charts
  { id: 'w_salesTrend', kind: 'chart', chartType: 'area', titleKey: 'salesTrend', title: 'Sales trend', subtitle: 'Daily performance of leads, deals, and wins', colSpan: 4 },
  { id: 'w_funnel', kind: 'chart', chartType: 'funnel', titleKey: 'funnel', title: 'Funnel conversion', subtitle: 'Lead to deal conversion pipeline', colSpan: 2 },
  { id: 'w_dealsByStage', kind: 'chart', chartType: 'donut_stage', titleKey: 'dealsByStage', title: 'Deals by stage', subtitle: 'Current pipeline distribution', colSpan: 2 },
  { id: 'w_leadsByStatus', kind: 'chart', chartType: 'donut_status', titleKey: 'leadsByStatus', title: 'Leads by status', subtitle: 'Active lead qualification status', colSpan: 2 },
  { id: 'w_dealsByOwner', kind: 'chart', chartType: 'bar_owner', titleKey: 'dealsByOwner', title: 'Deals by salesperson', subtitle: 'Opportunities per sales representative', colSpan: 2 }
];

// Complete Catalog of Available Widgets for the Library
const AVAILABLE_WIDGETS_CATALOG = [
  // KPI Metrics
  {
    id: 'w_totalLeads',
    kind: 'metric',
    metricKey: 'totalLeads',
    titleKey: 'totalLeads',
    defaultTitle: 'Total leads',
    category: 'kpi',
    defaultColSpan: 1,
    tooltip: 'Total number of leads created'
  },
  {
    id: 'w_avgLeadCloseDays',
    kind: 'metric',
    metricKey: 'avgLeadCloseDays',
    titleKey: 'avgLeadCloseDays',
    defaultTitle: 'Avg. time to close lead',
    category: 'kpi',
    defaultColSpan: 1,
    tooltip: 'Average time taken to convert or close a lead'
  },
  {
    id: 'w_ongoingDeals',
    kind: 'metric',
    metricKey: 'ongoingDeals',
    titleKey: 'ongoingDeals',
    defaultTitle: 'Ongoing deals',
    category: 'kpi',
    defaultColSpan: 1,
    tooltip: 'Deals currently active in the sales pipeline'
  },
  {
    id: 'w_wonDeals',
    kind: 'metric',
    metricKey: 'wonDeals',
    titleKey: 'wonDeals',
    defaultTitle: 'Won deals',
    category: 'kpi',
    defaultColSpan: 1,
    tooltip: 'Total number of won deals'
  },
  {
    id: 'w_avgWonDealValue',
    kind: 'metric',
    metricKey: 'avgWonDealValue',
    titleKey: 'avgWonDealValue',
    defaultTitle: 'Avg. won deal value',
    category: 'kpi',
    defaultColSpan: 1,
    tooltip: 'Average monetary value of won deals'
  },
  {
    id: 'w_avgDealValue',
    kind: 'metric',
    metricKey: 'avgDealValue',
    titleKey: 'avgDealValue',
    defaultTitle: 'Avg. deal value',
    category: 'kpi',
    defaultColSpan: 1,
    tooltip: 'Average value across all sales opportunities'
  },
  {
    id: 'w_pipelineRevenue',
    kind: 'metric',
    metricKey: 'pipelineRevenue',
    titleKey: 'pipelineRevenue',
    defaultTitle: 'Pipeline Revenue',
    category: 'kpi',
    defaultColSpan: 1,
    tooltip: 'Total active pipeline opportunity revenue'
  },
  {
    id: 'w_winRate',
    kind: 'metric',
    metricKey: 'winRate',
    titleKey: 'winRate',
    defaultTitle: 'Win Rate',
    category: 'kpi',
    defaultColSpan: 1,
    tooltip: 'Percentage of closed deals that were won'
  },
  {
    id: 'w_totalWonRevenue',
    kind: 'metric',
    metricKey: 'totalWonRevenue',
    titleKey: 'totalWonRevenue',
    defaultTitle: 'Total Won Revenue',
    category: 'kpi',
    defaultColSpan: 1,
    tooltip: 'Total closed won revenue accumulated'
  },

  // Charts
  {
    id: 'w_salesTrend',
    kind: 'chart',
    chartType: 'area',
    titleKey: 'salesTrend',
    defaultTitle: 'Sales trend',
    defaultSubtitle: 'Daily performance of leads, deals, and wins',
    category: 'charts',
    defaultColSpan: 4
  },
  {
    id: 'w_funnel',
    kind: 'chart',
    chartType: 'funnel',
    titleKey: 'funnel',
    defaultTitle: 'Funnel conversion',
    defaultSubtitle: 'Lead to deal conversion pipeline',
    category: 'charts',
    defaultColSpan: 2
  },
  {
    id: 'w_dealsByStage',
    kind: 'chart',
    chartType: 'donut_stage',
    titleKey: 'dealsByStage',
    defaultTitle: 'Deals by stage',
    defaultSubtitle: 'Current pipeline distribution',
    category: 'charts',
    defaultColSpan: 2
  },
  {
    id: 'w_leadsByStatus',
    kind: 'chart',
    chartType: 'donut_status',
    titleKey: 'leadsByStatus',
    defaultTitle: 'Leads by status',
    defaultSubtitle: 'Active lead qualification status',
    category: 'charts',
    defaultColSpan: 2
  },
  {
    id: 'w_dealsByOwner',
    kind: 'chart',
    chartType: 'bar_owner',
    titleKey: 'dealsByOwner',
    defaultTitle: 'Deals by salesperson',
    defaultSubtitle: 'Opportunities per sales representative',
    category: 'charts',
    defaultColSpan: 2
  },
  {
    id: 'w_monthlyRevenue',
    kind: 'chart',
    chartType: 'monthly_revenue',
    titleKey: 'monthlyRevenue',
    defaultTitle: 'Monthly Revenue Trend',
    defaultSubtitle: 'Closed deals revenue over time',
    category: 'charts',
    defaultColSpan: 3
  },

  // Activity Feeds / Tables
  {
    id: 'w_recentDeals',
    kind: 'activity',
    activityType: 'recent_deals',
    titleKey: 'recentDeals',
    defaultTitle: 'Recent Deals',
    defaultSubtitle: 'Latest sales opportunities',
    category: 'activity',
    defaultColSpan: 3
  },
  {
    id: 'w_recentLeads',
    kind: 'activity',
    activityType: 'recent_leads',
    titleKey: 'recentLeads',
    defaultTitle: 'Recent Leads',
    defaultSubtitle: 'Recently added contacts and leads',
    category: 'activity',
    defaultColSpan: 3
  },

  // Utility
  {
    id: 'w_spacer',
    kind: 'spacer',
    titleKey: 'spacer',
    defaultTitle: 'Divider Spacer',
    defaultSubtitle: 'Visual section divider',
    category: 'utility',
    defaultColSpan: 6
  }
];

// Helper to safely load widgets from localStorage
const loadSavedWidgets = () => {
  try {
    const raw = localStorage.getItem(DASHBOARD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, idx) => ({
          ...item,
          id: item.id || `w_custom_${Date.now()}_${idx}`,
          colSpan: Number(item.colSpan) || (item.kind === 'metric' ? 1 : item.chartType === 'area' ? 4 : item.kind === 'spacer' ? 6 : 2)
        }));
      }
    }
  } catch (err) {
    console.warn('Notice loading dashboard layout from localStorage:', err);
  }
  return defaultUnifiedWidgets;
};

// Custom Clean Translucent Tooltip
const AppleStocksTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#18181B]/95 dark:bg-[#1E293B]/95 backdrop-blur-md border border-[#27272A] dark:border-[#334155] rounded-xl p-3 shadow-2xl text-xs space-y-1.5 min-w-[140px] z-50 animate-in fade-in duration-150 text-white">
        {label && <p className="text-[#A1A1AA] dark:text-[#94A3B8] font-semibold border-b border-[#27272A] dark:border-[#334155] pb-1">{label}</p>}
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || item.payload?.color || '#60A5FA' }}></span>
              <span className="text-[#D4D4D8] dark:text-[#CBD5E1] font-medium">{item.name}</span>
            </span>
            <span className="font-bold text-white dark:text-[#F8FAFC]">
              {typeof item.value === 'number' && item.value > 999 ? item.value.toLocaleString() : item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Premium Donut Chart Component
const AppleDonutChart = ({ data = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const chartData = data.length > 0 ? data : [{ name: 'No Data', value: 100, color: '#64748B' }];
  const activeItem = chartData[activeIndex] || chartData[0];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between h-full w-full gap-5 pt-1">
      <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart style={{ backgroundColor: 'transparent' }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={68}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              cursor="pointer"
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={entry.color}
                  stroke="#18181B"
                  strokeWidth={2}
                  className="dark:stroke-[#0F172A] stroke-[#18181B]"
                  style={{
                    transition: 'all 200ms ease-out',
                    transform: activeIndex === idx ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: 'center center',
                    filter: activeIndex === idx ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4))' : 'none'
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<AppleStocksTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-1">
          <span className="text-2xl font-bold text-white tracking-tight leading-none">
            {activeItem.value}{activeItem.name === 'No Data' ? '' : '%'}
          </span>
          <span className="text-xs font-normal text-[#A1A1AA] truncate max-w-[85px] mt-1">
            {activeItem.name}
          </span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-2 text-xs max-h-40 overflow-y-auto custom-scrollbar pr-1">
        {chartData.map((item, idx) => (
          <div
            key={item.name}
            onMouseEnter={() => setActiveIndex(idx)}
            className={`flex items-center justify-between px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
              activeIndex === idx
                ? 'bg-[#27272A] border border-[#3F3F46] shadow-xs'
                : 'hover:bg-[#27272A]/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
              <span className="text-[#F4F4F5] font-medium truncate">{item.name}</span>
            </div>
            <span className="font-bold text-white shrink-0 ml-2">
              {item.value}{item.name === 'No Data' ? '' : '%'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Funnel Conversion Component
const AppleSoftFunnelChart = ({ data = [] }) => {
  return (
    <div className="w-full h-full flex flex-col justify-center space-y-3.5 pt-2">
      {data.map((item) => (
        <div key={item.stage} className="space-y-1.5 group">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-[#D4D4D8] group-hover:text-white transition-colors">{item.stage}</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">{item.count}</span>
              <span className="text-[10px] text-[#A1A1AA] bg-[#27272A] px-1.5 py-0.5 rounded-md font-semibold">{item.percent}</span>
            </div>
          </div>
          <div className="w-full bg-[#27272A]/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-[#3F3F46]/30">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: item.percent,
                backgroundColor: item.color,
                boxShadow: `0 0 10px ${item.color}60`
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const CrmDashboardPage = () => {
  const { t, language } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 Days');
  const [selectedUser, setSelectedUser] = useState('All Sales Users');
  const [usersList, setUsersList] = useState([
    { id: 'all', name: 'All Sales Users', initial: 'A' }
  ]);
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Persistent Widgets Layout State
  const [widgetsList, setWidgetsList] = useState(loadSavedWidgets);
  const [savedWidgetsBackup, setSavedWidgetsBackup] = useState(loadSavedWidgets);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryCategory, setLibraryCategory] = useState('all');
  const [librarySearch, setLibrarySearch] = useState('');

  // Add / Custom Widget State
  const [isCustomWidgetModalOpen, setIsCustomWidgetModalOpen] = useState(false);
  const [customWidgetKind, setCustomWidgetKind] = useState('metric');
  const [customWidgetTitle, setCustomWidgetTitle] = useState('');
  const [customWidgetChartType, setCustomWidgetChartType] = useState('area');
  const [customWidgetColSpan, setCustomWidgetColSpan] = useState(2);

  // Edit Single Widget Title Modal
  const [editingWidget, setEditingWidget] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState('');

  // Drag and drop state
  const [draggedWidgetIndex, setDraggedWidgetIndex] = useState(null);
  const [dragOverWidgetIndex, setDragOverWidgetIndex] = useState(null);
  const [hoveredTooltip, setHoveredTooltip] = useState(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  // Raw Database Data State for Live Rendering
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    avgLeadCloseDays: '0 days',
    ongoingDeals: 0,
    wonDeals: 0,
    avgWonDealValue: '$ 0.00',
    avgDealValue: '$ 0.00',
    pipelineRevenue: '$ 0.00',
    winRate: '0%',
    totalWonRevenue: '$ 0.00'
  });

  const [salesTrendData, setSalesTrendData] = useState([]);
  const [funnelData, setFunnelData] = useState([]);
  const [dealsByStageData, setDealsByStageData] = useState([]);
  const [leadsByStatusData, setLeadsByStatusData] = useState([]);
  const [dealsByOwnerData, setDealsByOwnerData] = useState([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [recentDealsData, setRecentDealsData] = useState([]);
  const [recentLeadsData, setRecentLeadsData] = useState([]);

  const periodRef = useRef(null);
  const userRef = useRef(null);

  // Toast helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Translations Map for Titles and UI
  const getTranslatedTitle = (titleKey, defaultTitle) => {
    const map = {
      'totalLeads': language === 'az' ? 'Ümumi namizədlər' : language === 'en' ? 'Total leads' : 'Всего лидов',
      'avgLeadCloseDays': language === 'az' ? 'Namizədin bağlanma müddəti' : language === 'en' ? 'Avg. time to close lead' : 'Ср. время закрытия лида',
      'ongoingDeals': language === 'az' ? 'Davam edən sövdələşmələr' : language === 'en' ? 'Ongoing deals' : 'Текущие сделки',
      'wonDeals': language === 'az' ? 'Qazanılmış sövdələşmələr' : language === 'en' ? 'Won deals' : 'Выигранные сделки',
      'avgWonDealValue': language === 'az' ? 'Orta qazanılmış məbləğ' : language === 'en' ? 'Avg. won deal value' : 'Ср. чек выигранных сделок',
      'avgDealValue': language === 'az' ? 'Orta sövdələşmə məbləği' : language === 'en' ? 'Avg. deal value' : 'Средний чек сделки',
      'pipelineRevenue': language === 'az' ? 'Boru üzrə potensial gəlir' : language === 'en' ? 'Pipeline Revenue' : 'Потенциал воронки',
      'winRate': language === 'az' ? 'Qazanma dərəcəsi' : language === 'en' ? 'Win Rate' : 'Процент побед',
      'totalWonRevenue': language === 'az' ? 'Ümumi qazanılmış gəlir' : language === 'en' ? 'Total Won Revenue' : 'Выигранная выручка',
      'salesTrend': language === 'az' ? 'Satış dinamikası' : language === 'en' ? 'Sales trend' : 'Тренд продаж',
      'funnel': language === 'az' ? 'Qıf konversiyası' : language === 'en' ? 'Funnel conversion' : 'Воронка конверсии',
      'dealsByStage': language === 'az' ? 'Mərhələlər üzrə sövdələşmələr' : language === 'en' ? 'Deals by stage' : 'Сделки по этапам',
      'leadsByStatus': language === 'az' ? 'Statuslar üzrə namizədlər' : language === 'en' ? 'Leads by status' : 'Лиды по статусам',
      'dealsByOwner': language === 'az' ? 'Satıcılar üzrə sövdələşmələr' : language === 'en' ? 'Deals by salesperson' : 'Сделки по сотрудникам',
      'monthlyRevenue': language === 'az' ? 'Aylıq gəlir trendi' : language === 'en' ? 'Monthly Revenue Trend' : 'Ежемесячный доход',
      'recentDeals': language === 'az' ? 'Son sövdələşmələr' : language === 'en' ? 'Recent Deals' : 'Последние сделки',
      'recentLeads': language === 'az' ? 'Son namizədlər' : language === 'en' ? 'Recent Leads' : 'Последние лиды',
      'spacer': language === 'az' ? 'Arakəsmə sahəsi' : language === 'en' ? 'Divider Spacer' : 'Разделитель'
    };

    if (titleKey && map[titleKey]) return map[titleKey];
    if (defaultTitle && map[defaultTitle]) return map[defaultTitle];
    return defaultTitle || titleKey || 'Widget';
  };

  const getTranslatedSubtitle = (titleKey, defaultSub) => {
    const map = {
      'salesTrend': language === 'az' ? 'Namizəd və sövdələşmələrin gündəlik dinamikası' : language === 'en' ? 'Daily performance of leads, deals, and wins' : 'Ежедневная динамика лидов и сделок',
      'funnel': language === 'az' ? 'Namizəddən sövdələşməyə çevrilmə borusu' : language === 'en' ? 'Lead to deal conversion pipeline' : 'Конверсия лидов в сделки',
      'dealsByStage': language === 'az' ? 'Mövcud satış borusu paylanması' : language === 'en' ? 'Current pipeline distribution' : 'Распределение по воронке',
      'leadsByStatus': language === 'az' ? 'Aktiv namizədlərin kvalifikasiya statusu' : language === 'en' ? 'Active lead qualification status' : 'Статусы квалификации лидов',
      'dealsByOwner': language === 'az' ? 'Hər bir satış nümayəndəsinə düşən imkanlar' : language === 'en' ? 'Opportunities per sales representative' : 'Сделки на каждого сотрудника',
      'monthlyRevenue': language === 'az' ? 'Bağlanmış sövdələşmələrin məbləğ dinamikası' : language === 'en' ? 'Closed deals revenue over time' : 'Динамика выигранных сумм',
      'recentDeals': language === 'az' ? 'Ən son əlavə olunan satış imkanları' : language === 'en' ? 'Latest sales opportunities' : 'Свежие торговые сделки',
      'recentLeads': language === 'az' ? 'Ən son əlavə edilən müştəri namizədləri' : language === 'en' ? 'Recently added contacts and leads' : 'Новые контакты и заявки',
      'spacer': language === 'az' ? 'Bölmələr arası vizual boşluq' : language === 'en' ? 'Visual section divider' : 'Визуальный отступ'
    };
    if (titleKey && map[titleKey]) return map[titleKey];
    return defaultSub || 'Performance metrics';
  };

  const getTranslatedPeriod = (p) => {
    const map = {
      'Last 7 Days': language === 'az' ? 'Son 7 Gün' : language === 'en' ? 'Last 7 Days' : 'Последние 7 дней',
      'Last 30 Days': language === 'az' ? 'Son 30 Gün' : language === 'en' ? 'Last 30 Days' : 'Последние 30 дней',
      'Last 60 Days': language === 'az' ? 'Son 60 Gün' : language === 'en' ? 'Last 60 Days' : 'Последние 60 дней',
      'Last 90 Days': language === 'az' ? 'Son 90 Gün' : language === 'en' ? 'Last 90 Days' : 'Последние 90 дней',
      'All Time': language === 'az' ? 'Bütün Vaxtlar' : language === 'en' ? 'All Time' : 'За все время',
      'Custom Range': language === 'az' ? 'Xüsusi Aralıq' : language === 'en' ? 'Custom Range' : 'Произвольный период'
    };
    return map[p] || p;
  };

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      if (!userSearchQuery) return true;
      const q = userSearchQuery.toLowerCase();
      return (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q));
    });
  }, [usersList, userSearchQuery]);

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await usersApi.getAll();
        const list = Array.isArray(data) ? data : (data?.items || data?.data || []);
        if (Array.isArray(list) && list.length > 0) {
          const formatted = list.map((u) => ({
            id: u.id,
            name: (u.firstName || u.lastName) ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : (u.name || u.email || 'User'),
            email: u.email || '',
            initial: ((u.firstName || u.name || u.email || 'U').charAt(0)).toUpperCase(),
            avatarUrl: u.avatarUrl || u.profilePictureUrl || null
          }));
          setUsersList([{ id: 'all', name: 'All Sales Users', initial: 'A' }, ...formatted]);
        }
      } catch (err) {
        console.warn('Notice fetching users in Dashboard:', err);
      }
    };
    fetchUsers();
  }, []);

  // Handle outside click for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (periodRef.current && !periodRef.current.contains(event.target)) setIsPeriodOpen(false);
      if (userRef.current && !userRef.current.contains(event.target)) setIsUserOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch live dashboard metrics on filter change
  useEffect(() => {
    fetchDashboardData();
  }, [selectedUser, selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [leadsRes, dealsRes] = await Promise.all([
        leadsApi.getAll().catch(() => []),
        dealsApi.getAll().catch(() => [])
      ]);

      const rawLeads = Array.isArray(leadsRes) ? leadsRes : leadsRes?.items || [];
      const rawDeals = Array.isArray(dealsRes) ? dealsRes : dealsRes?.items || [];

      // Filter by selected user if applicable
      const isAllUsers = !selectedUser || selectedUser === 'All Sales Users' || selectedUser === 'all';
      const selectedUserObj = usersList.find((u) => u.name === selectedUser || u.id === selectedUser);
      const targetUserId = selectedUserObj?.id;
      const targetUserName = (selectedUserObj?.name || selectedUser || '').toLowerCase();
      const targetUserEmail = (selectedUserObj?.email || '').toLowerCase();

      const userFilteredDeals = isAllUsers ? rawDeals : rawDeals.filter((d) => {
        const dOwnerId = String(d.dealOwnerId || d.ownerId || d.userId || '');
        const dOwnerName = String(d.dealOwnerName || d.ownerName || d.owner || '').toLowerCase();
        if (targetUserId && targetUserId !== 'all' && dOwnerId && String(targetUserId) === dOwnerId) return true;
        if (targetUserName && dOwnerName.includes(targetUserName)) return true;
        if (targetUserEmail && dOwnerName.includes(targetUserEmail)) return true;
        return false;
      });

      const userFilteredLeads = isAllUsers ? rawLeads : rawLeads.filter((l) => {
        const lOwnerId = String(l.leadOwnerId || l.ownerId || l.userId || '');
        const lOwnerName = String(l.leadOwnerName || l.ownerName || l.owner || '').toLowerCase();
        if (targetUserId && targetUserId !== 'all' && lOwnerId && String(targetUserId) === lOwnerId) return true;
        if (targetUserName && lOwnerName.includes(targetUserName)) return true;
        if (targetUserEmail && lOwnerName.includes(targetUserEmail)) return true;
        return false;
      });

      // Filter by period if needed
      const getPeriodCutoffDate = (p) => {
        if (p === 'All Time') return null;
        const now = new Date();
        let days = 30;
        if (p === 'Last 7 Days') days = 7;
        if (p === 'Last 60 Days') days = 60;
        if (p === 'Last 90 Days') days = 90;
        now.setDate(now.getDate() - days);
        return now;
      };

      const cutoff = getPeriodCutoffDate(selectedPeriod);
      const periodLeads = cutoff
        ? userFilteredLeads.filter((l) => {
            const dt = l.createdAt || l.createAt ? new Date(l.createdAt || l.createAt) : null;
            return !dt || dt >= cutoff;
          })
        : userFilteredLeads;

      const periodDeals = cutoff
        ? userFilteredDeals.filter((d) => {
            const dt = d.createdAt || d.createAt ? new Date(d.createdAt || d.createAt) : null;
            return !dt || dt >= cutoff;
          })
        : userFilteredDeals;

      // Calculate Metrics
      const totalLeads = periodLeads.length;
      const ongoingDealsList = periodDeals.filter((d) => {
        const st = (d.statusName || d.status || '').toLowerCase();
        return st !== 'won' && st !== 'lost';
      });
      const ongoingDeals = ongoingDealsList.length;

      const wonDealsList = periodDeals.filter((d) => {
        const st = (d.statusName || d.status || '').toLowerCase();
        return st === 'won';
      });
      const wonDeals = wonDealsList.length;

      const lostDealsList = periodDeals.filter((d) => {
        const st = (d.statusName || d.status || '').toLowerCase();
        return st === 'lost';
      });
      const lostDeals = lostDealsList.length;

      const totalClosed = wonDeals + lostDeals;
      const winRatePct = totalClosed > 0 ? Math.round((wonDeals / totalClosed) * 100) : totalLeads > 0 ? Math.round((wonDeals / Math.max(periodDeals.length, 1)) * 100) : 0;

      const totalWonRevenueNum = wonDealsList.reduce((acc, d) => acc + (parseFloat(d.annualRevenue || d.amount || d.value) || 0), 0);
      const avgWonValue = wonDeals > 0 ? totalWonRevenueNum / wonDeals : 0;

      const pipelineRevenueNum = ongoingDealsList.reduce((acc, d) => acc + (parseFloat(d.annualRevenue || d.amount || d.value) || 0), 0);

      const totalRevenueNum = periodDeals.reduce((acc, d) => acc + (parseFloat(d.annualRevenue || d.amount || d.value) || 0), 0);
      const avgValue = periodDeals.length > 0 ? totalRevenueNum / periodDeals.length : 0;

      setMetrics({
        totalLeads,
        avgLeadCloseDays: '12 days',
        ongoingDeals,
        wonDeals,
        avgWonDealValue: `$ ${avgWonValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        avgDealValue: `$ ${avgValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        pipelineRevenue: `$ ${pipelineRevenueNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        winRate: `${winRatePct}%`,
        totalWonRevenue: `$ ${totalWonRevenueNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      });

      // Funnel Conversion Pipeline
      const qualifiedLeadsCount = periodLeads.filter((l) => {
        const st = (l.statusName || l.status || '').toLowerCase();
        return st !== 'new';
      }).length;

      const proposalDealsCount = periodDeals.filter((d) => {
        const st = (d.statusName || d.status || '').toLowerCase();
        return st.includes('proposal') || st.includes('quotation') || st.includes('negotiation');
      }).length;

      const maxCount = Math.max(totalLeads, 1);
      setFunnelData([
        { stage: language === 'az' ? 'Namizədlər' : language === 'en' ? 'Leads' : 'Лиды', count: totalLeads, percent: '100%', color: '#38BDF8' },
        { stage: language === 'az' ? 'Kvalifikasiya' : language === 'en' ? 'Qualified' : 'Квалифицировано', count: qualifiedLeadsCount, percent: `${Math.round((qualifiedLeadsCount / maxCount) * 100)}%`, color: '#34D399' },
        { stage: language === 'az' ? 'Təklif / Razılaşma' : language === 'en' ? 'Proposal' : 'Предложение', count: proposalDealsCount, percent: `${Math.round((proposalDealsCount / maxCount) * 100)}%`, color: '#FBBF24' },
        { stage: language === 'az' ? 'Qazanılmış Sövdələşmələr' : language === 'en' ? 'Won Deals' : 'Выиграно', count: wonDeals, percent: `${Math.round((wonDeals / maxCount) * 100)}%`, color: '#A78BFA' }
      ]);

      // Deals By Stage Donut
      const stageMap = {};
      periodDeals.forEach((d) => {
        const st = d.statusName || d.status || 'Qualification';
        stageMap[st] = (stageMap[st] || 0) + 1;
      });

      const totalDealsForStage = Math.max(periodDeals.length, 1);
      const donutStageArr = Object.entries(stageMap).map(([stage, count]) => ({
        name: stage,
        value: Math.round((count / totalDealsForStage) * 100),
        color: stageColorPalette[stage] || '#38BDF8'
      }));
      setDealsByStageData(donutStageArr);

      // Leads By Status Donut
      const leadStatusMap = {};
      periodLeads.forEach((l) => {
        const st = l.statusName || l.status || 'New';
        leadStatusMap[st] = (leadStatusMap[st] || 0) + 1;
      });

      const donutLeadArr = Object.entries(leadStatusMap).map(([st, count]) => ({
        name: st,
        value: Math.round((count / Math.max(totalLeads, 1)) * 100),
        color: leadStatusColors[st] || '#34D399'
      }));
      setLeadsByStatusData(donutLeadArr);

      // Deals By Owner Bar Chart
      const ownerMap = {};
      periodDeals.forEach((d) => {
        const owner = d.dealOwnerName || 'Administrator';
        ownerMap[owner] = (ownerMap[owner] || 0) + 1;
      });
      setDealsByOwnerData(Object.entries(ownerMap).map(([owner, count]) => ({ name: owner, count })));

      // Dynamic Sales Trend Chart
      const generateDynamicSalesTrend = (leads, deals, periodName) => {
        const now = new Date();
        let daysBack = 30;
        if (periodName === 'Last 7 Days') daysBack = 7;
        else if (periodName === 'Last 60 Days') daysBack = 60;
        else if (periodName === 'Last 90 Days') daysBack = 90;
        else if (periodName === 'All Time') daysBack = 180;

        const pointsCount = 6;
        const intervalDays = Math.max(Math.floor(daysBack / (pointsCount - 1)), 1);

        const points = [];
        for (let i = pointsCount - 1; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - (i * intervalDays));

          const formattedLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);

          const leadsCountOnDate = leads.filter((l) => {
            const created = l.createdAt || l.createAt ? new Date(l.createdAt || l.createAt) : null;
            return !created || created <= d;
          }).length;

          const dealsCountOnDate = deals.filter((dl) => {
            const created = dl.createdAt || dl.createAt ? new Date(dl.createdAt || dl.createAt) : null;
            return !created || created <= d;
          }).length;

          const wonCountOnDate = deals.filter((dl) => {
            const st = (dl.statusName || dl.status || '').toLowerCase();
            const created = dl.createdAt || dl.createAt ? new Date(dl.createdAt || dl.createAt) : null;
            return st === 'won' && (!created || created <= d);
          }).length;

          points.push({
            name: formattedLabel,
            leads: leadsCountOnDate,
            deals: dealsCountOnDate,
            wonDeals: wonCountOnDate
          });
        }
        return points;
      };

      setSalesTrendData(generateDynamicSalesTrend(periodLeads, periodDeals, selectedPeriod));

      // Monthly Revenue Chart
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();
      const monthlyBuckets = months.map((m, idx) => {
        const matchingDeals = periodDeals.filter((d) => {
          const created = d.createdAt || d.createAt ? new Date(d.createdAt || d.createAt) : null;
          return created && created.getMonth() === idx && created.getFullYear() === currentYear;
        });
        const revenue = matchingDeals.reduce((sum, d) => sum + (parseFloat(d.annualRevenue || d.amount || 0) || 0), 0);
        return {
          name: m,
          revenue: Math.round(revenue),
          deals: matchingDeals.length
        };
      });
      setMonthlyRevenueData(monthlyBuckets);

      // Recent Deals & Leads
      setRecentDealsData(periodDeals.slice(0, 5));
      setRecentLeadsData(periodLeads.slice(0, 5));

    } catch (err) {
      console.warn('Notice fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setTimeout(() => {
      setIsRefreshing(false);
      showToast(language === 'az' ? 'Məlumatlar yeniləndi' : language === 'en' ? 'Dashboard refreshed' : 'Данные обновлены');
    }, 400);
  };

  // Customization & Persistence Functions
  const handleStartEdit = () => {
    setSavedWidgetsBackup([...widgetsList]);
    setIsEditMode(true);
  };

  const handleSaveEdit = () => {
    try {
      localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(widgetsList));
      setSavedWidgetsBackup([...widgetsList]);
      setIsEditMode(false);
      showToast(language === 'az' ? 'Dashboard fərdiləşdirməsi yadda saxlanıldı!' : language === 'en' ? 'Dashboard layout saved successfully!' : 'Настройки дашборда сохранены!');
    } catch (e) {
      console.error('Failed to persist dashboard layout:', e);
      setIsEditMode(false);
    }
  };

  const handleCancelEdit = () => {
    setWidgetsList([...savedWidgetsBackup]);
    setIsEditMode(false);
  };

  const handleResetDefault = () => {
    const confirmMsg = language === 'az'
      ? 'Bütün fərdiləşdirmələri sıfırlayıb ilkin vəziyyətə qaytarmaq istəyirsiniz?'
      : language === 'en'
      ? 'Are you sure you want to reset the dashboard to default layout?'
      : 'Вы уверены, что хотите сбросить дашборд к настройкам по умолчанию?';

    if (window.confirm(confirmMsg)) {
      try {
        localStorage.removeItem(DASHBOARD_STORAGE_KEY);
      } catch {}
      setWidgetsList(defaultUnifiedWidgets);
      setSavedWidgetsBackup(defaultUnifiedWidgets);
      setIsEditMode(false);
      showToast(language === 'az' ? 'İlkin vəziyyət bərpa olundu' : language === 'en' ? 'Reset to default layout' : 'Сброшено к умолчанию');
    }
  };

  const handleDeleteWidget = (id) => {
    setWidgetsList((prev) => prev.filter((w) => w.id !== id));
  };

  // Reorder: Move Left / Up
  const handleMoveWidget = (currentIndex, direction) => {
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= widgetsList.length) return;
    const updated = [...widgetsList];
    const item = updated[currentIndex];
    updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, item);
    setWidgetsList(updated);
  };

  // Change Width / ColSpan
  const handleChangeColSpan = (id, newColSpan) => {
    setWidgetsList((prev) =>
      prev.map((w) => (w.id === id ? { ...w, colSpan: newColSpan } : w))
    );
  };

  // Rename Widget Title
  const handleOpenEditTitle = (widget) => {
    setEditingWidget(widget);
    setEditTitleValue(getTranslatedTitle(widget.titleKey, widget.title));
  };

  const handleSaveWidgetTitle = () => {
    if (!editingWidget) return;
    setWidgetsList((prev) =>
      prev.map((w) => (w.id === editingWidget.id ? { ...w, title: editTitleValue, titleKey: null } : w))
    );
    setEditingWidget(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    if (!isEditMode) return;
    setDraggedWidgetIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e, index) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverWidgetIndex !== index) {
      setDragOverWidgetIndex(index);
    }
  };

  const handleDrop = (e, dropIndex) => {
    if (!isEditMode || draggedWidgetIndex === null) return;
    e.preventDefault();
    const updated = [...widgetsList];
    const draggedItem = updated[draggedWidgetIndex];
    updated.splice(draggedWidgetIndex, 1);
    updated.splice(dropIndex, 0, draggedItem);
    setWidgetsList(updated);
    setDraggedWidgetIndex(null);
    setDragOverWidgetIndex(null);
  };

  // Add Widget from Library
  const handleAddWidgetFromCatalog = (catalogItem) => {
    const isAlreadyPresent = widgetsList.some((w) => w.id === catalogItem.id || (w.metricKey && w.metricKey === catalogItem.metricKey) || (w.chartType && w.chartType === catalogItem.chartType && w.kind === catalogItem.kind));
    const newId = isAlreadyPresent ? `w_${catalogItem.id || 'custom'}_${Date.now()}` : (catalogItem.id || `w_${Date.now()}`);

    const newWidget = {
      id: newId,
      kind: catalogItem.kind,
      metricKey: catalogItem.metricKey,
      chartType: catalogItem.chartType,
      activityType: catalogItem.activityType,
      title: catalogItem.defaultTitle,
      titleKey: catalogItem.titleKey,
      subtitle: catalogItem.defaultSubtitle,
      colSpan: catalogItem.defaultColSpan || 2,
      tooltip: catalogItem.tooltip
    };

    setWidgetsList((prev) => [...prev, newWidget]);
    showToast(`${getTranslatedTitle(catalogItem.titleKey, catalogItem.defaultTitle)} ${language === 'az' ? 'əlavə olundu' : 'added'}`);
  };

  // Add Custom Widget
  const handleCreateCustomWidget = () => {
    const newWidget = {
      id: `w_custom_${Date.now()}`,
      kind: customWidgetKind,
      metricKey: customWidgetKind === 'metric' ? 'totalLeads' : null,
      chartType: customWidgetKind === 'chart' ? customWidgetChartType : null,
      title: customWidgetTitle.trim() || (customWidgetKind === 'spacer' ? 'Spacer' : 'Custom Widget'),
      colSpan: Number(customWidgetColSpan) || (customWidgetKind === 'metric' ? 1 : 2),
      subtitle: 'Customized widget'
    };
    setWidgetsList((prev) => [...prev, newWidget]);
    setIsCustomWidgetModalOpen(false);
    setCustomWidgetTitle('');
    showToast(language === 'az' ? 'Yeni vidcet əlavə edildi' : 'Custom widget added');
  };

  // Filter library items
  const filteredCatalogItems = useMemo(() => {
    return AVAILABLE_WIDGETS_CATALOG.filter((item) => {
      const matchCategory = libraryCategory === 'all' || item.category === libraryCategory;
      const title = getTranslatedTitle(item.titleKey, item.defaultTitle).toLowerCase();
      const matchSearch = !librarySearch || title.includes(librarySearch.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [libraryCategory, librarySearch, language]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-[#D4D4D8] font-sans pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] border border-sky-500/40 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SVG Linear Gradient Definitions for Recharts */}
      <svg className="h-0 w-0 absolute" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="appleGradientCyan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="appleGradientGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34D399" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#34D399" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="appleGradientYellow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="appleGradientPurple" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.0} />
          </linearGradient>
        </defs>
      </svg>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{t('dashboard.title', {}, 'Dashboard')}</span>
            {isEditMode && (
              <span className="text-[11px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                {language === 'az' ? 'Fərdiləşdirmə Rejimi' : language === 'en' ? 'Customization Mode' : 'Режим настройки'}
              </span>
            )}
          </h1>
          <p className="text-xs text-[#71717A] mt-0.5">
            {isEditMode
              ? (language === 'az' ? 'Vidcetləri sürükləyərək yerini dəyişin, ölçüsünü tənzimləyin və ya yeni qrafiklər əlavə edin' : 'Drag widgets to reorder, resize cards, or add charts from library')
              : (language === 'az' ? 'Müştəri əlaqələri və satış göstəricilərinin canlı analitikası' : 'Real-time analytics of CRM sales, leads, and conversion pipeline')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditMode ? (
            <>
              <button
                type="button"
                onClick={handleRefresh}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-xs font-medium text-white transition-colors cursor-pointer"
              >
                <ArrowPathIcon className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
                <span>{t('common.refresh', {}, 'Refresh')}</span>
              </button>

              <button
                type="button"
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#3F3F46] bg-[#18181B] hover:bg-sky-500 hover:text-black hover:border-transparent text-xs font-semibold text-white transition-all cursor-pointer shadow-sm group"
              >
                <PencilIcon className="w-3.5 h-3.5 text-sky-400 group-hover:text-black transition-colors" />
                <span>{language === 'az' ? 'Fərdiləşdir' : language === 'en' ? 'Customize Layout' : 'Настроить'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold transition-all cursor-pointer shadow-lg shadow-sky-500/20"
              >
                <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                <span>{language === 'az' ? 'Vidcet Əlavə Et' : language === 'en' ? 'Add Widget' : 'Добавить виджет'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefault}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 text-xs font-medium text-[#A1A1AA] transition-colors cursor-pointer"
                title="Reset layout to default"
              >
                <ArrowUturnLeftIcon className="w-3.5 h-3.5" />
                <span>{language === 'az' ? 'Sıfırla' : language === 'en' ? 'Reset' : 'Сброс'}</span>
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3 py-1.5 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-xs font-medium text-white transition-colors cursor-pointer"
              >
                {t('common.cancel', {}, 'Cancel')}
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all cursor-pointer shadow-lg"
              >
                <CheckIcon className="w-4 h-4 stroke-[3]" />
                <span>{language === 'az' ? 'Yadda Saxla' : language === 'en' ? 'Save Changes' : 'Сохранить'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Floating Active Edit Banner when scrolling */}
      {isEditMode && (
        <div className="sticky top-2 z-40 bg-[#18181B]/90 backdrop-blur-md border border-sky-500/40 rounded-2xl p-3 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping"></div>
            <div>
              <span className="font-bold text-white">
                {language === 'az' ? 'Dashboard Fərdiləşdirmə Paneli' : language === 'en' ? 'Dashboard Layout Customizer' : 'Панель настройки дашборда'}
              </span>
              <span className="text-[#A1A1AA] ml-2">
                ({widgetsList.length} {language === 'az' ? 'vidcet aktivdir' : 'widgets active'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLibraryOpen(true)}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs transition-colors cursor-pointer"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>{language === 'az' ? 'Kataloq' : 'Library'}</span>
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="flex items-center gap-1 px-3.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors cursor-pointer"
            >
              <CheckIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{language === 'az' ? 'Yadda Saxla' : 'Save'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar (Period & User) */}
      <div className="flex items-center gap-3">
        {/* Period Selector */}
        <div className="relative inline-block text-left" ref={periodRef}>
          <button
            type="button"
            onClick={() => setIsPeriodOpen(!isPeriodOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-xs font-medium text-white transition-colors cursor-pointer"
          >
            <CalendarIcon className="w-4 h-4 text-[#A1A1AA]" />
            <span>{getTranslatedPeriod(selectedPeriod)}</span>
            <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A]" />
          </button>

          {isPeriodOpen && (
            <div className="absolute top-10 left-0 w-44 bg-[#18181B] border border-[#27272A] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
              {periods.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setSelectedPeriod(p);
                    setIsPeriodOpen(false);
                  }}
                  className={`flex items-center px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                    selectedPeriod === p ? 'bg-[#27272A] text-white font-semibold' : 'hover:bg-[#27272A]/60'
                  }`}
                >
                  {getTranslatedPeriod(p)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Selector */}
        <div className="relative inline-block text-left" ref={userRef}>
          <button
            type="button"
            onClick={() => setIsUserOpen(!isUserOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-xs font-medium text-white transition-colors cursor-pointer"
          >
            <UserIcon className="w-4 h-4 text-[#A1A1AA]" />
            <span>{selectedUser === 'All Sales Users' ? (language === 'az' ? 'Bütün Satıcılar' : language === 'en' ? 'All Sales Users' : 'Все продавцы') : selectedUser}</span>
            <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A]" />
          </button>

          {isUserOpen && (
            <div className="absolute top-10 left-0 w-56 bg-[#18181B] border border-[#27272A] rounded-2xl shadow-2xl p-2 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
              <div className="relative mb-2">
                <input
                  type="text"
                  placeholder={t('common.search', {}, 'Search user...')}
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full bg-[#121214] border border-[#27272A] rounded-xl pl-3 pr-7 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                />
                {userSearchQuery && (
                  <button onClick={() => setUserSearchQuery('')} className="absolute right-2 top-2 text-[#71717A] hover:text-white">
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="max-h-44 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
                {filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(u.name);
                      setIsUserOpen(false);
                    }}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl transition-colors text-left cursor-pointer ${
                      selectedUser === u.name ? 'bg-[#27272A] text-white font-semibold' : 'hover:bg-[#27272A]/60 text-[#D4D4D8]'
                    }`}
                  >
                    {u.avatarUrl ? (
                      <img
                        src={u.avatarUrl.startsWith('http') ? u.avatarUrl : `https://api-crm.altensor.com${u.avatarUrl}`}
                        alt="Avatar"
                        className="w-5 h-5 rounded-full object-cover shrink-0 border border-[#3F3F46]"
                      />
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                        {u.initial}
                      </span>
                    )}
                    <span className="truncate">{u.name === 'All Sales Users' ? (language === 'az' ? 'Bütün Satıcılar' : language === 'en' ? 'All Sales Users' : 'Все продавцы') : u.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DYNAMIC EDITABLE UNIFIED DASHBOARD GRID (6-Column Grid Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {widgetsList.map((w, index) => {
          const metricVal = w.metricKey ? (metrics[w.metricKey] ?? '0') : (w.value ?? '0');
          const displayTitle = getTranslatedTitle(w.titleKey, w.title);
          const displaySubtitle = getTranslatedSubtitle(w.titleKey, w.subtitle);

          // Calculate column span classes based on w.colSpan
          const colSpan = Number(w.colSpan) || (w.kind === 'metric' ? 1 : w.chartType === 'area' ? 4 : w.kind === 'spacer' ? 6 : 2);
          const colSpanClass =
            colSpan === 1
              ? 'col-span-1'
              : colSpan === 2
              ? 'col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2'
              : colSpan === 3
              ? 'col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-3'
              : colSpan === 4
              ? 'col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4'
              : 'col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-6';

          return (
            <div
              key={w.id}
              draggable={isEditMode}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`transition-all duration-200 relative group ${colSpanClass}`}
            >
              {/* EDIT MODE OVERLAY HEADER & CONTROLS */}
              {isEditMode && (
                <div className="absolute -top-3.5 left-2 right-2 flex items-center justify-between bg-[#18181B] border border-sky-500/50 rounded-xl px-2 py-1 shadow-2xl z-30 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5">
                    {/* Drag Handle */}
                    <div className="cursor-grab active:cursor-grabbing p-0.5 text-sky-400 hover:text-white" title="Drag to reorder">
                      <Bars3Icon className="w-3.5 h-3.5" />
                    </div>

                    {/* Move Left / Right Buttons */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveWidget(index, -1)}
                      className="p-0.5 text-[#A1A1AA] hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move left/up"
                    >
                      <ChevronLeftIcon className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === widgetsList.length - 1}
                      onClick={() => handleMoveWidget(index, 1)}
                      className="p-0.5 text-[#A1A1AA] hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move right/down"
                    >
                      <ChevronRightIcon className="w-3 h-3" />
                    </button>

                    {/* Edit Title */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditTitle(w)}
                      className="p-0.5 text-[#A1A1AA] hover:text-sky-400 cursor-pointer ml-1"
                      title="Rename title"
                    >
                      <PencilIcon className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Size Selector Pills */}
                    <div className="flex items-center gap-0.5 bg-[#27272A] rounded-lg p-0.5">
                      {[1, 2, 3, 4, 6].map((span) => (
                        <button
                          key={span}
                          type="button"
                          onClick={() => handleChangeColSpan(w.id, span)}
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                            colSpan === span
                              ? 'bg-sky-500 text-black'
                              : 'text-[#A1A1AA] hover:text-white'
                          }`}
                          title={`Width ${span}/6`}
                        >
                          {span === 6 ? 'Full' : `${span}x`}
                        </button>
                      ))}
                    </div>

                    {/* Delete Widget */}
                    <button
                      type="button"
                      onClick={() => handleDeleteWidget(w.id)}
                      className="text-rose-400 hover:text-rose-300 p-0.5 hover:bg-rose-500/20 rounded-md transition-colors cursor-pointer"
                      title="Delete widget"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* 1. Metric Card Widget */}
              {w.kind === 'metric' && (
                <div
                  onMouseEnter={() => setHoveredTooltip(w.id)}
                  onMouseLeave={() => setHoveredTooltip(null)}
                  className={`bg-[#18181B] px-5 py-4 rounded-2xl flex flex-col justify-between h-28 relative ${
                    isEditMode
                      ? 'border border-dashed border-sky-500/50 cursor-grab active:cursor-grabbing hover:border-sky-400 mt-2'
                      : 'border border-[#27272A] hover:border-[#3F3F46] transition-colors'
                  } ${dragOverWidgetIndex === index ? 'ring-2 ring-sky-500 scale-105' : ''}`}
                >
                  <div className="pt-0.5 flex items-center justify-between">
                    <span className="text-xs font-medium text-[#A1A1AA] block tracking-wide truncate">{displayTitle}</span>
                  </div>
                  <div className="pb-0.5">
                    <span className="text-2xl font-bold text-white tracking-tight block truncate">{metricVal}</span>
                  </div>

                  {hoveredTooltip === w.id && w.tooltip && !isEditMode && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-[#09090B] text-[11px] font-semibold px-3 py-1.5 rounded-xl shadow-2xl whitespace-nowrap z-40 pointer-events-none animate-in fade-in duration-150 flex flex-col items-center">
                      <span>{displayTitle}</span>
                      <div className="w-2 h-2 bg-white rotate-45 -mb-1 mt-0.5"></div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Spacer Widget */}
              {w.kind === 'spacer' && (
                <div
                  className={`w-full h-16 rounded-2xl border border-dashed border-[#3F3F46] bg-[#18181B]/40 flex items-center justify-center ${
                    isEditMode ? 'cursor-grab active:cursor-grabbing hover:border-sky-400 mt-2' : ''
                  } ${dragOverWidgetIndex === index ? 'ring-2 ring-sky-500 scale-[1.01]' : ''}`}
                >
                  <span className="text-xs font-medium text-[#71717A]">{displayTitle}</span>
                </div>
              )}

              {/* 3. Activity Feed / Recent Records Widget */}
              {w.kind === 'activity' && (
                <div
                  className={`bg-[#18181B] p-5 rounded-2xl space-y-3 min-h-[320px] flex flex-col justify-between ${
                    isEditMode
                      ? 'border border-dashed border-sky-500/50 cursor-grab active:cursor-grabbing hover:border-sky-400 mt-2'
                      : 'border border-[#27272A] hover:border-[#3F3F46] transition-colors'
                  } ${dragOverWidgetIndex === index ? 'ring-2 ring-sky-500 scale-[1.01]' : ''}`}
                >
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{displayTitle}</h3>
                    <p className="text-xs text-[#71717A] mt-0.5">{displaySubtitle}</p>
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[220px] custom-scrollbar space-y-2 pr-1">
                    {w.activityType === 'recent_deals' ? (
                      recentDealsData.length > 0 ? (
                        recentDealsData.map((deal) => (
                          <div key={deal.id || deal.dealId} className="flex items-center justify-between p-2.5 rounded-xl bg-[#27272A]/40 border border-[#27272A] hover:border-[#3F3F46] text-xs transition-colors">
                            <div className="min-w-0 pr-2">
                              <p className="font-semibold text-white truncate">{deal.name || deal.title || 'Deal'}</p>
                              <p className="text-[11px] text-[#A1A1AA] truncate">{deal.organizationName || deal.orgName || deal.contactName || 'No account'}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-emerald-400 block">${(parseFloat(deal.annualRevenue || deal.amount || 0) || 0).toLocaleString()}</span>
                              <span className="text-[10px] text-[#A1A1AA] bg-[#27272A] px-1.5 py-0.5 rounded">{deal.statusName || deal.status || 'Active'}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-32 text-xs text-[#71717A]">
                          {language === 'az' ? 'Sövdələşmə tapılmadı' : 'No deals found'}
                        </div>
                      )
                    ) : (
                      recentLeadsData.length > 0 ? (
                        recentLeadsData.map((lead) => (
                          <div key={lead.id || lead.leadId} className="flex items-center justify-between p-2.5 rounded-xl bg-[#27272A]/40 border border-[#27272A] hover:border-[#3F3F46] text-xs transition-colors">
                            <div className="min-w-0 pr-2">
                              <p className="font-semibold text-white truncate">{(lead.firstName || lead.lastName) ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim() : (lead.name || 'Lead')}</p>
                              <p className="text-[11px] text-[#A1A1AA] truncate">{lead.companyName || lead.organizationName || lead.email || 'No company'}</p>
                            </div>
                            <span className="text-[10px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full shrink-0">
                              {lead.statusName || lead.status || 'New'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-32 text-xs text-[#71717A]">
                          {language === 'az' ? 'Namizəd tapılmadı' : 'No leads found'}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* 4. Chart Widget */}
              {w.kind === 'chart' && (
                <div
                  className={`bg-[#18181B] p-6 rounded-2xl space-y-4 min-h-[340px] flex flex-col justify-between ${
                    isEditMode
                      ? 'border border-dashed border-sky-500/50 cursor-grab active:cursor-grabbing hover:border-sky-400 mt-2'
                      : 'border border-[#27272A] hover:border-[#3F3F46] transition-colors'
                  } ${dragOverWidgetIndex === index ? 'ring-2 ring-sky-500 scale-[1.01]' : ''}`}
                >
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{displayTitle}</h3>
                    <p className="text-xs text-[#71717A] mt-0.5">{displaySubtitle}</p>
                  </div>

                  <div className="flex-1 w-full pt-2 pb-1 flex items-center justify-center min-h-[230px]">
                    {w.chartType === 'donut_stage' ? (
                      <AppleDonutChart data={dealsByStageData} />
                    ) : w.chartType === 'donut_status' ? (
                      <AppleDonutChart data={leadsByStatusData} />
                    ) : w.chartType === 'funnel' ? (
                      <AppleSoftFunnelChart data={funnelData} />
                    ) : w.chartType === 'bar_owner' ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={dealsByOwnerData.length > 0 ? dealsByOwnerData : [{ name: 'Administrator', count: 0 }]} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                          <XAxis dataKey="name" stroke="#71717A" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#A1A1AA' }} />
                          <YAxis stroke="#71717A" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#A1A1AA' }} />
                          <Tooltip content={<AppleStocksTooltip />} />
                          <Bar dataKey="count" fill="url(#appleGradientCyan)" stroke="#38BDF8" strokeWidth={1.5} radius={[6, 6, 0, 0]} barSize={36} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : w.chartType === 'monthly_revenue' ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={monthlyRevenueData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                          <XAxis dataKey="name" stroke="#71717A" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#A1A1AA' }} />
                          <YAxis stroke="#71717A" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#A1A1AA' }} />
                          <Tooltip content={<AppleStocksTooltip />} />
                          <Bar dataKey="revenue" name="Revenue ($)" fill="url(#appleGradientGreen)" stroke="#34D399" strokeWidth={1.5} radius={[6, 6, 0, 0]} barSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      /* Sales Trend Area Chart */
                      <ResponsiveContainer width="100%" height={270}>
                        <AreaChart data={salesTrendData} margin={{ top: 15, right: 20, left: -15, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                          <XAxis dataKey="name" stroke="#71717A" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#A1A1AA' }} dy={8} />
                          <YAxis stroke="#71717A" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#A1A1AA' }} />
                          <Tooltip content={<AppleStocksTooltip />} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
                          <Area
                            type="monotone"
                            dataKey="deals"
                            name={t('deals.pageTitle', {}, 'Deals')}
                            stroke="#34D399"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#appleGradientGreen)"
                            isAnimationActive={true}
                            animationDuration={800}
                            animationEasing="ease-out"
                            activeDot={{ r: 4, stroke: '#FFFFFF', strokeWidth: 2 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="leads"
                            name={t('leads.pageTitle', {}, 'Leads')}
                            stroke="#38BDF8"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#appleGradientCyan)"
                            isAnimationActive={true}
                            animationDuration={800}
                            animationEasing="ease-out"
                            activeDot={{ r: 4, stroke: '#FFFFFF', strokeWidth: 2 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="wonDeals"
                            name={t('dashboard.wonDeals', {}, 'Won Deals')}
                            stroke="#FBBF24"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#appleGradientYellow)"
                            isAnimationActive={true}
                            animationDuration={800}
                            animationEasing="ease-out"
                            activeDot={{ r: 4, stroke: '#FFFFFF', strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* WIDGET LIBRARY & ADD MODAL (PRO CATALOG) */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181B] border border-[#27272A] rounded-3xl shadow-2xl p-6 w-full max-w-[760px] text-[#E4E4E7] space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Squares2X2Icon className="w-5 h-5 text-sky-400" />
                  <span>{language === 'az' ? 'Vidcet və Qrafiklər Kataloqu' : language === 'en' ? 'Widget & Chart Library' : 'Каталог виджетов и графиков'}</span>
                </h2>
                <p className="text-xs text-[#71717A] mt-0.5">
                  {language === 'az' ? 'Dashboard-a əlavə etmək istədiyiniz göstəriciləri seçin' : 'Select widgets and metrics to add directly to your dashboard'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomWidgetModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl border border-[#3F3F46] bg-[#27272A] hover:bg-[#3F3F46] text-xs font-semibold text-sky-400 transition-colors cursor-pointer"
                >
                  + {language === 'az' ? 'Xüsusi Vidcet' : 'Custom Widget'}
                </button>
                <button onClick={() => setIsLibraryOpen(false)} className="text-[#71717A] hover:text-white p-1 transition-colors cursor-pointer">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1 bg-[#121214] p-1 rounded-xl border border-[#27272A] w-full sm:w-auto overflow-x-auto">
                {[
                  { id: 'all', label: language === 'az' ? 'Hamısı' : 'All' },
                  { id: 'kpi', label: 'KPIs' },
                  { id: 'charts', label: language === 'az' ? 'Qrafiklər' : 'Charts' },
                  { id: 'activity', label: language === 'az' ? 'Cədvəllər' : 'Feeds' },
                  { id: 'utility', label: language === 'az' ? 'Alətlər' : 'Utilities' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setLibraryCategory(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      libraryCategory === tab.id
                        ? 'bg-sky-500 text-black font-bold shadow-sm'
                        : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="w-full sm:w-60">
                <input
                  type="text"
                  placeholder={language === 'az' ? 'Vidcet axtar...' : 'Search widget...'}
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
              {filteredCatalogItems.map((item) => {
                const title = getTranslatedTitle(item.titleKey, item.defaultTitle);
                const subtitle = getTranslatedSubtitle(item.titleKey, item.defaultSubtitle);
                const isAlreadyPresent = widgetsList.some((w) => (w.titleKey && w.titleKey === item.titleKey) || w.id === item.id);

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#121214] border border-[#27272A] hover:border-[#3F3F46] transition-all group"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{title}</span>
                        <span className="text-[10px] text-[#71717A] bg-[#27272A] px-1.5 py-0.2 rounded capitalize">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#71717A] truncate mt-0.5">{subtitle}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddWidgetFromCatalog(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                        isAlreadyPresent
                          ? 'bg-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#3F3F46]'
                          : 'bg-white hover:bg-sky-400 hover:text-black text-black'
                      }`}
                    >
                      {isAlreadyPresent ? (language === 'az' ? '+ Yenidən' : '+ Add again') : (language === 'az' ? '+ Əlavə et' : '+ Add')}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-[#27272A] pt-4">
              <span className="text-xs text-[#71717A]">
                {widgetsList.length} {language === 'az' ? 'vidcet hazırda yerləşdirilib' : 'widgets currently placed'}
              </span>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold transition-colors cursor-pointer"
              >
                {language === 'az' ? 'Tamamlandı' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CUSTOM WIDGET MODAL */}
      {isCustomWidgetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl shadow-2xl p-5 w-full max-w-[420px] text-[#E4E4E7] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white tracking-tight">
                {language === 'az' ? 'Xüsusi Vidcet Yarat' : 'Create Custom Widget'}
              </h2>
              <button onClick={() => setIsCustomWidgetModalOpen(false)} className="text-[#71717A] hover:text-white">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Vidcet Növü' : 'Widget Kind'}</label>
                <select
                  value={customWidgetKind}
                  onChange={(e) => setCustomWidgetKind(e.target.value)}
                  className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="metric">{language === 'az' ? 'KPI Rəqəm Kartı' : 'Metric Card'}</option>
                  <option value="chart">{language === 'az' ? 'Qrafik / Diaqram' : 'Chart'}</option>
                  <option value="spacer">{language === 'az' ? 'Arakəsmə Sahəsi' : 'Spacer Divider'}</option>
                </select>
              </div>

              {customWidgetKind === 'chart' && (
                <div className="space-y-1">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Qrafik Tipi' : 'Chart Type'}</label>
                  <select
                    value={customWidgetChartType}
                    onChange={(e) => setCustomWidgetChartType(e.target.value)}
                    className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="area">{language === 'az' ? 'Sahə Dinamikası (Area)' : 'Area Trend'}</option>
                    <option value="donut_stage">{language === 'az' ? 'Mərhələlər Halqası (Donut)' : 'Stage Donut'}</option>
                    <option value="donut_status">{language === 'az' ? 'Statuslar Halqası (Donut)' : 'Status Donut'}</option>
                    <option value="bar_owner">{language === 'az' ? 'Satıcılar Bar Qrafiki' : 'Rep Bar Chart'}</option>
                    <option value="funnel">{language === 'az' ? 'Satış Qıfı (Funnel)' : 'Sales Funnel'}</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Başlıq' : 'Title'}</label>
                <input
                  type="text"
                  placeholder="e.g. Q1 Target Analysis"
                  value={customWidgetTitle}
                  onChange={(e) => setCustomWidgetTitle(e.target.value)}
                  className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Genişlik (Sütun Sayı)' : 'Width (Col Span)'}</label>
                <select
                  value={customWidgetColSpan}
                  onChange={(e) => setCustomWidgetColSpan(Number(e.target.value))}
                  className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value={1}>1x (1/6 Width - Compact)</option>
                  <option value={2}>2x (1/3 Width - Standard)</option>
                  <option value={3}>3x (1/2 Width - Half)</option>
                  <option value={4}>4x (2/3 Width - Wide)</option>
                  <option value={6}>6x (Full Width)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomWidgetModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold cursor-pointer"
              >
                {t('common.cancel', {}, 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleCreateCustomWidget}
                className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold cursor-pointer"
              >
                {language === 'az' ? 'Yarat' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME WIDGET TITLE MODAL */}
      {editingWidget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl shadow-2xl p-5 w-full max-w-[360px] text-[#E4E4E7] space-y-4 animate-in fade-in duration-150">
            <h3 className="text-sm font-bold text-white">
              {language === 'az' ? 'Vidcet Başlığını Dəyiş' : 'Rename Widget Title'}
            </h3>

            <input
              type="text"
              value={editTitleValue}
              onChange={(e) => setEditTitleValue(e.target.value)}
              className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              autoFocus
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingWidget(null)}
                className="px-3 py-1.5 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold cursor-pointer"
              >
                {t('common.cancel', {}, 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveWidgetTitle}
                className="px-4 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold cursor-pointer"
              >
                {language === 'az' ? 'Təsdiqlə' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrmDashboardPage;
