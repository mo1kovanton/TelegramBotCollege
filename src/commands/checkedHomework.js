const { createConversation , conversations } = require('@grammyjs/conversations');
const { xlsxFileHandler } = require('../utilities/xlsxFile');
const axios = require('axios');

module.exports = (bot) => {
    bot.use(conversations());
   
    async function checkedHomework(conversation,ctx) {
        await ctx.reply('Вы выбрали команду для подсчета % проверенных домашних заданий. Пришлите мне файл с расширением .xlsx для обработки данных.'); 
        const userResponse = await conversation.wait(); 

        if (userResponse.message.document){
            await ctx.reply('Ваш файл получен, начинаю проверку расширения.'); 
            const file = userResponse.message.document; 
            const fileType = file.mime_type;

            if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
                await ctx.reply('Данное расширение поддерживается , начинается обработка данных , ожидайте.');
                
                try{ 
                    const fileInformation = await bot.api.getFile(file.file_id);
                    const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${fileInformation.file_path}`;  
                    const request = await axios.get(fileUrl, { responseType: 'arraybuffer' });
                    const result = await xlsxFileHandler(request.data);

                    if (result.success) {
                        message(ctx,result.data);
                        return;  
                    } else {
                        console.log('Ошибка обработки данных.');
                        await ctx.reply('Ваш файл пустой.')
                        return; 
                    }
                }catch(err){
                   await ctx.reply('Во время обработки данных произошла ошибка.');
                   return; 
                }
            }else{
                await ctx.reply('Вам необоходимо повторить запрос , данное расширение файла не поддерживается.');
                return; 
            }
        }else{
            await ctx.reply('Я вас не понимаю , повторите свой запрос , выбрав команду из \"Меню\".');
            return; 
        }
    }
    
    async function message(ctx,data){
        let message = 'Статистика проверки домашних заданий:\n'; 
        
        const columns = {
            educatorName : 1,
            getMonth : 4,
            checkMonth : 5,
            getWeek : 9,
            checkWeek : 10
        }; 

        data.slice(1).forEach(row => {
            const educatorName = row[columns.educatorName]; 
            const getMonth = row[columns.getMonth]; 
            const checkMonth = row[columns.checkMonth]; 
            const getWeek = row[columns.getWeek]; 
            const checkWeek = row[columns.checkWeek]; 

            const percentageMonth = ((checkMonth /getMonth ) * 100).toFixed(2); 
            const percentageWeek = ((checkWeek /getWeek ) * 100).toFixed(2); 

            message+=`Преподаватель - ${educatorName}\n`; 
            message+=`Месяц - ${percentageMonth}%\n`; 
            message+=`Неделя - ${percentageWeek}%\n\n`; 
        }); 

        await ctx.reply(message); 
    }

    bot.use(createConversation(checkedHomework));

    bot.command('checked_homework' , async(ctx)=>{
        await ctx.conversation.enter('checkedHomework');
    })
};
