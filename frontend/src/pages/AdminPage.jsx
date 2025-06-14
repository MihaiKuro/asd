import { BarChart, PlusCircle, ShoppingBasket, Grid } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import AnalyticsTab from "../components/AnalyticsTab";
import CreateProductForm from "../components/CreateProductForm";
import ProductsList from "../components/ProductsList";
import CategoriesTab from "../components/CategoriesTab";
import { useProductStore } from "../stores/useProductStore";

const tabs = [
	{ id: "create", label: "Create Product", icon: PlusCircle },
	{ id: "products", label: "Products", icon: ShoppingBasket },
	{ id: "categories", label: "Categories", icon: Grid },
	{ id: "analytics", label: "Analytics", icon: BarChart },
];

const AdminPage = () => {
	const [activeTab, setActiveTab] = useState("create");
	const { fetchAllProducts } = useProductStore();

	useEffect(() => {
		fetchAllProducts();
	}, [fetchAllProducts]);

	return (
		<div className='min-h-screen bg-[#0B0F17]'>
			<div className='relative z-10 container mx-auto px-4 py-12'>
				<motion.h1
					className='text-4xl font-bold mb-8 text-[#2B4EE6] text-center'
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					Admin Dashboard
				</motion.h1>

				<div className='flex justify-center mb-8 space-x-4'>
					{tabs.map((tab) => (
						<motion.button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center px-6 py-3 rounded-lg transition-all duration-200 ${
								activeTab === tab.id
									? "bg-[#2B4EE6] text-white shadow-lg shadow-blue-500/20"
									: "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700"
							}`}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							<tab.icon className='mr-2 h-5 w-5' />
							{tab.label}
						</motion.button>
					))}
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					{activeTab === "create" && <CreateProductForm />}
					{activeTab === "products" && <ProductsList />}
					{activeTab === "categories" && <CategoriesTab />}
					{activeTab === "analytics" && <AnalyticsTab />}
				</motion.div>
			</div>
		</div>
	);
};

export default AdminPage;
