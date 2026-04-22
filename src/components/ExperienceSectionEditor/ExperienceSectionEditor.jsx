import React, { useEffect, useMemo, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

const CONTENT_COLLECTION = "siteContent";
const CONTENT_DOC_ID = "0EwrKivcpkYHFidugM5j";

const uiText = {
  ar: {
    formTitle: "تعديل قسم الخبرات",
    sectionTitle: "قسم الخبرات",
    firestoreInfo: "المسار المستخدم في Firebase",
    firestorePath: "siteContent / 0EwrKivcpkYHFidugM5j",
    arContent: "المحتوى العربي",
    enContent: "المحتوى الإنجليزي",
    badge: "Badge",
    title: "العنوان",
    description: "الوصف",
    itemsTitle: "العناصر",
    itemNumber: "العنصر رقم",
    company: "اسم الشركة",
    role: "المسمى الوظيفي",
    period: "الفترة",
    itemDescription: "وصف العنصر",
    tags: "التاقات",
    addItem: "إضافة عنصر جديد",
    deleteItem: "حذف العنصر",
    addTag: "إضافة تاج جديد",
    deleteTag: "حذف التاج",
    save: "حفظ التعديلات",
    saving: "جارٍ الحفظ...",
    loading: "جارٍ تحميل البيانات...",
    fetchError: "حدث خطأ أثناء تحميل بيانات قسم الخبرات",
    saveSuccess: "تم حفظ بيانات قسم الخبرات بنجاح",
    saveError: "حدث خطأ أثناء حفظ بيانات قسم الخبرات",
    validationTopLevel:
      "يجب تعبئة العنوان والوصف وBadge في العربي والإنجليزي قبل الحفظ.",
    validationItems:
      "يجب تعبئة جميع حقول كل عنصر في العربي والإنجليزي قبل الحفظ، وكذلك جميع التاقات.",
    validationTagsCount:
      "عدد التاقات في العربي والإنجليزي يجب أن يكون متساويًا داخل كل عنصر.",
    emptyTagPlaceholderAr: "اكتب التاج بالعربية",
    emptyTagPlaceholderEn: "Type tag in English",
  },
  en: {
    formTitle: "Edit Experience Section",
    sectionTitle: "Experience Section",
    firestoreInfo: "Firebase path used",
    firestorePath: "siteContent / 0EwrKivcpkYHFidugM5j",
    arContent: "Arabic Content",
    enContent: "English Content",
    badge: "Badge",
    title: "Title",
    description: "Description",
    itemsTitle: "Items",
    itemNumber: "Item",
    company: "Company",
    role: "Role",
    period: "Period",
    itemDescription: "Item Description",
    tags: "Tags",
    addItem: "Add New Item",
    deleteItem: "Delete Item",
    addTag: "Add New Tag",
    deleteTag: "Delete Tag",
    save: "Save Changes",
    saving: "Saving...",
    loading: "Loading data...",
    fetchError: "Error loading experience section data",
    saveSuccess: "Experience section saved successfully",
    saveError: "Error saving experience section data",
    validationTopLevel:
      "Badge, title, and description must be filled in both Arabic and English before saving.",
    validationItems:
      "All fields for every item must be completed in both Arabic and English before saving, including all tags.",
    validationTagsCount:
      "Arabic and English tag counts must match inside each item.",
    emptyTagPlaceholderAr: "Type tag in Arabic",
    emptyTagPlaceholderEn: "Type tag in English",
  },
};

const createEmptyLangItem = () => ({
  company: "",
  role: "",
  period: "",
  description: "",
  tags: [""],
});

const createEmptyBilingualItem = () => ({
  ar: createEmptyLangItem(),
  en: createEmptyLangItem(),
});

const defaultExperienceData = {
  ar: {
    badge: "",
    title: "",
    description: "",
  },
  en: {
    badge: "",
    title: "",
    description: "",
  },
  items: [createEmptyBilingualItem()],
};

function normalizeLangTopLevel(data = {}) {
  return {
    badge: data?.badge || "",
    title: data?.title || "",
    description: data?.description || "",
  };
}

function normalizeLangItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  return items.map((item) => ({
    company: item?.company || "",
    role: item?.role || "",
    period: item?.period || "",
    description: item?.description || "",
    tags: Array.isArray(item?.tags) && item.tags.length > 0 ? item.tags : [""],
  }));
}

function mergeBilingualItems(arItems, enItems) {
  const maxLength = Math.max(arItems.length, enItems.length, 1);

  return Array.from({ length: maxLength }, (_, index) => ({
    ar: arItems[index] || createEmptyLangItem(),
    en: enItems[index] || createEmptyLangItem(),
  }));
}

function trimLangItem(item) {
  return {
    company: item.company.trim(),
    role: item.role.trim(),
    period: item.period.trim(),
    description: item.description.trim(),
    tags: item.tags.map((tag) => tag.trim()),
  };
}

function isTopLevelComplete(data) {
  return (
    data.ar.badge.trim() &&
    data.ar.title.trim() &&
    data.ar.description.trim() &&
    data.en.badge.trim() &&
    data.en.title.trim() &&
    data.en.description.trim()
  );
}

function isLangItemComplete(item) {
  return (
    item.company &&
    item.role &&
    item.period &&
    item.description &&
    item.tags.length > 0 &&
    item.tags.every((tag) => tag)
  );
}

function validateBilingualItems(items) {
  for (const rawItem of items) {
    const arItem = trimLangItem(rawItem.ar);
    const enItem = trimLangItem(rawItem.en);

    if (arItem.tags.length !== enItem.tags.length) {
      return { valid: false, reason: "tags_count" };
    }

    if (!isLangItemComplete(arItem) || !isLangItemComplete(enItem)) {
      return { valid: false, reason: "items_required" };
    }
  }

  return { valid: true };
}

export default function ExperienceSectionEditor({ lang = "ar", user }) {
  const t = uiText[lang];

  const [formData, setFormData] = useState(defaultExperienceData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExperienceData();
  }, []);

  const saveDisabled = useMemo(() => {
    if (saving || loading) return true;
    if (!isTopLevelComplete(formData)) return true;
    const validation = validateBilingualItems(formData.items);
    return !validation.valid;
  }, [formData, saving, loading]);

  const fetchExperienceData = async () => {
    try {
      setLoading(true);
      setError("");

      const docRef = doc(db, CONTENT_COLLECTION, CONTENT_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        const arTopLevel = normalizeLangTopLevel(data?.ar || {});
        const enTopLevel = normalizeLangTopLevel(data?.en || {});
        const arItems = normalizeLangItems(data?.ar?.items);
        const enItems = normalizeLangItems(data?.en?.items);

        setFormData({
          ar: arTopLevel,
          en: enTopLevel,
          items: mergeBilingualItems(arItems, enItems),
        });
      } else {
        await setDoc(docRef, {
          ar: {
            badge: "",
            title: "",
            description: "",
            items: [],
          },
          en: {
            badge: "",
            title: "",
            description: "",
            items: [],
          },
        });

        setFormData(defaultExperienceData);
      }
    } catch (err) {
      console.error("Error fetching experience data:", err);
      setError(t.fetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleTopLevelChange = (language, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [language]: {
        ...prev[language],
        [field]: value,
      },
    }));
  };

  const handleItemFieldChange = (itemIndex, language, field, value) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        [language]: {
          ...updatedItems[itemIndex][language],
          [field]: value,
        },
      };

      return {
        ...prev,
        items: updatedItems,
      };
    });
  };

  const handleTagChange = (itemIndex, language, tagIndex, value) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      const updatedTags = [...updatedItems[itemIndex][language].tags];
      updatedTags[tagIndex] = value;

      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        [language]: {
          ...updatedItems[itemIndex][language],
          tags: updatedTags,
        },
      };

      return {
        ...prev,
        items: updatedItems,
      };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, createEmptyBilingualItem()],
    }));
  };

  const deleteItem = (itemIndex) => {
    setFormData((prev) => {
      const updatedItems = prev.items.filter((_, index) => index !== itemIndex);

      return {
        ...prev,
        items: updatedItems.length > 0 ? updatedItems : [createEmptyBilingualItem()],
      };
    });
  };

  const addTag = (itemIndex) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[itemIndex] = {
        ar: {
          ...updatedItems[itemIndex].ar,
          tags: [...updatedItems[itemIndex].ar.tags, ""],
        },
        en: {
          ...updatedItems[itemIndex].en,
          tags: [...updatedItems[itemIndex].en.tags, ""],
        },
      };

      return {
        ...prev,
        items: updatedItems,
      };
    });
  };

  const deleteTag = (itemIndex, tagIndex) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];

      const nextArTags = updatedItems[itemIndex].ar.tags.filter((_, i) => i !== tagIndex);
      const nextEnTags = updatedItems[itemIndex].en.tags.filter((_, i) => i !== tagIndex);

      updatedItems[itemIndex] = {
        ar: {
          ...updatedItems[itemIndex].ar,
          tags: nextArTags.length > 0 ? nextArTags : [""],
        },
        en: {
          ...updatedItems[itemIndex].en,
          tags: nextEnTags.length > 0 ? nextEnTags : [""],
        },
      };

      return {
        ...prev,
        items: updatedItems,
      };
    });
  };

  const buildPayload = () => {
    const arItems = formData.items.map((item) => {
      const trimmed = trimLangItem(item.ar);
      return {
        company: trimmed.company,
        role: trimmed.role,
        period: trimmed.period,
        description: trimmed.description,
        tags: trimmed.tags,
      };
    });

    const enItems = formData.items.map((item) => {
      const trimmed = trimLangItem(item.en);
      return {
        company: trimmed.company,
        role: trimmed.role,
        period: trimmed.period,
        description: trimmed.description,
        tags: trimmed.tags,
      };
    });

    return {
      ar: {
        badge: formData.ar.badge.trim(),
        title: formData.ar.title.trim(),
        description: formData.ar.description.trim(),
        items: arItems,
      },
      en: {
        badge: formData.en.badge.trim(),
        title: formData.en.title.trim(),
        description: formData.en.description.trim(),
        items: enItems,
      },
      updatedAt: serverTimestamp(),
      updatedBy: user?.email || "unknown",
    };
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      if (!isTopLevelComplete(formData)) {
        setError(t.validationTopLevel);
        setSaving(false);
        return;
      }

      const validation = validateBilingualItems(formData.items);

      if (!validation.valid) {
        setError(
          validation.reason === "tags_count"
            ? t.validationTagsCount
            : t.validationItems
        );
        setSaving(false);
        return;
      }

      const docRef = doc(db, CONTENT_COLLECTION, CONTENT_DOC_ID);

      await setDoc(docRef, buildPayload(), { merge: true });

      setMessage(t.saveSuccess);
    } catch (err) {
      console.error("Error saving experience data:", err);
      setError(t.saveError);
    } finally {
      setSaving(false);

      setTimeout(() => {
        setMessage("");
        setError("");
      }, 4000);
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
        style={{ width: "100%", maxWidth: "100%" }}
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
            disabled={saveDisabled}
            title={saveDisabled ? t.validationItems : ""}
          >
            {saving ? t.saving : t.save}
          </button>
        </div>
      </div>

      <div
        className="content-card glass-card"
        style={{ width: "100%", maxWidth: "100%" }}
      >
        <div className="content-card__header">
          <h2>{t.formTitle}</h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div className="glass-card" style={{ padding: "20px" }}>
            <h3 style={{ marginTop: 0, marginBottom: "16px" }}>{t.arContent}</h3>

            <div className="fields-grid" style={{ width: "100%", maxWidth: "100%" }}>
              <div className="field-box">
                <label>{t.badge}</label>
                <input
                  type="text"
                  value={formData.ar.badge}
                  onChange={(e) => handleTopLevelChange("ar", "badge", e.target.value)}
                />
              </div>

              <div className="field-box field-box--full">
                <label>{t.title}</label>
                <input
                  type="text"
                  value={formData.ar.title}
                  onChange={(e) => handleTopLevelChange("ar", "title", e.target.value)}
                />
              </div>

              <div className="field-box field-box--full">
                <label>{t.description}</label>
                <textarea
                  rows={5}
                  value={formData.ar.description}
                  onChange={(e) =>
                    handleTopLevelChange("ar", "description", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: "20px" }}>
            <h3 style={{ marginTop: 0, marginBottom: "16px" }}>{t.enContent}</h3>

            <div className="fields-grid" style={{ width: "100%", maxWidth: "100%" }}>
              <div className="field-box">
                <label>{t.badge}</label>
                <input
                  type="text"
                  value={formData.en.badge}
                  onChange={(e) => handleTopLevelChange("en", "badge", e.target.value)}
                />
              </div>

              <div className="field-box field-box--full">
                <label>{t.title}</label>
                <input
                  type="text"
                  value={formData.en.title}
                  onChange={(e) => handleTopLevelChange("en", "title", e.target.value)}
                />
              </div>

              <div className="field-box field-box--full">
                <label>{t.description}</label>
                <textarea
                  rows={5}
                  value={formData.en.description}
                  onChange={(e) =>
                    handleTopLevelChange("en", "description", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="content-card glass-card"
        style={{ width: "100%", maxWidth: "100%", marginTop: "20px" }}
      >
        <div
          className="content-card__header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <h2>{t.itemsTitle}</h2>

          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={addItem}
          >
            {t.addItem}
          </button>
        </div>

        <div style={{ display: "grid", gap: "20px" }}>
          {formData.items.map((item, index) => (
            <div
              key={index}
              className="glass-card"
              style={{
                padding: "20px",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <h3 style={{ margin: 0 }}>
                  {t.itemNumber} {index + 1}
                </h3>

                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={() => deleteItem(index)}
                >
                  {t.deleteItem}
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div className="glass-card" style={{ padding: "16px" }}>
                  <h4 style={{ marginTop: 0, marginBottom: "16px" }}>{t.arContent}</h4>

                  <div className="fields-grid" style={{ width: "100%", maxWidth: "100%" }}>
                    <div className="field-box">
                      <label>{t.company}</label>
                      <input
                        type="text"
                        value={item.ar.company}
                        onChange={(e) =>
                          handleItemFieldChange(index, "ar", "company", e.target.value)
                        }
                      />
                    </div>

                    <div className="field-box">
                      <label>{t.role}</label>
                      <input
                        type="text"
                        value={item.ar.role}
                        onChange={(e) =>
                          handleItemFieldChange(index, "ar", "role", e.target.value)
                        }
                      />
                    </div>

                    <div className="field-box field-box--full">
                      <label>{t.period}</label>
                      <input
                        type="text"
                        value={item.ar.period}
                        onChange={(e) =>
                          handleItemFieldChange(index, "ar", "period", e.target.value)
                        }
                      />
                    </div>

                    <div className="field-box field-box--full">
                      <label>{t.itemDescription}</label>
                      <textarea
                        rows={5}
                        value={item.ar.description}
                        onChange={(e) =>
                          handleItemFieldChange(
                            index,
                            "ar",
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="field-box field-box--full">
                      <label>{t.tags}</label>

                      <div style={{ display: "grid", gap: "10px" }}>
                        {item.ar.tags.map((tag, tagIndex) => (
                          <input
                            key={tagIndex}
                            type="text"
                            value={tag}
                            placeholder={t.emptyTagPlaceholderAr}
                            onChange={(e) =>
                              handleTagChange(index, "ar", tagIndex, e.target.value)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: "16px" }}>
                  <h4 style={{ marginTop: 0, marginBottom: "16px" }}>{t.enContent}</h4>

                  <div className="fields-grid" style={{ width: "100%", maxWidth: "100%" }}>
                    <div className="field-box">
                      <label>{t.company}</label>
                      <input
                        type="text"
                        value={item.en.company}
                        onChange={(e) =>
                          handleItemFieldChange(index, "en", "company", e.target.value)
                        }
                      />
                    </div>

                    <div className="field-box">
                      <label>{t.role}</label>
                      <input
                        type="text"
                        value={item.en.role}
                        onChange={(e) =>
                          handleItemFieldChange(index, "en", "role", e.target.value)
                        }
                      />
                    </div>

                    <div className="field-box field-box--full">
                      <label>{t.period}</label>
                      <input
                        type="text"
                        value={item.en.period}
                        onChange={(e) =>
                          handleItemFieldChange(index, "en", "period", e.target.value)
                        }
                      />
                    </div>

                    <div className="field-box field-box--full">
                      <label>{t.itemDescription}</label>
                      <textarea
                        rows={5}
                        value={item.en.description}
                        onChange={(e) =>
                          handleItemFieldChange(
                            index,
                            "en",
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="field-box field-box--full">
                      <label>{t.tags}</label>

                      <div style={{ display: "grid", gap: "10px" }}>
                        {item.en.tags.map((tag, tagIndex) => (
                          <div
                            key={tagIndex}
                            style={{
                              display: "flex",
                              gap: "10px",
                              alignItems: "center",
                            }}
                          >
                            <input
                              type="text"
                              value={tag}
                              placeholder={t.emptyTagPlaceholderEn}
                              onChange={(e) =>
                                handleTagChange(index, "en", tagIndex, e.target.value)
                              }
                              style={{ flex: 1 }}
                            />

                            <button
                              type="button"
                              className="admin-btn admin-btn--ghost"
                              onClick={() => deleteTag(index, tagIndex)}
                            >
                              {t.deleteTag}
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          className="admin-btn admin-btn--primary"
                          onClick={() => addTag(index)}
                          style={{ width: "fit-content" }}
                        >
                          {t.addTag}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}