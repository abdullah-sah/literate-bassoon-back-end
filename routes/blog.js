const { Router } = require("express");
const blogRouter = Router();

// Import database models
const { Token, Blog, Post } = require("../models/index");

// Import utils
const generateURL = require("../utilities/generateURL");
const generateToken = require("../utilities/generateToken");

// Return specific blog given blogId
blogRouter.get('/blogId/:blogId', async (req, res) => {
  try {
    const query = await Blog.findOne({ where: { id: req.params.blogId } });
    res.send({ success: true, blog: query });
  } catch (err) {
    res.send({ success: false, error: "err" });
  }
})

// Return all blogs that exist
blogRouter.get("/", async (req, res) => {
  try {
    const query = await Blog.findAll();
    res.send({ success: true, blogs: query });
  } catch {
    res.send({ success: false });
  }
});

// Return all posts that exist
blogRouter.get('/posts/', async (req, res) => {
  try {
    const query = await Post.findAll();
    res.send({ success: true, posts: query });
  } catch (err)  {
    res.send({ success: false, error: err });
  }
})

// Create a new blog
blogRouter.put("/", async (req, res) => {
  try {
    // Generate a URL, then create a new blog database entry
    url = generateURL(req.body.blogTitle);
    const newBlog = await Blog.create({
      name: req.body.blogTitle,
      password: req.body.password,
      address: url,
    });

    // Generate a token for this user, and associate the blog with the token
    const generatedToken = generateToken();
    newToken = await Token.create({ token: generatedToken });

    await newBlog.addToken(newToken);

    res.send({ success: true, blogAddress: url, token: generatedToken });
  } catch (err) {
    res.send({ success: false, error: err });
  }
});

// Get all posts from a given blog
blogRouter.get("/:blogname/", async (req, res) => {
  try {
    target = await Blog.findOne({
      where: { address: req.params.blogname },
      include: Token,
    });
    query = await target.getPosts({ order: [["updatedAt", "DESC"]] });
    res.send({ success: true, posts: query, blogTitle: target.name });
  } catch {
    res.send({ success: false, error: "Something went wrong." });
  }
});

// Create a new blog post
blogRouter.put("/:blogname/posts", async (req, res) => {
  // Check token
  const requestedBlog = await Blog.findOne({
    where: { address: req.params.blogname },
  });

  if (requestedBlog == null) {
    res.send({ success: false, error: "Blog not found." });
    return;
  }

  const blog = await Token.findOne({
    where: {
      token: req.body.token,
    },
  });

  if (blog.BlogId != requestedBlog.id) {
    res.send({ success: false, error: "Unauthorized." });
    return;
  }

  // Create the post and add it to the blog
  try {
    const post = await Post.create({
      title: req.body.postTitle,
      content: req.body.postContent,
      creation_date: new Date(),
    });
    await requestedBlog.addPost(post);
    res.send({ success: true });
  } catch {
    res.send({ success: false });
  }
});

// Given a token, return an address to their blog.
blogRouter.post("/loginStatus", async (req, res) => {
  let userBlog;
  let userToken = await Token.findOne({ where: { token: req.body.token } });
  console.log(`incoming token: ${req.body.token}`);

  if (userToken !== null) {
    userBlog = await userToken.getBlog();
  }

  if (userToken == null || userBlog == null) {
    res.send({ success: false, error: "No blog with that token" });
    return;
  }

  res.send({ success: true, blogAddress: userBlog.address });
});

// Log a user in to their blog.
blogRouter.post("/:blogname/login", async (req, res) => {
  const userBlog = await Blog.findOne({
    where: { address: req.params.blogname },
  });

  // Blog not found
  if (userBlog == null) {
    res.send({ success: false, error: "Blog not found" });
    return;
  }

  // Correct password
  if (req.body.password === userBlog.password) {
    const newtoken = generateToken();
    dbtoken = await Token.create({ token: newtoken });
    userBlog.addToken(dbtoken);
    res.send({ success: true, token: newtoken });
  }

  // Incorrect password
  else {
    res.send({ success: false, error: "Incorrect password" });
    return;
  }
});

// Delete a blog (and therefore all its associated posts and tokens)
blogRouter.delete("/:blogname", async (req, res) => {
  const userBlog = await Blog.findOne({
    where: { address: req.params.blogname },
  });

  if (userBlog == null) {
    res.send({ success: false, error: "Blog not found" });
    return;
  }

  const userPosts = await userBlog.getPosts();
  const userTokens = await userBlog.getTokens();

  // Delete all posts and tokens, and then, delete the blog
  userPosts.forEach((post) => {
    post.destroy();
  });

  userTokens.forEach((token) => {
    token.destroy();
  });

  userBlog.destroy();

  // Successful!
  res.send({ success: true });
});

// Delete a post from a given blog
blogRouter.delete("/:blogname/posts/:postID", async (req, res) => {
  const userBlog = await Blog.findOne({
    where: { address: req.params.blogname },
  });

  if (userBlog == null) {
    res.send({ success: false, error: "Blog not found" });
    return;
  }

  const userPost = (
    await userBlog.getPosts({
      where: { id: req.params.postID },
    })
  )[0];

  if (userPost == null) {
    res.send({ success: false, error: "Post not found" });
    return;
  }

  userPost.destroy();

  // Successful!
  res.send({ success: true });
});

// update a post content
blogRouter.put("/:blogname/posts/:postID", async (req, res) => {
  const userBlog = await Blog.findOne({
    where: { address: req.params.blogname },
  });

  if (userBlog == null) {
    res.send({ success: false, error: "Blog not found" });
    return;
  }

  const userPost = (
    await userBlog.getPosts({
      where: { id: req.params.postID },
    })
  )[0];

  if (userPost == null) {
    res.send({ success: false, error: "Post not found" });
    return;
  }

  await Post.update(
    {
      title: req.body.postTitle,
      content: req.body.postContent,
    },
    {
      where: {
        id: userPost.id,
      },
    }
  );

  res.send({ success: true });
});

module.exports = blogRouter;
