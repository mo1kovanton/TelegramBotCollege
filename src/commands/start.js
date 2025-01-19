module.exports = (bot) => {
    bot.command('start',async (ctx) => {
      const userName = ctx.from.first_name; 
      await ctx.reply(`Здравствуйте ${userName} , нажмите кнопку \"Меню\" , чтобы увидеть мои возможности.`);
    });
};;