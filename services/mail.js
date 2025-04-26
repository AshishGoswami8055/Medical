const nodemailer = require("nodemailer");

const mail = async (receiverEmail, subject, html)=>{
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for port 465, false for other ports
            auth: {
              user: process.env.USER_EMAIL,
              pass: process.env.USER_PASS,
            },
        });
        const info = await transporter.sendMail({
            from: process.env.USER_EMAIL,
            to: receiverEmail,
            subject: subject, 
            html: html, 
        });    

        console.log("Email send successfully :- ", info.messageId);
        return {success: true, messageId: info.messageId}
    } catch (error) {
        console.error("Error sending email :- ", error.message);
        return {success: false, error: error.message}
    }
}

module.exports = mail;
