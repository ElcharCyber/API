class BookmarksHandler {
  constructor(service, cacheService) {
    this._service = service;
    this._cacheService = cacheService;
  }

  async postBookmarkHandler(req, res, next) {
    try {
      const { jobId } = req.params;
      const userId = req.user.id;

      const bookmarkId = await this._service.addBookmark({ userId, jobId });

      if (this._cacheService) {
        await this._cacheService.delete(`bookmarks:${userId}`);
      }

      return res.status(201).json({
        status: 'success',
        data: {
          id: bookmarkId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookmarksHandler(req, res, next) {
    try {
      const userId = req.user.id;

      if (this._cacheService) {
        const cached = await this._cacheService.get(`bookmarks:${userId}`);
        if (cached) {
          res.set('X-Data-Source', 'cache');
          return res.status(200).json({
            status: 'success',
            data: {
              bookmarks: cached,
            },
          });
        }
      }

      const bookmarks = await this._service.getBookmarksByUserId(userId);

      if (this._cacheService) {
        await this._cacheService.set(`bookmarks:${userId}`, bookmarks, 3600);
      }
      res.set('X-Data-Source', 'database');

      return res.status(200).json({
        status: 'success',
        data: {
          bookmarks,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookmarkByIdHandler(req, res, next) {
    try {
      const { jobId, id } = req.params;
      const bookmark = await this._service.getBookmarkById(jobId, id);

      return res.status(200).json({
        status: 'success',
        data: bookmark,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBookmarkHandler(req, res, next) {
    try {
      const { jobId } = req.params;
      const userId = req.user.id;

      await this._service.deleteBookmarkByUserAndJob(userId, jobId);

      if (this._cacheService) {
        await this._cacheService.delete(`bookmarks:${userId}`);
      }

      return res.status(200).json({
        status: 'success',
        message: 'Bookmark berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BookmarksHandler;
