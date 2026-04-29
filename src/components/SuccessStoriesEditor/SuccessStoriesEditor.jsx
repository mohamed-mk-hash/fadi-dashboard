import React, { useEffect, useMemo, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

const successStoriesUiText = {
  ar: {
    formTitle: "تعديل محتوى قسم قصص النجاح",
    sectionTitle: "قسم قصص النجاح",
    firestoreInfo: "المسار المستخدم في Firebase",
    firestorePath: "siteContent / succes_stories",

    arabic: "العربية",
    english: "الإنجليزية",

    title: "العنوان",
    description: "الوصف العام",

    itemsTitle: "بطاقات قصص النجاح",
    addItem: "إضافة قصة نجاح",
    removeItem: "حذف القصة",

    cardTitle: "عنوان البطاقة",
    number: "الرقم / النتيجة",
    descriptionCard: "وصف البطاقة",
    image: "صورة البطاقة",
    imagePreview: "معاينة الصورة",
    currentImage: "الصورة الحالية",

    save: "حفظ التعديلات",
    saving: "جارٍ الحفظ...",
    loading: "جارٍ تحميل البيانات...",

    fetchError: "حدث خطأ أثناء تحميل بيانات قسم قصص النجاح",
    saveSuccess: "تم حفظ بيانات قسم قصص النجاح بنجاح",
    saveError: "حدث خطأ أثناء حفظ بيانات قسم قصص النجاح",

    note:
      "يمكنك الآن إضافة أكثر من قصة نجاح. كل عنصر يحتوي على رقم، عنوان، وصف، وصورة مستقلة.",
  },

  en: {
    formTitle: "Edit Success Stories Content",
    sectionTitle: "Success Stories Section",
    firestoreInfo: "Firebase path used",
    firestorePath: "siteContent / succes_stories",

    arabic: "Arabic",
    english: "English",

    title: "Title",
    description: "Main Description",

    itemsTitle: "Success Story Cards",
    addItem: "Add Success Story",
    removeItem: "Remove Story",

    cardTitle: "Card Title",
    number: "Number / Result",
    descriptionCard: "Card Description",
    image: "Card Image",
    imagePreview: "Image Preview",
    currentImage: "Current Image",

    save: "Save Changes",
    saving: "Saving...",
    loading: "Loading data...",

    fetchError: "Error loading success stories section data",
    saveSuccess: "Success stories section saved successfully",
    saveError: "Error saving success stories section data",

    note:
      "You can now add multiple success stories. Each item has its own number, title, description, and image.",
  },
};

const defaultItem = {
  number: "",
  card_title: "",
  description_card: "",
  imageLink: "",
  imagePublicId: "",
  imageFile: null,
};

const defaultSuccessStoriesData = {
  ar: {
    title: "",
    description: "",
    items: [{ ...defaultItem }],
  },
  en: {
    title: "",
    description: "",
    items: [{ ...defaultItem }],
  },
};

const normalizeItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [{ ...defaultItem }];
  }

  return items.map((item) => ({
    ...defaultItem,
    ...item,
    imageFile: null,
  }));
};

const normalizeLanguageData = (data = {}) => {
  return {
    title: data.title || "",
    description: data.description || "",
    items: normalizeItems(data.items),
  };
};

const compressImageToLimit = async (
  file,
  {
    maxSizeBytes = 10 * 1024 * 1024,
    maxWidth = 1600,
    maxHeight = 1600,
    minQuality = 0.45,
    initialQuality = 0.82,
    outputType = "image/jpeg",
  } = {}
) => {
  if (!file || !file.type?.startsWith("image/")) return file;
  if (file.size <= maxSizeBytes) return file;

  const readFileAsDataURL = (inputFile) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(inputFile);
    });

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const dataUrl = await readFileAsDataURL(file);
  const image = await loadImage(dataUrl);

  let targetWidth = image.width;
  let targetHeight = image.height;

  const widthRatio = maxWidth / targetWidth;
  const heightRatio = maxHeight / targetHeight;
  const ratio = Math.min(widthRatio, heightRatio, 1);

  targetWidth = Math.round(targetWidth * ratio);
  targetHeight = Math.round(targetHeight * ratio);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = targetWidth;
  canvas.height = targetHeight;
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  const toBlob = (quality, type) =>
    new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), type, quality);
    });

  let quality = initialQuality;
  let blob = await toBlob(quality, outputType);

  if (!blob) return file;

  while (blob.size > maxSizeBytes && quality > minQuality) {
    quality = Math.max(minQuality, quality - 0.08);
    blob = await toBlob(quality, outputType);
    if (!blob) return file;
  }

  let scale = 0.9;

  while (blob.size > maxSizeBytes && canvas.width > 800 && canvas.height > 800) {
    const resizedCanvas = document.createElement("canvas");
    const resizedCtx = resizedCanvas.getContext("2d");

    resizedCanvas.width = Math.round(canvas.width * scale);
    resizedCanvas.height = Math.round(canvas.height * scale);

    resizedCtx.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);

    canvas.width = resizedCanvas.width;
    canvas.height = resizedCanvas.height;
    ctx.drawImage(resizedCanvas, 0, 0);

    blob = await new Promise((resolve) => {
      canvas.toBlob((nextBlob) => resolve(nextBlob), outputType, quality);
    });

    if (!blob) return file;
    scale = 0.92;
  }

  const originalBaseName = file.name.replace(/\.[^/.]+$/, "");

  return new File([blob], `${originalBaseName}.jpg`, {
    type: outputType,
    lastModified: Date.now(),
  });
};

const uploadImageToCloudinary = async (file) => {
  if (!file) return { url: "", publicId: "" };

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary environment variables are missing");
  }

  const processedFile = await compressImageToLimit(file, {
    maxSizeBytes: 10 * 1024 * 1024,
    maxWidth: 1600,
    maxHeight: 1600,
    initialQuality: 0.82,
    minQuality: 0.45,
    outputType: "image/jpeg",
  });

  const body = new FormData();
  body.append("file", processedFile);
  body.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }

  return {
    url: data.secure_url || "",
    publicId: data.public_id || "",
  };
};

export default function SuccessStoriesEditor({ lang = "ar", user }) {
  const [editorLang, setEditorLang] = useState("ar");
  const [formData, setFormData] = useState(defaultSuccessStoriesData);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const t = successStoriesUiText[lang] || successStoriesUiText.ar;
  const currentData = formData[editorLang];

  const imagePreviews = useMemo(() => {
    return currentData.items.map((item) => {
      if (item.imageFile) {
        return URL.createObjectURL(item.imageFile);
      }

      return "";
    });
  }, [currentData.items]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        if (preview) URL.revokeObjectURL(preview);
      });
    };
  }, [imagePreviews]);

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
          ar: normalizeLanguageData(data.ar),
          en: normalizeLanguageData(data.en),
        });
      } else {
        await setDoc(docRef, {
          ...defaultSuccessStoriesData,
          updatedAt: serverTimestamp(),
          updatedBy: user?.email || "unknown",
        });

        setFormData(defaultSuccessStoriesData);
      }
    } catch (err) {
      console.error("Error fetching success stories data:", err);
      setError(t.fetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageRootChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [editorLang]: {
        ...prev[editorLang],
        [field]: value,
      },
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const items = [...prev[editorLang].items];

      items[index] = {
        ...items[index],
        [field]: value,
      };

      return {
        ...prev,
        [editorLang]: {
          ...prev[editorLang],
          items,
        },
      };
    });
  };

  const handleItemFileChange = (index, file) => {
    setFormData((prev) => {
      const items = [...prev[editorLang].items];

      items[index] = {
        ...items[index],
        imageFile: file || null,
      };

      return {
        ...prev,
        [editorLang]: {
          ...prev[editorLang],
          items,
        },
      };
    });
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      [editorLang]: {
        ...prev[editorLang],
        items: [...prev[editorLang].items, { ...defaultItem }],
      },
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => {
      const items = prev[editorLang].items.filter((_, itemIndex) => itemIndex !== index);

      return {
        ...prev,
        [editorLang]: {
          ...prev[editorLang],
          items: items.length > 0 ? items : [{ ...defaultItem }],
        },
      };
    });
  };

  const prepareItemsForSave = async (items) => {
    const preparedItems = [];

    for (const item of items) {
      let imageLink = item.imageLink || "";
      let imagePublicId = item.imagePublicId || "";

      if (item.imageFile) {
        const uploadedImage = await uploadImageToCloudinary(item.imageFile);
        imageLink = uploadedImage.url;
        imagePublicId = uploadedImage.publicId;
      }

      preparedItems.push({
        number: item.number || "",
        card_title: item.card_title || "",
        description_card: item.description_card || "",
        imageLink,
        imagePublicId,
      });
    }

    return preparedItems;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const arItems = await prepareItemsForSave(formData.ar.items);
      const enItems = await prepareItemsForSave(formData.en.items);

      const payload = {
        ar: {
          title: formData.ar.title || "",
          description: formData.ar.description || "",
          items: arItems,
        },
        en: {
          title: formData.en.title || "",
          description: formData.en.description || "",
          items: enItems,
        },
        updatedAt: serverTimestamp(),
        updatedBy: user?.email || "unknown",
      };

      const docRef = doc(db, "siteContent", "succes_stories");

      await setDoc(docRef, payload, { merge: true });

      setFormData({
        ar: {
          title: payload.ar.title,
          description: payload.ar.description,
          items: normalizeItems(payload.ar.items),
        },
        en: {
          title: payload.en.title,
          description: payload.en.description,
          items: normalizeItems(payload.en.items),
        },
      });

      setMessage(t.saveSuccess);
    } catch (err) {
      console.error("Error saving success stories data:", err);
      setError(err?.message || t.saveError);
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
            type="button"
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

        <div className="posts-language-row">
          <div className="language-switch">
            <button
              type="button"
              className={editorLang === "ar" ? "active" : ""}
              onClick={() => setEditorLang("ar")}
            >
              {t.arabic}
            </button>

            <button
              type="button"
              className={editorLang === "en" ? "active" : ""}
              onClick={() => setEditorLang("en")}
            >
              {t.english}
            </button>
          </div>
        </div>

        <div
          style={{
            marginBottom: "20px",
            padding: "14px 16px",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.04)",
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
              onChange={(e) => handleLanguageRootChange("title", e.target.value)}
            />
          </div>

          <div className="field-box field-box--full">
            <label>{t.description}</label>
            <textarea
              rows={4}
              value={currentData.description || ""}
              onChange={(e) =>
                handleLanguageRootChange("description", e.target.value)
              }
            />
          </div>

          <div
            className="field-box field-box--full"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "12px",
            }}
          >
            <h3 style={{ margin: 0 }}>{t.itemsTitle}</h3>

            <button
              className="admin-btn admin-btn--ghost"
              type="button"
              onClick={handleAddItem}
            >
              {t.addItem}
            </button>
          </div>

          {currentData.items.map((item, index) => {
            const preview = imagePreviews[index];
            const currentImage = item.imageLink;

            return (
              <div
                key={`${editorLang}-${index}`}
                className="field-box field-box--full"
                style={{
                  padding: "20px",
                  border: "1px solid #d8e2ec",
                  borderRadius: "18px",
                  marginBottom: "18px",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <strong>
                    {t.itemsTitle} #{index + 1}
                  </strong>

                  <button
                    className="admin-btn"
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    style={{
                      background: "#dc2626",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    {t.removeItem}
                  </button>
                </div>

                <div className="fields-grid">
                  <div className="field-box">
                    <label>{t.number}</label>
                    <input
                      type="text"
                      value={item.number || ""}
                      onChange={(e) =>
                        handleItemChange(index, "number", e.target.value)
                      }
                    />
                  </div>

                  <div className="field-box">
                    <label>{t.cardTitle}</label>
                    <input
                      type="text"
                      value={item.card_title || ""}
                      onChange={(e) =>
                        handleItemChange(index, "card_title", e.target.value)
                      }
                    />
                  </div>

                  <div className="field-box field-box--full">
                    <label>{t.descriptionCard}</label>
                    <textarea
                      rows={4}
                      value={item.description_card || ""}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "description_card",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="field-box field-box--full">
                    <label>{t.image}</label>
                    <input
                      className="posts-file-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleItemFileChange(index, e.target.files?.[0])
                      }
                    />
                  </div>

                  {(preview || currentImage) && (
                    <div className="field-box field-box--full">
                      <label>{preview ? t.imagePreview : t.currentImage}</label>
                      <div className="posts-preview-wrap">
                        <img
                          src={preview || currentImage}
                          alt={item.card_title || "Success story"}
                          className="posts-preview-image"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}