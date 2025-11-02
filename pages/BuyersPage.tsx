import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Buyer } from '../types';
import { Gender } from '../types';
import Modal from '../components/Modal';
import ConfirmationDialog from '../components/ConfirmationDialog';

const emptyBuyer: Omit<Buyer, 'id'> = {
  name: '',
  contact: '',
  email: '',
  address: '',
  gender: Gender.Other,
};

const BuyersPage: React.FC = () => {
  const { buyers, addBuyer, updateBuyer, deleteBuyer } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBuyer, setCurrentBuyer] = useState<Omit<Buyer, 'id'> | Buyer>(emptyBuyer);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [buyerToDelete, setBuyerToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isModalOpen) {
      setCurrentBuyer(emptyBuyer);
      setIsEditing(false);
    }
  }, [isModalOpen]);

  const handleOpenAddModal = () => {
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (buyer: Buyer) => {
    setCurrentBuyer(buyer);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleOpenConfirmDialog = (id: string) => {
    setBuyerToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (buyerToDelete) {
      await deleteBuyer(buyerToDelete);
      setBuyerToDelete(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentBuyer(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditing) {
        await updateBuyer(currentBuyer as Buyer);
      } else {
        await addBuyer(currentBuyer);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save buyer", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white shadow-md rounded-lg">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-semibold text-gray-800">Buyer Management</h2>
                <p className="text-sm text-gray-500 mt-1">View, add, edit, or delete buyer information.</p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center text-sm font-medium shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Buyer
            </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {buyers.map((buyer, index) => (
                <tr key={buyer.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{buyer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{buyer.contact}</div>
                      <div>{buyer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-ellipsis overflow-hidden max-w-xs">{buyer.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{buyer.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button onClick={() => handleOpenEditModal(buyer)} className="text-primary-600 hover:text-primary-800 transition-colors" title="Edit Buyer">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button onClick={() => handleOpenConfirmDialog(buyer.id)} className="text-red-600 hover:text-red-800 transition-colors" title="Delete Buyer">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {buyers.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-5.197M12 12a4 4 0 110-8 4 4 0 010 8z" /></svg>
                        <h3 className="mt-2 text-lg font-medium">No Buyers Found</h3>
                        <p className="text-sm">Click "Add Buyer" to get started.</p>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Buyer Details' : 'Add New Buyer'}
      >
        <form onSubmit={handleSubmit}>
          <fieldset disabled={isLoading}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" name="name" id="name" value={currentBuyer.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email ID</label>
                    <input type="email" name="email" id="email" value={currentBuyer.email} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact No.</label>
                    <input type="tel" name="contact" id="contact" value={currentBuyer.contact} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                    <select name="gender" id="gender" value={currentBuyer.gender} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm h-[42px]">
                      {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <textarea name="address" id="address" value={currentBuyer.address} onChange={handleChange} required rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"></textarea>
              </div>
            </div>
            <div className="pt-6 flex justify-end space-x-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 disabled:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 shadow-sm disabled:bg-primary-400 w-28 text-center">
                {isLoading ? (
                    <svg className="animate-spin mx-auto h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (isEditing ? 'Update Buyer' : 'Save Buyer')}
              </button>
            </div>
          </fieldset>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Buyer"
        message="Are you sure you want to delete this buyer? This action cannot be undone."
      />
    </>
  );
};

export default BuyersPage;