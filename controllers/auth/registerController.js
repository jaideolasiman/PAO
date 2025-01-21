const User = require("../../models/user");
const UserToken = require("../../models/userToken");
const multer = require("multer");
var fileUpload = require("../../middlewares/profile-upload-middleware.js");
const profileController = require("./profileController");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { customAlphabet } = require("nanoid");
// Constants
const sixDigitCode = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);
const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const SITE_TITLE = "PAO";

// const upload = multer({
//     dest: 'uploads/' // Directory to store uploaded files
//   });

/**
 * Render Registration Page
 */
module.exports.register = async (req, res) => {
  try {
    if (req.session.login) {
      return res.redirect(`/${user.role}/index`);
    }
    res.render("register", {
      site_title: SITE_TITLE,
      title: "Register",
      session: req.session,
      messages: req.flash(),
      currentUrl: req.originalUrl,
      userLogin: null, // No need to fetch the user if not logged in
      req: req,
      error: null,
    });
  } catch (error) {
    console.error("Error rendering register page:", error);
    return res.status(500).render("500");
  }
};

/**
 * Handle User Registration
 */
module.exports.doRegister = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    var upload = multer({
      storage: fileUpload.files.storage(),
      allowedFile: fileUpload.files.allowedFile,
    }).single("image");

    upload(req, res, async function (err) {
      
      if (err instanceof multer.MulterError) {
        console.log("err400", err);
        return res.status(err.status || 400).render("400", { err: err });
      } else if (err) {
        console.log("err500", err);
        return res.status(err.status || 500).render("500", { err: err });
      } else {
        console.log('File uploaded successfully:', req.file);
        let imageUrl = "";
        // if (user.imageURL) {
        //     // If user.imageURL exists, use it
        //     imageUrl = user.imageURL;
        // }
        if (req.file) {
          // If a file was uploaded, construct the new image URL
          imageUrl = `/public/img/profile/${req.file.filename}`;
        }
        const {
            profilePicture,
            role,
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            phoneNumber,
            gender,
          } = req.body;
        if (existingUser) {
          if (existingUser.isVerified) {
            req.flash("message", "Email Already Used!");
            return res.redirect("/register");
          } else {
            if (password !== confirmPassword) {
              req.flash("message", "Password does not match.");
              return res.redirect("/register");
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({
              profilePicture,
              role,
              firstName,
              lastName,
              email,
              password: hashedPassword,
              phoneNumber,
              profilePicture: imageUrl,
              gender,
            });
            await user.save();
            const registrationToken = jwt.sign(
              { userId: user._id },
              JWT_SECRET,
              { expiresIn: "1d" }
            );
            const verificationCode = sixDigitCode();
            const userToken = new UserToken({
              userId: user._id,
              token: registrationToken,
              verificationCode: verificationCode,
              expirationDate: new Date(
                new Date().getTime() + 24 * 5 * 60 * 1000
              ),
              expirationCodeDate: new Date(
                new Date().getTime() + 5 * 60 * 1000
              ), // 5 mins expiration
            });

            if (req.file) {
              // Check if a profile picture was uploaded
              await profileController.post("/updateProfile")(req, res);
            }
            res.redirect("/login");
            await userToken.save();

            const transporter = nodemailer.createTransport({
              service: "gmail",
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
                console.log("Email sent:", info.response);
              } catch (error) {
                console.error("Error sending email:", error);
                return res.status(500).render("500");
              }
            };

            // Send verification email
            const emailContent = `
                        <div style="background-color: #e8f5e9; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
                            <h2 style="color: #007bff; margin-bottom: 20px;">Hello ${user.email},</h2>
                            <p style="color: #333;">Welcome aboard! We're delighted to have you as part of our community. To unlock all the features our platform offers, we kindly request you to verify your email address.</p>
                            <h3 style="color: #007bff; margin-top: 20px; margin-bottom: 10px;"><a href="http://ProvincialAgricultureOffice.com"> style="color: #007bff; text-decoration: none;">ProvincialAgricultureOffice.com</a></h3>
                            <p style="color: #333;">Your unique verification code is: <strong style="color: #007bff;">${verificationCode}</strong></p>
                            <br>
                            <p style="color: #333;">By verifying your email, you're assisting us in maintaining a secure environment for all our users. It's a crucial step in our dedication to ensuring a seamless experience for you.</p>
                            <br>
                            <p style="color: #333;">This verification process guarantees that your account remains accessible only to you, safeguarding your data and enhancing your privacy.</p>
                            <br>
                            <p style="color: #333;">Should you encounter any challenges or have questions, our support team is here to guide you every step of the way.</p>
                            <br>
                        </div>
                        `;
            sendEmail(
              "ProvincialAgricultureOffice.com <jaideolasiman@gmail.com>",
              user.email,
              "Verify your email",
              emailContent
            );
            req.flash(
              "success",
              "Verification email sent. Please check your email."
            );
            return res.redirect(
              `/verify?token=${registrationToken}&sendcode=true`
            );
          }
        } else {
          if (password !== confirmPassword) {
            req.flash("message", "Password does not match.");
            return res.redirect("/register");
          }
          const user = new User({
            profilePicture,
            role,
            firstName,
            lastName,
            email,
            password: await bcrypt.hash(password, 10),
            phoneNumber,
            profilePicture: imageUrl,
            gender,
          });
          await user.save();
          const registrationToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: "1d",
          });
          const verificationCode = sixDigitCode();
          const userToken = new UserToken({
            userId: user._id,
            token: registrationToken,
            verificationCode: verificationCode,
            expirationDate: new Date(new Date().getTime() + 24 * 5 * 60 * 1000),
            expirationCodeDate: new Date(new Date().getTime() + 5 * 60 * 1000), // 5 mins expiration
          });
          await userToken.save();
          const transporter = nodemailer.createTransport({
            service: "gmail",
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
              console.log("Email sent:", info.response);
            } catch (error) {
              console.error("Error sending email:", error);
              return res.status(500).render("500");
            }
          };
          // link
          const emailContent = `
                        <div style="background-color: #e8f5e9; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
                            <h2 style="color: #007bff; margin-bottom: 20px;">Hello ${user.email},</h2>
                            <p style="color: #333;">Welcome aboard! We're delighted to have you as part of our community. To unlock all the features our platform offers, we kindly request you to verify your email address.</p>
                            <h3 style="color: #007bff; margin-top: 20px; margin-bottom: 10px;"><a href="http://ProvincialAgricultureOffice.com"> style="color: #007bff; text-decoration: none;">ProvincialAgricultureOffice.com</a></h3>
                            <p style="color: #333;">Your unique verification code is: <strong style="color: #007bff;">${verificationCode}</strong></p>
                            <br>
                            <p style="color: #333;">By verifying your email, you're assisting us in maintaining a secure environment for all our users. It's a crucial step in our dedication to ensuring a seamless experience for you.</p>
                            <br>
                            <p style="color: #333;">This verification process guarantees that your account remains accessible only to you, safeguarding your data and enhancing your privacy.</p>
                            <br>
                            <p style="color: #333;">Should you encounter any challenges or have questions, our support team is here to guide you every step of the way.</p>
                            <br>
                        </div>
                        `;
          sendEmail(
            "ProvincialAgricultureOffice.com <jaideolasiman@gmail.com>",
            user.email,
            "Verify your email",
            emailContent
          );

          req.flash(
            "success",
            "Verification email sent. Please check your email."
          );
          return res.redirect(
            `/verify?token=${registrationToken}&sendcode=true`
          );
        }
      }
    });
  } catch (error) {
    console.error("Registration failed:", error);
    return res.status(500).render("500");
  }
};
