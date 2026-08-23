import React, { useState, useEffect } from 'react';
import { wellKnownApi } from '../api/wellKnownApi';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const SecurityJwksPage: React.FC = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [jwksData, setJwksData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJwks = async () => {
      setLoading(true);
      try {
        const data = await wellKnownApi.getJwks();
        setJwksData(data);
      } catch (err: any) {
        showToast('error', err.message || 'JWKS loading error', 'Error');
      } finally {
        setLoading(false);
      }
    };
    fetchJwks();
  }, [showToast]);

  const handleCopyJwks = () => {
    if (!jwksData) return;
    navigator.clipboard.writeText(JSON.stringify(jwksData, null, 2));
    showToast('success', t('common.copied', {}, 'JWKS JSON kopyalandı!'), 'Copied');
  };

  return (
    <div className="max-w-[1280px] mx-auto w-full space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{t('security.title', {}, 'Security & JWKS Endpoint')}</h2>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            {t('security.subtitle', {}, 'RS256 Asimmetrik Kriptoqrafiya və Xarici Mikroservislər üçün Public Keys.')}
          </p>
        </div>
        <button
          onClick={handleCopyJwks}
          disabled={!jwksData}
          className="btn-primary h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-fuchsia-500/20"
        >
          <span className="material-symbols-outlined text-[18px]">content_copy</span>
          {t('common.copy', {}, 'Copy')} JWKS JSON
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Crypto Specs */}
        <div className="space-y-6">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 shadow-lg shadow-black/20 space-y-4">
            <h3 className="text-xs font-bold text-white border-b border-[#27272A] pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#D946EF] text-base">key</span>
              {t('security.title', {}, 'Kriptoqrafik Parametrlər')}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-[#71717A]">{t('security.algorithm', {}, 'İmzalanma Alqoritmi')}:</span>
                <span className="font-mono font-bold text-[#D946EF]">RS256 (Asymmetric)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#71717A]">{t('security.publicKey', {}, 'Açar Uzunluğu')}:</span>
                <span className="font-mono font-bold text-white">2048-bit RSA</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#71717A]">{t('security.tokenExpiry', {}, 'Access Token Ömrü')}:</span>
                <span className="text-white">15 min</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#71717A]">{t('security.jwksUrl', {}, 'Açıq Endpoint')}:</span>
                <span className="font-mono text-emerald-400">/.well-known/jwks.json</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live JWKS Payload */}
        <div className="lg:col-span-2">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden shadow-lg shadow-black/20 flex flex-col h-full">
            <div className="p-4 border-b border-[#27272A] bg-[#141416] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-bold text-white font-mono">Live JWKS Response</span>
              </div>
              <span className="text-[10px] text-[#71717A] font-mono">GET /.well-known/jwks.json</span>
            </div>

            <div className="p-4 flex-1 bg-[#121214] overflow-auto max-h-[500px]">
              {loading ? (
                <div className="text-center py-12 text-[#A1A1AA] text-xs">
                  <span className="material-symbols-outlined animate-spin text-lg block mb-2">progress_activity</span>
                  {t('common.loading', {}, 'JWKS açarları yüklənir...')}
                </div>
              ) : jwksData ? (
                <pre className="font-mono text-xs text-emerald-400 leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(jwksData, null, 2)}
                </pre>
              ) : (
                <div className="text-center py-12 text-[#71717A] text-xs">
                  {t('common.none', {}, 'Açarları əldə etmək mümkün olmadı.')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityJwksPage;
