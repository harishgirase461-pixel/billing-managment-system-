import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Product } from '../types';
import Modal from '../components/Modal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { api } from '../api';

const emptyProduct: Omit<Product, 'id'> = {
  name: '',
  rate: 0,
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void; }> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    // Logic to show a limited number of page links
    const maxPagesToShow = 5;
    let startPage: number, endPage: number;
    if (totalPages <= maxPagesToShow) {
        startPage = 1;
        endPage = totalPages;
    } else {
        const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
        const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;
        if (currentPage <= maxPagesBeforeCurrent) {
            startPage = 1;
            endPage = maxPagesToShow;
        } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
            startPage = totalPages - maxPagesToShow + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - maxPagesBeforeCurrent;
            endPage = currentPage + maxPagesAfterCurrent;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }
    
    return (
        <nav className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:justify-end">
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50">
                    Previous
                </button>
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50">
                    Next
                </button>
            </div>
        </nav>
    );
};


const ProductsPage: React.FC = () => {
  const { addProduct, updateProduct, deleteProduct, productsCount } = useAppContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Omit<Product, 'id'> | Product>(emptyProduct);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const fetchProducts = useCallback(async (page: number) => {
      setIsDataLoading(true);
      try {
          const { products: fetchedProducts, totalPages: calculatedTotalPages } = await api.getPaginatedProducts({ page, limit: ITEMS_PER_PAGE });
          setProducts(fetchedProducts);
          setTotalPages(calculatedTotalPages);
          setCurrentPage(page);
      } catch (error) {
          console.error("Failed to fetch products", error);
      } finally {
          setIsDataLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts, productsCount]);

  useEffect(() => {
    if (!isModalOpen) {
      setCurrentProduct(emptyProduct);
      setIsEditing(false);
    }
  }, [isModalOpen]);

  const handlePageChange = (page: number) => {
      if (page > 0 && page <= totalPages) {
          fetchProducts(page);
      }
  };

  const handleOpenAddModal = () => {
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
    setIsModalOpen(true);
  };
  
  const handleOpenConfirmDialog = (id: string) => {
    setProductToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete);
      setProductToDelete(null);
      // Data will be re-fetched by useEffect on productsCount
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setCurrentProduct(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditing) {
        await updateProduct(currentProduct as Product);
      } else {
        await addProduct(currentProduct as Omit<Product, 'id'>);
      }
      setIsModalOpen(false);
      // Data will be re-fetched by useEffect on productsCount
    } catch (error) {
      console.error("Failed to save product", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white shadow-md rounded-lg">
          <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                  <h2 className="text-xl font-semibold text-gray-800">Product Management</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage your product inventory and pricing. Total Products: {productsCount.toLocaleString('en-IN')}</p>
              </div>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center text-sm font-medium shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Product
              </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {isDataLoading ? (
                    <tr>
                        <td colSpan={4} className="text-center py-16 text-gray-500">
                            <svg className="animate-spin mx-auto h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        </td>
                    </tr>
                ) : products.length > 0 ? products.map((product, index) => (
                  <tr key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">#{product.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(product.rate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <button onClick={() => handleOpenEditModal(product)} className="text-primary-600 hover:text-primary-800 transition-colors" title="Edit Product">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                      </button>
                      <button onClick={() => handleOpenConfirmDialog(product.id)} className="text-red-600 hover:text-red-800 transition-colors" title="Delete Product">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                      <td colSpan={4} className="text-center py-16 text-gray-500">
                           <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                          <h3 className="mt-2 text-lg font-medium">No Products Found</h3>
                          <p className="text-sm">Click "Add Product" to get started.</p>
                      </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={isLoading}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
              <input type="text" name="name" id="name" value={currentProduct.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="rate" className="block text-sm font-medium text-gray-700">Rate (₹)</label>
              <input type="number" name="rate" id="rate" value={currentProduct.rate} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            <div className="pt-4 flex justify-end space-x-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 disabled:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 shadow-sm disabled:bg-primary-400 w-32 text-center">
                {isLoading ? (
                    <svg className="animate-spin mx-auto h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (isEditing ? 'Update Product' : 'Save Product')}
              </button>
            </div>
          </fieldset>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
      />
    </>
  );
};

export default ProductsPage;