const nodemailer = require('nodemailer');
const pug = require('pug');
const juice=require('juice');
const htmlToText =require('html-to-text');
const promisify = require('es6-promisify');


//
const transport = nodemailer.createTransport({
    host:process.env.MAIL_HOST,
    port:process.env.MAIL_PORT,
    auth:{
        user:process.env.MAIL_USER,
        pass:process.env.MAIL_PASS
    }
});

const generateHTML = (filename, options = {})=> {
    const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
    const inlined = juice(html); // css inline
    return inlined;
}

exports.send = async (options) => {
    const html = generateHTML(options.filename, options);
    const text = htmlToText.fromString(html);

    const mailOptions = {
        from: `Toto Toto<noreply@tptp.com>`,
        to: options.user.email,
        subject: options.subject,
        html:html,
        text: text
    };
    const sendMail = promisify(transport.sendMail,transport);
    return sendMail(mailOptions)
}

/* transport.sendMail({
    from: 'toto2 <laurent.vignaux@wanadoo.fr>',
    to: 'Peter@toto.fr',
    subject:'Test',
    html: 'Hey <b>ho</b>',
    text: 'My teststtsttstts'
}); */