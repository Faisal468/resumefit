const Blog = require('../models/Blog.model');
const logger = require('../utils/logger');

const slugify = (text) =>
  text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

// ─── Public ───────────────────────────────────────────────────────────────────

const listPosts = async (req, res) => {
  const { tag, page = 1, limit = 12 } = req.query;
  const filter = { published: true };
  if (tag) filter.tags = tag;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [posts, total] = await Promise.all([
    Blog.find(filter)
      .select('title slug excerpt tags readTime createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Blog.countDocuments(filter),
  ]);
  res.json({ posts, total, page: parseInt(page) });
};

const getPost = async (req, res) => {
  const post = await Blog.findOne({ slug: req.params.slug, published: true }).lean();
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  res.json(post);
};

// ─── Admin ────────────────────────────────────────────────────────────────────

const adminListPosts = async (_req, res) => {
  const posts = await Blog.find()
    .select('title slug published readTime createdAt tags')
    .sort({ createdAt: -1 })
    .lean();
  res.json(posts);
};

const createPost = async (req, res) => {
  const { title, excerpt, content, tags = [], published = false } = req.body;
  if (!title || !excerpt || !content) {
    return res.status(400).json({ error: 'Title, excerpt, and content are required.' });
  }

  let slug = slugify(title);
  // Ensure uniqueness
  const existing = await Blog.countDocuments({ slug });
  if (existing) slug = `${slug}-${Date.now()}`;

  const post = await Blog.create({ title, slug, excerpt, content, tags, published });
  logger.info(`Blog post created: ${post.slug}`);
  res.status(201).json(post);
};

const updatePost = async (req, res) => {
  const { title, excerpt, content, tags, published } = req.body;
  const post = await Blog.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });

  if (title !== undefined) { post.title = title; post.slug = slugify(title); }
  if (excerpt !== undefined) post.excerpt = excerpt;
  if (content !== undefined) post.content = content;
  if (tags !== undefined) post.tags = tags;
  if (published !== undefined) post.published = published;

  await post.save();
  res.json(post);
};

const deletePost = async (req, res) => {
  const post = await Blog.findByIdAndDelete(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  logger.info(`Blog post deleted: ${post.slug}`);
  res.json({ message: 'Post deleted.' });
};

module.exports = { listPosts, getPost, adminListPosts, createPost, updatePost, deletePost };
