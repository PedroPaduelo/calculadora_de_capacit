import React, { useState } from 'react';
import { PlusIcon, TrashIcon, PhoneIcon, ChatBubbleLeftIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { Channel, ChannelType } from '../../../types';
import { Button } from '../../ui';

interface ChannelManagerProps {
  channels: Channel[];
  onChannelsChange: (channels: Channel[]) => void;
}

const ChannelManager: React.FC<ChannelManagerProps> = ({
  channels,
  onChannelsChange
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const channelTypes: Array<{
    type: ChannelType;
    label: string;
    icon: React.ComponentType<any>;
    defaultCapacity: number;
    color: string;
  }> = [
    { type: 'voice', label: 'Voz', icon: PhoneIcon, defaultCapacity: 1, color: '#3B82F6' },
    { type: 'chat', label: 'Chat', icon: ChatBubbleLeftIcon, defaultCapacity: 3, color: '#10B981' },
    { type: 'email', label: 'Email', icon: EnvelopeIcon, defaultCapacity: 5, color: '#F59E0B' },
    { type: 'whatsapp', label: 'WhatsApp', icon: ChatBubbleLeftIcon, defaultCapacity: 4, color: '#25D366' },
    { type: 'social', label: 'Redes Sociais', icon: ChatBubbleLeftIcon, defaultCapacity: 3, color: '#8B5CF6' },
    { type: 'video', label: 'Vídeo', icon: PhoneIcon, defaultCapacity: 1, color: '#EF4444' }
  ];

  const getChannelTypeInfo = (type: ChannelType) => {
    return channelTypes.find(ct => ct.type === type) || channelTypes[0];
  };

  const addChannel = (type: ChannelType) => {
    const typeInfo = getChannelTypeInfo(type);
    const newChannel: Channel = {
      id: `channel_${Date.now()}`,
      name: `${typeInfo.label} ${channels.filter(c => c.type === type).length + 1}`,
      type,
      sla: 80,
      targetAnswerTime: type === 'voice' ? 20 : type === 'chat' ? 60 : 3600,
      averageHandlingTime: type === 'voice' ? 300 : type === 'chat' ? 180 : 120,
      concurrentCapacity: typeInfo.defaultCapacity,
      skillsRequired: [],
      priorityWeight: 5,
      isActive: true,
      color: typeInfo.color
    };
    
    onChannelsChange([...channels, newChannel]);
    setShowAddForm(false);
  };

  const updateChannel = (id: string, field: keyof Channel, value: any) => {
    const updated = channels.map(channel =>
      channel.id === id ? { ...channel, [field]: value } : channel
    );
    onChannelsChange(updated);
  };

  const removeChannel = (id: string) => {
    onChannelsChange(channels.filter(channel => channel.id !== id));
  };

  const toggleChannelActive = (id: string) => {
    const channel = channels.find(c => c.id === id);
    if (channel) {
      updateChannel(id, 'isActive', !channel.isActive);
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Gerenciamento de Canais
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Configure múltiplos canais de atendimento para análise omnichannel
          </p>
        </div>
        
        <Button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Adicionar Canal</span>
        </Button>
      </div>

      {/* Formulário de adição rápida */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
          <h4 className="font-medium text-gray-800 mb-3">Selecione o tipo de canal:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {channelTypes.map((type) => (
              <button
                key={type.type}
                onClick={() => addChannel(type.type)}
                className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-white transition-colors"
                style={{ borderColor: type.color + '40' }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center mb-2"
                  style={{ backgroundColor: type.color + '20' }}
                >
                  <type.icon className="w-4 h-4" style={{ color: type.color }} />
                </div>
                <span className="text-xs font-medium text-gray-700">{type.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 text-right">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Lista de canais */}
      {channels.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h4 className="text-lg font-medium mb-2">Nenhum canal configurado</h4>
          <p className="text-sm mb-4">Adicione canais para habilitar análise omnichannel</p>
          <Button
            type="button"
            onClick={() => setShowAddForm(true)}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Adicionar Primeiro Canal
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {channels.map((channel) => {
            const typeInfo = getChannelTypeInfo(channel.type);
            const IconComponent = typeInfo.icon;

            return (
              <div 
                key={channel.id} 
                className={`border rounded-lg p-4 transition-all ${
                  channel.isActive 
                    ? 'border-gray-200 bg-white' 
                    : 'border-gray-100 bg-gray-50 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: channel.color + '20' }}
                    >
                      <IconComponent className="w-5 h-5" style={{ color: channel.color }} />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={channel.name}
                        onChange={(e) => updateChannel(channel.id, 'name', e.target.value)}
                        className="text-lg font-semibold bg-transparent border-none outline-none focus:bg-white focus:border focus:border-blue-500 focus:px-2 focus:py-1 focus:rounded"
                        placeholder="Nome do canal"
                      />
                      <p className="text-sm text-gray-500 capitalize">{typeInfo.label}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleChannelActive(channel.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        channel.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {channel.isActive ? 'Ativo' : 'Inativo'}
                    </button>
                    
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => removeChannel(channel.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      SLA (%)
                    </label>
                    <input
                      type="number"
                      value={channel.sla}
                      onChange={(e) => updateChannel(channel.id, 'sla', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Meta Resposta
                    </label>
                    <input
                      type="number"
                      value={channel.targetAnswerTime}
                      onChange={(e) => updateChannel(channel.id, 'targetAnswerTime', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="1"
                    />
                    <span className="text-xs text-gray-500">{formatTime(channel.targetAnswerTime)}</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      TMA
                    </label>
                    <input
                      type="number"
                      value={channel.averageHandlingTime}
                      onChange={(e) => updateChannel(channel.id, 'averageHandlingTime', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="1"
                    />
                    <span className="text-xs text-gray-500">{formatTime(channel.averageHandlingTime)}</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Capacidade
                    </label>
                    <input
                      type="number"
                      value={channel.concurrentCapacity}
                      onChange={(e) => updateChannel(channel.id, 'concurrentCapacity', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="1"
                      max="10"
                    />
                    <span className="text-xs text-gray-500">simultâneos</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Prioridade
                    </label>
                    <input
                      type="range"
                      value={channel.priorityWeight}
                      onChange={(e) => updateChannel(channel.id, 'priorityWeight', parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      min="1"
                      max="10"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1</span>
                      <span className="font-medium">{channel.priorityWeight}</span>
                      <span>10</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Skills Necessárias
                    </label>
                    <input
                      type="text"
                      value={channel.skillsRequired.join(', ')}
                      onChange={(e) => {
                        const skills = e.target.value
                          .split(',')
                          .map(s => s.trim())
                          .filter(s => s.length > 0);
                        updateChannel(channel.id, 'skillsRequired', skills);
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="skill1, skill2"
                    />
                    <span className="text-xs text-gray-500">{channel.skillsRequired.length} skills</span>
                  </div>
                </div>

                {/* Métricas calculadas */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Eficiência Estimada:</span>
                      <span className="font-semibold ml-2">
                        {(channel.concurrentCapacity * 100 / (channel.concurrentCapacity + 1)).toFixed(0)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Calls/Agent/Hour:</span>
                      <span className="font-semibold ml-2">
                        {(3600 / channel.averageHandlingTime * channel.concurrentCapacity).toFixed(0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-semibold ml-2 capitalize">{typeInfo.label}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-semibold ml-2 ${channel.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                        {channel.isActive ? 'Operacional' : 'Pausado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resumo dos canais */}
      {channels.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-3">Resumo da Configuração</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Total de Canais:</span>
              <span className="font-semibold ml-2 text-blue-800">{channels.length}</span>
            </div>
            <div>
              <span className="text-blue-700">Canais Ativos:</span>
              <span className="font-semibold ml-2 text-blue-800">
                {channels.filter(c => c.isActive).length}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Capacidade Total:</span>
              <span className="font-semibold ml-2 text-blue-800">
                {channels.reduce((sum, c) => sum + (c.isActive ? c.concurrentCapacity : 0), 0)}
              </span>
            </div>
            <div>
              <span className="text-blue-700">SLA Médio:</span>
              <span className="font-semibold ml-2 text-blue-800">
                {channels.length > 0 
                  ? (channels.reduce((sum, c) => sum + c.sla, 0) / channels.length).toFixed(1) + '%'
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelManager;
