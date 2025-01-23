const { createConversation , conversations } = require('@grammyjs/conversations');
const { xlsxFileHandler } = require('../utilities/xlsxFile');
const axios = require('axios');

module.exports = (bot) => {
    bot.use(conversations());
   
    async function assignedHomework(conversation,ctx) {
        await ctx.reply('Вы выбрали команду для подсчета % выданного домашнего задания. Пришлите мне файл с расширением .xlsx для обработки данных.'); 
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
        let message = 'Статистика выдачи домашних заданий:\n'; 
        
        const columns = {
            educatorName : 1,
            issuedTaskMonth : 3,
            planMonth : 6,
            issuedTaskWeek : 8,
            planWeek : 11,
            issuedTaskDay : 13,
            planDay : 16,
        }; 

        data.slice(1).forEach(row => {
            const educatorName = row[columns.educatorName]; 
            const issuedTaskMonth = row[columns.issuedTaskMonth]; 
            const planMonth = row[columns.planMonth]; 
            const issuedTaskWeek = row[columns.issuedTaskWeek]; 
            const planWeek = row[columns.planWeek]; 
            const issuedTaskDay = row[columns.issuedTaskDay]; 
            const planDay = row[columns.planDay]; 

            const percentageMonth = ((issuedTaskMonth /planMonth ) * 100).toFixed(2); 
            const percentageWeek = ((issuedTaskWeek /planWeek ) * 100).toFixed(2); 
            const percentageDay = ((issuedTaskDay /planDay ) * 100).toFixed(2); 

            message+=`Преподаватель - ${educatorName}\n`;

            if(percentageMonth < 70){
                message+=`Месяц - ${percentageMonth}%\n`;
            }

            if(percentageWeek < 70){
                message+=`Неделя - ${percentageWeek}%\n`; 
            }
           
            if(percentageDay < 70){
                message+=`День - ${percentageDay}%\n`;
            }
           
            message+=`\n`;
        }); 

        await ctx.reply(message); 
    }
    
    bot.use(createConversation(assignedHomework));

    bot.command('assigned_homework' , async(ctx)=>{
        await ctx.conversation.enter('assignedHomework');
    })
};
