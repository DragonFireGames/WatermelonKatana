const Users = require('../../Database/model/Users')
const mailer = require('../mail')
const origin = 'https://watermelonkatana.com'

function makeid(length) {
    let result = ''
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        )
    }
    return result
}

var pendingVerifications = {}

exports.sendVerification = async (req, res) => {
    const { email } = req.body
    try {
        if (!email.match(/^([^@]+)@([^\s]+?).([^.\s]+)$/))
            return res.status(404).json({
                message: 'Verification email not successfully created',
                error: 'Email not valid',
            })
        const uid = res.locals.userToken.id
        const user = await Users.findOne({ _id: uid })
        if (!user)
            return res.status(404).json({
                message: 'Verification email not successfully created',
                error: 'User not found',
            })
        var verifyId = makeid(64)
        const maxAge = 60 * 60 * 1000 // 1 hour
        pendingVerifications[verifyId] = {
            uid: uid,
            email: email,
            expiresAt: Date.now() + maxAge,
        }
        var verifyUrl = origin + '/api/auth/verify/email?id=' + verifyId
        mailer.sendMail(email, {
            subject: 'WatermelonKatana Email Verification',
            text: `
        Hello ${user.username}

        Open the link below to verify your email.
        ${verifyUrl}
        
        Not you? Don't open the above link.
      `,
            html: `
        Hello ${user.username}<br>
        <br>
        <a href="${verifyUrl}">Click here to verify your email.</a><br>
        <br>
        Not you? Don't click the above link.
      `,
        })
        res.status(200).json({
            message: 'Verification email creation successful',
        })
    } catch (error) {
        res.status(400).json({
            message: 'Verification email not successfully created',
            error: error.message,
        })
        console.log(error.message)
    }
}
exports.verifyUser = async (req, res) => {
    const { id } = req.query
    try {
        var verify = pendingVerifications[id]
        if (!verify)
            return res.status(404).json({
                message: 'Verification not successful',
                error: 'Verify not found',
            })
        if (Date.now() > verify.expiresAt)
            return res.status(400).json({
                message: 'Verification not successful',
                error: 'Link expired',
            })
        const user = await Users.findOne({ _id: verify.uid })
        if (!user)
            return res.status(404).json({
                message: 'Verification not successful',
                error: 'User not found',
            })
        user.email = verify.email
        await user.save()
        delete pendingVerifications[id]
        res.status(301).redirect('/verified?email=' + user.email)
    } catch (error) {
        res.status(400).json({
            message: 'Verification not successful',
            error: error.message,
        })
    }
}
