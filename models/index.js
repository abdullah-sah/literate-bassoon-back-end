const Blog = require("./blog.model");
const Post = require("./post.model");
const Token = require("./token.model");

Blog.hasMany(Token);
Token.belongsTo(Blog);

Blog.hasMany(Post);
Post.belongsTo(Blog);

module.exports = { Blog, Post, Token };
