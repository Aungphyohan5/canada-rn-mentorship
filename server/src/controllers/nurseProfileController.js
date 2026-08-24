import NurseProfile from "../models/NurseProfile.js";

// =============================================================
// CREATE / UPDATE MY PROFILE
// =============================================================

export const createOrUpdateProfile = async (req, res) => {
    try {
        const {
            phone,

            countryOfResidence,
            immigrationStatus,

            countryOfEducation,
            nursingDegree,
            educationInstitution,

            licenseStatus,
            registrationCountry,
            registrationProvince,
            regulatoryBody,

            yearsOfExperience,
            specialty,
            currentlyWorking,
            currentWorkCountry,

            englishTest,
            englishScore,

            nclexStatus,
            nclexJurisdiction,

            nnasStatus,

            preferredProvince,
            registrationStarted,
            registrationProgress,

            mainGoal,
            biggestConcern,
        } = req.body;

        // =====================================================
        // PROFILE COMPLETION
        // =====================================================

        const profileCompleted = Boolean(
            countryOfResidence?.trim() &&
            nursingDegree?.trim() &&
            educationInstitution?.trim() &&
            licenseStatus &&
            nclexStatus &&
            currentlyWorking &&
            preferredProvince &&
            mainGoal?.trim() &&
            biggestConcern?.trim()
        );

        // =====================================================
        // CREATE / UPDATE
        // =====================================================

        const profile =
            await NurseProfile.findOneAndUpdate(
                {
                    user: req.user._id,
                },

                {
                    $set: {
                        phone: phone || "",

                        countryOfResidence:
                            countryOfResidence || "",

                        immigrationStatus:
                            immigrationStatus || "",

                        countryOfEducation:
                            countryOfEducation || "",

                        nursingDegree:
                            nursingDegree || "",

                        educationInstitution:
                            educationInstitution || "",

                        licenseStatus:
                            licenseStatus || "",

                        registrationCountry:
                            registrationCountry || "",

                        registrationProvince:
                            registrationProvince || "",

                        regulatoryBody:
                            regulatoryBody || "",

                        yearsOfExperience:
                            yearsOfExperience ?? 0,

                        specialty:
                            specialty || "",

                        currentlyWorking:
                            currentlyWorking || "",

                        currentWorkCountry:
                            currentWorkCountry || "",

                        englishTest:
                            englishTest || "None",

                        englishScore:
                            englishScore ?? null,

                        nclexStatus:
                            nclexStatus || "Not Started",

                        nclexJurisdiction:
                            nclexJurisdiction || "",

                        nnasStatus:
                            nnasStatus || "Not Started",

                        preferredProvince:
                            preferredProvince || "",

                        registrationStarted:
                            registrationStarted || "",

                        registrationProgress:
                            registrationProgress || [],

                        mainGoal:
                            mainGoal || "",

                        biggestConcern:
                            biggestConcern || "",

                        profileCompleted,
                    },
                },

                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                    setDefaultsOnInsert: true,
                }
            );

        return res.status(200).json({
            success: true,
            message: "Nurse profile saved successfully",
            data: {
                profile,
            },
        });

    } catch (error) {
        console.error(
            "CREATE / UPDATE NURSE PROFILE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Server Error",
        });
    }
};


// =============================================================
// GET MY PROFILE
// =============================================================

export const getMyProfile = async (req, res) => {
    try {
        const profile =
            await NurseProfile.findOne({
                user: req.user._id,
            });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Nurse profile not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                profile,
            },
        });

    } catch (error) {
        console.error(
            "GET NURSE PROFILE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};