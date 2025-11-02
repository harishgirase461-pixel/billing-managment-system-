import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Bill, BillItem, Product } from '../types';
import { api } from '../api';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

// --- Product Browser Modal ---
const ProductBrowserModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddProduct: (product: Product) => void;
}> = ({ isOpen, onClose, onAddProduct }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const debounceTimeout = useRef<number | null>(null);

    const handleSearch = useCallback((term: string) => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = window.setTimeout(async () => {
            if (term.trim() === '') {
                setResults([]);
                return;
            }
            setIsLoading(true);
            try {
                const searchResults = await api.searchProducts(term);
                setResults(searchResults);
            } catch (error) {
                console.error("Failed to search products", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);
    }, []);

    useEffect(() => {
        handleSearch(searchTerm);
        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        };
    }, [searchTerm, handleSearch]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start p-4 pt-16" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl modal-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b sticky top-0 bg-white rounded-t-lg">
                    <h3 className="text-xl font-semibold text-gray-800">Browse Products</h3>
                    <div className="relative mt-4">
                        <input
                            type="text"
                            placeholder="Search by product name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="absolute top-0 left-0 inline-flex items-center p-2 h-full">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                </div>
                <div className="p-6 h-[60vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full"><svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>
                    ) : results.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {results.map(product => (
                                <div key={product.id} className="border rounded-lg p-3 flex flex-col justify-between">
                                    <div>
                                        <div className="aspect-square bg-gray-100 rounded flex items-center justify-center mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <p className="font-semibold text-sm text-gray-800">{product.name}</p>
                                        <p className="text-xs text-gray-500">ID: {product.id}</p>
                                    </div>
                                    <div className="mt-3">
                                        <p className="font-medium text-gray-700">{formatCurrency(product.rate)}</p>
                                        <button onClick={() => onAddProduct(product)} className="w-full mt-2 text-sm bg-primary-100 text-primary-700 font-semibold py-1.5 rounded-md hover:bg-primary-200">
                                            Add to Bill
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-16">
                            <p>{searchTerm ? 'No products found.' : 'Start searching for products.'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Bill Preview Modal ---
const BillPreview: React.FC<{
  billData: (Bill & { buyerAddress: string }) | null;
  onClose: () => void;
  onPrint: () => void;
}> = ({ billData, onClose, onPrint }) => {
  if (!billData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start py-10 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl m-4 relative modal-fade-in">
        <div className="p-4 bg-gray-50 border-b flex justify-end space-x-3 sticky top-0 z-10 rounded-t-lg">
          <button onClick={onPrint} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium flex items-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h8a2 2 0 002-2v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
            Print
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 text-sm font-medium">Close</button>
        </div>
        <div id="bill-to-print" className="p-10 text-gray-800">
          <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h1 className="font-bold text-3xl ml-2">ProBill</h1>
                </div>
                <p className="text-sm text-gray-500 mt-2">123 Business Rd, Suite 100<br/>Commerce City, 12345</p>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-bold uppercase text-gray-800">Invoice</h2>
                <p className="text-sm mt-1"><span className="font-semibold text-gray-500">#</span> {billData.billNumber}</p>
                <p className="text-sm"><span className="font-semibold text-gray-500">Date:</span> {new Date(billData.date).toLocaleDateString('en-IN')}</p>
              </div>
          </div>
          <div className="my-10 border-b pb-8">
              <h3 className="font-bold text-gray-600 text-sm uppercase tracking-wider">Bill To</h3>
              <p className="font-semibold text-lg">{billData.buyerName}</p>
              <p className="text-sm text-gray-600">{billData.buyerAddress}</p>
          </div>
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 rounded-l-lg">Product Name</th>
                <th scope="col" className="px-6 py-3 text-center">Rate</th>
                <th scope="col" className="px-6 py-3 text-center">Quantity</th>
                <th scope="col" className="px-6 py-3 text-right rounded-r-lg">Amount</th>
              </tr>
            </thead>
            <tbody>
              {billData.items.map((item, index) => (
                <tr key={index} className="bg-white border-b">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.productName}</td>
                  <td className="px-6 py-4 text-center">{formatCurrency(item.rate)}</td>
                  <td className="px-6 py-4 text-center">{item.quantity}</td>
                  <td className="px-6 py-4 text-right font-medium">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-8 flex justify-end">
              <div className="w-full max-w-sm">
                  <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatCurrency(billData.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 mt-2">
                      <span>Tax (0%)</span>
                      <span>{formatCurrency(0)}</span>
                  </div>
                  <div className="border-t my-2"></div>
                  <div className="flex justify-between font-bold text-lg text-gray-800">
                      <span>TOTAL</span>
                      <span>{formatCurrency(billData.totalAmount)}</span>
                  </div>
              </div>
          </div>
          <div className="mt-16 text-center text-xs text-gray-500">
              <p>Thank you for your business!</p>
              <p>Please contact us with any questions regarding this invoice.</p>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Main Billing Page Component ---
const BillingPage: React.FC = () => {
    const { buyers, addBill, addNotification } = useAppContext();
    const [selectedBuyerId, setSelectedBuyerId] = useState<string>('');
    const [billItems, setBillItems] = useState<BillItem[]>([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [lastBill, setLastBill] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isProductBrowserOpen, setIsProductBrowserOpen] = useState(false);
    
    // Drag and Drop state
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleAddProduct = (product: Product) => {
        setBillItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => item.productId === product.id);
            if (existingItemIndex > -1) {
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity++;
                updatedItems[existingItemIndex].amount = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].rate;
                return updatedItems;
            } else {
                const newItem: BillItem = {
                    productId: product.id,
                    productName: product.name,
                    rate: product.rate,
                    quantity: 1,
                    amount: product.rate,
                };
                return [...prevItems, newItem];
            }
        });
        addNotification('success', `Added "${product.name}" to the bill.`);
    };
    
    const updateItemQuantity = (productId: string, newQuantity: number) => {
        setBillItems(prev => prev.map(item => {
            if (item.productId === productId) {
                const quantity = Math.max(1, newQuantity);
                return { ...item, quantity, amount: quantity * item.rate };
            }
            return item;
        }));
    };

    const removeItem = (productId: string) => {
        setBillItems(prev => prev.filter(item => item.productId !== productId));
    };

    const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newBillItems = [...billItems];
        const [reorderedItem] = newBillItems.splice(dragItem.current, 1);
        newBillItems.splice(dragOverItem.current, 0, reorderedItem);
        dragItem.current = null;
        dragOverItem.current = null;
        setBillItems(newBillItems);
    };
    
    const totalAmount = useMemo(() => {
        return billItems.reduce((total, item) => total + item.amount, 0);
    }, [billItems]);

    const handleSaveAndPrint = async () => {
        if (!selectedBuyerId || billItems.length === 0) {
            addNotification('warning', "Please select a buyer and add at least one item.");
            return;
        }

        const buyer = buyers.find(b => b.id === selectedBuyerId);
        if (!buyer) return;

        setIsSaving(true);
        try {
            const billData = {
                buyerId: buyer.id,
                buyerName: buyer.name,
                date: new Date().toISOString(),
                items: billItems,
                totalAmount: totalAmount,
            };
            const newBill = await addBill(billData);
            
            setLastBill({
              ...newBill,
              buyerAddress: buyer.address,
            });

            setIsPreviewOpen(true);
            resetForm();
        } catch (error) {
            console.error("Failed to save the bill", error);
            addNotification('error', 'There was an error saving the bill.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const resetForm = () => {
        setSelectedBuyerId('');
        setBillItems([]);
    };

    const handlePrint = () => {
      const printContents = document.getElementById('bill-to-print')?.innerHTML;
      if (printContents) {
          const printWindow = window.open('', '_blank');
          printWindow?.document.write(`<html><head><title>Print Bill</title><script src="https://cdn.tailwindcss.com"></script></head><body class="p-4">${printContents}</body></html>`);
          printWindow?.document.close();
          printWindow?.focus();
          setTimeout(() => { printWindow?.print(); printWindow?.close(); }, 250);
      }
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md h-fit">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-3">Bill Details</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="buyer" className="block text-sm font-medium text-gray-700">Select Buyer</label>
                            <select id="buyer" value={selectedBuyerId} onChange={e => setSelectedBuyerId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                                <option value="">-- Select a Buyer --</option>
                                {buyers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>

                        <div className="border-t pt-4">
                            <button onClick={() => setIsProductBrowserOpen(true)} className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-medium shadow-sm">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                               Browse & Add Products
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-3">Current Bill</h3>
                    <div className="space-y-3">
                        {billItems.length === 0 ? (
                             <div className="text-center py-16 text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                <h3 className="mt-2 text-lg font-medium">Your bill is empty</h3>
                                <p className="text-sm">Add products using the browser.</p>
                            </div>
                        ) : billItems.map((item, index) => (
                           <div key={item.productId}
                                draggable
                                onDragStart={() => dragItem.current = index}
                                onDragEnter={() => dragOverItem.current = index}
                                onDragEnd={handleDragSort}
                                onDragOver={(e) => e.preventDefault()}
                                className="flex items-center p-3 bg-white border rounded-lg shadow-sm cursor-grab active:cursor-grabbing"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                <div className="flex-grow">
                                    <p className="font-medium text-gray-800">{item.productName}</p>
                                    <p className="text-sm text-gray-500">{formatCurrency(item.rate)}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => updateItemQuantity(item.productId, item.quantity - 1)} className="p-1 rounded-full bg-gray-100 hover:bg-gray-200">-</button>
                                    <input type="number" value={item.quantity} onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 1)} className="w-12 text-center border-gray-200 rounded-md"/>
                                    <button onClick={() => updateItemQuantity(item.productId, item.quantity + 1)} className="p-1 rounded-full bg-gray-100 hover:bg-gray-200">+</button>
                                </div>
                                <p className="w-28 text-right font-semibold text-gray-800 mx-4">{formatCurrency(item.amount)}</p>
                                <button onClick={() => removeItem(item.productId)} className="text-gray-400 hover:text-red-500 p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                           </div>
                        ))}
                    </div>
                     <div className="mt-6 flex justify-between items-center border-t pt-4">
                         <h4 className="text-xl font-bold">Total:</h4>
                         <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
                     </div>
                     <div className="mt-6 flex justify-end space-x-4">
                         <button onClick={resetForm} className="px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50">Reset</button>
                         <button onClick={handleSaveAndPrint} disabled={billItems.length === 0 || !selectedBuyerId || isSaving} className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm flex items-center justify-center w-48">
                            {isSaving ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Save & Generate Bill'
                            )}
                         </button>
                     </div>
                </div>
            </div>
            {isPreviewOpen && <BillPreview billData={lastBill} onClose={() => setIsPreviewOpen(false)} onPrint={handlePrint} />}
            <ProductBrowserModal isOpen={isProductBrowserOpen} onClose={() => setIsProductBrowserOpen(false)} onAddProduct={handleAddProduct} />
        </>
    );
};

export default BillingPage;