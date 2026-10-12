const InvariantError = require('../../exceptions/InvariantError');

const DocumentsValidator = {
  validateDocumentFile: (file) => {
    if (!file) {
      throw new InvariantError('File is required');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new InvariantError('File is required and must be a PDF file');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new InvariantError('Ukuran file maksimal 5 MB');
    }
  },
};

module.exports = DocumentsValidator;
