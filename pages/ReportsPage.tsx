import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Buyer, Product } from '../types';
import { api } from '../api';

const ReportsPage: React.FC = () => {
    const { logs, buyers } = useAppContext();
    const [isExporting, setIsExporting] = useState(false);

    const downloadCSV = <T extends object,>(data: T[], filename: string) => {
        if (data.length === 0) {
            alert(`No data available to export for ${filename}.`);
            return;
        }
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => 
                    JSON.stringify(row[header as keyof T], (key, value) => value === null ? '' : value)
                ).join(',')
            )
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportProducts = async () => {
        setIsExporting(true);
        try {
            const allProducts = await api.getAllProductsForExport();
            downloadCSV<Product>(allProducts, 'products.csv');
        } catch (error) {
            console.error("Failed to export products", error);
            alert("An error occurred while exporting products.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-1">Export Data</h2>
                <p className="text-sm text-gray-500 mb-4">Download your buyer and product data in CSV format.</p>
                <div className="flex space-x-4">
                    <button 
                        onClick={() => downloadCSV<Buyer>(buyers, 'buyers.csv')}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center text-sm font-medium shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 7.414V13a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        Export Buyers
                    </button>
                    <button 
                        onClick={handleExportProducts}
                        disabled={isExporting}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center text-sm font-medium shadow-sm disabled:bg-green-400"
                    >
                        {isExporting ? (
                            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 7.414V13a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                        {isExporting ? 'Exporting...' : 'Export Products'}
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Activity Logs</h2>
                    <p className="text-sm text-gray-500 mt-1">A record of all significant actions performed in the application.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, index) => (
                                <tr key={log.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp).toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.action}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.details}</td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="text-center py-16 text-gray-500">
                                        <h3 className="text-lg font-medium">No Activity Logged</h3>
                                        <p className="text-sm">Perform actions like adding buyers or products to see logs here.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;