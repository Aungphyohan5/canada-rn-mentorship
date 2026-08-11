import NurseProfile from "../models/NurseProfile.js";

export const createOrUpdateProfile = async (req, res) => {
    try {
        const {
            phone,
            countryOfEducation,
            nursingDegree,
            yearsOfExperience,
            specialty,
            englishTest,
            englishScore,
            nclexStatus,
            nnasStatus,
            preferredProvince,
            immigrationStatus,
        } = req.body;

        const profile = await NurseProfile.findOneAndUpdate(
            { user: req.user._id },
            {
                user: req.user._id,
                phone,
                countryOfEducation,
                nursingDegree,
                yearsOfExperience,
                specialty,
                englishTest,
                englishScore,
                nclexStatus,
                nnasStatus,
                preferredProvince,
                immigrationStatus,

                profileCompleted: Boolean(
                    countryOfEducation &&
                    nursingDegree &&
                    yearsOfExperience !== undefined &&
                    specialty &&
                    englishTest &&
                    nclexStatus &&
                    nnasStatus &&
                    preferredProvince &&
                    immigrationStatus
                ),
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
            }
        );

        res.status(200).json({
            success: true,
            message: "Nurse profile saved successfully",
            data: {
                profile,
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

export const getMyProfile = async (req, res) => {
    try {
        const profile = await NurseProfile.findOne({
            user: req.user._id,
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Nurse profile not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                profile,
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