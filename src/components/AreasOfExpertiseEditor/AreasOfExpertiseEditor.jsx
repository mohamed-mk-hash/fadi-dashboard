import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

const expertiseUiText = {
  ar: {
    formTitle: "تعديل محتوى قسم مجالات الخبرة",
    sectionTitle: "قسم مجالات الخبرة",
    firestoreInfo: "المسار المستخدم في Firebase",
    firestorePath: "siteContent / expertise",
    title: "العنوان الرئيسي",
    titleOne: "عنوان العنصر الأول",
    descriptionOne: "وصف العنصر الأول",
    titleTwo: "عنوان العنصر الثاني",
    descriptionTwo: "وصف العنصر الثاني",
    titleThree: "عنوان العنصر الثالث",
    descriptionThree: "وصف العنصر الثالث",
    titleFour: "عنوان العنصر الرابع",
    descriptionFour: "وصف العنصر الرابع",
    save: "حفظ التعديلات",
    saving: "جارٍ الحفظ...",
    loading: "جارٍ تحميل البيانات...",
    fetchError: "حدث خطأ أثناء تحميل بيانات مجالات الخبرة",
    saveSuccess: "تم حفظ بيانات مجالات الخبرة بنجاح",
    saveError: "حدث خطأ أثناء حفظ بيانات مجالات الخبرة",
  },
  en: {
    formTitle: "Edit Areas of Expertise Content",
    sectionTitle: "Areas of Expertise Section",
    firestoreInfo: "Firebase path used",
    firestorePath: "siteContent / expertise",
    title: "Main Title",
    titleOne: "First Item Title",
    descriptionOne: "First Item Description",
    titleTwo: "Second Item Title",
    descriptionTwo: "Second Item Description",
    titleThree: "Third Item Title",
    descriptionThree: "Third Item Description",
    titleFour: "Fourth Item Title",
    descriptionFour: "Fourth Item Description",
    save: "Save Changes",
    saving: "Saving...",
    loading: "Loading data...",
    fetchError: "Error loading expertise section data",
    saveSuccess: "Expertise section saved successfully",
    saveError: "Error saving expertise section data",
  },
};

const defaultExpertiseData = {
  ar: {
    title: "",
    title_one: "",
    description_one: "",
    title_two: "",
    description_two: "",
    title_three: "",
    description_three: "",
    title_four: "",
    description_four: "",
  },
  en: {
    title: "",
    title_one: "",
    description_one: "",
    title_two: "",
    description_two: "",
    title_three: "",
    description_three: "",
    title_four: "",
    description_four: "",
  },
};

export default function AreasOfExpertiseEditor({ lang = "ar", user }) {
  const [formData, setFormData] = useState(defaultExpertiseData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const t = expertiseUiText[lang];
  const currentData = formData[lang];

  useEffect(() => {
    fetchExpertiseData();
  }, []);

  const fetchExpertiseData = async () => {
    try {
      setLoading(true);
      setError("");

      const docRef = doc(db, "siteContent", "expertise");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setFormData({
          ar: {
            ...defaultExpertiseData.ar,
            ...(data.ar || {}),
          },
          en: {
            ...defaultExpertiseData.en,
            ...(data.en || {}),
          },
        });
      } else {
        await setDoc(docRef, defaultExpertiseData);
        setFormData(defaultExpertiseData);
      }
    } catch (err) {
      console.error("Error fetching expertise data:", err);
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

      const docRef = doc(db, "siteContent", "expertise");

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
      console.error("Error saving expertise data:", err);
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
              value={currentData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.titleOne}</label>
            <input
              type="text"
              value={currentData.title_one}
              onChange={(e) => handleChange("title_one", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.descriptionOne}</label>
            <textarea
              rows={4}
              value={currentData.description_one}
              onChange={(e) => handleChange("description_one", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.titleTwo}</label>
            <input
              type="text"
              value={currentData.title_two}
              onChange={(e) => handleChange("title_two", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.descriptionTwo}</label>
            <textarea
              rows={4}
              value={currentData.description_two}
              onChange={(e) => handleChange("description_two", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.titleThree}</label>
            <input
              type="text"
              value={currentData.title_three}
              onChange={(e) => handleChange("title_three", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.descriptionThree}</label>
            <textarea
              rows={4}
              value={currentData.description_three}
              onChange={(e) => handleChange("description_three", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.titleFour}</label>
            <input
              type="text"
              value={currentData.title_four}
              onChange={(e) => handleChange("title_four", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.descriptionFour}</label>
            <textarea
              rows={4}
              value={currentData.description_four}
              onChange={(e) => handleChange("description_four", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}