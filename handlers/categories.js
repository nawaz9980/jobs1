const { getCategories, getUserCategories, toggleUserCategory, checkPremium } = require('../db');

module.exports = (bot) => {
    const sendCategorySelection = async (chatId, messageId = null) => {
        const categories = await getCategories();
        const userCats = await getUserCategories(chatId);
        const isPremium = await checkPremium(chatId);

        let text = `📂 <b>Select Job Categories</b>\n\n`;
        if (isPremium) {
            text += `🌟 <b>Premium Account:</b> You can select job categories to receive relevant alerts for.\n`;
            text += `\nYour selections are marked with ✅. Click a category to toggle it.`;
        } else {
            text += `🆓 <b>Free Account:</b> Category selection is a <b>Premium Feature</b>. Upgrade to Premium to receive targeted job alerts!`;
        }

        const inlineKeyboard = [];
        if (isPremium) {
            for (let i = 0; i < categories.length; i += 2) {
                const row = [];
                const cat1 = categories[i];
                const isSelected1 = userCats.includes(cat1.id);
                row.push({
                    text: `${isSelected1 ? '✅ ' : ''}${cat1.name}`,
                    callback_data: `toggle_cat_${cat1.id}`
                });

                if (categories[i + 1]) {
                    const cat2 = categories[i + 1];
                    const isSelected2 = userCats.includes(cat2.id);
                    row.push({
                        text: `${isSelected2 ? '✅ ' : ''}${cat2.name}`,
                        callback_data: `toggle_cat_${cat2.id}`
                    });
                }
                inlineKeyboard.push(row);
            }
        } else {
            // Free users see categories with lock icons
            for (let i = 0; i < categories.length; i += 2) {
                const row = [];
                row.push({ text: `🔒 ${categories[i].name}`, callback_data: 'lock_category' });
                if (categories[i + 1]) {
                    row.push({ text: `🔒 ${categories[i + 1].name}`, callback_data: 'lock_category' });
                }
                inlineKeyboard.push(row);
            }
            inlineKeyboard.push([{ text: '⭐ Upgrade to Premium', callback_data: 'view_premium' }]);
        }

        const opts = {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: inlineKeyboard }
        };

        if (messageId) {
            bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...opts }).catch(() => { });
        } else {
            bot.sendMessage(chatId, text, opts);
        }
    };

    bot.on('message', async (msg) => {
        if (msg.text === '📂 View Categories') {
            await sendCategorySelection(msg.chat.id);
        }
    });

    bot.on('callback_query', async (query) => {
        const chatId = query.message.chat.id;
        if (query.data.startsWith('toggle_cat_')) {
            const isPremium = await checkPremium(chatId);

            if (!isPremium) {
                return bot.answerCallbackQuery(query.id, {
                    text: '⚠️ You need a Premium account to select categories!',
                    show_alert: true
                });
            }

            const categoryId = parseInt(query.data.split('_')[2]);
            await toggleUserCategory(chatId, categoryId, isPremium);
            bot.answerCallbackQuery(query.id, { text: 'Categories updated!' });
            await sendCategorySelection(chatId, query.message.message_id);
        } else if (query.data === 'lock_category' || query.data === 'view_premium') {
            if (query.data === 'view_premium') {
                bot.answerCallbackQuery(query.id);
                // Trigger the '⭐ Premium Features' command logic
                bot.emit('message', {
                    chat: { id: chatId },
                    from: query.from,
                    text: '⭐ Premium Features'
                });
            } else {
                bot.answerCallbackQuery(query.id, {
                    text: '🏆 Upgrade to Premium to enable this category!',
                    show_alert: true
                });
            }
        }
    });
};
