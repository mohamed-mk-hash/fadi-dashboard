import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

const layoutUiText = {
  ar: {
    sectionTitle: "قسم الهيدر والفوتر",
    headerTitle: "تعديل الهيدر",
    footerTitle: "تعديل الفوتر",
    currentWindow: "المحتوى الحالي",
    chinese: "الصينية",
    chineseHeaderTitle: "نافذة إضافة الهيدر بالصينية",
    chineseFooterTitle: "نافذة إضافة الفوتر بالصينية",

    headerPath: "siteContent / header",
    footerPath: "siteContent / footer",
    firestoreInfo: "المسار المستخدم في Firebase",

    languageButton: "زر اللغة",
    menuOne: "القائمة الأولى",
    menuTwo: "القائمة الثانية",
    menuThree: "القائمة الثالثة",
    menuFour: "القائمة الرابعة",
    menuFive: "القائمة الخامسة",
    menuSix: "القائمة السادسة",
    menuSeven: "القائمة السابعة",
    menuEight: "زر التواصل",

    footerDescription: "نص أسفل الفوتر",
    footerBottomOne: "رابط سفلي أول",
    footerBottomTwo: "رابط سفلي ثاني",
    footerBottomThree: "رابط سفلي ثالث",

    saveHeader: "حفظ الهيدر",
    saveFooter: "حفظ الفوتر",
    saving: "جارٍ الحفظ...",
    loading: "جارٍ تحميل البيانات...",

    fetchHeaderError: "حدث خطأ أثناء تحميل بيانات الهيدر",
    fetchFooterError: "حدث خطأ أثناء تحميل بيانات الفوتر",
    saveHeaderSuccess: "تم حفظ بيانات الهيدر بنجاح",
    saveFooterSuccess: "تم حفظ بيانات الفوتر بنجاح",
    saveHeaderError: "حدث خطأ أثناء حفظ بيانات الهيدر",
    saveFooterError: "حدث خطأ أثناء حفظ بيانات الفوتر",
  },

  en: {
    sectionTitle: "Header & Footer Section",
    headerTitle: "Edit Header",
    footerTitle: "Edit Footer",
    currentWindow: "Current Content",
    chinese: "Chinese",
    chineseHeaderTitle: "Chinese Header Content Window",
    chineseFooterTitle: "Chinese Footer Content Window",

    headerPath: "siteContent / header",
    footerPath: "siteContent / footer",
    firestoreInfo: "Firebase path used",

    languageButton: "Language Button",
    menuOne: "Menu One",
    menuTwo: "Menu Two",
    menuThree: "Menu Three",
    menuFour: "Menu Four",
    menuFive: "Menu Five",
    menuSix: "Menu Six",
    menuSeven: "Menu Seven",
    menuEight: "Contact Button",

    footerDescription: "Footer Bottom Description",
    footerBottomOne: "Bottom Link One",
    footerBottomTwo: "Bottom Link Two",
    footerBottomThree: "Bottom Link Three",

    saveHeader: "Save Header",
    saveFooter: "Save Footer",
    saving: "Saving...",
    loading: "Loading data...",

    fetchHeaderError: "Error loading header data",
    fetchFooterError: "Error loading footer data",
    saveHeaderSuccess: "Header saved successfully",
    saveFooterSuccess: "Footer saved successfully",
    saveHeaderError: "Error saving header data",
    saveFooterError: "Error saving footer data",
  },
};

const emptyHeaderLanguageData = {
  language_button: "",
  menu_one: "",
  menu_two: "",
  menu_three: "",
  menu_four: "",
  menu_five: "",
  menu_six: "",
  menu_seven: "",
  menu_eight: "",
};

const emptyFooterLanguageData = {
  menu_one: "",
  menu_two: "",
  menu_three: "",
  menu_four: "",
  menu_five: "",
  menu_six: "",
  menu_seven: "",
  menu_description: "",
  menu_bottom_one: "",
  menu_bottom_two: "",
  menu_bottom_three: "",
};

const defaultHeaderData = {
  ar: { ...emptyHeaderLanguageData },
  en: { ...emptyHeaderLanguageData },
  zh: { ...emptyHeaderLanguageData },
};

const defaultFooterData = {
  ar: { ...emptyFooterLanguageData },
  en: { ...emptyFooterLanguageData },
  zh: { ...emptyFooterLanguageData },
};

export default function LayoutSectionEditor({ lang = "ar", user }) {
  const [layoutWindow, setLayoutWindow] = useState("default");
  const [headerData, setHeaderData] = useState(defaultHeaderData);
  const [footerData, setFooterData] = useState(defaultFooterData);

  const [loading, setLoading] = useState(true);

  const [savingHeader, setSavingHeader] = useState(false);
  const [savingFooter, setSavingFooter] = useState(false);

  const [headerMessage, setHeaderMessage] = useState("");
  const [headerError, setHeaderError] = useState("");

  const [footerMessage, setFooterMessage] = useState("");
  const [footerError, setFooterError] = useState("");

  const t = layoutUiText[lang];
  const currentHeader = headerData[lang] || emptyHeaderLanguageData;
  const currentFooter = footerData[lang] || emptyFooterLanguageData;
  const chineseHeader = headerData.zh || emptyHeaderLanguageData;
  const chineseFooter = footerData.zh || emptyFooterLanguageData;

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const headerRef = doc(db, "siteContent", "header");
      const footerRef = doc(db, "siteContent", "footer");

      const [headerSnap, footerSnap] = await Promise.all([
        getDoc(headerRef),
        getDoc(footerRef),
      ]);

      if (headerSnap.exists()) {
        const data = headerSnap.data();
        setHeaderData({
          ar: {
            ...defaultHeaderData.ar,
            ...(data.ar || {}),
          },
          en: {
            ...defaultHeaderData.en,
            ...(data.en || {}),
          },
          zh: {
            ...defaultHeaderData.zh,
            ...(data.zh || {}),
          },
        });
      } else {
        await setDoc(headerRef, defaultHeaderData);
        setHeaderData(defaultHeaderData);
      }

      if (footerSnap.exists()) {
        const data = footerSnap.data();
        setFooterData({
          ar: {
            ...defaultFooterData.ar,
            ...(data.ar || {}),
          },
          en: {
            ...defaultFooterData.en,
            ...(data.en || {}),
          },
          zh: {
            ...defaultFooterData.zh,
            ...(data.zh || {}),
          },
        });
      } else {
        await setDoc(footerRef, defaultFooterData);
        setFooterData(defaultFooterData);
      }
    } catch (err) {
      console.error("Error fetching layout data:", err);
      setHeaderError(t.fetchHeaderError);
      setFooterError(t.fetchFooterError);
    } finally {
      setLoading(false);
    }
  };

  const handleHeaderChange = (field, value, targetLang = lang) => {
    setHeaderData((prev) => ({
      ...prev,
      [targetLang]: {
        ...(prev[targetLang] || emptyHeaderLanguageData),
        [field]: value,
      },
    }));
  };

  const handleFooterChange = (field, value, targetLang = lang) => {
    setFooterData((prev) => ({
      ...prev,
      [targetLang]: {
        ...(prev[targetLang] || emptyFooterLanguageData),
        [field]: value,
      },
    }));
  };

  const handleSaveHeader = async () => {
    try {
      setSavingHeader(true);
      setHeaderMessage("");
      setHeaderError("");

      const docRef = doc(db, "siteContent", "header");

      await setDoc(
        docRef,
        {
          ar: headerData.ar || defaultHeaderData.ar,
          en: headerData.en || defaultHeaderData.en,
          zh: headerData.zh || defaultHeaderData.zh,
          updatedAt: serverTimestamp(),
          updatedBy: user?.email || "unknown",
        },
        { merge: true }
      );

      setHeaderMessage(t.saveHeaderSuccess);
    } catch (err) {
      console.error("Error saving header data:", err);
      setHeaderError(t.saveHeaderError);
    } finally {
      setSavingHeader(false);
      setTimeout(() => {
        setHeaderMessage("");
        setHeaderError("");
      }, 3000);
    }
  };

  const handleSaveFooter = async () => {
    try {
      setSavingFooter(true);
      setFooterMessage("");
      setFooterError("");

      const docRef = doc(db, "siteContent", "footer");

      await setDoc(
        docRef,
        {
          ar: footerData.ar || defaultFooterData.ar,
          en: footerData.en || defaultFooterData.en,
          zh: footerData.zh || defaultFooterData.zh,
          updatedAt: serverTimestamp(),
          updatedBy: user?.email || "unknown",
        },
        { merge: true }
      );

      setFooterMessage(t.saveFooterSuccess);
    } catch (err) {
      console.error("Error saving footer data:", err);
      setFooterError(t.saveFooterError);
    } finally {
      setSavingFooter(false);
      setTimeout(() => {
        setFooterMessage("");
        setFooterError("");
      }, 3000);
    }
  };

  const renderHeaderFields = (data, targetLang = lang, suffix = "") => (
    <div className="fields-grid" style={{ width: "100%", maxWidth: "100%" }}>
      {Object.keys(emptyHeaderLanguageData).map((field) => (
        <div
          key={field}
          className={field === "menu_eight" ? "field-box field-box--full" : "field-box"}
        >
          <label>{field}{suffix}</label>
          <input
            type="text"
            value={data[field] || ""}
            onChange={(e) => handleHeaderChange(field, e.target.value, targetLang)}
          />
        </div>
      ))}
    </div>
  );

  const renderFooterFields = (data, targetLang = lang, suffix = "") => (
    <div className="fields-grid" style={{ width: "100%", maxWidth: "100%" }}>
      {Object.keys(emptyFooterLanguageData).map((field) => (
        <div
          key={field}
          className={field === "menu_description" ? "field-box field-box--full" : "field-box"}
        >
          <label>{field}{suffix}</label>
          {field === "menu_description" ? (
            <textarea
              rows={4}
              value={data[field] || ""}
              onChange={(e) => handleFooterChange(field, e.target.value, targetLang)}
            />
          ) : (
            <input
              type="text"
              value={data[field] || ""}
              onChange={(e) => handleFooterChange(field, e.target.value, targetLang)}
            />
          )}
        </div>
      ))}
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
      <div
        className="editor-header glass-card"
        style={{ width: "100%", maxWidth: "100%", marginBottom: "20px" }}
      >
        <div className="editor-header__text">
          <span className="editor-badge">{t.sectionTitle}</span>
          <h1>{t.sectionTitle}</h1>
        </div>

        <div className="editor-header__actions">
          <div className="language-switch">
            <button
              type="button"
              className={layoutWindow === "default" ? "active" : ""}
              onClick={() => setLayoutWindow("default")}
            >
              {lang === "ar" ? "العربي / الإنجليزي" : "AR / EN"}
            </button>

            <button
              type="button"
              className={layoutWindow === "chinese" ? "active" : ""}
              onClick={() => setLayoutWindow("chinese")}
            >
              {t.chinese}
            </button>
          </div>
        </div>
      </div>

      {(headerMessage || headerError) && (
        <div
          className="glass-card"
          style={{
            padding: "16px 20px",
            marginBottom: "20px",
            border: headerError ? "1px solid #ff4d4f" : "1px solid #22c55e",
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <strong>{headerError || headerMessage}</strong>
        </div>
      )}

      {layoutWindow === "default" && (
        <div className="content-card glass-card" style={{ marginBottom: "24px" }}>
          <div className="content-card__header">
            <div>
              <h2>{t.headerTitle}</h2>
              <p>
                {t.firestoreInfo}: <strong>{t.headerPath}</strong>
              </p>
            </div>
          </div>

          {renderHeaderFields(currentHeader)}

          <div style={{ marginTop: "20px" }}>
            <button
              className="admin-btn admin-btn--primary"
              onClick={handleSaveHeader}
              disabled={savingHeader}
            >
              {savingHeader ? t.saving : t.saveHeader}
            </button>
          </div>
        </div>
      )}

      {layoutWindow === "chinese" && (
        <div className="content-card glass-card" style={{ marginBottom: "24px" }}>
          <div className="content-card__header">
            <div>
              <h2>{t.chineseHeaderTitle}</h2>
              <p>
                {t.firestoreInfo}: <strong>{t.headerPath}</strong>
              </p>
            </div>
          </div>

          {renderHeaderFields(chineseHeader, "zh", " / Chinese")}

          <div style={{ marginTop: "20px" }}>
            <button
              className="admin-btn admin-btn--primary"
              onClick={handleSaveHeader}
              disabled={savingHeader}
            >
              {savingHeader ? t.saving : t.saveHeader}
            </button>
          </div>
        </div>
      )}

      {(footerMessage || footerError) && (
        <div
          className="glass-card"
          style={{
            padding: "16px 20px",
            marginBottom: "20px",
            border: footerError ? "1px solid #ff4d4f" : "1px solid #22c55e",
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <strong>{footerError || footerMessage}</strong>
        </div>
      )}

      {layoutWindow === "default" && (
        <div className="content-card glass-card">
          <div className="content-card__header">
            <div>
              <h2>{t.footerTitle}</h2>
              <p>
                {t.firestoreInfo}: <strong>{t.footerPath}</strong>
              </p>
            </div>
          </div>

          {renderFooterFields(currentFooter)}

          <div style={{ marginTop: "20px" }}>
            <button
              className="admin-btn admin-btn--primary"
              onClick={handleSaveFooter}
              disabled={savingFooter}
            >
              {savingFooter ? t.saving : t.saveFooter}
            </button>
          </div>
        </div>
      )}

      {layoutWindow === "chinese" && (
        <div className="content-card glass-card">
          <div className="content-card__header">
            <div>
              <h2>{t.chineseFooterTitle}</h2>
              <p>
                {t.firestoreInfo}: <strong>{t.footerPath}</strong>
              </p>
            </div>
          </div>

          {renderFooterFields(chineseFooter, "zh", " / Chinese")}

          <div style={{ marginTop: "20px" }}>
            <button
              className="admin-btn admin-btn--primary"
              onClick={handleSaveFooter}
              disabled={savingFooter}
            >
              {savingFooter ? t.saving : t.saveFooter}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}