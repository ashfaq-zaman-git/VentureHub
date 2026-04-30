import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const AdminDashboard = () => {
    const toast = useToast();
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPendingKYC = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Unauthorized: No token found');
                    setLoading(false);
                    return;
                }
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/kyc-pending`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setPendingUsers(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching pending KYC applications');
            } finally {
                setLoading(false);
            }
        };

        fetchPendingKYC();
    }, []);

    const handleReview = async (userId, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/kyc-review/${userId}`, { status }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Instantly remove the reviewed user from the queue
            setPendingUsers(pendingUsers.filter(user => user._id !== userId));
            toast.success(`Application ${status} successfully!`);
        } catch (err) {
            toast.error(err.response?.data?.message || `Error processing ${status} application`);
        }
    };

    if (loading) return <div className="text-center mt-20 text-lg text-gray-600 font-medium">Loading KYC queue...</div>;

    if (error) return (
        <div className="text-center mt-20 max-w-lg mx-auto bg-red-50 border-l-4 border-red-500 p-6 rounded-md shadow-sm">
            <h3 className="text-lg font-bold text-red-800 mb-2">Access Error</h3>
            <p className="text-red-700">{error}</p>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10 flex items-center justify-between border-b border-gray-200 pb-5">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h2>
                    <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full shadow-sm">
                        {pendingUsers.length} Pending KYC
                    </span>
                </div>

                {pendingUsers.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <svg className="mx-auto h-16 w-16 text-green-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                        <p className="text-gray-500">There are no pending KYC applications to review.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {pendingUsers.map(user => (
                            <div key={user._id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                                        <p className="text-sm text-gray-500">{user.phone} • <span className="font-medium text-blue-600">{user.role}</span></p>
                                    </div>
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-yellow-200 animate-pulse">
                                        Reviewing
                                    </span>
                                </div>

                                <div className="p-6">
                                    {/* KYC Video Preview */}
                                    {user.kycVideoUrl && (
                                        <div className="mb-6 rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center shadow-inner">
                                            <video
                                                controls
                                                className="w-full h-full object-contain"
                                                src={user.kycVideoUrl}
                                                preload="metadata"
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    )}

                                    {/* KYC Documents Preview (NID & Tax) */}
                                    {user.kycDocuments && (user.kycDocuments.nidFrontUrl || user.kycDocuments.taxDocUrl) && (
                                        <div className="mb-6 space-y-4">
                                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b pb-2">Verification Documents</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {user.kycDocuments.nidFrontUrl && (
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase">NID Front</p>
                                                        <a href={user.kycDocuments.nidFrontUrl} target="_blank" rel="noreferrer" className="block border rounded-lg overflow-hidden hover:opacity-90 transition-opacity bg-gray-100">
                                                            <img src={user.kycDocuments.nidFrontUrl} alt="NID Front" className="w-full h-32 object-cover" />
                                                        </a>
                                                    </div>
                                                )}
                                                {user.kycDocuments.nidBackUrl && (
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase">NID Back</p>
                                                        <a href={user.kycDocuments.nidBackUrl} target="_blank" rel="noreferrer" className="block border rounded-lg overflow-hidden hover:opacity-90 transition-opacity bg-gray-100">
                                                            <img src={user.kycDocuments.nidBackUrl} alt="NID Back" className="w-full h-32 object-cover" />
                                                        </a>
                                                    </div>
                                                )}
                                                {user.kycDocuments.taxDocUrl && (
                                                    <div className="col-span-2 space-y-1">
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase">Tax Document / TIN</p>
                                                        <a href={user.kycDocuments.taxDocUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm">
                                                            <div className="flex items-center">
                                                                <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                                                <span className="text-sm font-medium text-gray-700">View Tax Certificate</span>
                                                            </div>
                                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {!user.kycVideoUrl && (!user.kycDocuments || (!user.kycDocuments.nidFrontUrl && !user.kycDocuments.taxDocUrl)) && (
                                        <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-100 text-center">
                                            <p className="text-red-600 font-medium text-sm">No verification files found for this user.</p>
                                        </div>
                                    )}

                                    <div className="flex space-x-4">
                                        <button
                                            onClick={() => handleReview(user._id, 'approved')}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-sm transition-colors duration-200 flex justify-center items-center"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReview(user._id, 'rejected')}
                                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 px-4 rounded-lg border border-red-200 transition-colors duration-200 flex justify-center items-center"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
