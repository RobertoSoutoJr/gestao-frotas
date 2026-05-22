const notificationService = require('../services/notification.service');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.list = asyncHandler(async (req, res) => {
  const options = {
    unread: req.query.unread === 'true',
    limit: parseInt(req.query.limit, 10) || 50,
  };
  const data = await notificationService.list(req.userId, options);
  res.json({ success: true, data });
});

exports.countUnread = asyncHandler(async (req, res) => {
  const count = await notificationService.countUnread(req.userId);
  res.json({ success: true, data: { count } });
});

exports.markRead = asyncHandler(async (req, res) => {
  const data = await notificationService.markRead(req.params.id, req.userId);
  res.json({ success: true, data });
});

exports.markAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllRead(req.userId);
  res.json({ success: true, ...result });
});

exports.checkAndGenerate = asyncHandler(async (req, res) => {
  const generated = await notificationService.checkAndGenerate(req.userId);
  res.json({ success: true, data: generated, count: generated.length });
});
