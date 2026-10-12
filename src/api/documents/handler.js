const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

// Ensure upload directory exists
const uploadDir = path.resolve(__dirname, '../../../uploads/documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    const uniqueName = `${Date.now()}-${nanoid(10)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new InvariantError('File is required and must be a PDF file'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter,
});

class DocumentsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  getUploadMiddleware() {
    return (req, res, next) => {
      upload.single('document')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new InvariantError('Ukuran file maksimal 5 MB'));
          }
          return next(new InvariantError(`Upload error: ${err.message}`));
        } else if (err) {
          return next(err);
        }
        next();
      });
    };
  }

  async postDocumentHandler(req, res, next) {
    try {
      if (!req.file) {
        throw new InvariantError('File is required');
      }

      this._validator.validateDocumentFile(req.file);

      const userId = req.user.id;
      const { filename, originalname, size } = req.file;

      const document = await this._service.addDocument({
        userId,
        filename,
        originalName: originalname,
        size,
      });

      return res.status(201).json({
        status: 'success',
        message: 'Dokumen berhasil diunggah',
        data: document,
      });
    } catch (error) {
      // Clean up uploaded file if validation failed
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {}
      }
      next(error);
    }
  }

  async getDocumentsHandler(req, res, next) {
    try {
      const documents = await this._service.getDocuments();

      return res.status(200).json({
        status: 'success',
        data: {
          documents,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getDocumentByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      const document = await this._service.getDocumentById(id);

      const filePath = path.resolve(uploadDir, document.filename);
      if (!fs.existsSync(filePath)) {
        throw new NotFoundError('Berkas fisik dokumen tidak ditemukan');
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${document.originalName || document.original_name || 'document.pdf'}"`
      );

      return res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }

  async deleteDocumentByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      await this._service.deleteDocumentById(id);

      return res.status(200).json({
        status: 'success',
        message: 'Dokumen berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DocumentsHandler;
