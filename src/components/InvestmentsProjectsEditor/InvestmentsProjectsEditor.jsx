import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

const investmentsUiText = {
  ar: {
    formTitle: "تعديل محتوى قسم الاستثمارات والمشاريع",
    sectionTitle: "قسم الاستثمارات والمشاريع",
    firestoreInfo: "المسار المستخدم في Firebase",
    firestorePath: "siteContent / Businesses",
    title: "النص العلوي",
    subtitle: "العنوان الرئيسي",
    save: "حفظ التعديلات",
    saving: "جارٍ الحفظ...",
    loading: "جارٍ تحميل البيانات...",
    fetchError: "حدث خطأ أثناء تحميل بيانات قسم الاستثمارات والمشاريع",
    saveSuccess: "تم حفظ بيانات قسم الاستثمارات والمشاريع بنجاح",
    saveError: "حدث خطأ أثناء حفظ بيانات قسم الاستثمارات والمشاريع",
    note: "ملاحظة: البطاقات داخل السلايدر ثابتة حاليًا في الكود وليست مربوطة بقاعدة البيانات.",
  },
  en: {
    formTitle: "Edit Investments & Projects Content",
    sectionTitle: "Investments & Projects Section",
    firestoreInfo: "Firebase path used",
    firestorePath: "siteContent / Businesses",
    title: "Top Text",
    subtitle: "Main Title",
    save: "Save Changes",
    saving: "Saving...",
    loading: "Loading data...",
    fetchError: "Error loading investments section data",
    saveSuccess: "Investments section saved successfully",
    saveError: "Error saving investments section data",
    note: "Note: The slider cards are currently static in the code and are not connected to Firestore.",
  },
};

const defaultInvestmentsData = {
  ar: {
    title: "",
    subtitle: "",
  },
  en: {
    title: "",
    subtitle: "",
  },
};

export default function InvestmentsProjectsEditor({ lang = "ar", user }) {
  const [formData, setFormData] = useState(defaultInvestmentsData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const t = investmentsUiText[lang];
  const currentData = formData[lang];

  useEffect(() => {
    fetchInvestmentsData();
  }, []);

  const fetchInvestmentsData = async () => {
    try {
      setLoading(true);
      setError("");

      const docRef = doc(db, "siteContent", "Businesses");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setFormData({
          ar: {
            ...defaultInvestmentsData.ar,
            ...(data.ar || {}),
          },
          en: {
            ...defaultInvestmentsData.en,
            ...(data.en || {}),
          },
        });
      } else {
        await setDoc(docRef, defaultInvestmentsData);
        setFormData(defaultInvestmentsData);
      }
    } catch (err) {
      console.error("Error fetching investments data:", err);
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

      const docRef = doc(db, "siteContent", "Businesses");

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
      console.error("Error saving investments data:", err);
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
            <label>{t.subtitle}</label>
            <input
              type="text"
              value={currentData.subtitle || ""}
              onChange={(e) => handleChange("subtitle", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}