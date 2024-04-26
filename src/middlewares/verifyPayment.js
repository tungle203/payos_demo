const db = require('../config/db');
const Order = require('../services/orders');
const verifyPayment = (successUrl, failUrl) => {
    return async (req, res, next) => {
        const orderCode = req.cookies.orderCode;
        let order = null;
        if (orderCode) {
            order = await Order.getByOrderCode(orderCode);
        }
        if (failUrl) {
            if (order && order.isPaid) return next();
            return res.redirect(failUrl);
        }

        if (successUrl) {
            if (order && order.isPaid) return res.redirect(successUrl);
            return next();
        }
    };
};

module.exports = verifyPayment;
