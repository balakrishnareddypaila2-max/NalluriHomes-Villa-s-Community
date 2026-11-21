import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bookmark,
  Briefcase,
  Calendar,
  Check,
  Clock,
  Film,
  Heart,
  Image as ImageIcon,
  Lock,
  MapPin,
  Megaphone,
  MessageCircle,
  Pin,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Video,
  X,
} from 'lucide-react';
import { COMMUNITY_STORIES } from '../../data/initialEstateData';
import {
  ActiveSessionProfile,
  CommunityCategoryTag,
  CommunityPost,
  CommunityStory,
} from '../../types/estate';
import { DEFAULT_COMMUNITY_ADDRESS, readFileAsDataUrl } from '../../utils/ownerAuth';
import { ImageCropperModal } from '../ImageCropperModal';
import {
  CommunityMediaVisual,
  StoryThumbVisual,
  UserAvatar,
} from '../ui/EstatePrimitives';

interface CommunityScreenProps {
  activeProfile: ActiveSessionProfile;
  posts: CommunityPost[];
  attendingGazette: boolean;
  onToggleGazetteRsvp: () => void;
  onToggleLike: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  onAddComment: (postId: string, body: string) => void;
  onToggleJoinMatch: (postId: string) => void;
  onCreatePost: (payload: {
    body: string;
    type: CommunityPost['type'];
    categoryTag: CommunityCategoryTag;
    occupationBadge?: string;
    mediaType?: 'image' | 'video';
    mediaUrl?: string;
  }) => void;
  onSharePost: (post: CommunityPost) => void;
}

const INSIGHT_FILTERS = [
  'All Insights',
  'Festival Celebrations',
  'Video Reels',
  'Special Occupations',
  'Sports & Clubs',
] as const;

type InsightFilter = (typeof INSIGHT_FILTERS)[number];

export const CommunityScreen: React.FC<CommunityScreenProps> = ({
  activeProfile,
  posts,
  attendingGazette,
  onToggleGazetteRsvp,
  onToggleLike,
  onToggleBookmark,
  onAddComment,
  onToggleJoinMatch,
  onCreatePost,
  onSharePost,
}) => {
  const [composerText, setComposerText] = useState('');
  const [composerMode, setComposerMode] = useState<'photo' | 'video' | 'festival' | 'occupation' | 'update'>('photo');
  const [occupationInput, setOccupationInput] = useState('');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | undefined>(undefined);
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<InsightFilter>('All Insights');
  const [activeStory, setActiveStory] = useState<CommunityStory | null>(null);
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({
    'post-sankranti-video': true,
    'post-occupation-video': true,
  });
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const gazetteCount = 84 + (attendingGazette ? 1 : 0);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (activeFilter === 'All Insights') return true;
      if (activeFilter === 'Festival Celebrations') {
        return p.categoryTag === 'Festival Celebration' || p.type === 'festival';
      }
      if (activeFilter === 'Video Reels') {
        return p.mediaType === 'video' || p.type === 'video';
      }
      if (activeFilter === 'Special Occupations') {
        return p.categoryTag === 'Special Occupation' || p.type === 'occupation';
      }
      if (activeFilter === 'Sports & Clubs') {
        return p.categoryTag === 'Sports & Clubs' || p.type === 'match';
      }
      return true;
    });
  }, [activeFilter, posts]);

  const handleAttachPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rawDataUrl = await readFileAsDataUrl(file);
      setCropSourceUrl(rawDataUrl);
    } catch {
      // Ignore invalid files
    } finally {
      e.target.value = '';
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim() && !uploadedPhotoUrl) return;

    const categoryTag: CommunityCategoryTag =
      composerMode === 'festival'
        ? 'Festival Celebration'
        : composerMode === 'occupation'
        ? 'Special Occupation'
        : composerMode === 'video'
        ? 'Community Reel'
        : 'Township Insight';

    onCreatePost({
      body: composerText.trim() || 'Shared a new moment from Nalluri Home.',
      type: composerMode,
      categoryTag,
      occupationBadge:
        composerMode === 'occupation' && occupationInput.trim()
          ? occupationInput.trim()
          : undefined,
      mediaType: composerMode === 'video' ? 'video' : uploadedPhotoUrl ? 'image' : undefined,
      mediaUrl: uploadedPhotoUrl,
    });
    setComposerText('');
    setOccupationInput('');
    setUploadedPhotoUrl(undefined);
    setComposerMode('photo');
  };

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = (commentDrafts[postId] || '').trim();
    if (!text) return;
    onAddComment(postId, text);
    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Verified Circle Banner */}
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-[#E2DDD2] bg-[#ECF2ED] px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#414B47]">
        <ShieldCheck className="h-3.5 w-3.5 text-[#0B3529]" />
        <span>NALLURI HOME PRIVATE CIRCLE · 231 RESIDENT FAMILIES · VIDEO & INSIGHT FEEDS</span>
        <Lock className="h-3 w-3 text-[#85631E]" />
      </div>

      {/* Story Highlights Carousel */}
      <section aria-label="Enclave highlights" className="no-scrollbar flex items-start gap-3.5 overflow-x-auto py-1.5">
        {COMMUNITY_STORIES.map((story) => (
          <button
            key={story.id}
            type="button"
            onClick={() => setActiveStory(story)}
            className="group flex w-[84px] shrink-0 flex-col items-center gap-2 text-center"
          >
            <div className="relative rounded-full bg-gradient-to-tr from-[#C59B48] via-[#F7DDA4] to-[#0B3529] p-[2.5px] transition-transform group-hover:scale-105">
              <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-[#F4F6F1]">
                <StoryThumbVisual theme={story.theme} />
              </div>
              {story.isLive ? (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[#0B3529] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#F7DDA4] shadow-xs">
                  LIVE
                </span>
              ) : story.isVideo ? (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[#85631E] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white shadow-xs">
                  REEL
                </span>
              ) : null}
            </div>
            <span className="w-full text-center text-[11px] font-semibold leading-tight text-[#141E1B]">
              {story.label}
            </span>
          </button>
        ))}
      </section>

      {/* Insights Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        {INSIGHT_FILTERS.map((filter) => {
          const active = activeFilter === filter;
          return (
            <motion.button
              key={filter}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveFilter(filter)}
              className={`relative min-h-[40px] rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? 'bg-[#0B3529] text-[#FBF9F5]'
                  : 'border border-[#E2DDD2] bg-white text-[#414B47] hover:bg-[#ECF2ED]'
              }`}
            >
              {filter}
            </motion.button>
          );
        })}
      </div>

      {/* Main Responsive 2-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left / Primary Column: Composer + Feed */}
        <div className="space-y-6 lg:col-span-8">
          {/* Composer Card */}
          <form onSubmit={handlePublish} className="estate-card rounded-2xl p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
              <UserAvatar
                name={activeProfile.fullName}
                initials={activeProfile.initials}
                avatarUrl={activeProfile.avatarDataUrl}
              />
              <input
                type="text"
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                placeholder={`Share a festival reel, occupation insight, or photo as ${activeProfile.fullName}...`}
                className="h-[46px] min-w-0 flex-1 rounded-full border border-[#E2DDD2] bg-[#ECF2ED] px-4 text-sm text-[#141E1B] placeholder:text-[#414B47]/75 focus:border-[#0B3529] focus:bg-white focus:outline-none"
              />
              {(composerText.trim() || uploadedPhotoUrl) && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  aria-label="Publish post"
                  className="flex h-[46px] shrink-0 items-center gap-1.5 rounded-full bg-[#0B3529] px-4 text-xs font-semibold text-[#FBF9F5]"
                >
                  <Send className="h-3.5 w-3.5 text-[#F7DDA4]" />
                  <span>Post</span>
                </motion.button>
              )}
            </div>

            {composerMode === 'occupation' && (
              <div className="mt-3">
                <input
                  type="text"
                  value={occupationInput}
                  onChange={(e) => setOccupationInput(e.target.value)}
                  placeholder="Your Occupation / Expertise Badge (e.g. Architect, Physician, Musician)"
                  className="h-[40px] w-full rounded-xl border border-[#C59B48]/45 bg-[#F4F6F1] px-3.5 text-xs text-[#141E1B] focus:border-[#0B3529] focus:bg-white focus:outline-none"
                />
              </div>
            )}

            {uploadedPhotoUrl && (
              <div className="relative mt-3 overflow-hidden rounded-xl border border-[#E2DDD2]">
                <img
                  src={uploadedPhotoUrl}
                  alt="Attached upload preview"
                  className="max-h-56 w-full object-cover"
                />
                <div className="absolute right-2 top-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCropSourceUrl(uploadedPhotoUrl)}
                    className="rounded-full bg-black/65 px-3 py-1 text-[11px] font-semibold text-[#F7DDA4] backdrop-blur-xs hover:bg-black/80"
                  >
                    Adjust Crop
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadedPhotoUrl(undefined)}
                    aria-label="Remove attached image"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white hover:bg-black/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-[#E5ECE6] pt-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <label className="flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-[#414B47] hover:bg-[#ECF2ED]">
                  <ImageIcon className="h-4 w-4 text-[#0B3529]" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAttachPhoto}
                    className="sr-only"
                  />
                </label>

                {[
                  { id: 'video' as const, label: 'Video Reel', icon: Video },
                  { id: 'festival' as const, label: 'Festival', icon: Sparkles },
                  { id: 'occupation' as const, label: 'Occupation', icon: Briefcase },
                  { id: 'update' as const, label: 'Notice', icon: Megaphone },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = composerMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setComposerMode(opt.id)}
                      className={`flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors ${
                        active
                          ? 'bg-[#0B3529] text-[#FBF9F5]'
                          : 'text-[#414B47] hover:bg-[#ECF2ED]'
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#F7DDA4]' : 'text-[#0B3529]'}`} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </form>

          {/* Feed Posts */}
          <AnimatePresence initial={false}>
            {filteredPosts.map((post, idx) => (
              <motion.article
                key={post.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.28, delay: Math.min(idx * 0.04, 0.2), ease: [0.22, 1, 0.36, 1] }}
                className="estate-card rounded-2xl p-5 sm:p-6"
              >
                {/* Author Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={post.author}
                      initials={post.initials}
                      avatarUrl={post.authorAvatarUrl}
                      toneClass={post.avatarTone}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[15px] font-bold text-[#141E1B]">{post.author}</span>
                        <span className="rounded-md bg-[#F7DDA4]/75 px-2 py-0.5 text-[10px] font-bold text-[#85631E]">
                          {post.villa}
                        </span>
                        {post.categoryTag && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#ECF2ED] px-2.5 py-0.5 text-[10px] font-bold text-[#0B3529]">
                            {post.mediaType === 'video' && <Film className="h-2.5 w-2.5" />}
                            <span>{post.categoryTag}</span>
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-[#414B47]">
                        {post.occupationBadge ? `${post.occupationBadge} · ` : ''}
                        {post.street} · {post.timestamp}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleBookmark(post.id)}
                    aria-label={post.bookmarked ? 'Remove bookmark' : 'Bookmark post'}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-[#414B47] transition-colors hover:bg-[#ECF2ED]"
                  >
                    <Bookmark
                      className={`h-4 w-4 ${
                        post.bookmarked ? 'fill-[#0B3529] text-[#0B3529]' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Body */}
                <p className="mt-4 text-[15px] leading-[23px] text-[#141E1B]">{post.body}</p>

                {/* Photo or Video Reel Visual */}
                {(post.visualTheme || post.mediaUrl) && (
                  <div className="mt-4">
                    <CommunityMediaVisual
                      mediaType={post.mediaType}
                      mediaUrl={post.mediaUrl}
                      visualTheme={post.visualTheme}
                      caption={post.visualCaption}
                      videoDuration={post.videoDuration}
                    />
                  </div>
                )}

                {/* Match / Activity Inset Box */}
                {post.matchDetails && (
                  <div className="mt-4 flex flex-col justify-between gap-4 rounded-xl bg-[#ECF2ED] p-4 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#141E1B]">
                        <Clock className="h-4 w-4 text-[#0B3529]" />
                        <span>
                          {post.matchDetails.schedule} · {post.matchDetails.venue}
                        </span>
                      </div>
                      <p className="text-xs text-[#414B47] tabular-nums">
                        {post.matchDetails.slotsFilled} / {post.matchDetails.slotsTotal} slots filled ·{' '}
                        {post.matchDetails.pace}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleJoinMatch(post.id)}
                      className={`min-h-[42px] rounded-xl px-4 text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                        post.matchDetails.joinedByMe
                          ? 'bg-[#0B3529] text-[#FBF9F5]'
                          : 'bg-[#85631E] text-white hover:bg-[#6E5015]'
                      }`}
                    >
                      {post.matchDetails.joinedByMe ? 'Joined Match ✓' : 'Join Match'}
                    </button>
                  </div>
                )}

                {/* Reaction Bar: Heart / Like, Comment, Share */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E5ECE6] pt-3.5 text-xs text-[#414B47]">
                  <div className="flex items-center gap-5">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      type="button"
                      onClick={() => onToggleLike(post.id)}
                      className={`inline-flex min-h-[36px] items-center gap-1.5 font-semibold transition-colors ${
                        post.likedByMe ? 'text-[#BA1A1A]' : 'hover:text-[#141E1B]'
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 transition-transform ${
                          post.likedByMe ? 'scale-110 fill-[#BA1A1A] text-[#BA1A1A]' : ''
                        }`}
                      />
                      <span className="tabular-nums">{post.likes}</span>
                    </motion.button>

                    <button
                      type="button"
                      onClick={() =>
                        setOpenComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
                      }
                      className="inline-flex min-h-[36px] items-center gap-1.5 font-semibold hover:text-[#141E1B]"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="tabular-nums">{post.comments.length}</span>
                    </button>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => onSharePost(post)}
                      aria-label="Share post"
                      className="inline-flex min-h-[36px] items-center gap-1.5 font-semibold hover:text-[#0B3529]"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="tabular-nums">{post.sharesCount}</span>
                    </motion.button>
                  </div>

                  <span className="text-[11px] tabular-nums">
                    {post.matchDetails
                      ? post.matchDetails.joinedSummary
                      : `Seen by ${post.seenByCount} neighbors`}
                  </span>
                </div>

                {/* Expandable Comments */}
                {openComments[post.id] && (
                  <div className="mt-3 space-y-2.5 border-t border-[#E5ECE6] pt-3">
                    {post.comments.map((c) => (
                      <div key={c.id} className="flex items-start gap-2.5 rounded-xl bg-[#ECF2ED] p-3">
                        <UserAvatar
                          name={c.author}
                          initials={c.initials}
                          avatarUrl={c.avatarUrl}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#141E1B]">
                            {c.author}{' '}
                            <span className="font-normal text-[#414B47]">{c.villa} · {c.timestamp}</span>
                          </p>
                          <p className="mt-0.5 text-xs text-[#414B47]">{c.body}</p>
                        </div>
                      </div>
                    ))}

                    <form
                      onSubmit={(e) => handleCommentSubmit(post.id, e)}
                      className="flex items-center gap-2 pt-1"
                    >
                      <input
                        type="text"
                        value={commentDrafts[post.id] || ''}
                        onChange={(e) =>
                          setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        placeholder={`Reply as ${activeProfile.fullName}...`}
                        className="h-[40px] flex-1 rounded-xl border border-[#E2DDD2] bg-[#F4F6F1] px-3.5 text-xs text-[#141E1B] focus:border-[#0B3529] focus:bg-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="h-[40px] rounded-xl bg-[#0B3529] px-3.5 text-xs font-semibold text-[#FBF9F5]"
                      >
                        Reply
                      </button>
                    </form>
                  </div>
                )}
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {/* Right Column: Pinned Township Gazette Official Notice + Location & Closing Editorial */}
        <div className="space-y-6 lg:col-span-4">
          <section className="estate-card overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between bg-[#0B3529] px-5 py-3 text-[#FBF9F5]">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.08em]">
                <Pin className="h-3.5 w-3.5 text-[#F7DDA4]" />
                <span>TOWNSHIP GAZETTE · OFFICIAL NOTICE</span>
              </div>
              <span className="rounded bg-[#184839] px-2 py-0.5 text-[10px] font-semibold text-[#A3D0BE]">
                Festival
              </span>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7DDA4] text-[#85631E]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#141E1B]">Estate Management Board</p>
                  <p className="text-xs text-[#414B47]">Central Secretariat · Circular #88</p>
                </div>
              </div>

              <div>
                <h2 className="font-serif text-[20px] font-semibold leading-[26px] text-[#141E1B]">
                  Annual Sankranti Kite Festival & Traditional Feast
                </h2>
                <p className="mt-2 text-sm leading-[21px] text-[#414B47]">
                  Join resident families at Central Lawns for artisanal kite making, heritage
                  games, live Carnatic fusion strings, and an authentic festive lunch curated by
                  Chef Natarajan.
                </p>
              </div>

              <div className="space-y-2 rounded-xl bg-[#ECF2ED] p-4 text-xs text-[#141E1B]">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 shrink-0 text-[#85631E]" />
                  <span>Grand Central Amphitheater · 10:30 AM – 3:30 PM</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#85631E]" />
                  <span>{DEFAULT_COMMUNITY_ADDRESS}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#F7DDA4] text-[10px] font-bold text-[#85631E]">
                      12
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#A3D0BE] text-[10px] font-bold text-[#0B3529]">
                      42
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#DEE6DF] text-[10px] font-bold text-[#414B47]">
                      89
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[#414B47] tabular-nums">
                    {gazetteCount} villas confirmed
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onToggleGazetteRsvp}
                  className={`inline-flex h-[40px] items-center gap-1.5 rounded-xl px-4 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    attendingGazette
                      ? 'bg-[#0B3529] text-[#FBF9F5]'
                      : 'border border-[#0B3529] bg-white text-[#0B3529] hover:bg-[#ECF2ED]'
                  }`}
                >
                  <Check className="h-3.5 w-3.5 text-[#F7DDA4]" />
                  <span>{attendingGazette ? 'Attending' : 'RSVP Villa'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Editorial Registry Quote */}
          <div className="rounded-2xl border border-[#E2DDD2] bg-white/80 px-6 py-8 text-center">
            <div className="mx-auto mb-4 h-[2px] w-10 bg-[#C59B48]" />
            <p className="font-serif text-lg italic leading-[26px] text-[#141E1B]">
              “A neighborhood of calm dignity and shared celebrations.”
            </p>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#85631E]">
              NALLURI HOME · GATED VILLA COMMUNITY
            </p>
            <p className="mt-2 text-[11px] leading-[17px] text-[#414B47]">
              {DEFAULT_COMMUNITY_ADDRESS}
            </p>
          </div>
        </div>
      </div>

      {/* Story Spotlight Modal */}
      <AnimatePresence>
        {activeStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveStory(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B3529]/75 p-5 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm overflow-hidden rounded-3xl border border-[#C59B48]/45 bg-[#141E1B] text-[#FBF9F5] shadow-2xl"
            >
              <div className="h-1 w-full bg-[#28332F]">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 4.5, ease: 'linear' }}
                  className="h-full bg-[#F7DDA4]"
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-bold">{activeStory.label}</p>
                  <p className="text-xs text-[#A3D0BE]">
                    {activeStory.author} · {activeStory.villa} · {activeStory.timestamp}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStory(null)}
                  aria-label="Close highlight"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mx-4 aspect-square overflow-hidden rounded-2xl border border-[#C59B48]/30">
                <StoryThumbVisual theme={activeStory.theme} />
              </div>
              <p className="p-5 text-sm leading-[22px] text-[#E8F3EE]">{activeStory.caption}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cropSourceUrl && (
          <ImageCropperModal
            imageSrc={cropSourceUrl}
            aspectShape="landscape"
            outputWidth={720}
            outputHeight={450}
            title="Crop & Frame Community Photo"
            subtitle="Adjust framing, zoom, or rotation before sharing with Nalluri Home neighbors."
            onCancel={() => setCropSourceUrl(null)}
            onConfirm={(croppedDataUrl) => {
              setUploadedPhotoUrl(croppedDataUrl);
              setComposerMode('photo');
              setCropSourceUrl(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
