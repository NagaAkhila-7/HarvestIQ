const { Notification, Alert } = require('../models/AlertNotification');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      organisationId: req.organisationId,
      userId: req.user._id
    }).sort({ createdAt: -1 }).limit(50);

    res.json({ success: true, data: { notifications } });
  } catch (error) {
    next(error);
  }
};

const markRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true }
    );
    res.json({ success: true, data: { message: 'Marked read' } });
  } catch (error) {
    next(error);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { organisationId: req.organisationId, userId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, data: { message: 'All notifications marked read' } });
  } catch (error) {
    next(error);
  }
};

const getAlerts = async (req, res, next) => {
  try {
    const filter = { organisationId: req.organisationId };
    if (req.query.status) filter.status = req.query.status;

    const alerts = await Alert.find(filter)
      .populate('itemId', 'name sku unit')
      .populate('locationId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { alerts } });
  } catch (error) {
    next(error);
  }
};

const updateAlertStatus = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, organisationId: req.organisationId },
      { status: req.body.status, resolvedBy: req.user._id, resolvedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, data: { alert } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
  getAlerts,
  updateAlertStatus
};
