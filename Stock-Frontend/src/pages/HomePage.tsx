import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StockValueChart } from '../components/StockValueChart';
import { StockKpiCard } from '../components/StockKpiCard';
import { MasterDetailModal } from '../components/MasterDetailModal';
import { ArrowUpRight } from 'lucide-react';

interface MasterCardItem {
  name: string;
  hasArrow?: boolean;
}

interface MasterCardSection {
  title: string;
  items: MasterCardItem[];
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedModal, setSelectedModal] = useState<{
    isOpen: boolean;
    title: string;
    category: string;
  }>({
    isOpen: false,
    title: '',
    category: '',
  });

  const handleOpenDetail = (name: string, category: string) => {
    if (name === 'Stock Entry') {
      navigate('/stock-entry');
      return;
    }
    if (name === 'Purchase Receipt') {
      navigate('/purchase-receipt');
      return;
    }
    setSelectedModal({
      isOpen: true,
      title: name,
      category,
    });
  };

  const masterSections: MasterCardSection[] = [
    {
      title: 'Items Catalogue',
      items: [
        { name: 'Item', hasArrow: true },
        { name: 'Item Group', hasArrow: true },
        { name: 'Product Bundle', hasArrow: true },
        { name: 'Shipping Rule', hasArrow: true },
        { name: 'Item Alternative', hasArrow: true },
        { name: 'Item Manufacturer', hasArrow: true },
      ],
    },
    {
      title: 'Stock Transactions',
      items: [
        { name: 'Material Request', hasArrow: true },
        { name: 'Stock Entry', hasArrow: true },
        { name: 'Delivery Note', hasArrow: true },
        { name: 'Purchase Receipt', hasArrow: true },
        { name: 'Pick List', hasArrow: true },
        { name: 'Delivery Trip', hasArrow: true },
      ],
    },
    {
      title: 'Stock Reports',
      items: [
        { name: 'Stock Ledger', hasArrow: true },
        { name: 'Stock Balance', hasArrow: true },
        { name: 'Stock Projected Qty', hasArrow: true },
        { name: 'Stock Summary', hasArrow: true },
        { name: 'Stock Ageing', hasArrow: true },
        { name: 'Item Price Stock', hasArrow: true },
        { name: 'Warehouse Wise Stock Balance', hasArrow: true },
      ],
    },
    {
      title: 'Settings',
      items: [
        { name: 'Stock Settings', hasArrow: true },
        { name: 'Warehouse', hasArrow: true },
        { name: 'Unit of Measure (UOM)', hasArrow: true },
        { name: 'Item Variant Settings', hasArrow: true },
        { name: 'Brand', hasArrow: true },
        { name: 'Item Attribute', hasArrow: true },
        { name: 'UOM Conversion Factor', hasArrow: true },
      ],
    },
    {
      title: 'Serial No and Batch',
      items: [
        { name: 'Serial No', hasArrow: true },
        { name: 'Batch', hasArrow: true },
        { name: 'Serial No and Batch Traceability', hasArrow: true },
        { name: 'Serial No Ledger', hasArrow: true },
        { name: 'Installation Note', hasArrow: true },
        { name: 'Serial No Service Contract Expiry', hasArrow: true },
        { name: 'Serial No Status', hasArrow: true },
        { name: 'Serial No Warranty Expiry', hasArrow: true },
      ],
    },
    {
      title: 'Tools',
      items: [
        { name: 'Stock Reconciliation', hasArrow: true },
        { name: 'Landed Cost Voucher', hasArrow: true },
        { name: 'Packing Slip', hasArrow: true },
        { name: 'Quality Inspection', hasArrow: true },
        { name: 'Quality Inspection Template', hasArrow: true },
        { name: 'Quick Stock Balance', hasArrow: true },
      ],
    },
    {
      title: 'Key Reports',
      items: [
        { name: 'Stock Analytics', hasArrow: false },
        { name: 'Delivery Note Trends', hasArrow: false },
        { name: 'Purchase Receipt Trends', hasArrow: false },
        { name: 'Sales Order Analysis', hasArrow: true },
        { name: 'Purchase Order Analysis', hasArrow: true },
        { name: 'Item Shortage Report', hasArrow: true },
        { name: 'Batch-Wise Balance History', hasArrow: false },
      ],
    },
    {
      title: 'Other Reports',
      items: [
        { name: 'Requested Items To Be Transferred', hasArrow: false },
        { name: 'Batch Item Expiry Status', hasArrow: true },
        { name: 'Item Prices', hasArrow: true },
        { name: 'Itemwise Recommended Reorder Level...', hasArrow: false },
        { name: 'Item Variant Details', hasArrow: true },
        { name: 'Subcontracted Raw Materials To Be Tr...', hasArrow: false },
        { name: 'Subcontracted Item To Be Received', hasArrow: true },
      ],
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Main Stock Value Chart Card */}
      <section>
        <StockValueChart />
      </section>

      {/* 2. Three KPI Metric Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        <StockKpiCard
          title="Total Stock Value"
          value="95.390 K"
          subtitle="0 % since yesterday"
          onViewDetails={() => handleOpenDetail('Total Stock Value', 'KPI Metric')}
        />
        <StockKpiCard
          title="Total Warehouses"
          value="5"
          subtitle="0 % since last month"
          onViewDetails={() => handleOpenDetail('Total Warehouses', 'KPI Metric')}
        />
        <StockKpiCard
          title="Total Active Items"
          value="10"
          subtitle="0 % since last month"
          onViewDetails={() => handleOpenDetail('Total Active Items', 'KPI Metric')}
        />
      </section>

      {/* 3. Masters & Reports Section */}
      <section className="space-y-3 pt-2">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-white tracking-tight">
          Masters & Reports
        </h2>

        {/* 3 Columns Grid of Cards (Refined CRM Typography & Borders) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {masterSections.map((section, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-start transition-colors duration-200"
            >
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-3">
                {section.title}
              </h3>

              <div className="space-y-2">
                {section.items.map((item, itemIdx) => (
                  <button
                    key={itemIdx}
                    onClick={() => handleOpenDetail(item.name, section.title)}
                    className="flex items-center gap-1.5 text-[12.5px] font-normal text-slate-600 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white transition-colors group text-left cursor-pointer w-full"
                  >
                    <span className="truncate group-hover:underline">
                      {item.name}
                    </span>
                    {item.hasArrow && (
                      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white shrink-0 transition-colors" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Detail Modal on Link Click */}
      <MasterDetailModal
        isOpen={selectedModal.isOpen}
        onClose={() => setSelectedModal({ isOpen: false, title: '', category: '' })}
        title={selectedModal.title}
        category={selectedModal.category}
      />
    </div>
  );
};
