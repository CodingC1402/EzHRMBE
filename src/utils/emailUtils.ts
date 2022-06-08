import nodemailer from 'nodemailer';

export namespace EmailUtils {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
      user: 'ezhrm42069@gmail.com',
      pass: 'uwodjwmddeytsioy'
    }
  });

  const emailOption: nodemailer.SendMailOptions = {
    from: 'ezhrm42069@gmail.com',
  }

  export function SendVerifyEmail(receiver: string, token: string) {
    transporter.sendMail({
      ...emailOption,
      to: receiver,
      subject: 'Verify email for ezHrm',
      html: `<h1 style='color: #00b3ff, font-weight: bold'>Verify email</h1>`
        + `<be><p>An account has been created on our website using this email. To verify the account click <a href='http://localhost:3000?token=${token}'>here</a></p>`
    })
  }

  export function SendChangePasswordEmail(receiver: string, url: string) {
    transporter.sendMail({
      ...emailOption,
      to: receiver,
      subject: 'Verify email for ezHrm',
      html: `<h1 style='color: #00b3ff, font-weight: bold'>Change password</h1>`
        + `<br><p>Your account has requested to change password. To change the password click <a href='${url}'>here</a></p>`
    })
  }
}