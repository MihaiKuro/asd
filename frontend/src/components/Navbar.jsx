import { ShoppingCart, UserPlus, LogIn, LogOut, Lock, Search, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const Navbar = () => {
	const { user, logout } = useUserStore();
	const isAdmin = user?.role === "admin";
	const { cart } = useCartStore();

	return (
		<header className='fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-[#2B4EE6]'>
			<div className='container mx-auto px-4 py-3'>
				<div className='flex justify-between items-center'>
					<Link to='/' className='flex items-center gap-2'>
						<div className='flex items-center justify-center h-8'>
							<span className='text-3xl translate-y-[1px]'>🏎</span>
						</div>
						<span className='text-2xl font-bold text-[#2B4EE6]'>Midnight Racers</span>
					</Link>

					<div className='flex items-center gap-4'>
						{/* Search Bar */}
						<div className='relative hidden sm:flex items-center'>
							<input
								type="text"
								placeholder="Caută piese..."
								className='w-64 px-4 py-2 pl-10 bg-gray-800 text-gray-300 rounded-full border border-gray-700 focus:outline-none focus:border-[#2B4EE6]'
							/>
							<Search className='absolute left-3 text-gray-400' size={18} />
						</div>

						{/* Navigation Items */}
						<nav className='flex items-center gap-4'>
							{user && (
								<>
									<Link
										to={"/cart"}
										className='relative group text-gray-300 hover:text-[#2B4EE6] transition duration-300'
									>
										<ShoppingCart className='inline-block group-hover:text-[#2B4EE6]' size={24} />
										{cart.length > 0 && (
											<span className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs min-w-[20px] text-center'>
												{cart.length}
											</span>
										)}
									</Link>
									<Link
										to="/profile"
										className='text-gray-300 hover:text-[#2B4EE6] transition duration-300'
									>
										<User size={24} />
									</Link>
								</>
							)}

							{user ? (
								<div className='flex items-center gap-3'>
									<button
										onClick={logout}
										className='text-gray-300 hover:text-[#2B4EE6] transition duration-300'
									>
										<LogOut size={24} />
									</button>
								</div>
							) : (
								<div className='flex items-center gap-3'>
									<Link
										to={"/login"}
										className='text-gray-300 hover:text-[#2B4EE6] transition duration-300'
									>
										<LogIn size={24} />
									</Link>
								</div>
							)}

							{isAdmin && (
								<Link
									to={"/secret-dashboard"}
									className='text-gray-300 hover:text-[#2B4EE6] transition duration-300'
								>
									<Lock size={24} />
								</Link>
							)}
						</nav>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Navbar;
