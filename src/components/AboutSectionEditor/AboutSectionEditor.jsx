import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

const aboutUiText = {
  ar: {
    formTitle: "تعديل محتوى قسم من أنا",
    sectionTitle: "قسم من أنا",
    firestoreInfo: "المسار المستخدم في Firebase",
    firestorePath: "siteContent / About",
    title: "العنوان",
    description: "الوصف",
    imageDescription: "النص فوق الصورة",
    experienceNumber: "رقم الخبرة",
    experienceTitle: "عنوان الخبرة",
    foundationNumber: "رقم التأسيس",
    foundationTitle: "عنوان التأسيس",
    currentWindow: "محتوى القسم الحالي",
    chinese: "الصينية",
    chineseWindowTitle: "نافذة إضافة محتوى قسم من أنا بالصينية",
    chineseWindowDesc:
      "هذه النافذة لا تغيّر لغة لوحة التحكم، فقط تضيف محتوى صينيًا داخل نفس وثيقة Firebase.",
    save: "حفظ التعديلات",
    saving: "جارٍ الحفظ...",
    loading: "جارٍ تحميل البيانات...",
    fetchError: "حدث خطأ أثناء تحميل بيانات قسم من أنا",
    saveSuccess: "تم حفظ بيانات قسم من أنا بنجاح",
    saveError: "حدث خطأ أثناء حفظ بيانات قسم من أنا",
  },
  en: {
    formTitle: "Edit About Me Content",
    sectionTitle: "About Me Section",
    firestoreInfo: "Firebase path used",
    firestorePath: "siteContent / About",
    title: "Title",
    description: "Description",
    imageDescription: "Image Overlay Text",
    experienceNumber: "Experience Number",
    experienceTitle: "Experience Title",
    foundationNumber: "Foundation Number",
    foundationTitle: "Foundation Title",
    currentWindow: "Current Section Content",
    chinese: "Chinese",
    chineseWindowTitle: "Chinese About Section Content Window",
    chineseWindowDesc:
      "This window does not change the dashboard language. It only adds Chinese content to the same Firebase document.",
    save: "Save Changes",
    saving: "Saving...",
    loading: "Loading data...",
    fetchError: "Error loading About section data",
    saveSuccess: "About section saved successfully",
    saveError: "Error saving About section data",
  },
};

const emptyAboutLanguageData = {
  title: "",
  description: "",
  experience_number: "",
  experience_title: "",
  foundation_number: "",
  foundation_title: "",
  image_description: "",
};

const defaultAboutData = {
  ar: { ...emptyAboutLanguageData },
  en: { ...emptyAboutLanguageData },
  zh: { ...emptyAboutLanguageData },
};

export default function AboutSectionEditor({ lang = "ar", user }) {
  const [aboutWindow, setAboutWindow] = useState("default");
  const [formData, setFormData] = useState(defaultAboutData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const t = aboutUiText[lang];
  const currentData = formData[lang] || emptyAboutLanguageData;
  const chineseData = formData.zh || emptyAboutLanguageData;

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      setError("");

      const docRef = doc(db, "siteContent", "About");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setFormData({
          ar: {
            ...defaultAboutData.ar,
            ...(data.ar || {}),
          },
          en: {
            ...defaultAboutData.en,
            ...(data.en || {}),
          },
          zh: {
            ...defaultAboutData.zh,
            ...(data.zh || {}),
          },
        });
      } else {
        await setDoc(docRef, defaultAboutData);
        setFormData(defaultAboutData);
      }
    } catch (err) {
      console.error("Error fetching about data:", err);
      setError(t.fetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value, targetLang = lang) => {
    setFormData((prev) => ({
      ...prev,
      [targetLang]: {
        ...(prev[targetLang] || emptyAboutLanguageData),
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const docRef = doc(db, "siteContent", "About");

      await setDoc(
        docRef,
        {
          ar: formData.ar || defaultAboutData.ar,
          en: formData.en || defaultAboutData.en,
          zh: formData.zh || defaultAboutData.zh,
          updatedAt: serverTimestamp(),
          updatedBy: user?.email || "unknown",
        },
        { merge: true }
      );

      setMessage(t.saveSuccess);
    } catch (err) {
      console.error("Error saving about data:", err);
      setError(t.saveError);
    } finally {
      setSaving(false);

      setTimeout(() => {
        setMessage("");
        setError("");
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: "30px", width: "100%" }}>
        <h2>{t.loading}</h2>
      </div>
    );
  }

  return (
    <div
      className="editor-main"
      style={{
        width: "100%",
        maxWidth: "100%",
        flex: "0 0 100%",
      }}
    >
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

      <div
        className="editor-header glass-card"
        style={{
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <div className="editor-header__text">
          <span className="editor-badge">{t.formTitle}</span>
          <h1>{t.sectionTitle}</h1>
          <p>
            {t.firestoreInfo}: <strong>{t.firestorePath}</strong>
          </p>
        </div>

        <div
          className="editor-header__actions"
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div className="language-switch">
            <button
              type="button"
              className={aboutWindow === "default" ? "active" : ""}
              onClick={() => setAboutWindow("default")}
            >
              {lang === "ar" ? "العربي / الإنجليزي" : "AR / EN"}
            </button>

            <button
              type="button"
              className={aboutWindow === "chinese" ? "active" : ""}
              onClick={() => setAboutWindow("chinese")}
            >
              {t.chinese}
            </button>
          </div>

          <button
            className="admin-btn admin-btn--primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? t.saving : t.save}
          </button>
        </div>
      </div>

      {aboutWindow === "default" && (
        <div
          className="content-card glass-card"
          style={{
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <div className="content-card__header">
            <h2>{t.currentWindow}</h2>
          </div>

          <div
            className="fields-grid"
            style={{
              width: "100%",
              maxWidth: "100%",
            }}
          >
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

            <div className="field-box field-box--full">
              <label>{t.imageDescription}</label>
              <textarea
                rows={3}
                value={currentData.image_description}
                onChange={(e) =>
                  handleChange("image_description", e.target.value)
                }
              />
            </div>

            <div className="field-box">
              <label>{t.experienceNumber}</label>
              <input
                type="text"
                value={currentData.experience_number}
                onChange={(e) =>
                  handleChange("experience_number", e.target.value)
                }
              />
            </div>

            <div className="field-box">
              <label>{t.experienceTitle}</label>
              <input
                type="text"
                value={currentData.experience_title}
                onChange={(e) =>
                  handleChange("experience_title", e.target.value)
                }
              />
            </div>

            <div className="field-box">
              <label>{t.foundationNumber}</label>
              <input
                type="text"
                value={currentData.foundation_number}
                onChange={(e) =>
                  handleChange("foundation_number", e.target.value)
                }
              />
            </div>

            <div className="field-box">
              <label>{t.foundationTitle}</label>
              <input
                type="text"
                value={currentData.foundation_title}
                onChange={(e) =>
                  handleChange("foundation_title", e.target.value)
                }
              />
            </div>
          </div>
        </div>
      )}

      {aboutWindow === "chinese" && (
        <div
          className="content-card glass-card"
          style={{
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <div className="content-card__header">
            <div>
              <h2>{t.chineseWindowTitle}</h2>
              <p style={{ marginTop: "8px" }}>{t.chineseWindowDesc}</p>
            </div>
          </div>

          <div
            className="fields-grid"
            style={{
              width: "100%",
              maxWidth: "100%",
            }}
          >
            <div className="field-box field-box--full">
              <label>{t.title} / Chinese</label>
              <input
                type="text"
                value={chineseData.title}
                onChange={(e) => handleChange("title", e.target.value, "zh")}
              />
            </div>

            <div className="field-box field-box--full">
              <label>{t.description} / Chinese</label>
              <textarea
                rows={5}
                value={chineseData.description}
                onChange={(e) =>
                  handleChange("description", e.target.value, "zh")
                }
              />
            </div>

            <div className="field-box field-box--full">
              <label>{t.imageDescription} / Chinese</label>
              <textarea
                rows={3}
                value={chineseData.image_description}
                onChange={(e) =>
                  handleChange("image_description", e.target.value, "zh")
                }
              />
            </div>

            <div className="field-box">
              <label>{t.experienceNumber} / Chinese</label>
              <input
                type="text"
                value={chineseData.experience_number}
                onChange={(e) =>
                  handleChange("experience_number", e.target.value, "zh")
                }
              />
            </div>

            <div className="field-box">
              <label>{t.experienceTitle} / Chinese</label>
              <input
                type="text"
                value={chineseData.experience_title}
                onChange={(e) =>
                  handleChange("experience_title", e.target.value, "zh")
                }
              />
            </div>

            <div className="field-box">
              <label>{t.foundationNumber} / Chinese</label>
              <input
                type="text"
                value={chineseData.foundation_number}
                onChange={(e) =>
                  handleChange("foundation_number", e.target.value, "zh")
                }
              />
            </div>

            <div className="field-box">
              <label>{t.foundationTitle} / Chinese</label>
              <input
                type="text"
                value={chineseData.foundation_title}
                onChange={(e) =>
                  handleChange("foundation_title", e.target.value, "zh")
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}