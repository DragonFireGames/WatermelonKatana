// Email
const email = process.env.EMAIL_NAME_PASSWORD.split("\n");
const mailer = require('nodemailer');
const transporter = mailer.createTransport({
  host: "smtp-mail.outlook.com",
  port: 587,
  secure: false,
  auth: {
    user: email[0],
    pass: email[1],
  },
});

exports.sendMail = function(recipient, options) {
  options = options || {};
  options.from = email[0];
  options.to = recipient;
  return new Promise((res,rej)=>{
    transporter.sendMail(options, function(error, info){
      if (error) {
        console.log(error);
        rej(error);
      } else {
        console.log('Email sent: ' + info.response);
        res(info);
      }
    });
  });
}
