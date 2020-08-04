// Require:
var postmark = require("postmark");

// Send an email:
var client = new postmark.ServerClient("1d0693c2-074b-4dda-abd0-4d3becedbdc7");

client.sendEmail({
  "From": "mailbox@lvdesign.com.fr",
  "To": "mailbox@lvdesign.com.fr",
  "Subject": "Test",
  "TextBody": "Hello from Postmark!"
});