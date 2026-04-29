import React, { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import "./PostsEditor.css";

const postsUiText = {
  ar: {
    formTitle: "إضافة / تعديل منشور",
    sectionTitle: "قسم المنشورات",
    firestoreInfo: "المسار المستخدم في Firebase",
    firestorePath: "posts",

    arabic: "العربية",
    english: "الإنجليزية",

    category: "نوع المنشور",
    article: "مقال",
    news: "خبر",
    event: "فعالية",
    interview: "مقابلة",
    media: "مرئي / فيديو",

    slug: "الرابط المختصر (Slug)",
    generateSlug: "Generate Slug",

    status: "الحالة",
    draft: "مسودة",
    published: "منشور",
    archived: "مؤرشف",

    featuredImage: "الصورة الرئيسية",
    middleImage: "صورة المنتصف",
    preview: "معاينة الصورة",
    currentImage: "الصورة الحالية",

    title: "العنوان",
    subtitle: "العنوان الفرعي",
    excerpt: "الوصف المختصر",
    locationText: "النص السفلي (مكان / تاريخ / مدينة)",
    readTime: "مدة القراءة بالدقائق",
    tags: "الوسوم",
    tagsPlaceholder: "مثال: leadership, investment, dubai",

    contentTopHtml: "المحتوى قبل صورة المنتصف (HTML)",
    contentBottomHtml: "المحتوى بعد صورة المنتصف (HTML)",
    middleImageCaption: "وصف صورة المنتصف",

    seoTitle: "SEO Title",
    seoDescription: "SEO Description",

    eventDate: "تاريخ الفعالية",
    eventEndDate: "تاريخ انتهاء الفعالية",

    sourceName: "اسم المصدر",
    sourceUrl: "رابط المصدر",
    sourcePublishedAt: "تاريخ نشر المصدر",

    videoUrl: "رابط الفيديو",
    videoPlatform: "منصة الفيديو",
    videoChannel: "اسم القناة",
    videoPublishedAt: "تاريخ نشر الفيديو",

    insertTopTemplate: "إدراج قالب البداية",
    insertBottomTemplate: "إدراج قالب النهاية",

    topHelper:
      "اكتب بداية المحتوى هنا: مقدمة، فقرات أولى، اقتباس، أو عنوان فرعي قبل صورة المنتصف.",
    bottomHelper:
      "اكتب بقية المحتوى هنا: فقرات إضافية، موارد أخرى، قائمة، خاتمة.",

    save: "حفظ المنشور",
    saving: "جارٍ الحفظ...",
    update: "تحديث المنشور",
    updating: "جارٍ التحديث...",
    cancelEdit: "إلغاء التعديل",

    success: "تم إنشاء المنشور بنجاح",
    updateSuccess: "تم تحديث المنشور بنجاح",
    deleteSuccess: "تم حذف المنشور بنجاح",
    error: "حدث خطأ أثناء حفظ المنشور",
    deleteError: "حدث خطأ أثناء حذف المنشور",
    loadError: "حدث خطأ أثناء تحميل المنشورات",
    slugRequired: "يرجى إدخال الـ slug",
    titleRequired: "يرجى إدخال عنوان المنشور على الأقل بإحدى اللغتين",
    featuredImageRequired: "يرجى اختيار الصورة الرئيسية",
    eventDateInvalid: "يرجى التأكد أن تاريخ انتهاء الفعالية بعد تاريخ بدايتها",

    postsList: "كل المنشورات",
    loadingPosts: "جارٍ تحميل المنشورات...",
    noPosts: "لا توجد منشورات حالياً",
    edit: "تعديل",
    remove: "حذف",
    createdAt: "تاريخ الإنشاء",
    updatedAt: "آخر تحديث",
    publishedAt: "تاريخ النشر",
    createdBy: "تم الإنشاء بواسطة",
    confirmDelete: "هل أنت متأكد أنك تريد حذف هذا المنشور؟",
    editingNow: "أنت الآن تعدل هذا المنشور",

    goToList: "عرض المنشورات",
    goToAdd: "إضافة منشور جديد",
    formModeBadge: "إضافة / تعديل منشور",
    listModeBadge: "إدارة المنشورات",

    contentNoteTitle: "ملاحظة مهمة",
    contentNoteText:
      "الكتابة هنا تكون بصيغة HTML لكن بدون إدراج صورة المنتصف داخل المحتوى. صورة المنتصف لها حقل مستقل بالأسفل.",
  },
  en: {
    formTitle: "Add / Edit Post",
    sectionTitle: "Posts Section",
    firestoreInfo: "Firebase path used",
    firestorePath: "posts",

    arabic: "Arabic",
    english: "English",

    category: "Post Type",
    article: "Article",
    news: "News",
    event: "Event",
    interview: "Interview",
    media: "Media / Video",

    slug: "Slug",
    generateSlug: "Generate Slug",

    status: "Status",
    draft: "Draft",
    published: "Published",
    archived: "Archived",

    featuredImage: "Featured Image",
    middleImage: "Middle Image",
    preview: "Image Preview",
    currentImage: "Current Image",

    title: "Title",
    subtitle: "Subtitle",
    excerpt: "Excerpt",
    locationText: "Bottom Meta Text (Location / Date / City)",
    readTime: "Read Time (minutes)",
    tags: "Tags",
    tagsPlaceholder: "Example: leadership, investment, dubai",

    contentTopHtml: "Content Before Middle Image (HTML)",
    contentBottomHtml: "Content After Middle Image (HTML)",
    middleImageCaption: "Middle Image Caption",

    seoTitle: "SEO Title",
    seoDescription: "SEO Description",

    eventDate: "Event Date",
    eventEndDate: "Event End Date",

    sourceName: "Source Name",
    sourceUrl: "Source URL",
    sourcePublishedAt: "Source Published At",

    videoUrl: "Video URL",
    videoPlatform: "Video Platform",
    videoChannel: "Video Channel",
    videoPublishedAt: "Video Published At",

    insertTopTemplate: "Insert Top Template",
    insertBottomTemplate: "Insert Bottom Template",

    topHelper:
      "Write the beginning of the content here: introduction, opening paragraphs, quote, or subheading before the middle image.",
    bottomHelper:
      "Write the rest of the content here: extra paragraphs, resources, list, conclusion.",

    save: "Save Post",
    saving: "Saving...",
    update: "Update Post",
    updating: "Updating...",
    cancelEdit: "Cancel Edit",

    success: "Post created successfully",
    updateSuccess: "Post updated successfully",
    deleteSuccess: "Post deleted successfully",
    error: "Error saving post",
    deleteError: "Error deleting post",
    loadError: "Error loading posts",
    slugRequired: "Please enter the slug",
    titleRequired: "Please enter the title in at least one language",
    featuredImageRequired: "Please select the featured image",
    eventDateInvalid: "Please make sure the event end date is after the start date",

    postsList: "All Posts",
    loadingPosts: "Loading posts...",
    noPosts: "No posts found",
    edit: "Edit",
    remove: "Delete",
    createdAt: "Created At",
    updatedAt: "Updated At",
    publishedAt: "Published At",
    createdBy: "Created By",
    confirmDelete: "Are you sure you want to delete this post?",
    editingNow: "You are now editing this post",

    goToList: "Show Posts",
    goToAdd: "Add New Post",
    formModeBadge: "Add / Edit Post",
    listModeBadge: "Manage Posts",

    contentNoteTitle: "Important Note",
    contentNoteText:
      "Write here in HTML format, but do not insert the middle image inside the content. The middle image has its own dedicated field below.",
  },
};

const topTemplate = {
  ar: `<h2>المقدمة</h2>
<p>اكتب الفقرة الأولى هنا...</p>
<p>اكتب الفقرة الثانية هنا...</p>

<blockquote>
  "اكتب الاقتباس هنا"
  <span class="quote-author">— اسم القائل، المسمى الوظيفي</span>
</blockquote>

<h3>عنوان فرعي</h3>
<p>اكتب نصًا إضافيًا قبل صورة المنتصف هنا...</p>`,
  en: `<h2>Introduction</h2>
<p>Write the first paragraph here...</p>
<p>Write the second paragraph here...</p>

<blockquote>
  "Write the quote here"
  <span class="quote-author">— Speaker name, job title</span>
</blockquote>

<h3>Subheading</h3>
<p>Write more text before the middle image here...</p>`,
};

const bottomTemplate = {
  ar: `<h3>موارد أخرى</h3>
<p>اكتب النص هنا...</p>

<ol>
  <li>العنصر الأول</li>
  <li>العنصر الثاني</li>
  <li>العنصر الثالث</li>
</ol>

<h3>الخاتمة</h3>
<p>اكتب فقرة الخاتمة هنا...</p>
<p>اكتب فقرة إضافية هنا...</p>`,
  en: `<h3>Other resources</h3>
<p>Write the text here...</p>

<ol>
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
</ol>

<h3>Conclusion</h3>
<p>Write the conclusion paragraph here...</p>
<p>Write another paragraph here...</p>`,
};

const defaultLocalizedData = {
  title: "",
  subtitle: "",
  excerpt: "",
  contentTopHtml: "",
  contentBottomHtml: "",
  middleImageCaption: "",
  locationText: "",
  seoTitle: "",
  seoDescription: "",
};

const defaultPostData = {
  category: "article",
  slug: "",
  status: "draft",

  tagsInput: "",
  readTime: 0,

  eventDate: "",
  eventEndDate: "",

  sourceName: "",
  sourceUrl: "",
  sourcePublishedAt: "",

  videoUrl: "",
  videoPlatform: "youtube",
  videoChannel: "",
  videoPublishedAt: "",

  featuredImageFile: null,
  middleImageFile: null,

  featuredImageUrl: "",
  featuredImagePublicId: "",
  middleImageUrl: "",
  middleImagePublicId: "",

  gallery: [],

  publishedAt: null,
  createdAt: null,
  updatedAt: null,
  createdBy: "",

  ar: { ...defaultLocalizedData },
  en: { ...defaultLocalizedData },
};

const createSlug = (text = "") =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

const formatDate = (value) => {
  if (!value) return "-";

  try {
    if (typeof value?.toDate === "function") {
      return value.toDate().toLocaleString();
    }
    if (value instanceof Date) {
      return value.toLocaleString();
    }
    return new Date(value).toLocaleString();
  } catch {
    return "-";
  }
};

const toDateTimeLocalValue = (value) => {
  if (!value) return "";
  try {
    const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`;
  } catch {
    return "";
  }
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
    { method: "POST", body }
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

export default function PostsEditor({ lang = "ar", user }) {
  const [editorLang, setEditorLang] = useState("ar");
  const [viewMode, setViewMode] = useState("list");
  const [formData, setFormData] = useState(defaultPostData);
  const [posts, setPosts] = useState([]);

  const [saving, setSaving] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingPostId, setEditingPostId] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const t = postsUiText[lang] || postsUiText.ar;
  const currentData = formData[editorLang];
  const isEditing = Boolean(editingPostId);

  const isEvent = formData.category === "event";
  const isMedia = formData.category === "media";
  const isInterview = formData.category === "interview";

  const featuredPreview = useMemo(() => {
    if (formData.featuredImageFile) {
      return URL.createObjectURL(formData.featuredImageFile);
    }
    return "";
  }, [formData.featuredImageFile]);

  const middlePreview = useMemo(() => {
    if (formData.middleImageFile) {
      return URL.createObjectURL(formData.middleImageFile);
    }
    return "";
  }, [formData.middleImageFile]);

  useEffect(() => {
    return () => {
      if (featuredPreview) URL.revokeObjectURL(featuredPreview);
    };
  }, [featuredPreview]);

  useEffect(() => {
    return () => {
      if (middlePreview) URL.revokeObjectURL(middlePreview);
    };
  }, [middlePreview]);

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      setError("");

      const postsRef = collection(db, "posts");
      const postsQuery = query(postsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(postsQuery);

      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setPosts(data);
    } catch (err) {
      console.error("Error loading posts:", err);
      setError(t.loadError);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleRootChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocalizedChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [editorLang]: {
        ...prev[editorLang],
        [field]: value,
      },
    }));
  };

  const handleFileChange = (field, file) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file || null,
    }));
  };

  const handleGenerateSlug = () => {
    const sourceTitle = formData.en.title || formData.ar.title || "";
    const generatedSlug = createSlug(sourceTitle);

    setFormData((prev) => ({
      ...prev,
      slug: generatedSlug,
    }));
  };

  const handleInsertTopTemplate = () => {
    setFormData((prev) => ({
      ...prev,
      [editorLang]: {
        ...prev[editorLang],
        contentTopHtml: topTemplate[editorLang],
      },
    }));
  };

  const handleInsertBottomTemplate = () => {
    setFormData((prev) => ({
      ...prev,
      [editorLang]: {
        ...prev[editorLang],
        contentBottomHtml: bottomTemplate[editorLang],
      },
    }));
  };

  const resetForm = () => {
    setFormData({
      ...defaultPostData,
      ar: { ...defaultLocalizedData },
      en: { ...defaultLocalizedData },
    });
    setEditorLang("ar");
    setEditingPostId("");
  };

  const openCreateForm = () => {
    resetForm();
    setMessage("");
    setError("");
    setViewMode("form");
  };

  const openListPage = async () => {
    setViewMode("list");
    setEditingPostId("");
    await fetchPosts();
  };

  const handleEditPost = (post) => {
    setEditingPostId(post.id);

    setFormData({
      category: post.category || "article",
      slug: post.slug || "",
      status: post.status || "draft",

      tagsInput: Array.isArray(post.tags) ? post.tags.join(", ") : "",
      readTime: Number(post.readTime || 0),

      eventDate: toDateTimeLocalValue(post.eventDate),
      eventEndDate: toDateTimeLocalValue(post.eventEndDate),

      sourceName: post.sourceName || "",
      sourceUrl: post.sourceUrl || "",
      sourcePublishedAt: toDateTimeLocalValue(post.sourcePublishedAt),

      videoUrl: post.videoUrl || "",
      videoPlatform: post.videoPlatform || "youtube",
      videoChannel: post.videoChannel || "",
      videoPublishedAt: toDateTimeLocalValue(post.videoPublishedAt),

      featuredImageFile: null,
      middleImageFile: null,

      featuredImageUrl: post.featuredImageUrl || "",
      featuredImagePublicId: post.featuredImagePublicId || "",
      middleImageUrl: post.middleImageUrl || "",
      middleImagePublicId: post.middleImagePublicId || "",

      gallery: Array.isArray(post.gallery) ? post.gallery : [],

      publishedAt: post.publishedAt || null,
      createdAt: post.createdAt || null,
      updatedAt: post.updatedAt || null,
      createdBy: post.createdBy || "",

      ar: {
        ...defaultLocalizedData,
        ...(post.ar || {}),
      },
      en: {
        ...defaultLocalizedData,
        ...(post.en || {}),
      },
    });

    setMessage(t.editingNow);
    setError("");
    setViewMode("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeletePost = async (postId) => {
    const confirmed = window.confirm(t.confirmDelete);
    if (!confirmed) return;

    try {
      setDeletingId(postId);
      setMessage("");
      setError("");

      await deleteDoc(doc(db, "posts", postId));

      if (editingPostId === postId) {
        resetForm();
      }

      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setMessage(t.deleteSuccess);
    } catch (err) {
      console.error("Error deleting post:", err);
      setError(err?.message || t.deleteError);
    } finally {
      setDeletingId("");
      setTimeout(() => {
        setMessage("");
        setError("");
      }, 4000);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      if (!formData.slug.trim()) {
        setError(t.slugRequired);
        return;
      }

      if (!formData.ar.title.trim() && !formData.en.title.trim()) {
        setError(t.titleRequired);
        return;
      }

      if (!isEditing && !formData.featuredImageFile) {
        setError(t.featuredImageRequired);
        return;
      }

      if (isEditing && !formData.featuredImageFile && !formData.featuredImageUrl) {
        setError(t.featuredImageRequired);
        return;
      }

      if (
        formData.category === "event" &&
        formData.eventDate &&
        formData.eventEndDate &&
        new Date(formData.eventEndDate) < new Date(formData.eventDate)
      ) {
        setError(t.eventDateInvalid);
        return;
      }

      let featuredUpload = {
        url: formData.featuredImageUrl || "",
        publicId: formData.featuredImagePublicId || "",
      };

      let middleUpload = {
        url: formData.middleImageUrl || "",
        publicId: formData.middleImagePublicId || "",
      };

      if (formData.featuredImageFile) {
        featuredUpload = await uploadImageToCloudinary(formData.featuredImageFile);
      }

      if (formData.middleImageFile) {
        middleUpload = await uploadImageToCloudinary(formData.middleImageFile);
      }

      const payload = {
        category: formData.category,
        slug: formData.slug.trim(),
        status: formData.status,

        tags: formData.tagsInput
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        readTime: Number(formData.readTime || 0),

        eventDate:
          formData.category === "event" && formData.eventDate
            ? new Date(formData.eventDate)
            : null,
        eventEndDate:
          formData.category === "event" && formData.eventEndDate
            ? new Date(formData.eventEndDate)
            : null,

        sourceName:
          formData.category === "interview" ? formData.sourceName.trim() : "",
        sourceUrl:
          formData.category === "interview" ? formData.sourceUrl.trim() : "",
        sourcePublishedAt:
          formData.category === "interview" && formData.sourcePublishedAt
            ? new Date(formData.sourcePublishedAt)
            : null,

        videoUrl: formData.category === "media" ? formData.videoUrl.trim() : "",
        videoPlatform:
          formData.category === "media" ? formData.videoPlatform.trim() : "",
        videoChannel:
          formData.category === "media" ? formData.videoChannel.trim() : "",
        videoPublishedAt:
          formData.category === "media" && formData.videoPublishedAt
            ? new Date(formData.videoPublishedAt)
            : null,

        featuredImageUrl: featuredUpload.url,
        featuredImagePublicId: featuredUpload.publicId,
        middleImageUrl: middleUpload.url,
        middleImagePublicId: middleUpload.publicId,

        gallery: Array.isArray(formData.gallery) ? formData.gallery : [],

        updatedAt: serverTimestamp(),
        createdBy: formData.createdBy || user?.email || "unknown",

        ar: {
          title: formData.ar.title.trim(),
          subtitle: formData.ar.subtitle.trim(),
          excerpt: formData.ar.excerpt.trim(),
          contentTopHtml: formData.ar.contentTopHtml,
          contentBottomHtml: formData.ar.contentBottomHtml,
          middleImageCaption: formData.ar.middleImageCaption.trim(),
          locationText: formData.ar.locationText.trim(),
          seoTitle: formData.ar.seoTitle.trim(),
          seoDescription: formData.ar.seoDescription.trim(),
        },

        en: {
          title: formData.en.title.trim(),
          subtitle: formData.en.subtitle.trim(),
          excerpt: formData.en.excerpt.trim(),
          contentTopHtml: formData.en.contentTopHtml,
          contentBottomHtml: formData.en.contentBottomHtml,
          middleImageCaption: formData.en.middleImageCaption.trim(),
          locationText: formData.en.locationText.trim(),
          seoTitle: formData.en.seoTitle.trim(),
          seoDescription: formData.en.seoDescription.trim(),
        },
      };

      if (isEditing) {
        payload.publishedAt =
          formData.status === "published"
            ? formData.publishedAt || serverTimestamp()
            : null;

        await updateDoc(doc(db, "posts", editingPostId), payload);
        setMessage(t.updateSuccess);
      } else {
        payload.createdAt = serverTimestamp();
        payload.publishedAt =
          formData.status === "published" ? serverTimestamp() : null;

        await addDoc(collection(db, "posts"), payload);
        setMessage(t.success);
      }

      resetForm();
      await fetchPosts();
      setViewMode("list");
    } catch (err) {
      console.error("Error saving post:", err);
      setError(err?.message || t.error);
    } finally {
      setSaving(false);

      setTimeout(() => {
        setMessage("");
        setError("");
      }, 4000);
    }
  };

  const getCategoryLabel = (value) => {
    switch (value) {
      case "news":
        return t.news;
      case "event":
        return t.event;
      case "interview":
        return t.interview;
      case "media":
        return t.media;
      default:
        return t.article;
    }
  };

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

      <div className="editor-header glass-card" style={{ width: "100%", maxWidth: "100%" }}>
        <div className="editor-header__text">
          <span className="editor-badge">
            {viewMode === "list" ? t.listModeBadge : t.formModeBadge}
          </span>
          <h1>{t.sectionTitle}</h1>
          <p>
            {t.firestoreInfo}: <strong>{t.firestorePath}</strong>
          </p>
        </div>

        <div
          className="editor-header__actions"
          style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
        >
          {viewMode === "list" ? (
            <button className="admin-btn admin-btn--primary" type="button" onClick={openCreateForm}>
              {t.goToAdd}
            </button>
          ) : (
            <>
              <button className="admin-btn admin-btn--ghost" type="button" onClick={openListPage}>
                {t.goToList}
              </button>

              {isEditing && (
                <button
                  className="admin-btn admin-btn--ghost"
                  type="button"
                  onClick={() => {
                    resetForm();
                    setViewMode("list");
                  }}
                >
                  {t.cancelEdit}
                </button>
              )}

              <button
                className="admin-btn admin-btn--primary"
                onClick={handleSave}
                disabled={saving}
                type="button"
              >
                {saving ? (isEditing ? t.updating : t.saving) : isEditing ? t.update : t.save}
              </button>
            </>
          )}
        </div>
      </div>

      {viewMode === "form" && (
        <div className="content-card glass-card" style={{ width: "100%", maxWidth: "100%" }}>
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

          <div className="posts-three-cols">
            <div className="field-box">
              <label>{t.category}</label>
              <select
                className="posts-select"
                value={formData.category}
                onChange={(e) => handleRootChange("category", e.target.value)}
              >
                <option value="article">{t.article}</option>
                <option value="news">{t.news}</option>
                <option value="event">{t.event}</option>
                <option value="interview">{t.interview}</option>
                <option value="media">{t.media}</option>
              </select>
            </div>

            <div className="field-box">
              <label>{t.status}</label>
              <select
                className="posts-select"
                value={formData.status}
                onChange={(e) => handleRootChange("status", e.target.value)}
              >
                <option value="draft">{t.draft}</option>
                <option value="published">{t.published}</option>
                <option value="archived">{t.archived}</option>
              </select>
            </div>

            <div className="field-box">
              <label>{t.readTime}</label>
              <input
                type="number"
                min="0"
                value={formData.readTime}
                onChange={(e) => handleRootChange("readTime", e.target.value)}
              />
            </div>
          </div>

          {isEvent && (
            <div className="posts-two-cols">
              <div className="field-box">
                <label>{t.eventDate}</label>
                <input
                  type="datetime-local"
                  value={formData.eventDate}
                  onChange={(e) => handleRootChange("eventDate", e.target.value)}
                />
              </div>

              <div className="field-box">
                <label>{t.eventEndDate}</label>
                <input
                  type="datetime-local"
                  value={formData.eventEndDate}
                  onChange={(e) => handleRootChange("eventEndDate", e.target.value)}
                />
              </div>
            </div>
          )}

          {isInterview && (
            <div className="posts-three-cols">
              <div className="field-box">
                <label>{t.sourceName}</label>
                <input
                  type="text"
                  value={formData.sourceName}
                  onChange={(e) => handleRootChange("sourceName", e.target.value)}
                />
              </div>

              <div className="field-box">
                <label>{t.sourceUrl}</label>
                <input
                  type="text"
                  value={formData.sourceUrl}
                  onChange={(e) => handleRootChange("sourceUrl", e.target.value)}
                />
              </div>

              <div className="field-box">
                <label>{t.sourcePublishedAt}</label>
                <input
                  type="datetime-local"
                  value={formData.sourcePublishedAt}
                  onChange={(e) => handleRootChange("sourcePublishedAt", e.target.value)}
                />
              </div>
            </div>
          )}

          {isMedia && (
            <div className="posts-two-cols">
              <div className="field-box">
                <label>{t.videoUrl}</label>
                <input
                  type="text"
                  value={formData.videoUrl}
                  onChange={(e) => handleRootChange("videoUrl", e.target.value)}
                />
              </div>

              <div className="field-box">
                <label>{t.videoPlatform}</label>
                <select
                  className="posts-select"
                  value={formData.videoPlatform}
                  onChange={(e) => handleRootChange("videoPlatform", e.target.value)}
                >
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          {isMedia && (
            <div className="posts-two-cols">
              <div className="field-box">
                <label>{t.videoChannel}</label>
                <input
                  type="text"
                  value={formData.videoChannel}
                  onChange={(e) => handleRootChange("videoChannel", e.target.value)}
                />
              </div>

              <div className="field-box">
                <label>{t.videoPublishedAt}</label>
                <input
                  type="datetime-local"
                  value={formData.videoPublishedAt}
                  onChange={(e) => handleRootChange("videoPublishedAt", e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="posts-two-cols">
            <div className="field-box">
              <label>{t.slug}</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleRootChange("slug", e.target.value)}
                placeholder="strategic-investment-forum-dubai"
              />
            </div>

            <div className="field-box posts-button-box">
              <label className="posts-hidden-label">Generate</label>
              <button
                type="button"
                className="admin-btn admin-btn--ghost posts-full-btn"
                onClick={handleGenerateSlug}
              >
                {t.generateSlug}
              </button>
            </div>
          </div>

          <div className="posts-two-cols">
            <div className="field-box">
              <label>{t.featuredImage}</label>
              <input
                className="posts-file-input"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("featuredImageFile", e.target.files?.[0])}
              />
            </div>

            <div className="field-box">
              <label>{t.tags}</label>
              <input
                type="text"
                value={formData.tagsInput}
                onChange={(e) => handleRootChange("tagsInput", e.target.value)}
                placeholder={t.tagsPlaceholder}
              />
            </div>
          </div>

          {(featuredPreview || formData.featuredImageUrl) && (
            <div className="field-box field-box--full">
              <label>{featuredPreview ? t.preview : t.currentImage}</label>
              <div className="posts-preview-wrap">
                <img
                  src={featuredPreview || formData.featuredImageUrl}
                  alt="Featured Preview"
                  className="posts-preview-image"
                />
              </div>
            </div>
          )}

          <div className="field-box field-box--full">
            <label>{t.title}</label>
            <input
              type="text"
              value={currentData.title}
              onChange={(e) => handleLocalizedChange("title", e.target.value)}
            />
          </div>

          <div className="field-box field-box--full">
            <label>{t.subtitle}</label>
            <textarea
              rows={3}
              value={currentData.subtitle}
              onChange={(e) => handleLocalizedChange("subtitle", e.target.value)}
            />
          </div>

          <div className="field-box field-box--full">
            <label>{t.excerpt}</label>
            <textarea
              rows={3}
              value={currentData.excerpt}
              onChange={(e) => handleLocalizedChange("excerpt", e.target.value)}
            />
          </div>

          <div className="field-box field-box--full">
            <label>{t.locationText}</label>
            <input
              type="text"
              value={currentData.locationText}
              onChange={(e) => handleLocalizedChange("locationText", e.target.value)}
            />
          </div>

          <div className="posts-help-card">
            <strong>{t.contentNoteTitle}</strong>
            <p>{t.contentNoteText}</p>
          </div>

          <div className="field-box field-box--full">
            <div className="posts-content-header">
              <label>{t.contentTopHtml}</label>
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={handleInsertTopTemplate}
              >
                {t.insertTopTemplate}
              </button>
            </div>

            <p className="posts-helper-text">{t.topHelper}</p>

            <textarea
              className="posts-content-textarea"
              rows={12}
              value={currentData.contentTopHtml}
              onChange={(e) => handleLocalizedChange("contentTopHtml", e.target.value)}
            />
          </div>

          <div className="posts-middle-image-block">
            <h3 className="posts-middle-image-title">{t.middleImage}</h3>

            <div className="posts-two-cols">
              <div className="field-box">
                <label>{t.middleImage}</label>
                <input
                  className="posts-file-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("middleImageFile", e.target.files?.[0])}
                />
              </div>

              <div className="field-box">
                <label>{t.middleImageCaption}</label>
                <input
                  type="text"
                  value={currentData.middleImageCaption}
                  onChange={(e) =>
                    handleLocalizedChange("middleImageCaption", e.target.value)
                  }
                />
              </div>
            </div>

            {(middlePreview || formData.middleImageUrl) && (
              <div className="field-box field-box--full">
                <label>{middlePreview ? t.preview : t.currentImage}</label>
                <div className="posts-preview-wrap">
                  <img
                    src={middlePreview || formData.middleImageUrl}
                    alt="Middle Preview"
                    className="posts-preview-image"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="field-box field-box--full">
            <div className="posts-content-header">
              <label>{t.contentBottomHtml}</label>
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={handleInsertBottomTemplate}
              >
                {t.insertBottomTemplate}
              </button>
            </div>

            <p className="posts-helper-text">{t.bottomHelper}</p>

            <textarea
              className="posts-content-textarea"
              rows={12}
              value={currentData.contentBottomHtml}
              onChange={(e) => handleLocalizedChange("contentBottomHtml", e.target.value)}
            />
          </div>

          <div className="field-box field-box--full">
            <label>{t.seoTitle}</label>
            <input
              type="text"
              value={currentData.seoTitle}
              onChange={(e) => handleLocalizedChange("seoTitle", e.target.value)}
            />
          </div>

          <div className="field-box field-box--full">
            <label>{t.seoDescription}</label>
            <textarea
              rows={3}
              value={currentData.seoDescription}
              onChange={(e) => handleLocalizedChange("seoDescription", e.target.value)}
            />
          </div>
        </div>
      )}

      {viewMode === "list" && (
        <div
          className="content-card glass-card"
          style={{ width: "100%", maxWidth: "100%", marginTop: "24px" }}
        >
          <div className="content-card__header">
            <h2>{t.postsList}</h2>
          </div>

          {loadingPosts ? (
            <p>{t.loadingPosts}</p>
          ) : posts.length === 0 ? (
            <p>{t.noPosts}</p>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {posts.map((post) => {
                const title =
                  post?.[lang]?.title ||
                  post?.en?.title ||
                  post?.ar?.title ||
                  post.slug ||
                  "Untitled";

                const subtitle =
                  post?.[lang]?.subtitle ||
                  post?.en?.subtitle ||
                  post?.ar?.subtitle ||
                  "";

                return (
                  <div
                    key={post.id}
                    className="glass-card"
                    style={{
                      padding: "16px",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: post.featuredImageUrl ? "140px 1fr" : "1fr",
                        gap: "16px",
                        alignItems: "start",
                      }}
                    >
                      {post.featuredImageUrl && (
                        <img
                          src={post.featuredImageUrl}
                          alt={title}
                          style={{
                            width: "140px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "12px",
                          }}
                        />
                      )}

                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "12px",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <h3 style={{ margin: "0 0 8px" }}>{title}</h3>
                            <p style={{ margin: "0 0 8px", opacity: 0.8 }}>
                              <strong>{t.category}:</strong> {getCategoryLabel(post.category)}
                            </p>
                            <p style={{ margin: "0 0 8px", opacity: 0.8 }}>
                              <strong>Slug:</strong> {post.slug || "-"}
                            </p>
                            <p style={{ margin: "0 0 8px", opacity: 0.8 }}>
                              <strong>{t.status}:</strong>{" "}
                              {post.status === "published"
                                ? t.published
                                : post.status === "archived"
                                ? t.archived
                                : t.draft}
                            </p>
                          </div>

                          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <button
                              type="button"
                              className="admin-btn admin-btn--ghost"
                              onClick={() => handleEditPost(post)}
                            >
                              {t.edit}
                            </button>

                            <button
                              type="button"
                              className="admin-btn"
                              onClick={() => handleDeletePost(post.id)}
                              disabled={deletingId === post.id}
                              style={{
                                background: "#dc2626",
                                color: "#fff",
                                border: "none",
                              }}
                            >
                              {deletingId === post.id ? `${t.remove}...` : t.remove}
                            </button>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gap: "6px",
                            marginTop: "10px",
                            fontSize: "14px",
                            opacity: 0.85,
                          }}
                        >
                          <div>
                            <strong>{t.createdBy}:</strong> {post.createdBy || "-"}
                          </div>
                          <div>
                            <strong>{t.createdAt}:</strong> {formatDate(post.createdAt)}
                          </div>
                          <div>
                            <strong>{t.updatedAt}:</strong> {formatDate(post.updatedAt)}
                          </div>
                          <div>
                            <strong>{t.publishedAt}:</strong> {formatDate(post.publishedAt)}
                          </div>

                          {post.category === "event" && (
                            <>
                              <div>
                                <strong>{t.eventDate}:</strong> {formatDate(post.eventDate)}
                              </div>
                              <div>
                                <strong>{t.eventEndDate}:</strong>{" "}
                                {formatDate(post.eventEndDate)}
                              </div>
                            </>
                          )}

                          {post.category === "interview" && (
                            <>
                              <div>
                                <strong>{t.sourceName}:</strong> {post.sourceName || "-"}
                              </div>
                              <div>
                                <strong>{t.sourcePublishedAt}:</strong>{" "}
                                {formatDate(post.sourcePublishedAt)}
                              </div>
                            </>
                          )}

                          {post.category === "media" && (
                            <>
                              <div>
                                <strong>{t.videoPlatform}:</strong> {post.videoPlatform || "-"}
                              </div>
                              <div>
                                <strong>{t.videoChannel}:</strong> {post.videoChannel || "-"}
                              </div>
                              <div>
                                <strong>{t.videoPublishedAt}:</strong>{" "}
                                {formatDate(post.videoPublishedAt)}
                              </div>
                            </>
                          )}

                          <div>
                            <strong>{t.readTime}:</strong> {post.readTime || 0}
                          </div>
                        </div>

                        {subtitle && <p style={{ marginTop: "12px", opacity: 0.9 }}>{subtitle}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}