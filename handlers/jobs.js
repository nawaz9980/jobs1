module.exports = (bot) => {
    bot.on('message', async (msg) => {
        if (msg.text === '📢 Share Bot') {
            const chatId = msg.chat.id;
            const botUser = await bot.getMe();
            const botLink = `https://t.me/${botUser.username}`;
            const shareLink = `https://t.me/share/url?url=${encodeURIComponent(botLink)}&text=${encodeURIComponent('🚀 Get instant UAE Job Alerts! Join the best job bot now.')}`;

            const message = `📢 <b>Share UAE Job Alerts</b>\n\nHelp your friends find their dream job in the UAE! Click the button below to share this bot with your contacts or groups.`;

            const opts = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '📤 Share with Friends', url: shareLink }]
                    ]
                }
            };

            bot.sendMessage(chatId, message, opts);
        } else if (msg.text === '❓ FAQ / Help') {
            const faqMessage = `<b>❓ Frequently Asked Questions</b>\n\n` +
                `<b>1️⃣ How do I subscribe?</b>\n` +
                `Click on "⭐ Premium Features" in the menu to select a plan (1, 3, 6, or 12 months) and pay securely via PayPal.\n\n` +
                `<b>2️⃣ Are these jobs verified?</b>\n` +
                `Yes! We verify job postings to ensure they are 100% genuine and safe for our users.\n\n` +
                `<b>3️⃣ How to cancel?</b>\n` +
                `Our Premium plans are <b>one-time payments</b> and do not auto-renew. Your Premium access simply expires at the end of your plan—no need to worry about cancellation!`;

            bot.sendMessage(msg.chat.id, faqMessage, { parse_mode: 'HTML' });
        }
    });
};
