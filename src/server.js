const express = require('express')
const app = express()
const db = require('../db/db')
const blogRouter = require('../routes/blog')

// Set JSON as format
app.use(express.json())
app.use("/blog", blogRouter)

app.listen(3000, async () => {
    await db.sync({ force : true })
})