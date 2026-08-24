import mongoose from "mongoose";

const nurseProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        // =====================================================
        // PERSONAL INFORMATION
        // =====================================================

        phone: {
            type: String,
            trim: true,
            default: "",
        },

        countryOfResidence: {
            type: String,
            trim: true,
            default: "",
        },

        immigrationStatus: {
            type: String,
            trim: true,
            default: "",
        },

        // =====================================================
        // NURSING EDUCATION
        // =====================================================

        countryOfEducation: {
            type: String,
            trim: true,
            default: "",
        },

        nursingDegree: {
            type: String,
            trim: true,
            default: "",
        },

        educationInstitution: {
            type: String,
            trim: true,
            default: "",
        },

        // =====================================================
        // REGISTRATION / LICENSING
        // =====================================================

        licenseStatus: {
            type: String,
            enum: [
                "Currently licensed / registered",
                "License expired",
                "Not currently registered / licensed",
                "Other",
                "",
            ],
            default: "",
        },

        registrationCountry: {
            type: String,
            trim: true,
            default: "",
        },

        registrationProvince: {
            type: String,
            trim: true,
            default: "",
        },

        regulatoryBody: {
            type: String,
            trim: true,
            default: "",
        },

        // =====================================================
        // EXPERIENCE
        // =====================================================

        yearsOfExperience: {
            type: Number,
            min: 0,
            default: 0,
        },

        specialty: {
            type: String,
            trim: true,
            default: "",
        },

        currentlyWorking: {
            type: String,
            enum: ["Yes", "No", ""],
            default: "",
        },

        currentWorkCountry: {
            type: String,
            trim: true,
            default: "",
        },

        // =====================================================
        // ENGLISH
        // =====================================================

        englishTest: {
            type: String,
            enum: [
                "IELTS",
                "CELBAN",
                "PTE",
                "OET",
                "None",
            ],
            default: "None",
        },

        englishScore: {
            type: Number,
            default: null,
        },

        // =====================================================
        // NCLEX
        // =====================================================

        nclexStatus: {
            type: String,
            enum: [
                "Not Started",
                "Planning",
                "Registered",
                "Scheduled",
                "Passed",
                "Failed",
            ],
            default: "Not Started",
        },

        nclexJurisdiction: {
            type: String,
            trim: true,
            default: "",
        },

        // =====================================================
        // NNAS
        // =====================================================

        nnasStatus: {
            type: String,
            enum: [
                "Not Started",
                "In Progress",
                "Submitted",
                "Completed",
            ],
            default: "Not Started",
        },

        // =====================================================
        // CANADIAN RN JOURNEY
        // =====================================================

        preferredProvince: {
            type: String,
            trim: true,
            default: "",
        },

        registrationStarted: {
            type: String,
            enum: [
                "Yes",
                "No",
                "Not sure",
                "",
            ],
            default: "",
        },

        registrationProgress: {
            type: [String],
            default: [],
        },

        // =====================================================
        // GOALS
        // =====================================================

        mainGoal: {
            type: String,
            trim: true,
            default: "",
        },

        biggestConcern: {
            type: String,
            trim: true,
            default: "",
        },

        // =====================================================
        // PROFILE STATUS
        // =====================================================

        profileCompleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "NurseProfile",
    nurseProfileSchema
);