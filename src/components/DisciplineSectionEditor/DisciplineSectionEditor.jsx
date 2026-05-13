import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

const alNassajUiText = {
  ar: {
    formTitle: "تعديل محتوى النساج",
    sectionTitle: "قسم النساج",
    firestoreInfo: "المسار المستخدم في Firebase",
    firestorePath: "siteContent / Al-Nassaj",

    arabicEnglish: "العربي / الإنجليزي",
    chinese: "الصينية",
    currentWindow: "محتوى القسم الحالي",
    chineseWindowTitle: "نافذة إضافة محتوى النساج بالصينية",
    chineseWindowDesc:
      "هذه النافذة لا تغيّر لغة لوحة التحكم، فقط تضيف محتوى صينيًا داخل نفس وثيقة Firebase.",

    badge: "Badge",
    title: "العنوان",
    description: "الوصف",
    buttonText: "نص الزر",

    save: "حفظ التعديلات",
    saving: "جارٍ الحفظ...",
    loading: "جارٍ تحميل البيانات...",
    fetchError: "حدث خطأ أثناء تحميل بيانات قسم النساج",
    saveSuccess: "تم حفظ بيانات قسم النساج بنجاح",
    saveError: "حدث خطأ أثناء حفظ بيانات قسم النساج",
  },

  en: {
    formTitle: "Edit Al-Nassaj Content",
    sectionTitle: "Al-Nassaj Section",
    firestoreInfo: "Firebase path used",
    firestorePath: "siteContent / Al-Nassaj",

    arabicEnglish: "AR / EN",
    chinese: "Chinese",
    currentWindow: "Current Section Content",
    chineseWindowTitle: "Chinese Al-Nassaj Content Window",
    chineseWindowDesc:
      "This window does not change the dashboard language. It only adds Chinese content to the same Firebase document.",

    badge: "Badge",
    title: "Title",
    description: "Description",
    buttonText: "Button Text",

    save: "Save Changes",
    saving: "Saving...",
    loading: "Loading data...",
    fetchError: "Error loading Al-Nassaj section data",
    saveSuccess: "Al-Nassaj section saved successfully",
    saveError: "Error saving Al-Nassaj section data",
  },
};

const emptyAlNassajLanguageData = {
  badge: "",
  title: "",
  description: "",
  button_text: "",
};

const defaultAlNassajData = {
  ar: { ...emptyAlNassajLanguageData },
  en: { ...emptyAlNassajLanguageData },
  zh: { ...emptyAlNassajLanguageData },
};

export default function DisciplineSectionEditor({ lang = "ar", user }) {
  const [alNassajWindow, setAlNassajWindow] = useState("default");
  const [formData, setFormData] = useState(defaultAlNassajData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const t = alNassajUiText[lang] || alNassajUiText.ar;
  const currentData = formData[lang] || emptyAlNassajLanguageData;
  const chineseData = formData.zh || emptyAlNassajLanguageData;

  useEffect(() => {
    fetchAlNassajData();
  }, []);

  const fetchAlNassajData = async () => {
    try {
      setLoading(true);
      setError("");

      const docRef = doc(db, "siteContent", "Al-Nassaj");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setFormData({
          ar: {
            ...defaultAlNassajData.ar,
            ...(data.ar || {}),
          },
          en: {
            ...defaultAlNassajData.en,
            ...(data.en || {}),
          },
          zh: {
            ...defaultAlNassajData.zh,
            ...(data.zh || {}),
          },
        });
      } else {
        await setDoc(docRef, defaultAlNassajData);
        setFormData(defaultAlNassajData);
      }
    } catch (err) {
      console.error("Error fetching Al-Nassaj data:", err);
      setError(t.fetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value, targetLang = lang) => {
    setFormData((prev) => ({
      ...prev,
      [targetLang]: {
        ...(prev[targetLang] || emptyAlNassajLanguageData),
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const docRef = doc(db, "siteContent", "Al-Nassaj");

      await setDoc(
        docRef,
        {
          ar: formData.ar || defaultAlNassajData.ar,
          en: formData.en || defaultAlNassajData.en,
          zh: formData.zh || defaultAlNassajData.zh,
          updatedAt: serverTimestamp(),
          updatedBy: user?.email || "unknown",
        },
        { merge: true }
      );

      setMessage(t.saveSuccess);
    } catch (err) {
      console.error("Error saving Al-Nassaj data:", err);
      setError(t.saveError);
    } finally {
      setSaving(false);

      setTimeout(() => {
        setMessage("");
        setError("");
      }, 3000);
    }
  };

  const renderFields = (data, targetLang = lang, suffix = "") => (
    <div
      className="fields-grid"
      style={{
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <div className="field-box">
        <label>
          {t.badge}
          {suffix}
        </label>
        <input
          type="text"
          value={data.badge || ""}
          onChange={(e) => handleChange("badge", e.target.value, targetLang)}
        />
      </div>

      <div className="field-box field-box--full">
        <label>
          {t.title}
          {suffix}
        </label>
        <input
          type="text"
          value={data.title || ""}
          onChange={(e) => handleChange("title", e.target.value, targetLang)}
        />
      </div>

      <div className="field-box field-box--full">
        <label>
          {t.description}
          {suffix}
        </label>
        <textarea
          rows={5}
          value={data.description || ""}
          onChange={(e) =>
            handleChange("description", e.target.value, targetLang)
          }
        />
      </div>

      <div className="field-box field-box--full">
        <label>
          {t.buttonText}
          {suffix}
        </label>
        <input
          type="text"
          value={data.button_text || ""}
          onChange={(e) =>
            handleChange("button_text", e.target.value, targetLang)
          }
        />
      </div>
    </div>
  );

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
              className={alNassajWindow === "default" ? "active" : ""}
              onClick={() => setAlNassajWindow("default")}
            >
              {t.arabicEnglish}
            </button>

            <button
              type="button"
              className={alNassajWindow === "chinese" ? "active" : ""}
              onClick={() => setAlNassajWindow("chinese")}
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

      {alNassajWindow === "default" && (
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

          {renderFields(currentData)}
        </div>
      )}

      {alNassajWindow === "chinese" && (
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

          {renderFields(chineseData, "zh", " / Chinese")}
        </div>
      )}
    </div>
  );
}