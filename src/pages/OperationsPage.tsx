import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Building2, 
  Clock, 
  Edit3, 
  Trash2,
  Calendar,
  Globe,
  Info,
  Copy
} from 'lucide-react';
import { Operation, OperationType } from '../types';
import { useApp } from '../contexts/AppContext';
import { LoadingOverlay, useConfirmDialog } from '../components/ui';

const OperationsPage: React.FC = () => {
  const { state, dispatch, saveOperation, updateOperation, deleteOperation, duplicateOperation } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateOperation = () => {
    setEditingOperation(null);
    setShowCreateForm(true);
  };

  const handleEditOperation = (operation: Operation) => {
    setEditingOperation(operation);
    setShowCreateForm(true);
  };

  const handleDeleteOperation = async (operationId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta operação? Todos os forecasts relacionados serão perdidos.')) {
      setIsLoading(true);
      try {
        await deleteOperation(operationId);
      } catch (error) {
        console.error('Error deleting operation:', error);
        alert('Erro ao excluir operação. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectOperation = (operationId: string) => {
    dispatch({ type: 'SET_CURRENT_OPERATION', payload: operationId });
  };

  const handleDuplicateOperation = async (operation: Operation) => {
    if (window.confirm(`Tem certeza que deseja duplicar a operação "${operation.name}"? Todos os forecasts e cenários relacionados também serão duplicados.`)) {
      setIsLoading(true);
      try {
        const duplicatedOperation = await duplicateOperation(operation.id);
        alert(`Operação duplicada com sucesso! Nova operação: "${duplicatedOperation.name}"`);
      } catch (error) {
        console.error('Error duplicating operation:', error);
        alert('Erro ao duplicar operação. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <LoadingOverlay isLoading={isLoading} message="Salvando operação...">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Operações
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure e gerencie suas operações de call center
          </p>
        </div>

        <motion.button
          onClick={handleCreateOperation}
          className="btn-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Operação
        </motion.button>
      </div>

      {/* Operations List */}
      {state.operations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center py-12"
        >
          <Building2 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma operação configurada
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Comece criando sua primeira operação para configurar horários, 
            parâmetros e realizar cálculos de dimensionamento.
          </p>
          <motion.button
            onClick={handleCreateOperation}
            className="btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Operação
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.operations.map((operation, index) => (
            <OperationCard
              key={operation.id}
              operation={operation}
              isSelected={state.config.currentOperation === operation.id}
              onSelect={() => handleSelectOperation(operation.id)}
              onEdit={() => handleEditOperation(operation)}
              onDelete={() => handleDeleteOperation(operation.id)}
              onDuplicate={() => handleDuplicateOperation(operation)}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <OperationFormModal
          operation={editingOperation}
          onClose={() => setShowCreateForm(false)}
          onSave={async (operation) => {
            setIsLoading(true);
            try {
              if (editingOperation) {
                await updateOperation(operation);
              } else {
                await saveOperation(operation);
                // Auto-select new operation
                dispatch({ type: 'SET_CURRENT_OPERATION', payload: operation.id });
              }
              setShowCreateForm(false);
            } catch (error) {
              console.error('Error saving operation:', error);
              alert('Erro ao salvar operação. Tente novamente.');
            } finally {
              setIsLoading(false);
            }
          }}
        />
      )}
      </div>
    </LoadingOverlay>
  );
};

// Operation Card Component
interface OperationCardProps {
  operation: Operation;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  index: number;
}

const OperationCard: React.FC<OperationCardProps> = ({
  operation,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  index
}) => {
  const { getOperationForecasts, getOperationScenarios } = useApp();
  
  const forecasts = getOperationForecasts(operation.id);
  const scenarios = getOperationScenarios(operation.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`card cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' 
          : 'hover:shadow-lg'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isSelected 
              ? 'bg-primary-100 dark:bg-primary-800' 
              : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            {operation.type === '24h' ? (
              <Globe className={`w-5 h-5 ${
                isSelected 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`} />
            ) : (
              <Clock className={`w-5 h-5 ${
                isSelected 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`} />
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {operation.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {operation.type === '24h' 
                ? '24 horas' 
                : `${operation.startTime} - ${operation.endTime}`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Editar"
          >
            <Edit3 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </motion.button>
          
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Duplicar"
          >
            <Copy className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </motion.button>
          
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Excluir"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </motion.button>
        </div>
      </div>

      {operation.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {operation.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-gray-500 dark:text-gray-400">
            {forecasts.length} forecast{forecasts.length !== 1 ? 's' : ''}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            {scenarios.length} cenário{scenarios.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <Calendar className="w-3 h-3" />
          {new Date(operation.createdAt).toLocaleDateString('pt-BR')}
        </div>
      </div>

      {isSelected && (
        <div className="mt-3 pt-3 border-t border-primary-200 dark:border-primary-800">
          <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            Operação selecionada
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Operation Form Modal Component
interface OperationFormModalProps {
  operation: Operation | null;
  onClose: () => void;
  onSave: (operation: Operation) => void;
}

const OperationFormModal: React.FC<OperationFormModalProps> = ({
  operation,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: operation?.name || '',
    type: operation?.type || 'specific-hours' as OperationType,
    startTime: operation?.startTime || '08:00',
    endTime: operation?.endTime || '18:00',
    description: operation?.description || ''
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors: string[] = [];
    
    if (!formData.name.trim()) {
      validationErrors.push('Nome da operação é obrigatório');
    }
    
    if (formData.type === 'specific-hours') {
      if (!formData.startTime || !formData.endTime) {
        validationErrors.push('Horários de início e fim são obrigatórios');
      } else if (formData.startTime >= formData.endTime) {
        validationErrors.push('Horário de início deve ser anterior ao horário de fim');
      }
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    const operationData: Operation = {
      id: operation?.id || `op_${Date.now()}`,
      name: formData.name.trim(),
      type: formData.type,
      startTime: formData.type === 'specific-hours' ? formData.startTime : undefined,
      endTime: formData.type === 'specific-hours' ? formData.endTime : undefined,
      description: formData.description.trim() || undefined,
      createdAt: operation?.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    onSave(operationData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {operation ? 'Editar Operação' : 'Nova Operação'}
        </h2>

        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome da Operação
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input-field"
              placeholder="Ex: SAC, Vendas, Suporte Técnico"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Operação
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  value="24h"
                  checked={formData.type === '24h'}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as OperationType }))}
                  className="mr-3"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">24 Horas</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Funcionamento contínuo</p>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  value="specific-hours"
                  checked={formData.type === 'specific-hours'}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as OperationType }))}
                  className="mr-3"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Horário Específico</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Horário comercial</p>
                </div>
              </label>
            </div>
          </div>

          {/* Horários (apenas se não for 24h) */}
          {formData.type === 'specific-hours' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Configuração de Horário de Funcionamento
                  </h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                      Início das Atividades
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                        className="input-field pl-10 bg-white dark:bg-gray-800"
                      />
                      <Clock className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                      Fim das Atividades
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                        className="input-field pl-10 bg-white dark:bg-gray-800"
                      />
                      <Clock className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>
                </div>
                
                {/* Preview de Duração */}
                {formData.startTime && formData.endTime && (
                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Duração da operação:</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {(() => {
                          const start = new Date(`2000-01-01 ${formData.startTime}`);
                          const end = new Date(`2000-01-01 ${formData.endTime}`);
                          const diffMs = end.getTime() - start.getTime();
                          const diffHours = diffMs / (1000 * 60 * 60);
                          return diffHours > 0 ? `${diffHours.toFixed(1)} horas` : 'Horário inválido';
                        })()}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Presets de Horários Comuns */}
                <div className="mt-4">
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">Presets comuns:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Comercial', start: '08:00', end: '18:00' },
                      { label: 'Extendido', start: '07:00', end: '22:00' },
                      { label: 'Manhã', start: '06:00', end: '14:00' },
                      { label: 'Tarde', start: '14:00', end: '22:00' }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          startTime: preset.start, 
                          endTime: preset.end 
                        }))}
                        className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        {preset.label} ({preset.start} - {preset.end})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição (Opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input-field resize-none"
              rows={3}
              placeholder="Descreva a operação..."
            />
          </div>

          {/* Informação sobre Operação 24h */}
          {formData.type === '24h' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Operação 24 Horas
                </h4>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Esta operação funcionará 24 horas por dia (00:00 - 23:59). Os intervalos de forecast serão configurados na etapa de criação do forecast.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {operation ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default OperationsPage;