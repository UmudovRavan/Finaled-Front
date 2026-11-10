import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useDeliveryTrip } from '../context';
import type { DeliveryStopItem, DeliveryTripStatus } from '../types';

export const NewDeliveryTripPage: React.FC = () => {
  const navigate = useNavigate();
  const { addTrip } = useDeliveryTrip();

  const [series, setSeries] = useState('MAT-DT-.YYYY.-');
  const [company, setCompany] = useState('Avalon (Demo)');
  const [initialEmailSent, setInitialEmailSent] = useState(false);
  const [driver, setDriver] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [driverAddress, setDriverAddress] = useState('');
  const [departureTime, setDepartureTime] = useState(
    new Date().toISOString().slice(0, 16).replace('T', ' ')
  );
  const [status] = useState<DeliveryTripStatus>('Draft');

  const [stops, setStops] = useState<DeliveryStopItem[]>([
    {
      id: 'stop-1',
      customer: '',
      addressName: '',
      locked: false,
      deliveryNote: '',
      estimatedArrival: '',
    },
  ]);
  const [selectedStopIndices, setSelectedStopIndices] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddStop = () => {
    setStops((prev) => [
      ...prev,
      {
        id: `stop-${Date.now()}-${prev.length + 1}`,
        customer: '',
        addressName: '',
        locked: false,
        deliveryNote: '',
        estimatedArrival: '',
      },
    ]);
  };

  const handleRemoveSelectedStops = () => {
    setStops((prev) => prev.filter((_, idx) => !selectedStopIndices.includes(idx)));
    setSelectedStopIndices([]);
  };

  const handleUpdateStop = (index: number, field: keyof DeliveryStopItem, value: any) => {
    setStops((prev) =>
      prev.map((stop, idx) => (idx === index ? { ...stop, [field]: value } : stop))
    );
  };

  const toggleSelectStop = (index: number) => {
    setSelectedStopIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleSelectAllStops = () => {
    if (selectedStopIndices.length === stops.length) {
      setSelectedStopIndices([]);
    } else {
      setSelectedStopIndices(stops.map((_, idx) => idx));
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!vehicle.trim()) {
      alert('Please enter a Vehicle');
      return;
    }

    try {
      setIsSaving(true);
      const created = await addTrip({
        series,
        company,
        initialEmailNotificationSent: initialEmailSent,
        driver: driver.trim(),
        vehicle: vehicle.trim(),
        driverAddress: driverAddress.trim(),
        departureTime: departureTime.trim(),
        status,
        deliveryStops: stops.filter((s) => s.addressName || s.customer || s.deliveryNote),
      });
      navigate(`/delivery-trip/${encodeURIComponent(created.id)}`);
    } catch (err) {
      console.error('Failed to create Delivery Trip', err);
      alert('Failed to create Delivery Trip');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="font-sans text-xs pb-16">
      {/* Hidden button for Header Save click delegation */}
      <button
        type="button"
        id="save-delivery-trip-btn"
        className="hidden"
        onClick={() => handleSave()}
      >
        Save
      </button>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Main Card */}
        <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-6 shadow-xs space-y-6">
          {/* Top Row: Series / Initial Email / Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                  Series
                </label>
                <input
                  type="text"
                  value={series}
                  onChange={(e) => setSeries(e.target.value)}
                  className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={initialEmailSent}
                    onChange={(e) => setInitialEmailSent(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer accent-black dark:accent-white"
                  />
                  <span className="text-slate-700 dark:text-zinc-300 text-xs">
                    Initial Email Notification Sent
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                Company <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
              />
            </div>
          </div>

          <hr className="border-slate-100 dark:border-[#27272A]" />

          {/* Section: Delivery Details */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mb-4">
              Delivery Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                    Driver
                  </label>
                  <input
                    type="text"
                    value={driver}
                    onChange={(e) => setDriver(e.target.value)}
                    placeholder=""
                    className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                    Vehicle <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    placeholder=""
                    className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                    Driver Address
                  </label>
                  <input
                    type="text"
                    value={driverAddress}
                    onChange={(e) => setDriverAddress(e.target.value)}
                    placeholder=""
                    className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                    Departure Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    placeholder="YYYY-MM-DD HH:MM"
                    className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">Asia/Baku</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-[#27272A]" />

          {/* Section: Delivery Stops */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                Delivery Stops
              </h3>
              {selectedStopIndices.length > 0 && (
                <button
                  type="button"
                  onClick={handleRemoveSelectedStops}
                  className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete selected ({selectedStopIndices.length})</span>
                </button>
              )}
            </div>

            <div className="border border-slate-200 dark:border-[#27272A] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FA] dark:bg-[#1A1A1E] text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-[#27272A]">
                      <th className="py-2.5 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={stops.length > 0 && selectedStopIndices.length === stops.length}
                          onChange={toggleSelectAllStops}
                          className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 accent-black dark:accent-white"
                        />
                      </th>
                      <th className="py-2.5 px-3 w-12 font-medium">No.</th>
                      <th className="py-2.5 px-3 font-medium">Customer</th>
                      <th className="py-2.5 px-3 font-medium">
                        Address Name <span className="text-red-500">*</span>
                      </th>
                      <th className="py-2.5 px-3 w-16 font-medium text-center">Locked</th>
                      <th className="py-2.5 px-3 font-medium">Delivery Note</th>
                      <th className="py-2.5 px-3 font-medium">Estimated Arrival</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#27272A] bg-white dark:bg-[#151518]">
                    {stops.map((stop, idx) => (
                      <tr
                        key={stop.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-[#1E1E22]/50 transition-colors"
                      >
                        <td className="py-2 px-3">
                          <input
                            type="checkbox"
                            checked={selectedStopIndices.includes(idx)}
                            onChange={() => toggleSelectStop(idx)}
                            className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 accent-black dark:accent-white"
                          />
                        </td>
                        <td className="py-2 px-3 text-slate-500 dark:text-zinc-400">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={stop.customer}
                            onChange={(e) => handleUpdateStop(idx, 'customer', e.target.value)}
                            placeholder=""
                            className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-2 py-1 rounded border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={stop.addressName}
                            onChange={(e) => handleUpdateStop(idx, 'addressName', e.target.value)}
                            placeholder=""
                            className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-2 py-1 rounded border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={stop.locked}
                            onChange={(e) => handleUpdateStop(idx, 'locked', e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 accent-black dark:accent-white"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={stop.deliveryNote}
                            onChange={(e) => handleUpdateStop(idx, 'deliveryNote', e.target.value)}
                            placeholder=""
                            className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-2 py-1 rounded border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={stop.estimatedArrival}
                            onChange={(e) =>
                              handleUpdateStop(idx, 'estimatedArrival', e.target.value)
                            }
                            placeholder=""
                            className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-2 py-1 rounded border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add row button */}
              <div className="p-2 bg-[#FAFBFB] dark:bg-[#18181B] border-t border-slate-200 dark:border-[#27272A]">
                <button
                  type="button"
                  onClick={handleAddStop}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-slate-200 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 text-xs rounded-md transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add row</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

