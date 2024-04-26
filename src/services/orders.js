const db = require('../config/db');

class Order {
    async getByOrderCode(orderCode) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM ORDERS WHERE orderCode = ?;`,
                orderCode.toString(),
                (error, row) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(row);
                },
            );
        });
    }

    async getBySignature(signature) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM ORDERS WHERE signature = ?;`,
                signature,
                (error, row) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(row);
                },
            );
        });
    }

    createOrder(order) {
        db.run(
            `INSERT INTO ORDERS (orderCode, fullName, phone, email, signature) VALUES (?,?,?,?,?);`,
            [
                order.oderCode.toString(),
                order.name,
                order.phone,
                order.email,
                order.signature,
            ],
        );
    }

    successPayment(orderCode) {
        db.run(
            `UPDATE ORDERS SET isPaid = TRUE WHERE orderCode = ?;`,
            orderCode.toString(),
        );
    }
}

module.exports = new Order();
