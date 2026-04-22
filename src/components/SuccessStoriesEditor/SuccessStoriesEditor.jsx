import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

const successStoriesUiText = {
  ar: {
    formTitle: "تعديل محتوى قسم قصص النجاح",
    sectionTitle: "قسم قصص النجاح",
    firestoreInfo: "المسار المستخدم في Firebase",
    firestorePath: "siteContent / succes_stories",
    title: "العنوان",
    description: "الوصف",
    cardTitle: "عنوان البطاقة",
    number: "الرقم / الشارة",
    descriptionCard: "وصف البطاقة",
    save: "حفظ التعديلات",
    saving: "جارٍ الحفظ...",
    loading: "جارٍ تحميل البيانات...",
    fetchError: "حدث خطأ أثناء تحميل بيانات قسم قصص النجاح",
    saveSuccess: "تم حفظ بيانات قسم قصص النجاح بنجاح",
    saveError: "حدث خطأ أثناء حفظ بيانات قسم قصص النجاح",
    note: "ملاحظة: الخلفيات والصور والأيقونات ثابتة حاليًا داخل الكود، كما أن نفس محتوى البطاقة يتكرر على جميع السلايدات.",
  },
  en: {
    formTitle: "Edit Success Stories Content",
    sectionTitle: "Success Stories Section",
    firestoreInfo: "Firebase path used",
    firestorePath: "siteContent / succes_stories",
    title: "Title",
    description: "Description",
    cardTitle: "Card Title",
    number: "Number / Badge",
    descriptionCard: "Card Description",
    save: "Save Changes",
    saving: "Saving...",
    loading: "Loading data...",
    fetchError: "Error loading success stories section data",
    saveSuccess: "Success stories section saved successfully",
    saveError: "Error saving success stories section data",
    note: "Note: Backgrounds, images, and icons are currently static in the code, and the same card content is repeated across all slides.",
  },
};

const defaultSuccessStoriesData = {
  ar: {
    title: "",
    description: "",
    card_title: "",
    number: "",
    description_card: "",
  },
  en: {
    title: "",
    description: "",
    card_title: "",
    number: "",
    description_card: "",
  },
};

export default function SuccessStoriesEditor({ lang = "ar", user }) {
  const [formData, setFormData] = useState(defaultSuccessStoriesData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const t = successStoriesUiText[lang];
  const currentData = formData[lang];

  useEffect(() => {
    fetchSuccessStoriesData();
  }, []);

  const fetchSuccessStoriesData = async () => {
    try {
      setLoading(true);
      setError("");

      const docRef = doc(db, "siteContent", "succes_stories");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setFormData({
          ar: {
            ...defaultSuccessStoriesData.ar,
            ...(data.ar || {}),
          },
          en: {
            ...defaultSuccessStoriesData.en,
            ...(data.en || {}),
          },
        });
      } else {
        await setDoc(docRef, defaultSuccessStoriesData);
        setFormData(defaultSuccessStoriesData);
      }
    } catch (err) {
      console.error("Error fetching success stories data:", err);
      setError(t.fetchError);
    } finally {
      setLoading(false);
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

      const docRef = doc(db, "siteContent", "succes_stories");

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
      console.error("Error saving success stories data:", err);
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

      <div
        className="content-card glass-card"
        style={{
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <div className="content-card__header">
          <h2>{t.formTitle}</h2>
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
              value={currentData.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          <div className="field-box field-box--full">
            <label>{t.description}</label>
            <textarea
              rows={4}
              value={currentData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.cardTitle}</label>
            <input
              type="text"
              value={currentData.card_title || ""}
              onChange={(e) => handleChange("card_title", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.number}</label>
            <input
              type="text"
              value={currentData.number || ""}
              onChange={(e) => handleChange("number", e.target.value)}
            />
          </div>

          <div className="field-box field-box--full">
            <label>{t.descriptionCard}</label>
            <textarea
              rows={5}
              value={currentData.description_card || ""}
              onChange={(e) => handleChange("description_card", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}