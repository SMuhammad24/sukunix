const xss = require('xss');

/**
 * Custom XSS options - strict stripping for text fields
 */
const xssOptions = {
  whiteList: {}, // No HTML tags allowed in standard form submissions
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style', 'xml', 'iframe', 'object']
};

const xssFilter = new xss.FilterXSS(xssOptions);

/**
 * Recursively clean an object, array, or string
 */
function clean(obj) {
  if (typeof obj === 'string') {
    return xssFilter.process(obj).trim();
  }
  if (Array.isArray(obj)) {
    return obj.map(item => clean(item));
  }
  if (obj !== null && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      obj[key] = clean(obj[key]);
    }
    return obj;
  }
  return obj;
}

/**
 * Express middleware to sanitize req.body, req.query, and req.params against Stored & Reflected XSS
 */
function xssSanitizer(req, res, next) {
  if (req.body) {
    req.body = clean(req.body);
  }
  if (req.query) {
    req.query = clean(req.query);
  }
  if (req.params) {
    req.params = clean(req.params);
  }
  next();
}

module.exports = { xssSanitizer, clean };
