"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

/* ------------------------------------------------------------
 * 🔧 Helpers
 * ------------------------------------------------------------ */
const defaultAvatar = "/avt/image.png";
const getImageUrl = (path?: string) => {
  if (!path) return defaultAvatar;
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/storage/${path}`;
};
const getAvatarForUser = (user?: any) => {
  if (!user) return defaultAvatar;
  const keys = ["avatar_url", "avatar", "image", "profile_picture"];
  for (const k of keys) if (user[k]) return getImageUrl(user[k]);
  return defaultAvatar;
};

/* ------------------------------------------------------------
 * 💬 Component: CommentItem (hiển thị 1 bình luận + replies)
 * ------------------------------------------------------------ */
const CommentItem = ({
  comment,
  onReplyClick,
  replyTo,
  replyText,
  setReplyText,
  handleReply,
}: {
  comment: any;
  onReplyClick: (id: number) => void;
  replyTo: number | null;
  replyText: string;
  setReplyText: (t: string) => void;
  handleReply: (id: number) => void;
}) => {
  const router = useRouter();

  const handleProfileClick = (user: any) => {
    if (!user) return;
    if (user.username) router.push(`/profile/${user.username}`);
    else if (user.id) router.push(`/profile/${user.id}`);
  };

  return (
    <div className="bg-gray-50 border rounded-lg p-4">
      {/* Avatar + Info */}
      <div className="flex gap-3">
        <img
          src={getAvatarForUser(comment.user)}
          alt={comment.user?.name || "Người dùng"}
          className="w-10 h-10 rounded-full object-cover cursor-pointer border"
          onClick={() => handleProfileClick(comment.user)}
          onError={(e) => ((e.target as HTMLImageElement).src = defaultAvatar)}
        />

        <div className="flex-1">
          {/* Tên + thời gian */}
          <div className="flex items-center justify-between">
            <div>
              <span
                className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer"
                onClick={() => handleProfileClick(comment.user)}
              >
                {comment.user?.name || comment.user?.username || "Ẩn danh"}
              </span>
              <span className="ml-2 text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>

          {/* Nội dung bình luận */}
          <p className="mt-2 text-gray-800 whitespace-pre-wrap">{comment.content}</p>

          {/* Nút trả lời */}
          <div className="mt-2">
            <button
              onClick={() => onReplyClick(comment.id)}
              className="text-xs text-blue-500 hover:underline"
            >
              Trả lời
            </button>
          </div>

          {/* Ô nhập phản hồi */}
          {replyTo === comment.id && (
            <div className="mt-3 flex gap-2">
              <textarea
                className="border rounded-md p-2 w-full text-sm"
                rows={2}
                placeholder="Viết phản hồi..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button
                onClick={() => handleReply(comment.id)}
                className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                Gửi
              </button>
            </div>
          )}

          {/* Replies */}
          {comment.replies?.length > 0 && (
            <div className="mt-4 space-y-3 pl-6 border-l-2 border-gray-200">
              {comment.replies.map((rep: any) => (
                <div key={rep.id} className="flex gap-3">
                  <img
                    src={getAvatarForUser(rep.user)}
                    alt={rep.user?.name || "Người dùng"}
                    className="w-8 h-8 rounded-full object-cover cursor-pointer border"
                    onClick={() => handleProfileClick(rep.user)}
                    onError={(e) => ((e.target as HTMLImageElement).src = defaultAvatar)}
                  />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      <span
                        className="hover:text-blue-600 cursor-pointer"
                        onClick={() => handleProfileClick(rep.user)}
                      >
                        {rep.user?.name || rep.user?.username || "Ẩn danh"}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {new Date(rep.created_at).toLocaleString("vi-VN")}
                      </span>
                    </p>
                    <p className="text-gray-700 text-sm mt-1">{rep.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------
 * 📖 Component: ExpandableContent ("Xem thêm / Thu gọn")
 * ------------------------------------------------------------ */
const ExpandableContent = ({ html }: { html: string }) => {
  const [showFull, setShowFull] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current) setShowToggle(ref.current.scrollHeight > 600);
  }, [html]);

  return (
    <div className="relative">
      <div
        ref={ref}
        className={`prose prose-lg max-w-none text-gray-800 leading-relaxed overflow-hidden transition-all duration-500 ${
          showFull ? "max-h-none" : "max-h-[600px]"
        }`}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Nút "Xem thêm / Thu gọn" */}
      {showToggle && (
        <div className={`text-center mt-6 ${!showFull ? "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white" : ""}`}>
          <button
            onClick={() => setShowFull(!showFull)}
            className={`px-5 py-2 rounded-full shadow-sm transition ${
              showFull
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {showFull ? "Thu gọn" : "Xem thêm"}
          </button>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------
 * 📰 Main Component: PostDetailPage
 * ------------------------------------------------------------ */
export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [post, setPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  /* ---------------- Fetch data ---------------- */
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      api.get(`/posts/${id}`),
      api.get(`/posts?sort=views&limit=5`),
      api.get(`/posts?sort=created_at&limit=5`),
      api.get(`/posts/${id}/comments`),
      api.get("/user").catch(() => null),
    ])
      .then(([resPost, resHot, resNew, resComments, resUser]) => {
        setPost(resPost.data.post || resPost.data);
        setRelatedPosts(resHot.data?.data || resHot.data?.posts || []);
        setLatestPosts(resNew.data?.data || resNew.data?.posts || []);
        setComments(resComments.data || []);
        if (resUser?.data) setCurrentUser(resUser.data);
      })
      .catch(() => setError("Không thể tải bài viết này."))
      .finally(() => setLoading(false));
  }, [id]);

  /* ---------------- Comment handlers ---------------- */
  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/posts/${id}/comments`, { content: commentText });
      setComments((prev) => [res.data, ...prev]);
      setCommentText("");
    } catch {
      alert("Gửi bình luận thất bại");
    }
  };

  const handleReply = async (commentId: number) => {
    if (!replyText.trim()) return;
    try {
      const res = await api.post(`/comments/${commentId}/reply`, { content: replyText });
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, replies: [...(c.replies || []), res.data] } : c))
      );
      setReplyText("");
      setReplyTo(null);
    } catch {
      alert("Gửi phản hồi thất bại");
    }
  };

  /* ---------------- Render states ---------------- */
  if (loading)
    return (
      <div className="flex items-center justify-center h-[80vh] text-gray-500">
        <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
        <span className="ml-3">Đang tải...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => router.push("/")} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Quay lại trang chủ
        </button>
      </div>
    );

  if (!post)
    return (
      <div className="flex items-center justify-center h-[80vh] text-gray-500">
        Không tìm thấy bài viết.
      </div>
    );

  /* ---------------- Render main ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN COLUMN */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
          {post.thumbnail && (
            <div className="relative">
              <img src={getImageUrl(post.thumbnail)} alt={post.title} className="w-full h-[400px] object-cover" />
              <button
                onClick={() => router.back()}
                className="absolute top-4 left-4 bg-white/80 hover:bg-white text-gray-700 rounded-full px-3 py-1 text-sm shadow"
              >
                ← Quay lại
              </button>
            </div>
          )}

          <div className="p-8">
            {/* Tiêu đề + thông tin */}
            <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">{post.title}</h1>

            <div className="text-gray-500 mb-6 flex items-center gap-4 text-sm">
              <span>📅 {new Date(post.created_at).toLocaleDateString("vi-VN")}</span>

              <span
                className="cursor-pointer hover:text-blue-600 flex items-center gap-2"
                onClick={() => router.push(`/profile/${post.user?.username || post.user?.id}`)}
              >
                <img
                  src={getAvatarForUser(post.user)}
                  alt={post.user?.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span>{post.user?.name || post.user?.username || "Không rõ"}</span>
              </span>

              <span>🏷️ {post.category?.name || "Chưa có danh mục"}</span>
            </div>

            {/* Nội dung bài viết */}
            <ExpandableContent html={post.content} />

            {/* BÌNH LUẬN */}
            <div className="mt-10 border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">💬 Bình luận</h2>

              {/* Form bình luận */}
              <div className="flex gap-3 mb-6">
                <img
                  src={getAvatarForUser(currentUser)}
                  alt="Bạn"
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div className="flex-1">
                  <textarea
                    className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Viết bình luận của bạn..."
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleSubmitComment}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      Gửi bình luận
                    </button>
                  </div>
                </div>
              </div>

              {/* Danh sách bình luận */}
              <div className="space-y-5">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-sm">Chưa có bình luận nào.</p>
                ) : (
                  comments.map((c) => (
                    <CommentItem
                      key={c.id}
                      comment={c}
                      onReplyClick={(id) => setReplyTo((prev) => (prev === id ? null : id))}
                      replyTo={replyTo}
                      replyText={replyText}
                      setReplyText={setReplyText}
                      handleReply={handleReply}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-8">
          {/* Bài viết nổi bật */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">📢 Bài viết nổi bật</h2>
            <div className="space-y-4">
              {relatedPosts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/home/${item.id}`)}
                  className="flex gap-3 items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                >
                  <img src={getImageUrl(item.thumbnail)} alt={item.title} className="w-16 h-16 object-cover rounded-md" />
                  <div>
                    <p className="font-medium text-gray-800 line-clamp-2">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bài viết mới nhất */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">📰 Bài viết mới nhất</h2>
            <div className="space-y-3">
              {latestPosts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/home/${item.id}`)}
                  className="cursor-pointer border-b pb-2 hover:text-blue-600 transition"
                >
                  <p className="text-sm font-medium line-clamp-2">{item.title}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
