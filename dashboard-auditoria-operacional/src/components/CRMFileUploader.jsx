import { memo, useCallback, useState } from 'react';
import {
  AlertCircle, ArrowDownToLine, ArrowUpFromLine, CheckCircle2,
  ChevronLeft, ClipboardList, RefreshCw, TrendingUp, X,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { detectarTipoArchivoCRM, parseExcelFileCRM } from '../utils/excel';

const FileDropZone = memo(function FileDropZone({
  tipo, icon: Icon, label, descripcion, file, color, status, onFileChange, onRemove,
}) {
  return (
    <div className={`
      relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300
      ${file && status === 'valid'
        ? 'border-emerald-300 bg-emerald-50/50'
        : file && status === 'invalid'
          ? 'border-red-300 bg-red-50/50'
          : 'border-gray-200 hover:border-gray-300'
      }
    `}>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => onFileChange(e, tipo)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      {file ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${status === 'valid' ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {status === 'valid' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-700 text-sm">{file.name}</p>
              <p className={`text-xs ${status === 'valid' ? 'text-emerald-600' : 'text-red-500'}`}>
                {status === 'valid' ? '✓ Archivo válido' : '✗ Archivo inválido'}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(tipo); }}
            className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      ) : (
        <>
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${color === 'teal' ? 'bg-teal-100' : 'bg-orange-100'}`}>
            <Icon className={`w-6 h-6 ${color === 'teal' ? 'text-teal-600' : 'text-orange-500'}`} />
          </div>
          <p className="text-sm text-slate-600 font-medium">{label}</p>
          <p className="text-xs text-slate-400 mt-1">{descripcion}</p>
          <p className="text-xs text-slate-300 mt-2">Arrastre o haga clic para cargar</p>
        </>
      )}
    </div>
  );
});

export const CRMFileUploader = memo(function CRMFileUploader({ onFilesProcessed, isProcessing, onBack }) {
  const [files, setFiles] = useState({ entradas: null, salidas: null });
  const [fileStatus, setFileStatus] = useState({ entradas: null, salidas: null });
  const [errors, setErrors] = useState([]);

  const handleInputChange = useCallback(async (e, tipoEsperado) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrors([]);

    try {
      const resultado = await detectarTipoArchivoCRM(file);

      if (resultado.error) {
        setErrors([resultado.error]);
        return;
      }

      const tipoDetectado = resultado.tipo;
      const tipoEsperadoNorm = tipoEsperado === 'entradas' ? 'entrada' : 'salida';

      if (tipoDetectado !== tipoEsperadoNorm) {
        const tipoNombre = tipoDetectado === 'entrada' ? 'ENTRADAS' : 'SALIDAS';
        const esperadoNombre = tipoEsperado === 'entradas' ? 'ENTRADAS' : 'SALIDAS';
        setErrors([`⚠️ El archivo "${file.name}" es de ${tipoNombre}, pero lo está cargando en la zona de ${esperadoNombre}. Por favor, cárguelo en la zona correcta.`]);
        return;
      }

      setFiles((prev) => ({ ...prev, [tipoEsperado]: file }));
      setFileStatus((prev) => ({ ...prev, [tipoEsperado]: 'valid' }));
    } catch (error) {
      setErrors([error.message]);
    }
  }, []);

  const removeFile = useCallback((tipo) => {
    setFiles((prev) => ({ ...prev, [tipo]: null }));
    setFileStatus((prev) => ({ ...prev, [tipo]: null }));
    setErrors([]);
  }, []);

  const processFiles = useCallback(async () => {
    if (!files.salidas && !files.entradas) {
      setErrors(['Cargue al menos un archivo para continuar']);
      return;
    }

    try {
      const allData = { entradas: [], salidas: [] };

      if (files.entradas) allData.entradas = await parseExcelFileCRM(files.entradas, 'entrada');
      if (files.salidas) allData.salidas = await parseExcelFileCRM(files.salidas, 'salida');

      allData.tiposCargados = {
        soloEntradas: files.entradas && !files.salidas,
        soloSalidas: files.salidas && !files.entradas,
        ambos: files.entradas && files.salidas,
      };

      onFilesProcessed(allData);
    } catch (error) {
      setErrors([error.message]);
    }
  }, [files, onFilesProcessed]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100 p-6">
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 rounded-full text-teal-700 text-sm font-medium mb-4">
              <ClipboardList className="w-4 h-4" />
              Auditoría de Cumplidos CRM
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Cargar Archivos del CRM</h2>
            <p className="text-slate-500">
              Suba los reportes de entradas y/o salidas exportados desde el sistema
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Validación automática de archivos</p>
                <p className="text-blue-600">El sistema detecta automáticamente si el archivo corresponde a entradas o salidas. Si carga un archivo en la zona incorrecta, se le notificará.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <FileDropZone
              tipo="entradas"
              icon={ArrowDownToLine}
              label="Entradas (CO, CR)"
              descripcion="Recepciones y Kardex"
              file={files.entradas}
              color="teal"
              status={fileStatus.entradas}
              onFileChange={handleInputChange}
              onRemove={removeFile}
            />
            <FileDropZone
              tipo="salidas"
              icon={ArrowUpFromLine}
              label="Salidas (SA)"
              descripcion="Pickings y Despachos"
              file={files.salidas}
              color="orange"
              status={fileStatus.salidas}
              onFileChange={handleInputChange}
              onRemove={removeFile}
            />
          </div>

          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              {errors.map((error, i) => (
                <p key={i} className="text-sm text-red-600 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </p>
              ))}
            </div>
          )}

          {(files.entradas || files.salidas) && !errors.length && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">
                  {files.entradas && files.salidas
                    ? 'Ambos archivos listos para procesar'
                    : files.entradas
                      ? 'Archivo de entradas listo (se generará dashboard solo de entradas)'
                      : 'Archivo de salidas listo (se generará dashboard solo de salidas)'}
                </span>
              </div>
            </div>
          )}

          <Button
            onClick={processFiles}
            disabled={(!files.salidas && !files.entradas) || isProcessing || errors.length > 0}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Procesando archivos...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5" />
                Generar Dashboard
              </>
            )}
          </Button>

          <p className="text-center text-xs text-slate-400 mt-4">
            Puede cargar solo un archivo si lo desea. El dashboard se adaptará automáticamente.
          </p>
        </Card>
      </div>
    </div>
  );
});
