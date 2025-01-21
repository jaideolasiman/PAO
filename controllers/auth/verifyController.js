const SITE_TITLE = 'PAO';
const User = require('../../models/user');
const UserToken = require('../../models/userToken');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { customAlphabet } = require('nanoid');
const sixDigitCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS= process.env.EMAIL_PASS;

module.exports.verify = async (req, res) => {
    try {
        const verificationToken = req.query.token;
        const sendcode = req.query.sendcode === 'true';
        if (!verificationToken) {
            const userLogin = await User.findById(req.session.login)
            return res.redirect('/register')
        }
        const userToken = await UserToken.findOne({ token: verificationToken });
        if (!userToken) {
            const userLogin = await User.findById(req.session.login)
            return res.redirect('/register')
        }
        const expirationCodeDate = userToken.expirationCodeDate;
        const remainingTimeInSeconds = Math.floor((expirationCodeDate - new Date().getTime()) / 1000);
        if (!userToken || userToken.expirationDate < new Date()) {
            const userLogin = await User.findById(req.session.login)
            return res.redirect('/register')
        }
        const user = await User.findById({ _id: userToken.userId });
        res.render('verify', {
            site_title: SITE_TITLE,
            title: 'Verify',
            session: req.session,
            currentUrl: req.originalUrl,
            adjustedExpirationTimestamp: remainingTimeInSeconds,
            userToken: userToken,
            sendcode: sendcode,
            user: user,
            messages: req.flash(),
        });
    } catch (error) {
        console.error('Error rendering verification input form:', error);
        return res.status(500).render('500');
    }
};

module.exports.doVerify = async (req, res) => {
    var action = req.body.action;
    const verificationToken = req.body.token;
    if (action === 'submit') {
        try {
            const verificationCode = req.body.verificationCode;
            const decodedToken = jwt.verify(verificationToken, JWT_SECRET);
            
            const userToken = await UserToken.findOne({ userId: decodedToken.userId, token: verificationToken });
            if (userToken && userToken.expirationDate > new Date()) {
                if (verificationCode === userToken.verificationCode) {
                    if (userToken.expirationCodeDate > new Date()) {
                        const user = await User.findByIdAndUpdate(decodedToken.userId, { isVerified: true });
                        
                        if (!user) {
                            console.log('User not found');
                            return res.status(404).render('404');
                        }

                        const role = user.role; // Assuming 'role' is a field in the User model
                        req.session.login = user._id;
                        await UserToken.findByIdAndDelete(userToken._id);
                        console.log('Email verification successful. Registration completed.');
                        
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: EMAIL_USER,
                                pass: EMAIL_PASS,
                            },
                        });

                        const sendEmail = async (from, to, subject, htmlContent) => {
                            try {
                                const mailOptions = {
                                    from,
                                    to,
                                    subject,
                                    html: htmlContent,
                                };
                                const info = await transporter.sendMail(mailOptions);
                                console.log('Email sent:', info.response);
                            } catch (error) {
                                console.error('Error sending email:', error);
                                throw new Error('Failed to send email');
                            }
                        };

                        const emailContent = `
                        <div style="background-color: #e8f5e9; padding: 20px; width: 100%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
                            <h3 style="color: #333; margin-bottom: 20px;"><a href="http://ProvincialAgricultureOffice.com" <style="color: #007bff; text-decoration: none;">ProvincialAgricultureOffice.com></a></h3>
                            <h4 style="color: #333;">Greetings, ${user.email}!</h4>
                            <p style="color: #333;">Hooray! Your email verification is successfully completed!</p>
                            <p style="color: #333;">Welcome to our community! Now that you're officially registered, it's time to embark on an exciting journey through our platform.</p>
                            <p style="color: #333;">We extend our heartfelt gratitude to you for confirming your email address.</p>
                            <p style="color: #333;">Ensuring account confirmation is a vital step in safeguarding our platform against spam and ensuring seamless communication with our valued users.</p>
                            <p style="color: #333;">Moreover, email verification enhances security, reducing the risk of users registering with outdated or incorrect email addresses.</p>
                            <p style="color: #333;">As you dive into our customer portal, rest assured that all accounts are rigorously validated to maintain a secure and user-centric environment.</p>
                        </div>
                        `;

                        sendEmail(
                            'ProvincialAgricultureOffice.com <jaideolasiman@gmail.com>',
                            user.email,
                            'Verify your email',
                            emailContent
                        );

                        // Redirect the user to the appropriate role-based dashboard
                        res.redirect(`/${role}/index`);
                    } else {
                        console.log('Code expired', userToken.expirationCodeDate);
                        req.flash('error', 'Code has been expired.');
                        res.redirect(`/verify?token=${verificationToken}`);
                    }
                } else {
                    console.log('Verification code does not match');
                    req.flash('error', 'The code does not match.');
                    res.redirect(`/verify?token=${verificationToken}`);
                }
            } else {
                console.log('Invalid or expired verification code.');
                const userLogin = await User.findById(req.session.login);
                return res.status(404).render('404', {
                    login: req.session.login,
                    userLogin: userLogin,
                });
            }
        } catch (error) {
            console.error('Verification failed:', error);
            return res.status(500).render('500');
        }
    } else if (action === 'resend') {
        // Handle 'resend' action here
    } else if (action === 'cancel') {
        // Handle 'cancel' action here
    } else {
        return res.status(500).render('500');
    }
};
