import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { stockService } from '../api/stockService';

interface WarehouseStockNode {
  id: string;
  name: string;
  stockBalance: number;
  level: number;
  isGroup?: boolean;
  children?: WarehouseStockNode[];
}

const mapWarehouseTree = (items: any[]): WarehouseStockNode[] => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const hasNested = items.some((x) => Array.isArray(x.children) && x.children.length > 0);
  if (hasNested) {
    const mapNode = (x: any, level = 0): WarehouseStockNode => ({
      id: x.id || x.warehouseId || `wh-${level}-${Math.random()}`,
      name: x.warehouseName || x.name || '',
      stockBalance: Number(x.stockBalance ?? x.balanceValue ?? x.balanceQty ?? 0),
      level,
      isGroup: Boolean(x.isGroup || (x.children && x.children.length > 0)),
      children: Array.isArray(x.children)
        ? x.children.map((c: any) => mapNode(c, level + 1))
        : undefined,
    });
    return items.map((x) => mapNode(x, 0));
  }
  return items.map((x, idx) => ({
    id: x.warehouseId || x.id || `wh-${idx}`,
    name: x.warehouseName || x.name || '',
    stockBalance: Number(x.stockBalance ?? x.balanceValue ?? x.balanceQty ?? 0),
    level: Number(x.level ?? 0),
    isGroup: Boolean(x.isGroup),
  }));
};

export const WarehouseWiseStockBalancePage: React.FC = () => {
  const [company] = useState('Avalon (Demo)');
  const [showDisabledWarehouses, setShowDisabledWarehouses] = useState(false);
  const [treeData, setTreeData] = useState<WarehouseStockNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [levelInput, setLevelInput] = useState('2');

  const fetchTree = useCallback(async () => {
    try {
      const data = await stockService.getWarehouseWiseBalanceReport({
        showDisabledWarehouses,
      });
      const mapped = mapWarehouseTree(data);
      setTreeData(mapped);
      const initialExp: Record<string, boolean> = {};
      mapped.forEach((n) => {
        if (n.isGroup) initialExp[n.id] = true;
      });
      setExpandedNodes(initialExp);
    } catch (err) {
      console.error('Failed to load warehouse wise stock balance:', err);
    }
  }, [showDisabledWarehouses]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  // Inline column filter inputs
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [balanceSearch, setBalanceSearch] = useState('');

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleSetLevel = () => {
    const lvl = parseInt(levelInput, 10);
    if (isNaN(lvl)) return;
    const newExpanded: Record<string, boolean> = {};
    const traverse = (node: WarehouseStockNode) => {
      if (node.isGroup) {
        newExpanded[node.id] = node.level < lvl;
        if (node.children) {
          node.children.forEach(traverse);
        }
      }
    };
    treeData.forEach(traverse);
    setExpandedNodes(newExpanded);
  };

  const isAllCollapsed = useMemo(() => {
    return Object.values(expandedNodes).every((val) => !val);
  }, [expandedNodes]);

  const toggleCollapseAll = () => {
    if (isAllCollapsed) {
      // Expand all
      const newExpanded: Record<string, boolean> = {};
      const traverse = (node: WarehouseStockNode) => {
        if (node.isGroup) {
          newExpanded[node.id] = true;
          if (node.children) node.children.forEach(traverse);
        }
      };
      treeData.forEach(traverse);
      setExpandedNodes(newExpanded);
    } else {
      // Collapse all
      const newExpanded: Record<string, boolean> = {};
      const traverse = (node: WarehouseStockNode) => {
        if (node.isGroup) {
          newExpanded[node.id] = false;
          if (node.children) node.children.forEach(traverse);
        }
      };
      treeData.forEach(traverse);
      setExpandedNodes(newExpanded);
    }
  };

  // Flatten rows based on expanded state and filters
  const flatRows = useMemo(() => {
    const rows: { node: WarehouseStockNode; index: number }[] = [];
    let currentIndex = 1;

    const traverse = (node: WarehouseStockNode, isVisible: boolean) => {
      if (isVisible) {
        const matchesWarehouse = warehouseSearch
          ? node.name.toLowerCase().includes(warehouseSearch.toLowerCase())
          : true;
        const matchesBalance = balanceSearch
          ? node.stockBalance.toLocaleString().includes(balanceSearch)
          : true;

        if (matchesWarehouse && matchesBalance) {
          rows.push({ node, index: currentIndex++ });
        }
      }

      if (node.children && node.children.length > 0) {
        const childrenVisible = isVisible && Boolean(expandedNodes[node.id]);
        node.children.forEach((child) => traverse(child, childrenVisible));
      }
    };

    treeData.forEach((root) => traverse(root, true));
    return rows;
  }, [treeData, expandedNodes, warehouseSearch, balanceSearch]);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-200">
      {/* Top Filter Controls (Matching Image 1) */}
      <div className="px-6 py-4 flex flex-wrap items-center gap-6 border-b border-slate-100 dark:border-[#1E1E22]">
        {/* Company filter */}
        <div className="relative">
          <input
            type="text"
            readOnly
            value={company}
            className="w-48 px-3.5 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-900 dark:text-zinc-100 font-normal outline-none shadow-none cursor-default"
          />
        </div>

        {/* Show Disabled Warehouses Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={showDisabledWarehouses}
            onChange={(e) => setShowDisabledWarehouses(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 focus:ring-offset-0 bg-white dark:bg-[#1E1E22] cursor-pointer"
          />
          <span>Show Disabled Warehouses</span>
        </label>
      </div>

      {/* Table Section */}
      <div className="px-6 py-4">
        <div className="w-full max-w-xl border border-slate-200 dark:border-[#27272A] rounded-md overflow-hidden bg-white dark:bg-[#18181B] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                {/* Column Headers */}
                <tr className="bg-slate-50/80 dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-300 border-b border-slate-200 dark:border-[#27272A] font-normal">
                  <th className="py-2 px-3 w-10 text-center font-normal text-slate-400"></th>
                  <th className="py-2 px-3 font-normal">Warehouse</th>
                  <th className="py-2 px-4 font-normal text-right">Stock Balance</th>
                </tr>

                {/* Inline Search Filter Row */}
                <tr className="bg-white dark:bg-[#18181B] border-b border-slate-200 dark:border-[#27272A]">
                  <th className="py-1 px-2"></th>
                  <th className="py-1 px-3">
                    <input
                      type="text"
                      value={warehouseSearch}
                      onChange={(e) => setWarehouseSearch(e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </th>
                  <th className="py-1 px-3">
                    <input
                      type="text"
                      value={balanceSearch}
                      onChange={(e) => setBalanceSearch(e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none text-right"
                    />
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
                {flatRows.map(({ node, index }) => {
                  const isExpanded = Boolean(expandedNodes[node.id]);
                  return (
                    <tr
                      key={node.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-[#222226] transition-colors"
                    >
                      {/* Row index number */}
                      <td className="py-2 px-3 text-slate-400 text-center select-none w-10">
                        {index}
                      </td>

                      {/* Warehouse Name with tree indentation & expand/collapse icon */}
                      <td className="py-2 px-3">
                        <div
                          className="flex items-center gap-1.5"
                          style={{ paddingLeft: `${node.level * 16}px` }}
                        >
                          {node.isGroup ? (
                            <button
                              type="button"
                              onClick={() => toggleNode(node.id)}
                              className="p-0.5 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </button>
                          ) : (
                            <span className="w-3.5" />
                          )}
                          <span
                            className={
                              node.isGroup
                                ? 'font-medium text-slate-900 dark:text-white cursor-pointer'
                                : 'text-slate-700 dark:text-zinc-300'
                            }
                            onClick={() => node.isGroup && toggleNode(node.id)}
                          >
                            {node.name}
                          </span>
                        </div>
                      </td>

                      {/* Stock Balance */}
                      <td
                        className={`py-2 px-4 text-right font-normal ${
                          node.stockBalance < 0
                            ? 'text-slate-800 dark:text-zinc-200'
                            : 'text-slate-800 dark:text-zinc-200'
                        }`}
                      >
                        {node.stockBalance < 0
                          ? `- ${formatNumber(Math.abs(node.stockBalance))}`
                          : formatNumber(node.stockBalance)}
                      </td>
                    </tr>
                  );
                })}

                {flatRows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-slate-400">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tree Level controls underneath table (Matching Image 1) */}
        <div className="flex items-center gap-2 mt-4 text-xs">
          <input
            type="number"
            min={1}
            max={5}
            value={levelInput}
            onChange={(e) => setLevelInput(e.target.value)}
            className="w-12 h-7 px-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#1E1E22] text-center text-slate-800 dark:text-zinc-200 outline-none"
          />
          <button
            type="button"
            onClick={handleSetLevel}
            className="h-7 px-3 bg-slate-100 dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-[#323238] text-slate-700 dark:text-zinc-200 rounded border border-slate-200 dark:border-transparent font-normal transition-colors"
          >
            Set Level
          </button>
          <button
            type="button"
            onClick={toggleCollapseAll}
            className="h-7 px-3 bg-slate-100 dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-[#323238] text-slate-700 dark:text-zinc-200 rounded border border-slate-200 dark:border-transparent font-normal transition-colors"
          >
            {isAllCollapsed ? 'Expand All' : 'Collapse All'}
          </button>
        </div>

        {/* Footer Notes (Matching Frappe Desk) */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 dark:text-[#71717A] mt-8 pt-4 border-t border-slate-100 dark:border-[#1E1E22]">
          <div>
            For comparison, use &gt;5, &lt;10 or =324. For ranges, use 5:10 (for values between 5 &amp; 10).
          </div>
          <div>Execution Time: 0.004729 sec</div>
        </div>
      </div>
    </div>
  );
};

