const { Blog, Post, Token } = require("../models/");
const generateURL = require("../utilities/generateURL");
const generateToken = require("../utilities/generateToken");
const db = require("./db");
const { default: nodeTest } = require("node:test");

const seed = async () => {
	await db.sync({ force: true });

	try {
		const tokens = await Token.bulkCreate([
			{
				token: generateToken(),
			},
			{
				token: generateToken(),
			},
			{
				token: generateToken(),
			},
		]);

		// just returns a populated object using params
		const prepBlogObj = (name, password) => {
			const obj = {};
			obj.name = name;
			obj.address = generateURL(obj.name);
			obj.password = password;
			return obj;
		};

		const blogs = await Blog.bulkCreate([
			prepBlogObj("steve@123isdaboss!", "passwordsteve"),
			prepBlogObj("garyis@legend", "passwordgary"),
			prepBlogObj("gabbie", "passwordgabbie"),
		]);

		const prepPostObj = (title, content) => {
			return {
				title,
				creation_date: new Date().toJSON(),
				content,
			};
		};

		const posts = await Post.bulkCreate([
			prepPostObj("My First Post!!!", "Hello - it's me!!!"),
			prepPostObj("My Second Post!!!", "Hello, is it me you're looking for?"),
			prepPostObj("My Third Post!!!", "Hello there. General Kenobi."),
			prepPostObj(
				"My Fourth Post!!!",
				"Hello World? I'm running out of references"
			),
			prepPostObj("My Fifth Post!!!", "Ho. This is another post."),
			prepPostObj("My Sixth Post!!!", "Star Wars: Revenge of the Sixth"),
		]);

		const [token1, token2, token3] = tokens;
		const [blog1, blog2, blog3] = blogs;
		const [post1, post2, post3, post4, post5, post6] = posts;

		// setting associations:
		await blog1.setTokens(token2);
		await blog2.setTokens(token3);
		await blog3.setTokens(token1);

		await blog1.setPosts([post1, post2]);
		await blog2.setPosts([post3, post4]);
		await blog3.setPosts([post5, post6]);

		console.log("Database has been populated :)");
	} catch (error) {
		console.log("There was an error: ", error.message);
	}
};

(async () => await seed())();

module.exports = seed;
