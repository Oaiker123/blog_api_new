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
  Heart,
  Image,
  Smile,
  Send,
  X,
  Paperclip,
} from "lucide-react";

// ✅ THÊM INTERFACE
interface User {
  id: number;
  name?: string;
  username?: string;
  email?: string;
  profile?: {
    avatar_url?: string;
    avatar_path?: string;
  };
  avatar_url?: string;
  avatar?: string;
  image?: string;
  profile_picture?: string;
  avatar_path?: string;
}

interface Media {
  id: number;
  url: string;
  type: string;
  name?: string;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: User;
  media?: Media[];
  replies?: Comment[];
}

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  status: string;
  created_at: string;
  user?: User;
  category?: Category;
  tags?: Tag[];
  media?: Media[];
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
}

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

const getAvatarForUser = (user?: User) => {
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
    if (user[k as keyof User]) return getImageUrl(user[k as keyof User] as string);
  }

  return defaultAvatar;
};

/* ------------------------------------------------------------
 * 😊 Component: EmojiPicker
 * ------------------------------------------------------------ */
const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const popularEmojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣",
    "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰",
    "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜",
    "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏",
    "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
    "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠",
    "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨",
    "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥",
    "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧",
    "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐",
    "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑",
    "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻",
    "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸",
    "😹", "😻", "😼", "😽", "🙀", "😿", "😾"
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
        title="Thêm biểu tượng cảm xúc"
      >
        <Smile className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-64 max-h-60 overflow-y-auto">
          <div className="p-3">
            <div className="grid grid-cols-8 gap-1">
              {popularEmojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onSelect(emoji);
                    setIsOpen(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------
 * 💬 Component: CommentForm - FORM BÌNH LUẬN ĐẦY ĐỦ
 * ------------------------------------------------------------ */
const CommentForm = ({ 
  onSubmit, 
  submitting, 
  currentUser,
  placeholder = "Viết bình luận...",
  autoFocus = false,
  onCancel,
  showCancel = false
}: { 
  onSubmit: (content: string, images?: File[]) => void;
  submitting: boolean;
  currentUser: User | null;
  placeholder?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
  showCancel?: boolean;
}) => {
  const [commentText, setCommentText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tự động điều chỉnh chiều cao textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [commentText]);

  // Xử lý chọn ảnh
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files).slice(0, 4 - selectedImages.length);
    const newImagePreviews: string[] = [];

    newImages.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newImagePreviews.push(e.target?.result as string);
        if (newImagePreviews.length === newImages.length) {
          setImagePreviews(prev => [...prev, ...newImagePreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedImages(prev => [...prev, ...newImages]);
  };

  // Xóa ảnh đã chọn
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Thêm emoji vào text
  const handleEmojiSelect = (emoji: string) => {
    setCommentText(prev => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSubmit = () => {
    if ((commentText.trim() || selectedImages.length > 0) && !submitting) {
      onSubmit(commentText.trim(), selectedImages);
      setCommentText("");
      setSelectedImages([]);
      setImagePreviews([]);
      setIsFocused(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const resetForm = () => {
    setCommentText("");
    setSelectedImages([]);
    setImagePreviews([]);
    setIsFocused(false);
    if (onCancel) onCancel();
  };

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-300 ${
      isFocused ? "border-blue-500 shadow-lg" : "border-gray-200 hover:border-gray-300"
    }`}>
      <div className="p-4">
        {/* Header với avatar và info */}
        <div className="flex items-center gap-3 mb-3">
          <img
            src={getAvatarForUser(currentUser || undefined)}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
            onError={(e) => ((e.target as HTMLImageElement).src = defaultAvatar)}
          />
          <div>
            <span className="font-semibold text-gray-900 text-sm">
              {currentUser?.name || "Người dùng"}
            </span>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Đang bình luận</span>
            </div>
          </div>
        </div>

        {/* Textarea linh hoạt */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            className="w-full border-0 resize-none focus:ring-0 focus:outline-none text-gray-800 placeholder-gray-500 text-sm min-h-[60px] max-h-[120px]"
            placeholder={placeholder}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => !commentText && !selectedImages.length && setIsFocused(false)}
            onKeyDown={handleKeyPress}
            disabled={submitting}
            rows={1}
            autoFocus={autoFocus}
          />
          
          {/* Character counter */}
          {commentText.length > 0 && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {commentText.length}/1000
            </div>
          )}
        </div>

        {/* Preview images */}
        {imagePreviews.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons - chỉ hiện khi có focus hoặc có text/ảnh */}
        {(isFocused || commentText.length > 0 || selectedImages.length > 0) && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {/* Emoji picker */}
              <EmojiPicker onSelect={handleEmojiSelect} />

              {/* Image upload button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedImages.length >= 4}
                  className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Thêm ảnh (tối đa 4 ảnh)"
                >
                  <Image className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                {selectedImages.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                    {selectedImages.length}
                  </span>
                )}
              </div>

              {/* File attachment button */}
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                title="Đính kèm file"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Cancel button */}
              {showCancel && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
              )}
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={(!commentText.trim() && selectedImages.length === 0) || submitting}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Gửi</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------
 * 💬 Component: CommentItem - ĐÃ CẬP NHẬT VỚI ẢNH
 * ------------------------------------------------------------ */
const CommentItem = ({
  comment,
  currentUser,
}: {
  comment: Comment;
  currentUser: User | null;
}) => {
  const router = useRouter();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  const handleProfileClick = (user: User) => {
    if (!user) return;
    if (user.username) router.push(`/profile/${user.username}`);
    else if (user.id) router.push(`/profile/${user.id}`);
  };

  const handleReplySubmit = async (content: string, images?: File[]) => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để phản hồi!");
      return;
    }

    setSubmittingReply(true);
    try {
      let formData = new FormData();
      formData.append('content', content);
      
      if (images && images.length > 0) {
        images.forEach(image => {
          formData.append('images[]', image);
        });
      }

      const res = await api.post(`/comments/${comment.id}/reply`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Reply posted:', res.data);
      setShowReplyForm(false);
      
      // Reload comments để cập nhật UI
      window.location.reload();
    } catch (error: unknown) {
      console.error('❌ Reply error:', error);
      const err = error as ApiError;
      alert(err.response?.data?.message || "Gửi phản hồi thất bại");
    } finally {
      setSubmittingReply(false);
    }
  };

  // Hiển thị ảnh trong comment
  const renderCommentImages = (comment: Comment) => {
    const images = comment.media || [];
    
    if (images.length === 0) return null;

    return (
      <div className={`mt-3 grid gap-2 ${
        images.length === 1 ? 'grid-cols-1' : 
        images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'
      }`}>
        {images.map((image: Media, index: number) => (
          <div key={index} className="relative">
            <img
              src={getImageUrl(image.url)}
              alt={`Comment image ${index + 1}`}
              className="w-70 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(getImageUrl(image.url), '_blank')}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300">
      <div className="flex gap-4">
        {/* Avatar */}
        <img
          src={getAvatarForUser(comment.user)}
          alt={comment.user?.name || "Người dùng"}
          className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-gray-100 hover:border-blue-200 transition-colors flex-shrink-0"
          onClick={() => handleProfileClick(comment.user)}
          onError={(e) => ((e.target as HTMLImageElement).src = defaultAvatar)}
        />

        <div className="flex-1 min-w-0">
          {/* Comment header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors text-sm"
                onClick={() => handleProfileClick(comment.user)}
              >
                {comment.user?.name || comment.user?.username || "Ẩn danh"}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>

          {/* Comment content */}
          <p className="text-gray-800 leading-relaxed mb-3 text-sm whitespace-pre-wrap">
            {comment.content}
          </p>

          {/* Comment images */}
          {renderCommentImages(comment)}

          {/* Comment actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <MessageCircle className="w-3 h-3" />
              Phản hồi
            </button>
            
            <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-600 transition-colors font-medium">
              <ThumbsUp className="w-3 h-3" />
              Thích
            </button>
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-4">
              <CommentForm
                onSubmit={handleReplySubmit}
                submitting={submittingReply}
                currentUser={currentUser}
                placeholder={`Phản hồi ${comment.user?.name || "người dùng"}...`}
                autoFocus={true}
                onCancel={() => setShowReplyForm(false)}
                showCancel={true}
              />
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-3 pl-4 border-l-2 border-blue-100">
              {comment.replies.map((rep: Comment) => (
                <div key={rep.id} className="flex gap-3 pt-3 first:pt-0">
                  <img
                    src={getAvatarForUser(rep.user)}
                    alt={rep.user?.name || "Người dùng"}
                    className="w-8 h-8 rounded-full object-cover cursor-pointer border-2 border-gray-100 hover:border-blue-200 transition-colors flex-shrink-0"
                    onClick={() => handleProfileClick(rep.user)}
                    onError={(e) => ((e.target as HTMLImageElement).src = defaultAvatar)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer text-sm"
                        onClick={() => handleProfileClick(rep.user)}
                      >
                        {rep.user?.name || rep.user?.username || "Ẩn danh"}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        {new Date(rep.created_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{rep.content}</p>
                    
                    {/* Reply images */}
                    {rep.media && rep.media.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {rep.media.map((image: Media, index: number) => (
                          <img
                            key={index}
                            src={getImageUrl(image.url)}
                            alt={`Reply image ${index + 1}`}
                            className="w-full h-20 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(getImageUrl(image.url), '_blank')}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Reply actions */}
                    <div className="flex items-center gap-3 mt-2">
                      <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                        Thích
                      </button>
                      <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                        Phản hồi
                      </button>
                    </div>
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

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // 🔥 STATE CHO LIKE
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // 🔥 STATE CHO VIEWS
  const [viewsCount, setViewsCount] = useState(0);
  const [isTrackingView, setIsTrackingView] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  /* ---------------- Track View ---------------- */
  const trackView = async () => {
    if (isTrackingView) {
      console.log('⏩ View tracking already in progress');
      return;
    }
    
    setIsTrackingView(true);
    console.log('👀 Starting view tracking for post:', id);
    
    try {
      const response = await api.post(`/posts/${id}/view`);
      console.log('✅ View tracked successfully:', response.data);
      setViewsCount(response.data.views_count);
    } catch (error: unknown) {
      console.error('❌ View tracking error:', error);
      const err = error as ApiError;
      if (err.response?.data) {
        console.error('Error details:', err.response.data);
      }
    } finally {
      setIsTrackingView(false);
    }
  };

  /* ---------------- Fetch Views Count ---------------- */
  const fetchViewsCount = async () => {
    try {
      const response = await api.get(`/posts/${id}/views`);
      console.log('📊 Views count:', response.data);
      setViewsCount(response.data.views_count);
    } catch (error) {
      console.error('❌ Failed to fetch views count:', error);
    }
  };

  /* ---------------- Fetch data ---------------- */
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const fetchData = async () => {
      try {
        console.log('🔄 Fetching post data...', id);
        
        // Fetch basic data first
        const [resPost, resComments, resUser, likeStatus] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get(`/posts/${id}/comments`),
          api.get("/user").catch(() => null),
          api.get(`/posts/${id}/like/status`).catch(() => ({ 
            data: { liked: false, likes_count: 0 } 
          }))
        ]);

        console.log('📝 Post data:', resPost.data);
        console.log('💬 Comments data:', resComments.data);
        console.log('❤️ Like status:', likeStatus.data);
        
        setPost(resPost.data.post || resPost.data);
        setComments(resComments.data || []);
        
        // 🔥 SET LIKE STATUS
        setIsLiked(likeStatus.data.liked);
        setLikesCount(likeStatus.data.likes_count);
        
        if (resUser?.data) {
          setCurrentUser(resUser.data);
          console.log('👤 Current user:', resUser.data);
        }

        // Fetch views count
        await fetchViewsCount();

        // Track view
        await trackView();

        // Fetch related posts
        try {
          const [resHot, resNew] = await Promise.all([
            api.get(`/posts?sort=views&limit=4`).catch(() => ({ data: [] })),
            api.get(`/posts?sort=created_at&limit=4`).catch(() => ({ data: [] }))
          ]);
          
          setRelatedPosts(resHot.data?.data || resHot.data?.posts || []);
          setLatestPosts(resNew.data?.data || resNew.data?.posts || []);
        } catch (secondaryError) {
          console.log('⚠️ Could not load related posts');
        }

      } catch (error: unknown) {
        console.error('❌ Error fetching post:', error);
        const err = error as ApiError;
        setError(err.response?.data?.message || "Không thể tải bài viết này.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /* ---------------- LIKE HANDLER ---------------- */
  const handleLike = async () => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để thích bài viết!");
      router.push('/auth/login');
      return;
    }

    if (isLiking) return;

    console.log('❤️ Handling like for post:', id);
    console.log('👤 Current user:', currentUser.id);
    console.log('📊 Current like status:', { isLiked, likesCount });

    setIsLiking(true);
    
    // Optimistic update
    const previousLiked = isLiked;
    const previousCount = likesCount;
    
    setIsLiked(!previousLiked);
    setLikesCount(previousLiked ? previousCount - 1 : previousCount + 1);

    try {
      const response = await api.post(`/posts/${id}/like`);
      const { liked, likes_count, message } = response.data;
      
      console.log('✅ Like response:', response.data);
      
      // Update with actual server state
      setIsLiked(liked);
      setLikesCount(likes_count);
      
    } catch (error: unknown) {
      console.error('❌ Like error:', error);
      const err = error as ApiError;
      
      // Revert optimistic update on error
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Có lỗi xảy ra khi thích bài viết!");
      }
    } finally {
      setIsLiking(false);
    }
  };

  /* ---------------- Comment handlers với ảnh - ĐÃ SỬA ---------------- */
  const handleSubmitComment = async (content: string, images?: File[]) => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để bình luận!");
      router.push('/auth/login');
      return;
    }

    console.log('🔄 Submitting comment:', { 
      content, 
      imageCount: images?.length,
      hasContent: !!content.trim(),
      hasImages: images && images.length > 0
    });

    setSubmittingComment(true);
    try {
      let formData = new FormData();
      formData.append('content', content);
      
      if (images && images.length > 0) {
        images.forEach(image => {
          formData.append('images[]', image);
        });
      }

      const res = await api.post(`/posts/${id}/comments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Comment response:', res.data);
      console.log('📸 Comment media:', res.data.media);
      
      // Cập nhật state với dữ liệu mới
      if (res.data) {
        setComments((prev) => [res.data, ...prev]);
        console.log('✅ Comment added to UI');
      } else {
        console.error('❌ No data in response');
      }
      
    } catch (error: unknown) {
      console.error('❌ Comment error:', error);
      const err = error as ApiError;
      console.error('❌ Error response:', err.response?.data);
      alert(err.response?.data?.message || "Gửi bình luận thất bại");
    } finally {
      setSubmittingComment(false);
    }
  };

  /* ---------------- Format số lượt xem ---------------- */
  const formatViews = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
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

              {/* 🔥 UPDATED ACTIONS WITH LIKE & VIEWS FUNCTIONALITY */}
              <div className="flex items-center justify-between py-6 border-t border-b border-gray-200">
                <div className="flex items-center gap-6">
                  <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`flex items-center gap-2 transition-all duration-300 ${
                      isLiked
                        ? "text-red-600 hover:text-red-700"
                        : "text-gray-600 hover:text-red-600"
                    } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isLiking ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isLiked ? (
                      <Heart className="w-5 h-5 fill-current" />
                    ) : (
                      <ThumbsUp className="w-5 h-5" />
                    )}
                    <span className="font-medium">
                      {isLiked ? "Đã thích" : "Thích"} ({formatViews(likesCount)})
                    </span>
                  </button>
                  
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <Share className="w-5 h-5" />
                    <span>Chia sẻ</span>
                  </button>

                  <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span>Bình luận ({formatViews(comments.length)})</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>{formatViews(viewsCount)} lượt xem</span>
                  {isTrackingView && (
                    <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                  )}
                </div>
              </div>

              {/* BÌNH LUẬN - ĐÃ CẬP NHẬT */}
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Bình luận ({comments.length})
                  </h2>
                </div>

                {/* Form bình luận chính - ĐÃ CẬP NHẬT */}
                <div className="mb-8">
                  <CommentForm
                    onSubmit={handleSubmitComment}
                    submitting={submittingComment}
                    currentUser={currentUser}
                    placeholder="Viết bình luận của bạn..."
                  />
                </div>

                {/* Danh sách bình luận */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium mb-2">
                        Chưa có bình luận nào
                      </p>
                      <p className="text-gray-400 text-sm">
                        Hãy là người đầu tiên bình luận!
                      </p>
                    </div>
                  ) : (
                    comments.map((c) => (
                      <CommentItem
                        key={c.id}
                        comment={c}
                        currentUser={currentUser}
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
          {relatedPosts.length > 0 && (
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
          )}

          {/* Bài viết mới nhất */}
          {latestPosts.length > 0 && (
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
          )}

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
                {post.tags && post.tags.length > 0 ? (
                  post.tags.map((tag: Tag) => (
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