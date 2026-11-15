import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useWarehouse } from '../context';
import { WarehouseDetailSidebar } from '../components/warehouse/WarehouseDetailSidebar';
import { DocumentCommentsActivity } from '../components/common';
import type { WarehouseRecord } from '../types';

export const WarehouseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { warehouses, updateWarehouse, toggleLike } = useWarehouse();

  const decodedId = decodeURIComponent(id || '');
  const currentWarehouse = warehouses.find(
    (w) =>
      w.id.toLowerCase() === decodedId.toLowerCase() ||
      w.warehouseName.toLowerCase() === decodedId.toLowerCase()
  );

  const [formData, setFormData] = useState<Partial<WarehouseRecord>>({});
  const [isContactOpen, setIsContactOpen] = useState(true);
  const [isTransitOpen, setIsTransitOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    if (currentWarehouse) {
      setFormData(currentWarehouse);
    }
  }, [currentWarehouse]);

  if (!currentWarehouse) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
        Warehouse not found.
      </div>
    );
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateWarehouse(currentWarehouse.id, formData);
    } catch (err) {
      console.error('Failed to update warehouse', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-16 font-sans text-xs">
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Left / Main Column */}
        <div className="flex-1 w-full space-y-6">
          <div className="bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] rounded-xl p-6 shadow-xs space-y-6">
            {/* Top Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                  Warehouse Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.warehouseName ?? ''}
                  onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })}
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                />
              </div>
              <div className="hidden md:block" />

              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.company ?? 'Avalon (Demo)'}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isRejectedWarehouse)}
                      onChange={(e) =>
                        setFormData({ ...formData, isRejectedWarehouse: e.target.checked })
                      }
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
                    value={formData.parentWarehouse ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, parentWarehouse: e.target.value })
                    }
                    list="detail-parent-warehouses"
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                  <datalist id="detail-parent-warehouses">
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.warehouseName} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isGroupWarehouse)}
                      onChange={(e) =>
                        setFormData({ ...formData, isGroupWarehouse: e.target.checked })
                      }
                      className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-black dark:text-white focus:ring-0 cursor-pointer"
                    />
                    <span className="font-normal text-slate-700 dark:text-zinc-300">
                      Is Group Warehouse
                    </span>
                  </label>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                    Account
                  </label>
                  <input
                    type="text"
                    value={formData.account ?? ''}
                    onChange={(e) => setFormData({ ...formData, account: e.target.value })}
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
                    value={formData.customer ?? ''}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    Only to be used for Subcontracting Inward.
                  </p>
                </div>
              </div>
            </div>

            {/* Section: Address and Contact */}
            <div className="border-t border-slate-100 dark:border-[#27272A] pt-5 space-y-3">
              <h3 className="font-semibold text-slate-800 dark:text-zinc-200 text-sm">
                Address and Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsContactOpen(true);
                      setIsAddressModalOpen(!isAddressModalOpen);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#F4F5F7] dark:bg-[#202024] hover:bg-slate-200 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 font-medium text-xs transition-colors"
                  >
                    {formData.addressLine1 || formData.city ? 'Edit Address' : 'New Address'}
                  </button>
                  {formData.addressLine1 || formData.city || formData.stateProvince || formData.pin ? (
                    <div className="text-slate-600 dark:text-zinc-300 text-xs space-y-0.5 pt-1">
                      {formData.addressLine1 && <p>{formData.addressLine1}</p>}
                      {formData.addressLine2 && <p>{formData.addressLine2}</p>}
                      <p>{[formData.city, formData.stateProvince, formData.pin].filter(Boolean).join(', ')}</p>
                    </div>
                  ) : (
                    <p className="text-slate-400 dark:text-zinc-500 text-xs">
                      No address added yet.
                    </p>
                  )}
                  {isAddressModalOpen && (
                    <div className="mt-2 p-3 rounded-lg border border-slate-200 dark:border-[#27272A] bg-[#FAFBFD] dark:bg-[#1E1E22] space-y-2">
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        value={formData.addressLine1 ?? ''}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                        className="w-full bg-white dark:bg-[#151518] text-slate-800 dark:text-zinc-200 px-2.5 py-1.5 rounded border border-slate-200 dark:border-zinc-700 text-xs outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 2"
                        value={formData.addressLine2 ?? ''}
                        onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                        className="w-full bg-white dark:bg-[#151518] text-slate-800 dark:text-zinc-200 px-2.5 py-1.5 rounded border border-slate-200 dark:border-zinc-700 text-xs outline-none"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={formData.city ?? ''}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full bg-white dark:bg-[#151518] text-slate-800 dark:text-zinc-200 px-2.5 py-1.5 rounded border border-slate-200 dark:border-zinc-700 text-xs outline-none"
                        />
                        <input
                          type="text"
                          placeholder="State / Province"
                          value={formData.stateProvince ?? ''}
                          onChange={(e) => setFormData({ ...formData, stateProvince: e.target.value })}
                          className="w-full bg-white dark:bg-[#151518] text-slate-800 dark:text-zinc-200 px-2.5 py-1.5 rounded border border-slate-200 dark:border-zinc-700 text-xs outline-none"
                        />
                        <input
                          type="text"
                          placeholder="PIN"
                          value={formData.pin ?? ''}
                          onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                          className="w-full bg-white dark:bg-[#151518] text-slate-800 dark:text-zinc-200 px-2.5 py-1.5 rounded border border-slate-200 dark:border-zinc-700 text-xs outline-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            await updateWarehouse(currentWarehouse.id, formData);
                            setIsAddressModalOpen(false);
                          }}
                          className="px-3 py-1 rounded bg-black dark:bg-white text-white dark:text-black text-[11px] font-medium"
                        >
                          Save Address
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsContactOpen(true);
                      setIsContactModalOpen(!isContactModalOpen);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#F4F5F7] dark:bg-[#202024] hover:bg-slate-200 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 font-medium text-xs transition-colors"
                  >
                    {formData.phoneNo || formData.mobileNo ? 'Edit Contact' : 'New Contact'}
                  </button>
                  {formData.phoneNo || formData.mobileNo ? (
                    <div className="text-slate-600 dark:text-zinc-300 text-xs space-y-0.5 pt-1">
                      {formData.phoneNo && <p>Phone: {formData.phoneNo}</p>}
                      {formData.mobileNo && <p>Mobile: {formData.mobileNo}</p>}
                    </div>
                  ) : (
                    <p className="text-slate-400 dark:text-zinc-500 text-xs">
                      No contacts added yet.
                    </p>
                  )}
                  {isContactModalOpen && (
                    <div className="mt-2 p-3 rounded-lg border border-slate-200 dark:border-[#27272A] bg-[#FAFBFD] dark:bg-[#1E1E22] space-y-2">
                      <input
                        type="text"
                        placeholder="Phone No"
                        value={formData.phoneNo ?? ''}
                        onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
                        className="w-full bg-white dark:bg-[#151518] text-slate-800 dark:text-zinc-200 px-2.5 py-1.5 rounded border border-slate-200 dark:border-zinc-700 text-xs outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Mobile No"
                        value={formData.mobileNo ?? ''}
                        onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                        className="w-full bg-white dark:bg-[#151518] text-slate-800 dark:text-zinc-200 px-2.5 py-1.5 rounded border border-slate-200 dark:border-zinc-700 text-xs outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            await updateWarehouse(currentWarehouse.id, formData);
                            setIsContactModalOpen(false);
                          }}
                          className="px-3 py-1 rounded bg-black dark:bg-white text-white dark:text-black text-[11px] font-medium"
                        >
                          Save Contact
                        </button>
                      </div>
                    </div>
                  )}
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
                        value={formData.phoneNo ?? ''}
                        onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
                        className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                        Mobile No
                      </label>
                      <input
                        type="text"
                        value={formData.mobileNo ?? ''}
                        onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
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
                        value={formData.addressLine1 ?? ''}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                        className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={formData.addressLine2 ?? ''}
                        onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                        className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city ?? ''}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                        State/Province
                      </label>
                      <input
                        type="text"
                        value={formData.stateProvince ?? ''}
                        onChange={(e) =>
                          setFormData({ ...formData, stateProvince: e.target.value })
                        }
                        className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                        PIN
                      </label>
                      <input
                        type="text"
                        value={formData.pin ?? ''}
                        onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
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
                      value={formData.warehouseType ?? ''}
                      onChange={(e) =>
                        setFormData({ ...formData, warehouseType: e.target.value })
                      }
                      className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                      Default In-Transit Warehouse
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      list="detail-in-transit-warehouses"
                      value={formData.defaultInTransitWarehouse ?? ''}
                      onChange={(e) =>
                        setFormData({ ...formData, defaultInTransitWarehouse: e.target.value })
                      }
                      className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                    />
                    <datalist id="detail-in-transit-warehouses">
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.warehouseName} />
                      ))}
                    </datalist>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DocumentCommentsActivity docType="Warehouse" docId={currentWarehouse.id} />
        </div>

        {/* Right Sidebar */}
        <WarehouseDetailSidebar
          warehouse={currentWarehouse}
          onToggleLike={() => toggleLike(currentWarehouse.id)}
        />
      </div>

      {/* Hidden button for Header trigger */}
      <button
        id="save-warehouse-detail-btn"
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

