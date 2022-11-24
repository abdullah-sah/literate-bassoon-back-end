const { Router } = require("express");
const blogRouter = Router();

// Import database models
const { Token, Blog, Post } = require('../models/index')

// Import utils
const generateURL = require("../utilities/generateURL")
const generateToken = require("../utilities/generateToken")

// Return all blogs that exist
blogRouter.get("/", async (req, res) => {
    try {
        const query = await Blog.findAll()
        res.send({success: true, blogs: query})
    } catch {
        res.send({success: false})
    }
})

// Create a new blog
blogRouter.put("/", async (req, res) => {
    try {
        // Generate a URL, then create a new blog database entry 
        url = generateURL(req.body.blogTitle)
        const newBlog = await Blog.create({name: req.body.blogTitle, password: req.body.password, address: url})
        
        // Generate a token for this user, and associate the blog with the token
        const generatedToken = generateToken()
        console.log(generatedToken)
        newToken = await Token.create({token: generatedToken})
        
        await newBlog.addToken(newToken)

        res.send({success: true, blogAddress: url})
    } catch (err) {
        res.send({success: false, error: err})
    }
    
})

// Get all posts from a given blog
blogRouter.get("/:blogname/", async (req, res) => {
    try {
        target = await Blog.findOne({where: {name: req.params.blogname}, include: Token})
        query = await target.getPosts()
        res.send({success: true, posts: query})
    } catch {
        res.send({success: false, error: "Something went wrong."})
    }
})

// Create a new blog post
blogRouter.put("/:blogname/posts", async (req, res) => {
 
        // Check token
        const requestedBlog = await Blog.findOne({where: {name: req.params.blogname}})

        if (requestedBlog == null) {
            res.send({})
        }
        const blogTokens = await requestedBlog.getTokens()
        const tokens = blogTokens.find(element => {
            return element.toJSON().token === req.body.token
        })
        
        // Empty array -> Unauthorized, non empty array -> Authorized
        if (tokens.length === 0) { throw "Unauthorized" }

        // Find the blog to add the post to, and create the post
        const post = await Post.create({title: req.body.postTitle, content: req.body.postContent, creation_date: new Date()})
        const target = await Blog.findOne({where: {name: req.params.blogname}})

        // Add the post to the blog
        await target.addPost(post)

        // Send response
        res.send({success: true})
})

// Given a token, return an address to their blog.
blogRouter.post("/loginStatus", async (req, res) => {
    const userToken = await Token.findOne({where: {token: req.body.token}})
    const userBlog = await userToken.getBlog()

    res.send({success: true, blogAddress: userBlog.address})
})

// Log a user in to their blog.
blogRouter.post("/:blogname/login", async (req, res) => {
    const userBlog = await Blog.findOne({ where:{name: req.params.blogname}})

    // Blog not found
    if (userBlog == null) {
        res.send({success: false, error: "Blog not found"})
        return
    }

    // Correct password
     if (req.body.password === userBlog.password) {
        const newtoken = generateToken()
        dbtoken = Token.create({token:newtoken})
        userBlog.addToken(dbtoken)
        res.send({success: true, token:newtoken})
     }

     // Incorrect password
     else {
        res.send({success:false, error: "Incorrect password"})
        return
     }
})

// Delete a blog (and therefore all its associated posts and tokens)
blogRouter.delete("/:blogname", async (req, res) => {
    const userBlog = await Blog.findOne({where:{name: req.params.blogname}})

    if (userBlog == null) {
        res.send({success: false, error: "Blog not found"})
        return
    }
    
    const userPosts = await userBlog.getPosts()
    const userTokens = await userBlog.getTokens()

    // Delete all posts and tokens, and then, delete the blog
    userPosts.forEach(post => {
        post.destroy()
    })

    userTokens.forEach(token => {
        token.destroy()
    })

    userBlog.destroy()

    // Successful!
    res.send({success: true})

})

// Delete a post from a given blog
blogRouter.delete("/:blogname/posts/:postID", async (req, res) => {
    const userBlog = await Blog.findOne({where:{name: req.params.blogname}})

    if (userBlog == null) {
        res.send({success: false, error: "Blog not found"})
        return
    }

    const userPost = await userBlog.getPost({where: {id: req.params.postID}})

    if (userPost == null) {
        res.send({success: false, error: "Post not found"})
        return
    }

    userPost.destroy()

    // Successful!
    res.send({success: true})
})


module.exports = blogRouter