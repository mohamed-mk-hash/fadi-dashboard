import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

const contactUiText = {
  ar: {
    formTitle: "تعديل محتوى قسم التواصل",
    sectionTitle: "قسم التواصل",
    firestoreInfo: "المسار المستخدم في Firebase",
    firestorePath: "siteContent / form",

    title: "العنوان الرئيسي",
    description: "الوصف",

    firstNameInput: "نص الاسم الأول",
    lastNameInput: "نص الاسم الأخير",
    emailInput: "نص البريد الإلكتروني",
    emailPlaceholder: "Placeholder البريد الإلكتروني",
    numberInput: "رقم الهاتف / Placeholder الرقم",
    messageInput: "نص الرسالة",
    messagePlaceholder: "Placeholder الرسالة",
    checkboxText: "نص الـ checkbox",
    buttonText: "نص الزر",

    emailTitle: "عنوان بطاقة البريد",
    emailDescription: "وصف بطاقة البريد",

    socialMediaTitle: "عنوان بطاقة السوشيال ميديا",
    socialMediaDescription: "وصف بطاقة السوشيال ميديا",

    officeTitle: "عنوان بطاقة المكتب",
    officeDescription: "وصف بطاقة المكتب",
    office: "اسم/رابط المكتب",

    phoneTitle: "عنوان بطاقة الهاتف",
    phoneDescription: "وصف بطاقة الهاتف",

    save: "حفظ التعديلات",
    saving: "جارٍ الحفظ...",
    loading: "جارٍ تحميل البيانات...",
    fetchError: "حدث خطأ أثناء تحميل بيانات قسم التواصل",
    saveSuccess: "تم حفظ بيانات قسم التواصل بنجاح",
    saveError: "حدث خطأ أثناء حفظ بيانات قسم التواصل",
  },

  en: {
    formTitle: "Edit Contact Section Content",
    sectionTitle: "Contact Section",
    firestoreInfo: "Firebase path used",
    firestorePath: "siteContent / form",

    title: "Main Title",
    description: "Description",

    firstNameInput: "First Name Label",
    lastNameInput: "Last Name Label",
    emailInput: "Email Label",
    emailPlaceholder: "Email Placeholder",
    numberInput: "Phone Number / Phone Placeholder",
    messageInput: "Message Label",
    messagePlaceholder: "Message Placeholder",
    checkboxText: "Checkbox Text",
    buttonText: "Button Text",

    emailTitle: "Email Card Title",
    emailDescription: "Email Card Description",

    socialMediaTitle: "Social Media Card Title",
    socialMediaDescription: "Social Media Card Description",

    officeTitle: "Office Card Title",
    officeDescription: "Office Card Description",
    office: "Office Text / Link Text",

    phoneTitle: "Phone Card Title",
    phoneDescription: "Phone Card Description",

    save: "Save Changes",
    saving: "Saving...",
    loading: "Loading data...",
    fetchError: "Error loading contact section data",
    saveSuccess: "Contact section saved successfully",
    saveError: "Error saving contact section data",
  },
};

const defaultContactData = {
  ar: {
    title: "",
    description: "",
    first_name_input: "",
    last_name_input: "",
    Email_input: "",
    Email_placeholder: "",
    number_input: "",
    message_input: "",
    "message-placeholder": "",
    checkbox_text: "",
    button_text: "",
    email_title: "",
    email_description: "",
    social_media_title: "",
    social_media_description: "",
    office_title: "",
    office_description: "",
    office: "",
    phone_title: "",
    "phone-description": "",
  },
  en: {
    title: "",
    description: "",
    first_name_input: "",
    last_name_input: "",
    Email_input: "",
    Email_placeholder: "",
    number_input: "",
    message_input: "",
    "message-placeholder": "",
    checkbox_text: "",
    button_text: "",
    email_title: "",
    email_description: "",
    social_media_title: "",
    social_media_description: "",
    office_title: "",
    office_description: "",
    office: "",
    phone_title: "",
    "phone-description": "",
  },
};

export default function ContactSectionEditor({ lang = "ar", user }) {
  const [formData, setFormData] = useState(defaultContactData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const t = contactUiText[lang];
  const currentData = formData[lang];

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      setLoading(true);
      setError("");

      const docRef = doc(db, "siteContent", "form");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setFormData({
          ar: {
            ...defaultContactData.ar,
            ...(data.ar || {}),
          },
          en: {
            ...defaultContactData.en,
            ...(data.en || {}),
          },
        });
      } else {
        await setDoc(docRef, defaultContactData);
        setFormData(defaultContactData);
      }
    } catch (err) {
      console.error("Error fetching contact data:", err);
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

      const docRef = doc(db, "siteContent", "form");

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
      console.error("Error saving contact data:", err);
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

          <div className="field-box field-box--full">
            <label>{t.description}</label>
            <textarea
              rows={4}
              value={currentData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.firstNameInput}</label>
            <input
              type="text"
              value={currentData.first_name_input}
              onChange={(e) =>
                handleChange("first_name_input", e.target.value)
              }
            />
          </div>

          <div className="field-box">
            <label>{t.lastNameInput}</label>
            <input
              type="text"
              value={currentData.last_name_input}
              onChange={(e) =>
                handleChange("last_name_input", e.target.value)
              }
            />
          </div>

          <div className="field-box">
            <label>{t.emailInput}</label>
            <input
              type="text"
              value={currentData.Email_input}
              onChange={(e) => handleChange("Email_input", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.emailPlaceholder}</label>
            <input
              type="text"
              value={currentData.Email_placeholder}
              onChange={(e) =>
                handleChange("Email_placeholder", e.target.value)
              }
            />
          </div>

          <div className="field-box">
            <label>{t.phoneTitle}</label>
            <input
              type="text"
              value={currentData.phone_title}
              onChange={(e) => handleChange("phone_title", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.numberInput}</label>
            <input
              type="text"
              value={currentData.number_input}
              onChange={(e) => handleChange("number_input", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.messageInput}</label>
            <input
              type="text"
              value={currentData.message_input}
              onChange={(e) => handleChange("message_input", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.messagePlaceholder}</label>
            <input
              type="text"
              value={currentData["message-placeholder"]}
              onChange={(e) =>
                handleChange("message-placeholder", e.target.value)
              }
            />
          </div>

          <div className="field-box field-box--full">
            <label>{t.checkboxText}</label>
            <input
              type="text"
              value={currentData.checkbox_text}
              onChange={(e) => handleChange("checkbox_text", e.target.value)}
            />
          </div>

          <div className="field-box field-box--full">
            <label>{t.buttonText}</label>
            <input
              type="text"
              value={currentData.button_text}
              onChange={(e) => handleChange("button_text", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.emailTitle}</label>
            <input
              type="text"
              value={currentData.email_title}
              onChange={(e) => handleChange("email_title", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.emailDescription}</label>
            <textarea
              rows={3}
              value={currentData.email_description}
              onChange={(e) =>
                handleChange("email_description", e.target.value)
              }
            />
          </div>

          <div className="field-box">
            <label>{t.socialMediaTitle}</label>
            <input
              type="text"
              value={currentData.social_media_title}
              onChange={(e) =>
                handleChange("social_media_title", e.target.value)
              }
            />
          </div>

          <div className="field-box">
            <label>{t.socialMediaDescription}</label>
            <textarea
              rows={3}
              value={currentData.social_media_description}
              onChange={(e) =>
                handleChange("social_media_description", e.target.value)
              }
            />
          </div>

          <div className="field-box">
            <label>{t.officeTitle}</label>
            <input
              type="text"
              value={currentData.office_title}
              onChange={(e) => handleChange("office_title", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.officeDescription}</label>
            <textarea
              rows={3}
              value={currentData.office_description}
              onChange={(e) =>
                handleChange("office_description", e.target.value)
              }
            />
          </div>

          <div className="field-box">
            <label>{t.office}</label>
            <input
              type="text"
              value={currentData.office}
              onChange={(e) => handleChange("office", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.phoneDescription}</label>
            <textarea
              rows={3}
              value={currentData["phone-description"]}
              onChange={(e) =>
                handleChange("phone-description", e.target.value)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}