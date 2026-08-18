import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import "./Resources.css";
import { Link } from "react-router-dom";

const resourceCategories = [
    {
        title: "RN Registration",
        eyebrow: "LICENSING",
        description:
            "Official resources for internationally educated nurses working toward registration in Canada.",
        resources: [
            {
                title: "NNAS",
                description:
                    "National Nursing Assessment Service for internationally educated nurses applying for nursing registration in participating Canadian provinces and territories.",
                label: "Visit NNAS",
                url: "https://www.nnas.ca/",
            },
            {
                title: "NCLEX-RN",
                description:
                    "Official information about the NCLEX-RN examination, registration and candidate resources.",
                label: "Visit NCLEX",
                url: "https://www.nclex.com/",
            },
            {
                title: "Canadian Nursing Regulators",
                description:
                    "Find the nursing regulatory body responsible for registration in your province or territory.",
                label: "Find Your Regulator",
                url: "https://www.nurses.ab.ca/",
            },
        ],
    },

    {
        title: "Immigration",
        eyebrow: "CANADA IMMIGRATION",
        description:
            "Official Government of Canada resources for immigration and permanent residence pathways.",
        resources: [
            {
                title: "IRCC",
                description:
                    "Official Government of Canada immigration information, applications, programs and requirements.",
                label: "Visit IRCC",
                url: "https://www.canada.ca/en/services/immigration-citizenship.html",
            },
            {
                title: "Express Entry",
                description:
                    "Learn about Canada's Express Entry system and the programs managed through it.",
                label: "Explore Express Entry",
                url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html",
            },
            {
                title: "Provincial Nominee Programs",
                description:
                    "Explore provincial and territorial immigration programs and nomination pathways.",
                label: "Explore PNP",
                url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html",
            },
        ],
    },

    {
        title: "Career & Jobs",
        eyebrow: "NURSING CAREER",
        description:
            "Resources to help you research nursing jobs and understand the Canadian labour market.",
        resources: [
            {
                title: "Government of Canada Job Bank",
                description:
                    "Search Canadian job opportunities and explore labour-market information.",
                label: "Search Job Bank",
                url: "https://www.jobbank.gc.ca/",
            },
            {
                title: "Registered Nurse Jobs",
                description:
                    "Browse current registered nurse opportunities across Canada.",
                label: "Search RN Jobs",
                url: "https://www.jobbank.gc.ca/jobsearch/jobsearch?searchstring=registered+nurse",
            },
            {
                title: "Job Search Resources",
                description:
                    "Government resources for resumes, job searching and preparing for the Canadian labour market.",
                label: "Explore Career Resources",
                url: "https://www.jobbank.gc.ca/findajob",
            },
        ],
    },

    {
        title: "Education & Credentials",
        eyebrow: "EDUCATION",
        description:
            "Resources for education, credential assessment and professional development.",
        resources: [
            {
                title: "Educational Credential Assessment",
                description:
                    "Learn how educational credentials may be assessed for Canadian immigration purposes.",
                label: "Learn More",
                url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/education-assessed.html",
            },
            {
                title: "Language Testing",
                description:
                    "Official information about approved language tests used for Canadian immigration programs.",
                label: "View Requirements",
                url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-test.html",
            },
            {
                title: "Canada's Education System",
                description:
                    "Government information about studying and education in Canada.",
                label: "Explore Education",
                url: "https://www.canada.ca/en/services/education.html",
            },
        ],
    },
];

const Resources = () => {
    return (
        <DashboardLayout>
            <div className="resources-page">

                {/* ============================================
                    HERO
                ============================================ */}

                <section className="resources-hero">

                    <p className="eyebrow">
                        CANADA RN MENTORSHIP
                    </p>

                    <h1>
                        Canada RN Resource Library
                    </h1>

                    <p className="resources-intro">
                        A collection of official and trusted
                        resources to help you navigate nursing
                        registration, immigration, education
                        and your career in Canada.
                    </p>

                </section>


                {/* ============================================
                    IMPORTANT NOTE
                ============================================ */}

                <div className="resources-note">

                    <div className="resources-note-icon">
                        ✓
                    </div>

                    <div>

                        <strong>
                            Start with official sources
                        </strong>

                        <p>
                            Requirements can change. Always
                            confirm current eligibility,
                            application requirements and
                            deadlines directly with the
                            official organization.
                        </p>

                    </div>

                </div>


                {/* ============================================
                    RESOURCE CATEGORIES
                ============================================ */}

                <div className="resources-sections">

                    {resourceCategories.map(
                        (category) => (

                            <section
                                className="resource-category"
                                key={category.title}
                            >

                                <div className="resource-category-header">

                                    <div>

                                        <p className="card-eyebrow">
                                            {category.eyebrow}
                                        </p>

                                        <h2>
                                            {category.title}
                                        </h2>

                                    </div>

                                </div>


                                <p className="resource-category-description">
                                    {category.description}
                                </p>


                                <div className="resource-grid">

                                    {category.resources.map(
                                        (resource) => (

                                            <article
                                                className="resource-card"
                                                key={resource.title}
                                            >

                                                <div className="resource-card-content">

                                                    <div className="resource-icon">
                                                        ↗
                                                    </div>

                                                    <h3>
                                                        {resource.title}
                                                    </h3>

                                                    <p>
                                                        {
                                                            resource.description
                                                        }
                                                    </p>

                                                </div>


                                                <a
                                                    href={
                                                        resource.url
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="resource-link"
                                                >
                                                    {
                                                        resource.label
                                                    }{" "}
                                                    →
                                                </a>

                                            </article>

                                        )
                                    )}

                                </div>

                            </section>

                        )
                    )}

                </div>


                {/* ============================================
                    MENTORSHIP CTA
                ============================================ */}

                <section className="resources-cta">

                    <p className="card-eyebrow">
                        NEED PERSONALIZED GUIDANCE?
                    </p>

                    <h2>
                        Not sure which pathway applies to you?
                    </h2>

                    <p>
                        Your nursing education, registration
                        status, work experience, province and
                        immigration goals can all affect your
                        next step.
                    </p>

                    <Link
                        to="/book-session"
                        className="primary-button"
                    >
                        Book a Mentorship Session →
                    </Link>

                </section>

            </div>
        </DashboardLayout>
    );
};

export default Resources;