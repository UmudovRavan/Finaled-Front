import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useWarehouse } from '../context';

export const NewWarehousePage: React.FC = () => {
  const navigate = useNavigate();
  const { addWarehouse, warehouses } = useWarehouse();

  const [warehouseName, setWarehouseName] = useState('');
  const [company, setCompany] = useState('Avalon (Demo)');
  const [isRejectedWarehouse, setIsRejectedWarehouse] = useState(false);
  const [parentWarehouse, setParentWarehouse] = useState('');
  const [isGroupWarehouse, setIsGroupWarehouse] = useState(false);
  const [account, setAccount] = useState('');
  const [customer, setCustomer] = useState('');

  // Contact Info
  const [isContactOpen, setIsContactOpen] = useState(true);
  const [phoneNo, setPhoneNo] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [pin, setPin] = useState('');

  // Transit
  const [isTransitOpen, setIsTransitOpen] = useState(true);
  const [warehouseType, setWarehouseType] = useState('');
  const [defaultInTransitWarehouse, setDefaultInTransitWarehouse] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!warehouseName.trim()) {
      alert('Warehouse Name is required');
      return;
    }

    try {
      setIsSaving(true);
      const newRecord = await addWarehouse({
        warehouseName: warehouseName.trim(),
        company: company.trim() || 'Avalon (Demo)',
        isRejectedWarehouse,
        parentWarehouse: parentWarehouse.trim(),
        isGroupWarehouse,
        account: account.trim(),
        customer: customer.trim(),
        phoneNo: phoneNo.trim(),
        mobileNo: mobileNo.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        city: city.trim(),
        stateProvince: stateProvince.trim(),
        pin: pin.trim(),
        warehouseType: warehouseType.trim(),
        defaultInTransitWarehouse: defaultInTransitWarehouse.trim(),
        status: 'Enabled',
      });
      navigate(`/warehouse/${encodeURIComponent(newRecord.id)}`);
    } catch (err) {
      console.error('Failed to create warehouse', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-sans text-xs">
      <div className="bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] rounded-xl p-6 shadow-xs space-y-6">
        {/* Warehouse Detail Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
            Warehouse Detail
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Left Col - Warehouse Name */}
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                Warehouse Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={warehouseName}
                onChange={(e) => setWarehouseName(e.target.value)}
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                placeholder=""
                autoFocus
              />
            </div>
            <div className="hidden md:block" />

            {/* Left Col - Company */}
            <div className="space-y-4">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                  Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                />
              </div>

              <div>
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isRejectedWarehouse}
                    onChange={(e) => setIsRejectedWarehouse(e.target.checked)}
                    className="w-3.5 h-3.5 mt-0.5 rounded border-slate-300 dark:border-zinc-700 text-black dark:text-white focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="font-normal text-slate-700 dark:text-zinc-300">
                      Is Rejected Warehouse
                    </span>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                      If yes, then this warehouse will be used to store rejected materials
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                  Parent Warehouse
                </label>
                <input
                  type="text"
                  value={parentWarehouse}
                  onChange={(e) => setParentWarehouse(e.target.value)}
                  placeholder=""
                  list="parent-warehouses"
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                />
                <datalist id="parent-warehouses">
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isGroupWarehouse}
                    onChange={(e) => setIsGroupWarehouse(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-black dark:text-white focus:ring-0 cursor-pointer"
                  />
                  <span className="font-normal text-slate-700 dark:text-zinc-300">
                    Is Group Warehouse
                  </span>
                </label>
              </div>
            </div>

            {/* Right Col - Account & Customer */}
            <div className="space-y-4">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                  Account
                </label>
                <input
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                />
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                  If blank, parent Warehouse Account or company default will be considered in transactions
                </p>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                  Customer
                </label>
                <input
                  type="text"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                />
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                  Only to be used for Subcontracting Inward.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Warehouse Contact Info */}
        <div className="border-t border-slate-100 dark:border-[#27272A] pt-5">
          <button
            type="button"
            onClick={() => setIsContactOpen(!isContactOpen)}
            className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-colors text-sm mb-4"
          >
            <span>Warehouse Contact Info</span>
            {isContactOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isContactOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                    Phone No
                  </label>
                  <input
                    type="text"
                    value={phoneNo}
                    onChange={(e) => setPhoneNo(e.target.value)}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                    Mobile No
                  </label>
                  <input
                    type="text"
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                    State/Province
                  </label>
                  <input
                    type="text"
                    value={stateProvince}
                    onChange={(e) => setStateProvince(e.target.value)}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                    PIN
                  </label>
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section: Transit */}
        <div className="border-t border-slate-100 dark:border-[#27272A] pt-5">
          <button
            type="button"
            onClick={() => setIsTransitOpen(!isTransitOpen)}
            className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-colors text-sm mb-4"
          >
            <span>Transit</span>
            {isTransitOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isTransitOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                  Warehouse Type
                </label>
                <input
                  type="text"
                  value={warehouseType}
                  onChange={(e) => setWarehouseType(e.target.value)}
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                  Default In-Transit Warehouse
                </label>
                <input
                  type="text"
                  value={defaultInTransitWarehouse}
                  onChange={(e) => setDefaultInTransitWarehouse(e.target.value)}
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden button for Header trigger */}
      <button
        id="save-new-warehouse-btn"
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="hidden"
      >
        Save
      </button>
    </div>
  );
};

