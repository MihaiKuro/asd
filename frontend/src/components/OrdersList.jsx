import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useOrderStore } from "../stores/useOrderStore";
import LoadingSpinner from "./LoadingSpinner";
import { Filter, Trash } from "lucide-react";
import useAnalyticsStore from '../stores/useAnalyticsStore';
import axios from '../lib/axios';

const OrdersList = () => {
	const { orders, loading, error, fetchAllOrders, fetchFilteredOrders, updateOrderStatus, deleteOrder } = useOrderStore();
	const { fetchSalesReport } = useAnalyticsStore();

	const [showFilters, setShowFilters] = useState(false);
	const [filterStatus, setFilterStatus] = useState('');
	const [filterClientName, setFilterClientName] = useState('');
	const [filterStartDate, setFilterStartDate] = useState('');
	const [filterEndDate, setFilterEndDate] = useState('');
	const [statusEdit, setStatusEdit] = useState({});
	const [editingStatusId, setEditingStatusId] = useState(null);
	const statusMap = {
		"Pending": "În așteptare",
		"Shipped": "Expediată",
		"Delivered": "Livrată",
		"Cancelled": "Anulată",
	};
	const statusMapReverse = Object.fromEntries(Object.entries(statusMap).map(([en, ro]) => [ro, en]));
	const statusOptions = Object.entries(statusMap);

	// Load all orders when component mounts
	useEffect(() => {
		fetchAllOrders();
	}, [fetchAllOrders]);

	const applyOrderFilters = useCallback(async () => {
		const filters = {};
		if (filterStatus) {
			filters.status = filterStatus;
		}
		if (filterClientName) {
			filters.clientName = filterClientName;
		}
		if (filterStartDate) {
			filters.startDate = filterStartDate;
		}
		if (filterEndDate) {
			filters.endDate = filterEndDate;
		}

		await fetchFilteredOrders(filters);
	}, [filterStatus, filterClientName, filterStartDate, filterEndDate, fetchFilteredOrders]);

	useEffect(() => {
		applyOrderFilters();
	}, [applyOrderFilters]);

	const handleClearAllFilters = () => {
		setFilterStatus('');
		setFilterClientName('');
		setFilterStartDate('');
		setFilterEndDate('');
		// applyOrderFilters will be called by the useEffect after state updates
	};

	// Funcție locală pentru refetch sumar general
	const fetchAnalyticsData = async () => {
		try {
			await axios.get("/analytics");
		} catch (error) {
			console.error("Error fetching analytics data:", error);
		}
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	if (error) {
		return <div className='text-center text-red-500 py-8'>Error: {error}</div>;
	}

	return (
		<motion.div
			className='bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-lg overflow-hidden p-5 flex flex-col'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<h2 className='text-2xl font-semibold mb-6 text-[#2B4EE6]'>Toate comenzile</h2>

			<div className='mb-4 flex justify-between items-center'>
				<motion.button
					onClick={() => setShowFilters(!showFilters)}
					className='inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium
					text-white bg-[#2B4EE6] hover:bg-blue-600 focus:outline-none focus:ring-2
					focus:ring-offset-2 focus:ring-[#2B4EE6] transition-colors duration-200'
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
				>
					<Filter className='h-5 w-5 mr-2' />
					{showFilters ? 'Ascunde filtrele' : 'Afișează filtrele'}
				</motion.button>
			</div>

			{showFilters && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: 'auto' }}
					exit={{ opacity: 0, height: 0 }}
					transition={{ duration: 0.3 }}
					className='bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-4 space-y-4'
				>
					<h3 className='text-lg font-semibold text-gray-300'>Filtrează comenzile</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
						<div>
							<label htmlFor='statusFilter' className='block text-sm font-medium text-gray-400'>Status</label>
							<select
								id='statusFilter'
								value={filterStatus}
								onChange={(e) => setFilterStatus(e.target.value)}
								className='mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-md py-2 px-3 text-white'
							>
								<option value=''>Toate statusurile</option>
								{statusOptions.map(([en, ro]) => (
									<option key={en} value={en}>{ro}</option>
								))}
							</select>
						</div>
						<div>
							<label htmlFor='clientNameFilter' className='block text-sm font-medium text-gray-400'>Nume client</label>
							<input
								type='text'
								id='clientNameFilter'
								value={filterClientName}
								onChange={(e) => setFilterClientName(e.target.value)}
								placeholder='Caută după nume client'
								className='mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-md py-2 px-3 text-white'
							/>
						</div>
						<div>
							<label htmlFor='startDateFilter' className='block text-sm font-medium text-gray-400'>Data de început</label>
							<input
								type='date'
								id='startDateFilter'
								value={filterStartDate}
								onChange={(e) => setFilterStartDate(e.target.value)}
								className='mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-md py-2 px-3 text-white'
							/>
						</div>
						<div>
							<label htmlFor='endDateFilter' className='block text-sm font-medium text-gray-400'>Data de sfârșit</label>
							<input
								type='date'
								id='endDateFilter'
								value={filterEndDate}
								onChange={(e) => setFilterEndDate(e.target.value)}
								className='mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-md py-2 px-3 text-white'
							/>
						</div>
					</div>
					<div className='flex justify-end gap-3 pt-4'>
						<motion.button
							onClick={handleClearAllFilters}
							className='py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium
							text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2
							focus:ring-gray-500 transition-colors duration-200'
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							Șterge filtrele
						</motion.button>
						<motion.button
							onClick={applyOrderFilters}
							className='py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium
							text-white bg-[#2B4EE6] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2
							focus:ring-[#2B4EE6] transition-colors duration-200'
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							Aplică filtrele
						</motion.button>
					</div>
				</motion.div>
			)}

			<div className='overflow-x-auto overflow-y-auto flex-grow max-h-[calc(100vh-350px)]'>
				<table className='min-w-full divide-y divide-gray-700'>
					<thead className='bg-gray-900/50 sticky top-0 z-10'>
						<tr>
							<th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
								ID Comandă
							</th>
							<th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
								Utilizator
							</th>
							<th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
								Dată
							</th>
							<th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
								Total
							</th>
							<th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
								Status
							</th>
							<th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
								Plătită
							</th>
							<th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>Acțiuni</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-gray-700 bg-transparent'>
						{orders.length === 0 ? (
							<tr>
								<td colSpan="8" className='px-6 py-4 text-center text-gray-400'>Nu am găsit comenzi.</td>
							</tr>
						) : (
							orders.map((order) => (
								<motion.tr
									key={order._id}
									className='hover:bg-gray-700/30 transition-colors duration-200'
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									layout
								>
									<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-white'>
										{order._id}
									</td>
									<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
										{order.user?.firstName && order.user?.lastName 
											? `${order.user.firstName} ${order.user.lastName}`
											: order.user?.email || '—'
										}
									</td>
									<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
										{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
									</td>
									<td className='px-6 py-4 whitespace-nowrap text-sm text-[#2B4EE6] font-semibold'>
										{typeof order.totalPrice === 'number' ? order.totalPrice.toFixed(2) : '—'} RON
									</td>
									<td className='px-6 py-4 whitespace-nowrap'>
										{editingStatusId === order._id ? (
											<select
												autoFocus
												value={order.status}
												onChange={async (e) => {
													const newStatus = e.target.value;
													if (newStatus !== order.status) {
														await updateOrderStatus(order._id, newStatus);
														await fetchSalesReport();
														await fetchAnalyticsData();
													}
													setEditingStatusId(null);
												}}
												onBlur={() => setEditingStatusId(null)}
												className='px-2 py-1 rounded border border-gray-600 bg-gray-800 text-white'
											>
												{statusOptions.map(([en, ro]) => (
													<option key={en} value={en}>{ro}</option>
												))}
											</select>
										) : (
											<span
												onClick={() => setEditingStatusId(order._id)}
												className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:ring-2 hover:ring-[#2B4EE6] ${
													order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
													order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
													order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
													'bg-gray-100 text-gray-800'
												}`}
											>
												{statusMap[order.status] || order.status}
											</span>
										)}
									</td>
									<td className='px-6 py-4 whitespace-nowrap'>
										{order.isPaid ? (
											<span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
												Plătită
											</span>
										) : (
											<span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800'>
												Neplătită
											</span>
										)}
									</td>
									<td className='px-6 py-4 whitespace-nowrap'>
										<button
											onClick={async () => {
												if (window.confirm('Sigur vrei să ștergi această comandă?')) {
													await deleteOrder(order._id);
													await fetchSalesReport();
													await fetchAnalyticsData();
												}
											}}
											className='text-red-500 hover:text-red-700 transition-colors p-1 rounded'
											title='Șterge Comanda'
										>
											<Trash className='h-5 w-5' />
										</button>
									</td>
								</motion.tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</motion.div>
	);
};

export default OrdersList; 