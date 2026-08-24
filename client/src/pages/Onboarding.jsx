import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

import "./Onboarding.css";

const TOTAL_STEPS = 5;

const Onboarding = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // =========================================================
    // FORM DATA
    // Matches NurseProfile schema
    // =========================================================

    const [formData, setFormData] = useState({
        // Personal
        countryOfResidence: "",
        immigrationStatus: "",

        // Education
        countryOfEducation: "",
        nursingDegree: "",
        educationInstitution: "",

        // Registration
        licenseStatus: "",
        registrationCountry: "",
        registrationProvince: "",
        regulatoryBody: "",

        // Experience
        yearsOfExperience: "",
        specialty: "",
        currentlyWorking: "",
        currentWorkCountry: "",

        // English
        englishTest: "None",
        englishScore: "",

        // NCLEX
        nclexStatus: "",
        nclexJurisdiction: "",

        // NNAS
        nnasStatus: "Not Started",

        // Canada RN journey
        preferredProvince: "",
        registrationStarted: "",
        registrationProgress: [],

        // Goals
        mainGoal: "",
        biggestConcern: "",
    });

    // =========================================================
    // OPTIONS
    // =========================================================

    const provinces = [
        "Alberta",
        "British Columbia",
        "Ontario",
        "New Brunswick",
        "Saskatchewan",
        "Nova Scotia",
        "Prince Edward Island",
        "Newfoundland and Labrador",
        "Manitoba",
        "Quebec",
        "Not sure yet",
        "Other",
    ];

    const countries = [
        "Canada",
        "Myanmar",
        "Singapore",
        "United States",
        "Philippines",
        "India",
        "United Kingdom",
        "Australia",
        "Other",
    ];

    // =========================================================
    // UPDATE FIELD
    // =========================================================

    const updateField = (field, value) => {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));

        // Clear error when user changes something
        if (error) {
            setError("");
        }
    };

    // =========================================================
    // TOGGLE REGISTRATION PROGRESS
    // =========================================================

    const toggleProgress = (value) => {
        setFormData((previous) => {
            const exists =
                previous.registrationProgress.includes(value);

            return {
                ...previous,

                registrationProgress: exists
                    ? previous.registrationProgress.filter(
                        (item) => item !== value
                    )
                    : [
                        ...previous.registrationProgress,
                        value,
                    ],
            };
        });

        if (error) {
            setError("");
        }
    };

    // =========================================================
    // VALIDATION
    // =========================================================

    const validateStep = () => {
        setError("");

        // -----------------------------------------------------
        // STEP 1
        // -----------------------------------------------------

        if (step === 1) {
            if (!formData.countryOfResidence) {
                setError(
                    "Please select your current country of residence."
                );

                return false;
            }
        }

        // -----------------------------------------------------
        // STEP 2
        // -----------------------------------------------------

        if (step === 2) {
            if (!formData.countryOfEducation) {
                setError(
                    "Please select the country where you completed your nursing education."
                );

                return false;
            }

            if (!formData.nursingDegree.trim()) {
                setError(
                    "Please enter your nursing degree or qualification."
                );

                return false;
            }

            if (!formData.educationInstitution.trim()) {
                setError(
                    "Please enter the institution where you completed your nursing education."
                );

                return false;
            }
        }

        // -----------------------------------------------------
        // STEP 3
        // -----------------------------------------------------

        if (step === 3) {
            if (!formData.licenseStatus) {
                setError(
                    "Please select your current nursing registration or license status."
                );

                return false;
            }

            if (!formData.nclexStatus) {
                setError(
                    "Please tell us your NCLEX-RN status."
                );

                return false;
            }
        }

        // -----------------------------------------------------
        // STEP 4
        // -----------------------------------------------------

        if (step === 4) {
            if (!formData.currentlyWorking) {
                setError(
                    "Please tell us whether you are currently working as a nurse."
                );

                return false;
            }

            if (!formData.preferredProvince) {
                setError(
                    "Please select the Canadian province you are interested in."
                );

                return false;
            }
        }

        // -----------------------------------------------------
        // STEP 5
        // -----------------------------------------------------

        if (step === 5) {
            if (!formData.mainGoal.trim()) {
                setError(
                    "Please tell us your main goal."
                );

                return false;
            }

            if (!formData.biggestConcern.trim()) {
                setError(
                    "Please tell us your biggest question or concern."
                );

                return false;
            }
        }

        return true;
    };

    // =========================================================
    // NEXT
    // =========================================================

    const handleNext = () => {
        if (!validateStep()) {
            return;
        }

        setStep((previous) =>
            Math.min(previous + 1, TOTAL_STEPS)
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // =========================================================
    // BACK
    // =========================================================

    const handleBack = () => {
        setError("");

        setStep((previous) =>
            Math.max(previous - 1, 1)
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // =========================================================
    // BUILD PROFILE PAYLOAD
    // =========================================================

    const buildProfilePayload = () => {
        /*
         * Frontend uses simple answers.
         *
         * Backend uses:
         *
         * Not Started
         * Planning
         * Registered
         * Scheduled
         * Passed
         * Failed
         */

        // -----------------------------------------------------
        // NCLEX
        // -----------------------------------------------------

        let nclexStatus = "Not Started";

        if (formData.nclexStatus === "Yes") {
            nclexStatus = "Passed";
        }

        if (formData.nclexStatus === "No") {
            nclexStatus = "Not Started";
        }

        if (formData.nclexStatus === "Not sure") {
            nclexStatus = "Planning";
        }

        // -----------------------------------------------------
        // YEARS OF EXPERIENCE
        // -----------------------------------------------------

        let yearsOfExperience = 0;

        switch (formData.yearsOfExperience) {
            case "Less than 1 year":
                yearsOfExperience = 0;
                break;

            case "1–2 years":
                yearsOfExperience = 2;
                break;

            case "3–5 years":
                yearsOfExperience = 5;
                break;

            case "6–10 years":
                yearsOfExperience = 10;
                break;

            case "More than 10 years":
                yearsOfExperience = 11;
                break;

            default:
                yearsOfExperience = 0;
        }

        // -----------------------------------------------------
        // NNAS
        // -----------------------------------------------------

        let nnasStatus = "Not Started";

        if (
            formData.registrationProgress.includes(
                "NNAS"
            )
        ) {
            nnasStatus = "Completed";
        }

        // -----------------------------------------------------
        // PAYLOAD
        //
        // IMPORTANT:
        // Every field here matches NurseProfile schema.
        // -----------------------------------------------------

        return {
            // Personal
            countryOfResidence:
                formData.countryOfResidence,

            immigrationStatus:
                formData.immigrationStatus || "",

            // Education
            countryOfEducation:
                formData.countryOfEducation,

            nursingDegree:
                formData.nursingDegree,

            educationInstitution:
                formData.educationInstitution,

            // Registration
            licenseStatus:
                formData.licenseStatus,

            registrationCountry:
                formData.registrationCountry,

            registrationProvince:
                formData.registrationProvince,

            regulatoryBody:
                formData.regulatoryBody,

            // Experience
            yearsOfExperience,

            specialty:
                formData.specialty,

            currentlyWorking:
                formData.currentlyWorking,

            currentWorkCountry:
                formData.currentWorkCountry,

            // English
            englishTest:
                formData.englishTest || "None",

            englishScore:
                formData.englishScore
                    ? Number(formData.englishScore)
                    : null,

            // NCLEX
            nclexStatus,

            nclexJurisdiction:
                formData.nclexJurisdiction,

            // NNAS
            nnasStatus,

            // Canadian RN journey
            preferredProvince:
                formData.preferredProvince,

            registrationStarted:
                formData.registrationStarted,

            registrationProgress:
                formData.registrationProgress,

            // Goals
            mainGoal:
                formData.mainGoal,

            biggestConcern:
                formData.biggestConcern,
        };
    };

    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateStep()) {
            return;
        }

        try {
            setSaving(true);
            setError("");

            const profilePayload =
                buildProfilePayload();

            console.log(
                "ONBOARDING PROFILE PAYLOAD:",
                profilePayload
            );

            await api.put(
                "/nurse-profile/me",
                profilePayload
            );

            navigate("/dashboard", {
                replace: true,
            });
        } catch (error) {
            console.error(
                "NURSE PROFILE SAVE ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to save your profile. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="onboarding-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="onboarding-header">

                <div className="onboarding-brand">

                    <div className="onboarding-logo">
                        🍁
                    </div>

                    <div>
                        <strong>
                            Canada RN
                        </strong>

                        <span>
                            Mentorship
                        </span>
                    </div>

                </div>

                <div className="onboarding-user">

                    {user?.firstName && (
                        <>
                            Welcome,{" "}
                            <strong>
                                {user.firstName}
                            </strong>
                        </>
                    )}

                </div>

            </header>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="onboarding-container">

                <div className="onboarding-card">

                    {/* =================================================
                        INTRO
                    ================================================= */}

                    {step === 1 && (
                        <div className="onboarding-intro">

                            <p className="onboarding-eyebrow">
                                LET'S GET STARTED
                            </p>

                            <h1>
                                Complete Your Nurse Profile
                            </h1>

                            <p>
                                Tell us a little about your
                                nursing background and your
                                Canadian RN goals.
                            </p>

                            <p className="intro-note">
                                This information helps us
                                understand where you are in
                                your journey and personalize
                                your experience.
                            </p>

                        </div>
                    )}


                    {/* =================================================
                        PROGRESS
                    ================================================= */}

                    <div className="onboarding-progress">

                        <div className="progress-top">

                            <span>
                                Step {step} of {TOTAL_STEPS}
                            </span>

                            <span>
                                {Math.round(
                                    (step / TOTAL_STEPS) * 100
                                )}
                                %
                            </span>

                        </div>

                        <div className="onboarding-progress-bar">

                            <div
                                className="onboarding-progress-fill"
                                style={{
                                    width: `${(step /
                                        TOTAL_STEPS) *
                                        100
                                        }%`,
                                }}
                            />

                        </div>

                    </div>


                    {/* =================================================
                        FORM
                    ================================================= */}

                    <form onSubmit={handleSubmit}>

                        {/* =================================================
                            STEP 1
                        ================================================= */}

                        {step === 1 && (
                            <section className="form-step">

                                <div className="step-heading">

                                    <span className="step-icon">
                                        🌎
                                    </span>

                                    <div>
                                        <p>STEP 1</p>

                                        <h2>
                                            About You
                                        </h2>
                                    </div>

                                </div>


                                <div className="form-group">

                                    <label>
                                        Current Country of Residence
                                        <span>*</span>
                                    </label>

                                    <select
                                        value={
                                            formData.countryOfResidence
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "countryOfResidence",
                                                event.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select your country
                                        </option>

                                        {countries.map(
                                            (country) => (
                                                <option
                                                    key={country}
                                                    value={country}
                                                >
                                                    {country}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>


                                <div className="form-group">

                                    <label>
                                        Current Immigration Status
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            formData.immigrationStatus
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "immigrationStatus",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Example: Citizen, PR, Work Permit, Student..."
                                    />

                                </div>

                            </section>
                        )}


                        {/* =================================================
                            STEP 2
                        ================================================= */}

                        {step === 2 && (
                            <section className="form-step">

                                <div className="step-heading">

                                    <span className="step-icon">
                                        🎓
                                    </span>

                                    <div>
                                        <p>STEP 2</p>

                                        <h2>
                                            Nursing Education
                                        </h2>
                                    </div>

                                </div>


                                <div className="form-group">

                                    <label>
                                        Country where you completed
                                        your nursing education
                                        <span>*</span>
                                    </label>

                                    <select
                                        value={
                                            formData.countryOfEducation
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "countryOfEducation",
                                                event.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select country
                                        </option>

                                        {countries.map(
                                            (country) => (
                                                <option
                                                    key={country}
                                                    value={country}
                                                >
                                                    {country}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>


                                <div className="form-group">

                                    <label>
                                        Nursing education /
                                        qualification
                                        <span>*</span>
                                    </label>

                                    <textarea
                                        value={
                                            formData.nursingDegree
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "nursingDegree",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Example: Diploma in Nursing, BSN, BScN..."
                                        rows="3"
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Institution where you
                                        completed your nursing
                                        education
                                        <span>*</span>
                                    </label>

                                    <textarea
                                        value={
                                            formData.educationInstitution
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "educationInstitution",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Example: University / Nursing School name"
                                        rows="3"
                                    />

                                </div>

                            </section>
                        )}


                        {/* =================================================
                            STEP 3
                        ================================================= */}

                        {step === 3 && (
                            <section className="form-step">

                                <div className="step-heading">

                                    <span className="step-icon">
                                        🩺
                                    </span>

                                    <div>
                                        <p>STEP 3</p>

                                        <h2>
                                            Registration & NCLEX
                                        </h2>
                                    </div>

                                </div>


                                {/* LICENSE */}

                                <div className="form-group">

                                    <label>
                                        Current nursing
                                        registration / license status
                                        <span>*</span>
                                    </label>

                                    <div className="radio-list">

                                        {[
                                            "Currently licensed / registered",
                                            "License expired",
                                            "Not currently registered / licensed",
                                            "Other",
                                        ].map(
                                            (option) => (
                                                <label
                                                    className="radio-option"
                                                    key={option}
                                                >

                                                    <input
                                                        type="radio"
                                                        name="licenseStatus"
                                                        value={option}
                                                        checked={
                                                            formData.licenseStatus ===
                                                            option
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateField(
                                                                "licenseStatus",
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    />

                                                    <span>
                                                        {option}
                                                    </span>

                                                </label>
                                            )
                                        )}

                                    </div>

                                </div>


                                {/* REGISTRATION */}

                                <div className="form-grid">

                                    <div className="form-group">

                                        <label>
                                            Registration Country
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                formData.registrationCountry
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "registrationCountry",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Example: Myanmar"
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Province / State
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                formData.registrationProvince
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "registrationProvince",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Example: New Brunswick"
                                        />

                                    </div>

                                </div>


                                <div className="form-group">

                                    <label>
                                        Regulatory Body
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            formData.regulatoryBody
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "regulatoryBody",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Example: CRNA, NMBI, SANC..."
                                    />

                                </div>


                                {/* NCLEX */}

                                <div className="form-group">

                                    <label>
                                        Have you passed the
                                        NCLEX-RN?
                                        <span>*</span>
                                    </label>

                                    <div className="radio-list">

                                        {[
                                            "Yes",
                                            "No",
                                            "Not sure",
                                        ].map(
                                            (option) => (
                                                <label
                                                    className="radio-option"
                                                    key={option}
                                                >

                                                    <input
                                                        type="radio"
                                                        name="nclexStatus"
                                                        value={option}
                                                        checked={
                                                            formData.nclexStatus ===
                                                            option
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateField(
                                                                "nclexStatus",
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    />

                                                    <span>
                                                        {option}
                                                    </span>

                                                </label>
                                            )
                                        )}

                                    </div>

                                </div>


                                {formData.nclexStatus ===
                                    "Yes" && (
                                        <div className="form-group">

                                            <label>
                                                Where did you pass
                                                the NCLEX-RN?
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    formData.nclexJurisdiction
                                                }
                                                onChange={(event) =>
                                                    updateField(
                                                        "nclexJurisdiction",
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Example: New York State"
                                            />

                                        </div>
                                    )}

                            </section>
                        )}


                        {/* =================================================
                            STEP 4
                        ================================================= */}

                        {step === 4 && (
                            <section className="form-step">

                                <div className="step-heading">

                                    <span className="step-icon">
                                        🇨🇦
                                    </span>

                                    <div>
                                        <p>STEP 4</p>

                                        <h2>
                                            Your Canadian RN Journey
                                        </h2>
                                    </div>

                                </div>


                                {/* CURRENT WORK */}

                                <div className="form-group">

                                    <label>
                                        Are you currently working
                                        as a nurse?
                                        <span>*</span>
                                    </label>

                                    <div className="radio-list">

                                        {[
                                            "Yes",
                                            "No",
                                        ].map(
                                            (option) => (
                                                <label
                                                    className="radio-option"
                                                    key={option}
                                                >

                                                    <input
                                                        type="radio"
                                                        name="currentlyWorking"
                                                        value={option}
                                                        checked={
                                                            formData.currentlyWorking ===
                                                            option
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateField(
                                                                "currentlyWorking",
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    />

                                                    <span>
                                                        {option}
                                                    </span>

                                                </label>
                                            )
                                        )}

                                    </div>

                                </div>


                                {formData.currentlyWorking ===
                                    "Yes" && (
                                        <div className="form-group">

                                            <label>
                                                Where are you currently
                                                working as a nurse?
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    formData.currentWorkCountry
                                                }
                                                onChange={(event) =>
                                                    updateField(
                                                        "currentWorkCountry",
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Country"
                                            />

                                        </div>
                                    )}


                                {/* EXPERIENCE */}

                                <div className="form-group">

                                    <label>
                                        Years of nursing experience
                                    </label>

                                    <select
                                        value={
                                            formData.yearsOfExperience
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "yearsOfExperience",
                                                event.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select
                                        </option>

                                        <option value="Less than 1 year">
                                            Less than 1 year
                                        </option>

                                        <option value="1–2 years">
                                            1–2 years
                                        </option>

                                        <option value="3–5 years">
                                            3–5 years
                                        </option>

                                        <option value="6–10 years">
                                            6–10 years
                                        </option>

                                        <option value="More than 10 years">
                                            More than 10 years
                                        </option>

                                    </select>

                                </div>


                                {/* SPECIALTY */}

                                <div className="form-group">

                                    <label>
                                        Primary nursing specialty
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            formData.specialty
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "specialty",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Example: Medical-Surgical, ICU, Pediatrics..."
                                    />

                                </div>


                                {/* PROVINCE */}

                                <div className="form-group">

                                    <label>
                                        Which Canadian province
                                        are you interested in?
                                        <span>*</span>
                                    </label>

                                    <select
                                        value={
                                            formData.preferredProvince
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "preferredProvince",
                                                event.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select a province
                                        </option>

                                        {provinces.map(
                                            (province) => (
                                                <option
                                                    key={province}
                                                    value={province}
                                                >
                                                    {province}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>


                                {/* REGISTRATION STARTED */}

                                <div className="form-group">

                                    <label>
                                        Have you already started
                                        your Canadian RN
                                        registration process?
                                    </label>

                                    <div className="radio-list">

                                        {[
                                            "Yes",
                                            "No",
                                            "Not sure",
                                        ].map(
                                            (option) => (
                                                <label
                                                    className="radio-option"
                                                    key={option}
                                                >

                                                    <input
                                                        type="radio"
                                                        name="registrationStarted"
                                                        value={option}
                                                        checked={
                                                            formData.registrationStarted ===
                                                            option
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateField(
                                                                "registrationStarted",
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    />

                                                    <span>
                                                        {option}
                                                    </span>

                                                </label>
                                            )
                                        )}

                                    </div>

                                </div>


                                {/* REGISTRATION PROGRESS */}

                                {formData.registrationStarted ===
                                    "Yes" && (
                                        <div className="form-group">

                                            <label>
                                                What have you completed?
                                            </label>

                                            <div className="checkbox-list">

                                                {[
                                                    "NNAS",
                                                    "Provincial application",
                                                    "NCLEX-RN",
                                                    "Credential assessment",
                                                    "English language test",
                                                ].map(
                                                    (item) => (
                                                        <label
                                                            className="checkbox-option"
                                                            key={item}
                                                        >

                                                            <input
                                                                type="checkbox"
                                                                checked={formData.registrationProgress.includes(
                                                                    item
                                                                )}
                                                                onChange={() =>
                                                                    toggleProgress(
                                                                        item
                                                                    )
                                                                }
                                                            />

                                                            <span>
                                                                {item}
                                                            </span>

                                                        </label>
                                                    )
                                                )}

                                            </div>

                                        </div>
                                    )}

                            </section>
                        )}


                        {/* =================================================
                            STEP 5
                        ================================================= */}

                        {step === 5 && (
                            <section className="form-step">

                                <div className="step-heading">

                                    <span className="step-icon">
                                        🎯
                                    </span>

                                    <div>
                                        <p>STEP 5</p>

                                        <h2>
                                            Your Goals
                                        </h2>
                                    </div>

                                </div>


                                {/* MAIN GOAL */}

                                <div className="form-group">

                                    <label>
                                        What is your main goal?
                                        <span>*</span>
                                    </label>

                                    <textarea
                                        value={
                                            formData.mainGoal
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "mainGoal",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Example: I want to become an RN in Canada and understand which province and pathway is best for me."
                                        rows="5"
                                    />

                                </div>


                                {/* CONCERN */}

                                <div className="form-group">

                                    <label>
                                        What is your biggest
                                        question or concern?
                                        <span>*</span>
                                    </label>

                                    <textarea
                                        value={
                                            formData.biggestConcern
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "biggestConcern",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Tell us what you are currently unsure about..."
                                        rows="5"
                                    />

                                </div>


                                {/* COMPLETION */}

                                <div className="completion-note">

                                    <span>
                                        ✓
                                    </span>

                                    <div>

                                        <strong>
                                            You're almost done!
                                        </strong>

                                        <p>
                                            Your answers will be
                                            saved to your nurse
                                            profile and used to
                                            personalize your Canada
                                            RN journey.
                                        </p>

                                    </div>

                                </div>

                            </section>
                        )}


                        {/* =================================================
                            ERROR
                        ================================================= */}

                        {error && (
                            <div className="onboarding-error">
                                {error}
                            </div>
                        )}


                        {/* =================================================
                            BUTTONS
                        ================================================= */}

                        <div className="onboarding-actions">

                            {step > 1 ? (
                                <button
                                    type="button"
                                    className="back-button"
                                    onClick={handleBack}
                                    disabled={saving}
                                >
                                    ← Back
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="skip-button"
                                    onClick={() =>
                                        navigate("/dashboard")
                                    }
                                >
                                    Complete Later
                                </button>
                            )}


                            {step < TOTAL_STEPS ? (
                                <button
                                    type="button"
                                    className="continue-button"
                                    onClick={handleNext}
                                >
                                    Continue
                                    <span>→</span>
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="continue-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Complete My Profile →"}
                                </button>
                            )}

                        </div>

                    </form>

                </div>

            </main>

        </div>
    );
};

export default Onboarding;