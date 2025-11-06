"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Loader2, Save, ImagePlus, X, Eye, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function CreatePostPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState("draft");
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 🟢 Lấy danh sách danh mục khi vào trang
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data.data || res.data.categories || []);
      } catch (err) {
        toast.error("Không thể tải danh mục");
      }
    };
    fetchCategories();
  }, []);

  // 🧩 Tự động tạo slug từ title
  useEffect(() => {
    if (!title) return;
    const newSlug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlug(newSlug);
  }, [title]);

  // 🖼️ Xử lý thumbnail
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("File phải là định dạng ảnh");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ảnh không được vượt quá 5MB");
        return;
      }

      setThumbnail(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setThumbnail(null);
      setThumbnailPreview("");
    }
  };

  // 🖼️ Xử lý thêm nhiều ảnh minh họa
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Kiểm tra số lượng ảnh (tối đa 10 ảnh)
    if (images.length + files.length > 10) {
      toast.error("Tối đa 10 ảnh minh họa được phép");
      return;
    }

    // Kiểm tra định dạng và kích thước
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        invalidFiles.push(`${file.name} - Không phải định dạng ảnh`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name} - Vượt quá 5MB`);
        return;
      }

      if (images.some((img) => img.name === file.name)) {
        invalidFiles.push(`${file.name} - Đã tồn tại`);
        return;
      }

      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      toast.error(
        `Có ${invalidFiles.length} ảnh không hợp lệ:\n${invalidFiles.join(
          "\n"
        )}`
      );
    }

    if (validFiles.length > 0) {
      setImages((prev) => [...prev, ...validFiles]);

      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });

      toast.success(`Đã thêm ${validFiles.length} ảnh minh họa`);
    }

    e.target.value = "";
  };

  // 🖼️ Xóa thumbnail
  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview("");
    const fileInput = document.getElementById(
      "thumbnail-input"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // 🖼️ Xóa ảnh minh họa
  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  // 🏷️ Thêm tag mới
  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();

      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput("");
      }
    }
  };

  // 🏷️ Xóa tag
  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  // 🏷️ Xử lý paste nhiều tags cùng lúc
  const handleTagPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const newTags = pastedText
      .split(/[,;\n]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag && !tags.includes(tag));

    if (newTags.length > 0) {
      setTags([...tags, ...newTags]);
      setTagInput("");
    }
  };

  // 📝 Gửi form tạo bài viết
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("excerpt", excerpt);
      formData.append("content", content);
      formData.append("category_id", categoryId);
      formData.append("tags", tags.join(","));
      formData.append("status", status);

      // Thêm thumbnail (ảnh đầu tiên hoặc ảnh riêng)
      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      // Thêm ảnh minh họa
      images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      const token = localStorage.getItem("token");

      const res = await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("✅ Bài viết đã được tạo thành công!");
      router.push("/admin/posts");
    } catch (error: any) {
      console.error("❌ API Error:", error.response?.data || error.message);

      if (error.response?.status === 422) {
        const messages = Object.values(error.response.data.errors || {})
          .flat()
          .join("\n");
        toast.error(messages || "Lỗi xác thực dữ liệu!");
      } else {
        toast.error(error.response?.data?.message || "Không thể tạo bài viết");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
        </button>
      </div>

      <h1 className="text-2xl font-semibold mb-4">📝 Thêm bài viết mới</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tiêu đề */}
        <div>
          <label className="font-medium">Tiêu đề</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring focus:ring-blue-200"
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label className="font-medium">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 mt-1"
          />
        </div>

        {/* Mô tả ngắn */}
        <div>
          <label className="font-medium">Mô tả ngắn</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 h-24 mt-1"
          />
        </div>

        {/* Nội dung */}
        <div>
          <label className="font-medium">Nội dung</label>
          <div className="border rounded-lg mt-1 p-2 bg-white">
            <CKEditor
              editor={ClassicEditor}
              data={content}
              // @ts-ignore
              onChange={(event, editor) => setContent(editor.getData())}
              config={{
                placeholder: "Nhập nội dung bài viết ở đây...",
                toolbar: [
                  "heading",
                  "|",
                  "bold",
                  "italic",
                  "link",
                  "bulletedList",
                  "numberedList",
                  "blockQuote",
                  "|",
                  "insertTable",
                  "undo",
                  "redo",
                  "imageUpload",
                ],
                ckfinder: {
                  uploadUrl: "http://127.0.0.1:8000/api/upload", // route Laravel
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Danh mục */}
        <div>
          <label className="font-medium">Danh mục</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 mt-1"
            required
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ảnh đại diện chính */}
        <div>
          <label className="font-medium flex items-center gap-2">
            <ImagePlus className="w-4 h-4" /> Ảnh đại diện chính
          </label>
          <input
            id="thumbnail-input"
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="w-full border rounded-lg px-4 py-2 mt-1"
          />

          {thumbnailPreview ? (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">
                Preview ảnh đại diện:
              </p>
              <div className="flex flex-wrap gap-4 items-start">
                <div className="relative">
                  <img
                    src={thumbnailPreview}
                    alt="Preview thumbnail"
                    className="w-40 h-40 object-cover rounded-lg border-2 border-blue-200 cursor-pointer shadow-md"
                    onClick={() => setPreviewImage(thumbnailPreview)}
                  />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    title="Xóa ảnh"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800">
                      📝 Thông tin ảnh đại diện:
                    </p>
                    <div className="text-xs text-blue-700 mt-1 space-y-1">
                      <p>• Tên: {thumbnail?.name}</p>
                      <p>
                        • Kích thước:{" "}
                        {thumbnail?.size &&
                          (thumbnail.size / 1024 / 1024).toFixed(2)}{" "}
                        MB
                      </p>
                      <p>• Định dạng: {thumbnail?.type}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewImage(thumbnailPreview)}
                    className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="w-4 h-4" />
                    Xem ảnh lớn
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-gray-500">
              🖼️ Chưa có ảnh đại diện. Ảnh này sẽ hiển thị làm ảnh chính của bài
              viết.
            </div>
          )}
        </div>

        {/* Ảnh minh họa */}
        <div>
          <label className="font-medium flex items-center gap-2">
            <ImagePlus className="w-4 h-4" /> Ảnh minh họa (Tối đa 10 ảnh)
          </label>
          <input
            id="images-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
            className="w-full border rounded-lg px-4 py-2 mt-1"
          />

          {images.length > 0 && (
            <div className="mt-2 text-sm text-blue-600 font-medium">
              📸 Đã chọn {images.length}/10 ảnh minh họa
            </div>
          )}

          {imagePreviews.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-3">
                Preview ảnh minh họa:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative group bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700 bg-green-100 px-2 py-1 rounded">
                        Ảnh {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Xóa ảnh"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-green-200 cursor-pointer shadow-sm"
                      onClick={() => setPreviewImage(preview)}
                    />

                    <div className="mt-2 text-xs text-gray-600 space-y-1">
                      <p className="truncate" title={images[index]?.name}>
                        📄 {images[index]?.name}
                      </p>
                      <p>
                        💾{" "}
                        {images[index]?.size &&
                          (images[index].size / 1024 / 1024).toFixed(2)}{" "}
                        MB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewImage(preview)}
                      className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 py-1 rounded transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      Xem ảnh lớn
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {images.length === 0 && (
            <div className="mt-3 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              🖼️ Chưa có ảnh minh họa nào.
              <br />
              <span className="text-xs">
                Các ảnh này sẽ hiển thị trong gallery của bài viết
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="font-medium">Thẻ (Tags)</label>

          <div className="flex flex-wrap gap-2 mb-2 mt-1">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm border border-blue-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="hover:text-red-600 focus:outline-none transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <input
            type="text"
            placeholder="Nhập tag và nhấn Enter hoặc dấu phẩy..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            onPaste={handleTagPaste}
            className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />

          <p className="text-xs text-gray-500 mt-1">
            💡 Nhấn Enter, dấu phẩy hoặc paste nhiều tags (cách nhau bằng dấu
            phẩy)
          </p>
        </div>

        {/* Trạng thái */}
        <div>
          <label className="font-medium">Trạng thái</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          >
            <option value="draft">Bản nháp</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Công khai</option>
          </select>
        </div>

        {/* Nút lưu */}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Đang lưu..." : "Đăng bài"}
        </button>
      </form>

      {/* Modal xem ảnh lớn */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={previewImage}
              alt="Preview lớn"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-200 transition-colors shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
