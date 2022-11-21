const nodemailer = require("nodemailer");
const Config = require("../config");


class EmailServices {

    constructor() {

    }

    #createTransport(auth = {}) {

        let transpoter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: auth.user || Config.EMAIL,
                pass: auth.pass || Config.EMAIL_PASS
            }
        });

        return transpoter;
        
    }

    async sendEmail(to, from, subject, text='', html='' ) {

        let transpoter = this.#createTransport();
        let info = await transpoter.sendMail({
            from: from,
            to: to,
            subject: subject,
            text: text,
            html: html
        });

        console.log("Message sent: %s", info.messageId);

    }
}

module.exports = new EmailServices();