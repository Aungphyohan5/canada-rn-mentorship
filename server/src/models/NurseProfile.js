import mongoose from "mongoose";

const nurseProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        phone: {
            type: String,
            trim: true,
            default: "",
        },

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

        englishTest: {
            type: String,
            enum: ["IELTS", "CELBAN", "PTE", "OET", "None"],
            default: "None",
        },

        englishScore: {
            type: Number,
            default: null,
        },

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

        preferredProvince: {
            type: String,
            trim: true,
            default: "",
        },

        immigrationStatus: {
            type: String,
            trim: true,
            default: "",
        },

        profileCompleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("NurseProfile", nurseProfileSchema);