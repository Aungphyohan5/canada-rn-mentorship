import User from "../models/user.js";
import NurseProfile from "../models/NurseProfile.js";


// ============================================================
// GET ALL NURSE USERS
// ============================================================

export const getAllNurses = async (req, res) => {
    try {
        const nurses = await User.find({
            role: "nurse",
        })
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();

        const userIds = nurses.map((nurse) => nurse._id);

        const profiles = await NurseProfile.find({
            user: { $in: userIds },
        }).lean();

        const profileMap = new Map(
            profiles.map((profile) => [
                profile.user.toString(),
                profile,
            ])
        );

        const customers = nurses.map((nurse) => ({
            user: nurse,
            profile:
                profileMap.get(nurse._id.toString()) || null,
        }));

        return res.status(200).json({
            success: true,
            count: customers.length,
            data: {
                customers,
            },
        });

    } catch (error) {
        console.error(
            "GET ALL NURSES ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


// ============================================================
// GET SINGLE NURSE
// ============================================================

export const getNurseById = async (req, res) => {
    try {
        const { id } = req.params;

        const nurse = await User.findOne({
            _id: id,
            role: "nurse",
        })
            .select("-password")
            .lean();

        if (!nurse) {
            return res.status(404).json({
                success: false,
                message: "Nurse not found",
            });
        }

        const profile = await NurseProfile.findOne({
            user: nurse._id,
        }).lean();

        return res.status(200).json({
            success: true,
            data: {
                user: nurse,
                profile: profile || null,
            },
        });

    } catch (error) {
        console.error(
            "GET NURSE BY ID ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};