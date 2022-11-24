const express = require('express')
const app = express()
const db = require('../db/db')
const cors = require("cors")
const blogRouter = require('../routes/blog')

// Set JSON as format
app.use(cors())
app.use(express.json())
app.use("/blog", blogRouter)

app.listen(3000, async () => {
    await db.sync({ force : false })
})