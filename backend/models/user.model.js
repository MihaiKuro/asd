import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, "Address title is required"],
	},
	street: {
		type: String,
		required: [true, "Street is required"],
	},
	city: {
		type: String,
		required: [true, "City is required"],
	},
	county: {
		type: String,
		required: [true, "County is required"],
	},
	postalCode: {
		type: String,
		required: [true, "Postal code is required"],
	},
	isDefault: {
		type: Boolean,
		default: false,
	}
});

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: [true, "First name is required"],
		},
		lastName: {
			type: String,
			required: [true, "Last name is required"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
		},
		phone: {
			type: String,
			trim: true,
		},
		addresses: [addressSchema],
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [6, "Password must be at least 6 characters long"],
		},
		cartItems: [
			{
				quantity: {
					type: Number,
					default: 1,
				},
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
				},
			},
		],
		role: {
			type: String,
			enum: ["customer", "admin"],
			default: "customer",
		},
	},
	{
		timestamps: true,
	}
);

// Pre-save hook to hash password before saving to database
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

userSchema.methods.comparePassword = async function (password) {
	return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
