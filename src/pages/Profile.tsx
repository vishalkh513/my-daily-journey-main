import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PenLine, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface UserPost {
  _id: string;
  title: string;
  content: string;
  mood?: string;
  createdAt: string;
  updatedAt: string;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchUserPosts();
  }, [user]);

  const fetchUserPosts = async () => {
    if (!user) return;
    setLoadingPosts(true);
    try {
      // Fetch all posts and filter for user's posts
      const response = await fetch('http://localhost:3000/api/posts');
      if (!response.ok) throw new Error('Failed to fetch posts');
      const allPosts = await response.json();
      // Filter posts by author
      const userOwnedPosts = allPosts.filter((post: UserPost) => post.author === user.id);
      setUserPosts(userOwnedPosts);
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
      toast.error('Failed to load your posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/posts/${postId}?userId=${user?.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete post');
      }

      toast.success('Post deleted');
      setUserPosts(userPosts.filter(p => p._id !== postId));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete post');
    }
  };

  if (loading) return <div className="min-h-screen bg-background"><SiteHeader /><div className="max-w-3xl mx-auto px-6 py-16 text-muted-foreground">Loading…</div></div>;
  if (!user) return null;

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-accent mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Link>
        
        <div className="space-y-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">Account</p>
            <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] tracking-tight mb-10 text-balance">
              My Profile
            </h1>
          </div>

          <div className="space-y-6">
            <div className="border-b border-rule/20 pb-6">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">Email</p>
              <p className="text-lg font-medium">{user.email}</p>
            </div>

            <div className="border-b border-rule/20 pb-6">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">Username</p>
              <p className="text-lg font-medium">{user.username}</p>
            </div>

            <div className="border-b border-rule/20 pb-6">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">Member Since</p>
              <p className="text-lg font-medium">{joinedDate}</p>
            </div>
          </div>

          {/* My Posts Section */}
          <div className="mt-12 pt-8 border-t border-rule/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-3xl">My Posts</h2>
              <Link to="/write">
                <Button size="sm" onClick={() => navigate('/write')}>
                  <PenLine className="w-4 h-4 mr-2" /> New Post
                </Button>
              </Link>
            </div>

            {loadingPosts ? (
              <p className="text-muted-foreground">Loading posts…</p>
            ) : userPosts.length === 0 ? (
              <p className="text-muted-foreground italic">No posts yet. Create your first entry!</p>
            ) : (
              <div className="space-y-4">
                {userPosts.map((post) => {
                  const postDate = new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <div key={post._id} className="border border-rule/20 rounded-lg p-4 hover:bg-accent/5 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <Link to={`/post/${post._id}`} className="group">
                            <h3 className="font-medium text-lg group-hover:text-accent transition-colors truncate">
                              {post.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <span>{postDate}</span>
                            {post.mood && (
                              <>
                                <span>·</span>
                                <span className="text-accent">{post.mood}</span>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {post.content.substring(0, 100)}...
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link to={`/write/${post._id}`}>
                            <Button variant="ghost" size="sm" title="Edit post">
                              <PenLine className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(post._id)}
                            title="Delete post"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
