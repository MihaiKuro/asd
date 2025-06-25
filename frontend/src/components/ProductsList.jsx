import { motion } from "framer-motion";
import { Trash, Star, ChevronUp, ChevronDown, Search, X, Edit, Filter } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import { useCategoryStore } from "../stores/useCategoryStore";
import { useState, useEffect, useCallback } from "react";
import EditProductForm from "./EditProductForm";

const ProductsList = () => {
	const { deleteProduct, toggleFeaturedProduct, products, fetchAllProducts, fetchProductsByCategory, fetchProductsBySubcategory, fetchFilteredProducts } = useProductStore();
	const { categories, fetchCategories } = useCategoryStore();

	const [sortConfig, setSortConfig] = useState({
		key: null,
		direction: 'ascending'
	});
	const [searchQuery, setSearchQuery] = useState('');
	const [isSearching, setIsSearching] = useState(false);
	const [editingProduct, setEditingProduct] = useState(null);

	// New filter states
	const [showFilters, setShowFilters] = useState(false);
	const [minPrice, setMinPrice] = useState('');
	const [maxPrice, setMaxPrice] = useState('');
	const [minStock, setMinStock] = useState('');
	const [maxStock, setMaxStock] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('');
	const [selectedSubcategory, setSelectedSubcategory] = useState('');
	const [isFeaturedFilter, setIsFeaturedFilter] = useState(false);
	const [productIdFilter, setProductIdFilter] = useState('');

	useEffect(() => {
		fetchCategories().catch(error => {
			console.error('Failed to fetch categories:', error);
		});
	}, [fetchCategories]);
	const applyFilters = useCallback(async () => {
		const filters = {};

		if (searchQuery) {
			filters.search = searchQuery;
		}

		if (selectedCategory) {
			filters.category = selectedCategory;
		}
		if (selectedSubcategory) {
			filters.subcategory = selectedSubcategory;
		}
		if (minPrice !== '') {
			filters.minPrice = parseFloat(minPrice);
		}
		if (maxPrice !== '') {
			filters.maxPrice = parseFloat(maxPrice);
		}
		if (minStock !== '') {
			filters.minStock = parseInt(minStock);
		}
		if (maxStock !== '') {
			filters.maxStock = parseInt(maxStock);
		}
		if (isFeaturedFilter) {
			filters.isFeatured = true;
		}
		if (productIdFilter) {
			filters.productId = productIdFilter;
		}

		await fetchFilteredProducts(filters);
	}, [searchQuery, selectedCategory, selectedSubcategory, minPrice, maxPrice, minStock, maxStock, isFeaturedFilter, productIdFilter, fetchFilteredProducts]);

	useEffect(() => {
		applyFilters();
	}, [applyFilters]);

	const filteredProducts = products.filter(product =>
		product.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const sortedProducts = [...filteredProducts].sort((a, b) => {
		if (!sortConfig.key) return 0;

		const aValue = a[sortConfig.key];
		const bValue = b[sortConfig.key];

		if (sortConfig.key === 'isFeatured') {
			return sortConfig.direction === 'ascending'
				? (aValue === bValue ? 0 : aValue ? -1 : 1)
				: (aValue === bValue ? 0 : aValue ? 1 : -1);
		}

		if (typeof aValue === 'string') {
			return sortConfig.direction === 'ascending'
				? aValue.localeCompare(bValue)
				: bValue.localeCompare(aValue);
		}

		return sortConfig.direction === 'ascending'
			? aValue - bValue
			: bValue - aValue;
	});

	const requestSort = (key) => {
		setSortConfig((prevConfig) => ({
			key,
			direction:
				prevConfig.key === key && prevConfig.direction === 'ascending'
					? 'descending'
					: 'ascending',
		}));
	};

	const SortIndicator = ({ columnKey }) => {
		if (sortConfig.key !== columnKey) return null;
		return sortConfig.direction === 'ascending' ? (
			<ChevronUp className="inline h-4 w-4 ml-1" />
		) : (
			<ChevronDown className="inline h-4 w-4 ml-1" />
		);
	};

	const renderSortableHeader = (label, key) => (
		<th
			scope='col'
			className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white'
			onClick={() => requestSort(key)}
		>
			<span className="flex items-center">
				{label}
				<SortIndicator columnKey={key} />
			</span>
		</th>
	);

	const handleSearchClick = (e) => {
		e.stopPropagation();
		setIsSearching(true);
	};

	const handleSearchClose = () => {
		setIsSearching(false);
		setSearchQuery('');
	};

	const handleClearAllFilters = () => {
		setMinPrice('');
		setMaxPrice('');
		setMinStock('');
		setMaxStock('');
		setSelectedCategory('');
		setSelectedSubcategory('');
		setIsFeaturedFilter(false);
		setProductIdFilter('');
		setSearchQuery('');
		setIsSearching(false);
		// applyFilters is called by useEffect after state update
	};

	const renderProductHeader = () => (
		<th
			scope='col'
			className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
		>
			{isSearching ? (
				<div className="flex items-center gap-2">
					<Search className="h-4 w-4 text-gray-400" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Caută produse..."
						className="bg-gray-900/50 text-white text-sm rounded-md px-2 py-1 w-48 
						focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] border border-gray-700"
						autoFocus
					/>
					<button
						onClick={handleSearchClose}
						className="text-gray-400 hover:text-white transition-colors"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
			) : (
				<div 
					className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
					onClick={handleSearchClick}
				>
					<Search className="h-4 w-4" />
					<span>Produs</span>
				</div>
			)}
		</th>
	);

	const subcategoriesForSelectedCategory = categories.find(
		(cat) => cat._id === selectedCategory
	)?.subcategories || [];

	return (
		<motion.div
			className='bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-lg overflow-hidden p-5 flex flex-col min-h-[calc(100vh-200px)]'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<h2 className='text-2xl font-semibold mb-6 text-[#2B4EE6]'>Produse</h2>

			{editingProduct && (
				<div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
					<EditProductForm
						product={editingProduct}
						onClose={() => setEditingProduct(null)}
					/>
				</div>
			)}

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
					<h3 className='text-lg font-semibold text-gray-300'>Opțiuni de filtrare</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
						<div>
							<label htmlFor='minPrice' className='block text-sm font-medium text-gray-400'>Preț minim</label>
							<input
								type='number'
								id='minPrice'
								value={minPrice}
								onChange={(e) => setMinPrice(e.target.value)}
								className='mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-md py-2 px-3 text-white'
								min='0'
								step='0.01'
							/>
						</div>
						<div>
							<label htmlFor='maxPrice' className='block text-sm font-medium text-gray-400'>Preț maxim</label>
							<input
								type='number'
								id='maxPrice'
								value={maxPrice}
								onChange={(e) => setMaxPrice(e.target.value)}
								className='mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-md py-2 px-3 text-white'
								min='0'
								step='0.01'
							/>
						</div>
						<div>
							<label htmlFor='minStock' className='block text-sm font-medium text-gray-400'>Stoc minim</label>
							<input
								type='number'
								id='minStock'
								value={minStock}
								onChange={(e) => setMinStock(e.target.value)}
								className='mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-md py-2 px-3 text-white'
								min='0'
							/>
						</div>
						<div>
							<label htmlFor='maxStock' className='block text-sm font-medium text-gray-400'>Stoc maxim</label>
							<input
								type='number'
								id='maxStock'
								value={maxStock}
								onChange={(e) => setMaxStock(e.target.value)}
								className='mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-md py-2 px-3 text-white'
								min='0'
							/>
						</div>
						<div>
							<label htmlFor='categoryFilter' className='block text-sm font-medium text-gray-400'>Categorie</label>
							<select
								id='categoryFilter'
								value={selectedCategory}
								onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubcategory(''); }}
								className='mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-md py-2 px-3 text-white'
							>
								<option value=''>Toate categoriile</option>
								{categories.map(cat => (
									<option key={cat._id} value={cat._id}>{cat.name}</option>
								))}
							</select>
						</div>
						<div>
							<label htmlFor='subcategoryFilter' className='block text-sm font-medium text-gray-400'>Subcategorie</label>
							<select
								id='subcategoryFilter'
								value={selectedSubcategory}
								onChange={(e) => setSelectedSubcategory(e.target.value)}
								className='mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-md py-2 px-3 text-white'
								disabled={!selectedCategory || subcategoriesForSelectedCategory.length === 0}
							>
								<option value=''>Toate subcategoriile</option>
								{subcategoriesForSelectedCategory.map(subcat => (
									<option key={subcat._id} value={subcat._id}>{subcat.name}</option>
								))}
							</select>
						</div>
						<div className='flex items-center'>
							<input
								type='checkbox'
								id='isFeaturedFilter'
								checked={isFeaturedFilter}
								onChange={(e) => setIsFeaturedFilter(e.target.checked)}
								className='h-4 w-4 text-[#2B4EE6] bg-gray-800 border-gray-600 rounded focus:ring-[#2B4EE6]'
							/>
							<label htmlFor='isFeaturedFilter' className='ml-2 text-sm font-medium text-gray-400'>Produse promovate</label>
						</div>
						<div>
							<label htmlFor='productIdFilter' className='block text-sm font-medium text-gray-400'>ID Produs</label>
							<input
								type='text'
								id='productIdFilter'
								value={productIdFilter}
								onChange={(e) => setProductIdFilter(e.target.value)}
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
							Șterge toate filtrele
						</motion.button>
						<motion.button
							onClick={applyFilters}
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

			<div className='overflow-x-auto overflow-y-auto flex-grow max-h-[calc(100vh-550px)]'>
				<table className='min-w-full divide-y divide-gray-700'>
					<thead className='bg-gray-900/50 sticky top-0 z-10'>
						<tr>
							{renderProductHeader()}
							<th scope='col' className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>Preț de bază</th>
							{renderSortableHeader('Preț', 'price')}
							{renderSortableHeader('Stoc', 'stock')}
							{renderSortableHeader('Categorie', 'category.name')}
							{renderSortableHeader('Subcategorie', 'subcategory.name')}
							{renderSortableHeader('Promovat', 'isFeatured')}
							<th
								scope='col'
								className='px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'
							>
								Acțiuni
							</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-gray-700 bg-transparent'>
						{sortedProducts?.map((product) => (
							<motion.tr
								key={product._id}
								className='hover:bg-gray-700/30 transition-colors duration-200'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								layout
							>
								<td className='px-6 py-4'>
									<div className='flex items-center'>
										<div className='h-12 w-12 flex-shrink-0'>
											<img
												className='h-12 w-12 rounded-lg object-cover'
												src={product.image}
												alt={product.name}
											/>
										</div>
										<div className='ml-4'>
											<div className='text-sm font-medium text-white'>{product.name}</div>
											<div className='text-sm text-gray-400'>{product.description}</div>
										</div>
									</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-200'>
									{product.basePrice !== undefined && product.basePrice !== null && product.basePrice !== "" ? `${product.basePrice} ron` : "-"}
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='text-sm text-[#2B4EE6] font-semibold'>{product.price} ron</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='text-sm text-gray-300'>{product.stock}</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='text-sm text-gray-300'>{product.category?.name}</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='text-sm text-gray-300'>
										{product.subcategory ? product.subcategory.name : '—'}
									</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<button
										onClick={() => toggleFeaturedProduct(product._id)}
										className={`inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium
										transition-colors duration-200 ${
											product.isFeatured
												? "bg-[#2B4EE6]/20 text-[#2B4EE6] hover:bg-[#2B4EE6]/30"
												: "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
										}`}
									>
										<Star
											className={`h-4 w-4 mr-1 ${
												product.isFeatured ? "fill-[#2B4EE6]" : "fill-none"
											}`}
										/>
										{product.isFeatured ? "Promovat" : "Normal"}
									</button>
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='flex gap-2'>
										<motion.button
											onClick={() => setEditingProduct(product)}
											className='inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium
											bg-[#2B4EE6]/20 text-[#2B4EE6] hover:bg-[#2B4EE6]/30 transition-colors duration-200'
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											<Edit className='h-4 w-4 mr-1' />
											Editează
										</motion.button>
										<motion.button
											onClick={() => deleteProduct(product._id)}
											className='inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium
											bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors duration-200'
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											<Trash className='h-4 w-4 mr-1' />
											Șterge
										</motion.button>
									</div>
								</td>
							</motion.tr>
						))}
					</tbody>
				</table>
			</div>
		</motion.div>
	);
};

export default ProductsList;
