"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Loader2,
  Calendar,
  User,
  Tag,
  MessageCircle,
  ArrowLeft,
  ThumbsUp,
  Eye,
  Share,
} from "lucide-react";

/* ------------------------------------------------------------
 * 🔧 Helpers
 * ------------------------------------------------------------ */
const defaultAvatar = "/avt/image.png";
const getImageUrl = (path?: string) => {
  if (!path) return defaultAvatar;
  if (path.startsWith("http")) return path;
  return `${
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  }/storage/${path}`;
};

const getAvatarForUser = (user?: any) => {
  if (!user) return defaultAvatar;

  if (user.profile) {
    if (user.profile.avatar_url) return getImageUrl(user.profile.avatar_url);
    if (user.profile.avatar_path) return getImageUrl(user.profile.avatar_path);
  }

  const rootKeys = [
    "avatar_url",
    "avatar",
    "image",
    "profile_picture",
    "avatar_path",
  ];
  for (const k of rootKeys) {
    if (user[k]) return getImageUrl(user[k]);
  }

  return defaultAvatar;
};

/* ------------------------------------------------------------
 * 💬 Component: CommentItem
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
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300">
      <div className="flex gap-4">
        <img
          src={getAvatarForUser(comment.user)}
          alt={comment.user?.name || "Người dùng"}
          className="w-12 h-12 rounded-full object-cover cursor-pointer border-2 border-gray-100 hover:border-blue-200 transition-colors"
          onClick={() => handleProfileClick(comment.user)}
          onError={(e) => ((e.target as HTMLImageElement).src = defaultAvatar)}
        />

        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div>
                <span
                  className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                  onClick={() => handleProfileClick(comment.user)}
                >
                  {comment.user?.name || comment.user?.username || "Ẩn danh"}
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(comment.created_at).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed mb-4">
            {comment.content}
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onReplyClick(comment.id)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Trả lời
            </button>
            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors">
              <ThumbsUp className="w-4 h-4" />
              Thích
            </button>
          </div>

          {replyTo === comment.id && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex gap-3">
                <div className="flex-1">
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Viết phản hồi của bạn..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      // onClick={() => setReplyTo(null)}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => handleReply(comment.id)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Gửi phản hồi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {comment.replies?.length > 0 && (
            <div className="mt-6 space-y-4 pl-6 border-l-2 border-blue-100">
              {comment.replies.map((rep: any) => (
                <div key={rep.id} className="flex gap-3">
                  <img
                    src={getAvatarForUser(rep.user)}
                    alt={rep.user?.name || "Người dùng"}
                    className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-gray-100 hover:border-blue-200 transition-colors"
                    onClick={() => handleProfileClick(rep.user)}
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src = defaultAvatar)
                    }
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer text-sm"
                        onClick={() => handleProfileClick(rep.user)}
                      >
                        {rep.user?.name || rep.user?.username || "Ẩn danh"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(rep.created_at).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{rep.content}</p>
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
 * 📖 Component: ExpandableContent
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

      {showToggle && (
        <div
          className={`text-center mt-8 ${
            !showFull
              ? "absolute bottom-0 left-0 right-0 pt-20 bg-gradient-to-t from-white to-transparent"
              : ""
          }`}
        >
          <button
            onClick={() => setShowFull(!showFull)}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              showFull
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
            }`}
          >
            {showFull ? "📖 Thu gọn" : "📖 Đọc thêm"}
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
      api.get(`/posts?sort=views&limit=4`),
      api.get(`/posts?sort=created_at&limit=4`),
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
      const res = await api.post(`/posts/${id}/comments`, {
        content: commentText,
      });
      setComments((prev) => [res.data, ...prev]);
      setCommentText("");
    } catch {
      alert("Gửi bình luận thất bại");
    }
  };

  const handleReply = async (commentId: number) => {
    if (!replyText.trim()) return;
    try {
      const res = await api.post(`/comments/${commentId}/reply`, {
        content: replyText,
      });
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, replies: [...(c.replies || []), res.data] }
            : c
        )
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
      <div className="flex flex-col items-center justify-center h-[80vh] text-gray-500">
        <Loader2 className="animate-spin w-12 h-12 text-blue-500 mb-4" />
        <p className="text-lg">Đang tải bài viết...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <div className="text-red-500 text-center mb-6">
          <p className="text-xl font-semibold mb-2">😔 Có lỗi xảy ra</p>
          <p>{error}</p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại trang chủ
        </button>
      </div>
    );

  if (!post)
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-gray-500">
        <p className="text-xl mb-4">📭 Không tìm thấy bài viết</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Khám phá bài viết khác
        </button>
      </div>
    );

  /* ---------------- Render main ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* MAIN COLUMN */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            {post.thumbnail && (
              <div className="relative">
                <img
                  src={getImageUrl(post.thumbnail)}
                  alt={post.title}
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <button
                  onClick={() => router.back()}
                  className="absolute top-6 left-6 bg-white/90 hover:bg-white text-gray-700 rounded-full px-4 py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại
                </button>
              </div>
            )}

            <div className="p-8">
              {/* Tiêu đề và metadata */}
              <div className="mb-8">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">
                      {new Date(post.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-300 hover:shadow-md"
                    onClick={() =>
                      router.push(
                        `/profile/${post.user?.username || post.user?.id}`
                      )
                    }
                  >
                    <img
                      src={getAvatarForUser(post.user)}
                      alt={post.user?.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                      onError={(e) =>
                        ((e.target as HTMLImageElement).src = defaultAvatar)
                      }
                    />
                    <div>
                      <span className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                        {post.user?.name || post.user?.username || "Không rõ"}
                      </span>
                    </div>
                  </div>

                  {post.category?.name && (
                    <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        {post.category.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Nội dung bài viết */}
              <div className="mb-10">
                <ExpandableContent html={post.content} />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between py-6 border-t border-b border-gray-200">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                    <ThumbsUp className="w-5 h-5" />
                    <span>Thích</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <Share className="w-5 h-5" />
                    <span>Chia sẻ</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>1.2K lượt xem</span>
                </div>
              </div>

              {/* BÌNH LUẬN */}
              <div className="mt-12">
                <div className="flex items-center gap-3 mb-8">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Bình luận ({comments.length})
                  </h2>
                </div>

                {/* Form bình luận */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
                  <div className="flex gap-4">
                    <img
                      src={getAvatarForUser(currentUser)}
                      alt="Bạn"
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      onError={(e) =>
                        ((e.target as HTMLImageElement).src = defaultAvatar)
                      }
                    />
                    <div className="flex-1">
                      <textarea
                        className="w-full border border-gray-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-300"
                        placeholder="Chia sẻ suy nghĩ của bạn về bài viết này..."
                        rows={4}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      />
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xs text-gray-500">
                          {commentText.length}/1000 ký tự
                        </span>
                        <button
                          onClick={handleSubmitComment}
                          disabled={!commentText.trim()}
                          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Đăng bình luận
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Danh sách bình luận */}
                <div className="space-y-6">
                  {comments.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        Chưa có bình luận nào.
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Hãy là người đầu tiên bình luận!
                      </p>
                    </div>
                  ) : (
                    comments.map((c) => (
                      <CommentItem
                        key={c.id}
                        comment={c}
                        onReplyClick={(id) =>
                          setReplyTo((prev) => (prev === id ? null : id))
                        }
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
        </div>

        {/* SIDEBAR */}
        <div className="space-y-8">
          {/* Bài viết nổi bật */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <ThumbsUp className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-gray-900">
                Bài viết nổi bật
              </h2>
            </div>
            <div className="space-y-4">
              {relatedPosts.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/home/${item.id}`)}
                  className="flex gap-3 items-start cursor-pointer group hover:bg-gray-50 p-3 rounded-xl transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(item.created_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bài viết mới nhất */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">Mới cập nhật</h2>
            </div>
            <div className="space-y-4">
              {latestPosts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/home/${item.id}`)}
                  className="cursor-pointer group border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                >
                  <p className="font-medium text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight mb-2">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(item.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories & Tags */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Phân loại</h2>

            {/* Category */}
            {post.category && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Danh mục
                </h3>
                <span className="px-3 py-2 bg-green-50 text-green-800 text-sm rounded-lg border border-green-200 font-medium">
                  {post.category.name}
                </span>
              </div>
            )}

            {/* Tags */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags?.length > 0 ? (
                  post.tags.map((tag: any) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-sm rounded-full hover:from-blue-100 hover:to-blue-200 cursor-pointer transition-all duration-300 border border-blue-200 hover:border-blue-300 hover:scale-105"
                    >
                      #{tag.name}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Chưa có tags</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
