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
        res.send(query)
    } catch {
        res.send({success: false})
    }
})

// Create a new blog
blogRouter.put("/", async (req, res) => {
    try {
        // Generate a URL, then create a new blog database entry 
        url = generateURL(req.body.blogTitle)
        const response = await Blog.create({name: req.body.blogTitle, password: req.body.password, address: url})
        res.send({success: true, blogAddress: url})
    } catch {
        res.send({success: false, blogAddress: undefined, error: "An error occured."})
    }
})

// Get all posts from a given blog
blogRouter.get("/:blogname/", async (req, res) => {
    try {
        target = await Blog.findOne({where: {name: req.params.blogname}})
        query = await target.getPosts()
        res.send({success: true, body: query})
    } catch {
        res.send({success: false, error: "Something went wrong."})
    }
})

// Create a new blog post
blogRouter.put("/:blogname/posts", async (req, res) => {

        // TODO check token

        // Find the blog to add the post to, and create the post
        post = await Post.create({title: req.body.postTitle, content: req.body.postContent, creation_date: new Date()})
        target = await Blog.findOne({where: {name: req.params.blogname}})

        // Add the post to the blog
        await target.addPost(post)

        // Send response
        res.send({success: true})

})

// Given a token, return an address to their blog
blogRouter.post("/loginStatus", async (req, res) => {
    //TODO
})

// Log a user in to their blog
blogRouter.post("/:blogname/login", async (req, res) => {
    //TODO
})


module.exports = blogRouter