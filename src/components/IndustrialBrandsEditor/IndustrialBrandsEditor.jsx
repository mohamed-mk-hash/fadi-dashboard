import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

const industrialUiText = {
  ar: {
    formTitle: "تعديل محتوى قسم العلامات الصناعية",
    sectionTitle: "قسم العلامات الصناعية",
    firestoreInfo: "المسار المستخدم في Firebase",
    firestorePath: "siteContent / Industrial",

    title: "العنوان",
    description: "الوصف",
    tagOne: "الوسم الأول",
    tagTwo: "الوسم الثاني",
    tagThree: "الوسم الثالث",
    tagFour: "الوسم الرابع",
    tagFive: "الوسم الخامس",

    save: "حفظ التعديلات",
    saving: "جارٍ الحفظ...",
    loading: "جارٍ تحميل البيانات...",
    fetchError: "حدث خطأ أثناء تحميل بيانات قسم العلامات الصناعية",
    saveSuccess: "تم حفظ بيانات قسم العلامات الصناعية بنجاح",
    saveError: "حدث خطأ أثناء حفظ بيانات قسم العلامات الصناعية",
  },
  en: {
    formTitle: "Edit Industrial Brands Content",
    sectionTitle: "Industrial Brands Section",
    firestoreInfo: "Firebase path used",
    firestorePath: "siteContent / Industrial",

    title: "Title",
    description: "Description",
    tagOne: "Tag One",
    tagTwo: "Tag Two",
    tagThree: "Tag Three",
    tagFour: "Tag Four",
    tagFive: "Tag Five",

    save: "Save Changes",
    saving: "Saving...",
    loading: "Loading data...",
    fetchError: "Error loading industrial brands section data",
    saveSuccess: "Industrial brands section saved successfully",
    saveError: "Error saving industrial brands section data",
  },
};

const defaultIndustrialData = {
  ar: {
    title: "",
    description: "",
    tag_one: "",
    tag_two: "",
    tag_three: "",
    tag_four: "",
    tag_five: "",
  },
  en: {
    title: "",
    description: "",
    tag_one: "",
    tag_two: "",
    tag_three: "",
    tag_four: "",
    tag_five: "",
  },
};

export default function IndustrialBrandsEditor({ lang = "ar", user }) {
  const [formData, setFormData] = useState(defaultIndustrialData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const t = industrialUiText[lang];
  const currentData = formData[lang];

  useEffect(() => {
    fetchIndustrialData();
  }, []);

  const fetchIndustrialData = async () => {
    try {
      setLoading(true);
      setError("");

      const docRef = doc(db, "siteContent", "Industrial");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setFormData({
          ar: {
            ...defaultIndustrialData.ar,
            ...(data.ar || {}),
            tag_four: data.ar?.tag_four || data.ar?.["tag_four"] || "",
          },
          en: {
            ...defaultIndustrialData.en,
            ...(data.en || {}),
            tag_four: data.en?.tag_four || data.en?.["tag_four"] || "",
          },
        });
      } else {
        await setDoc(docRef, defaultIndustrialData);
        setFormData(defaultIndustrialData);
      }
    } catch (err) {
      console.error("Error fetching industrial brands data:", err);
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

      const docRef = doc(db, "siteContent", "Industrial");

      await setDoc(
        docRef,
        {
          ar: {
            ...formData.ar,
            tag_four: formData.ar.tag_four || "",
          },
          en: {
            ...formData.en,
            tag_four: formData.en.tag_four || "",
          },
          updatedAt: serverTimestamp(),
          updatedBy: user?.email || "unknown",
        },
        { merge: true }
      );

      setMessage(t.saveSuccess);
    } catch (err) {
      console.error("Error saving industrial brands data:", err);
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
            <label>{t.tagOne}</label>
            <input
              type="text"
              value={currentData.tag_one || ""}
              onChange={(e) => handleChange("tag_one", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.tagTwo}</label>
            <input
              type="text"
              value={currentData.tag_two || ""}
              onChange={(e) => handleChange("tag_two", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.tagThree}</label>
            <input
              type="text"
              value={currentData.tag_three || ""}
              onChange={(e) => handleChange("tag_three", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.tagFour}</label>
            <input
              type="text"
              value={currentData.tag_four || ""}
              onChange={(e) => handleChange("tag_four", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.tagFive}</label>
            <input
              type="text"
              value={currentData.tag_five || ""}
              onChange={(e) => handleChange("tag_five", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}