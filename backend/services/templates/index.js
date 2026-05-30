const classic   = require('./classic.template');
const modern    = require('./modern.template');
const minimal   = require('./minimal.template');
const executive = require('./executive.template');
const compact   = require('./compact.template');

const TEMPLATES = [classic, modern, minimal, executive, compact];

const getAll = () => TEMPLATES.map(t => t.meta);

const getById = (id) => TEMPLATES.find(t => t.meta.id === id) || null;

module.exports = { TEMPLATES, getAll, getById };
