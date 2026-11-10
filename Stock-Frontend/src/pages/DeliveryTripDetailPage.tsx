import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useDeliveryTrip } from '../context';
import { DeliveryTripDetailSidebar } from '../components/delivery-trip';
import type { DeliveryTripRecord, DeliveryStopItem } from '../types';

export const DeliveryTripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { trips, updateTrip, toggleLike } = useDeliveryTrip();

  const decodedId = decodeURIComponent(id || '');
  const currentTrip = trips.find((t) => t.id.toLowerCase() === decodedId.toLowerCase());

  const [formData, setFormData] = useState<Partial<DeliveryTripRecord>>({});
  const [stops, setStops] = useState<DeliveryStopItem[]>([]);
  const [selectedStopIndices, setSelectedStopIndices] = useState<number[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isActivityOpen, setIsActivityOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentTrip) {
      setFormData(currentTrip);
      setStops(currentTrip.deliveryStops || []);
    }
  }, [currentTrip]);

  if (!currentTrip) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
        Delivery Trip not found.
      </div>
    );
  }

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
    try {
      setIsSaving(true);
      await updateTrip(currentTrip.id, {
        ...formData,
        deliveryStops: stops,
      });
    } catch (err) {
      console.error('Failed to update Delivery Trip', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-16 font-sans text-xs">
      {/* Hidden button for Header Save click delegation */}
      <button
        type="button"
        id="save-delivery-trip-detail-btn"
        className="hidden"
        onClick={() => handleSave()}
      >
        Save
      </button>

      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Main Content Area */}
        <div className="flex-1 w-full space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Main Form Box */}
            <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-6 shadow-xs space-y-6">
              {/* Top Row: Series / Initial Email / Company */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                      Series
                    </label>
                    <input
                      type="text"
                      value={formData.series ?? ''}
                      onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                      className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
                    />
                  </div>

                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.initialEmailNotificationSent ?? false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            initialEmailNotificationSent: e.target.checked,
                          })
                        }
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
                    value={formData.company ?? ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
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
                        value={formData.driver ?? ''}
                        onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                        className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                        Vehicle <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.vehicle ?? ''}
                        onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                        className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
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
                        value={formData.driverAddress ?? ''}
                        onChange={(e) =>
                          setFormData({ ...formData, driverAddress: e.target.value })
                        }
                        className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                        Departure Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.departureTime ?? ''}
                        onChange={(e) =>
                          setFormData({ ...formData, departureTime: e.target.value })
                        }
                        placeholder="YYYY-MM-DD HH:MM"
                        className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
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
                              checked={
                                stops.length > 0 && selectedStopIndices.length === stops.length
                              }
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
                      <tbody className="divide-y divide-slate-100 dark:divide-[#27272A] bg-white dark:bg-[#18181B]">
                        {stops.map((stop, idx) => (
                          <tr
                            key={stop.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-[#202024]/50 transition-colors"
                          >
                            <td className="py-2 px-3">
                              <input
                                type="checkbox"
                                checked={selectedStopIndices.includes(idx)}
                                onChange={() => toggleSelectStop(idx)}
                                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 accent-black dark:accent-white"
                              />
                            </td>
                            <td className="py-2 px-3 text-slate-500 dark:text-zinc-400">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={stop.customer}
                                onChange={(e) =>
                                  handleUpdateStop(idx, 'customer', e.target.value)
                                }
                                placeholder=""
                                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-2 py-1 rounded border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={stop.addressName}
                                onChange={(e) =>
                                  handleUpdateStop(idx, 'addressName', e.target.value)
                                }
                                placeholder=""
                                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-2 py-1 rounded border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none"
                              />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={stop.locked}
                                onChange={(e) =>
                                  handleUpdateStop(idx, 'locked', e.target.checked)
                                }
                                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 accent-black dark:accent-white"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={stop.deliveryNote}
                                onChange={(e) =>
                                  handleUpdateStop(idx, 'deliveryNote', e.target.value)
                                }
                                placeholder=""
                                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-2 py-1 rounded border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none"
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
                                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-2 py-1 rounded border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none"
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

          {/* Add a comment section */}
          <div className="space-y-4 pt-4">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Add a comment
            </h4>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] flex items-center justify-center font-medium text-slate-600 dark:text-zinc-300 shrink-0 text-xs">
                A
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Type a reply / comment"
                  rows={3}
                  className="w-full bg-[#F4F5F7] dark:bg-[#18181B] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-xs p-3 rounded-lg border border-slate-200/80 dark:border-[#27272A] focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all resize-y"
                />
                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={() => setCommentText('')}
                    className="px-3 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-medium rounded-md text-xs hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-[#27272A]">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsActivityOpen(!isActivityOpen)}
                className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200 text-xs hover:text-slate-600 dark:hover:text-zinc-400 transition-colors"
              >
                <span>Activity</span>
                {isActivityOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                className="flex items-center gap-1 px-2.5 py-1 bg-[#F4F5F7] dark:bg-[#202024] text-slate-700 dark:text-zinc-300 rounded-md hover:bg-slate-200 dark:hover:bg-[#27272A] transition-colors text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Email</span>
              </button>
            </div>

            {isActivityOpen && (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200 dark:before:bg-[#27272A]">
                <div className="relative flex items-center gap-2">
                  <div className="absolute -left-6 w-4 h-4 rounded-full bg-slate-100 dark:bg-[#202024] border border-slate-300 dark:border-zinc-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  </div>
                  <span className="text-slate-700 dark:text-zinc-300 font-medium text-xs">
                    You created this
                  </span>
                  <span className="text-slate-400 dark:text-zinc-500 text-[11px]">
                    · {currentTrip.createdOn || 'just now'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Component */}
        <DeliveryTripDetailSidebar
          trip={currentTrip}
          onToggleLike={() => toggleLike(currentTrip.id)}
        />
      </div>
    </div>
  );
};

