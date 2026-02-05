'use client';

import { Dividend } from '@/types/dividend';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Info } from 'lucide-react';

interface DividendTableProps {
    dividends: Dividend[];
}

export default function DividendTable({ dividends }: DividendTableProps) {
    if (dividends.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Nenhum dividendo encontrado</p>
                <p className="text-sm mt-2">Clique em "Atualizar Dados" para sincronizar com a Brapi</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gradient-to-r from-gray-800 to-gray-900">
                    <tr>
                        {/* Data Pagamento */}
                        <th className="px-6 py-4 text-left relative">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Data Pagamento</span>
                                <div className="group relative inline-block">
                                    <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block w-56 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 pointer-events-none">
                                        Data em que o dividendo foi efetivamente pago aos acionistas.
                                    </div>
                                </div>
                            </div>
                        </th>

                        {/* Data Ex */}
                        <th className="px-6 py-4 text-left relative">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Data Ex</span>
                                <div className="group relative inline-block">
                                    <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block w-56 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 pointer-events-none">
                                        Data ex-dividendo: quem comprou a ação a partir desta data não tem direito ao dividendo.
                                    </div>
                                </div>
                            </div>
                        </th>

                        {/* Valor */}
                        <th className="px-6 py-4 text-left relative">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Valor por Ação</span>
                                <div className="group relative inline-block">
                                    <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 pointer-events-none whitespace-normal">
                                        Valor pago por ação. Multiplique pela quantidade de ações que você possui para saber o total recebido.
                                    </div>
                                </div>
                            </div>
                        </th>

                        {/* Tipo */}
                        <th className="px-6 py-4 text-left relative">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Tipo</span>
                                <div className="group relative inline-block">
                                    <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                                    <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 pointer-events-none whitespace-normal">
                                        <strong>Dividendo:</strong> Distribuição de lucros.<br />
                                        <strong>JCP:</strong> Juros sobre Capital Próprio (tem retenção de IR).
                                    </div>
                                </div>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-100">
                    {dividends.map((dividend, index) => (
                        <tr key={dividend.id} className={`hover:bg-gray-800 transition-colors ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-850'
                            }`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-medium">
                                {format(new Date(dividend.paymentDate), 'dd/MM/yyyy', { locale: ptBR })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                {format(new Date(dividend.exDate), 'dd/MM/yyyy', { locale: ptBR })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-bold text-green-700">
                                    R$ {dividend.value.toFixed(4)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                    className={`px-3 py-1 inline-flex text-xs font-bold rounded-full shadow-sm ${dividend.type === 'DIVIDEND'
                                        ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
                                        : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300'
                                        }`}
                                >
                                    {dividend.type === 'DIVIDEND' ? 'Dividendo' : 'JCP'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
