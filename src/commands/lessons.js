module.exports = (bot) => {
    bot.command('lessons',async (ctx) => {
      await ctx.reply(`К сожалению, команда для вычисления количества проведенных занятий у отдельной группы не была реализована.`);
    });
};;