const sendEmailConfig = require('../config/sendMail');

const sendEmail = async (recipient, name, downloadUrl) => {
    try {
        await sendEmailConfig.sendMail({
            from: '"Thanh Tùng Lê" thanhtunga52021@gmail.com',
            to: recipient,
            subject: 'Cảm ơn bạn đã mua ebook của tôi!',
            html: `<div>
          <p>Kính gửi ${name},</p>
          <p>Cảm ơn bạn đã mua ebook BÍ MẬT CỦA MAY MẮN của tôi! Tôi rất vui khi bạn đã chọn đọc tác phẩm của mình.</p>
          <p>Để tải ebook, vui lòng truy cập đường dẫn sau:</p>
          <a href="${downloadUrl}">${downloadUrl}</a>
        </div>`,
        });
    } catch (error) {
        console.error("Can't send email:", error);
    }
};

module.exports = sendEmail;
