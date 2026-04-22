import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

const layoutUiText = {
  ar: {
    sectionTitle: "قسم الهيدر والفوتر",
    headerTitle: "تعديل الهيدر",
    footerTitle: "تعديل الفوتر",

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

const defaultHeaderData = {
  ar: {
    language_button: "",
    menu_one: "",
    menu_two: "",
    menu_three: "",
    menu_four: "",
    menu_five: "",
    menu_six: "",
    menu_seven: "",
    menu_eight: "",
  },
  en: {
    language_button: "",
    menu_one: "",
    menu_two: "",
    menu_three: "",
    menu_four: "",
    menu_five: "",
    menu_six: "",
    menu_seven: "",
    menu_eight: "",
  },
};

const defaultFooterData = {
  ar: {
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
  },
  en: {
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
  },
};

export default function LayoutSectionEditor({ lang = "ar", user }) {
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
  const currentHeader = headerData[lang];
  const currentFooter = footerData[lang];

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

  const handleHeaderChange = (field, value) => {
    setHeaderData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value,
      },
    }));
  };

  const handleFooterChange = (field, value) => {
    setFooterData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
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
          ...headerData,
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
          ...footerData,
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

      <div className="content-card glass-card" style={{ marginBottom: "24px" }}>
        <div className="content-card__header">
          <h2>{t.headerTitle}</h2>
          <p>
            {t.firestoreInfo}: <strong>{t.headerPath}</strong>
          </p>
        </div>

        <div className="fields-grid" style={{ width: "100%", maxWidth: "100%" }}>
          <div className="field-box">
            <label>{t.languageButton}</label>
            <input
              type="text"
              value={currentHeader.language_button || ""}
              onChange={(e) =>
                handleHeaderChange("language_button", e.target.value)
              }
            />
          </div>

          <div className="field-box">
            <label>{t.menuOne}</label>
            <input
              type="text"
              value={currentHeader.menu_one || ""}
              onChange={(e) => handleHeaderChange("menu_one", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.menuTwo}</label>
            <input
              type="text"
              value={currentHeader.menu_two || ""}
              onChange={(e) => handleHeaderChange("menu_two", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.menuThree}</label>
            <input
              type="text"
              value={currentHeader.menu_three || ""}
              onChange={(e) => handleHeaderChange("menu_three", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.menuFour}</label>
            <input
              type="text"
              value={currentHeader.menu_four || ""}
              onChange={(e) => handleHeaderChange("menu_four", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.menuFive}</label>
            <input
              type="text"
              value={currentHeader.menu_five || ""}
              onChange={(e) => handleHeaderChange("menu_five", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.menuSix}</label>
            <input
              type="text"
              value={currentHeader.menu_six || ""}
              onChange={(e) => handleHeaderChange("menu_six", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.menuSeven}</label>
            <input
              type="text"
              value={currentHeader.menu_seven || ""}
              onChange={(e) => handleHeaderChange("menu_seven", e.target.value)}
            />
          </div>

          <div className="field-box field-box--full">
            <label>{t.menuEight}</label>
            <input
              type="text"
              value={currentHeader.menu_eight || ""}
              onChange={(e) => handleHeaderChange("menu_eight", e.target.value)}
            />
          </div>
        </div>

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

      <div className="content-card glass-card">
        <div className="content-card__header">
          <h2>{t.footerTitle}</h2>
          <p>
            {t.firestoreInfo}: <strong>{t.footerPath}</strong>
          </p>
        </div>

        <div className="fields-grid" style={{ width: "100%", maxWidth: "100%" }}>
          <div className="field-box">
            <label>{t.menuOne}</label>
            <input
              type="text"
              value={currentFooter.menu_one || ""}
              onChange={(e) => handleFooterChange("menu_one", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.menuTwo}</label>
            <input
              type="text"
              value={currentFooter.menu_two || ""}
              onChange={(e) => handleFooterChange("menu_two", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.menuThree}</label>
            <input
              type="text"
              value={currentFooter.menu_three || ""}
              onChange={(e) => handleFooterChange("menu_three", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.menuFour}</label>
            <input
              type="text"
              value={currentFooter.menu_four || ""}
              onChange={(e) => handleFooterChange("menu_four", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.menuFive}</label>
            <input
              type="text"
              value={currentFooter.menu_five || ""}
              onChange={(e) => handleFooterChange("menu_five", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.menuSix}</label>
            <input
              type="text"
              value={currentFooter.menu_six || ""}
              onChange={(e) => handleFooterChange("menu_six", e.target.value)}
            />
          </div>

          <div className="field-box">
            <label>{t.menuSeven}</label>
            <input
              type="text"
              value={currentFooter.menu_seven || ""}
              onChange={(e) => handleFooterChange("menu_seven", e.target.value)}
            />
          </div>

          <div className="field-box field-box--full">
            <label>{t.footerDescription}</label>
            <textarea
              rows={4}
              value={currentFooter.menu_description || ""}
              onChange={(e) =>
                handleFooterChange("menu_description", e.target.value)
              }
            />
          </div>

          <div className="field-box">
            <label>{t.footerBottomOne}</label>
            <input
              type="text"
              value={currentFooter.menu_bottom_one || ""}
              onChange={(e) =>
                handleFooterChange("menu_bottom_one", e.target.value)
              }
            />
          </div>

          <div className="field-box">
            <label>{t.footerBottomTwo}</label>
            <input
              type="text"
              value={currentFooter.menu_bottom_two || ""}
              onChange={(e) =>
                handleFooterChange("menu_bottom_two", e.target.value)
              }
            />
          </div>

          <div className="field-box">
            <label>{t.footerBottomThree}</label>
            <input
              type="text"
              value={currentFooter.menu_bottom_three || ""}
              onChange={(e) =>
                handleFooterChange("menu_bottom_three", e.target.value)
              }
            />
          </div>
        </div>

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
    </div>
  );
}