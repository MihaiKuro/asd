import { useEffect, useState } from "react";
import { ShoppingCart, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";

const FeaturedProducts = ({ featuredProducts }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [itemsPerPage, setItemsPerPage] = useState(4);
	const { addToCart } = useCartStore();

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 640) setItemsPerPage(1);
			else if (window.innerWidth < 1024) setItemsPerPage(2);
			else if (window.innerWidth < 1280) setItemsPerPage(3);
			else setItemsPerPage(4);
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const nextSlide = () => {
		setCurrentIndex((prevIndex) => 
			prevIndex + itemsPerPage >= featuredProducts.length ? 0 : prevIndex + itemsPerPage
		);
	};

	const prevSlide = () => {
		setCurrentIndex((prevIndex) => 
			prevIndex === 0 ? Math.max(0, featuredProducts.length - itemsPerPage) : prevIndex - itemsPerPage
		);
	};

	const renderStars = (rating) => {
		return [...Array(5)].map((_, index) => (
			<Star
				key={index}
				size={16}
				className={`${
					index < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
				}`}
			/>
		));
	};

	return (
		<div className='py-16 bg-gray-900'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center mb-8'>
					<h2 className='text-2xl font-bold text-white'>Featured Products</h2>
					<div className='flex gap-2'>
						<button
							onClick={prevSlide}
							className='p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors'
							aria-label="Previous products"
						>
							<ChevronLeft size={24} />
						</button>
						<button
							onClick={nextSlide}
							className='p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors'
							aria-label="Next products"
						>
							<ChevronRight size={24} />
						</button>
					</div>
				</div>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
					{featuredProducts
						.slice(currentIndex, currentIndex + itemsPerPage)
						.map((product) => (
							<div
								key={product._id}
								className='bg-gray-800 rounded-lg overflow-hidden group'
							>
								<div className='relative aspect-w-16 aspect-h-9'>
									<img
										src={product.image}
										alt={product.name}
										className='w-full h-full object-cover'
									/>
									{product.onSale && (
										<span className='absolute top-2 left-2 bg-red-500 text-white text-sm font-semibold px-2 py-1 rounded'>
											SALE
										</span>
									)}
								</div>
								<div className='p-4'>
									<Link 
										to={`/product/${product._id}`}
										className='text-lg font-semibold text-white hover:text-blue-400 transition-colors line-clamp-2'
									>
										{product.name}
									</Link>
									<div className='flex items-center gap-1 my-2'>
										{renderStars(product.rating)}
										<span className='text-gray-400 text-sm ml-1'>
											({product.reviewCount})
										</span>
									</div>
									<div className='flex items-baseline gap-2 mb-4'>
										<span className='text-xl font-bold text-white'>
											{product.price.toFixed(2)} ron
										</span>
										{product.originalPrice && (
											<span className='text-gray-400 line-through text-sm'>
												${product.originalPrice.toFixed(2)}
											</span>
										)}
									</div>
									<button
										onClick={() => addToCart(product)}
										className='w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors'
									>
										<ShoppingCart size={20} />
										Adaugă în coș
									</button>
								</div>
							</div>
						))}
				</div>

				<div className='text-center mt-8'>
					<Link
						to='/products'
						className='inline-flex items-center px-6 py-3 bg-[#2B4EE6] hover:bg-blue-500 text-white font-semibold rounded-lg transition duration-300'
					>
						Vezi toate produsele
					</Link>
				</div>
			</div>
		</div>
	);
};

export default FeaturedProducts;
