import React from 'react';
import Post from './Post';
import { useSelector } from 'react-redux';

export default function Posts() {
  const { posts } = useSelector(store => store.post);
  const { user } = useSelector(store => store.auth); 

  return (
    <div>
      {posts
        .filter(post => post.author?._id !== user?._id) 
        .map(post => <Post key={post._id} post={post} />)}
    </div>
  );
}

