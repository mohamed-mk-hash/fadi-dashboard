import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

const newsEventsUiText = {
  ar: {
    formTitle: "تعديل محتوى قسم الأخبار والفعاليات والاجتماعات",
    sectionTitle: "قسم الأخبار والفعاليات والاجتماعات",
    firestoreInfo: "المسار المستخدم في Firebase",
    firestorePath: "siteContent / News_events_meetings",

    currentWindow: "محتوى القسم الحالي",
    arabicEnglishWindow: "العربي / الإنجليزي",
    chinese: "الصينية",
    chineseWindowTitle: "نافذة إضافة محتوى الأخبار والفعاليات والاجتماعات بالصينية",
    chineseWindowDesc:
      "هذه النافذة لا تغيّر لغة لوحة التحكم، فقط تضيف محتوى صينيًا داخل نفس وثيقة Firebase.",

    eyebrow: "النص العلوي",
    title: "العنوان",
    description: "الوصف",
    button: "نص الزر",
    category: "التصنيف",
    fallbackTag: "الوسم الافتراضي",
    readSuffix: "لاحقة مدة القراءة",
    loadingText: "نص التحميل",

    save: "حفظ التعديلات",
    saving: "جارٍ الحفظ...",
    loading: "جارٍ تحميل البيانات...",
    fetchError: "حدث خطأ أثناء تحميل بيانات قسم الأخبار والفعاليات والاجتماعات",
    saveSuccess: "تم حفظ بيانات قسم الأخبار والفعاليات والاجتماعات بنجاح",
    saveError: "حدث خطأ أثناء حفظ بيانات قسم الأخبار والفعاليات والاجتماعات",

    note:
      "يمكنك تعديل النصوص التي تظهر في القسم بالصورة: النص العلوي، العنوان، الوصف، الزر، التصنيف، الوسم ومدة القراءة.",
  },

  en: {
    formTitle: "Edit News, Events & Meetings Content",
    sectionTitle: "News, Events & Meetings Section",
    firestoreInfo: "Firebase path used",
    firestorePath: "siteContent / News_events_meetings",

    currentWindow: "Current Section Content",
    arabicEnglishWindow: "Arabic / English",
    chinese: "Chinese",
    chineseWindowTitle: "Chinese News, Events & Meetings Content Window",
    chineseWindowDesc:
      "This window does not change the dashboard language. It only adds Chinese content to the same Firebase document.",

    eyebrow: "Eyebrow",
    title: "Title",
    description: "Description",
    button: "Button Text",
    category: "Category",
    fallbackTag: "Fallback Tag",
    readSuffix: "Read Suffix",
    loadingText: "Loading Text",

    save: "Save Changes",
    saving: "Saving...",
    loading: "Loading data...",
    fetchError: "Error loading news, events and meetings section data",
    saveSuccess: "News, events and meetings section saved successfully",
    saveError: "Error saving news, events and meetings section data",

    note:
      "You can edit the texts displayed in the section: eyebrow, title, description, button, category, fallback tag and read time suffix.",
  },
};

const emptyNewsEventsLanguageData = {
  eyebrow: "",
  title: "",
  description: "",
  button: "",
  category: "",
  fallbackTag: "",
  readSuffix: "",
  loading: "",
};

const defaultNewsEventsData = {
  ar: {
    eyebrow: "الأحدث",
    title: "الأخبار، الفعاليات والاجتماعات",
    description:
      "أحدث الأخبار واللقاءات والفعاليات المهنية، مع تغطية موجزة لأبرز المشاركات والتحديثات.",
    button: "عرض كل المنشورات",
    category: "خبر",
    fallbackTag: "قيادة",
    readSuffix: "دقائق قراءة",
    loading: "جارٍ التحميل...",
  },

  en: {
    eyebrow: "Latest",
    title: "News, Events & Meetings",
    description:
      "The latest industry news, interviews, events, technologies, and professional updates.",
    button: "View all posts",
    category: "News",
    fallbackTag: "Leadership",
    readSuffix: "min read",
    loading: "Loading...",
  },

  zh: {
    eyebrow: "最新",
    title: "新闻、活动与会议",
    description: "最新的行业新闻、采访、活动、技术与专业动态。",
    button: "查看所有文章",
    category: "新闻",
    fallbackTag: "领导力",
    readSuffix: "分钟阅读",
    loading: "加载中...",
  },
};

export default function NewsEventsMeetingsEditor({ lang = "ar", user }) {
  const [contentWindow, setContentWindow] = useState("default");
  const [activeDefaultLang, setActiveDefaultLang] = useState(lang === "en" ? "en" : "ar");
  const [formData, setFormData] = useState(defaultNewsEventsData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const t = newsEventsUiText[lang] || newsEventsUiText.ar;

  const currentDefaultData =
    formData[activeDefaultLang] || emptyNewsEventsLanguageData;

  const chineseData = formData.zh || emptyNewsEventsLanguageData;

  useEffect(() => {
    fetchNewsEventsData();
  }, []);

  const normalizeLanguageData = (languageData, fallbackData) => ({
    ...emptyNewsEventsLanguageData,
    ...fallbackData,
    ...(languageData || {}),
  });

  const fetchNewsEventsData = async () => {
    try {
      setLoading(true);
      setError("");

      const docRef = doc(db, "siteContent", "News_events_meetings");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setFormData({
          ar: normalizeLanguageData(data.ar, defaultNewsEventsData.ar),
          en: normalizeLanguageData(data.en, defaultNewsEventsData.en),
          zh: normalizeLanguageData(data.zh, defaultNewsEventsData.zh),
        });
      } else {
        await setDoc(docRef, {
          ...defaultNewsEventsData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          updatedBy: user?.email || "unknown",
        });

        setFormData(defaultNewsEventsData);
      }
    } catch (err) {
      console.error("Error fetching news events meetings data:", err);
      setError(t.fetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value, targetLang) => {
    setFormData((prev) => ({
      ...prev,
      [targetLang]: {
        ...(prev[targetLang] || emptyNewsEventsLanguageData),
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const docRef = doc(db, "siteContent", "News_events_meetings");

      await setDoc(
        docRef,
        {
          ar: normalizeLanguageData(formData.ar, defaultNewsEventsData.ar),
          en: normalizeLanguageData(formData.en, defaultNewsEventsData.en),
          zh: normalizeLanguageData(formData.zh, defaultNewsEventsData.zh),
          updatedAt: serverTimestamp(),
          updatedBy: user?.email || "unknown",
        },
        { merge: true }
      );

      setMessage(t.saveSuccess);
    } catch (err) {
      console.error("Error saving news events meetings data:", err);
      setError(t.saveError);
    } finally {
      setSaving(false);

      setTimeout(() => {
        setMessage("");
        setError("");
      }, 3000);
    }
  };

  const renderFields = (data, targetLang) => {
    const isArabic = targetLang === "ar";

    return (
      <div
        className="fields-grid"
        dir={isArabic ? "rtl" : "ltr"}
        style={{
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <div className="field-box">
          <label>{t.eyebrow}</label>
          <input
            type="text"
            value={data.eyebrow || ""}
            onChange={(e) => handleChange("eyebrow", e.target.value, targetLang)}
          />
        </div>

        <div className="field-box">
          <label>{t.button}</label>
          <input
            type="text"
            value={data.button || ""}
            onChange={(e) => handleChange("button", e.target.value, targetLang)}
          />
        </div>

        <div className="field-box field-box--full">
          <label>{t.title}</label>
          <input
            type="text"
            value={data.title || ""}
            onChange={(e) => handleChange("title", e.target.value, targetLang)}
          />
        </div>

        <div className="field-box field-box--full">
          <label>{t.description}</label>
          <textarea
            rows={5}
            value={data.description || ""}
            onChange={(e) =>
              handleChange("description", e.target.value, targetLang)
            }
          />
        </div>

        <div className="field-box">
          <label>{t.category}</label>
          <input
            type="text"
            value={data.category || ""}
            onChange={(e) => handleChange("category", e.target.value, targetLang)}
          />
        </div>

        <div className="field-box">
          <label>{t.fallbackTag}</label>
          <input
            type="text"
            value={data.fallbackTag || ""}
            onChange={(e) =>
              handleChange("fallbackTag", e.target.value, targetLang)
            }
          />
        </div>

        <div className="field-box">
          <label>{t.readSuffix}</label>
          <input
            type="text"
            value={data.readSuffix || ""}
            onChange={(e) =>
              handleChange("readSuffix", e.target.value, targetLang)
            }
          />
        </div>

        <div className="field-box">
          <label>{t.loadingText}</label>
          <input
            type="text"
            value={data.loading || ""}
            onChange={(e) => handleChange("loading", e.target.value, targetLang)}
          />
        </div>
      </div>
    );
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
              className={contentWindow === "default" ? "active" : ""}
              onClick={() => setContentWindow("default")}
            >
              {t.arabicEnglishWindow}
            </button>

            <button
              type="button"
              className={contentWindow === "chinese" ? "active" : ""}
              onClick={() => setContentWindow("chinese")}
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

      {contentWindow === "default" && (
        <div
          className="content-card glass-card"
          style={{
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <div className="content-card__header">
            <div>
              <h2>{t.currentWindow}</h2>
              <p style={{ marginTop: "8px" }}>{t.note}</p>
            </div>
          </div>

          <div
            className="language-switch"
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            <button
              type="button"
              className={activeDefaultLang === "ar" ? "active" : ""}
              onClick={() => setActiveDefaultLang("ar")}
            >
              {t.arabic || "العربية"}
            </button>

            <button
              type="button"
              className={activeDefaultLang === "en" ? "active" : ""}
              onClick={() => setActiveDefaultLang("en")}
            >
              {t.english || "English"}
            </button>
          </div>

          {renderFields(currentDefaultData, activeDefaultLang)}
        </div>
      )}

      {contentWindow === "chinese" && (
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

          {renderFields(chineseData, "zh")}
        </div>
      )}
    </div>
  );
}