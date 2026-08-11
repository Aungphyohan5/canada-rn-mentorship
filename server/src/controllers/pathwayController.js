import NurseProfile from "../models/NurseProfile.js";

export const getMyPathway = async (req, res) => {
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

        const steps = [
            {
                key: "nnas",
                name: "NNAS",
                status: profile.nnasStatus,
            },
            {
                key: "english",
                name: "English Language Test",
                status:
                    profile.englishTest === "None"
                        ? "Not Started"
                        : "Completed",
            },
            {
                key: "nclex",
                name: "NCLEX-RN",
                status: profile.nclexStatus,
            },
            {
                key: "province",
                name: "Provincial Registration",
                status: "Not Started",
            },
        ];

        const completedSteps = steps.filter((step) => {
            return (
                step.status === "Completed" ||
                step.status === "Passed"
            );
        }).length;

        const completionPercentage = Math.round(
            (completedSteps / steps.length) * 100
        );

        res.status(200).json({
            success: true,
            data: {
                completionPercentage,
                completedSteps,
                totalSteps: steps.length,
                steps,
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