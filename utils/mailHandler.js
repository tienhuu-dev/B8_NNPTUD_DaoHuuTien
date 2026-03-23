const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "459c719b2aa095",
        pass: "30cdfc49ab9a52",
    },
});

module.exports = {
    sendMail: async function (to, url) {
        const info = await transporter.sendMail({
            from: 'admin@heha.com',
            to: to,
            subject: "Reset Password email",
            text: "click vao day de reset password", // Plain-text version of the message
            html: "click vao <a href=" + url + ">day</a> de reset password", // HTML version of the message
        });
    },
    sendCredentialMail: async function (to, username, password) {
        try {
            const info = await transporter.sendMail({
                from: 'admin@heha.com',
                to: to,
                subject: "Account Credentials",
                text: `Username: ${username}\nPassword: ${password}`,
                html: `<h3>Welcome to our platform!</h3>
                       <p>Your account has been created successfully.</p>
                       <p><b>Username:</b> ${username}</p>
                       <p><b>Password:</b> ${password}</p>
                       <p>Please login and change your password immediately.</p>`
            });
            console.log(`Email sent to: ${to}`);
        } catch (error) {
            console.error(`Error sending email to ${to}:`, error.message);
        }
    }
}