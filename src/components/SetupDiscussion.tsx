import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Heart,
  CornerDownRight,
  Pin,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Timer,
  CheckCircle2,
  User,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  LogIn,
  SlidersHorizontal,
  Flame,
  ThumbsUp,
  X,
  MessageCircle,
} from 'lucide-react';
import { SetupComment, CommentTag, UserAccount, CarSetup } from '../types';

interface SetupDiscussionProps {
  setup: CarSetup;
  comments: SetupComment[];
  currentUser: UserAccount | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onAddComment: (setupId: string, content: string, tag: CommentTag, parentId?: string | null) => void;
  onLikeComment: (setupId: string, commentId: string) => void;
  onSelectCreator?: (username: string) => void;
  compact?: boolean;
}

export const SetupDiscussion: React.FC<SetupDiscussionProps> = ({
  setup,
  comments,
  currentUser,
  onOpenAuth,
  onAddComment,
  onLikeComment,
  onSelectCreator,
  compact = false,
}) => {
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'likes' | 'newest'>('likes');

  // Main new comment form state
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentTag, setNewCommentTag] = useState<CommentTag>('Tuning Tip');
  const [guestName, setGuestName] = useState('');

  // Active reply target state (commentId where reply form is open)
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyGuestName, setReplyGuestName] = useState('');

  // Collapsed replies state (commentId -> boolean)
  const [collapsedThreads, setCollapsedThreads] = useState<Record<string, boolean>>({});

  // Filter comments for this specific setup
  const setupComments = useMemo(() => {
    return comments.filter((c) => c.setupId === setup.id);
  }, [comments, setup.id]);

  // Calculate counts
  const totalCommentsCount = useMemo(() => {
    let count = 0;
    const countTree = (list: SetupComment[]) => {
      list.forEach((item) => {
        count += 1;
        if (item.replies && item.replies.length > 0) {
          countTree(item.replies);
        }
      });
    };
    countTree(setupComments);
    return count;
  }, [setupComments]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: totalCommentsCount,
      'Tuning Tip': 0,
      Question: 0,
      Feedback: 0,
      'Lap Time': 0,
    };

    const tally = (list: SetupComment[]) => {
      list.forEach((item) => {
        if (item.tag && counts[item.tag] !== undefined) {
          counts[item.tag] += 1;
        }
        if (item.replies) {
          tally(item.replies);
        }
      });
    };
    tally(setupComments);
    return counts;
  }, [setupComments, totalCommentsCount]);

  // Filtered & sorted top-level comments
  const processedComments = useMemo(() => {
    let list = [...setupComments];

    if (selectedTagFilter !== 'All') {
      list = list.filter((c) => {
        if (c.tag === selectedTagFilter) return true;
        // Also keep thread if any reply matches tag
        return c.replies && c.replies.some((r) => r.tag === selectedTagFilter);
      });
    }

    return list.sort((a, b) => {
      // Pinned always on top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortBy === 'likes') {
        return b.likes - a.likes;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [setupComments, selectedTagFilter, sortBy]);

  // Relative time helper
  const formatTimeAgo = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  // Submit top-level comment
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    onAddComment(setup.id, newCommentText.trim(), newCommentTag, null);
    setNewCommentText('');
  };

  // Submit reply
  const handlePostReply = (parentId: string) => {
    if (!replyText.trim()) return;

    onAddComment(setup.id, replyText.trim(), 'Feedback', parentId);
    setReplyText('');
    setReplyingToId(null);
  };

  const toggleThread = (commentId: string) => {
    setCollapsedThreads((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Tag visual styling
  const getTagBadge = (tag?: CommentTag) => {
    switch (tag) {
      case 'Tuning Tip':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>Tuning Tip</span>
          </span>
        );
      case 'Question':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
            <HelpCircle className="w-3 h-3 text-sky-400" />
            <span>Question</span>
          </span>
        );
      case 'Feedback':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Feedback</span>
          </span>
        );
      case 'Lap Time':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
            <Timer className="w-3 h-3 text-purple-400" />
            <span>Lap Time Discussion</span>
          </span>
        );
      default:
        return null;
    }
  };

  // User badge styling
  const getUserBadge = (username: string, badge?: string) => {
    const isCreator = username.toLowerCase() === setup.creatorUsername.toLowerCase();

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {isCreator && (
          <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-sm flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Author / OP</span>
          </span>
        )}
        {badge === 'Esports' && (
          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-[9px]">
            ⚡ Esports
          </span>
        )}
        {badge === 'Pro' && (
          <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold text-[9px]">
            🏆 Pro
          </span>
        )}
        {badge === 'Verified' && (
          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[9px]">
            ✓ Verified
          </span>
        )}
      </div>
    );
  };

  // Recursive Comment Row
  const renderCommentItem = (item: SetupComment, depth: number = 0) => {
    const isReplying = replyingToId === item.id;
    const hasReplies = item.replies && item.replies.length > 0;
    const isCollapsed = Boolean(collapsedThreads[item.id]);
    const isAuthor = item.authorUsername.toLowerCase() === setup.creatorUsername.toLowerCase();

    return (
      <div
        key={item.id}
        className={`relative ${depth > 0 ? 'ml-4 sm:ml-7 mt-3 pl-3 sm:pl-4 border-l-2 border-slate-800/80' : 'mt-3.5'}`}
      >
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            item.isPinned
              ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
              : isAuthor
              ? 'bg-slate-900/95 border-sky-500/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-750'
          }`}
        >
          {/* Header with Author info, Badges, Tag, Pin */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* User Avatar Circle */}
              <button
                type="button"
                onClick={() => onSelectCreator && onSelectCreator(item.authorUsername)}
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-inner cursor-pointer hover:opacity-80 transition-opacity ${
                  isAuthor
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : item.authorBadge === 'Esports'
                    ? 'bg-purple-600 text-white'
                    : item.authorBadge === 'Pro'
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-700 text-slate-200'
                }`}
                title={`View @${item.authorUsername}'s Creator Profile`}
              >
                {item.authorUsername.charAt(0).toUpperCase()}
              </button>

              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => onSelectCreator && onSelectCreator(item.authorUsername)}
                    className="font-bold text-xs text-white hover:text-sky-300 transition-colors cursor-pointer"
                    title={`View @${item.authorUsername}'s Creator Profile`}
                  >
                    @{item.authorUsername}
                  </button>
                  {getUserBadge(item.authorUsername, item.authorBadge)}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {formatTimeAgo(item.createdAt)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {item.isPinned && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                  <Pin className="w-2.5 h-2.5 text-amber-400" />
                  <span>Pinned Tip</span>
                </span>
              )}
              {getTagBadge(item.tag)}
            </div>
          </div>

          {/* Comment Text Content */}
          <p className="mt-2.5 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
            {item.content}
          </p>

          {/* Action Bar (Like, Reply, Thread collapse) */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {/* Like / Helpful button */}
              <button
                type="button"
                onClick={() => onLikeComment(setup.id, item.id)}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all text-[11px] ${
                  item.userLiked
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-rose-300 hover:bg-slate-950 border border-slate-800/80'
                }`}
                title="Mark this tip as helpful"
              >
                <ThumbsUp className={`w-3 h-3 ${item.userLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                <span>{item.likes}</span>
                <span className="hidden sm:inline font-normal text-slate-400">Helpful</span>
              </button>

              {/* Reply Button */}
              <button
                type="button"
                onClick={() => {
                  if (replyingToId === item.id) {
                    setReplyingToId(null);
                  } else {
                    setReplyingToId(item.id);
                    setReplyText('');
                  }
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors text-[11px] ${
                  isReplying
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-950 border border-slate-800/80'
                }`}
              >
                <CornerDownRight className="w-3 h-3" />
                <span>Reply</span>
              </button>
            </div>

            {/* Toggle Replies button if replies exist */}
            {hasReplies && (
              <button
                type="button"
                onClick={() => toggleThread(item.id)}
                className="text-[11px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>Show {item.replies!.length} {item.replies!.length === 1 ? 'Reply' : 'Replies'}</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>Hide Replies</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Inline Reply Composer */}
          {isReplying && (
            <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-sky-500/40 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">
                  Replying to <strong className="text-sky-400">@{item.authorUsername}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setReplyingToId(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Write your reply or feedback to @${item.authorUsername}...`}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                autoFocus
              />

              <div className="flex items-center justify-between gap-2">
                <div className="text-[10px] text-slate-400">
                  Posting as <strong className="text-white">@{currentUser?.username || 'SimRacer'}</strong>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setReplyingToId(null)}
                    className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePostReply(item.id)}
                    disabled={!replyText.trim()}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 flex items-center gap-1 shadow-sm"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nested Child Replies */}
        {hasReplies && !isCollapsed && (
          <div className="space-y-2">
            {item.replies!.map((reply) => renderCommentItem(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 text-slate-100 font-sans" id={`setup-discussion-${setup.id}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-sky-400" />
          <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">
            Tuning Discussion & Community Q&A
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 font-bold text-xs border border-slate-700">
            {totalCommentsCount}
          </span>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-medium focus:outline-none focus:border-sky-500"
          >
            <option value="likes">🔥 Most Helpful (Top Liked)</option>
            <option value="newest">🆕 Newest First</option>
          </select>
        </div>
      </div>

      {/* Discussion Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {(['All', 'Tuning Tip', 'Question', 'Feedback', 'Lap Time'] as const).map((tag) => {
          const count = tagCounts[tag] || 0;
          const isSelected = selectedTagFilter === tag;

          return (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTagFilter(tag)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all border ${
                isSelected
                  ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/20'
                  : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
              }`}
            >
              {tag === 'All' && <span>💬 All Discussion</span>}
              {tag === 'Tuning Tip' && <span>💡 Tuning Tips</span>}
              {tag === 'Question' && <span>❓ Questions</span>}
              {tag === 'Feedback' && <span>⚡ Feedback</span>}
              {tag === 'Lap Time' && <span>⏱️ Lap Times</span>}
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-sky-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* MAIN NEW COMMENT COMPOSER */}
      <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-3 shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Share Tuning Feedback, Tips, or Ask a Question</span>
            </span>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>Posting as</span>
              <strong className="text-sky-400">@{currentUser.username}</strong>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="text-[11px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
            >
              <LogIn className="w-3 h-3" />
              <span>Log in for verified badge</span>
            </button>
          )}
        </div>

        <form onSubmit={handlePostComment} className="space-y-2.5">
          {/* Tag Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 font-bold uppercase mr-1">Category:</span>
            {(['Tuning Tip', 'Question', 'Feedback', 'Lap Time', 'General'] as CommentTag[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setNewCommentTag(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  newCommentTag === t
                    ? t === 'Tuning Tip'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : t === 'Question'
                      ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold'
                      : t === 'Feedback'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                      : t === 'Lap Time'
                      ? 'bg-purple-500 text-white border-purple-400 font-bold'
                      : 'bg-slate-700 text-white border-slate-600'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                {t === 'Tuning Tip' ? '💡 Tuning Tip' : t === 'Question' ? '❓ Question' : t === 'Feedback' ? '⚡ Feedback' : t === 'Lap Time' ? '⏱️ Lap Time' : '💬 General'}
              </button>
            ))}
          </div>

          {/* Text Area */}
          <textarea
            id="setup-new-comment-textarea"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder={
              newCommentTag === 'Tuning Tip'
                ? 'Share advice on tyre pressures, ARB balance, differential settings, or kerb handling with this car...'
                : newCommentTag === 'Question'
                ? 'Ask the creator about wheel force feedback settings, race vs quali fuel loads, or setup adjustments...'
                : newCommentTag === 'Lap Time'
                ? 'Share your lap time achievements, sector splits, or setup modifications on this track...'
                : 'Leave constructive feedback or driving impressions on this setup...'
            }
            rows={3}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />

          {/* Composer Footer Actions */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[10px] text-slate-500">
              💡 Pro-Tip: Helpful tuning advice can be upvoted and pinned by the community!
            </span>

            <button
              type="button"
              id="submit-comment-btn"
              onClick={handlePostComment}
              disabled={!newCommentText.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Comment</span>
            </button>
          </div>
        </form>
      </div>

      {/* COMMENTS LIST */}
      <div className="space-y-3">
        {processedComments.length === 0 ? (
          <div className="p-8 bg-slate-950/50 rounded-2xl border border-slate-800 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-xs font-bold text-white">No discussions under this filter yet</h4>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Be the first sim racer to post a tuning tip, report a lap time, or ask the creator a question!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {processedComments.map((comment) => renderCommentItem(comment, 0))}
          </div>
        )}
      </div>
    </div>
  );
};
