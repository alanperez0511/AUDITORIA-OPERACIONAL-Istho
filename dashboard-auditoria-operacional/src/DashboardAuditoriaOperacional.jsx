import { lazy, Suspense, useCallback, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ModuleSelector } from './components/ModuleSelector';
import { CRMFileUploader } from './components/CRMFileUploader';
import { WMSFileUploader } from './components/WMSFileUploader';

const CRMDashboard = lazy(() => import('./modules/crm/CRMDashboard'));
const WMSDashboard = lazy(() => import('./modules/wms/WMSDashboard'));

const DashboardFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex items-center gap-3 text-slate-500">
      <RefreshCw className="w-5 h-5 animate-spin" />
      <span className="text-sm font-medium">Cargando dashboard...</span>
    </div>
  </div>
);

export default function CentroAuditoriaISTHO() {
  const [currentModule, setCurrentModule] = useState(null);   // null | 'crm' | 'wms'
  const [moduleState, setModuleState] = useState('selector'); // 'selector' | 'upload' | 'dashboard'
  const [isProcessing, setIsProcessing] = useState(false);
  const [crmData, setCrmData] = useState({ entradas: [], salidas: [] });
  const [wmsData, setWmsData] = useState([]);

  const handleSelectModule = useCallback((module) => {
    setCurrentModule(module);
    setModuleState('upload');
  }, []);

  const handleBackToSelector = useCallback(() => {
    setCurrentModule(null);
    setModuleState('selector');
  }, []);

  const handleCRMFilesProcessed = useCallback((data) => {
    setIsProcessing(true);
    setTimeout(() => {
      setCrmData(data);
      setModuleState('dashboard');
      setIsProcessing(false);
    }, 500);
  }, []);

  const handleWMSFileProcessed = useCallback((data) => {
    setIsProcessing(true);
    setTimeout(() => {
      setWmsData(data);
      setModuleState('dashboard');
      setIsProcessing(false);
    }, 500);
  }, []);

  const handleResetModule = useCallback(() => {
    if (currentModule === 'crm') setCrmData({ entradas: [], salidas: [] });
    else setWmsData([]);
    setModuleState('upload');
  }, [currentModule]);

  if (moduleState === 'selector') {
    return <ModuleSelector onSelectModule={handleSelectModule} />;
  }

  if (currentModule === 'crm') {
    if (moduleState === 'upload') {
      return (
        <CRMFileUploader
          onFilesProcessed={handleCRMFilesProcessed}
          isProcessing={isProcessing}
          onBack={handleBackToSelector}
        />
      );
    }
    return (
      <Suspense fallback={<DashboardFallback />}>
        <CRMDashboard data={crmData} onBack={handleBackToSelector} onReset={handleResetModule} />
      </Suspense>
    );
  }

  if (currentModule === 'wms') {
    if (moduleState === 'upload') {
      return (
        <WMSFileUploader
          onFileProcessed={handleWMSFileProcessed}
          isProcessing={isProcessing}
          onBack={handleBackToSelector}
        />
      );
    }
    return (
      <Suspense fallback={<DashboardFallback />}>
        <WMSDashboard data={wmsData} onBack={handleBackToSelector} onReset={handleResetModule} />
      </Suspense>
    );
  }

  return null;
}
