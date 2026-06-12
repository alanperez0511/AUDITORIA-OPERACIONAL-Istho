import { memo } from 'react';
import { Layers, ChevronRight, ClipboardList, Warehouse } from 'lucide-react';
import { Badge } from './ui/Badge';

export const ModuleSelector = memo(function ModuleSelector({ onSelectModule }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-orange-500/20 rounded-full text-orange-400 text-sm font-medium mb-6">
            <Layers className="w-4 h-4" />
            Sistema de Gestión Integral
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Centro de Auditoría
            <span className="text-orange-500"> Operacional</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            ISTHO S.A.S. - Control y seguimiento de operaciones logísticas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => onSelectModule('crm')}
            className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700 hover:border-teal-500/50 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-all" />
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20">
                <ClipboardList className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Auditoría de Cumplidos</h2>
              <p className="text-slate-400 mb-4">
                Control de evidencias y cierre de operaciones del CRM
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="entrada" size="sm">Entradas (CO/CR)</Badge>
                <Badge variant="salida" size="sm">Salidas (SA)</Badge>
              </div>
              <div className="mt-6 flex items-center text-teal-400 font-medium">
                Iniciar auditoría
                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelectModule('wms')}
            className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all" />
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                <Warehouse className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Auditoría de Inventario</h2>
              <p className="text-slate-400 mb-4">
                Control de ubicaciones WMS y pallets en RECIBO
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="wms" size="sm">WMS Copérnico</Badge>
                <Badge variant="danger" size="sm">Pallets en Limbo</Badge>
              </div>
              <div className="mt-6 flex items-center text-indigo-400 font-medium">
                Iniciar auditoría
                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-600 text-sm">
            ISTHO S.A.S. © {new Date().getFullYear()} - Coordinación de Tecnología
          </p>
        </div>
      </div>
    </div>
  );
});
