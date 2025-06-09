import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";

// Default client URL if environment variable is not set
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode } = req.body;
		console.log('Received request:', { products, couponCode });

		// Validate Stripe configuration
		if (!stripe) {
			throw new Error('Stripe configuration is missing');
		}

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		// Validate products structure
		const isValidProducts = products.every(product => 
			product._id && 
			typeof product.name === 'string' &&
			typeof product.price === 'number' &&
			typeof product.quantity === 'number' &&
			product.image
		);

		if (!isValidProducts) {
			return res.status(400).json({ 
				error: "Invalid product data structure",
				receivedProducts: products
			});
		}

		let totalAmount = 0;

		console.log('Creating line items...');
		const lineItems = products.map((product) => {
			// Convert price to cents for Stripe
			const amount = Math.round(product.price * 100);
			totalAmount += amount * product.quantity;

			console.log('Processing product:', {
				name: product.name,
				price: product.price,
				amount_in_cents: amount,
				quantity: product.quantity
			});

			return {
				price_data: {
					currency: "ron",
					product_data: {
						name: product.name,
						images: [product.image],
					},
					unit_amount: amount,
				},
				quantity: product.quantity || 1,
			};
		});

		let discountId = null;
		if (couponCode) {
			console.log('Processing coupon:', couponCode);
			const coupon = await Coupon.findOne({ 
				code: couponCode, 
				userId: req.user._id, 
				isActive: true 
			});
			
			if (coupon) {
				console.log('Found valid coupon:', coupon);
				try {
					// Create a Stripe coupon
					const stripeCoupon = await stripe.coupons.create({
						percent_off: coupon.discountPercentage,
						duration: 'once',
					});
					discountId = stripeCoupon.id;
					console.log('Created Stripe coupon:', stripeCoupon.id);
					
					// Apply discount to total
					totalAmount = Math.round(totalAmount * (1 - coupon.discountPercentage / 100));
				} catch (couponError) {
					console.error('Error creating Stripe coupon:', couponError);
					// Continue without applying coupon if there's an error
				}
			}
		}

		console.log('Creating Stripe session with URLs:', {
			success_url: `${CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${CLIENT_URL}/purchase-cancel`
		});

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${CLIENT_URL}/purchase-cancel`,
			discounts: discountId ? [{ coupon: discountId }] : [],
			metadata: {
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
				products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))
				),
			},
		});

		console.log('Stripe session created:', session.id);

		if (totalAmount >= 20000) {
			await createNewCoupon(req.user._id);
		}
		res.status(200).json({ id: session.id, totalAmount });
	} catch (error) {
		console.error("Error processing checkout:", {
			error: error.message,
			stack: error.stack,
			products: req.body.products,
			user: req.user?._id
		});
		res.status(500).json({ 
			message: "Error processing checkout", 
			error: error.message,
			details: error.stack 
		});
	}
};

export const checkoutSuccess = async (req, res) => {
	try {
		const { sessionId } = req.body;
		const session = await stripe.checkout.sessions.retrieve(sessionId);

		if (session.payment_status === "paid") {
			if (session.metadata.couponCode) {
				await Coupon.findOneAndUpdate(
					{
						code: session.metadata.couponCode,
						userId: session.metadata.userId,
					},
					{
						isActive: false,
					}
				);
			}

			// create a new Order
			const products = JSON.parse(session.metadata.products);
			const newOrder = new Order({
				user: session.metadata.userId,
				products: products.map((product) => ({
					product: product.id,
					quantity: product.quantity,
					price: product.price,
				})),
				totalAmount: session.amount_total , 
				stripeSessionId: sessionId,
			});

			await newOrder.save();

			res.status(200).json({
				success: true,
				message: "Payment successful, order created, and coupon deactivated if used.",
				orderId: newOrder._id,
			});
		}
	} catch (error) {
		console.error("Error processing successful checkout:", error);
		res.status(500).json({ message: "Error processing successful checkout", error: error.message });
	}
};

async function createStripeCoupon(discountPercentage) {
	const coupon = await stripe.coupons.create({
		percent_off: discountPercentage,
		duration: "once",
	});

	return coupon.id;
}

async function createNewCoupon(userId) {
	await Coupon.findOneAndDelete({ userId });

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		userId: userId,
	});

	await newCoupon.save();

	return newCoupon;
}
