const SITE_TITLE = 'CAR';
const User = require('../../models/user');
const UserEdit = require('../../models/userEdit');
const UserToken = require('../../models/userToken');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { customAlphabet } = require('nanoid');
const sixDigitCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

module.exports.verify = async (req, res) => {
    try {
        const verificationToken = req.query.token;
        const sendcode = req.query.sendcode === 'true';
        if (!verificationToken) {
            const userLogin = await User.findById(req.session.login)
            return res.status(404).render('404', {
                login: req.session.login,
                userLogin: userLogin,
            });
        }
        const userToken = await UserToken.findOne({ token: verificationToken });
        if (!userToken) {
            const userLogin = await User.findById(req.session.login)
            return res.status(404).render('404', {
                login: req.session.login,
                userLogin: userLogin,
            });
        }
        const expirationCodeDate = userToken.expirationCodeDate;
        const remainingTimeInSeconds = Math.floor((expirationCodeDate - new Date().getTime()) / 1000);
        if (!userToken || userToken.expirationDate < new Date()) {
            const userLogin = await User.findById(req.session.login)
            return res.status(404).render('404', {
                login: req.session.login,
                userLogin: userLogin,
            });
        }
        const userEdit = await UserEdit.findById({ _id: userToken.userId });
        res.render('VerifyEdit', {
            site_title: SITE_TITLE,
            title: 'Verify Edit',
            session: req.session,
            currentUrl: req.originalUrl,
            adjustedExpirationTimestamp: remainingTimeInSeconds,
            userToken: userToken,
            sendcode: sendcode,
            userEdit: userEdit,
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
            // Checking
            const userToken = await UserToken.findOne({ userId: decodedToken.userId, token: verificationToken });
            if (userToken && userToken.expirationDate > new Date()) {
                if (verificationCode === userToken.verificationCode) {
                    if (userToken.expirationCodeDate > new Date()) {
                        const userEdit = await UserEdit.findOne({ _id: userToken.userId })
                        console.log(userEdit)
                        const user = await User.findByIdAndUpdate(userEdit.userId, {
                            fullname: userEdit.fullname,
                            email: userEdit.email,
                            age: userEdit.age,
                            address: userEdit.fullname,
                            password: userEdit.password,
                            isVerified: true,
                        });
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
                        <div style="background-color: #e8f5e9; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
                            <h2 style="color: #000;">Hello ${userEdit.fullname},</h2>
                            <p style="color: #000;">Your email address has been successfully updated on our website.</p>
                            <div style="background-color: #f2f2f2; padding: 10px; text-align: justify;">
                                <h3 style="color: #000;"><a href="http://ProvincialAgricultureOffice.com">ProvincialAgricultureOffice.com</a></h3>
                                <p style="color: #000;">If you have any questions or concerns, feel free to reach out to our support team.</p>
                                <br/>
                                <p style="color: #000;">Thank you for choosing our platform!</p>
                            </div>
                        </div>`;
                        sendEmail(
                            'Dunamismusiccenter.onrender.com <cherry@gmail.com>',
                            userEdit.email,
                            'Verify your new email',
                            emailContent
                        );
                        res.redirect(`/profile`);
                    } else {
                        console.log('Code expired', userToken.expirationCodeDate)
                        req.flash('error', 'Code has been expired.');
                        res.redirect(`/verifyEdit?token=${verificationToken}`);
                    }
                } else {
                    console.log('Verification code does not match');
                    req.flash('error', 'The code does not match.');
                    res.redirect(`/verifyEdit?token=${verificationToken}`);
                }
            } else {
                console.log('Invalid or expired verification code.');
                const userLogin = await User.findById(req.session.login)
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
        try {
            const decodedToken = jwt.verify(verificationToken, JWT_SECRET);
            const userToken = await UserToken.findOne({ userId: decodedToken.userId, token: verificationToken });
            const userEdit = await UserEdit.findById({ _id: userToken.userId });
            if (userToken) {
                console.log(userEdit._id);
                const verificationCode = sixDigitCode();
                if (verificationToken === userToken.token) {
                    const updateCode = {
                        verificationCode: verificationCode,
                        expirationCodeDate: new Date(new Date().getTime() + 5 * 60 * 1000),
                    };
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: EMAIL_USER,
                            pass: EMAIL_PASS,
                        },
                    });
                    // Function to send an email
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
                            return res.status(500).render('500');
                        }
                    };
                    // link
                    const emailContent = `
                    <div style="background-color: #e8f5e9; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #000;">Hello ${userEdit.fullname},</h2>
                        <p style="color: #000;">Thank you for updating your email address on our website. To ensure the security of your account, please verify your new email address.</p>
                        <div style="background-color: #f2f2f2; padding: 10px; text-align: justify;">
                            <h3 style="color: #000;"><a href="http://ProvincialAgricultureOffice.com">ProvincialAgricultureOffice.com</a></h3>
                            <p style="color: #000;">Your verification code is: <strong>${verificationCode}</strong></p>
                            <br/>
                            <p style="color: #000;">Verifying your email address helps us ensure the security of your account and prevents unauthorized access.</p>
                            <br/>
                            <p style="color: #000;">It also ensures that you receive important notifications and updates regarding your account.</p>
                            <br/>
                            <p style="color: #000;">Please click on the link above and enter the verification code to complete the process.</p>
                            <br/>
                            <p style="color: #000;">If you did not request this change, please contact our support team immediately.</p>
                            <br/>
                        </div>
                    </div>
                    `;
                    sendEmail(
                        'ProvincialAgricultureOffice.com <jaideolasiman@gmail.com>',
                        userEdit.email,
                        'Verify your new email',
                        emailContent
                    );
                    console.log('Code Resend Successfully!');
                    const updatedCode = await UserToken.findByIdAndUpdate(userToken._id, updateCode, {
                        new: true
                    });
                    if (updatedCode) {
                        console.log('code has been updated', updatedCode);
                        console.log(userEdit);
                        res.redirect(`/verifyEdit?token=${verificationToken}&sendcode=true`);
                    } else {
                        console.log('Error updating code: Code not found or update unsuccessful');
                    }
                } else {
                    // Codes in req.body do not match
                    console.log('Verification codes do not match.');
                    const userLogin = await User.findById(req.session.login)
                    return res.status(404).render('404', {
                        login: req.session.login,
                        userLogin: userLogin,
                    });
                }
            }
        } catch (err) {
            console.log('no token', err);
        }
    } else if (action === 'cancel') {
        const decodedToken = jwt.verify(verificationToken, JWT_SECRET);
        const userToken = await UserToken.findOne({ userId: decodedToken.userId, token: verificationToken });
        try {
            await User.findByIdAndDelete(decodedToken.userId);
            await UserToken.findByIdAndDelete(userToken._id);
            res.redirect('/profile')
        } catch (error) {
            console.error('Deletion error:', error.message);
            return res.status(500).render('500');
        }
    } else {
        //this must be status 400 invalid action
        return res.status(500).render('500');
    }
};