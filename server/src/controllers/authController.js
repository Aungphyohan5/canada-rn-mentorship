import bcrypt from "bcrypt";
import User from "../models/user.js"

export const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        //validate required fields
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // check if user exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            success: true,
            message: "User Registered successfully",
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};