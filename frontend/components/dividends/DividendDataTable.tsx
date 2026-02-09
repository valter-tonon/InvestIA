'use client';

import { useState, useMemo } from 'react';
import { Dividend } from '@/types/dividend';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Filter, Calendar } from 'lucide-react';

interface DividendDataTableProps {
    dividends: Dividend[];
}

export default function DividendDataTable({ dividends }: DividendDataTableProps) {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'DIVIDEND' | 'JCP'>('ALL');

    // Filter and paginate data
    const { filteredData, paginatedData, totalPages } = useMemo(() => {
        let filtered = [...dividends];

        // Type filter
        if (typeFilter !== 'ALL') {
            filtered = filtered.filter(d => d.type === typeFilter);
        }

        // Date range filter
        if (startDate) {
            const start = new Date(startDate);
            filtered = filtered.filter(d => new Date(d.paymentDate) >= start);
        }
        if (endDate) {
            const end = new Date(endDate);
            filtered = filtered.filter(d => new Date(d.paymentDate) <= end);
        }

        // Pagination
        const start = page * pageSize;
        const paginated = filtered.slice(start, start + pageSize);
        const pages = Math.ceil(filtered.length / pageSize);

        return {
            filteredData: filtered,
            paginatedData: paginated,
            totalPages: pages
        };
    }, [dividends, typeFilter, startDate, endDate, page, pageSize]);

    // Reset to first page when filters change
    const handleFilterChange = () => {
        setPage(0);
    };

    if (dividends.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Nenhum dividendo encontrado</p>
                <p className="text-sm mt-2">Clique em &quot;Atualizar Dados&quot; para sincronizar com a Brapi</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">Filtros:</span>
                </div>

                {/* Date Range */}
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                    <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Data Início</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                handleFilterChange();
                            }}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Data Fim</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                handleFilterChange();
                            }}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Type Filter */}
                <div className="sm:w-48">
                    <label className="block text-xs text-gray-400 mb-1">Tipo</label>
                    <select
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value as 'ALL' | 'DIVIDEND' | 'JCP');
                            handleFilterChange();
                        }}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="ALL">Todos</option>
                        <option value="DIVIDEND">Dividendos</option>
                        <option value="JCP">JCP</option>
                    </select>
                </div>

                {/* Clear Filters */}
                {(startDate || endDate || typeFilter !== 'ALL') && (
                    <button
                        onClick={() => {
                            setStartDate('');
                            setEndDate('');
                            setTypeFilter('ALL');
                            setPage(0);
                        }}
                        className="self-end px-3 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                    >
                        Limpar
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gradient-to-r from-gray-800 to-gray-900">
                        <tr>
                            <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Data Pagamento
                            </th>
                            <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Data Ex
                            </th>
                            <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Valor por Ação
                            </th>
                            <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Tipo
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {paginatedData.map((dividend, index) => (
                            <tr
                                key={dividend.id}
                                className={`hover:bg-gray-800 transition-colors ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-850'
                                    }`}
                            >
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-medium">
                                    {format(new Date(dividend.paymentDate), 'dd/MM/yyyy', { locale: ptBR })}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                    {format(new Date(dividend.exDate), 'dd/MM/yyyy', { locale: ptBR })}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-bold text-green-500">
                                        R$ {dividend.value.toFixed(4)}
                                    </span>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
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

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-4">
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(0);
                        }}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value={10}>10 por página</option>
                        <option value={25}>25 por página</option>
                        <option value={50}>50 por página</option>
                    </select>
                    <span className="text-sm text-gray-400">
                        {filteredData.length} {filteredData.length === 1 ? 'resultado' : 'resultados'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="p-2 bg-gray-800 border border-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                        aria-label="Página anterior"
                    >
                        <ChevronLeft className="h-4 w-4 text-gray-300" />
                    </button>
                    <span className="text-sm text-gray-300 min-w-[100px] text-center">
                        Página {totalPages > 0 ? page + 1 : 0} de {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1 || totalPages === 0}
                        className="p-2 bg-gray-800 border border-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                        aria-label="Próxima página"
                    >
                        <ChevronRight className="h-4 w-4 text-gray-300" />
                    </button>
                </div>
            </div>
        </div>
    );
}
