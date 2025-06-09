import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";

const SignUpPage = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const { signup, loading } = useUserStore();

	const handleSubmit = (e) => {
		e.preventDefault();
		signup(formData);
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8'>
				<motion.div
					className='text-center'
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<h2 className='text-3xl font-bold text-white mb-2'>Create your account</h2>
					<p className='text-sm text-gray-400'>
						Already have an account?{" "}
						<Link to='/login' className='text-blue-500 hover:text-blue-400 font-medium'>
							Sign in here
						</Link>
					</p>
				</motion.div>

				<motion.div
					className='bg-gray-800 rounded-lg shadow-xl p-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					<form onSubmit={handleSubmit} className='space-y-6'>
						<div>
							<label htmlFor='name' className='block text-sm font-medium text-gray-400 mb-2'>
								Full name
							</label>
							<input
								id='name'
								type='text'
								required
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200'
								placeholder='Enter your full name'
							/>
						</div>

						<div>
							<label htmlFor='email' className='block text-sm font-medium text-gray-400 mb-2'>
								Email address
							</label>
							<input
								id='email'
								type='email'
								required
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200'
								placeholder='Enter your email'
							/>
						</div>

						<div>
							<label htmlFor='password' className='block text-sm font-medium text-gray-400 mb-2'>
								Password
							</label>
							<input
								id='password'
								type='password'
								required
								value={formData.password}
								onChange={(e) => setFormData({ ...formData, password: e.target.value })}
								className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200'
								placeholder='Create a password'
							/>
						</div>

						<div>
							<label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-400 mb-2'>
								Confirm Password
							</label>
							<input
								id='confirmPassword'
								type='password'
								required
								value={formData.confirmPassword}
								onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
								className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200'
								placeholder='Confirm your password'
							/>
						</div>

						<button
							type='submit'
							disabled={loading}
							className='w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{loading ? (
								<>
									<Loader className='animate-spin -ml-1 mr-2 h-5 w-5' />
									Creating account...
								</>
							) : (
								<>
									<UserPlus className='-ml-1 mr-2 h-5 w-5' />
									Create account
								</>
							)}
						</button>
					</form>
				</motion.div>
			</div>
		</div>
	);
};

export default SignUpPage;
