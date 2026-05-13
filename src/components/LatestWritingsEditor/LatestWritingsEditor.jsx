import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

const latestWritingsUiText = {
  ar: {
    formTitle: "تعديل محتوى قسم آخر الكتابات",
    sectionTitle: "قسم آخر الكتابات",
    firestoreInfo: "المسار المستخدم في Firebase",
    firestorePath: "siteContent / Latest_writings",
    title: "العنوان",
    description: "الوصف",
    currentWindow: "محتوى القسم الحالي",
    chinese: "الصينية",
    chineseWindowTitle: "نافذة إضافة محتوى آخر الكتابات بالصينية",
    chineseWindowDesc:
      "هذه النافذة لا تغيّر لغة لوحة التحكم، فقط تضيف محتوى صينيًا داخل نفس وثيقة Firebase.",
    save: "حفظ التعديلات",
    saving: "جارٍ الحفظ...",
    loading: "جارٍ تحميل البيانات...",
    fetchError: "حدث خطأ أثناء تحميل بيانات قسم آخر الكتابات",
    saveSuccess: "تم حفظ بيانات قسم آخر الكتابات بنجاح",
    saveError: "حدث خطأ أثناء حفظ بيانات قسم آخر الكتابات",
    note: "ملاحظة: بطاقات السلايدر ثابتة حاليًا داخل الكود وليست مربوطة بقاعدة البيانات.",
  },
  en: {
    formTitle: "Edit Latest Writings Content",
    sectionTitle: "Latest Writings Section",
    firestoreInfo: "Firebase path used",
    firestorePath: "siteContent / Latest_writings",
    title: "Title",
    description: "Description",
    currentWindow: "Current Section Content",
    chinese: "Chinese",
    chineseWindowTitle: "Chinese Latest Writings Content Window",
    chineseWindowDesc:
      "This window does not change the dashboard language. It only adds Chinese content to the same Firebase document.",
    save: "Save Changes",
    saving: "Saving...",
    loading: "Loading data...",
    fetchError: "Error loading latest writings section data",
    saveSuccess: "Latest writings section saved successfully",
    saveError: "Error saving latest writings section data",
    note: "Note: The slider cards are currently static in the code and are not connected to Firestore.",
  },
};

const emptyLatestWritingsLanguageData = {
  title: "",
  description: "",
};

const defaultLatestWritingsData = {
  ar: { ...emptyLatestWritingsLanguageData },
  en: { ...emptyLatestWritingsLanguageData },
  zh: { ...emptyLatestWritingsLanguageData },
};

export default function LatestWritingsEditor({ lang = "ar", user }) {
  const [latestWindow, setLatestWindow] = useState("default");
  const [formData, setFormData] = useState(defaultLatestWritingsData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const t = latestWritingsUiText[lang];
  const currentData = formData[lang] || emptyLatestWritingsLanguageData;
  const chineseData = formData.zh || emptyLatestWritingsLanguageData;

  useEffect(() => {
    fetchLatestWritingsData();
  }, []);

  const fetchLatestWritingsData = async () => {
    try {
      setLoading(true);
      setError("");

      const docRef = doc(db, "siteContent", "Latest_writings");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setFormData({
          ar: {
            ...defaultLatestWritingsData.ar,
            ...(data.ar || {}),
          },
          en: {
            ...defaultLatestWritingsData.en,
            ...(data.en || {}),
          },
          zh: {
            ...defaultLatestWritingsData.zh,
            ...(data.zh || {}),
          },
        });
      } else {
        await setDoc(docRef, defaultLatestWritingsData);
        setFormData(defaultLatestWritingsData);
      }
    } catch (err) {
      console.error("Error fetching latest writings data:", err);
      setError(t.fetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value, targetLang = lang) => {
    setFormData((prev) => ({
      ...prev,
      [targetLang]: {
        ...(prev[targetLang] || emptyLatestWritingsLanguageData),
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const docRef = doc(db, "siteContent", "Latest_writings");

      await setDoc(
        docRef,
        {
          ar: formData.ar || defaultLatestWritingsData.ar,
          en: formData.en || defaultLatestWritingsData.en,
          zh: formData.zh || defaultLatestWritingsData.zh,
          updatedAt: serverTimestamp(),
          updatedBy: user?.email || "unknown",
        },
        { merge: true }
      );

      setMessage(t.saveSuccess);
    } catch (err) {
      console.error("Error saving latest writings data:", err);
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
              className={latestWindow === "default" ? "active" : ""}
              onClick={() => setLatestWindow("default")}
            >
              {lang === "ar" ? "العربي / الإنجليزي" : "AR / EN"}
            </button>

            <button
              type="button"
              className={latestWindow === "chinese" ? "active" : ""}
              onClick={() => setLatestWindow("chinese")}
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

      {latestWindow === "default" && (
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
            style={{
              marginBottom: "16px",
              padding: "12px 14px",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
            }}
          >
            {t.note}
          </div>

          <div className="fields-grid" style={{ width: "100%", maxWidth: "100%" }}>
            <div className="field-box field-box--full">
              <label>{t.title}</label>
              <input
                type="text"
                value={currentData.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>

            <div className="field-box field-box--full">
              <label>{t.description}</label>
              <textarea
                rows={5}
                value={currentData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {latestWindow === "chinese" && (
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
            style={{
              marginBottom: "16px",
              padding: "12px 14px",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
            }}
          >
            {t.note}
          </div>

          <div className="fields-grid" style={{ width: "100%", maxWidth: "100%" }}>
            <div className="field-box field-box--full">
              <label>{t.title} / Chinese</label>
              <input
                type="text"
                value={chineseData.title || ""}
                onChange={(e) => handleChange("title", e.target.value, "zh")}
              />
            </div>

            <div className="field-box field-box--full">
              <label>{t.description} / Chinese</label>
              <textarea
                rows={5}
                value={chineseData.description || ""}
                onChange={(e) =>
                  handleChange("description", e.target.value, "zh")
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}