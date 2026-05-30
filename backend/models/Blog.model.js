const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, required: true, maxlength: 500 },
    content: { type: String, required: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    published: { type: Boolean, default: false },
    readTime: { type: Number, default: 1 },
  },
  { timestamps: true, versionKey: false }
);

blogSchema.pre('save', function (next) {
  const wordCount = this.content.split(/\s+/).filter(Boolean).length;
  this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  next();
});

blogSchema.index({ slug: 1 });
blogSchema.index({ published: 1, createdAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);
