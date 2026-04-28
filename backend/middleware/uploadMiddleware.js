// GITHUB: Day 3 - Commit 4 - "feat(backend): add Cloudinary upload utility and file upload middleware"

const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Store files in memory (buffer) — we upload directly to Cloudinary, never to disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images and documents — we validate more specifically in uploadToCloudinary
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// Uploads a file buffer to Cloudinary and returns the secure URL
// folder: e.g. 'warehouseiq-products', 'warehouseiq-suppliers'
const uploadToCloudinary = async (fileBuffer, mimetype, folder) => {
  const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const documentMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (imageMimeTypes.includes(mimetype)) {
    // Images are fine as-is
  } else if (documentMimeTypes.includes(mimetype)) {
    // Documents are fine as-is
  } else {
    throw new Error('Invalid file type for upload');
  }

  // Convert buffer to base64 data URI for Cloudinary upload
  const base64 = fileBuffer.toString('base64');
  const dataUri = `data:${mimetype};base64,${base64}`;

  // Documents (PDF, XLSX, DOCX) must be uploaded as 'raw' so Cloudinary
  // serves the original file rather than trying to render it as an image
  const isDocument = documentMimeTypes.includes(mimetype);

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: folder,
    resource_type: isDocument ? 'raw' : 'image',
  });

  return result.secure_url;
};

// Validates and uploads an image file (jpg, jpeg, png, gif only)
const uploadImageToCloudinary = async (file, folder) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedImageTypes.includes(file.mimetype)) {
    throw new Error('Image must be jpg, jpeg, png, or gif');
  }
  return uploadToCloudinary(file.buffer, file.mimetype, folder);
};

// Validates and uploads a document file (PDF, XLSX, DOCX only)
const uploadDocumentToCloudinary = async (file, folder) => {
  const allowedDocTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (!allowedDocTypes.includes(file.mimetype)) {
    throw new Error('Document must be PDF, XLSX, or DOCX');
  }
  return uploadToCloudinary(file.buffer, file.mimetype, folder);
};

// Extracts the Cloudinary public_id from a stored secure_url
// Used when we need to delete the old file from Cloudinary before replacing it
//
// Image URL: https://res.cloudinary.com/cloud/image/upload/v123/folder/file.jpg
//   → public_id = "folder/file" (extension stripped)
// Raw URL:   https://res.cloudinary.com/cloud/raw/upload/v123/folder/file.pdf
//   → public_id = "folder/file.pdf" (extension kept — Cloudinary raw ids include the extension)
const getPublicIdFromUrl = (cloudinaryUrl) => {
  const parts = cloudinaryUrl.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) return null;

  const afterUpload = parts.slice(uploadIndex + 1);

  // Skip the version segment if it starts with 'v' followed by digits
  const startIndex = /^v\d+$/.test(afterUpload[0]) ? 1 : 0;

  const pathWithExtension = afterUpload.slice(startIndex).join('/');

  // Raw resources keep the file extension in their public_id
  if (cloudinaryUrl.includes('/raw/upload/')) {
    return pathWithExtension;
  }

  // Image/video resources strip the extension
  return pathWithExtension.replace(/\.[^.]+$/, '');
};

// Deletes a file from Cloudinary by its stored URL
// Safe to call with null/undefined — it simply returns
const deleteFromCloudinary = async (cloudinaryUrl) => {
  if (!cloudinaryUrl) return;

  const publicId = getPublicIdFromUrl(cloudinaryUrl);
  if (!publicId) return;

  // Detect the resource_type from the URL path (Cloudinary destroy does not accept 'auto')
  let resourceType = 'image';
  if (cloudinaryUrl.includes('/raw/upload/')) {
    resourceType = 'raw';
  } else if (cloudinaryUrl.includes('/video/upload/')) {
    resourceType = 'video';
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    // Log but don't throw — a failed Cloudinary cleanup shouldn't break the main operation
    console.error('Failed to delete file from Cloudinary:', error.message);
  }
};

module.exports = {
  upload,
  uploadImageToCloudinary,
  uploadDocumentToCloudinary,
  deleteFromCloudinary,
};
