const express = require('express');
const handlebars = require('express-handlebars');
const PayOS = require('@payos/node');
const uuidv4 = require('uuid').v4;
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const verifyPayment = require('./middlewares/verifyPayment');
const Order = require('./services/orders');
const sendEmail = require('./services/sendMail');
const app = express();
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'resources/public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine(
    '.hbs',
    handlebars.engine({
        extname: '.hbs',
    }),
);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'resources/views'));
const domain = process.env.DOMAIN || 'http://localhost:3000';
app.use(
    cors({
        origin: domain,
        credentials: true,
    }),
);

const clientId = process.env.CLIENT_ID;
const apiKey = process.env.API_KEY;
const checksumKey = process.env.CHECKSUM_KEY;
const payos = new PayOS(clientId, apiKey, checksumKey);

app.get('/', async (req, res) => {
    let isPaid = false;
    const orderCode = req.cookies.orderCode;
    if (orderCode) {
        const order = await Order.getByOrderCode(orderCode);
        if (order) isPaid = order.isPaid;
    }
    res.render('home', {
        isPaid: isPaid,
    });
});

app.post('/pay', verifyPayment('/success', null), async (req, res) => {
    const { name, phone, email } = req.body;
    if (!name || !phone || !email) return res.sendStatus(400);

    const uuidString = uuidv4();
    const oderCode = parseInt(
        uuidString.replace(/[^0-9]/g, '').substring(0, 14),
    );
    const order = {
        amount: 10000,
        description: 'Ebook Payment',
        orderCode: oderCode,
        returnUrl: `${domain}/success`,
        cancelUrl: `${domain}`,
        expiredAt: Math.floor((Date.now() + 300000) / 1000),
    };
    res.cookie('orderCode', oderCode);
    Order.createOrder({ oderCode, name, phone, email, signature: uuidString });
    const paymentLink = await payos.createPaymentLink(order);
    res.redirect(303, paymentLink.checkoutUrl);
});

app.get('/success', verifyPayment(null, '/'), (req, res) => {
    res.render('success');
});

app.post('/webhook', async (req, res) => {
    const webhookData = req.body;
    if (!webhookData.data) {
        return res.status(400).json();
    }
    if (webhookData.desc !== 'success') {
        console.log(`Order ${webhookData.data.orderCode} is not paid`);
        return res.json();
    }
    try {
        const paymentData = payos.verifyPaymentWebhookData(webhookData);
        Order.successPayment(paymentData.orderCode);
        const order = await Order.getByOrderCode(paymentData.orderCode);
        if (order) {
            await sendEmail(
                order.email,
                order.fullName,
                `${domain}/download/${order.signature}`,
            );
            console.log(`Order ${paymentData.orderCode} is paid`);
        }
        return res.json();
    } catch (error) {
        console.log(error);
        res.status(400).json();
    }
});

app.get('/download/:signature', async (req, res) => {
    const signature = req.params.signature;
    const order = await Order.getBySignature(signature);
    if (!order) {
        return res.sendStatus(404);
    }
    res.download(path.join(__dirname, 'resources/private', 'Ebook.pdf'));
});

app.get('/download', verifyPayment(null, '/'), (req, res) => {
    res.download(path.join(__dirname, 'resources/private', 'Ebook.pdf'));
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
