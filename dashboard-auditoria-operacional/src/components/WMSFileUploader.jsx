import { memo, useCallback, useState } from 'react';
import {
  AlertCircle, ChevronLeft, Database, PackageSearch, RefreshCw, Warehouse, X,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { parseExcelFileWMS } from '../utils/excel';

export const WMSFileUploader = memo(function WMSFileUploader({ onFileProcessed, isProcessing, onBack }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  }, []);

  const processFile = useCallback(async () => {
    if (!file) {
      setError('Seleccione el archivo WMS-42 para continuar');
      return;
    }
    try {
      const data = await parseExcelFileWMS(file);
      onFileProcessed(data);
    } catch (err) {
      setError(err.message);
    }
  }, [file, onFileProcessed]);

  const clearFile = useCallback((e) => {
    e.stopPropagation();
    setFile(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto pt-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver al inicio
        </button>

        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 text-sm font-medium mb-4">
              <Warehouse className="w-4 h-4" />
              Auditoría de Inventario WMS
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Importar desde WMS Copérnico</h2>
            <p className="text-slate-500">
              Cargue el reporte WMS-42 (Inventario por Ubicación)
            </p>
          </div>

          <div className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 mb-6
            ${file ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 hover:border-indigo-300 bg-slate-50/50'}
          `}>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {file ? (
              <div className="flex items-center justify-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Database className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-800">{file.name}</p>
                  <p className="text-sm text-slate-500">Archivo listo para procesar</p>
                </div>
                <button
                  onClick={clearFile}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors ml-4"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
                  <Database className="w-8 h-8 text-indigo-600" />
                </div>
                <p className="text-slate-700 font-medium mb-1">Cargar archivo WMS-42</p>
                <p className="text-slate-400 text-sm">Arrastre el archivo o haga clic para seleccionar</p>
                <p className="text-indigo-600 text-xs mt-3">Formatos soportados: .xlsx, .xls</p>
              </>
            )}
          </div>

          <div className="bg-indigo-50 rounded-xl p-4 mb-6 border border-indigo-100">
            <p className="text-slate-600 text-sm">
              <strong className="text-indigo-700">¿Cómo obtener el reporte?</strong><br />
              En WMS Copérnico: Reportes → WMS-42 → Inventario por Ubicación → Exportar Excel
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          <Button
            onClick={processFile}
            disabled={!file || isProcessing}
            variant="wms"
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Procesando inventario...
              </>
            ) : (
              <>
                <PackageSearch className="w-5 h-5" />
                Analizar Inventario
              </>
            )}
          </Button>
        </Card>
      </div>
    </div>
  );
});
