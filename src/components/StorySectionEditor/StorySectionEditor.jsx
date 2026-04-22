import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

const storyUiText = {
  ar: {
    formTitle: "تعديل محتوى قسم القصة",
    sectionTitle: "قسم القصة",
    firestoreInfo: "المسار المستخدم في Firebase",
    firestorePath: "siteContent / story_video",
    title: "العنوان",
    description: "الوصف",
    save: "حفظ التعديلات",
    saving: "جارٍ الحفظ...",
    loading: "جارٍ تحميل البيانات...",
    fetchError: "حدث خطأ أثناء تحميل بيانات قسم القصة",
    saveSuccess: "تم حفظ بيانات قسم القصة بنجاح",
    saveError: "حدث خطأ أثناء حفظ بيانات قسم القصة",
    note: "ملاحظة: الفيديو والشكل الجانبي ثابتان حاليًا داخل الكود وليسا مربوطين بقاعدة البيانات.",
  },
  en: {
    formTitle: "Edit Story Section Content",
    sectionTitle: "Story Section",
    firestoreInfo: "Firebase path used",
    firestorePath: "siteContent / story_video",
    title: "Title",
    description: "Description",
    save: "Save Changes",
    saving: "Saving...",
    loading: "Loading data...",
    fetchError: "Error loading story section data",
    saveSuccess: "Story section saved successfully",
    saveError: "Error saving story section data",
    note: "Note: The video and side decorative shape are currently static in the code and are not connected to Firestore.",
  },
};

const defaultStoryData = {
  ar: {
    title: "",
    description: "",
  },
  en: {
    title: "",
    description: "",
  },
};

export default function StorySectionEditor({ lang = "ar", user }) {
  const [formData, setFormData] = useState(defaultStoryData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const t = storyUiText[lang];
  const currentData = formData[lang];

  useEffect(() => {
    fetchStoryData();
  }, []);

  const fetchStoryData = async () => {
    try {
      setLoading(true);
      setError("");

      const docRef = doc(db, "siteContent", "story_video");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setFormData({
          ar: {
            ...defaultStoryData.ar,
            ...(data.ar || {}),
          },
          en: {
            ...defaultStoryData.en,
            ...(data.en || {}),
          },
        });
      } else {
        await setDoc(docRef, defaultStoryData);
        setFormData(defaultStoryData);
      }
    } catch (err) {
      console.error("Error fetching story data:", err);
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

      const docRef = doc(db, "siteContent", "story_video");

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
      console.error("Error saving story data:", err);
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
              rows={5}
              value={currentData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}