"use client"
import React, { useEffect, useState } from "react";
import { getForYouPageData } from "/workspace/dbms-final/src/lib/actions.ts";
import { useRouter } from "next/navigation";

const ForYouPage = () => {
 const router = useRouter();
const { userId } = router.query;
 

  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {if (userId) {
        const result = await getForYouPageData(userId);
        setData(result);
      }
    }catch (error) {
        // Handle error
        console.error("Error fetching data:", error);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  if (!data) {
    return <p>Loading...</p>;
  }

  const renderPosts = (posts, title) => (
    <div>
      <h2>{title}</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.post_id}>
            <p>Title: {post.title}</p>
            <p>Author: {post.followed_name}</p>
            <p>Follow Type: {post.follow_type}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div>
      {/* Display user data*/}
      {data.user && <p>Welcome, {data.user.name}!</p>}

      {/* Render relevant posts */}
      {data.relevantPosts && renderPosts(data.relevantPosts, "Relevant Posts")}

      {/* Render top posts */}
      {data.topPosts && renderPosts(data.topPosts, "Top Posts")}

      {/* Render featured posts */}
      {data.featuredPosts && renderPosts(data.featuredPosts, "Featured Posts")}
    </div>
  );
};

export default ForYouPage;