import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

const faqUiText = {
  ar: {
    formTitle: "تعديل محتوى قسم الأسئلة الشائعة",
    sectionTitle: "قسم الأسئلة الشائعة",
    firestoreInfo: "المسار المستخدم في Firebase",
    firestorePath: "siteContent / questions",

    currentWindow: "محتوى القسم الحالي",
    chinese: "الصينية",
    chineseWindowTitle: "نافذة إضافة محتوى الأسئلة الشائعة بالصينية",
    chineseWindowDesc:
      "هذه النافذة لا تغيّر لغة لوحة التحكم، فقط تضيف محتوى صينيًا داخل نفس وثيقة Firebase.",

    title: "العنوان",
    description: "الوصف",
    buttonText: "نص الزر",

    questionOne: "السؤال الأول",
    answerOne: "الإجابة الأولى",
    questionTwo: "السؤال الثاني",
    answerTwo: "الإجابة الثانية",
    questionThree: "السؤال الثالث",
    answerThree: "الإجابة الثالثة",
    questionFour: "السؤال الرابع",
    answerFour: "الإجابة الرابعة",
    questionFive: "السؤال الخامس",
    answerFive: "الإجابة الخامسة",

    save: "حفظ التعديلات",
    saving: "جارٍ الحفظ...",
    loading: "جارٍ تحميل البيانات...",
    fetchError: "حدث خطأ أثناء تحميل بيانات قسم الأسئلة الشائعة",
    saveSuccess: "تم حفظ بيانات قسم الأسئلة الشائعة بنجاح",
    saveError: "حدث خطأ أثناء حفظ بيانات قسم الأسئلة الشائعة",
  },
  en: {
    formTitle: "Edit FAQ Section Content",
    sectionTitle: "FAQ Section",
    firestoreInfo: "Firebase path used",
    firestorePath: "siteContent / questions",

    currentWindow: "Current Section Content",
    chinese: "Chinese",
    chineseWindowTitle: "Chinese FAQ Content Window",
    chineseWindowDesc:
      "This window does not change the dashboard language. It only adds Chinese content to the same Firebase document.",

    title: "Title",
    description: "Description",
    buttonText: "Button Text",

    questionOne: "Question One",
    answerOne: "Answer One",
    questionTwo: "Question Two",
    answerTwo: "Answer Two",
    questionThree: "Question Three",
    answerThree: "Answer Three",
    questionFour: "Question Four",
    answerFour: "Answer Four",
    questionFive: "Question Five",
    answerFive: "Answer Five",

    save: "Save Changes",
    saving: "Saving...",
    loading: "Loading data...",
    fetchError: "Error loading FAQ section data",
    saveSuccess: "FAQ section saved successfully",
    saveError: "Error saving FAQ section data",
  },
};

const emptyFaqLanguageData = {
  title: "",
  description: "",
  button_text: "",
  question_one: "",
  answer_one: "",
  question_two: "",
  answer_two: "",
  question_three: "",
  answer_three: "",
  question_four: "",
  answer_four: "",
  question_five: "",
  answer_five: "",
};

const defaultFaqData = {
  ar: { ...emptyFaqLanguageData },
  en: { ...emptyFaqLanguageData },
  zh: { ...emptyFaqLanguageData },
};

export default function FaqSectionEditor({ lang = "ar", user }) {
  const [faqWindow, setFaqWindow] = useState("default");
  const [formData, setFormData] = useState(defaultFaqData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const t = faqUiText[lang];
  const currentData = formData[lang] || emptyFaqLanguageData;
  const chineseData = formData.zh || emptyFaqLanguageData;

  useEffect(() => {
    fetchFaqData();
  }, []);

  const fetchFaqData = async () => {
    try {
      setLoading(true);
      setError("");

      const docRef = doc(db, "siteContent", "questions");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setFormData({
          ar: {
            ...defaultFaqData.ar,
            ...(data.ar || {}),
          },
          en: {
            ...defaultFaqData.en,
            ...(data.en || {}),
          },
          zh: {
            ...defaultFaqData.zh,
            ...(data.zh || {}),
          },
        });
      } else {
        await setDoc(docRef, defaultFaqData);
        setFormData(defaultFaqData);
      }
    } catch (err) {
      console.error("Error fetching FAQ data:", err);
      setError(t.fetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value, targetLang = lang) => {
    setFormData((prev) => ({
      ...prev,
      [targetLang]: {
        ...(prev[targetLang] || emptyFaqLanguageData),
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const docRef = doc(db, "siteContent", "questions");

      await setDoc(
        docRef,
        {
          ar: formData.ar || defaultFaqData.ar,
          en: formData.en || defaultFaqData.en,
          zh: formData.zh || defaultFaqData.zh,
          updatedAt: serverTimestamp(),
          updatedBy: user?.email || "unknown",
        },
        { merge: true }
      );

      setMessage(t.saveSuccess);
    } catch (err) {
      console.error("Error saving FAQ data:", err);
      setError(t.saveError);
    } finally {
      setSaving(false);

      setTimeout(() => {
        setMessage("");
        setError("");
      }, 3000);
    }
  };

  const renderFaqFields = (data, targetLang = lang, suffix = "") => (
    <div
      className="fields-grid"
      style={{
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <div className="field-box field-box--full">
        <label>{t.title}{suffix}</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => handleChange("title", e.target.value, targetLang)}
        />
      </div>

      <div className="field-box field-box--full">
        <label>{t.description}{suffix}</label>
        <textarea
          rows={4}
          value={data.description}
          onChange={(e) =>
            handleChange("description", e.target.value, targetLang)
          }
        />
      </div>

      <div className="field-box field-box--full">
        <label>{t.buttonText}{suffix}</label>
        <input
          type="text"
          value={data.button_text}
          onChange={(e) =>
            handleChange("button_text", e.target.value, targetLang)
          }
        />
      </div>

      <div className="field-box">
        <label>{t.questionOne}{suffix}</label>
        <input
          type="text"
          value={data.question_one}
          onChange={(e) =>
            handleChange("question_one", e.target.value, targetLang)
          }
        />
      </div>

      <div className="field-box">
        <label>{t.answerOne}{suffix}</label>
        <textarea
          rows={4}
          value={data.answer_one}
          onChange={(e) =>
            handleChange("answer_one", e.target.value, targetLang)
          }
        />
      </div>

      <div className="field-box">
        <label>{t.questionTwo}{suffix}</label>
        <input
          type="text"
          value={data.question_two}
          onChange={(e) =>
            handleChange("question_two", e.target.value, targetLang)
          }
        />
      </div>

      <div className="field-box">
        <label>{t.answerTwo}{suffix}</label>
        <textarea
          rows={4}
          value={data.answer_two}
          onChange={(e) =>
            handleChange("answer_two", e.target.value, targetLang)
          }
        />
      </div>

      <div className="field-box">
        <label>{t.questionThree}{suffix}</label>
        <input
          type="text"
          value={data.question_three}
          onChange={(e) =>
            handleChange("question_three", e.target.value, targetLang)
          }
        />
      </div>

      <div className="field-box">
        <label>{t.answerThree}{suffix}</label>
        <textarea
          rows={4}
          value={data.answer_three}
          onChange={(e) =>
            handleChange("answer_three", e.target.value, targetLang)
          }
        />
      </div>

      <div className="field-box">
        <label>{t.questionFour}{suffix}</label>
        <input
          type="text"
          value={data.question_four}
          onChange={(e) =>
            handleChange("question_four", e.target.value, targetLang)
          }
        />
      </div>

      <div className="field-box">
        <label>{t.answerFour}{suffix}</label>
        <textarea
          rows={4}
          value={data.answer_four}
          onChange={(e) =>
            handleChange("answer_four", e.target.value, targetLang)
          }
        />
      </div>

      <div className="field-box">
        <label>{t.questionFive}{suffix}</label>
        <input
          type="text"
          value={data.question_five}
          onChange={(e) =>
            handleChange("question_five", e.target.value, targetLang)
          }
        />
      </div>

      <div className="field-box">
        <label>{t.answerFive}{suffix}</label>
        <textarea
          rows={4}
          value={data.answer_five}
          onChange={(e) =>
            handleChange("answer_five", e.target.value, targetLang)
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
              className={faqWindow === "default" ? "active" : ""}
              onClick={() => setFaqWindow("default")}
            >
              {lang === "ar" ? "العربي / الإنجليزي" : "AR / EN"}
            </button>

            <button
              type="button"
              className={faqWindow === "chinese" ? "active" : ""}
              onClick={() => setFaqWindow("chinese")}
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

      {faqWindow === "default" && (
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

          {renderFaqFields(currentData)}
        </div>
      )}

      {faqWindow === "chinese" && (
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

          {renderFaqFields(chineseData, "zh", " / Chinese")}
        </div>
      )}
    </div>
  );
}