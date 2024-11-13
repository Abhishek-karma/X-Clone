import { useQuery } from "@tanstack/react-query";
import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useEffect } from "react";

const Posts = ({ feedType }) => {
  // Dynamically set the endpoint based on feedType
  const getPostEndpoint = () => {
    switch (feedType) {
      case "forYou":
        return "/api/posts/all";
      case "following":
        return "/api/posts/following";
      default:
        return "/api/posts/all";
    }
  };

  const POST_ENDPOINT = getPostEndpoint();

  // Fetch data using react-query's useQuery
  const {
    data: posts, // Posts data returned from API
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["posts", feedType], // Ensure it re-fetches when feedType changes
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINT);
        if (!res.ok) throw new Error("Failed to fetch posts");
        return res.json();
      } catch (error) {
        throw new Error(error.message);
      }
    },
    // Automatically refetch if feedType changes
    refetchOnWindowFocus: false,
  });

  // Ensure refetch happens when feedType changes
  useEffect(() => {
    refetch();
  }, [feedType, refetch]);

  if (isLoading || isRefetching) {
    // Show loading skeletons while data is being fetched or refetched
    return (
      <div className="flex flex-col justify-center">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (error) {
    // Show error message if fetching fails
    return <div className="text-red-500 text-center">Failed to load posts. Please try again.</div>;
  }

  if (!posts || posts.length === 0) {
    // If no posts are available, show a message
    return <p className="text-center my-4">No posts in this tab. Switch 👻</p>;
  }

  // Once posts are loaded, display them
  return (
    <div>
      {posts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Posts;
