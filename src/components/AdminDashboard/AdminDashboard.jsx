import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

import AboutSectionEditor from "../../components/AboutSectionEditor/AboutSectionEditor";
import AreasOfExpertiseEditor from "../../components/AreasOfExpertiseEditor/AreasOfExpertiseEditor";
import ContactSectionEditor from "../../components/ContactSectionEditor/ContactSectionEditor";
import DisciplineSectionEditor from "../../components/DisciplineSectionEditor/DisciplineSectionEditor";
import FaqSectionEditor from "../../components/FaqSectionEditor/FaqSectionEditor";
import IndustrialBrandsEditor from "../../components/IndustrialBrandsEditor/IndustrialBrandsEditor";
import InvestmentsProjectsEditor from "../../components/InvestmentsProjectsEditor/InvestmentsProjectsEditor";
import LatestWritingsEditor from "../../components/LatestWritingsEditor/LatestWritingsEditor";
import MomentsMilestonesEditor from "../../components/MomentsMilestonesEditor/MomentsMilestonesEditor";
import StorySectionEditor from "../../components/StorySectionEditor/StorySectionEditor";
import SuccessStoriesEditor from "../../components/SuccessStoriesEditor/SuccessStoriesEditor";
import LayoutSectionEditor from "../../components/LayoutSectionEditor/LayoutSectionEditor";
import PostsEditor from "../../components/PostsEditor/PostsEditor";
import ExperienceSectionEditor from "../../components/ExperienceSectionEditor/ExperienceSectionEditor";

const uiText = {
  ar: {
    loginTitle: "تسجيل الدخول",
    loginDesc: "يرجى تسجيل الدخول أولًا للوصول إلى لوحة التحكم",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    login: "دخول",
    loggingIn: "جارٍ تسجيل الدخول...",
    logout: "تسجيل الخروج",
    loginError: "فشل تسجيل الدخول. تأكد من البريد وكلمة المرور.",
    dashboardTitle: "لوحة التحكم",
    dashboardDesc:
      "من هنا يمكنك تعديل محتوى الأقسام بالعربية والإنجليزية مباشرة من قاعدة البيانات.",
    arabic: "العربية",
    english: "الإنجليزية",
    save: "حفظ التعديلات",
    saving: "جارٍ الحفظ...",
    loading: "جارٍ تحميل البيانات...",
    fetchError: "حدث خطأ أثناء تحميل البيانات",
    saveSuccess: "تم حفظ التعديلات بنجاح",
    saveError: "حدث خطأ أثناء حفظ التعديلات",
    formTitle: "تعديل محتوى الهيرو",
    badge: "Badge",
    title: "العنوان",
    description: "الوصف",
    primaryButtonText: "نص الزر الأساسي",
    primaryButtonLink: "رابط الزر الأساسي",
    secondaryButtonText: "نص الزر الثانوي",
    secondaryButtonLink: "رابط الزر الثانوي",
    firestoreInfo: "المسار المستخدم في Firebase",
    firestorePath: "siteContent / home",
    heroSection: "قسم الهيرو",
    aboutSection: "قسم من أنا",
    adminPanel: "لوحة الإدارة",
    signedInAs: "مسجل الدخول باسم",
    expertiseSection: "قسم مجالات الخبرة",
    contactSection: "قسم التواصل",
    disciplineSection: "قسم الانضباط",
    faqSection: "قسم الأسئلة الشائعة",
    industrialSection: "قسم العلامات الصناعية",
    investmentsSection: "قسم الاستثمارات والمشاريع",
    latestWritingsSection: "قسم آخر الكتابات",
    momentsSection: "قسم اللحظات والإنجازات",
    storySection: "قسم القصة",
    successStoriesSection: "قسم قصص النجاح",
    layoutSection: "قسم الهيدر والفوتر",
    postsSection: "قسم المقالات",
    experienceSection: "قسم الخبرات",
  },
  en: {
    loginTitle: "Login",
    loginDesc: "Please sign in first to access the dashboard",
    email: "Email",
    password: "Password",
    login: "Login",
    loggingIn: "Logging in...",
    logout: "Logout",
    loginError: "Login failed. Check your email and password.",
    dashboardTitle: "Dashboard",
    dashboardDesc:
      "From here you can edit site sections in Arabic and English directly from the database.",
    arabic: "Arabic",
    english: "English",
    save: "Save Changes",
    saving: "Saving...",
    loading: "Loading data...",
    fetchError: "Error loading data",
    saveSuccess: "Changes saved successfully",
    saveError: "Error saving changes",
    formTitle: "Edit Hero Content",
    badge: "Badge",
    title: "Title",
    description: "Description",
    primaryButtonText: "Primary Button Text",
    primaryButtonLink: "Primary Button Link",
    secondaryButtonText: "Secondary Button Text",
    secondaryButtonLink: "Secondary Button Link",
    firestoreInfo: "Firebase path used",
    firestorePath: "siteContent / home",
    heroSection: "Hero Section",
    aboutSection: "About Me Section",
    adminPanel: "Admin Panel",
    signedInAs: "Signed in as",
    expertiseSection: "Areas of Expertise Section",
    contactSection: "Contact Section",
    disciplineSection: "Discipline Section",
    faqSection: "FAQ Section",
    industrialSection: "Industrial Brands Section",
    investmentsSection: "Investments & Projects Section",
    latestWritingsSection: "Latest Writings Section",
    momentsSection: "Moments & Milestones Section",
    storySection: "Story Section",
    successStoriesSection: "Success Stories Section",
    layoutSection: "Header & Footer Section",
    postsSection: "Posts Section",
    experienceSection: "Experience Section",
  },
};

const defaultHeroData = {
  ar: {
    badge: "",
    title: "",
    description: "",
    primaryButtonText: "",
    primaryButtonLink: "",
    secondaryButtonText: "",
    secondaryButtonLink: "",
  },
  en: {
    badge: "",
    title: "",
    description: "",
    primaryButtonText: "",
    primaryButtonLink: "",
    secondaryButtonText: "",
    secondaryButtonLink: "",
  },
};

export default function AdminDashboard() {
  const [lang, setLang] = useState("ar");
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("hero");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [loginLoading, setLoginLoading] = useState(true);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [formData, setFormData] = useState(defaultHeroData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const t = uiText[lang];
  const currentData = formData[lang];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser || null);
      setLoginLoading(false);

      if (currentUser) {
        await fetchHeroData();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchHeroData = async () => {
    try {
      setLoading(true);
      setError("");

      const docRef = doc(db, "siteContent", "home");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setFormData({
          ar: {
            ...defaultHeroData.ar,
            ...(data.ar || {}),
          },
          en: {
            ...defaultHeroData.en,
            ...(data.en || {}),
          },
        });
      } else {
        await setDoc(docRef, defaultHeroData);
        setFormData(defaultHeroData);
      }
    } catch (err) {
      console.error("Error fetching hero data:", err);
      setError(t.fetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginChange = (field, value) => {
    setLoginForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoginSubmitting(true);
      setLoginError("");

      await signInWithEmailAndPassword(
        auth,
        loginForm.email,
        loginForm.password
      );
    } catch (err) {
      console.error("Login error:", err);
      setLoginError(t.loginError);
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setFormData(defaultHeroData);
      setMessage("");
      setError("");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const docRef = doc(db, "siteContent", "home");

      await setDoc(
        docRef,
        {
          ...formData,
          updatedAt: serverTimestamp(),
          updatedBy: user?.email || "unknown",
        },
        { merge: true }
      );

      setMessage(t.saveSuccess);
    } catch (err) {
      console.error("Error saving hero data:", err);
      setError(t.saveError);
    } finally {
      setSaving(false);

      setTimeout(() => {
        setMessage("");
        setError("");
      }, 3000);
    }
  };

  if (loginLoading) {
    return (
      <div className={`admin-dashboard ${lang === "ar" ? "rtl" : "ltr"}`}>
        <main className="main-content" style={{ width: "100%", maxWidth: "100%", flex: 1 }}>
          <div className="glass-card" style={{ padding: "30px", width: "100%" }}>
            <h2>{t.loading}</h2>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`admin-dashboard ${lang === "ar" ? "rtl" : "ltr"}`}>
        <main
          className="main-content"
          style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "30px",
            width: "100%",
            maxWidth: "100%",
            flex: 1,
          }}
        >
          <div
            className="glass-card"
            style={{
              width: "100%",
              maxWidth: "500px",
              padding: "30px",
            }}
          >
            <div style={{ marginBottom: "24px", textAlign: "center" }}>
              <div className="welcome-badge">{t.adminPanel}</div>
              <h1 style={{ marginTop: "12px" }}>{t.loginTitle}</h1>
              <p>{t.loginDesc}</p>
            </div>

            {loginError && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px 14px",
                  border: "1px solid #ff4d4f",
                  borderRadius: "12px",
                }}
              >
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="field-box field-box--full" style={{ marginBottom: "16px" }}>
                <label>{t.email}</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => handleLoginChange("email", e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>

              <div className="field-box field-box--full" style={{ marginBottom: "20px" }}>
                <label>{t.password}</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => handleLoginChange("password", e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className="language-switch">
                  <button
                    type="button"
                    className={lang === "ar" ? "active" : ""}
                    onClick={() => setLang("ar")}
                  >
                    AR
                  </button>
                  <button
                    type="button"
                    className={lang === "en" ? "active" : ""}
                    onClick={() => setLang("en")}
                  >
                    EN
                  </button>
                </div>

                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={loginSubmitting}
                >
                  {loginSubmitting ? t.loggingIn : t.login}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`admin-dashboard ${lang === "ar" ? "rtl" : "ltr"}`}>
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand-card">
            <div className="brand-text">
              <h2>Fadi Ahmed</h2>
              <p>{lang === "ar" ? "إدارة محتوى الموقع" : "Website Content Manager"}</p>
            </div>
            <div className="brand-logo">FA</div>
          </div>

          <div className="sidebar-list">
            <button
              className={`sidebar-item ${activeSection === "hero" ? "active" : ""}`}
              onClick={() => setActiveSection("hero")}
            >
              <span className="sidebar-item__dot" />
              <span className="sidebar-item__label">{t.heroSection}</span>
            </button>

            <button
              className={`sidebar-item ${activeSection === "about" ? "active" : ""}`}
              onClick={() => setActiveSection("about")}
            >
              <span className="sidebar-item__dot" />
              <span className="sidebar-item__label">{t.aboutSection}</span>
            </button>

            <button
            className={`sidebar-item ${activeSection === "expertise" ? "active" : ""}`}
            onClick={() => setActiveSection("expertise")}
            >
            <span className="sidebar-item__dot" />
           <span className="sidebar-item__label">{t.expertiseSection}</span>
           </button>

           <button
  className={`sidebar-item ${activeSection === "contact" ? "active" : ""}`}
  onClick={() => setActiveSection("contact")}
>
  <span className="sidebar-item__dot" />
  <span className="sidebar-item__label">{t.contactSection}</span>
</button>

        <button
       className={`sidebar-item ${activeSection === "discipline" ? "active" : ""}`}
       onClick={() => setActiveSection("discipline")}
      >
     <span className="sidebar-item__dot" />
    <span className="sidebar-item__label">{t.disciplineSection}</span>
     </button>

     <button
  className={`sidebar-item ${activeSection === "faq" ? "active" : ""}`}
  onClick={() => setActiveSection("faq")}
>
  <span className="sidebar-item__dot" />
  <span className="sidebar-item__label">{t.faqSection}</span>
</button>

          <button
  className={`sidebar-item ${activeSection === "industrial" ? "active" : ""}`}
  onClick={() => setActiveSection("industrial")}
>
  <span className="sidebar-item__dot" />
  <span className="sidebar-item__label">{t.industrialSection}</span>
</button>

        <button
  className={`sidebar-item ${activeSection === "investments" ? "active" : ""}`}
  onClick={() => setActiveSection("investments")}
>
  <span className="sidebar-item__dot" />
  <span className="sidebar-item__label">{t.investmentsSection}</span>
</button>

        <button
  className={`sidebar-item ${activeSection === "latestWritings" ? "active" : ""}`}
  onClick={() => setActiveSection("latestWritings")}
>
  <span className="sidebar-item__dot" />
  <span className="sidebar-item__label">{t.latestWritingsSection}</span>
</button>

        <button
  className={`sidebar-item ${activeSection === "moments" ? "active" : ""}`}
  onClick={() => setActiveSection("moments")}
>
  <span className="sidebar-item__dot" />
  <span className="sidebar-item__label">{t.momentsSection}</span>
</button>

        <button
  className={`sidebar-item ${activeSection === "story" ? "active" : ""}`}
  onClick={() => setActiveSection("story")}
>
  <span className="sidebar-item__dot" />
  <span className="sidebar-item__label">{t.storySection}</span>
</button>

        <button
  className={`sidebar-item ${activeSection === "successStories" ? "active" : ""}`}
  onClick={() => setActiveSection("successStories")}
>
  <span className="sidebar-item__dot" />
  <span className="sidebar-item__label">{t.successStoriesSection}</span>
</button>

        <button
  className={`sidebar-item ${activeSection === "layout" ? "active" : ""}`}
  onClick={() => setActiveSection("layout")}
>
  <span className="sidebar-item__dot" />
  <span className="sidebar-item__label">{t.layoutSection}</span>
</button>

        <button
  className={`sidebar-item ${activeSection === "posts" ? "active" : ""}`}
  onClick={() => setActiveSection("posts")}
>
  <span className="sidebar-item__dot" />
  <span className="sidebar-item__label">{t.postsSection}</span>
</button>

       <button
  className={`sidebar-item ${activeSection === "experience" ? "active" : ""}`}
  onClick={() => setActiveSection("experience")}
>
  <span className="sidebar-item__dot" />
  <span className="sidebar-item__label">{t.experienceSection}</span>
</button>
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="language-switch sidebar-language-switch">
            <button
              className={lang === "ar" ? "active" : ""}
              onClick={() => setLang("ar")}
            >
              AR
            </button>
            <button
              className={lang === "en" ? "active" : ""}
              onClick={() => setLang("en")}
            >
              EN
            </button>
          </div>

          <button
            className="admin-btn admin-btn--ghost"
            onClick={handleLogout}
            style={{ width: "100%", marginTop: "12px" }}
          >
            {t.logout}
          </button>
        </div>
      </aside>

      <main
        className="main-content"
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <div
          className="page-animate"
          style={{
            width: "100%",
            maxWidth: "100%",
          }}
        >

          <div
            className="editor-layout page-animate"
            style={{
              display: "block",
              width: "100%",
              maxWidth: "100%",
            }}
          >
            {activeSection === "hero" && (
              <div
                className="editor-main"
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  flex: "0 0 100%",
                }}
              >
                {loading ? (
                  <div className="glass-card" style={{ padding: "30px", width: "100%" }}>
                    <h2>{t.loading}</h2>
                  </div>
                ) : (
                  <>
                    {(message || error) && (
                      <div
                        className="glass-card"
                        style={{
                          padding: "16px 20px",
                          marginBottom: "20px",
                          border: error ? "1px solid #ff4d4f" : "1px solid #22c55e",
                          width: "100%",
                          maxWidth: "100%",
                        }}
                      >
                        <strong>{error || message}</strong>
                      </div>
                    )}

                    <div className="editor-header glass-card" style={{ width: "100%", maxWidth: "100%" }}>
                      <div className="editor-header__text">
                        <span className="editor-badge">{t.formTitle}</span>
                        <h1>{t.heroSection}</h1>
                        <p>
                          {t.firestoreInfo}: <strong>{t.firestorePath}</strong>
                        </p>
                      </div>

                      <div className="editor-header__actions">
                        <button
                          className="admin-btn admin-btn--primary"
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving ? t.saving : t.save}
                        </button>
                      </div>
                    </div>

                    <div className="content-card glass-card" style={{ width: "100%", maxWidth: "100%" }}>
                      <div className="content-card__header">
                        <h2>{t.formTitle}</h2>
                      </div>

                      <div className="fields-grid" style={{ width: "100%", maxWidth: "100%" }}>
                        <div className="field-box">
                          <label>{t.badge}</label>
                          <input
                            type="text"
                            value={currentData.badge}
                            onChange={(e) => handleChange("badge", e.target.value)}
                          />
                        </div>

                        <div className="field-box field-box--full">
                          <label>{t.title}</label>
                          <input
                            type="text"
                            value={currentData.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                          />
                        </div>

                        <div className="field-box field-box--full">
                          <label>{t.description}</label>
                          <textarea
                            rows={5}
                            value={currentData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                          />
                        </div>

                        <div className="field-box">
                          <label>{t.primaryButtonText}</label>
                          <input
                            type="text"
                            value={currentData.primaryButtonText}
                            onChange={(e) =>
                              handleChange("primaryButtonText", e.target.value)
                            }
                          />
                        </div>

                        <div className="field-box">
                          <label>{t.primaryButtonLink}</label>
                          <input
                            type="text"
                            value={currentData.primaryButtonLink}
                            onChange={(e) =>
                              handleChange("primaryButtonLink", e.target.value)
                            }
                          />
                        </div>

                        <div className="field-box">
                          <label>{t.secondaryButtonText}</label>
                          <input
                            type="text"
                            value={currentData.secondaryButtonText}
                            onChange={(e) =>
                              handleChange("secondaryButtonText", e.target.value)
                            }
                          />
                        </div>

                        <div className="field-box">
                          <label>{t.secondaryButtonLink}</label>
                          <input
                            type="text"
                            value={currentData.secondaryButtonLink}
                            onChange={(e) =>
                              handleChange("secondaryButtonLink", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeSection === "about" && (
              <AboutSectionEditor lang={lang} user={user} />
            )}

            {activeSection === "expertise" && (
            <AreasOfExpertiseEditor lang={lang} user={user} />
            )}

            {activeSection === "contact" && (
  <ContactSectionEditor lang={lang} user={user} />
)}

           {activeSection === "discipline" && (
          <DisciplineSectionEditor lang={lang} user={user} />
           )}

           {activeSection === "faq" && (
  <FaqSectionEditor lang={lang} user={user} />
)}

          {activeSection === "industrial" && (
  <IndustrialBrandsEditor lang={lang} user={user} />
)}
           {activeSection === "investments" && (
  <InvestmentsProjectsEditor lang={lang} user={user} />
)}

           {activeSection === "latestWritings" && (
  <LatestWritingsEditor lang={lang} user={user} />
)}

           {activeSection === "moments" && (
  <MomentsMilestonesEditor lang={lang} user={user} />
)}

            {activeSection === "story" && (
  <StorySectionEditor lang={lang} user={user} />
)}

           {activeSection === "successStories" && (
  <SuccessStoriesEditor lang={lang} user={user} />
)}
          {activeSection === "layout" && (
  <LayoutSectionEditor lang={lang} user={user} />
)}  
           {activeSection === "posts" && (
  <PostsEditor lang={lang} user={user} />
)}

          {activeSection === "experience" && (
  <ExperienceSectionEditor lang={lang} user={user} />
)}
          </div>
        </div>
      </main>
    </div>
  );
}